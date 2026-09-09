// =============================================================================
// HDvnn Plugin (Tương thích 100% Mozilla Rhino JS & Android TV SuperOK)
// Website: https://hdvnn.xyz/
// Phiên bản: 1.0.9 (Khắc phục triệt để lỗi hiển thị đè menu hệ thống)
// =============================================================================

var BASEURL = "https://hdvnn.xyz";

function getManifest() {
    return JSON.stringify({
        "id": "hdvnn",
        "name": "HDvnn",
        "version": "1.1.0",
        "description": "Kho phim HDvnn.xyz Thuyết Minh, Lồng Tiếng, Vietsub chất lượng HD/FHD.",
        "info": "Kho phim HDvnn.xyz Thuyết Minh, Lồng Tiếng, Vietsub chất lượng HD/FHD.",
        "baseUrl": BASEURL,
        "iconUrl": "https://raw.githubusercontent.com/hieu-TQS/movie-SuperOK/refs/heads/main/icons/hdvnn.png",
        "isEnabled": true,
        "type": "MOVIE",
        "playerType": "auto"
    });
}

function log(msg) {
    if (typeof console !== 'undefined' && console.log) {
        console.log("[hdvnn] " + msg);
    }
}

function httpGet(url, headers) {
    try {
        if (typeof com !== 'undefined' && com.liskovsoft && com.liskovsoft.smartyoutubetv2) {
            var map = null;
            if (headers) {
                if (typeof java !== 'undefined' && java.util && java.util.HashMap) {
                    map = new java.util.HashMap();
                    for (var k in headers) {
                        if (headers.hasOwnProperty(k)) map.put(k, headers[k]);
                    }
                } else {
                    map = headers;
                }
            }
            return String(com.liskovsoft.smartyoutubetv2.common.plugin.api.PluginApiClient.INSTANCE.fetchContentString(url, map) || "");
        }
    } catch(e) {}
    return "";
}

function httpPost(url, postBody, headers) {
    try {
        if (typeof com !== 'undefined' && com.liskovsoft && com.liskovsoft.smartyoutubetv2) {
            var map = null;
            if (headers) {
                if (typeof java !== 'undefined' && java.util && java.util.HashMap) {
                    map = new java.util.HashMap();
                    for (var k in headers) {
                        if (headers.hasOwnProperty(k)) map.put(k, headers[k]);
                    }
                } else {
                    map = headers;
                }
            }
            return String(com.liskovsoft.smartyoutubetv2.common.plugin.api.PluginApiClient.INSTANCE.fetchContentPost(url, postBody, map) || "");
        }
    } catch(e) {}
    return "";
}

// ===== MENU & CATEGORIES =====

function getHomeSections() {
    return JSON.stringify([
        { "slug": "/the-loai/phim-chieu-rap.html", "title": "Phim Chiếu Rạp", "type": "Horizontal" },
        { "slug": "/loc-phim/W1tdLFtdLFsxXSxbXV0=", "title": "Phim Lẻ Mới", "type": "Horizontal" },
        { "slug": "/loc-phim/W1tdLFtdLFsyXSxbXV0=", "title": "Phim Bộ Mới", "type": "Horizontal" },
        { "slug": "/the-loai/phim-han-quoc.html", "title": "Phim Hàn Quốc", "type": "Horizontal" },
        { "slug": "/the-loai/phim-trung-quoc.html", "title": "Phim Trung Quốc", "type": "Horizontal" },
        { "slug": "/the-loai/hh-trung-quoc.html", "title": "HH Trung Quốc", "type": "Horizontal" },
        { "slug": "/the-loai/anime-nhat-ban.html", "title": "Anime Nhật Bản", "type": "Horizontal" },
        { "slug": "/the-loai/phim-chieu-rap.html", "title": "Tất Cả Phim", "type": "Grid" }
    ]);
}

function getLISTmenu() {
    return [
        { "link": "/the-loai/phim-chieu-rap.html", "name": "Phim Chiếu Rạp" },
        { "link": "/loc-phim/W1tdLFtdLFsxXSxbXV0=", "name": "Phim Lẻ" },
        { "link": "/loc-phim/W1tdLFtdLFsyXSxbXV0=", "name": "Phim Bộ" },
        { "link": "/the-loai/phim-han-quoc.html", "name": "Phim Hàn Quốc" },
        { "link": "/the-loai/phim-trung-quoc.html", "name": "Phim Trung Quốc" },
        { "link": "/the-loai/phim-chau-a.html", "name": "Phim Châu Á" },
        { "link": "/the-loai/phim-au-my.html", "name": "Phim Âu-Mỹ" },
        { "link": "/the-loai/hh-trung-quoc.html", "name": "HH Trung Quốc" },
        { "link": "/the-loai/anime-nhat-ban.html", "name": "Anime Nhật Bản" }
    ];
}

function getPrimaryCategories() {
    try {
        var menu = getLISTmenu();
        var result = [];
        for (var i = 0; i < menu.length; i++) {
            result.push({ "name": menu[i].name, "slug": menu[i].link });
        }
        return JSON.stringify(result);
    } catch(e) {
        return "[]";
    }
}

function getFilterConfig() {
    try {
        var menu = getLISTmenu();
        var result = [];
        for (var i = 0; i < menu.length; i++) {
            result.push({ "name": menu[i].name, "slug": menu[i].link });
        }
        return JSON.stringify({ category: result });
    } catch(e) {
        return JSON.stringify({ category: [] });
    }
}

function parseCategoriesResponse(html) { return getPrimaryCategories(); }
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }

// ===== URL GENERATION =====

function getUrlList(slug, filtersJson) {
    try {
        if (slug && slug.indexOf("http") === 0) return slug;
        var page = 1;
        var path = slug || "/the-loai/phim-chieu-rap.html";

        if (filtersJson) {
            try {
                var f = typeof filtersJson === "object" ? filtersJson : JSON.parse(filtersJson);
                if (f.page) page = parseInt(f.page, 10) || 1;
                if (f.category) {
                    if (Array.isArray(f.category) && f.category.length > 0) {
                        path = f.category[0].slug || f.category[0].link || path;
                    } else if (typeof f.category === "string") {
                        path = f.category;
                    }
                }
            } catch(e) {}
        }

        var url = path.indexOf("http") === 0 ? path : (BASEURL + (path.indexOf("/") === 0 ? "" : "/") + path);
        if (page > 1) {
            url += (url.indexOf("?") > -1 ? "&p=" : "?p=") + page;
        }
        return url;
    } catch(e) {
        return BASEURL + "/the-loai/phim-chieu-rap.html";
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var page = 1;
        if (filtersJson) {
            try {
                var f = typeof filtersJson === "object" ? filtersJson : JSON.parse(filtersJson);
                if (f.page) page = parseInt(f.page, 10) || 1;
            } catch(e) {}
        }
        var kw = encodeURIComponent(keyword || "");
        var url = BASEURL + "/tim-kiem/" + kw + ".html";
        if (page > 1) url += "?p=" + page;
        return url;
    } catch(e) {
        return BASEURL + "/tim-kiem/" + encodeURIComponent(keyword || "") + ".html";
    }
}

function getSearchUrl(keyword, page) {
    return getUrlSearch(keyword, JSON.stringify({ page: typeof page === 'number' ? page : 1 }));
}

function getUrlDetail(id) {
    if (!id) return "";
    if (id.indexOf("http") === 0) return id;
    return BASEURL + (id.indexOf("/") === 0 ? "" : "/") + id;
}

function getUrlCategories() { return BASEURL; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// ===== PARSE LIST RESPONSE =====

function parseListResponse(html, $url) {
    try {
        if (!html) return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1, hasNext: false } });

        var items = [];
        var itemRegex = /<a\s+href="([^"]*(?:thong-tin-phim|xem-phim)[^"]*)"([^>]*)>([\s\S]*?)<\/a>/gi;
        var match;
        var seen = {};

        while ((match = itemRegex.exec(html)) !== null) {
            var href = match[1];
            if (href.indexOf("http") !== 0) {
                href = BASEURL + (href.indexOf("/") === 0 ? "" : "/") + href;
            }

            if (seen[href]) continue;
            seen[href] = true;

            var outerAttr = match[2];
            var inner = match[3];

            var titleMatch = outerAttr.match(/title="([^"]+)"/i) || inner.match(/alt="([^"]+)"/i);
            var title = titleMatch ? titleMatch[1].trim() : "";
            
            if (!title) {
                var nameDiv = inner.match(/class="[^"]*name[^"]*"[^>]*>([^<]+)</i) || inner.match(/class="[^"]*title[^"]*"[^>]*>([^<]+)</i);
                if (nameDiv) title = nameDiv[1].trim();
            }
            if (!title) continue;

            var imgMatch = inner.match(/img[\s\S]*?src="([^"]+)"/i);
            var poster = imgMatch ? imgMatch[1].trim() : "";
            if (poster.indexOf("//") === 0) poster = "https:" + poster;
            else if (poster && poster.indexOf("http") !== 0) poster = BASEURL + (poster.indexOf("/") === 0 ? "" : "/") + poster;

            var epMatch = inner.match(/class="episode-latest"[^>]*>[\s\S]*?<span>([^<]+)<\/span>/i) || inner.match(/class="episode"[^>]*>([^<]+)<\/span>/i);
            var episodeCurrent = epMatch ? epMatch[1].trim() : "";

            var qMatch = inner.match(/class="score"[^>]*>([\s\S]*?)<\/div>/i) || inner.match(/class="quality"[^>]*>([^<]+)<\/span>/i);
            var quality = qMatch ? qMatch[1].replace(/<[^>]*>/g, '').trim() : "HD";

            items.push({
                "id": href,
                "title": title,
                "posterUrl": poster,
                "backdropUrl": poster,
                "quality": quality,
                "episode_current": episodeCurrent
            });
        }

        var currentPage = 1;
        if ($url) {
            var pMatch = $url.match(/[?&]p=(\d+)/i);
            if (pMatch) currentPage = parseInt(pMatch[1], 10);
        }

        var totalPages = currentPage;
        var pageLinkRegex = /class="page-link"[^>]*href="[^"]*?[?&]p=(\d+)"/gi;
        var pLinkMatch;
        while ((pLinkMatch = pageLinkRegex.exec(html)) !== null) {
            var pNum = parseInt(pLinkMatch[1], 10);
            if (pNum > totalPages) totalPages = pNum;
        }

        return JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": currentPage,
                "totalPages": totalPages,
                "hasNext": currentPage < totalPages || items.length >= 20
            }
        });
    } catch(e) {
        log("parseListResponse error: " + e);
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1, hasNext: false } });
    }
}

function parseSearchResponse(html, url) { return parseListResponse(html, url); }
function parseSearchResult(html, url) { return parseListResponse(html, url); }
function parseHomeResponse(html, url) { return parseListResponse(html, url); }
function parseList(html, url) { return parseListResponse(html, url); }

// ===== PARSE MOVIE DETAIL (Chống tràn menu bằng bộ lọc từ khóa độc lập) =====

function parseMovieDetail(html, url) {
    try {
        var id = url || "";
        
        // Tiêu đề
        var titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || html.match(/property="og:title"\s+content="([^"]+)"/i);
        var title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : "HDvnn Movie";

        // Ảnh Poster
        var imgMatch = html.match(/property="og:image"\s+content="([^"]+)"/i);
        var posterUrl = imgMatch ? imgMatch[1] : "";
        if (posterUrl.indexOf("//") === 0) posterUrl = "https:" + posterUrl;

        // Trích xuất vùng thông tin chính của chi tiết phim (cắt bỏ header/footer tổng của trang)
        var mainInfoBlock = html;
        var infoStart = html.indexOf('class="movie-info"') !== -1 ? html.indexOf('class="movie-info"') : html.indexOf('<h1');
        var infoEnd = html.indexOf('Nội dung') !== -1 ? html.indexOf('Nội dung') : html.length;
        if (infoStart !== -1 && infoEnd !== -1 && infoEnd > infoStart) {
            mainInfoBlock = html.substring(infoStart, infoEnd);
        }

        // Tự động tìm và chỉ lấy các thể loại hợp lệ (bỏ hoàn toàn danh sách menu tổng)
        var genre = "Phim Lẻ";
        var validGenres = [];
        var menuKeywords = ["phim-chieu-rap", "phim-le", "phim-bo", "phim-han-quoc", "phim-trung-quoc", "phim-chau-a", "phim-au-my", "hh-trung-quoc", "anime-nhat-ban"];
        
        var linkRegex = /href="[^"]*\/the-loai\/([^"]+)\.html"[^>]*>([^<]+)<\/a>/gi;
        var lMatch;
        while ((lMatch = linkRegex.exec(mainInfoBlock)) !== null) {
            var slug = lMatch[1].trim();
            var name = lMatch[2].replace(/<[^>]*>/g, '').trim();
            // Chỉ lấy các thể loại không trùng với tên menu trang chủ
            if (menuKeywords.indexOf(slug) === -1 && name && validGenres.indexOf(name) === -1) {
                validGenres.push(name);
            }
        }
        if (validGenres.length > 0) {
            genre = validGenres.join(", ");
        }

        // Năm phát hành
        var year = 2024;
        var yearMatch = mainInfoBlock.match(/\/nam-phat-hanh\/[^"]*"[^>]*>(\d{4})<\/a>/i) || mainInfoBlock.match(/(\d{4})/i);
        if (yearMatch) {
            var yVal = parseInt(yearMatch[1], 10);
            if (yVal >= 1900 && yVal <= 2030) year = yVal;
        }

        // Đánh giá & Chất lượng
        var rating = 0;
        var quality = "HD";
        var status = "Hoàn tất";

        // Mô tả phim
        var description = "Đang cập nhật nội dung phim.";
        var descMatch = html.match(/Nội dung<\/div>[\s\S]*?<div[^>]*>([\s\S]*?)<\/div>/i) ||
                        html.match(/property="og:description"\s+content="([^"]+)"/i);
        if (descMatch) {
            description = descMatch[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        }

        // Lấy danh sách tập phim
        var watchLinks = [];
        var watchRegex = /href="([^"]*xem-phim[^"]*)"/gi;
        var wMatch;
        while ((wMatch = watchRegex.exec(html)) !== null) {
            var wUrl = wMatch[1];
            if (wUrl.indexOf("http") !== 0) wUrl = BASEURL + (wUrl.indexOf("/") === 0 ? "" : "/") + wUrl;
            if (watchLinks.indexOf(wUrl) === -1) watchLinks.push(wUrl);
        }

        var watchHtml = html;
        if (watchLinks.length > 0 && html.indexOf("EpisodeID") === -1) {
            var fetchedWatch = httpGet(watchLinks[0]);
            if (fetchedWatch) watchHtml = fetchedWatch;
        }

        var episodesRaw = [];
        var epRegex = /<a\s+href="([^"]*xem-phim[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
        var epMatch;
        var seenEps = {};

        while ((epMatch = epRegex.exec(watchHtml)) !== null) {
            var epUrl = epMatch[1];
            if (epUrl.indexOf("http") !== 0) epUrl = BASEURL + (epUrl.indexOf("/") === 0 ? "" : "/") + epUrl;
            var inner = epMatch[2];
            var epName = inner.replace(/<[^>]*>/g, '').trim();

            if (!epName || epName.toLowerCase().indexOf("xem ngay") !== -1 || epName.toLowerCase().indexOf("xem phim") !== -1) continue;
            if (inner.indexOf("fa-play") !== -1 || epMatch[0].indexOf("button-default") !== -1) continue;

            if (!seenEps[epUrl] && epName.indexOf("script") === -1) {
                seenEps[epUrl] = true;
                var isNum = /^\d+$/.test(epName);
                episodesRaw.push({
                    id: epUrl,
                    name: isNum ? ("Tập " + epName) : epName,
                    slug: "tap-" + epName.replace(/[^\d]/g, ''),
                    num: isNum ? parseInt(epName, 10) : 0
                });
            }
        }

        if (episodesRaw.length > 1 && episodesRaw[0].num > episodesRaw[episodesRaw.length - 1].num) {
            episodesRaw.reverse();
        }

        if (episodesRaw.length === 0 && watchLinks.length > 0) {
            for (var k = 0; k < watchLinks.length; k++) {
                episodesRaw.push({
                    id: watchLinks[k],
                    name: "Tập " + (k + 1),
                    slug: "tap-" + (k + 1),
                    num: k + 1
                });
            }
        }

        var preResolvedUrl = "";
        if (episodesRaw.length === 1 && watchHtml.indexOf("MovieID") !== -1) {
            try {
                var cMatch = watchHtml.match(/name="csrf-token"\s+content="([^"]+)"/i);
                var cToken = cMatch ? cMatch[1] : "";
                var mIdMatch = watchHtml.match(/MovieID:\s*(\d+)/i);
                var eIdMatch = watchHtml.match(/EpisodeID:\s*(\d+)/i);
                if (mIdMatch && eIdMatch) {
                    var pBody = "MovieID=" + mIdMatch[1] + "&EpisodeID=" + eIdMatch[1];
                    var pHeaders = {
                        "X-CSRF-TOKEN": cToken,
                        "X-Requested-With": "XMLHttpRequest",
                        "Referer": episodesRaw[0].id,
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                    };
                    var pResp = httpPost(BASEURL + "/server/ajax/player", pBody, pHeaders);
                    if (pResp) {
                        var pJson = JSON.parse(pResp);
                        preResolvedUrl = pJson.src_pt || pJson.src_go || pJson.src_hd || pJson.src_vip || pJson.src_dr || pJson.src_vnn_1 || "";
                        if (preResolvedUrl) episodesRaw[0].id = preResolvedUrl;
                    }
                }
            } catch(ex) {}
        }

        var servers = [];
        if (episodesRaw.length > 0) {
            servers.push({ name: "HDvnn (Tự Động)", episodes: episodesRaw });

            if (!preResolvedUrl) {
                var epsPT = [];
                for (var p = 0; p < episodesRaw.length; p++) {
                    epsPT.push({ id: episodesRaw[p].id + "#server=pt", name: episodesRaw[p].name, slug: episodesRaw[p].slug });
                }
                servers.push({ name: "Server Google (PT)", episodes: epsPT });

                var epsGO = [];
                for (var g = 0; g < episodesRaw.length; g++) {
                    epsGO.push({ id: episodesRaw[g].id + "#server=go", name: episodesRaw[g].name, slug: episodesRaw[g].slug });
                }
                servers.push({ name: "Server Google (GO)", episodes: epsGO });
            }
        }

        return JSON.stringify({
            id: id,
            title: title,
            name: title,
            posterUrl: posterUrl,
            backdropUrl: posterUrl,
            description: description,
            year: year,
            genre: genre,
            genres: genre,
            rating: rating,
            quality: quality,
            status: status,
            servers: servers
        });
    } catch(e) {
        log("parseMovieDetail error: " + e);
        return JSON.stringify({ id: url || "error", title: "Lỗi tải chi tiết", servers: [] });
    }
}

function parseDetail(html, url) { return parseMovieDetail(html, url); }

// ===== PARSE PLAYER & STREAM RESPONSE =====

function parseDetailResponse(html, url) {
    try {
        var reqUrl = url || "";
        var serverTag = "";
        if (reqUrl.indexOf("#server=") !== -1) {
            var parts = reqUrl.split("#server=");
            reqUrl = parts[0];
            serverTag = parts[1];
        }

        if (reqUrl.indexOf(".m3u8") !== -1 || reqUrl.indexOf(".mp4") !== -1 || reqUrl.indexOf("googleusercontent.com") !== -1) {
            return JSON.stringify({
                "url": reqUrl,
                "isEmbed": false,
                "headers": {
                    "Referer": BASEURL + "/",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                },
                "subtitles": []
            });
        }

        var pageHtml = html || "";
        if (pageHtml.indexOf("MovieID") === -1 && reqUrl && reqUrl.indexOf("http") === 0) {
            pageHtml = httpGet(reqUrl);
        }

        var csrfMatch = pageHtml.match(/name="csrf-token"\s+content="([^"]+)"/i);
        var csrfToken = csrfMatch ? csrfMatch[1] : "";

        var movieIDMatch = pageHtml.match(/MovieID:\s*(\d+)/i);
        var episodeIDMatch = pageHtml.match(/EpisodeID:\s*(\d+)/i) || reqUrl.match(/episode-id-(\d+)\.html/i);

        var movieId = movieIDMatch ? movieIDMatch[1] : "";
        var episodeId = episodeIDMatch ? episodeIDMatch[1] : "";

        if (!movieId || !episodeId) {
            return JSON.stringify({ "url": reqUrl, "isEmbed": true, "headers": { "Referer": BASEURL + "/" } });
        }

        var postData = "MovieID=" + movieId + "&EpisodeID=" + episodeId;
        var headers = {
            "X-CSRF-TOKEN": csrfToken,
            "X-Requested-With": "XMLHttpRequest",
            "Referer": reqUrl,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        };

        var respStr = httpPost(BASEURL + "/server/ajax/player", postData, headers);
        if (!respStr) {
            return JSON.stringify({ "url": reqUrl, "isEmbed": true, "headers": { "Referer": BASEURL + "/" } });
        }

        var json = JSON.parse(respStr);
        var streamUrl = "";
        var isEmbed = false;

        if (serverTag && json["src_" + serverTag]) {
            streamUrl = json["src_" + serverTag];
            if (serverTag === "vnn_1" || serverTag === "vnn_2" || serverTag === "hy" || serverTag === "vk" || serverTag === "ok") {
                isEmbed = true;
            }
        }

        if (!streamUrl) {
            if (json.src_pt) streamUrl = json.src_pt;
            else if (json.src_go) streamUrl = json.src_go;
            else if (json.src_hd) streamUrl = json.src_hd;
            else if (json.src_vip) streamUrl = json.src_vip;
            else if (json.src_dr) streamUrl = json.src_dr;
            else if (json.src_vnn_1) { streamUrl = json.src_vnn_1; isEmbed = true; }
            else if (json.src_vnn_2) { streamUrl = json.src_vnn_2; isEmbed = true; }
            else if (json.src_hy) { streamUrl = json.src_hy; isEmbed = true; }
            else if (json.src_vk) { streamUrl = json.src_vk; isEmbed = true; }
        }

        if (!streamUrl) {
            streamUrl = reqUrl;
            isEmbed = true;
        }

        return JSON.stringify({
            "url": streamUrl,
            "isEmbed": isEmbed,
            "headers": {
                "Referer": BASEURL + "/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            },
            "subtitles": []
        });
    } catch(e) {
        log("parseDetailResponse error: " + e);
        return JSON.stringify({ "url": url || "", "isEmbed": true, "headers": { "Referer": BASEURL + "/" } });
    }
}

function parsePlayerUrl(html, url) { return parseDetailResponse(html, url); }
function parseEpisodePlayer(html, url) { return parseDetailResponse(html, url); }
