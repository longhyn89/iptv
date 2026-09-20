// =============================================================================
// VAAPP Plugin - xNhau
// Ho tro nguon xNhau (xnhau.art / xnhau.city)
// Tuong thich SmartTube / Rhino Engine
// =============================================================================

var BASEURL = "https://xnhau.art";

function getManifest() {
    return JSON.stringify({
        "id": "xnhau",
        "name": "xNhau (ALL)",
        "description": "Kho clip và phim xNhau hot nhất, cập nhật liên tục.",
        "info": "Nguồn phim xNhau chất lượng cao HD/FHD.",
        "version": "1.0.8",
        "baseUrl": "https://xnhau.art",
        "iconUrl": "https://raw.githubusercontent.com/hieu-TQS/movie-SuperOK/refs/heads/main/icons/xnhau.png",
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "playerType": "auto"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { "slug": "/movies", "title": "Hàng Mới", "type": "Grid" },
        { "slug": "/movies?sort=popular", "title": "Phổ Biến", "type": "Horizontal" },
        { "slug": "/movies?sort=trending", "title": "Xu Hướng", "type": "Horizontal" },
        { "slug": "/category/tu-quay", "title": "Tự Quay", "type": "Horizontal" },
        { "slug": "/category/viet-nam", "title": "Việt Nam", "type": "Horizontal" },
        { "slug": "/category/phim-sex-sinh-vien", "title": "Sinh Viên", "type": "Horizontal" },
        { "slug": "/category/cap3", "title": "Cấp 3", "type": "Horizontal" },
        { "slug": "/category/viet69", "title": "Viet69", "type": "Horizontal" },
        { "slug": "/category/clip-hot", "title": "Clip Hot", "type": "Horizontal" },
        { "slug": "/category/heovl", "title": "HeoVL", "type": "Horizontal" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { "slug": "tu-quay", "name": "Tự Quay" },
        { "slug": "viet-nam", "name": "Việt Nam" },
        { "slug": "phim-sex-sinh-vien", "name": "Sinh Viên" },
        { "slug": "cap3", "name": "Cấp 3" },
        { "slug": "clip-hot", "name": "Clip Hot" },
        { "slug": "cliphotvn", "name": "Clip Hot VN" },
        { "slug": "viet69", "name": "Viet69" },
        { "slug": "viet3x", "name": "Viet3x" },
        { "slug": "heovl", "name": "HeoVL" },
        { "slug": "phimconheo", "name": "Phim Con Heo" },
        { "slug": "phimheovip", "name": "Phim Heo VIP" },
        { "slug": "mobiblog", "name": "Mobiblog" },
        { "slug": "jpxnx", "name": "JPXNX" },
        { "slug": "xvideos98", "name": "Xvideos98" },
        { "slug": "xxdem", "name": "XX Đêm" },
        { "slug": "phimsexvn", "name": "Phim Sex VN" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        "sort": [
            { "name": "Mới nhất", "value": "" },
            { "name": "Phổ biến", "value": "popular" },
            { "name": "Xu hướng", "value": "trending" },
            { "name": "Cũ nhất", "value": "oldest" },
            { "name": "Tiêu đề A-Z", "value": "title_asc" },
            { "name": "Tiêu đề Z-A", "value": "title_desc" }
        ],
        "category": [
            { "slug": "all", "name": "Tất cả thể loại" },
            { "slug": "tu-quay", "name": "Tự Quay" },
            { "slug": "viet-nam", "name": "Việt Nam" },
            { "slug": "phim-sex-sinh-vien", "name": "Sinh Viên" },
            { "slug": "cap3", "name": "Cấp 3" },
            { "slug": "clip-hot", "name": "Clip Hot" },
            { "slug": "cliphotvn", "name": "Clip Hot VN" },
            { "slug": "viet69", "name": "Viet69" },
            { "slug": "viet3x", "name": "Viet3x" },
            { "slug": "heovl", "name": "HeoVL" },
            { "slug": "phimconheo", "name": "Phim Con Heo" },
            { "slug": "phimheovip", "name": "Phim Heo VIP" },
            { "slug": "mobiblog", "name": "Mobiblog" },
            { "slug": "jpxnx", "name": "JPXNX" },
            { "slug": "xvideos98", "name": "Xvideos98" },
            { "slug": "xxdem", "name": "XX Đêm" },
            { "slug": "phimsexvn", "name": "Phim Sex VN" }
        ]
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        if (slug && slug.indexOf("http") === 0) {
            return slug;
        }

        var page = 1;
        var sort = "";
        var cat = "";

        if (filtersJson) {
            var fixedJson = typeof filtersJson === 'string'
                ? filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':')
                : JSON.stringify(filtersJson);
            try {
                var filters = JSON.parse(fixedJson);
                page = parseInt(filters.page) || 1;
                if (filters.sort) sort = filters.sort;
                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) {
                        cat = filters.category[0].slug;
                    } else if (typeof filters.category === 'string') {
                        cat = filters.category;
                    }
                }
            } catch (jsonErr) {}
        }

        var targetPath = slug || "/movies";
        
        if (cat && cat !== "all") {
            targetPath = cat;
        }

        if (targetPath.indexOf("/") === -1 && targetPath !== "movies" && targetPath !== "search") {
            targetPath = "/category/" + targetPath;
        }

        if (targetPath.indexOf("/") !== 0) {
            targetPath = "/" + targetPath;
        }

        var fullUrl = BASEURL + targetPath;
        var queryParams = [];

        if (sort && fullUrl.indexOf("sort=") === -1) {
            queryParams.push("sort=" + encodeURIComponent(sort));
        }
        if (page > 1 && fullUrl.indexOf("page=") === -1) {
            queryParams.push("page=" + page);
        }

        if (queryParams.length > 0) {
            var sep = fullUrl.indexOf("?") === -1 ? "?" : "&";
            fullUrl += sep + queryParams.join("&");
        }

        return fullUrl;
    } catch (e) {
        return BASEURL + (slug || "/movies");
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
    var url = BASEURL + "/search?q=" + encodeURIComponent(keyword || "");
    if (page > 1) {
        url += "&page=" + page;
    }
    return url;
}

function getSearchUrl(keyword, page) {
    var p = page || 1;
    var url = BASEURL + "/search?q=" + encodeURIComponent(keyword || "");
    if (p > 1) {
        url += "&page=" + p;
    }
    return url;
}

function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.indexOf("http") === 0) return slug;
    if (slug.indexOf("/") === 0) return BASEURL + slug;
    return BASEURL + "/watch/" + slug;
}

function getDetailUrl(slug) {
    return getUrlDetail(slug);
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS
// =============================================================================

function cleanText(str) {
    if (!str) return "";
    return str
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

// Kiểm tra chuỗi có phải là định dạng thời gian (ví dụ: 10:00, 01:20:15) không
function isTimeString(str) {
    if (!str) return false;
    return /^\d{1,2}:\d{2}(:\d{2})?$/.test(str.trim());
}

function parseListResponse(html, url) {
    try {
        var itemsMap = {};
        var itemKeys = [];

        var itemRegex = /<a\s+[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
        var match;

        while ((match = itemRegex.exec(html)) !== null) {
            var href = match[1];
            
            if (!href || href === "/" || href === "#" || href.indexOf("/category/") !== -1 || href.indexOf("page=") !== -1 || href.indexOf("javascript:") !== -1) {
                continue;
            }

            var fullA = match[0];
            var inner = match[2];

            // 1. Trích xuất Thumbnail
            var imgMatch = inner.match(/<img[^>]+(?:src|data-src|data-original|data-lazy-src)="([^"]+)"/i);
            var posterUrl = "";
            if (imgMatch && imgMatch[1]) {
                posterUrl = imgMatch[1];
                if (posterUrl.indexOf("/") === 0) {
                    posterUrl = BASEURL + posterUrl;
                }
            }

            // 2. Trích xuất Tiêu đề
            var extractedTitle = "";

            var titleAttr = fullA.match(/title="([^"]+)"/i) || inner.match(/alt="([^"]+)"/i);
            if (titleAttr && titleAttr[1] && titleAttr[1].trim() !== "" && titleAttr[1].toLowerCase() !== "thumbnail") {
                var candidateAttr = cleanText(titleAttr[1]);
                if (!isTimeString(candidateAttr)) {
                    extractedTitle = candidateAttr;
                }
            }

            if (!extractedTitle) {
                var classMatch = inner.match(/<[^>]*class="[^"]*(?:line-clamp|title|name|text-md)[^"]*"[^>]*>([\s\S]*?)<\/[^>]+>/i);
                if (classMatch && classMatch[1] && classMatch[1].trim() !== "") {
                    var candidateClass = cleanText(classMatch[1]);
                    if (!isTimeString(candidateClass)) {
                        extractedTitle = candidateClass;
                    }
                }
            }

            if (!extractedTitle) {
                var cleanInner = inner.replace(/<span[^>]*>[\s\S]*?<\/span>/gi, "").replace(/<img[^>]*>/gi, "");
                var textContent = cleanText(cleanInner);
                if (textContent && textContent.length > 2 && !isTimeString(textContent) && textContent.indexOf("lượt xem") === -1) {
                    extractedTitle = textContent;
                }
            }

            // 3. Trích xuất Thời lượng
            var viewsMatch = inner.match(/<span>([^<]*(?:lượt xem|views|\d+:\d+)[^<]*)<\/span>/i);
            var duration = viewsMatch ? viewsMatch[1].trim() : "Full HD";

            // 4. Gộp dữ liệu theo href
            if (!itemsMap[href]) {
                itemsMap[href] = {
                    "id": href,
                    "title": extractedTitle,
                    "posterUrl": posterUrl,
                    "backdropUrl": posterUrl,
                    "duration": duration,
                    "quality": "HD"
                };
                itemKeys.push(href);
            } else {
                if (!itemsMap[href].posterUrl && posterUrl) {
                    itemsMap[href].posterUrl = posterUrl;
                    itemsMap[href].backdropUrl = posterUrl;
                }
                if ((!itemsMap[href].title || itemsMap[href].title === "" || isTimeString(itemsMap[href].title)) && extractedTitle) {
                    itemsMap[href].title = extractedTitle;
                }
            }
        }

        var items = [];
        for (var i = 0; i < itemKeys.length; i++) {
            var item = itemsMap[itemKeys[i]];
            if (item.posterUrl) {
                if (!item.title || item.title.trim() === "" || isTimeString(item.title)) {
                    item.title = "Video xNhau";
                }
                items.push(item);
            }
        }

        var totalPages = 99;
        var pageMatches = html.match(/page=(\d+)/g);
        if (pageMatches) {
            for (var p = 0; p < pageMatches.length; p++) {
                var num = parseInt(pageMatches[p].replace("page=", ""));
                if (num > totalPages) {
                    totalPages = num;
                }
            }
        }

        return JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": 1,
                "totalPages": totalPages
            }
        });
    } catch (e) {
        return JSON.stringify({
            "items": [],
            "pagination": { "currentPage": 1, "totalPages": 1 }
        });
    }
}

function parseList(html, url) {
    return parseListResponse(html, url);
}

function parseHomeResponse(html, url) {
    return parseListResponse(html, url);
}

function parseSearchResult(html, url) {
    return parseListResponse(html, url);
}

function parseSearchResponse(html, url) {
    return parseListResponse(html, url);
}

function extractStreamUrl(html) {
    var sourceMatch = html.match(/<source[^>]+src="([^"]+)"/i);
    if (sourceMatch && sourceMatch[1]) {
        var src = sourceMatch[1];
        if (src.indexOf("/") === 0) src = BASEURL + src;
        return src;
    }

    var iframeMatch = html.match(/<iframe[^>]+src="([^"]+)"/i);
    if (iframeMatch && iframeMatch[1]) {
        var ifSrc = iframeMatch[1];
        if (ifSrc.indexOf("http") === 0) return ifSrc;
    }

    var streamsMatch = html.match(/"streams":\[1,\[\[0,\{([^}]+)\}\]\]\]/);
    if (streamsMatch && streamsMatch[1]) {
        var sBlock = streamsMatch[1];
        var m3u8Match = sBlock.match(/"m3u8_url":\[0,"([^"]+)"\]/);
        var mediaMatch = sBlock.match(/"m3u8_media_url":\[0,"([^"]+)"\]/);
        var embedMatch = sBlock.match(/"embed_url":\[0,"([^"]+)"\]/);

        if (m3u8Match && m3u8Match[1] && m3u8Match[1] !== "null") {
            var mUrl = m3u8Match[1];
            if (mUrl.indexOf("/") === 0) mUrl = BASEURL + mUrl;
            return mUrl;
        }
        if (mediaMatch && mediaMatch[1] && mediaMatch[1] !== "null") {
            var medUrl = mediaMatch[1];
            if (medUrl.indexOf("/") === 0) medUrl = BASEURL + medUrl;
            return medUrl;
        }
        if (embedMatch && embedMatch[1] && embedMatch[1] !== "null") {
            return embedMatch[1];
        }
    }

    var directM3u8 = html.match(/(https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/i) ||
                     html.match(/(\/media\/files\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/i);
    if (directM3u8 && directM3u8[1]) {
        var dUrl = directM3u8[1];
        if (dUrl.indexOf("/") === 0) dUrl = BASEURL + dUrl;
        return dUrl;
    }

    return "";
}

function parseMovieDetail(html, url) {
    try {
        var title = "xNhau Video";
        var h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        if (h1Match && h1Match[1]) {
            title = cleanText(h1Match[1]);
        } else {
            var ogTitle = html.match(/property="og:title"\s+content="([^"]+)"/i);
            if (ogTitle && ogTitle[1]) {
                title = cleanText(ogTitle[1]);
            }
        }

        var posterUrl = "";
        var ogImg = html.match(/property="og:image"\s+content="([^"]+)"/i);
        if (ogImg && ogImg[1]) {
            posterUrl = ogImg[1];
            if (posterUrl.indexOf("/") === 0) posterUrl = BASEURL + posterUrl;
        }

        var description = "";
        var ogDesc = html.match(/property="og:description"\s+content="([^"]+)"/i);
        if (ogDesc && ogDesc[1]) {
            description = cleanText(ogDesc[1]);
        }

        var catMatches = html.match(/<a[^>]+href="\/category\/[^"]*"[^>]*>([\s\S]*?)<\/a>/gi);
        var categories = [];
        var seenCat = {};
        if (catMatches) {
            for (var c = 0; c < catMatches.length; c++) {
                var cName = cleanText(catMatches[c]);
                if (cName && !seenCat[cName]) {
                    seenCat[cName] = true;
                    categories.push(cName);
                }
            }
        }
        var categoryStr = categories.join(", ");

        var streamUrl = extractStreamUrl(html);

        var episodes = [];
        if (streamUrl) {
            episodes.push({
                "name": "Full HD",
                "slug": streamUrl,
                "id": streamUrl,
                "posterUrl": posterUrl,
                "thumbnailUrl": posterUrl
            });
        }

        // BÓC TÁCH VIDEO LIÊN QUAN (ĐÃ SỬA LỖI LẤY NHẦM 10:00)
        var relMap = {};
        var relKeys = [];
        var relRegex = /<a\s+[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
        var rMatch;

        while ((rMatch = relRegex.exec(html)) !== null) {
            var rHref = rMatch[1];
            if (!rHref || rHref === "/" || rHref === "#" || rHref.indexOf("/category/") !== -1 || rHref === url || rHref.indexOf("javascript:") !== -1) continue;

            var rFullA = rMatch[0];
            var rInner = rMatch[2];

            // 1. Ảnh Thumbnail
            var rImgMatch = rInner.match(/<img[^>]+(?:src|data-src|data-original)="([^"]+)"/i);
            var rPoster = rImgMatch ? rImgMatch[1] : "";
            if (rPoster && rPoster.indexOf("/") === 0) rPoster = BASEURL + rPoster;

            // 2. Tiêu đề
            var rTitle = "";

            var rTitleAttr = rFullA.match(/title="([^"]+)"/i) || rInner.match(/alt="([^"]+)"/i);
            if (rTitleAttr && rTitleAttr[1] && rTitleAttr[1].trim() !== "" && rTitleAttr[1].toLowerCase() !== "thumbnail") {
                var candAttr = cleanText(rTitleAttr[1]);
                if (!isTimeString(candAttr)) {
                    rTitle = candAttr;
                }
            }

            if (!rTitle) {
                var rClassMatch = rInner.match(/<[^>]*class="[^"]*(?:line-clamp|title|name|text-md)[^"]*"[^>]*>([\s\S]*?)<\/[^>]+>/i);
                if (rClassMatch && rClassMatch[1] && rClassMatch[1].trim() !== "") {
                    var candClass = cleanText(rClassMatch[1]);
                    if (!isTimeString(candClass)) {
                        rTitle = candClass;
                    }
                }
            }

            if (!rTitle) {
                var cleanRInner = rInner.replace(/<span[^>]*>[\s\S]*?<\/span>/gi, "").replace(/<img[^>]*>/gi, "");
                var rTextContent = cleanText(cleanRInner);
                if (rTextContent && rTextContent.length > 2 && !isTimeString(rTextContent) && rTextContent.indexOf("lượt xem") === -1) {
                    rTitle = rTextContent;
                }
            }

            // Gộp dữ liệu
            if (!relMap[rHref]) {
                relMap[rHref] = {
                    "id": rHref,
                    "title": rTitle,
                    "posterUrl": rPoster,
                    "backdropUrl": rPoster
                };
                relKeys.push(rHref);
            } else {
                if (!relMap[rHref].posterUrl && rPoster) relMap[rHref].posterUrl = rPoster;
                if ((!relMap[rHref].title || relMap[rHref].title === "" || isTimeString(relMap[rHref].title)) && rTitle) {
                    relMap[rHref].title = rTitle;
                }
            }
        }

        var relatedMovies = [];
        for (var k = 0; k < relKeys.length && relatedMovies.length < 12; k++) {
            var rItem = relMap[relKeys[k]];
            if (rItem.posterUrl) {
                if (!rItem.title || rItem.title.trim() === "" || isTimeString(rItem.title)) {
                    rItem.title = "Video liên quan";
                }
                relatedMovies.push(rItem);
            }
        }

        return JSON.stringify({
            "title": title,
            "posterUrl": posterUrl,
            "backdropUrl": posterUrl,
            "description": description,
            "category": categoryStr || "18+",
            "quality": "HD",
            "year": 2026,
            "rating": 9.0,
            "status": "Full",
            "servers": [
                {
                    "name": "xNhau Server",
                    "episodes": episodes
                }
            ],
            "relatedMovies": relatedMovies
        });
    } catch (e) {
        return JSON.stringify({
            "title": "Lỗi tải video",
            "posterUrl": "",
            "backdropUrl": "",
            "description": "Lỗi: " + e,
            "servers": []
        });
    }
}

function parseDetail(html, url) {
    return parseMovieDetail(html, url);
}

function parseDetailResponse(html, url) {
    var streamUrl = extractStreamUrl(html);
    var isEmbed = (streamUrl.indexOf(".m3u8") === -1 && streamUrl.indexOf(".mp4") === -1);

    return JSON.stringify({
        "url": streamUrl,
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": BASEURL + "/"
        },
        "isEmbed": isEmbed
    });
}

function parsePlayerUrl(html, url) {
    return parseDetailResponse(html, url);
}

function parseEpisodePlayer(html, url) {
    return parseDetailResponse(html, url);
}
