// https://www.xasiat.ws
var BASEURL = "https://www.xasiat.ws";

function getManifest() {
    return JSON.stringify({
        "id": "xasiat",
        "name": "XXX Châu Á",
        "description": "Kho video XXX Châu Á tổng hợp đa dạng.",
        "info": "Kho video XXX Châu Á tổng hợp đa dạng.",
        "version": "1.0.5",
        "baseUrl": BASEURL,
        "iconUrl": "https://raw.githubusercontent.com/hieu-TQS/movie-SuperOK/refs/heads/main/icons/xasiat.png",
        "isEnabled": true,
        "isAdult": true,
        "type": "MOVIE",
        "playerType": "exoplayer"
    });
}

function log(msg) {
    if (typeof nativeLog !== 'undefined') {
        nativeLog("[xasiat] " + msg);
    } else if (typeof console !== 'undefined' && console.log) {
        console.log("[xasiat] " + msg);
    }
}

function getHomeSections() {
    return JSON.stringify([
        { "slug": "/latest-updates/", "title": "Hàng Mới", "type": "Grid" },
        { "slug": "/categories/jav-4k/", "title": "Hàng 4K", "type": "Horizontal" },
        { "slug": "/categories/jav-uncensored/", "title": "JAV Không Che", "type": "Horizontal" },
        { "slug": "/categories/china-taiwan/", "title": "Trung & Đài", "type": "Horizontal" },
        { "slug": "/categories/korea/", "title": "Hàn Quốc", "type": "Horizontal" }
    ]);
}

function getPrimaryCategories() {
    var listurl = getLISTmenu();
    var menulist = buildMenu(listurl);
    return JSON.stringify(menulist);
}

function getFilterConfig() {
    var listurl = getLISTmenu();
    var menulist = buildMenu(listurl);
    return JSON.stringify({
        category: menulist
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var page = 1;
        var path = slug || "";
        
        if (filtersJson) {
            var fixedJson = typeof filtersJson === 'string' 
                ? filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':')
                : JSON.stringify(filtersJson);
            try {
                var filters = JSON.parse(fixedJson);
                page = parseInt(filters.page) || 1;
                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) {
                        path = filters.category[0].slug || filters.category[0].id || "";
                    } else if (typeof filters.category === 'string') {
                        path = filters.category;
                    }
                }
            } catch (jsonErr) {}
        }
        
        if (!path) {
            path = "/latest-updates/";
        }
        
        var fullUrl = path;
        if (fullUrl.indexOf("http") !== 0) {
            fullUrl = BASEURL + (fullUrl.charAt(0) === '/' ? fullUrl : '/' + fullUrl);
        }
        
        if (fullUrl.indexOf("?") !== -1) {
            var qIdx = fullUrl.indexOf("?");
            fullUrl = fullUrl.substring(0, qIdx);
        }
        
        if (fullUrl.slice(-1) === '/') {
            fullUrl = fullUrl.slice(0, -1);
        }
        
        if (fullUrl.indexOf("/search/") !== -1) {
            if (page > 1) {
                return fullUrl + "/?from_videos=" + page;
            }
            return fullUrl + "/";
        }
        
        if (page > 1) {
            return fullUrl + "/" + page + "/";
        }
        return fullUrl + "/";
    } catch (e) {
        log(e);
        return BASEURL + "/latest-updates/";
    }
}

function getUrlSearch(keyword, filtersJson) {
    var page = 1;
    if (filtersJson) {
        try {
            var fixedJson = typeof filtersJson === 'string'
                ? filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':')
                : JSON.stringify(filtersJson);
            var filters = JSON.parse(fixedJson);
            page = parseInt(filters.page) || 1;
        } catch (e) {}
    }
    var cleanKeyword = encodeURIComponent(keyword || "").replace(/%20/g, "+");
    if (page > 1) {
        return BASEURL + "/search/" + cleanKeyword + "/?from_videos=" + page;
    }
    return BASEURL + "/search/" + cleanKeyword + "/";
}

function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.indexOf('http') === 0) return slug;
    return BASEURL + "/" + slug;
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS
// =============================================================================
function parseListResponse(html, $url) {
	try {
		var items = [];
        
        // Sử dụng Regex an toàn quét trực tiếp từng khối item, tránh hoàn toàn lỗi treo lặp
        var itemRegex = /<div[^>]*class="[^"]*item[^"]*"[^>]*>([\s\S]*?)<\/div>(?=\s*<div|\s*<\/div|\s*<[a-zA-Z]|$)/gi;
        var match;
        
        // Fallback nếu không khớp chuẩn div
        if (html.indexOf('class="item"') === -1) {
            itemRegex = /class="item[^"]*"[^>]*>([\s\S]*?)(?=class="item[^"]*"|<\/div>\s*<\/div>\s*<\/div>)/gi;
        }

        // Tách các khối item bằng phương pháp thủ công an toàn
        var parts = html.split('class="item');
        for (var i = 1; i < parts.length; i++) {
            var itemHtml = parts[i];
            
            var aMatch = itemHtml.match(/href="([^"]+)"/i);
            var href = aMatch ? aMatch[1] : "";
            if (href && href.indexOf("http") == -1) {
                href = BASEURL + (href.charAt(0) === '/' ? href : '/' + href);
            }
            
            var durMatch = itemHtml.match(/class="[^"]*duration[^"]*"[^>]*>([^<]+)</i);
            var current = durMatch ? durMatch[1].trim() : "";
            
            var qualMatch = itemHtml.match(/class="[^"]*is-[^"]*"[^>]*>([^<]+)</i);
            var quality = qualMatch ? qualMatch[1].trim() : "";
            
            var imgMatch = itemHtml.match(/src="([^"]+)"/i) || itemHtml.match(/data-original="([^"]+)"/i) || itemHtml.match(/data-webp="([^"]+)"/i);
            var src = imgMatch ? imgMatch[1] : "";
            if (src && src.indexOf("http") == -1) {
                src = BASEURL + (src.charAt(0) === '/' ? src : '/' + src);
            }
            
            var titleMatch = itemHtml.match(/class="title"[^>]*>([^<]+)</i) || itemHtml.match(/alt="([^"]+)"/i);
            var title = titleMatch ? titleMatch[1].trim() : "Video";

            if (href && href.indexOf("http") > -1) {
                var cleanThumb = src.replace(/&amp;/g, '&');
                items.push({
                    "id": href,
                    "title": title,
                    "posterUrl": cleanThumb,
                    "backdropUrl": cleanThumb,
                    "quality": quality,
                    "lang": "",
                    "episode_current": current
                });
            }
        }
		
		return JSON.stringify({
			"items": items,
			"pagination": {
				"currentPage": 1,
				"totalPages": 999
			}
		});
		
	} catch (e) {
		log(e);
		return JSON.stringify({
			"items": [],
			"pagination": { "currentPage": 1, "totalPages": 1 }
		});
	}
}

function parseSearchResponse(html, $url) {
    return parseListResponse(html, $url);
}

function parseMovieDetail(html, url) {
    var cachedMovieDetailId = "";
	try {
		var id = "";
		var lname = "Đang cập nhật...";
		var limg = "";
		var ldes = "Không có mô tả.";
		var category = "";
		var episode_current = "";
		var quality = "";
		var year = 2026;
		var rating = 0;
		var servers = [];
		var extra = "";
		var lactor = "";
		var ldirec = "";
		var lduran = "";
		var status = "";

		var idMatch = /<link\s+rel="canonical"\s+href="([^"]+)"/i.exec(html) ||
			          /<meta\s+property="og:url"\s+content="([^"]+)"/i.exec(html);
		id = idMatch ? idMatch[1] : (url || "");
		cachedMovieDetailId = id;

        var getMeta = function(prop) {
            var m = html.match(new RegExp('<meta\\s+(?:property|name)="' + prop + '"\\s+content="([^"]+)"', 'i'));
            return m ? m[1] : "";
        };
        lname = getMeta('og:title') || getMeta('twitter:title') || lname;
        limg = getMeta('og:image') || getMeta('twitter:image') || "";
        ldes = getMeta('og:description') || getMeta('twitter:description') || ldes;

		var episodes = [];

		var fvMatch = html.match(/flashvars\s*=\s*\{([\s\S]*?)\}/i);
		var flashvarsBody = fvMatch ? fvMatch[1] : "";

		if (flashvarsBody) {
			var getField = function(name) {
				var m = flashvarsBody.match(new RegExp(name + "\\s*:\\s*'((?:[^'\\\\]|\\\\.)*)'"));
				if (m) return m[1].replace(/\\'/g, "'").replace(/\\"/g, '"');
				var mNum = flashvarsBody.match(new RegExp(name + "\\s*:\\s*([^,\\s}]+)"));
				return mNum ? mNum[1] : "";
			};

			if (lname === "Đang cập nhật...") lname = getField('video_title') || lname;
			if (!limg) limg = getField('preview_url') || getField('preview_url3') || getField('preview_url1') || "";

			var addEp = function(urlKey, textKey, defaultName, slug) {
				var vUrl = getField(urlKey);
				if (vUrl) {
					try { vUrl = decodeURIComponent(vUrl); } catch(e) {}
				}

				if (vUrl && vUrl.indexOf("http") !== -1) {
					var text = getField(textKey) || defaultName;
					var cleanUrl = vUrl.replace(/[\s\S]*?http/i, "http");
                    cleanUrl = cleanUrl.replace(/\\/g, "").replace(/&amp;/g, "&");

					episodes.push({
						id: cleanUrl,
						name: "Chất lượng " + text,
						slug: slug
					});
				}
			};

			addEp('video_alt_url3', 'video_alt_url3_text', '4K / FHD', 'hd4k');
			addEp('video_alt_url2', 'video_alt_url2_text', '1080p', 'hd1080');
			addEp('video_alt_url', 'video_alt_url_text', 'Chất lượng cao (HD)', 'hd720');
			addEp('video_url', 'video_url_text', 'SD', 'sd');
		}

        if (episodes.length === 0) {
            var srcRegex = /<source[^>]+src="([^"]+)"/gi;
            var srcM;
            var qCount = 1;
            while ((srcM = srcRegex.exec(html)) !== null) {
                var vUrl = srcM[1];
                try { vUrl = decodeURIComponent(vUrl); } catch(e) {}
                vUrl = vUrl.replace(/\\/g, "").replace(/&amp;/g, "&");

                if (vUrl && (vUrl.indexOf(".mp4") !== -1 || vUrl.indexOf(".m3u8") !== -1 || vUrl.indexOf("http") === 0)) {
                    var qualityMatch = srcM[0].match(/(?:res|resolution|title|label)="([^"]+)"/i);
                    var qLabel = qualityMatch ? qualityMatch[1] : ("Link " + qCount);
                    if (vUrl.indexOf("http") !== 0 && vUrl.indexOf("/") === 0) vUrl = BASEURL + vUrl;
                    episodes.push({
                        id: vUrl,
                        name: "Chất lượng " + qLabel,
                        slug: "link" + qCount
                    });
                    qCount++;
                }
            }
        }

        if (episodes.length === 0) {
            var rawUrlsMatches = html.match(/(https?:\/\/[^\s"'<>]+\.(?:mp4|m3u8)[^\s"'<>]*)/gi);
            if (rawUrlsMatches) {
                var uniqueUrls = [];
                var count = 1;
                for (var i = 0; i < rawUrlsMatches.length; i++) {
                    var clean = rawUrlsMatches[i].replace(/\\/g, "").replace(/&amp;/g, "&");
                    try { clean = decodeURIComponent(clean); } catch(e) {}
                    if (uniqueUrls.indexOf(clean) === -1) {
                        uniqueUrls.push(clean);
                        episodes.push({
                            id: clean,
                            name: "Server " + count,
                            slug: "srv" + count
                        });
                        count++;
                    }
                }
            }
        }

		if (episodes.length > 0) {
			servers.push({
				name: "Phát trực tiếp",
				episodes: episodes
			});
		}

		if (servers.length === 0) {
			return JSON.stringify({
				id: cachedMovieDetailId || url || "error",
				title: "Video không khả dụng",
				description: "Video riêng tư, bị xoá hoặc không tìm thấy nguồn phát.",
				posterUrl: limg || "",
				backdropUrl: limg || "",
				servers: []
			});
		}

		return JSON.stringify({
			id: id,
			title: lname,
			posterUrl: limg,
			backdropUrl: limg,
			description: ldes,
			quality: quality,
			year: year,
			rating: rating,
			status: status,
			category: category,
			episode_current: episode_current,
			servers: servers,
			duration: lduran || "",
			casts: lactor || "",
			director: ldirec || "",
			extra: extra
		});
		
	} catch (e) {
		log(e);
		return JSON.stringify({
			id: cachedMovieDetailId || url || "error",
			title: "Lỗi xử lý phim",
			servers: []
		});
	}
}

function parseDetailResponse(html, url) {
	try {
		var streamUrl = url || "";
		if (!streamUrl && html && typeof html === 'string' && html.indexOf("http") !== -1) {
			streamUrl = html;
		}

        streamUrl = streamUrl.trim();
        var isHls = streamUrl.indexOf(".m3u8") !== -1;

		return JSON.stringify({
			"url": streamUrl,
			"isEmbed": false,
			"mimeType": isHls ? "application/x-mpegURL" : "video/mp4",
			"headers": {
				"Referer": BASEURL + "/",
                "Origin": BASEURL,
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
			},
			"subtitles": []
		});
		
	} catch (e) {
		return JSON.stringify({ "url": url || "", "headers": {} });
	}
}

function parseEpisodePlayer(response, fetchedUrl) {
    return parseDetailResponse(response, fetchedUrl);
}

function parsePlayerUrl(response) {
    return parseDetailResponse(response, "");
}

function parseEmbedPlayer(html, url) {
    return parseDetailResponse(html, url);
}

function sortEpisodesByName(data) {
    data.forEach(function(server) {
        if (server.episodes && Array.isArray(server.episodes)) {
            server.episodes.sort(function(a, b) {
                var matchA = a.name.match(/Tập\s*(\d+)/i);
                var matchB = b.name.match(/Tập\s*(\d+)/i);
                var numA = matchA ? parseInt(matchA[1], 10) : 0;
                var numB = matchB ? parseInt(matchB[1], 10) : 0;
                return numA - numB;
            });
        }
    });
    return data;
}

function parseCategoriesResponse(apiResponseJson) {
    var listurl = getLISTmenu();
    var menulist = buildMenu(listurl);
    return JSON.stringify(menulist);
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }

function getLISTmenu() {
    return '[{"link":"/categories/jav-4k/","name":"Hàng 4K"},{"link":"/categories/gravure-idols/","name":"Gravure Idols"},{"link":"/categories/amateur3/","name":"Amateur"},{"link":"/categories/southeast-asia/","name":"Southeast Asia"},{"link":"/categories/jav-uncensored/","name":"JAV Uncensored"},{"link":"/categories/jav-amateur/","name":"JAV Amateur"},{"link":"/categories/western-girls/","name":"Western Girls"},{"link":"/categories/china-taiwan/","name":"China & Taiwan"},{"link":"/categories/korea/","name":"South Korea"},{"link":"/categories/jav/","name":"JAV & AV Models"},{"link":"/categories/cosplay/","name":"Cosplay"},{"link":"/categories/","name":"Load more..."}]';
}

function buildMenu(menuArray, type) {
    var parsedArray = [];
    try {
        parsedArray = typeof menuArray === 'string' ? JSON.parse(menuArray) : menuArray;
    } catch (e) {
        parsedArray = [];
    }
    var menulist = [];
    if (!parsedArray || !Array.isArray(parsedArray)) return menulist;
    var typeStr = type !== undefined ? String(type).trim() : undefined;
    for (var i = 0; i < parsedArray.length; i++) {
        var item = parsedArray[i];
        if (!item) continue;
        var link = item.link ? String(item.link).trim() : "";
        var name = item.name ? String(item.name).trim() : "";
        if (!link || !name) continue;
        var menuItem = {};
        if (typeStr === "false") {
            menuItem = { "slug": link, "title": name, "type": "Horizontal" };
        } else if (typeStr === "true") {
            menuItem = { "slug": link, "title": name, "type": "Grid" };
        } else {
            menuItem = { "slug": link, "name": name };
        }
        menulist.push(menuItem);
    }
    return menulist;
}
