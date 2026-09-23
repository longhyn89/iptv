// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "animevietsub",
        "name": "AnimeVietSub",
        "version": "1.1.0",
        "baseUrl": "https://animevietsub.xyz",
        "iconUrl": "https://animevietsub.xyz/statics/default/images/logo.png",
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
        var targetSlug = slug || "";

        if (filters.category) {
            targetSlug = "the-loai/" + filters.category;
        }

        targetSlug = targetSlug.replace(/^\/|\/$/g, '');
        var baseUrl = "https://animevietsub.xyz";

        if (targetSlug === 'anime-moi-cap-nhat' || targetSlug === '') {
            if (page === 1) return baseUrl + "/";
            return baseUrl + "/anime-moi-cap-nhat/trang-" + page + ".html";
        }

        if (page === 1) {
            return baseUrl + "/" + targetSlug + "/";
        } else {
            return baseUrl + "/" + targetSlug + "/trang-" + page + ".html";
        }
    } catch (e) {
        return "https://animevietsub.xyz/";
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = filters.page || 1;
        var cleanKeyword = encodeURIComponent(keyword.trim());
        
        if (page === 1) {
            return "https://animevietsub.xyz/tim-kiem/" + cleanKeyword + "/";
        } else {
            return "https://animevietsub.xyz/tim-kiem/" + cleanKeyword + "/trang-" + page + ".html";
        }
    } catch (e) {
        return "https://animevietsub.xyz/";
    }
}

function getUrlDetail(slug) {
    if (!slug) return "https://animevietsub.xyz/";
    if (slug.indexOf("http") === 0) return slug;
    
    var cleanSlug = slug.replace(/^\/|\/$/g, '').replace(/^phim\//, '');
    return "https://animevietsub.xyz/phim/" + cleanSlug + "/";
}

function getUrlCategories() { return "https://animevietsub.xyz"; }
function getUrlCountries() { return "https://animevietsub.xyz"; }
function getUrlYears() { return "https://animevietsub.xyz"; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(htmlContent) {
    try {
        var movies = [];
        var seen = {};

        function extractMovie(cardHtml) {
            var linkMatch = /href="([^"]*\/phim\/[^"]+)"/i.exec(cardHtml);
            if (!linkMatch) return null;

            var href = linkMatch[1];
            var slugMatch = /\/phim\/([^/]+)/.exec(href);
            var slug = slugMatch ? slugMatch[1] : href.split('/').pop();
            slug = slug.replace(/\/$/, '');

            if (!slug || seen[slug]) return null;
            seen[slug] = true;

            var titleMatch = /title="([^"]+)"/i.exec(cardHtml) || 
                             /<h3[^>]*>([\s\S]*?)<\/h3>/i.exec(cardHtml) ||
                             /<h2[^>]*>([\s\S]*?)<\/h2>/i.exec(cardHtml);
            var title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, "").trim() : slug;

            var imgMatch = /(?:src|data-src)="([^"]+)"/i.exec(cardHtml);
            var posterUrl = imgMatch ? imgMatch[1] : "";

            var epMatch = /class="mli-eps"[^>]*>[\s\S]*?<i>([^<]+)<\/i>/i.exec(cardHtml) ||
                          /class="eps"[^>]*>([\s\S]*?)<\/span>/i.exec(cardHtml);
            var episode_current = epMatch ? "Tập " + epMatch[1].replace(/<[^>]*>/g, "").trim() : "";

            var year = 0;
            var yearMatch = /(\d{4})/.exec(title);
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

        // Regex bắt khối bài viết
        var itemPattern = /<(?:article|li|div)[^>]*class="[^"]*(?:TPost|item|film)[^"]*"[^>]*>[\s\S]*?<\/(?:article|li|div)>/gi;
        var match;
        while ((match = itemPattern.exec(htmlContent)) !== null) {
            var movie = extractMovie(match[0]);
            if (movie) movies.push(movie);
        }

        // Fallback quét tất cả thẻ <a> chứa /phim/
        if (movies.length === 0) {
            var fallbackPattern = /<a[^>]*href="[^"]*\/phim\/[^"]+"[^>]*>[\s\S]*?<\/a>/gi;
            while ((match = fallbackPattern.exec(htmlContent)) !== null) {
                var movie = extractMovie(match[0]);
                if (movie) movies.push(movie);
            }
        }

        var totalPages = 1;
        var lastPageMatch = /href="[^"]*trang-(\d+)\.html"/i.exec(htmlContent);
        if (lastPageMatch) totalPages = parseInt(lastPageMatch[1]);

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
        var rawUrl = idMatch ? idMatch[1] : "";
        var slugMatch = /\/phim\/([^/]+)/.exec(rawUrl);
        var slug = slugMatch ? slugMatch[1] : "unknown";

        var titleMatch = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(htmlContent);
        var title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, "").trim() : "";

        var descMatch = /class="(?:Description|description|film-info-desc)"[^>]*>([\s\S]*?)<\/div>/i.exec(htmlContent);
        var description = descMatch ? descMatch[1].replace(/<[^>]*>/g, "").trim() : "";

        var posterMatch = /<img[^>]*class="[^"]*(?:poster|attachment-img-mov-md)[^"]*"[^>]*(?:src|data-src)="([^"]+)"/i.exec(htmlContent);
        var posterUrl = posterMatch ? posterMatch[1] : "";

        // Trả về dạng MẢNG Array đúng chuẩn SuperOK
        var genres = [];
        var genreBlockMatch = /Thể loại:([\s\S]*?)(?:<\/li>|<br)/i.exec(htmlContent);
        if (genreBlockMatch) {
            var gMatch;
            var gPattern = /<a[^>]*>([^<]+)<\/a>/gi;
            while ((gMatch = gPattern.exec(genreBlockMatch[1])) !== null) {
                genres.push(gMatch[1].trim());
            }
        }

        var countries = [];
        var countryBlockMatch = /Quốc gia:([\s\S]*?)(?:<\/li>|<br)/i.exec(htmlContent);
        if (countryBlockMatch) {
            var cMatch;
            var cPattern = /<a[^>]*>([^<]+)<\/a>/gi;
            while ((cMatch = cPattern.exec(countryBlockMatch[1])) !== null) {
                countries.push(cMatch[1].trim());
            }
        }

        var year = 0;
        var yearMatch = /(\d{4})/.exec(htmlContent);
        if (yearMatch) year = parseInt(yearMatch[1]);

        // Trích xuất danh sách tập
        var episodes = [];
        var epPattern = /<a\s+[^>]*href="([^"]*\/tap-[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
        var epMatch;
        var seenEp = {};

        while ((epMatch = epPattern.exec(htmlContent)) !== null) {
            var epUrl = epMatch[1];
            var epName = epMatch[2].replace(/<[^>]*>/g, "").trim();

            if (epUrl.indexOf('http') !== 0) {
                epUrl = "https://animevietsub.xyz" + (epUrl.startsWith('/') ? '' : '/') + epUrl;
            }

            if (!seenEp[epUrl]) {
                seenEp[epUrl] = true;
                episodes.push({
                    id: epUrl,
                    name: epName.indexOf("Tập") === -1 ? "Tập " + epName : epName,
                    slug: epUrl
                });
            }
        }

        var servers = [];
        if (episodes.length > 0) {
            servers.push({
                name: "AnimeVsub",
                episodes: episodes
            });
        }

        var extra = "";
        if (slug !== "unknown") {
            extra = "https://animevietsub.xyz/phim/" + slug + "/xem-phim.html";
        }

        return JSON.stringify({
            id: slug,
            title: title,
            posterUrl: posterUrl,
            backdropUrl: posterUrl,
            description: description,
            year: year,
            servers: servers,
            episode_current: episodes.length > 0 ? "Tập " + episodes.length : "",
            lang: "Vietsub",
            quality: "FHD",
            category: genres,    // Phải là Array
            country: countries,  // Phải là Array
            status: "Hoàn tất",
            extra: extra
        });
    } catch (e) {
        log("parseMovieDetail error: " + e.message);
        return JSON.stringify({ id: "error", title: "", servers: [] });
    }
}

function parseDetailResponse(htmlContent, pageUrl) {
    try {
        var link = "";
        var match = /window\.PLAYER_DATA\s*=\s*(\{.*?\});/s.exec(htmlContent);
        if (match) {
            var data = JSON.parse(match[1]);
            if (data && data.link) {
                link = data.link;
            }
        }

        if (!link) {
            var iframeMatch = htmlContent.match(/<iframe[^>]*src="([^"]+)"/i);
            if (iframeMatch) {
                link = iframeMatch[1];
            }
        }

        if (link) {
            if (link.indexOf('//') === 0) link = "https:" + link;
            var bypassJs = "try{Object.defineProperty(window,'top',{get:function(){return window.self}});}catch(e){}";

            return JSON.stringify({
                url: link,
                isEmbed: false,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
                    "Referer": pageUrl || "https://animevietsub.xyz/",
                    "Custom-Js": bypassJs
                },
                subtitles: []
            });
        }

        return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
    } catch (e) {
        return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
    }
}

function parseEmbedResponse(htmlContent, url) {
    try {
        var m3u8Match = /["'](https?:\/\/[^"'\s]*\.m3u8[^"'\s]*?)["']/i.exec(htmlContent);
        if (m3u8Match) {
            return JSON.stringify({
                url: m3u8Match[1],
                isEmbed: false,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
                    "Referer": "https://animevietsub.xyz/"
                },
                subtitles: []
            });
        }

        var nextUrlMatch = url.match(/nextUrl=([^&]+)/);
        var referer = nextUrlMatch ? decodeURIComponent(nextUrlMatch[1]) : "https://animevietsub.xyz/";

        return JSON.stringify({
            url: url,
            isEmbed: false,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
                "Referer": referer,
                "Block-Scripts": "avs-shield"
            },
            subtitles: []
        });
    } catch (e) {
        return JSON.stringify({ url: url, isEmbed: true, headers: {}, subtitles: [] });
    }
}

// =============================================================================
// CATEGORIES
// =============================================================================

function parseCategoriesResponse(htmlContent) {
    try {
        var categories = [];
        var catPattern = /<a\s+href="[^"]*\/the-loai\/([^"]+)"[^>]*>([^<]+)<\/a>/gi;
        var match;
        var seen = {};

        while ((match = catPattern.exec(htmlContent)) !== null) {
            var catSlug = match[1].replace(/\//g, "");
            var catName = match[2].trim();
            if (catSlug && catName && !seen[catSlug]) {
                seen[catSlug] = true;
                categories.push({ name: catName, slug: "the-loai/" + catSlug });
            }
        }
        return JSON.stringify(categories);
    } catch (e) {
        return "[]";
    }
}

function parseCountriesResponse(htmlContent) { return "[]"; }
function parseYearsResponse(htmlContent) { return "[]"; }
