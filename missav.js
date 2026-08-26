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
        var previewMatch = itemHtml.match(/<video[^>]+data-src="([^"]+)"/);
        var url = previewMatch ? previewMatch[1] : "";

        if (url && url.length === 36 && url.match(/^[0-9a-f-]{36}$/i)) {
            return "https://surrit.com/" + url + "/preview.mp4";
        }

        if (!url) {
            var uuidMatch = itemHtml.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
            if (uuidMatch) {
                return "https://surrit.com/" + uuidMatch[0] + "/preview.mp4";
            }
        }

        if (url && url.indexOf('//') === 0) {
            return "https:" + url;
        }

        return url;
    },
    extractStreamUuid: function (html) {
        var uuid = "";
        
        var evalMatch = html.match(/eval\(function\(p,a,c,k,e,d\)[\s\S]*?'([^']+)'\.split\('\|'\)/i);
        if (evalMatch) {
            var parts = evalMatch[1].split('|');
            var hasSurrit = parts.indexOf('surrit') !== -1 || parts.indexOf('sixyik') !== -1 || parts.indexOf('fourhoi') !== -1;
            if (hasSurrit) {
                var uuidParts = [];
                for (var i = 0; i < parts.length; i++) {
                    if (parts[i].match(/^[0-9a-f]{8,12}$/i)) {
                        uuidParts.push(parts[i]);
                    }
                }
                if (uuidParts.length >= 5) {
                    uuid = uuidParts[0] + '-' + uuidParts[1] + '-' + uuidParts[2] + '-' + uuidParts[3] + '-' + uuidParts[4];
                }
            }
        }

        if (!uuid) {
            var match = html.match(/(?:surrit|sixyik|nineyu|fourhoi)\.com\/([0-9a-f-]{36})/i);
            if (match) uuid = match[1];
        }

        if (!uuid) {
            var uuidMatches = html.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi) || [];
            var blacklist = ["snaptrckr", "user_uuid", "popunder", "banner", "monitoring", "crypto", "randomUUID", "generateUUID"];
            
            for (var k = 0; k < uuidMatches.length; k++) {
                var cand = uuidMatches[k];
                var idx = html.indexOf(cand);
                if (idx !== -1) {
                    var ctx = html.substring(Math.max(0, idx - 80), Math.min(html.length, idx + 80));
                    var isBad = blacklist.some(function (b) { return ctx.indexOf(b) !== -1; });
                    if (!isBad) {
                        uuid = cand;
                        break;
                    }
                }
            }
        }
        return uuid;
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

function parseMovieDetail(html, pageUrl) {
    html = PluginUtils.normalizeHtml(html);
    try {
        // NẾU URL LÀ DẠNG TRANG CỦA NỮ DIỄN VIÊN / THỂ LOẠI (App cố tình gọi parseMovieDetail)
        if (pageUrl && (pageUrl.indexOf('/actresses/') !== -1 || pageUrl.indexOf('/genres/') !== -1)) {
            var parsedList = JSON.parse(parseListResponse(html));
            var items = parsedList.items || [];

            var actName = "Danh sách phim";
            var h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
            if (h1Match) actName = PluginUtils.cleanText(h1Match[1]);

            var actImg = "";
            var imgMatch = html.match(/<img[^>]+src="([^"]+)"[^>]*>/i);
            if (imgMatch) actImg = imgMatch[1];

            var episodes = [];
            for (var k = 0; k < items.length; k++) {
                episodes.push({
                    id: items[k].id,
                    name: items[k].title,
                    slug: items[k].id
                });
            }

            return JSON.stringify({
                id: pageUrl,
                title: actName,
                posterUrl: actImg,
                backdropUrl: actImg,
                description: "Danh sách " + items.length + " phim của " + actName,
                servers: [{
                    name: "Danh sách phim",
                    episodes: episodes
                }],
                quality: "HD",
                lang: "Vietsub",
                year: 2024,
                rating: 0,
                casts: actName,
                director: "",
                category: "",
                status: "Tổng cộng: " + items.length + " video",
                duration: "",
                previewUrl: ""
            });
        }

        // BÓC TÁCH CHI TIẾT VIDEO PHIM BÌNH THƯỜNG
        var getField = function (labelKey) {
            var regex = new RegExp("<span>" + labelKey + ":<\\/span>([\\s\\S]*?)<\\/div>", "i");
            var match = html.match(regex);
            return match ? PluginUtils.cleanText(match[1]) : "";
        };

        var getMultiField = function (labelKey) {
            var regexStart = new RegExp("<span>" + labelKey + ":<\\/span>", "i");
            var matchStart = html.match(regexStart);
            if (!matchStart) return "";

            var startIndex = matchStart.index + matchStart[0].length;
            var searchArea = html.substring(startIndex);
            var divEnd = searchArea.indexOf("</div>");
            if (divEnd === -1) divEnd = searchArea.length;

            var content = searchArea.substring(0, divEnd);
            var items = [];
            var linkRegex = /<a[^>]*>([^<]+)<\/a>/g;
            var linkMatch;

            while ((linkMatch = linkRegex.exec(content)) !== null) {
                var text = PluginUtils.cleanText(linkMatch[1]);
                if (text && !text.includes("<img")) {
                    items.push(text);
                }
            }
            return items.length > 0 ? items.join(", ") : PluginUtils.cleanText(content);
        };

        var code = getField("Mã số") || getField("Code");
        var releaseDate = getField("Ngày phát hành") || getField("Release date");
        var studio = getField("nhà sản xuất") || getField("Maker");
        var director = getField("Giám đốc") || getField("Director");
        var label = getField("Nhãn") || getField("Label");

        var casts = getMultiField("Nữ diễn viên") || getMultiField("Actresses");
        var genres = getMultiField("thể loại") || getMultiField("Genre") || getMultiField("Genres");
        var series = getMultiField("Loạt") || getMultiField("Series");

        if (!code) {
            var dvdIdMatch = html.match(/dvdId:\s*'([^']+)'/);
            code = dvdIdMatch ? dvdIdMatch[1] : "";
        }

        var title = PluginUtils.getMeta(html, "og:title");
        var thumb = PluginUtils.getMeta(html, "og:image");
        var desc = PluginUtils.getMeta(html, "og:description");

        var previewMatch = html.match(/<video[^>]+data-src="([^"]+)"/) || html.match(/video_url:\s*'([^']+)'/);
        var previewUrl = previewMatch ? previewMatch[1] : "";

        if (!previewUrl && thumb && thumb.indexOf("cover.jpg") !== -1) {
            previewUrl = thumb.replace("cover.jpg", "preview.mp4");
        }

        var displayTitle = title;
        if (code && displayTitle.toUpperCase().indexOf(code.toUpperCase()) === 0) {
            displayTitle = displayTitle.substring(code.length).trim();
            if (displayTitle.indexOf("-") === 0 || displayTitle.indexOf(" ") === 0) {
                displayTitle = displayTitle.substring(1).trim();
            }
        }

        if (code) {
            displayTitle = "[" + code.toUpperCase() + "] " + displayTitle;
        }

        var uuid = PluginUtils.extractStreamUuid(html);
        var streamUrl = uuid ? "https://surrit.com/" + uuid + "/playlist.m3u8" : "";

        var servers = [];
        if (streamUrl) {
            servers.push({
                name: "Stream",
                episodes: [{
                    id: pageUrl || streamUrl,
                    name: "Full",
                    slug: "full"
                }]
            });
        }

        var statusLine = "";
        if (studio) statusLine += "Studio: " + studio;
        if (label) statusLine += (statusLine ? " | " : "") + "Label: " + label;
        if (!statusLine && releaseDate) statusLine = "Released: " + releaseDate;

        var year = 2024;
        if (releaseDate) {
            var yearMatch = releaseDate.match(/(201[5-9]|202[0-9])/);
            if (yearMatch) year = parseInt(yearMatch[0], 10);
        }

        return JSON.stringify({
            id: code || "",
            title: PluginUtils.cleanText(displayTitle),
            posterUrl: thumb,
            backdropUrl: thumb,
            description: PluginUtils.cleanText(desc),
            servers: servers,
            quality: "HD",
            lang: "Vietsub",
            year: Number(year),
            rating: 0,
            casts: casts,
            director: director,
            category: genres,
            status: statusLine,
            duration: series ? "Series: " + series : "",
            previewUrl: previewUrl || ""
        });
    } catch (e) {
        return "null";
    }
}

function parseDetailResponse(html) {
    var uuid = PluginUtils.extractStreamUuid(html);
    var streamUrl = uuid ? "https://surrit.com/" + uuid + "/playlist.m3u8" : "";

    return JSON.stringify({
        url: streamUrl,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://missav123.com/",
            "Origin": "https://missav123.com"
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
