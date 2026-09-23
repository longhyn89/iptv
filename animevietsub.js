// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "animevietsub",
        "name": "AnimeVietSub",
        "version": "1.0.8",
        "baseUrl": "https://animevietsubs.cc",
        "iconUrl": "https://animevietsubs.cc/statics/default/images/logo.png",
        "isEnabled": true,
        "type": "MOVIE",
        "playerType": "embedtoexoplay"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'anime-moi-cap-nhat', title: 'Anime Mới Cập Nhật', type: 'Grid', path: '/' },
        { slug: 'anime-bo', title: 'Anime Bộ', type: 'Horizontal', path: 'anime-bo' },
        { slug: 'anime-le', title: 'Anime Lẻ/Movie', type: 'Horizontal', path: 'anime-le' },
        { slug: 'hoat-hinh-trung-quoc', title: 'HH Trung Quốc', type: 'Horizontal', path: 'hoat-hinh-trung-quoc' },
        { slug: 'anime-sap-chieu', title: 'Anime Sắp Chiếu', type: 'Horizontal', path: 'anime-sap-chieu' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Anime Bộ', slug: 'anime-bo' },
        { name: 'Anime Lẻ', slug: 'anime-le' },
        { name: 'HH Trung Quốc', slug: 'hoat-hinh-trung-quoc' },
        { name: 'Anime Sắp Chiếu', slug: 'anime-sap-chieu' },
        { name: 'Hành Động', slug: 'the-loai/hanh-dong' },
        { name: 'Phiêu Lưu', slug: 'the-loai/phieu-luu' },
        { name: 'Hài Hước', slug: 'the-loai/hai-huoc' },
        { name: 'Phép Thuật', slug: 'the-loai/phep-thuat' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Mới cập nhật', value: 'latest' },
            { name: 'Lượt xem', value: 'view' },
            { name: 'Bình chọn', value: 'rating' }
        ]
    });
}

// Helper log
function log(msg) {
    if (typeof console !== 'undefined' && console.log) {
        console.log("[AnimeVsubPlugin] " + msg);
    }
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = filters.page || 1;
        var sort = filters.sort || "latest";

        var targetSlug = slug;
        if (filters.category) {
            targetSlug = "the-loai/" + filters.category;
        }

        // Clean slug
        if (targetSlug.startsWith("/")) targetSlug = targetSlug.substring(1);
        if (targetSlug.endsWith("/")) targetSlug = targetSlug.substring(0, targetSlug.length - 1);

        var baseUrl = "https://animevietsubs.cc";
        
        // Handle Trang chủ (phim mới cập nhật)
        if (targetSlug === 'anime-moi-cap-nhat' || targetSlug === '') {
            if (page === 1) return baseUrl + "/";
            return baseUrl + "/anime-moi-cap-nhat/trang-" + page + ".html";
        }

        // Handle path format
        if (page === 1) {
            return baseUrl + "/" + targetSlug + "/";
        } else {
            return baseUrl + "/" + targetSlug + "/trang-" + page + ".html";
        }
    } catch (e) {
        return "https://animevietsubs.cc/";
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = filters.page || 1;
        var cleanKeyword = encodeURIComponent(keyword.trim());
        
        if (page === 1) {
            return "https://animevietsubs.cc/tim-kiem/" + cleanKeyword + "/";
        } else {
            return "https://animevietsubs.cc/tim-kiem/" + cleanKeyword + "/trang-" + page + ".html";
        }
    } catch (e) {
        return "https://animevietsubs.cc/";
    }
}

function getUrlDetail(slug) {
    if (slug.indexOf("http") === 0) return slug;
    // Clean slug
    var cleanSlug = slug;
    if (cleanSlug.startsWith("/")) cleanSlug = cleanSlug.substring(1);
    if (cleanSlug.startsWith("phim/")) cleanSlug = cleanSlug.substring(5);
    
    return "https://animevietsubs.cc/phim/" + cleanSlug;
}

function getUrlCategories() { return "https://animevietsubs.cc"; }
function getUrlCountries() { return "https://animevietsubs.cc"; }
function getUrlYears() { return "https://animevietsubs.cc"; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(htmlContent) {
    try {
        var movies = [];
        var seen = {};

        // Helper: extract movie from card HTML
        function extractMovie(cardHtml) {
            var linkMatch = /<a\s+[^>]*href="([^"]*\/phim\/[^"]+)"[^>]*(?:title="([^"]+)")?/i.exec(cardHtml);
            if (!linkMatch) {
                linkMatch = /<a\s+href="([^"]+)"\s+title="([^"]+)"/i.exec(cardHtml);
            }
            if (!linkMatch) return null;

            var href = linkMatch[1];
            var slug = href;
            var slugMatch = /\/phim\/([^/]+)/.exec(href);
            if (slugMatch) {
                slug = slugMatch[1];
            } else {
                slug = href.substring(href.lastIndexOf('/') + 1) || href;
            }
            // Loại bỏ trailing slash
            slug = slug.replace(/\/$/, '');
            if (seen[slug]) return null;
            seen[slug] = true;

            var epMatch = /<span class="mli-eps">[\s\S]*?<i>([^<]+)<\/i>/i.exec(cardHtml);
            var episode_current = epMatch ? "Tập " + epMatch[1].trim() : "";

            var imgMatch = /<img[^>]*(?:src|data-src)="([^"]+)"/i.exec(cardHtml);
            var posterUrl = imgMatch ? imgMatch[1] : "";

            // Title: h2.Title hoặc div.Title hoặc fallback title attribute
            var titleMatch = /<h2[^>]*class="Title"[^>]*>([\s\S]*?)<\/h2>/i.exec(cardHtml)
                || /<div class="Title">([\s\S]*?)<\/div>/i.exec(cardHtml);
            var title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, "").trim() : (linkMatch[2] || "");

            var year = 0;
            var yearMatch = /<span class="Date[^"]*">\s*(\d{4})\s*<\/span>/i.exec(cardHtml)
                || /\((\d{4})\)/.exec(title);
            if (yearMatch) year = parseInt(yearMatch[1]);

            return {
                id: slug,
                title: title,
                posterUrl: posterUrl,
                backdropUrl: posterUrl,
                year: year,
                quality: "FHD",
                episode_current: episode_current,
                lang: "Vietsub"
            };
        }

        // Pattern 1: <article class="TPost C ..."> (trang danh mục)
        var articlePattern = /<article class="TPost[^"]*">[\s\S]*?<\/article>/gi;
        var match;
        while ((match = articlePattern.exec(htmlContent)) !== null) {
            var movie = extractMovie(match[0]);
            if (movie) movies.push(movie);
        }

        // Pattern 2: <li> trong <ul class="MovieList Newepisode"> (trang chủ)
        if (movies.length === 0) {
            var listBlock = /<ul class="MovieList Newepisode">[\s\S]*?<\/ul>/i.exec(htmlContent);
            if (listBlock) {
                var liPattern = /<li>[\s\S]*?<\/li>/gi;
                while ((match = liPattern.exec(listBlock[0])) !== null) {
                    var movie = extractMovie(match[0]);
                    if (movie) movies.push(movie);
                }
            }
        }

        // Pattern 3: Fallback - <div class="TPost B"> (sidebar cards)
        if (movies.length === 0) {
            var divPattern = /<div class="TPost[^"]*">[\s\S]*?<\/div>\s*<\/div>/gi;
            while ((match = divPattern.exec(htmlContent)) !== null) {
                var movie = extractMovie(match[0]);
                if (movie) movies.push(movie);
            }
        }

        // Parse phân trang
        var totalPages = 1;
        var lastPageMatch = /href="[^"]*trang-(\d+)\.html"[^>]*>Trang Cuối<\/a>/i.exec(htmlContent);
        if (lastPageMatch) {
            totalPages = parseInt(lastPageMatch[1]);
        } else {
            var pagePattern = /class="page[^"]*">(\d+)<\/a>/gi;
            var pMatch;
            while ((pMatch = pagePattern.exec(htmlContent)) !== null) {
                var pNum = parseInt(pMatch[1]);
                if (pNum > totalPages) totalPages = pNum;
            }
        }

        var currentPage = 1;
        var curPageMatch = /class="[^"]*current[^"]*">(\d+)<\/span>/i.exec(htmlContent);
        if (curPageMatch) currentPage = parseInt(curPageMatch[1]);

        return JSON.stringify({
            items: movies,
            pagination: {
                currentPage: currentPage,
                totalPages: totalPages
            }
        });
    } catch (e) {
        log("parseListResponse error: " + e.message);
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

function parseSearchResponse(htmlContent) {
    return parseListResponse(htmlContent);
}

function parseMovieDetail(htmlContent) {
    try {
        var idMatch = /<link\s+rel="canonical"\s+href="([^"]+)"/i.exec(htmlContent) || /<meta\s+property="og:url"\s+content="([^"]+)"/i.exec(htmlContent);
        var id = idMatch ? idMatch[1] : "";

        var titleMatch = /<h1[^>]* itemprop="name">([\s\S]*?)<\/h1>/i.exec(htmlContent) || /<h1 class="title">([\s\S]*?)<\/h1>/i.exec(htmlContent);
        var title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, "").trim() : "";

        var descMatch = /<div class="Description[^"]*" itemprop="description">([\s\S]*?)<\/div>/i.exec(htmlContent) || /<div id="film-info-desc"[^>]*>([\s\S]*?)<\/div>/i.exec(htmlContent);
        var description = descMatch ? descMatch[1].replace(/<[^>]*>/g, "").trim() : "";

        var posterMatch = /<img[^>]*class="[^"]*attachment-img-mov-md[^"]*"[^>]*(?:src|data-src)="([^"]+)"/i.exec(htmlContent) || /<img class="poster"[^>]*(?:src|data-src)="([^"]+)"/i.exec(htmlContent);
        var posterUrl = posterMatch ? posterMatch[1] : "";

        var genres = [];
        var genreBlockMatch = /<li>\s*<span class="info-title">Thể loại:<\/span>([\s\S]*?)<\/li>/i.exec(htmlContent) || /Thể loại:([\s\S]*?)(?:<br|<\/li>)/i.exec(htmlContent);
        if (genreBlockMatch) {
            var genreMatch;
            var genrePattern = /<a[^>]*>([^<]+)<\/a>/gi;
            while ((genreMatch = genrePattern.exec(genreBlockMatch[1])) !== null) {
                genres.push(genreMatch[1].trim());
            }
        }

        var countries = [];
        var countryBlockMatch = /<li>\s*<span class="info-title">Quốc gia:<\/span>([\s\S]*?)<\/li>/i.exec(htmlContent);
        if (countryBlockMatch) {
            var countryMatch;
            var countryPattern = /<a[^>]*>([^<]+)<\/a>/gi;
            while ((countryMatch = countryPattern.exec(countryBlockMatch[1])) !== null) {
                countries.push(countryMatch[1].trim());
            }
        }

        var year = 0;
        var yearMatch = /<li>\s*<span class="info-title">Năm phát hành:<\/span>[\s\S]*?<a[^>]*>(\d{4})<\/a>/i.exec(htmlContent) || /Season:[\s\S]*?- (\d{4})/i.exec(htmlContent);
        if (yearMatch) year = parseInt(yearMatch[1]);

        var statusMatch = /<li>\s*<span class="info-title">Trạng thái:<\/span>\s*([\s\S]*?)<\/li>/i.exec(htmlContent);
        var status = statusMatch ? statusMatch[1].replace(/<[^>]*>/g, "").trim() : "";

        var episode_current = "";
        if (status) {
            var epMatch2 = /(Tập \d+|Full|Hoàn Tất)/i.exec(status);
            if (epMatch2) episode_current = epMatch2[1];
        }

        // Parse danh sách tập phim
        var episodes = [];
        var epPattern = /<a\s+[^>]*href="([^"]*\/tap-[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
        var epMatch;
        while ((epMatch = epPattern.exec(htmlContent)) !== null) {
            var epUrl = epMatch[1];
            var epName = epMatch[2].replace(/<[^>]*>/g, "").trim();
            
            if (epUrl.indexOf('http') !== 0) {
                epUrl = "https://animevietsubs.cc" + (epUrl.startsWith('/') ? '' : '/') + epUrl;
            }
            
            // Tránh add trùng tập
            var isDuplicate = false;
            for (var i = 0; i < episodes.length; i++) {
                if (episodes[i].id === epUrl) {
                    isDuplicate = true;
                    break;
                }
            }
            if (!isDuplicate) {
                episodes.push({
                    id: epUrl,
                    name: epName,
                    slug: epUrl
                });
            }
        }

        // Sắp xếp các tập phim theo thứ tự tăng dần (ví dụ Tập 1 -> Tập 13)
        episodes.sort(function(a, b) {
            var epA = parseInt(a.name) || 0;
            var epB = parseInt(b.name) || 0;
            return epA - epB;
        });

        var servers = [];
        if (episodes.length > 0) {
            servers.push({
                name: "AnimeVsub",
                episodes: episodes
            });
        }

        // Trích xuất slug từ canonical URL hoặc og:url (id)
        var slug = "";
        if (id) {
            var slugMatch = /\/phim\/([^/]+)/.exec(id);
            slug = slugMatch ? slugMatch[1] : id;
        }
        if (!slug) {
            var slugMatch2 = /\/phim\/([^/]+)/.exec(htmlContent);
            slug = slugMatch2 ? slugMatch2[1] : "";
        }

        // Tạo extra url để tải đầy đủ tập từ trang xem-phim
        // Kiểm tra bằng canonical URL (biến id) thay vì search toàn HTML vì trang
        // detail có nav link chứa chuỗi "xem-phim" gây nhận nhầm.
        var extra = "";
        var isPlayPage = (id && id.indexOf("xem-phim") > -1) || htmlContent.indexOf("window.PLAYER_DATA") > -1;
        if (!isPlayPage && slug && slug !== "error") {
            extra = "https://animevietsubs.cc/phim/" + slug + "/xem-phim.html";
        }

        return JSON.stringify({
            id: slug,
            title: title,
            posterUrl: posterUrl,
            backdropUrl: posterUrl,
            description: description,
            year: year,
            servers: servers,
            episode_current: episode_current,
            lang: "Vietsub",
            quality: "FHD",
            category: genres.join(", "),
            country: countries.join(", "),
            status: status,
            extra: extra
        });
    } catch (e) {
        log("parseMovieDetail error: " + e.message);
        return JSON.stringify({ id: "error", title: "", servers: [] });
    }
}

function parseDetailResponse(htmlContent, pageUrl) {
    try {
        log("parseDetailResponse input pageUrl: " + pageUrl);
        
        var link = "";
        // Tìm window.PLAYER_DATA
        var match = /window\.PLAYER_DATA\s*=\s*(\{.*?\});/s.exec(htmlContent);
        if (match) {
            var data = JSON.parse(match[1]);
            if (data && data.link) {
                link = data.link;
                log("Extracted player link from window.PLAYER_DATA: " + link);
            }
        }
        
        // Fallback: Quét tất cả các iframe
        if (!link) {
            var iframeMatch = htmlContent.match(/<iframe[^>]*src="([^"]+)"/i);
            if (iframeMatch) {
                link = iframeMatch[1];
                log("Fallback iframe link: " + link);
            }
        }
        
        if (link) {
            if (link.indexOf('//') === 0) link = "https:" + link;
            
            // Bypass anti-frame: inject Custom-Js để override window.top check
            // Script avs-shield.min.js kiểm tra window.self === window.top
            // Ta dùng Object.defineProperty ghi đè window.top = window.self
            var bypassJs = "try{Object.defineProperty(window,'top',{get:function(){return window.self}});}catch(e){}";
            
            return JSON.stringify({
                url: link,
                isEmbed: false,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Referer": pageUrl || "https://animevietsubs.cc/",
                    "Custom-Js": bypassJs
                },
                subtitles: []
            });
        }
        
        return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
    } catch (e) {
        log("parseDetailResponse error: " + e.message);
        return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
    }
}

function parseEmbedResponse(htmlContent, url) {
    try {
        // Thử trích xuất direct HLS stream từ player page
        var m3u8Match = /["'](https?:\/\/[^"'\s]*\.m3u8[^"'\s]*?)["']/i.exec(htmlContent);
        if (m3u8Match) {
            log("Found m3u8 stream: " + m3u8Match[1]);
            return JSON.stringify({
                url: m3u8Match[1],
                isEmbed: false,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Referer": "https://animevietsubs.cc/"
                },
                subtitles: []
            });
        }

        // Không tìm thấy m3u8 → trả embed với Block-Scripts chặn avs-shield
        // Trích xuất nextUrl từ URL embed hiện tại để làm Referer chuẩn
        var nextUrlMatch = url.match(/nextUrl=([^&]+)/);
        var referer = nextUrlMatch ? decodeURIComponent(nextUrlMatch[1]) : "https://animevietsubs.cc/";

        return JSON.stringify({
            url: url,
            isEmbed: false,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": referer,
                "Block-Scripts": "avs-shield"
            },
            subtitles: []
        });
    } catch (e) {
        log("parseEmbedResponse error: " + e.message);
        return JSON.stringify({ url: url, isEmbed: true, headers: {}, subtitles: [] });
    }
}

// =============================================================================
// CATEGORIES
// =============================================================================

function parseCategoriesResponse(htmlContent) {
    try {
        var categories = [];
        // Parse menu thể loại từ trang chủ
        var menuBlock = /<ul class="sub-menu[^"]*">([\s\S]*?)<\/ul>/i.exec(htmlContent);
        if (menuBlock) {
            var catPattern = /<a\s+href="[^"]*\/the-loai\/([^"]+)"[^>]*>([^<]+)<\/a>/gi;
            var catMatch;
            while ((catMatch = catPattern.exec(menuBlock[1])) !== null) {
                var catSlug = catMatch[1].replace(/\//g, "");
                var catName = catMatch[2].trim();
                if (catSlug && catName) {
                    categories.push({ name: catName, slug: catSlug });
                }
            }
        }
        // Fallback: quét toàn trang nếu không tìm thấy trong submenu
        if (categories.length === 0) {
            var fallbackPattern = /<a\s+href="[^"]*\/the-loai\/([^"]+)"[^>]*>([^<]+)<\/a>/gi;
            var fbMatch;
            while ((fbMatch = fallbackPattern.exec(htmlContent)) !== null) {
                var fbSlug = fbMatch[1].replace(/\//g, "");
                var fbName = fbMatch[2].trim();
                var exists = false;
                for (var i = 0; i < categories.length; i++) {
                    if (categories[i].slug === fbSlug) { exists = true; break; }
                }
                if (!exists && fbSlug && fbName) {
                    categories.push({ name: fbName, slug: fbSlug });
                }
            }
        }
        return JSON.stringify(categories);
    } catch (e) {
        log("parseCategoriesResponse error: " + e.message);
        return "[]";
    }
}

function parseCountriesResponse(htmlContent) { return "[]"; }
function parseYearsResponse(htmlContent) { return "[]"; }
