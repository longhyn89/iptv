// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "missav",
        "name": "MissAV",
        "version": "1.3.0",
        "baseUrl": "https://missav.media",
        "referrer": "https://missav123.com/",
        "iconUrl": "https://raw.githubusercontent.com/youngbi/repo/main/plugins/missav.ico",
        "isEnabled": true,
        "isAdult": true,
        "type": "MOVIE",
        "layoutType": "GRID",
        "subtitleCat": true
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'today-hot', title: 'Hot Hôm Nay', type: 'Horizontal', path: '' },
        { slug: 'weekly-hot', title: 'Hot Trong Tuần', type: 'Horizontal', path: '' },
        { slug: 'monthly-hot', title: 'Hot Trong Tháng', type: 'Horizontal', path: '' },
        { slug: 'uncensored-leak', title: 'Không Che (Rò Rỉ)', type: 'Horizontal', path: '' },
        { slug: 'release', title: 'Mới Cập Nhật', type: 'Grid', path: '' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Mới cập nhật', slug: 'new' },
        { name: 'Nữ diễn viên', slug: 'actresses' },
        { name: 'Thể loại', slug: 'genres' },
        { name: 'Không che', slug: 'uncensored-leak' },
        { name: "FC2", slug: "fc2" },
        { name: "HEYZO", slug: "heyzo" },
        { name: "Tokyo Hot", slug: "tokyohot" },
        { name: "1pondo", slug: "1pondo" },
        { name: "Caribbeancom", slug: "caribbeancom" },
        { name: "Caribbeancompr", slug: "caribbeancompr" },
        { name: "10musume", slug: "10musume" },
        { name: "pacopacomama", slug: "pacopacomama" },
        { name: "Gachinco", slug: "gachinco" },
        { name: "XXX-AV", slug: "xxx-av" },
        { name: "MarriedSlash", slug: "marriedslash" },
        { name: "Naughty4610", slug: "naughty4610" },
        { name: "Naughty0930", slug: "naughty0930" }
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
            { name: "Tất cả thể loại", value: "genres" },
            { name: "Mới cập nhật", value: "new" },
            { name: "Phát hành mới", value: "release" },
            { name: "Không che (Rò rỉ)", value: "uncensored-leak" },
            { name: "Nữ diễn viên", value: "actresses" },
            { name: "BXH Diễn viên", value: "actresses/ranking" },
            { name: "Nhà sản xuất", value: "makers" },
            { name: "VR", value: "genres/VR" },
            { name: "Xem nhiều hôm nay", value: "today-hot" },
            { name: "Xem nhiều tuần", value: "weekly-hot" },
            { name: "Xem nhiều tháng", value: "monthly-hot" },
            { name: "Phụ đề Anh", value: "english-subtitle" },
            { name: "Phụ đề China", value: "chinese-subtitle" }
        ]
    });
}

// =============================================================================
// HELPER FOR PARSING PAGE
// =============================================================================

function extractPageNumber(filtersJson) {
    if (filtersJson === undefined || filtersJson === null || filtersJson === "") {
        return 1;
    }
    if (typeof filtersJson === "number") {
        return Math.max(1, Math.floor(filtersJson));
    }
    if (typeof filtersJson === "string") {
        var trimmed = filtersJson.trim();
        if (/^\d+$/.test(trimmed)) {
            return Math.max(1, parseInt(trimmed, 10));
        }
        try {
            var parsed = JSON.parse(trimmed);
            if (parsed && parsed.page) {
                return Math.max(1, parseInt(parsed.page, 10));
            }
        } catch (e) {}
    } else if (typeof filtersJson === "object") {
        if (filtersJson.page) {
            return Math.max(1, parseInt(filtersJson.page, 10));
        }
    }
    return 1;
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    var page = extractPageNumber(filtersJson);
    var sort = "";

    if (typeof filtersJson === "object" && filtersJson !== null && filtersJson.sort) {
        sort = filtersJson.sort;
    } else if (typeof filtersJson === "string") {
        try {
            var parsedObj = JSON.parse(filtersJson);
            if (parsedObj && parsedObj.sort) sort = parsedObj.sort;
        } catch (e) {}
    }

    var str = slug || "new";

    var pageFromSlug = null;
    if (str.indexOf("?") !== -1) {
        var pageMatch = str.match(/[?&]page=(\d+)/);
        if (pageMatch) {
            pageFromSlug = parseInt(pageMatch[1], 10);
        }
        str = str.split("?")[0];
    }

    if (page === 1 && pageFromSlug) {
        page = pageFromSlug;
    }

    if (str.indexOf("http") === 0) {
        str = str.replace(/^https?:\/\/[^\/]+/, "");
    }

    var cleanPath = str;
    
    var viIdx = cleanPath.indexOf("/vi/");
    if (viIdx !== -1) {
        cleanPath = cleanPath.substring(viIdx + 4);
    } else {
        cleanPath = cleanPath.replace(/^\/+/, "");
        if (cleanPath.indexOf("vi/") === 0) {
            cleanPath = cleanPath.substring(3);
        }
    }

    cleanPath = cleanPath.replace(/^\/+/, "");

    var queryParams = ["page=" + page];
    if (sort && sort !== 'new' && sort !== 'hot') {
        queryParams.push("sort=" + sort);
    } else if (sort === 'hot') {
        queryParams.push("sort=views");
    }

    return "https://missav.media/vi/" + cleanPath + "?" + queryParams.join("&");
}

function getUrlSearch(keyword, filtersJson) {
    var page = extractPageNumber(filtersJson);
    return "https://missav.media/vi/search/" + encodeURIComponent(keyword) + "?page=" + page;
}

function getUrlDetail(slug) {
    if (slug.indexOf("http") === 0) return slug;
    var cleanPath = slug;
    var viIdx = cleanPath.indexOf("/vi/");
    if (viIdx !== -1) {
        cleanPath = cleanPath.substring(viIdx + 4);
    } else {
        cleanPath = cleanPath.replace(/^\/+/, "");
        if (cleanPath.indexOf("vi/") === 0) cleanPath = cleanPath.substring(3);
    }
    return "https://missav.media/vi/" + cleanPath;
}

function getUrlCategories() { return "https://missav.media/vi/genres"; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS & UTILS
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
    toCleanId: function (url, key) {
        if (!url) return "";
        var clean = url.replace(/^https?:\/\/[^\/]+/, "");
        var idx = clean.indexOf(key + "/");
        if (idx !== -1) {
            return clean.substring(idx);
        }
        var viIdx = clean.indexOf("/vi/");
        if (viIdx !== -1) {
            return clean.substring(viIdx + 4);
        }
        return clean.replace(/^\/+/, "");
    },
    getMeta: function (html, property) {
        var regex = new RegExp('property="' + property + '"\\s+content="([^"]+)"', 'i');
        var match = html.match(regex);
        return match ? match[1] : "";
    },
    extractPreviewUrl: function (itemHtml) {
        var match = itemHtml.match(/data-preview="([^"]+)"/);
        if (match) return match[1];
        var videoMatch = itemHtml.match(/<video[^>]+src="([^"]+)"/);
        return videoMatch ? videoMatch[1] : "";
    },
    // Đã khôi phục Regex chuẩn để lấy đúng Stream UUID từ trang chi tiết
    extractStreamUuid: function (html) {
        var match = html.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
        if (match) return match[0];
        
        var sourceMatch = html.match(/sources:\s*\[\s*\{\s*src:\s*"[^"]*\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\//i);
        if (sourceMatch) return sourceMatch[1];
        
        return "";
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

    // 1. TRANG DANH SÁCH NỮ DIỄN VIÊN
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

            var rawUrl = urlMatch[1];
            if (rawUrl.indexOf('?') !== -1) continue;

            var nameMatch = itemHtml.match(/<h4[^>]*>([\s\S]*?)<\/h4>/);
            var nameRaw = nameMatch ? nameMatch[1] : "";

            if (!nameRaw) {
                var altMatch = itemHtml.match(/<img[^>]+alt="([^"]+)"/);
                if (altMatch) nameRaw = altMatch[1];
            }

            var name = PluginUtils.cleanText(nameRaw);
            if (!name || name.length < 2 || name.indexOf(':đếm') !== -1) continue;
            if (blockedNames.indexOf(name) !== -1) continue;

            var imgMatch = itemHtml.match(/<img[^>]+src="([^"]+)"/);
            var img = imgMatch ? imgMatch[1] : "";

            if (img.indexOf('flag') !== -1 || img.indexOf('icon') !== -1) img = "";

            var cleanId = PluginUtils.toCleanId(rawUrl, "actresses");
            if (cleanId.indexOf("actresses/") === -1) {
                cleanId = "actresses/" + cleanId;
            }

            if (!foundActresses[cleanId]) {
                movies.push({
                    id: cleanId,
                    title: name,
                    posterUrl: img,
                    backdropUrl: img,
                    description: "Diễn viên",
                    type: "MOVIE",
                    quality: "ACTRESS",
                    episode_current: "",
                    lang: ""
                });
                foundActresses[cleanId] = true;
            }
        }
    } 
    // 2. TRANG THỂ LOẠI
    else if (isAllGenresPage) {
        var genreRegex = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
        var foundSlugs = {};
        var match;

        while ((match = genreRegex.exec(html)) !== null) {
            var url = match[1];
            var innerContent = match[2];

            if (url.indexOf('/genres/') !== -1 && innerContent.indexOf(':đếm video') === -1) {
                var name = PluginUtils.cleanText(innerContent);
                if (!name || name.length < 2) continue;

                var cleanId = PluginUtils.toCleanId(url, "genres");
                if (cleanId.indexOf("genres/") === -1) {
                    cleanId = "genres/" + cleanId;
                }

                if (!foundSlugs[cleanId]) {
                    movies.push({
                        id: cleanId,
                        title: name,
                        posterUrl: "",
                        backdropUrl: "",
                        description: "Thể loại",
                        type: "MOVIE",
                        quality: "CAT",
                        episode_current: "",
                        lang: ""
                    });
                    foundSlugs[cleanId] = true;
                }
            }
        }
    }

    // 3. TRANG DANH SÁCH PHIM
    if (movies.length === 0) {
        var parts = html.split('thumbnail group');
        if (parts.length <= 1) parts = html.split('class="thumbnail');

        for (var i = 1; i < parts.length; i++) {
            var itemHtml = parts[i];

            var fullLinkMatch = itemHtml.match(/<a[^>]+href="([^"]+)"/);
            var slug = "";
            if (fullLinkMatch) {
                slug = PluginUtils.toCleanId(fullLinkMatch[1], "vi");
            }

            var codeMatch = itemHtml.match(/class="[^"]*text-nord13[^"]*"[^>]*>([\s\S]*?)<\/a>/);
            var code = codeMatch ? PluginUtils.cleanText(codeMatch[1]) : "";

            if (!code && slug) {
                var slugParts = slug.split("/");
                code = slugParts[slugParts.length - 1];
            }

            var titleCandidates = [];
            var imgFullMatch = itemHtml.match(/<img[^>]+(?:alt|title)="([^"]+)"/i);
            if (imgFullMatch) titleCandidates.push(PluginUtils.cleanText(imgFullMatch[1]));

            var otherTitleRegex = /title="([^"]+)"/gi;
            var tMatch;
            while ((tMatch = otherTitleRegex.exec(itemHtml)) !== null) {
                var val = PluginUtils.cleanText(tMatch[1]);
                if (val.toUpperCase() !== code.toUpperCase()) {
                    titleCandidates.push(val);
                }
            }

            var bestTitle = "";
            for (var c = 0; c < titleCandidates.length; c++) {
                if (titleCandidates[c].length > bestTitle.length) {
                    bestTitle = titleCandidates[c];
                }
            }

            var cleanTitle = bestTitle || code;
            if (code && cleanTitle.toUpperCase().indexOf(code.toUpperCase()) === 0) {
                var stripped = cleanTitle.substring(code.length).trim();
                if (stripped.indexOf("-") === 0 || stripped.indexOf(" ") === 0) {
                    stripped = stripped.substring(1).trim();
                }
                if (stripped.length > 3) cleanTitle = stripped;
            }

            if (!cleanTitle) cleanTitle = code || "No Title";

            var thumbMatch = itemHtml.match(/<img[\s\S]*?data-src="([^"]+)"/) ||
                itemHtml.match(/<img[\s\S]*?src="([^"]+)"/);
            var thumb = thumbMatch ? thumbMatch[1] : "";

            if (thumb && thumb.indexOf("cover-t.jpg") !== -1) {
                thumb = thumb.replace("/cover-t.jpg", "/cover.jpg");
            }

            if (slug && !slug.includes("actresses") && !slug.includes("genres")) {
                if (slug.indexOf('item.') !== -1 || slug.indexOf('{{') !== -1 || slug === "/" || slug === "#") continue;
                if (cleanTitle.indexOf('item.') !== -1 || cleanTitle.indexOf('{{') !== -1) continue;

                var durationMatch = itemHtml.match(/<span[^>]*>\s*(\d+:\d+(?::\d+)?)\s*<\/span>/);
                var duration = durationMatch ? durationMatch[1] : "";

                var isUncensored = itemHtml.indexOf("Không kiểm duyệt") !== -1 ||
                    itemHtml.indexOf("Uncensored") !== -1 ||
                    itemHtml.indexOf("bg-blue-800") !== -1;

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
                    previewUrl: PluginUtils.extractPreviewUrl(itemHtml)
                });
            }
        }
    }

    var totalPagesParsed = 1;
    var currentPageParsed = 1;

    var currentMatch = html.match(/<span[^>]+class="[^"]*(?:bg-nord8|active|current)[^"]*"[^>]*>\s*(\d+)\s*<\/span>/i) ||
        html.match(/<a[^>]+class="[^"]*(?:bg-nord8|active|current)[^"]*"[^>]*>\s*(\d+)\s*<\/a>/i);

    if (currentMatch) {
        currentPageParsed = parseInt(currentMatch[1], 10);
    }

    var allPageNums = html.match(/page=(\d+)/g);
    if (allPageNums) {
        for (var j = 0; j < allPageNums.length; j++) {
            var p = parseInt(allPageNums[j].match(/\d+/)[0], 10);
            if (p > totalPagesParsed) totalPagesParsed = p;
        }
    }

    return JSON.stringify({
        items: movies,
        pagination: {
            currentPage: Number(currentPageParsed || 1),
            totalPages: Number(totalPagesParsed > 1 ? totalPagesParsed : 100),
            totalItems: Number(movies.length * 50),
            itemsPerPage: Number(movies.length || 20)
        }
    });
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

// Đã khôi phục hàm lấy thông tin chi tiết đầy đủ và danh sách tập phim (episodes) chính xác
function parseMovieDetail(html, pageUrl) {
    html = PluginUtils.normalizeHtml(html);

    var title = PluginUtils.getMeta(html, "og:title");
    if (!title) {
        var h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
        title = h1Match ? PluginUtils.cleanText(h1Match[1]) : "Unknown Title";
    }

    var posterUrl = PluginUtils.getMeta(html, "og:image");
    var description = PluginUtils.getMeta(html, "og:description");

    var genres = [];
    var genreRegex = /href="[^"]*\/genres\/([^"]+)"/g;
    var match;
    while ((match = genreRegex.exec(html)) !== null) {
        var g = PluginUtils.cleanText(match[1]);
        if (g && genres.indexOf(g) === -1) {
            genres.push(g);
        }
    }

    var casts = [];
    var castRegex = /href="[^"]*\/actresses\/([^"]+)"/g;
    while ((match = castRegex.exec(html)) !== null) {
        var c = PluginUtils.cleanText(match[1]);
        if (c && casts.indexOf(c) === -1) {
            casts.push(c);
        }
    }

    var episodes = [];
    var streamUuid = PluginUtils.extractStreamUuid(html);
    
    if (streamUuid) {
        episodes.push({
            id: streamUuid,
            name: "Phần 1",
            slug: streamUuid
        });
    } else {
        episodes.push({
            id: "default_ep",
            name: "Full",
            slug: "default_ep"
        });
    }

    return JSON.stringify({
        id: pageUrl,
        title: title,
        posterUrl: posterUrl,
        backdropUrl: posterUrl,
        description: description,
        servers: [{
            name: "Vietsub / Server chính",
            episodes: episodes
        }],
        quality: "HD",
        lang: "Japanese",
        year: 2026,
        rating: 9.0,
        casts: casts.join(", "),
        director: "",
        category: genres.join(", "),
        status: "Completed",
        duration: "",
        previewUrl: ""
    });
}

// Đã khôi phục URL stream chuẩn `.m3u8` và Headers để ExoPlayer phát được video
function parseDetailResponse(html) {
    var streamUuid = PluginUtils.extractStreamUuid(html);
    var streamUrl = "";

    if (streamUuid) {
        streamUrl = "https://surrit.com/" + streamUuid + "/playlist.m3u8";
    } else {
        var m3u8Match = html.match(/https?:\/\/[^\s"'<>]+?\.m3u8[^\s"'<>*/]*/i);
        if (m3u8Match) {
            streamUrl = m3u8Match[0];
        }
    }

    return JSON.stringify({
        url: streamUrl,
        headers: {
            "Referer": "https://missav.media/",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        subtitles: []
    });
}

function parseCategoriesResponse(html) {
    html = PluginUtils.normalizeHtml(html);
    var categories = [{ name: "Tất cả thể loại", slug: "genres" }];

    var regex = /<a[^>]+href="([^"]*\/vi\/genres\/[^"]+)"[^>]*>([^<]+)<\/a>/g;
    var match;
    var seen = {};

    while ((match = regex.exec(html)) !== null) {
        var fullPath = match[1];
        var name = PluginUtils.cleanText(match[2]);

        var parts = fullPath.split("/genres/");
        var slug = parts.length > 1 ? parts[1] : "";

        if (slug && name && !seen[slug]) {
            seen[slug] = true;
            categories.push({ name: name, slug: "genres/" + slug });
        }
    }
    return JSON.stringify(categories);
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
