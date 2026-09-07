// https://www.xasiat.ws
var BASEURL = "https://www.xasiat.ws";

function getManifest() {
    return JSON.stringify({
        "id": "xasiat",
        "name": "XXX Châu Á",
        "description": "Kho video XXX Châu Á tổng hợp đa dạng.",
        "info": "Kho video XXX Châu Á tổng hợp đa dạng.",
        "version": "1.0.8",
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
            
            // Xử lý Quality Label chuẩn xác hơn
            var quality = "HD";
            var qMatch = itemHtml.match(/<[^>]+class="[^"]*(?:quality|is-hd|badge|label-hd|v-quality)[^"]*"[^>]*>([^<]+)<\//i);
            if (qMatch && qMatch[1]) {
                quality = qMatch[1].replace(/<[^>]+>/g, '').trim();
            } else {
                // Quét nhanh các từ khoá chất lượng trong toàn bộ khung item
                var rawQ = itemHtml.match(/\b(4K|1080p|720p|480p|360p|FHD|HD|SD)\b/i);
                if (rawQ) quality = rawQ[1].toUpperCase();
            }
            if (quality.length > 8 || quality.length === 0) quality = "HD";
            
            // Xử lý ảnh Thumbnail Lazyload
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
        var uniqueUrls = [];

        // Hàm hỗ trợ add URL an toàn
        function addVideo(vidUrl, vidName, vidSlug) {
            if (!vidUrl || vidUrl.indexOf("javascript") === 0) return;
            var cleanUrl = vidUrl.replace(/\\/g, "").replace(/&amp;/g, "&");
            try { cleanUrl = decodeURIComponent(cleanUrl); } catch(e) {}
            
            if (cleanUrl.indexOf("http") !== 0 && cleanUrl.indexOf("//") !== 0 && cleanUrl.indexOf("/") !== 0) return;
            if (cleanUrl.indexOf("//") === 0) cleanUrl = "https:" + cleanUrl;
            else if (cleanUrl.indexOf("/") === 0) cleanUrl = BASEURL + cleanUrl;

            if (uniqueUrls.indexOf(cleanUrl) === -1) {
                uniqueUrls.push(cleanUrl);
                episodes.push({
                    id: cleanUrl,
                    name: vidName,
                    slug: vidSlug
                });
            }
        }

        // TẦNG 1: Quét KVS Player / Flashvars
		var fvMatch = html.match(/flashvars\s*=\s*\{([\s\S]*?)\}/i) || html.match(/kt_player\s*\(\s*'[^']+'\s*,\s*'[^']+'\s*,\s*\{([\s\S]*?)\}/i);
		if (fvMatch && fvMatch[1]) {
            var fBody = fvMatch[1];
			var getField = function(name) {
				var m = fBody.match(new RegExp(name + "\\s*:\\s*'([^']+)'"));
                if (!m) m = fBody.match(new RegExp(name + "\\s*:\\s*\"([^\"]+)\""));
				if (!m) m = fBody.match(new RegExp(name + "\\s*:\\s*([^,\\s}]+)"));
				return m ? m[1] : null;
			};

			if (lname === "Đang cập nhật...") lname = getField('video_title') || lname;
			if (!limg) limg = getField('preview_url') || getField('preview_url3') || "";

            addVideo(getField('video_alt_url3'), "4K / FHD", "hd4k");
            addVideo(getField('video_alt_url2'), "1080p", "hd1080");
            addVideo(getField('video_alt_url'), "720p HD", "hd720");
            addVideo(getField('video_url'), "SD", "sd");
		}

        // TẦNG 2: Quét thẻ HTML5 <source>
        var srcRegex = /<source[^>]+src=["']([^"']+)["']/gi;
        var srcM;
        var qCount = 1;
        while ((srcM = srcRegex.exec(html)) !== null) {
            var labelMatch = srcM[0].match(/(?:res|resolution|title|label|size)=["']([^"']+)["']/i);
            var qLabel = labelMatch ? labelMatch[1] : ("Nguồn " + qCount);
            addVideo(srcM[1], "Chất lượng " + qLabel, "src" + qCount);
            qCount++;
        }

        // TẦNG 3: Quét trực tiếp thẻ <video src="..."> hoặc data-src
        var videoSrcMatch = html.match(/<video[^>]+src=["']([^"']+)["']/i) || html.match(/data-(?:video|src|file)=["'](https?:\/\/[^"']+\.(?:mp4|m3u8)[^"']*)["']/i);
        if (videoSrcMatch) {
            addVideo(videoSrcMatch[1], "Nguồn Gốc", "mainsrc");
        }

        // TẦNG 4: Quét cấu hình JWPlayer/JSON
        var jwRegex = /["']?file["']?\s*:\s*["'](https?:\/\/[^"']+)["']/gi;
        var jwM;
        var jwCount = 1;
        while ((jwM = jwRegex.exec(html)) !== null) {
            if (jwM[1].indexOf('.m3u8') !== -1 || jwM[1].indexOf('.mp4') !== -1) {
                addVideo(jwM[1], "Server Trực Tiếp " + jwCount, "jw" + jwCount);
                jwCount++;
            }
        }

        // TẦNG 5: Quét thô toàn bộ file mp4/m3u8 trong HTML (Dự phòng)
        if (episodes.length === 0) {
            var rawUrlsMatches = html.match(/(https?:\/\/[^\s"'<>\[\]]+\.(?:mp4|m3u8)[^\s"'<>\[\]]*)/gi);
            if (rawUrlsMatches) {
                for (var i = 0; i < rawUrlsMatches.length; i++) {
                    addVideo(rawUrlsMatches[i], "Dự phòng " + (i+1), "raw" + i);
                }
            }
        }

        // TẦNG 6: Bắt Iframe Nhúng
        if (episodes.length === 0) {
            var iframeRegex = /<iframe[^>]+src=["']([^"']+)["']/gi;
            var ifM;
            var ifCount = 1;
            while ((ifM = iframeRegex.exec(html)) !== null) {
                var ifUrl = ifM[1];
                // Loại trừ iframe rác/quảng cáo
                if (ifUrl.indexOf('ads') === -1 && ifUrl.indexOf('banner') === -1) {
                    addVideo(ifUrl, "Trình phát Nhúng (Embed) " + ifCount, "embed" + ifCount);
                    ifCount++;
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
        // Kiểm tra chính xác xem link có phải embed iframe hay không
        var isEmbedUrl = streamUrl.indexOf(".mp4") === -1 && streamUrl.indexOf(".m3u8") === -1;

		return JSON.stringify({
			"url": streamUrl,
			"isEmbed": isEmbedUrl,
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
