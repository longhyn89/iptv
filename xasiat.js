// https://www.xasiat.ws
var BASEURL = "https://www.xasiat.ws";

function getManifest() {
    return JSON.stringify({
        "id": "xasiat",
        "name": "XXX Châu Á",
        "description": "Kho video XXX Châu Á tổng hợp đa dạng.",
        "info": "Kho video XXX Châu Á tổng hợp đa dạng.",
        "version": "1.1.0",
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
            
            var quality = "HD";
            var badgeMatch = itemHtml.match(/class="[^"]*(?:quality|badge|label|hd)[^"]*"[^>]*>(?:[^<]*\s*)(4K|FHD|1080p|1080|720p|720|HD|SD)/i);
            if (badgeMatch) {
                quality = badgeMatch[1].toUpperCase();
            } else {
                var rawQ = itemHtml.match(/(4K|1080p|720p|FHD|HD)/i);
                if (rawQ) quality = rawQ[1].toUpperCase();
            }
            if (quality === '1080') quality = '1080p';
            if (quality === '720') quality = '720p';
            
            var imgMatch = itemHtml.match(/data-original="([^"]+)"/i) || 
                           itemHtml.match(/data-src="([^"]+)"/i) || 
                           itemHtml.match(/data-lazy-src="([^"]+)"/i) || 
                           itemHtml.match(/src="([^"]+)"/i);
            var src = imgMatch ? imgMatch[1] : "";
            
            if (src && src.indexOf("data:image") === 0) {
                var backupImg = itemHtml.match(/src="([^"]+)"/i);
                if (backupImg && backupImg[1].indexOf("data:image") === -1) {
                    src = backupImg[1];
                }
            }
            
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
		var quality = "HD";
		var year = 2026;
		var rating = 0;
		var servers = [];
		var uniqueUrls = [];

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

        function addVideo(vidUrl, vidName, vidSlug) {
            if (!vidUrl) return;
            var cleanUrl = vidUrl.replace(/\\/g, "").replace(/&amp;/g, "&");
            if (cleanUrl.indexOf("javascript") === 0) return;
            
            // Lọc bỏ ảnh, file phụ và ĐẶC BIỆT LỌC BỎ các file trailer ngắn (thường có từ khóa preview, sample, trailer trong link)
            if (cleanUrl.match(/\.(jpg|jpeg|png|gif|webp|css|js|vtt|srt)($|\?)/i)) return;
            if (cleanUrl.indexOf("preview") !== -1 || cleanUrl.indexOf("sample") !== -1 || cleanUrl.indexOf("trailer") !== -1) return;
            
            if (cleanUrl.indexOf("//") === 0) cleanUrl = "https:" + cleanUrl;
            else if (cleanUrl.indexOf("/") === 0) cleanUrl = BASEURL + cleanUrl;
            else if (cleanUrl.indexOf("http") !== 0) return;

            if (uniqueUrls.indexOf(cleanUrl) === -1) {
                uniqueUrls.push(cleanUrl);
                episodes.push({
                    id: cleanUrl,
                    name: vidName,
                    slug: vidSlug + uniqueUrls.length
                });
            }
        }

        var decodedHtml = html.replace(/\\"/g, '"').replace(/\\\//g, '/');

        // Trích xuất cấu hình KVS Player chính xác từ biến flashvars (Nguồn phim chính thức)
        var fvMatch = decodedHtml.match(/flashvars\s*=\s*\{([\s\S]*?)\}/i);
        if (fvMatch && fvMatch[1]) {
            var fBody = fvMatch[1];
            var getField = function(name) {
                var m = fBody.match(new RegExp(name + "\\s*:\\s*'([^']+)'")) || fBody.match(new RegExp(name + "\\s*:\\s*\"([^\"]+)\""));
                return m ? m[1] : null;
            };

            if (lname === "Đang cập nhật...") lname = getField('video_title') || lname;
            
            // Lấy link các chất lượng phim thật
            addVideo(getField('video_alt_url3'), "Chất lượng 4K / FHD", "hd4k");
            addVideo(getField('video_alt_url2'), "Chất lượng 1080p", "hd1080");
            addVideo(getField('video_alt_url'), "Chất lượng 720p (HD)", "hd720");
            addVideo(getField('video_url'), "Chất lượng SD", "sd");
        }

        // Quét các thẻ source hoặc liên kết video chuẩn khác không dính đuôi preview
        var srcRegex = /<source[^>]+src=["']([^"']+)["']/gi;
        var srcM;
        while ((srcM = srcRegex.exec(decodedHtml)) !== null) {
            var labelMatch = srcM[0].match(/(?:res|resolution|title|label|size)=["']([^"']+)["']/i);
            var qLabel = labelMatch ? labelMatch[1] : "Chính thức";
            addVideo(srcM[1], "Nguồn " + qLabel, "src");
        }

        // Nếu hệ thống không bóc được link chính do mã hoá động, kích hoạt WebView chính hãng để xem trọn vẹn không bị cắt ngắn
        if (episodes.length === 0) {
            episodes.push({
                id: cachedMovieDetailId,
                name: "Xem Trực Tiếp Qua Web (Khuyên dùng)",
                slug: "webview"
            });
        }

		if (episodes.length > 0) {
			servers.push({
				name: "Phát trực tiếp",
				episodes: episodes
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
			duration: "",
			casts: "",
			director: "",
			extra: ""
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
        var isEmbedUrl = streamUrl.indexOf(".mp4") === -1 && streamUrl.indexOf(".m3u8") === -1;

		return JSON.stringify({
			"url": streamUrl,
			"isEmbed": isEmbedUrl,
			"mimeType": isHls ? "application/x-mpegURL" : "video/mp4",
			"headers": {
				"Referer": isEmbedUrl ? streamUrl : BASEURL + "/",
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
