// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "nguonc",
        "name": "Phim NguonC VIP",
        "version": "1.2.0",
        "baseUrl": "https://phim.nguonc.com",
        "iconUrl": "https://raw.githubusercontent.com/youngbi/repo/main/plugins/nguonC.png",
        "isEnabled": true,
        "type": "MOVIE",
        "playerType": "embedtoexoplay" // Báo cho App hỗ trợ linh hoạt cả ExoPlayer và WebView
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'phim-le', title: 'Phim Lẻ', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'phim-bo', title: 'Phim Bộ', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'tv-shows', title: 'TV Shows', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'hoat-hinh', title: 'Hoạt Hình', type: 'Horizontal', path: 'the-loai' },
        { slug: 'phim-moi-cap-nhat', title: 'Phim Mới Cập Nhật', type: 'Grid', path: 'phim-moi-cap-nhat' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Phim lẻ', slug: 'phim-le' },
        { name: 'Phim bộ', slug: 'phim-bo' },
        { name: 'TV Shows', slug: 'tv-shows' },
        { name: 'Hoạt hình', slug: 'hoat-hinh' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Mới cập nhật', value: 'updated' },
            { name: 'Mới nhất', value: 'new' },
            { name: 'Lượt xem', value: 'view' }
        ]
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = filters.page || 1;
        var sort = filters.sort || "updated";

        if (slug === 'phim-moi-cap-nhat' && !filters.category && !filters.country && !filters.year) {
            return "https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=" + page;
        }

        if (filters.category) {
            return "https://phim.nguonc.com/api/films/the-loai/" + filters.category + "?page=" + page + "&sort=" + sort;
        }

        if (filters.country) {
            return "https://phim.nguonc.com/api/films/quoc-gia/" + filters.country + "?page=" + page + "&sort=" + sort;
        }

        if (filters.year) {
            return "https://phim.nguonc.com/api/films/nam-phat-hanh/" + filters.year + "?page=" + page + "&sort=" + sort;
        }

        if (/^\d{4}$/.test(slug)) {
            return "https://phim.nguonc.com/api/films/nam-phat-hanh/" + slug + "?page=" + page + "&sort=" + sort;
        }

        var listSlugs = ['phim-le', 'phim-bo', 'phim-dang-chieu', 'tv-shows', 'subteam'];
        if (listSlugs.indexOf(slug) >= 0 && slug !== 'hoat-hinh') {
            return "https://phim.nguonc.com/api/films/danh-sach/" + slug + "?page=" + page + "&sort=" + sort;
        }

        var countrySlugs = [
            'au-my', 'anh', 'trung-quoc', 'indonesia', 'viet-nam', 'phap', 'hong-kong',
            'han-quoc', 'nhat-ban', 'thai-lan', 'dai-loan', 'nga', 'ha-lan',
            'philippines', 'an-do', 'quoc-gia-khac'
        ];
        if (countrySlugs.indexOf(slug) >= 0) {
            return "https://phim.nguonc.com/api/films/quoc-gia/" + slug + "?page=" + page + "&sort=" + sort;
        }

        return "https://phim.nguonc.com/api/films/the-loai/" + slug + "?page=" + page + "&sort=" + sort;

    } catch (e) {
        return "https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=1";
    }
}

function getUrlSearch(keyword, filtersJson) {
    return "https://phim.nguonc.com/api/films/search?keyword=" + encodeURIComponent(keyword);
}

function getUrlDetail(slug) {
    if (slug.indexOf("http") === 0) return slug;
    return "https://phim.nguonc.com/api/film/" + slug;
}

function getUrlCategories() { return "https://phim.nguonc.com"; }
function getUrlCountries() { return "https://phim.nguonc.com"; }
function getUrlYears() { return "https://phim.nguonc.com"; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var data = response.data || {};
        var items = [];

        if (Array.isArray(data)) {
            items = data;
        } else if (Array.isArray(response.items)) {
            items = response.items;
        } else if (data.items && Array.isArray(data.items)) {
            items = data.items;
        }

        var paginate = response.paginate || response.pagination || (data.params && data.params.pagination) || {};

        var movies = items.map(function (item) {
            return {
                id: item.slug,
                title: item.name,
                posterUrl: getImageUrl(item.thumb_url),
                backdropUrl: getImageUrl(item.poster_url),
                year: item.year || 0,
                quality: item.quality || "",
                episode_current: item.current_episode || item.episode_current || "",
                lang: item.language || item.lang || ""
            };
        });

        var currentPage = paginate.current_page || paginate.currentPage || 1;
        var totalItems = paginate.total_items || paginate.totalItems || 0;
        var itemsPerPage = paginate.items_per_page || paginate.itemsPerPage || paginate.totalItemsPerPage || 24;
        var totalPages = paginate.total_page || paginate.totalPages || 0;

        if (totalPages === 0 && itemsPerPage > 0) {
            totalPages = Math.ceil(totalItems / itemsPerPage);
        }
        if (totalPages === 0) totalPages = 1;

        return JSON.stringify({
            items: movies,
            pagination: {
                currentPage: currentPage,
                totalPages: totalPages,
                totalItems: totalItems,
                itemsPerPage: itemsPerPage
            }
        });
    } catch (error) {
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

function parseSearchResponse(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

function parseMovieDetail(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var movie = response.movie || response.data?.item || response.data || {};
        var rawEpisodes = movie.episodes || response.episodes || response.data?.item?.episodes || [];

        var servers = [];
        if (Array.isArray(rawEpisodes)) {
            rawEpisodes.forEach(function (server) {
                var episodes = [];
                var serverItems = server.items || server.server_data || [];

                if (Array.isArray(serverItems)) {
                    serverItems.forEach(function (ep) {
                        var embed = ep.embed || ep.link_embed || "";
                        var m3u8 = ep.m3u8 || ep.link_m3u8 || "";
                        var link = embed || m3u8;

                        if (link) {
                            episodes.push({
                                id: link,
                                name: ep.name || ep.episode_name || "",
                                slug: ep.slug || ep.episode_slug || ""
                            });
                        }
                    });
                }

                if (episodes.length > 0) {
                    servers.push({
                        name: server.server_name || server.name || "Server",
                        episodes: episodes
                    });
                }
            });
        }

        var extractGroup = function (categoryObj, groupName) {
            if (!categoryObj) return "";
            for (var key in categoryObj) {
                var group = categoryObj[key];
                if (group && group.group && group.group.name === groupName && group.list && group.list.length > 0) {
                    return group.list.map(function (item) { return item.name; }).join(", ");
                }
            }
            return "";
        };

        var extractedYear = extractGroup(movie.category, "Năm");

        return JSON.stringify({
            id: movie.slug || "",
            title: movie.name || "",
            posterUrl: getImageUrl(movie.thumb_url),
            backdropUrl: getImageUrl(movie.poster_url),
            description: (movie.description || movie.content || "").replace(/<[^>]*>/g, ""),
            year: parseInt(movie.year || extractedYear) || 0,
            rating: parseFloat(movie.view) || 0,
            quality: movie.quality || "",
            servers: servers,
            episode_current: movie.current_episode || movie.episode_current || "",
            lang: movie.language || movie.lang || "",
            casts: movie.casts || movie.actor || "",
            director: movie.director || "",
            category: extractGroup(movie.category, "Thể loại"),
            country: extractGroup(movie.category, "Quốc gia"),
            view: parseInt(movie.view) || 0,
            status: movie.status || ""
        });
    } catch (error) {
        return "{}";
    }
}

// Cấu hình WebView ẩn dùng để Sniff M3U8
function parseDetailResponse(html, url) {
    try {
        var customjs = runJS();
        return JSON.stringify({
            "url": url,
            "headers": {
                "Referer": "https://embed.streamc.xyz/",
                "Origin": "https://embed.streamc.xyz/",
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
                "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
                "Sec-Ch-Ua-Mobile": "?1",
                "Sec-Ch-Ua-Platform": '"Android"',
                "Accept": "*/*",
                "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
                "X-Requested-With": "com.android.chrome",
                "Block-Ads": true,
                "Custom-Js": customjs.trim()
            },
            "subtitles": []
        });
    } catch (e) {
        return JSON.stringify({ "url": "", "headers": {} });
    }
}

// Injected Script: Bắt M3U8 từ RAM Blob -> Chuẩn hóa URL -> Gửi ExoPlayer (Fallback sang Embed WebView nếu thất bại)
function runJS() {
    return `
function bridgeLog(msg, check) {
    try {
        if (window.SnifferBridge && typeof window.SnifferBridge.log === 'function') {
            window.SnifferBridge.log(msg);
            if (check === true && typeof window.SnifferBridge.toast === 'function') {
                window.SnifferBridge.toast(msg, 1000);
            }
        } else if (typeof console !== 'undefined' && console.log) {
            console.log(msg);
        }
    } catch(e) {}
}

(function injectCSS() {
    try {
        const cssStyle = "body,html,*{display:none!important;background:black!important;opacity:0!important;z-index:-999999}";
        const styleElement = document.createElement('style');
        styleElement.type = 'text/css';
        styleElement.appendChild(document.createTextNode(cssStyle));
        const targetNode = document.head || document.documentElement;
        if (targetNode) {
            targetNode.appendChild(styleElement);
        }
    } catch (error) {}
})();

(function initLocalBlobSniffer() {
    if (window.__BLOB_SNIFFER_INITIALIZED__) return;
    window.__BLOB_SNIFFER_INITIALIZED__ = 1;

    var hasDispatchedAny = 0;
    var isFinished = 0;
    var timeoutTimer = null;

    bridgeLog("Đang quét link M3U8 cho ExoPlayer...", true);

    // Chuyển relative URL thành absolute URL đầy đủ protocol/domain
    function resolveRelativeUrls(m3u8Text, baseUrl) {
        if (!m3u8Text) return m3u8Text;
        var lines = m3u8Text.split('\\n');
        var baseDir = baseUrl.substring(0, baseUrl.lastIndexOf('/') + 1);
        
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (line.length > 0 && !line.startsWith('#')) {
                if (!line.startsWith('http://') && !line.startsWith('https://')) {
                    if (line.startsWith('/')) {
                        try {
                            var origin = new URL(baseUrl).origin;
                            lines[i] = origin + line;
                        } catch(e) {
                            lines[i] = baseDir + line;
                        }
                    } else {
                        lines[i] = baseDir + line;
                    }
                }
            }
        }
        return lines.join('\\n');
    }

    function dispatchM3u8ToApp(m3u8Content) {
        if (!m3u8Content || hasDispatchedAny === 1) return;
        hasDispatchedAny = 1;
        isFinished = 1;
        if (timeoutTimer) clearTimeout(timeoutTimer);

        bridgeLog("Bắt M3U8 thành công! Đang khởi chạy ExoPlayer...", true);

        // Biến đổi các link tương đối trong M3U8 thành link tuyệt đối
        var fixedM3u8 = resolveRelativeUrls(m3u8Content, window.location.href);

        try {
            if (window.SnifferBridge && typeof window.SnifferBridge.playM3u8Content === 'function') {
                window.SnifferBridge.playM3u8Content(fixedM3u8, window.location.href);
            }
        } catch(e) {}
    }

    // Timeout 8 giây: Không tìm thấy M3U8 -> Tự động chuyển sang WebView Embed
    timeoutTimer = setTimeout(function() {
        if (hasDispatchedAny === 0 && isFinished === 0) {
            isFinished = 1;
            bridgeLog("Chuyển sang chế độ WebView Embed...", true);
            if (window.SnifferBridge && typeof window.SnifferBridge.play === 'function') {
                window.SnifferBridge.play(window.location.href, "");
            }
        }
    }, 8000);

    function isValidM3U8(content) {
        if (typeof content !== 'string') return false;
        var trimmed = content.trim();
        return trimmed.indexOf('#EXTM3U') === 0 && 
              (trimmed.indexOf('#EXTINF') !== -1 || trimmed.indexOf('#EXT-X-STREAM-INF') !== -1);
    }

    // Hook Blob RAM để bắt dữ liệu M3U8 động
    try {
        if (typeof URL !== 'undefined' && URL.createObjectURL) {
            var originalCreateObjectURL = URL.createObjectURL;
            URL.createObjectURL = function(blob) {
                var blobUrl = originalCreateObjectURL.apply(this, arguments);

                if (isFinished === 0 && blob && (blob instanceof Blob || blob instanceof File)) {
                    var processContent = function(content) {
                        if (isValidM3U8(content)) {
                            dispatchM3u8ToApp(content);
                        }
                    };

                    if (typeof blob.text === 'function') {
                        blob.text().then(processContent).catch(function(){});
                    } else {
                        var reader = new FileReader();
                        reader.onload = function(e) {
                            processContent(e.target.result);
                        };
                        reader.readAsText(blob);
                    }
                }
                return blobUrl;
            };
        }
    } catch (e) {}
})();
    `;
}

function parseCategoriesResponse(apiResponseJson) {
    var genres = [
        { name: "Hành Động", slug: "hanh-dong" },
        { name: "Phiêu Lưu", slug: "phieu-luu" },
        { name: "Hoạt Hình", slug: "hoat-hinh" },
        { name: "Hài", slug: "phim-hai" },
        { name: "Hình Sự", slug: "hinh-su" },
        { name: "Tài Liệu", slug: "tai-lieu" },
        { name: "Chính Kịch", slug: "chinh-kich" },
        { name: "Gia Đình", slug: "gia-dinh" },
        { name: "Giả Tưởng", slug: "gia-tuong" },
        { name: "Lịch Sử", slug: "lich-su" },
        { name: "Kinh Dị", slug: "kinh-di" },
        { name: "Nhạc", slug: "phim-nhac" },
        { name: "Bí Ẩn", slug: "bi-an" },
        { name: "Lãng Mạn", slug: "lang-man" },
        { name: "Khoa Học Viễn Tưởng", slug: "khoa-hoc-vien-tuong" },
        { name: "Gây Cấn", slug: "gay-can" },
        { name: "Chiến Tranh", slug: "chien-tranh" },
        { name: "Tâm Lý", slug: "tam-ly" },
        { name: "Tình Cảm", slug: "tinh-cam" },
        { name: "Cổ Trang", slug: "co-trang" },
        { name: "Miền Tây", slug: "mien-tay" },
        { name: "Phim 18+", slug: "phim-18" }
    ];
    return JSON.stringify(genres);
}

function parseCountriesResponse(apiResponseJson) {
    var countries = [
        { name: "Âu Mỹ", value: "au-my" },
        { name: "Anh", value: "anh" },
        { name: "Trung Quốc", value: "trung-quoc" },
        { name: "Indonesia", value: "indonesia" },
        { name: "Việt Nam", value: "viet-nam" },
        { name: "Pháp", value: "phap" },
        { name: "Hồng Kông", value: "hong-kong" },
        { name: "Hàn Quốc", value: "han-quoc" },
        { name: "Nhật Bản", value: "nhat-ban" },
        { name: "Thái Lan", value: "thai-lan" },
        { name: "Đài Loan", value: "dai-loan" },
        { name: "Nga", value: "nga" },
        { name: "Hà Lan", value: "ha-lan" },
        { name: "Philippines", value: "philippines" },
        { name: "Ấn Độ", value: "an-do" },
        { name: "Quốc gia khác", value: "quoc-gia-khac" }
    ];
    return JSON.stringify(countries);
}

function parseYearsResponse(apiResponseJson) {
    var years = [];
    for (var i = 2026; i >= 2004; i--) {
        years.push({ name: i.toString(), value: i.toString() });
    }
    return JSON.stringify(years);
}

function getImageUrl(path) {
    if (!path) return "";
    if (path.indexOf("http") === 0) return path;
    return "https://img.phimapi.com/" + path;
}
