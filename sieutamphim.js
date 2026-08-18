// ========================================================
// SIÊU TẦM PHIM VAAPP PLUGIN (Bản 1.1.2 - Sửa lỗi Stream & API)
// ========================================================

const BASE_URL = "https://www.sieutamphim.pro";

// ========================================================
// CONFIGURATION & METADATA
// ========================================================

function getManifest() {
    return JSON.stringify({
        "id": "sieutamphim",
        "name": "Sưu Tầm Phim",
        "version": "1.1.2",
        "baseUrl": BASE_URL,
        "iconUrl": BASE_URL + "/posts/2024/06/cropped-logosieutamphim-192x192.png",
        "isEnabled": true,
        "isAdult": false,
        "type": "MOVIE",
        "layoutType": "VERTICAL",
        "playerType": "embed"
    });
}

function log(msg) {
    if (typeof nativeLog !== 'undefined') {
        nativeLog("[STPhim] " + msg);
    }
}

function getSlugFromUrl(url) {
    if (!url) return "";
    var cleanUrl = url.split("?")[0];
    var match = cleanUrl.match(/\/([^\/]+)\.html$/i);
    if (match) return match[1];
    var parts = cleanUrl.split("/");
    var last = parts[parts.length - 1] || parts[parts.length - 2] || "";
    return last.replace(".html", "");
}

// ========================================================
// HOME & CATEGORY
// ========================================================

function getHomeSections() {
    return JSON.stringify([
        { slug: "phim-bo", title: "Phim Bộ Mới", type: "Horizontal" },
        { slug: "phim-le", title: "Phim Lẻ Mới", type: "Horizontal" },
        { slug: "long-tieng", title: "Phim Lồng Tiếng", type: "Horizontal" },
        { slug: "thuyet-minh", title: "Phim Thuyết Minh", type: "Horizontal" },
        { slug: "phim-moi", title: "Mới cập nhật", type: "Grid" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Phim Lẻ', slug: 'phim-le' },
        { name: 'Phim Bộ', slug: 'phim-bo' },
        { name: 'Hoạt Hình', slug: 'hoat-hinh' },
        { name: 'Phim Việt Nam', slug: 'phim-viet-nam' },
        { name: 'Phim Hàn Quốc', slug: 'phim-han-quoc' },
        { name: 'Phim Trung Quốc', slug: 'phim-trung-quoc' },
        { name: 'Phim Nhật Bản', slug: 'phim-nhat-ban' },
        { name: 'Hành Động', slug: 'hanh-dong' },
        { name: 'Viễn Tưởng', slug: 'vien-tuong' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({ sort: [], category: [] });
}

// ========================================================
// URL GENERATION
// ========================================================

function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    if (page === 1) return BASE_URL + "/search/label/" + slug;
    return BASE_URL + "/search/label/" + slug + "/page/" + page;
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    return BASE_URL + "/page/" + page + "?s=" + encodeURIComponent(keyword);
}

function getUrlDetail(id) {
    log("Resolving ID: " + id);
    if (!id) return "";
    if (id.startsWith("play-")) {
        var resolved = id.replace("play-", "");
        log("Resolved Stream ID to: " + resolved);
        return resolved;
    }
    if (id.startsWith("http")) {
        return id;
    }
    // Trả về trực tiếp URL web HTML thay vì gọi API để giữ nguyên cấu trúc DOM phát video
    var webUrl = BASE_URL + "/" + id + ".html";
    log("Resolved Slug to Web HTML: " + webUrl);
    return webUrl;
}

// ========================================================
// PARSE LIST
// ========================================================

function parseListResponse(html) {
    try {
        var items = [];
        var used = {};
        var chunks = html.split('class="col post-item"');
        
        for (var i = 1; i < chunks.length; i++) {
            var blockHtml = chunks[i];
            var urlMatch = blockHtml.match(/href="([^"]+\.html)"/i);
            if (!urlMatch) continue;

            var url = urlMatch[1];
            if (!url.startsWith("http")) url = BASE_URL + url;
            if (used[url]) continue;
            used[url] = true;

            var titleMatch = blockHtml.match(/post-title[^>]*?>([\s\S]*?)<\/a>/i) || blockHtml.match(/alt="([^"]+)"/i);
            var title = titleMatch ? decodeHtmlEntities(titleMatch[1].replace(/<[^>]*>/g, "")) : "Unknown";

            var posterMatch = blockHtml.match(/data-src="([^"]+)"/i) || blockHtml.match(/src="([^"]+)"/i);
            var poster = posterMatch ? posterMatch[1] : "";
            if (poster.startsWith("//")) poster = "https:" + poster;

            items.push({
                id: getSlugFromUrl(url),
                title: title,
                posterUrl: poster
            });
        }

        return JSON.stringify({
            items: items,
            pagination: { currentPage: 1, totalPages: 999 }
        });
    } catch (e) {
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

// ========================================================
// PARSE DETAIL
// ========================================================

function parseMovieDetail(html, url) {
    if (url && url.includes("server=")) {
        return JSON.stringify({ id: url, servers: [] });
    }
    try {
        var contentHtml = html;
        var title = "";
        var poster = "";
        var description = "";
        var movieUrl = url;

        // Nếu dữ liệu trả về từ WordPress REST API
        if (html.trim().startsWith("[") || html.trim().startsWith("{")) {
            try {
                var posts = JSON.parse(html);
                var post = Array.isArray(posts) ? posts[0] : posts;
                if (post) {
                    title = post.title ? post.title.rendered : "";
                    movieUrl = post.link || url;
                    contentHtml = post.content ? post.content.rendered : html;
                    description = post.excerpt ? post.excerpt.rendered.replace(/<[^>]*>/g, "").trim() : "";
                    if (post.jetpack_featured_media_url) poster = post.jetpack_featured_media_url;
                }
            } catch (err) {}
        }

        if (!title) {
            title = (contentHtml.match(/<meta property="og:title" content="([^"]+)"/i) || [])[1] || "";
            var ogImageMatch = contentHtml.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i) || 
                               contentHtml.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i);
            poster = ogImageMatch ? ogImageMatch[1] : "";
            description = (contentHtml.match(/<meta property="og:description" content="([^"]+)"/i) || [])[1] || "";
        }

        var postIdMatch = contentHtml.match(/\/\?p=(\d+)/) || contentHtml.match(/post-id=["'](\d+)/) || contentHtml.match(/postId\s*:\s*(\d+)/);
        var postId = postIdMatch ? postIdMatch[1] : "";

        var servers = [];
        var usedServer = {};
        var groupRegex = /data-server=['"]([^'"]+)['"]/gi;
        var m;

        while ((m = groupRegex.exec(contentHtml)) !== null) {
            var serverId = m[1];
            if (usedServer[serverId]) continue;
            usedServer[serverId] = true;

            var epBlockRegex = new RegExp('data-server=["\']' + serverId + '["\'][\\s\\S]*?data-episodes=([\'"])([\\s\\S]*?)\\1', "i");
            var epBlockMatch = contentHtml.match(epBlockRegex);

            var epCount = 0;
            if (epBlockMatch) {
                var rawEpisodes = epBlockMatch[2];
                var epRegex = /{"([^"]+)","([^"]+)"}/g;
                while (epRegex.exec(rawEpisodes) !== null) {
                    epCount++;
                }
            }

            if (epCount === 0) epCount = 1;

            var episodes = [];
            for (var j = 1; j <= epCount; j++) {
                episodes.push({
                    id: "play-" + movieUrl + "?id=" + postId + "&server=" + encodeURIComponent(serverId) + "&tap=" + j,
                    name: epCount === 1 ? "Full" : "Tập " + j,
                    slug: "tap-" + j
                });
            }

            servers.push({
                name: serverId.toUpperCase(),
                episodes: episodes
            });
        }

        // Tạo server fallback nếu không quét được data-server
        if (servers.length === 0) {
            servers.push({
                name: "VIP",
                episodes: [{ id: "play-" + movieUrl + "?id=" + postId + "&server=vip&tap=1", name: "Full", slug: "full" }]
            });
        }

        return JSON.stringify({
            id: "",
            title: decodeHtmlEntities(title.replace(" - Siêu Tầm Phim", "").trim()),
            posterUrl: poster,
            backdropUrl: poster,
            description: description,
            servers: servers,
            quality: "HD",
            status: "Hoàn thành"
        });
    } catch (e) {
        log("Error in parseMovieDetail: " + e.message);
        return JSON.stringify({ servers: [] });
    }
}

// ========================================================
// PARSE STREAM (LINK PHÁT)
// ========================================================

function parseDetailResponse(html, url) {
    log("Parsing Stream for URL: " + url);
    try {
        var rawContent = html;

        // Nếu nội dung trả về là JSON từ API WP, trích xuất chuỗi rendered HTML
        if (html.trim().startsWith("[") || html.trim().startsWith("{")) {
            try {
                var parsedJson = JSON.parse(html);
                var item = Array.isArray(parsedJson) ? parsedJson[0] : parsedJson;
                if (item && item.content) {
                    rawContent = item.content.rendered;
                }
            } catch (err) {}
        }

        if (url.includes("?id=") && url.includes("&server=")) {
            var server = (url.match(/server=([^&]+)/) || [])[1];
            var tapStr = (url.match(/tap=(\d+)/) || [])[1];
            var tap = parseInt(tapStr, 10) || 1;

            if (server) {
                var epBlockRegex = new RegExp('data-server=["\']' + server + '["\'][\\s\\S]*?data-episodes=([\'"])([\\s\\S]*?)\\1', "i");
                var epBlockMatch = rawContent.match(epBlockRegex);

                if (epBlockMatch) {
                    var rawEpisodes = epBlockMatch[2];
                    var epRegex = /{"([^"]+)","([^"]+)"}/g;
                    var epMatch;
                    var currentIndex = 1;

                    while ((epMatch = epRegex.exec(rawEpisodes)) !== null) {
                        if (currentIndex === tap) {
                            var rawSrc = epMatch[1];
                            var decrypted = "";
                            
                            // Xử lý Giải mã XOR 42
                            for (var i = 0; i < rawSrc.length; i++) {
                                decrypted += String.fromCharCode(rawSrc.charCodeAt(i) ^ 42);
                            }
                            
                            // Tự động điều chỉnh URL nhúng
                            decrypted = decrypted.replace(/https?:\/\/(short\.ink|short\.icu)\//g, "https://abyssplayer.com/");
                            
                            log("Successfully extracted decrypted URL: " + decrypted);

                            if (decrypted.indexOf(".m3u8") !== -1) {
                                return JSON.stringify({
                                    url: decrypted,
                                    mimeType: "application/x-mpegURL",
                                    isEmbed: false,
                                    headers: { "Referer": BASE_URL + "/" }
                                });
                            }

                            return JSON.stringify({
                                url: decrypted,
                                isEmbed: true,
                                headers: { 
                                    "Referer": BASE_URL + "/",
                                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                                }
                            });
                        }
                        currentIndex++;
                    }
                }
            }
        }

        // --- DỰ PHÒNG 1: Quét trực tiếp iframe từ HTML ---
        var iframeMatch = rawContent.match(/<iframe[^>]*src=["']([^"']+)["']/i);
        if (iframeMatch) {
            var embedUrl = iframeMatch[1];
            if (embedUrl.startsWith("//")) embedUrl = "https:" + embedUrl;
            log("Fallback 1 - Found iframe: " + embedUrl);
            return JSON.stringify({ 
                url: embedUrl, 
                isEmbed: true, 
                headers: { "Referer": BASE_URL + "/" } 
            });
        }

        // --- DỰ PHÒNG 2: Quét URL Abyss / Short / Blogger trực tiếp ---
        var directUrlMatch = rawContent.match(/(https?:\/\/(?:abyssplayer\.com|abyss\.to|short\.ink|short\.icu|www\.blogger\.com)\/[^"'\s<>]+)/i);
        if (directUrlMatch) {
            var directUrl = directUrlMatch[1].replace(/https?:\/\/(short\.ink|short\.icu)\//g, "https://abyssplayer.com/");
            log("Fallback 2 - Found direct player URL: " + directUrl);
            return JSON.stringify({
                url: directUrl,
                isEmbed: true,
                headers: { "Referer": BASE_URL + "/" }
            });
        }

        // --- DỰ PHÒNG 3: Quét link file M3U8 trực tiếp ---
        var m3u8Match = rawContent.match(/(https?:\/\/[^"' ]+\.m3u8[^"' ]*)/i);
        if (m3u8Match) {
            log("Fallback 3 - Found M3U8: " + m3u8Match[1]);
            return JSON.stringify({ 
                url: m3u8Match[1], 
                mimeType: "application/x-mpegURL", 
                isEmbed: false,
                headers: { "Referer": BASE_URL + "/" }
            });
        }

        // Nếu tất cả thất bại, mở chính URL phim bằng WebView embed
        log("No stream extracted, sending raw URL to player");
        var finalFallback = url.split("?")[0];
        return JSON.stringify({ 
            url: finalFallback, 
            isEmbed: true, 
            headers: { "Referer": BASE_URL + "/" } 
        });

    } catch (e) {
        log("Error in parseDetailResponse: " + e.message);
        return JSON.stringify({ url: url, isEmbed: true });
    }
}

function parseEmbedResponse(html, sourceUrl) {
    return parseDetailResponse(html, sourceUrl);
}

// ========================================================
// HELPERS
// ========================================================

function decodeHtmlEntities(str) {
    if (!str) return "";
    return str
        .replace(/&#8211;/g, "-").replace(/&#8212;/g, "-")
        .replace(/&#8220;/g, '"').replace(/&#8221;/g, '"')
        .replace(/&#8216;/g, "'").replace(/&#8217;/g, "'")
        .replace(/&#038;/g, "&").replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ").trim();
}

function parseCategoriesResponse(html) { return "[]"; }
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }
