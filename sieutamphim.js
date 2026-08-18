// ========================================================
// SIÊU TẦM PHIM VAAPP PLUGIN (Bản 1.1.5 - Fix Triệt Để Lỗi Kết Nối Server)
// ========================================================

const BASE_URL = "https://www.sieutamphim.pro";

// ========================================================
// CONFIGURATION & METADATA
// ========================================================

function getManifest() {
    return JSON.stringify({
        "id": "sieutamphim",
        "name": "Sưu Tầm Phim",
        "version": "1.1.5",
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
    
    // Nếu là ID stream đã xử lý, trả về nguyên mẫu để player nhận dạng
    if (id.startsWith("play-")) {
        return id.replace("play-", "");
    }
    
    if (id.startsWith("http")) {
        return id;
    }
    
    return BASE_URL + "/" + id + ".html";
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
    // Tránh parse lại khi URL là link stream
    if (url && (url.includes("play-") || url.includes("server="))) {
        return JSON.stringify({ id: url, servers: [] });
    }
    try {
        var title = (html.match(/<meta property="og:title" content="([^"]+)"/i) || [])[1] || "";
        var ogImageMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i) || 
                           html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i) ||
                           html.match(/<meta[^>]+name="twitter:image"[^>]+content="([^"]+)"/i);
        var poster = ogImageMatch ? ogImageMatch[1] : "";
        
        if (!poster) {
            var fallbackImgMatch = html.match(/<img[^>]+(?:src|data-src)="([^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/i);
            if (fallbackImgMatch) poster = fallbackImgMatch[1];
        }
        
        var description = (html.match(/<meta property="og:description" content="([^"]+)"/i) || [])[1] || "";
        var movieUrl = (html.match(/<meta property="og:url" content="([^"]+)"/i) || [])[1] || url;

        var servers = [];
        var usedServer = {};

        // Quét tất cả các server được định nghĩa
        var groupRegex = /data-server=['"]([^'"]+)['"]/gi;
        var m;

        while ((m = groupRegex.exec(html)) !== null) {
            var serverId = m[1];
            if (usedServer[serverId]) continue;
            usedServer[serverId] = true;

            var epBlockRegex = new RegExp('data-server=["\']' + serverId + '["\'][\\s\\S]*?data-episodes=([\'"])([\\s\\S]*?)\\1', "i");
            var epBlockMatch = html.match(epBlockRegex);

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
                    // Truyền thẳng URL HTML gốc kèm tham số để parseDetailResponse tự giải mã
                    id: "play-" + movieUrl + "#server=" + encodeURIComponent(serverId) + "&tap=" + j,
                    name: epCount === 1 ? "Full" : "Tập " + j,
                    slug: "tap-" + j
                });
            }

            servers.push({
                name: serverId.toUpperCase(),
                episodes: episodes
            });
        }

        // Dự phòng server mặc định
        if (servers.length === 0) {
            servers.push({
                name: "VIP",
                episodes: [{ id: "play-" + movieUrl, name: "Full", slug: "full" }]
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
        var defaultHeaders = {
            "Referer": BASE_URL + "/",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        };

        // 1. Giải mã link từ dữ liệu XOR 42
        if (url.includes("server=") || html.includes("data-episodes")) {
            var serverMatch = url.match(/server=([^&]+)/);
            var tapMatch = url.match(/tap=(\d+)/);
            var server = serverMatch ? serverMatch[1] : "";
            var tap = tapMatch ? parseInt(tapMatch[1], 10) : 1;

            var epBlockRegex = server ? new RegExp('data-server=["\']' + server + '["\'][\\s\\S]*?data-episodes=([\'"])([\\s\\S]*?)\\1', "i") : /data-episodes=([\'"])([\\s\\S]*?)\1/i;
            var epBlockMatch = html.match(epBlockRegex);

            if (epBlockMatch) {
                var rawEpisodes = epBlockMatch[2] || epBlockMatch[1];
                var epRegex = /{"([^"]+)","([^"]+)"}/g;
                var epMatch;
                var currentIndex = 1;

                while ((epMatch = epRegex.exec(rawEpisodes)) !== null) {
                    if (currentIndex === tap || !server) {
                        var rawSrc = epMatch[1];
                        var decrypted = "";
                        
                        for (var i = 0; i < rawSrc.length; i++) {
                            decrypted += String.fromCharCode(rawSrc.charCodeAt(i) ^ 42);
                        }
                        
                        decrypted = decrypted.replace(/https?:\/\/(short\.ink|short\.icu)\//g, "https://abyssplayer.com/");
                        log("Decrypted Stream URL: " + decrypted);

                        if (decrypted.indexOf(".m3u8") !== -1) {
                            return JSON.stringify({
                                url: decrypted,
                                mimeType: "application/x-mpegURL",
                                isEmbed: false,
                                headers: defaultHeaders
                            });
                        }

                        return JSON.stringify({
                            url: decrypted,
                            isEmbed: true,
                            headers: defaultHeaders
                        });
                    }
                    currentIndex++;
                }
            }
        }

        // 2. Tìm iframe phát trực tiếp
        var iframeMatch = html.match(/<iframe[^>]*src=["']([^"']+)["']/i);
        if (iframeMatch) {
            var embedUrl = iframeMatch[1];
            if (embedUrl.startsWith("//")) embedUrl = "https:" + embedUrl;
            log("Found direct iframe URL: " + embedUrl);
            return JSON.stringify({ 
                url: embedUrl, 
                isEmbed: true, 
                headers: defaultHeaders 
            });
        }

        // 3. Tìm link Player trực tiếp
        var directUrlMatch = html.match(/(https?:\/\/(?:abyssplayer\.com|abyss\.to|short\.ink|short\.icu|www\.blogger\.com)\/[^\s"']+)/i);
        if (directUrlMatch) {
            var directUrl = directUrlMatch[1].replace(/https?:\/\/(short\.ink|short\.icu)\//g, "https://abyssplayer.com/");
            log("Found direct Player URL: " + directUrl);
            return JSON.stringify({
                url: directUrl,
                isEmbed: true,
                headers: defaultHeaders
            });
        }

        // 4. Nếu không trích xuất được link nhúng, phát trực tiếp URL web bằng Embed WebView
        var cleanUrl = url.split("#")[0].split("?")[0];
        log("Fallback to clean URL: " + cleanUrl);
        return JSON.stringify({ 
            url: cleanUrl, 
            isEmbed: true, 
            headers: defaultHeaders 
        });

    } catch (e) {
        log("Error in parseDetailResponse: " + e.message);
        return JSON.stringify({ url: BASE_URL, isEmbed: true });
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
