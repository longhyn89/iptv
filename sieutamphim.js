// ========================================================
// SIÊU TẦM PHIM VAAPP PLUGIN (Bản 1.1.6 - Bypass Cloudflare bằng Native Web Embed)
// ========================================================

const BASE_URL = "https://www.sieutamphim.pro";

function getManifest() {
    return JSON.stringify({
        "id": "sieutamphim",
        "name": "Sưu Tầm Phim",
        "version": "1.1.6",
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
    var cleanUrl = url.split("?")[0].split("#")[0];
    var match = cleanUrl.match(/\/([^\/]+)\.html$/i);
    if (match) return match[1];
    var parts = cleanUrl.split("/");
    var last = parts[parts.length - 1] || parts[parts.length - 2] || "";
    return last.replace(".html", "");
}

// ========================================================
// HOME & CATEGORIES
// ========================================================

function getHomeSections() {
    return JSON.stringify([
        { slug: "phim-bo", title: "Phim Bộ Mới", type: "Horizontal" },
        { slug: "phim-le", title: "Phim Lẻ Mới", type: "Horizontal" },
        { slug: "long-tieng", title: "Phim Lồng Tiếng", type: "Horizontal" },
        { slug: "thuyet-minh", title: "Phim Thuyết Minh", type: "Horizontal" },
        { slug: "phim-moi", title: "Mới Cập Nhật", type: "Grid" }
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
// URL BUILDERS
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
    if (!id) return BASE_URL;
    if (id.startsWith("http")) return id;
    return BASE_URL + "/" + id + ".html";
}

// ========================================================
// PARSER LIST
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
// PARSER DETAIL
// ========================================================

function parseMovieDetail(html, url) {
    try {
        var title = (html.match(/<meta property="og:title" content="([^"]+)"/i) || [])[1] || "";
        var ogImageMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i) || 
                           html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i);
        var poster = ogImageMatch ? ogImageMatch[1] : "";

        var description = (html.match(/<meta property="og:description" content="([^"]+)"/i) || [])[1] || "";
        var movieUrl = (html.match(/<meta property="og:url" content="([^"]+)"/i) || [])[1] || url;

        // Trả về 1 Server Web Direct để ép WebView phát thẳng
        return JSON.stringify({
            id: movieUrl,
            title: decodeHtmlEntities(title.replace(" - Siêu Tầm Phim", "").trim()),
            posterUrl: poster,
            backdropUrl: poster,
            description: description,
            servers: [
                {
                    name: "WEB PLAYER",
                    episodes: [
                        {
                            id: movieUrl,
                            name: "XEM PHIM",
                            slug: "full"
                        }
                    ]
                }
            ],
            quality: "HD",
            status: "Hoàn thành"
        });
    } catch (e) {
        return JSON.stringify({
            id: url,
            title: "Siêu Tầm Phim",
            servers: [
                {
                    name: "WEB PLAYER",
                    episodes: [{ id: url, name: "XEM PHIM", slug: "full" }]
                }
            ]
        });
    }
}

// ========================================================
// PARSER STREAM (WEBVUEW DIRECT)
// ========================================================

function parseDetailResponse(html, url) {
    // Trả trực tiếp URL bài viết để App dùng WebView nhúng nguyên trang web vào
    return JSON.stringify({
        url: url,
        isEmbed: true,
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36",
            "Referer": BASE_URL + "/"
        }
    });
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
