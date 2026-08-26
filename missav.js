// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "missav",
        "name": "MissAV",
        "version": "1.1.3",
        "baseUrl": "https://missav.media",
        "referrer": "https://missav123.com/",
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
        { name: "Caribbeancom", slug: "vi/caribbeancom" },
        { name: "Caribbeancompr", slug: "vi/caribbeancompr" },
        { name: "10musume", slug: "vi/10musume" },
        { name: "pacopacomama", slug: "vi/pacopacomama" },
        { name: "Gachinco", slug: "vi/gachinco" },
        { name: "XXX-AV", slug: "vi/xxx-av" },
        { name: "MarriedSlash", slug: "vi/marriedslash" },
        { name: "Naughty4610", slug: "vi/naughty4610" },
        { name: "Naughty0930", slug: "vi/naughty0930" }
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
            { name: "BXH Diễn viên", value: "vi/actresses/ranking" },
            { name: "Nhà sản xuất", value: "vi/makers" },
            { name: "VR", value: "vi/genres/VR" },
            { name: "Xem nhiều hôm nay", value: "vi/today-hot" },
            { name: "Xem nhiều tuần", value: "vi/weekly-hot" },
            { name: "Xem nhiều tháng", value: "vi/monthly-hot" },
            { name: "Phụ đề Anh", value: "vi/english-subtitle" },
            { name: "Phụ đề China", value: "vi/chinese-subtitle" },

            // Amateur
            { name: "SIRO", value: "vi/series/SIRO" },
            { name: "LUXU", value: "vi/series/LUXU" },
            { name: "GANA", value: "vi/series/GANA" },
            { name: "MAAN", value: "vi/series/MAAN" },
            { name: "S-CUTE", value: "vi/series/S-CUTE" },
            { name: "ARA", value: "vi/series/ARA" },

            // Uncensored Brands
            { name: "FC2", value: "vi/series/FC2" },
            { name: "HEYZO", value: "vi/series/HEYZO" },
            { name: "Tokyo Hot", value: "vi/series/Tokyo-Hot" },
            { name: "1pondo", value: "vi/series/1pondo" },
            { name: "Caribbeancom", value: "vi/series/Caribbeancom" },
            { name: "Caribbeancompr", value: "vi/series/Caribbeancompr" },
            { name: "10musume", value: "vi/series/10musume" },
            { name: "pacopacomama", value: "vi/series/pacopacomama" },
            { name: "Gachinco", value: "vi/series/Gachinco" },
            { name: "XXX-AV", value: "vi/series/XXX-AV" },
            { name: "MarriedSlash", value: "vi/series/MarriedSlash" },
            { name: "Naughty4610", value: "vi/series/naughty4610" },
            { name: "Naughty0930", value: "vi/series/naughty0930" }
        ]
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var baseUrl = "https://missav.media";

    var path = slug || "vi/new";

    // Bóc tách domain nếu bị lặp
    path = path.replace(/https?:\/\/[^\/]+/, "");

    // Xóa tất cả dấu / ở đầu
    while (path.length > 0 && path.indexOf("/") === 0) {
        path = path.substring(1);
    }

    // Xóa tiền tố 'vi/' nếu bị lặp lại nhiều lần
    while (path.indexOf("vi/") === 0) {
        path = path.substring(3);
    }

    // Ghép lại tiền tố vi/ duy nhất
    if (path === "vi" || path === "") {
        path = "vi/new";
    } else {
        path = "vi/" + path;
    }

    var url = baseUrl + "/" + path;

    // Xử lý tham số trang
    if (url.indexOf("?") !== -1) {
        url += "&page=" + page;
    } else {
        url += "?page=" + page;
    }

    // Xử lý bộ lọc Sắp xếp
    if (filters.sort && filters.sort !== 'new' && filters.sort !== 'hot') {
        url += "&sort=" + filters.sort;
    } else if (filters.sort === 'hot') {
        url += "&sort=views";
    }

    return url;
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    return "https://missav.media/vi/search/" + encodeURIComponent(keyword) + "?page=" + page;
}

function getUrlDetail(slug) {
    if (slug.indexOf("http") === 0) return slug;
    var path = slug;
    while (path.indexOf("/") === 0) path = path.substring(1);
    while (path.indexOf("vi/") === 0) path = path.substring(3);
    return "https://missav.media/vi/" + path;
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

    // 1. Quét danh sách Phim trước
    var parts = html.split('thumbnail group');
    if (parts.length <= 1) parts = html.split('class="thumbnail');

    if (parts.length > 1) {
        for (var i = 1; i < parts.length; i++) {
            var itemHtml = parts[i];

            var linkMatch = itemHtml.match(/<a[^>]+href="[^"]*\/vi\/([^"\/ \?]+)"/);
            var slug = linkMatch ? "vi/" + linkMatch[1] : "";

            var fullLinkMatch = itemHtml.match(/<a[^>]+href="([^"]+)"/);
            if (fullLinkMatch) {
                var fullUrl = fullLinkMatch[1];
                slug = fullUrl.replace(/https?:\/\/[^\/]+/, "");
                while (slug.indexOf("/") === 0) slug = slug.substring(1);
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

            // Chuẩn hóa slug phim
            while (slug.indexOf("vi/") === 0) slug = slug.substring(3);

            if (slug && slug.indexOf("actresses") !== 0 && slug.indexOf("genres") !== 0 && slug.indexOf("makers") !== 0) {
                if (slug.indexOf('item.') !== -1 || slug.indexOf('{{') !== -1 || slug === "vi" || slug === "") continue;
                if (cleanTitle.indexOf('item.') !== -1 || cleanTitle.indexOf('{{') !== -1) continue;

                var durationMatch = itemHtml.match(/<span[^>]*>\s*(\d+):(\d+):(\d+)\s*<\/span>/);
                var duration = durationMatch ? durationMatch[1] + ":" + durationMatch[2] + ":" + durationMatch[3] : "";

                var isUncensored = itemHtml.indexOf("Không kiểm duyệt") !== -1 ||
                    itemHtml.indexOf("Uncensored") !== -1 ||
                    itemHtml.indexOf("bg-blue-800") !== -1;

                var previewUrl = PluginUtils.extractPreviewUrl(itemHtml);

                movies.push({
                    id: slug, // ID sẽ có dạng: "ABC-123" hoặc "dm1/abc-123"
                    title: cleanTitle,
                    posterUrl: thumb,
                    backdropUrl: thumb,
                    description: duration,
                    quality: isUncensored ? "K.K.Duyệt" : "HD",
                    episode_current: isUncensored ? "K.K.Duyệt" : "Full",
                    lang: code,
                    previewUrl: previewUrl
                });
            }
        }
    }

    // 2. Nếu không có phim, kiểm tra xem có phải trang danh sách Diễn viên hoặc Thể loại tổng không
    if (movies.length === 0) {
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
                if (!name || name.length < 2) continue;
                if (name.indexOf(':đếm') !== -1) continue;

                var isBlocked = false;
                for (var k = 0; k < blockedNames.length; k++) {
                    if (name === blockedNames[k]) { isBlocked = true; break; }
                }
                if (isBlocked) continue;

                var imgMatch = itemHtml.match(/<img[^>]+src="([^"]+)"/);
                var img = imgMatch ? imgMatch[1] : "";

                if (img.indexOf('flag') !== -1 || img.indexOf('icon') !== -1) img = "";

                var slug = url.replace(/https?:\/\/[^\/]+/, "");
                while (slug.indexOf("/") === 0) slug = slug.substring(1);
                while (slug.indexOf("vi/") === 0) slug = slug.substring(3);

                if (!foundActresses[slug]) {
                    movies.push({
                        id: slug, // ID trả về đúng dạng "actresses/yua-mikami"
                        title: name,
                        posterUrl: img,
                        backdropUrl: img,
                        description: "Nữ diễn viên",
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
                    while (slug.indexOf("/") === 0) slug = slug.substring(1);
                    while (slug.indexOf("vi/") === 0) slug = slug.substring(3);

                    if (!foundSlugs[slug]) {
                        movies.push({
                            id: slug, // ID trả về đúng dạng "genres/uncensored"
                            title: name,
                            posterUrl: "",
                            backdropUrl: "",
                            description: "Thể loại",
                            quality: "CAT",
                            episode_current: "",
                            lang: ""
                        });
                        foundSlugs[slug] = true;
                    }
                }
            }
        }
    }

    var totalPages = 1;
    var currentPage = 1;

    var currentMatch = html.match(/<span[^>]+class="[^"]*(?:bg-nord8|active|current)[^"]*"[^>]*>\s*(\d+)\s*<\/span>/i) ||
        html.match(/<a[^>]+class="[^"]*(?:bg-nord8|active|current)[^"]*"[^>]*>\s*(\d+)\s*<\/a>/i);

    if (currentMatch) {
        currentPage = parseInt(currentMatch[1]);
    }

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

function parseSearchResponse(html) {
    return parseListResponse(html);
}

function parseMovieDetail(html, pageUrl) {
    html = PluginUtils.normalizeHtml(html);
    try {
        var getField = function (labelKey) {
            var regex = new RegExp("<span>" + labelKey + ":<\\/span>([\\s\\S]*?)<\\/div>", "i");
            var match = html.match(regex);
            if (!match) return "";
            return PluginUtils.cleanText(match[1]);
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

        if (code) displayTitle = "[" + code.toUpperCase() + "] " + displayTitle;

        var streamUrl = "";
        var uuid = "";

        // Strategy 1: Decode eval()
        var evalMatch = html.match(/eval\(function\(p,a,c,k,e,d\)[\s\S]*?'([^']+)'\.split\('\|'\)/i);
        if (evalMatch) {
            var parts = evalMatch[1].split('|');
            var hasSurrit = false;
            for (var ei = 0; ei < parts.length; ei++) {
                if (parts[ei] === 'surrit' || parts[ei] === 'sixyik') {
                    hasSurrit = true;
                    break;
                }
            }
            if (hasSurrit) {
                var uuidParts = [];
                for (var ei = 0; ei < parts.length; ei++) {
                    if (parts[ei].match(/^[0-9a-f]{8,12}$/)) {
                        uuidParts.push(parts[ei]);
                    }
                }
                if (uuidParts.length >= 5) {
                    uuid = uuidParts[0] + '-' + uuidParts[1] + '-' + uuidParts[2] + '-' + uuidParts[3] + '-' + uuidParts[4];
                }
            }
        }

        // Strategy 2: Direct domain scan
        if (!uuid) {
            var surritMatch = html.match(/surrit\.com\/([0-9a-f-]{36})/i) ||
                html.match(/sixyik\.com\/([0-9a-f-]{36})/i) ||
                html.match(/nineyu\.com\/([0-9a-f-]{36})/i) ||
                html.match(/fourhoi\.com\/([0-9a-f-]{36})/i);
            if (surritMatch) uuid = surritMatch[1];
        }

        // Strategy 3: Deep Scan UUID
        if (!uuid) {
            var matches = html.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi) || [];
            var blacklist = ["snaptrckr", "user_uuid", "popunder", "banner", "monitoring", "crypto", "randomUUID", "generateUUID"];

            for (var i = 0; i < matches.length; i++) {
                var u = matches[i];
                var isBad = false;
                var idx = html.indexOf(u);
                if (idx !== -1) {
                    var context = html.substring(Math.max(0, idx - 80), Math.min(html.length, idx + 80));
                    for (var j = 0; j < blacklist.length; j++) {
                        if (context.indexOf(blacklist[j]) !== -1) { isBad = true; break; }
                    }
                }
                if (!isBad) { uuid = u; break; }
            }
        }

        if (uuid) streamUrl = "https://surrit.com/" + uuid + "/playlist.m3u8";

        var servers = [];
        if (streamUrl) {
            servers.push({
                name: "Stream",
                episodes: [{ id: pageUrl || streamUrl, name: "Full", slug: "full" }]
            });
        }

        var statusLine = "";
        if (studio) statusLine += "Studio: " + studio;
        if (label) statusLine += (statusLine ? " | " : "") + "Label: " + label;

        return JSON.stringify({
            id: code || "",
            title: PluginUtils.cleanText(displayTitle),
            posterUrl: thumb,
            backdropUrl: thumb,
            description: PluginUtils.cleanText(desc),
            servers: servers,
            quality: "HD",
            lang: "Vietsub",
            year: 2024,
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
    var uuid = "";
    var streamUrl = "";

    var evalMatch = html.match(/eval\(function\(p,a,c,k,e,d\)[\s\S]*?'([^']+)'\.split\('\|'\)/i);
    if (evalMatch) {
        var parts = evalMatch[1].split('|');
        var hasSurrit = false;
        for (var i = 0; i < parts.length; i++) {
            if (parts[i] === 'surrit' || parts[i] === 'sixyik') { hasSurrit = true; break; }
        }
        if (hasSurrit) {
            var uuidParts = [];
            for (var i = 0; i < parts.length; i++) {
                if (parts[i].match(/^[0-9a-f]{8,12}$/)) uuidParts.push(parts[i]);
            }
            if (uuidParts.length >= 5) {
                uuid = uuidParts[0] + '-' + uuidParts[1] + '-' + uuidParts[2] + '-' + uuidParts[3] + '-' + uuidParts[4];
            }
        }
    }

    if (!uuid) {
        var m = html.match(/surrit\.com\/([0-9a-f-]{36})/i) ||
            html.match(/sixyik\.com\/([0-9a-f-]{36})/i) ||
            html.match(/nineyu\.com\/([0-9a-f-]{36})/i) ||
            html.match(/fourhoi\.com\/([0-9a-f-]{36})/i);
        if (m) uuid = m[1];
    }

    if (!uuid) {
        var matches = html.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi) || [];
        var blacklist = ["snaptrckr", "user_uuid", "popunder", "banner", "monitoring", "crypto", "randomUUID", "generateUUID"];
        for (var i = 0; i < matches.length; i++) {
            var u = matches[i];
            var isBad = false;
            var idx = html.indexOf(u);
            if (idx !== -1) {
                var ctx = html.substring(Math.max(0, idx - 80), Math.min(html.length, idx + 80));
                for (var j = 0; j < blacklist.length; j++) {
                    if (ctx.indexOf(blacklist[j]) !== -1) { isBad = true; break; }
                }
            }
            if (!isBad) { uuid = u; break; }
        }
    }

    if (uuid) streamUrl = "https://surrit.com/" + uuid + "/playlist.m3u8";

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
    var categories = [];
    categories.push({ name: "Tất cả thể loại", slug: "vi/genres" });

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
            categories.push({ name: name, slug: "vi/genres/" + slug });
        }
    }
    return JSON.stringify(categories);
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
