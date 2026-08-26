// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "missav",
        "name": "MissAV",
        "version": "1.1.3",
        "baseUrl": "https://missav.media",
        "referrer": "https://missav.media/",
        "iconUrl": "https://raw.githubusercontent.com/youngbi/repo/main/plugins/missav.ico",
        "isEnabled": true,
        "isAdult": true,
        "type": "MOVIE",
        "layoutType": "HORIZONTAL",
        "subtitleCat": true
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'vi/today-hot', title: 'Hot Hôm Nay', type: 'Horizontal', path: '' },
        { slug: 'vi/weekly-hot', title: 'Hot Trong Tuần', type: 'Horizontal', path: '' },
        { slug: 'vi/monthly-hot', title: 'Hot Trong Tháng', type: 'Horizontal', path: '' },
        { slug: 'vi/uncensored-leak', title: 'Không Che (Rò Rỉ)', type: 'Horizontal', path: '' },
        { slug: 'vi/release', title: 'Mới Cập Nhật', type: 'Grid', path: '' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Mới cập nhật', slug: 'vi/new' },
        { name: 'Nữ diễn viên', slug: 'vi/actresses' },
        { name: 'Thể loại', slug: 'vi/genres' },
        { name: 'Không che', slug: 'vi/uncensored-leak' },
        { name: "FC2", slug: "vi/fc2" },
        { name: "HEYZO", slug: "vi/heyzo" },
        { name: "Tokyo Hot", slug: "vi/tokyohot" },
        { name: "1pondo", slug: "vi/1pondo" },
        { name: "Caribbeancom", slug: "vi/caribbeancom" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Mới nhất', value: 'new' },
            { name: 'Xem nhiều', value: 'views' },
            { name: 'Hôm nay', value: 'today_views' },
            { name: 'Tuần này', value: 'weekly_views' },
            { name: 'Tháng này', value: 'monthly_views' }
        ],
        category: [
            { name: "Tất cả thể loại", value: "vi/genres" },
            { name: "Mới cập nhật", value: "vi/new" },
            { name: "Phát hành mới", value: "vi/release" },
            { name: "Không che (Rò rỉ)", value: "vi/uncensored-leak" },
            { name: "Nữ diễn viên", value: "vi/actresses" },
            { name: "BXH Diễn viên", value: "vi/actresses/ranking" }
        ]
    });
}

// =============================================================================
// URL GENERATION (BẮT BUỘC NỐI ?PAGE= FOR SUPEROK)
// =============================================================================

function getUrlList(slug, filtersJson) {
    var filters = {};
    try {
        filters = JSON.parse(filtersJson || "{}");
    } catch (e) {}

    // Bắt buộc lấy page, mặc định luôn là 1 nếu app gửi null/undefined
    var page = (filters && filters.page) ? filters.page : 1;
    var baseUrl = "https://missav.media";

    var pathStr = slug || "vi/new";
    if (pathStr.indexOf("/") === 0) pathStr = pathStr.substring(1);

    // Đảm bảo URL luôn được ghép ?page= đúng tham số SuperOK yêu cầu
    var url = baseUrl + "/" + pathStr;
    
    if (url.indexOf("?") !== -1) {
        if (url.indexOf("page=") === -1) {
            url += "&page=" + page;
        }
    } else {
        url += "?page=" + page;
    }

    if (filters.sort && filters.sort !== 'new' && filters.sort !== 'hot') {
        url += "&sort=" + filters.sort;
    } else if (filters.sort === 'hot') {
        url += "&sort=views";
    }

    return url;
}

function getUrlSearch(keyword, filtersJson) {
    var filters = {};
    try {
        filters = JSON.parse(filtersJson || "{}");
    } catch (e) {}
    var page = (filters && filters.page) ? filters.page : 1;
    return "https://missav.media/vi/search/" + encodeURIComponent(keyword) + "?page=" + page;
}

function getUrlDetail(slug) {
    if (slug.indexOf("http") === 0) return slug;
    if (slug.indexOf("/") === 0) return "https://missav.media" + slug;
    return "https://missav.media/" + slug;
}

function getUrlCategories() { return "https://missav.media/vi/genres"; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS
// =============================================================================

var PluginUtils = {
    normalizeHtml: function (html) {
        if (!html) return "";
        return html.replace(/class="([^"]*)"/g, function (fullMatch, classValue) {
            var normalized = classValue.replace(/missav_media-/g, '');
            return 'class="' + normalized + '"';
        });
    },
    cleanText: function (text) {
        if (!text) return "";
        return text.replace(/<[^>]*>/g, "")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/\s+/g, " ")
            .trim();
    },
    extractPreviewUrl: function (itemHtml) {
        var previewMatch = itemHtml.match(/<video[^>]+data-src="([^"]+)"/);
        var url = previewMatch ? previewMatch[1] : "";

        if (url && url.length === 36 && url.match(/^[0-9a-f-]{36}$/i)) {
            return "https://surrit.com/" + url + "/preview.mp4";
        }

        if (!url || url === "") {
            var uuidMatch = itemHtml.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
            if (uuidMatch) {
                return "https://surrit.com/" + uuidMatch[0] + "/preview.mp4";
            }
        }

        if (url && url.indexOf('//') === 0) {
            return "https:" + url;
        }

        return url;
    }
};

function parseListResponse(html) {
    html = PluginUtils.normalizeHtml(html);
    var movies = [];

    var actressLinkMatch = html.match(/href="[^"]*\/actresses\/[^"]+"/g);
    var isActressesPage = (actressLinkMatch && actressLinkMatch.length > 5);

    var isAllGenresPage = !isActressesPage &&
        html.indexOf('class="text-nord13"') !== -1 &&
        html.indexOf(':đếm video') !== -1;

    if (isActressesPage) {
        var gridMatch = html.match(/<ul[^>]*class="[^"]*grid-cols-2[^"]*"[^>]*>([\s\S]*?)<\/ul>/);
        var searchScope = gridMatch ? gridMatch[1] : html;

        var blockedNames = ["Tiếng Việt", "English", "繁體中文", "简体中文", "日本語", "한국의", "Melayu", "ไทย", "Deutsch", "Français", "Bahasa Indonesia", "Filipino", "Português", "MissAV"];
        var foundActresses = {};

        var liRegex = /<li[\s\S]*?<\/li>/gi;
        var match;

        while ((match = liRegex.exec(searchScope)) !== null) {
            var itemHtml = match[0];

            var urlMatch = itemHtml.match(/href="([^"]*\/actresses\/[^"]+)"/);
            if (!urlMatch) continue;

            var url = urlMatch[1];
            if (url.indexOf('?') !== -1) continue;

            var nameMatch = itemHtml.match(/<h4[^>]*>([\s\S]*?)<\/h4>/);
            var nameRaw = nameMatch ? nameMatch[1] : "";

            if (!nameRaw) {
                var altMatch = itemHtml.match(/<img[^>]+alt="([^"]+)"/);
                if (altMatch) nameRaw = altMatch[1];
            }

            var name = PluginUtils.cleanText(nameRaw);
            if (!name || name.length < 2 || name.indexOf(':đếm') !== -1) continue;

            var isBlocked = false;
            for (var k = 0; k < blockedNames.length; k++) {
                if (name === blockedNames[k]) { isBlocked = true; break; }
            }
            if (isBlocked) continue;

            var imgMatch = itemHtml.match(/<img[^>]+src="([^"]+)"/);
            var img = imgMatch ? imgMatch[1] : "";

            if (img.indexOf('flag') !== -1 || img.indexOf('icon') !== -1) img = "";

            var slug = url.replace(/https?:\/\/[^\/]+/, "");
            if (slug.indexOf("/") !== 0) slug = "/" + slug;

            if (!foundActresses[slug]) {
                movies.push({
                    id: slug,
                    title: name,
                    posterUrl: img,
                    backdropUrl: img,
                    description: "Nữ diễn viên",
                    type: "FOLDER",
                    quality: "ACTRESS",
                    episode_current: "",
                    lang: ""
                });
                foundActresses[slug] = true;
            }
        }
    } else if (isAllGenresPage) {
        var genreRegex = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
        var foundSlugs = {};
        var match;

        while ((match = genreRegex.exec(html)) !== null) {
            var url = match[1];
            var innerContent = match[2];

            if (url.indexOf('/genres/') !== -1 && innerContent.indexOf(':đếm video') === -1) {
                var name = PluginUtils.cleanText(innerContent);
                if (!name || name.length < 2) continue;

                var slug = url.replace(/https?:\/\/[^\/]+/, "");
                if (slug.indexOf("/") !== 0) slug = "/" + slug;

                if (!foundSlugs[slug]) {
                    movies.push({
                        id: slug,
                        title: name,
                        posterUrl: "",
                        backdropUrl: "",
                        description: "Thể loại",
                        type: "FOLDER",
                        quality: "CAT",
                        episode_current: "",
                        lang: ""
                    });
                    foundSlugs[slug] = true;
                }
            }
        }
    }

    if (movies.length === 0) {
        var parts = html.split('thumbnail group');
        if (parts.length <= 1) parts = html.split('class="thumbnail');

        for (var i = 1; i < parts.length; i++) {
            var itemHtml = parts[i];

            var fullLinkMatch = itemHtml.match(/<a[^>]+href="([^"]+)"/);
            if (!fullLinkMatch) continue;

            var fullUrl = fullLinkMatch[1];
            var slug = fullUrl.replace(/https?:\/\/[^\/]+/, "");
            if (slug.indexOf("/") !== 0) slug = "/" + slug;

            var codeMatch = itemHtml.match(/class="[^"]*text-nord13[^"]*"[^>]*>([\s\S]*?)<\/a>/);
            var code = codeMatch ? PluginUtils.cleanText(codeMatch[1]) : "";

            if (!code && slug) {
                var slugParts = slug.split("/");
                code = slugParts[slugParts.length - 1];
            }

            var titleCandidates = [];
            var imgFullMatch = itemHtml.match(/<img[^>]+(?:alt|title)="([^"]+)"/i);
            if (imgFullMatch) titleCandidates.push(PluginUtils.cleanText(imgFullMatch[1]));

            var bestTitle = titleCandidates.length > 0 ? titleCandidates[0] : code;
            var cleanTitle = bestTitle || code || "No Title";

            var thumbMatch = itemHtml.match(/<img[\s\S]*?data-src="([^"]+)"/) ||
                itemHtml.match(/<img[\s\S]*?src="([^"]+)"/);
            var thumb = thumbMatch ? thumbMatch[1] : "";

            if (thumb && thumb.indexOf("cover-t.jpg") !== -1) {
                thumb = thumb.replace("/cover-t.jpg", "/cover.jpg");
            }

            if (slug && !slug.includes("actresses") && !slug.includes("genres")) {
                if (slug.indexOf('item.') !== -1 || slug.indexOf('{{') !== -1 || slug === "/" || slug === "#") continue;

                var durationMatch = itemHtml.match(/<span[^>]*>\s*(\d+:\d+:\d+|\d+:\d+)\s*<\/span>/);
                var duration = durationMatch ? durationMatch[1] : "";

                var isUncensored = itemHtml.indexOf("Không kiểm duyệt") !== -1 ||
                    itemHtml.indexOf("Uncensored") !== -1;

                var previewUrl = PluginUtils.extractPreviewUrl(itemHtml);

                movies.push({
                    id: slug,
                    title: cleanTitle,
                    posterUrl: thumb,
                    backdropUrl: thumb,
                    description: duration,
                    type: "MOVIE",
                    quality: isUncensored ? "K.K.Duyệt" : "HD",
                    episode_current: isUncensored ? "K.K.Duyệt" : "Full",
                    lang: code,
                    previewUrl: previewUrl
                });
            }
        }
    }

    var totalPages = 1;
    var currentPage = 1;

    var currentMatch = html.match(/<span[^>]+class="[^"]*(?:bg-nord8|active|current)[^"]*"[^>]*>\s*(\d+)\s*<\/span>/i) ||
        html.match(/<a[^>]+class="[^"]*(?:bg-nord8|active|current)[^"]*"[^>]*>\s*(\d+)\s*<\/a>/i);

    if (currentMatch) currentPage = parseInt(currentMatch[1]);

    var allPageNums = html.match(/page=(\d+)/g);
    if (allPageNums) {
        for (var j = 0; j < allPageNums.length; j++) {
            var p = parseInt(allPageNums[j].match(/\d+/)[0]);
            if (p > totalPages) totalPages = p;
        }
    }

    return JSON.stringify({
        items: movies,
        pagination: {
            currentPage: currentPage,
            totalPages: totalPages || 1,
            totalItems: movies.length,
            itemsPerPage: 20
        }
    });
}

function parseSearchResponse(html) { return parseListResponse(html); }

function parseMovieDetail(html, pageUrl) {
    html = PluginUtils.normalizeHtml(html);
    try {
        var title = PluginUtils.cleanText(html.match(/<title>([^<]+)<\/title>/i)?.[1] || "");
        var thumb = html.match(/property="og:image"\s+content="([^"]+)"/i)?.[1] || "";
        var desc = html.match(/property="og:description"\s+content="([^"]+)"/i)?.[1] || "";

        var streamUrl = "";
        var uuid = "";

        var surritMatch = html.match(/surrit\.com\/([0-9a-f-]{36})/i) ||
            html.match(/sixyik\.com\/([0-9a-f-]{36})/i) ||
            html.match(/fourhoi\.com\/([0-9a-f-]{36})/i);
        if (surritMatch) uuid = surritMatch[1];

        if (!uuid) {
            var uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
            var matches = html.match(uuidRegex) || [];
            if (matches.length > 0) uuid = matches[0];
        }

        if (uuid) {
            streamUrl = "https://surrit.com/" + uuid + "/playlist.m3u8";
        }

        var servers = [];
        if (streamUrl) {
            servers.push({
                name: "Server Vip",
                episodes: [{
                    id: streamUrl,
                    name: "Full HD",
                    slug: "full"
                }]
            });
        }

        return JSON.stringify({
            id: pageUrl || "",
            title: title,
            posterUrl: thumb,
            backdropUrl: thumb,
            description: desc,
            servers: servers,
            quality: "HD",
            lang: "Vietsub",
            year: 2026,
            rating: 0
        });
    } catch (e) {
        return "null";
    }
}

function parseDetailResponse(html) {
    var streamUrl = "";
    var uuidMatch = html.match(/surrit\.com\/([0-9a-f-]{36})/i) ||
        html.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);

    if (uuidMatch) {
        streamUrl = "https://surrit.com/" + uuidMatch[1] + "/playlist.m3u8";
    }

    return JSON.stringify({
        url: streamUrl,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://missav.media/",
            "Origin": "https://missav.media"
        },
        subtitles: []
    });
}

function parseCategoriesResponse(html) { return "[]"; }
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
