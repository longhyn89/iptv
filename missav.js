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
// HELPER FUNCTIONS
// =============================================================================

function cleanSlugPath(rawPath) {
    if (!rawPath) return "new";
    var path = rawPath.replace(/https?:\/\/[^\/]+/, "");
    
    while (path.length > 0 && path.indexOf("/") === 0) {
        path = path.substring(1);
    }
    while (path.indexOf("vi/") === 0) {
        path = path.substring(3);
    }
    return path;
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var path = cleanSlugPath(slug);

    if (path === "vi" || path === "") {
        path = "vi/new";
    } else {
        path = "vi/" + path;
    }

    var url = "https://missav.media/" + path;
    
    // Đảm bảo luôn có tham số ?page=X theo chuẩn Log thành công
    if (url.indexOf("?") !== -1) {
        url += "&page=" + page;
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
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    return "https://missav.media/vi/search/" + encodeURIComponent(keyword) + "?page=" + page;
}

function getUrlDetail(slug) {
    var path = cleanSlugPath(slug);
    var url = "https://missav.media/vi/" + path;
    
    // Bổ sung ?page=1 cho cả request Detail nếu app lỡ gọi Detail vào trang Diễn viên
    if (url.indexOf("?") === -1) {
        url += "?page=1";
    }
    return url;
}

function getUrlCategories() { return "https://missav.media/vi/genres?page=1"; }
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

    // 1. Quét danh sách Phim
    var parts = html.split('thumbnail group');
    if (parts.length <= 1) parts = html.split('class="thumbnail');

    if (parts.length > 1) {
        for (var i = 1; i < parts.length; i++) {
            var itemHtml = parts[i];

            var fullLinkMatch = itemHtml.match(/<a[^>]+href="([^"]+)"/);
            var slug = fullLinkMatch ? cleanSlugPath(fullLinkMatch[1]) : "";

            var codeMatch = itemHtml.match(/class="[^"]*text-nord13[^"]*"[^>]*>([\s\S]*?)<\/a>/);
            var code = codeMatch ? PluginUtils.cleanText(codeMatch[1]) : "";

            if (!code && slug) {
                var slugParts = slug.split("/");
                code = slugParts[slugParts.length - 1];
            }

            var imgFullMatch = itemHtml.match(/<img[^>]+(?:alt|title)="([^"]+)"/i);
            var titleCandidate = imgFullMatch ? PluginUtils.cleanText(imgFullMatch[1]) : code;

            var thumbMatch = itemHtml.match(/<img[\s\S]*?data-src="([^"]+)"/) ||
                itemHtml.match(/<img[\s\S]*?src="([^"]+)"/);
            var thumb = thumbMatch ? thumbMatch[1] : "";

            if (thumb && thumb.indexOf("cover-t.jpg") !== -1) {
                thumb = thumb.replace("/cover-t.jpg", "/cover.jpg");
            }

            if (slug && slug.indexOf("actresses") !== 0 && slug.indexOf("genres") !== 0 && slug.indexOf("makers") !== 0) {
                var durationMatch = itemHtml.match(/<span[^>]*>\s*(\d+):(\d+):(\d+)\s*<\/span>/);
                var duration = durationMatch ? durationMatch[1] + ":" + durationMatch[2] + ":" + durationMatch[3] : "";

                var isUncensored = itemHtml.indexOf("Không kiểm duyệt") !== -1 || itemHtml.indexOf("Uncensored") !== -1;

                movies.push({
                    id: slug,
                    title: titleCandidate || code || "AV",
                    posterUrl: thumb,
                    backdropUrl: thumb,
                    description: duration,
                    quality: isUncensored ? "K.K.Duyệt" : "HD",
                    episode_current: isUncensored ? "K.K.Duyệt" : "Full",
                    lang: code,
                    previewUrl: PluginUtils.extractPreviewUrl(itemHtml)
                });
            }
        }
    }

    // 2. Quét danh sách Diễn viên hoặc Thể loại tổng
    if (movies.length === 0) {
        var actressLinkMatch = html.match(/href="[^"]*\/actresses\/[^"]+"/g);
        var isActressesPage = (actressLinkMatch && actressLinkMatch.length > 5);

        if (isActressesPage) {
            var gridMatch = html.match(/<ul[^>]*class="[^"]*grid-cols-2[^"]*"[^>]*>([\s\S]*?)<\/ul>/);
            var searchScope = gridMatch ? gridMatch[1] : html;

            var blockedNames = ["Tiếng Việt", "English", "繁體中文", "简体中文", "日本語", "한국의", "MissAV"];
            var foundActresses = {};
            var liRegex = /<li[\s\S]*?<\/li>/gi;
            var match;

            while ((match = liRegex.exec(searchScope)) !== null) {
                var itemHtml = match[0];
                var urlMatch = itemHtml.match(/href="([^"]*\/actresses\/[^"]+)"/);
                if (!urlMatch || urlMatch[1].indexOf('?') !== -1) continue;

                var nameMatch = itemHtml.match(/<h4[^>]*>([\s\S]*?)<\/h4>/) || itemHtml.match(/<img[^>]+alt="([^"]+)"/);
                var name = nameMatch ? PluginUtils.cleanText(nameMatch[1]) : "";
                if (!name || name.length < 2 || name.indexOf(':đếm') !== -1) continue;

                var isBlocked = false;
                for (var k = 0; k < blockedNames.length; k++) {
                    if (name === blockedNames[k]) { isBlocked = true; break; }
                }
                if (isBlocked) continue;

                var imgMatch = itemHtml.match(/<img[^>]+src="([^"]+)"/);
                var img = imgMatch ? imgMatch[1] : "";
                if (img.indexOf('flag') !== -1 || img.indexOf('icon') !== -1) img = "";

                var slug = cleanSlugPath(urlMatch[1]);

                if (!foundActresses[slug]) {
                    movies.push({
                        id: slug,
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
        } else {
            var genreRegex = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
            var foundSlugs = {};
            var match;

            while ((match = genreRegex.exec(html)) !== null) {
                var url = match[1];
                var innerContent = match[2];

                if (url.indexOf('/genres/') !== -1 && innerContent.indexOf(':đếm video') === -1) {
                    var name = PluginUtils.cleanText(innerContent);
                    if (!name || name.length < 2) continue;

                    var slug = cleanSlugPath(url);

                    if (!foundSlugs[slug]) {
                        movies.push({
                            id: slug,
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
    var currentMatch = html.match(/<span[^>]+class="[^"]*(?:bg-nord8|active|current)[^"]*"[^>]*>\s*(\d+)\s*<\/span>/i);
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

function parseSearchResponse(html) {
    return parseListResponse(html);
}

function parseMovieDetail(html, pageUrl) {
    html = PluginUtils.normalizeHtml(html);
    try {
        var isListPage = html.indexOf('thumbnail group') !== -1 || html.indexOf('class="thumbnail') !== -1;
        
        if (isListPage) {
            var listParsed = JSON.parse(parseListResponse(html));
            var items = listParsed.items || [];
            
            if (items.length > 0) {
                var pageTitle = PluginUtils.getMeta(html, "og:title") || "Danh Sách Phim";
                var pageThumb = items[0].posterUrl;

                var episodesList = [];
                for (var ep = 0; ep < items.length; ep++) {
                    episodesList.push({
                        id: "https://missav.media/vi/" + items[ep].id + "?page=1",
                        name: "[" + (items[ep].lang || "AV") + "] " + items[ep].title,
                        slug: items[ep].id
                    });
                }

                return JSON.stringify({
                    id: cleanSlugPath(pageUrl),
                    title: PluginUtils.cleanText(pageTitle),
                    posterUrl: pageThumb,
                    backdropUrl: pageThumb,
                    description: "Tìm thấy " + items.length + " phim. Chọn phim bên dưới để xem:",
                    servers: [{
                        name: "Danh Sách Phim",
                        episodes: episodesList
                    }],
                    quality: "LIST",
                    lang: "Vietsub",
                    year: 2024
                });
            }
        }

        var getField = function (labelKey) {
            var regex = new RegExp("<span>" + labelKey + ":<\\/span>([\\s\\S]*?)<\\/div>", "i");
            var match = html.match(regex);
            return match ? PluginUtils.cleanText(match[1]) : "";
        };

        var getMultiField = function (labelKey) {
            var regexStart = new RegExp("<span>" + labelKey + ":<\\/span>", "i");
            var matchStart = html.match(regexStart);
            if (!matchStart) return "";

            var searchArea = html.substring(matchStart.index + matchStart[0].length);
            var divEnd = searchArea.indexOf("</div>");
            if (divEnd === -1) divEnd = searchArea.length;

            var content = searchArea.substring(0, divEnd);
            var items = [];
            var linkRegex = /<a[^>]*>([^<]+)<\/a>/g;
            var linkMatch;
            while ((linkMatch = linkRegex.exec(content)) !== null) {
                var text = PluginUtils.cleanText(linkMatch[1]);
                if (text && !text.includes("<img")) items.push(text);
            }
            return items.length > 0 ? items.join(", ") : PluginUtils.cleanText(content);
        };

        var code = getField("Mã số") || getField("Code");
        var studio = getField("nhà sản xuất") || getField("Maker");
        var director = getField("Giám đốc") || getField("Director");
        var casts = getMultiField("Nữ diễn viên") || getMultiField("Actresses");
        var genres = getMultiField("thể loại") || getMultiField("Genre") || getMultiField("Genres");

        if (!code) {
            var dvdIdMatch = html.match(/dvdId:\s*'([^']+)'/);
            code = dvdIdMatch ? dvdIdMatch[1] : "";
        }

        var title = PluginUtils.getMeta(html, "og:title");
        var thumb = PluginUtils.getMeta(html, "og:image");
        var desc = PluginUtils.getMeta(html, "og:description");

        var previewMatch = html.match(/<video[^>]+data-src="([^"]+)"/) || html.match(/video_url:\s*'([^']+)'/);
        var previewUrl = previewMatch ? previewMatch[1] : "";

        var displayTitle = title;
        if (code && displayTitle.toUpperCase().indexOf(code.toUpperCase()) === 0) {
            displayTitle = displayTitle.substring(code.length).trim();
            if (displayTitle.indexOf("-") === 0 || displayTitle.indexOf(" ") === 0) {
                displayTitle = displayTitle.substring(1).trim();
            }
        }
        if (code) displayTitle = "[" + code.toUpperCase() + "] " + displayTitle;

        var uuid = "";
        var surritMatch = html.match(/surrit\.com\/([0-9a-f-]{36})/i) ||
            html.match(/sixyik\.com\/([0-9a-f-]{36})/i) ||
            html.match(/nineyu\.com\/([0-9a-f-]{36})/i) ||
            html.match(/fourhoi\.com\/([0-9a-f-]{36})/i);
        
        if (surritMatch) {
            uuid = surritMatch[1];
        } else {
            var matches = html.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi) || [];
            if (matches.length > 0) uuid = matches[0];
        }

        var streamUrl = uuid ? "https://surrit.com/" + uuid + "/playlist.m3u8" : "";

        var servers = [];
        if (streamUrl) {
            servers.push({
                name: "Stream",
                episodes: [{ id: pageUrl || streamUrl, name: "Full", slug: "full" }]
            });
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
            year: 2024,
            rating: 0,
            casts: casts,
            director: director,
            category: genres,
            status: studio ? "Studio: " + studio : "",
            previewUrl: previewUrl || ""
        });
    } catch (e) {
        return "null";
    }
}

function parseDetailResponse(html) {
    var uuid = "";
    var surritMatch = html.match(/surrit\.com\/([0-9a-f-]{36})/i) ||
        html.match(/sixyik\.com\/([0-9a-f-]{36})/i) ||
        html.match(/nineyu\.com\/([0-9a-f-]{36})/i) ||
        html.match(/fourhoi\.com\/([0-9a-f-]{36})/i);

    if (surritMatch) {
        uuid = surritMatch[1];
    } else {
        var matches = html.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi) || [];
        if (matches.length > 0) uuid = matches[0];
    }

    var streamUrl = uuid ? "https://surrit.com/" + uuid + "/playlist.m3u8" : "";

    // Sửa Header chuẩn theo Request thành công từ HTTP Toolkit để xử lý dứt điểm lỗi 403
    return JSON.stringify({
        url: streamUrl,
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
            "Referer": "https://missav.media/",
            "Origin": "https://missav.media",
            "Accept": "*/*",
            "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7"
        },
        subtitles: []
    });
}

function parseCategoriesResponse(html) {
    html = PluginUtils.normalizeHtml(html);
    var categories = [{ name: "Tất cả thể loại", slug: "vi/genres?page=1" }];

    var regex = /<a[^>]+href="([^"]*\/vi\/genres\/[^"]+)"[^>]*>([^<]+)<\/a>/g;
    var match;
    var seen = {};

    while ((match = regex.exec(html)) !== null) {
        var name = PluginUtils.cleanText(match[2]);
        var slug = cleanSlugPath(match[1]);

        if (slug && name && !seen[slug]) {
            seen[slug] = true;
            categories.push({ name: name, slug: slug });
        }
    }
    return JSON.stringify(categories);
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
