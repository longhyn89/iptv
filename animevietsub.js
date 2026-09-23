// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "animevietsub",
        "name": "AnimeVietSub",
        "version": "1.1.2",
        "baseUrl": "https://animevietsub.tv",
        "iconUrl": "https://animevietsub.tv/statics/default/images/logo.png",
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
        { slug: 'hoat-hinh-trung-quoc', title: 'HH Trung Quốc', type: 'Horizontal', path: 'hoat-hinh-trung-quoc' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Anime Bộ', slug: 'anime-bo' },
        { name: 'Anime Lẻ', slug: 'anime-le' },
        { name: 'HH Trung Quốc', slug: 'hoat-hinh-trung-quoc' },
        { name: 'Hành Động', slug: 'the-loai/hanh-dong' },
        { name: 'Phiêu Lưu', slug: 'the-loai/phieu-luu' },
        { name: 'Hài Hước', slug: 'the-loai/hai-huoc' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Mới cập nhật', value: 'latest' },
            { name: 'Lượt xem', value: 'view' }
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

function getBaseUrl() {
    return "https://animevietsub.tv";
}

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = filters.page || 1;
        var targetSlug = slug || "";

        if (filters.category) {
            targetSlug = "the-loai/" + filters.category;
        }

        targetSlug = targetSlug.replace(/^\/|\/$/g, '');
        var baseUrl = getBaseUrl();

        if (targetSlug === 'anime-moi-cap-nhat' || targetSlug === '') {
            if (page === 1) return baseUrl + "/";
            return baseUrl + "/trang-" + page + ".html";
        }

        if (page === 1) {
            return baseUrl + "/" + targetSlug + "/";
        } else {
            return baseUrl + "/" + targetSlug + "/trang-" + page + ".html";
        }
    } catch (e) {
        return getBaseUrl() + "/";
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = filters.page || 1;
        var cleanKeyword = encodeURIComponent(keyword.trim());
        var baseUrl = getBaseUrl();
        
        if (page === 1) {
            return baseUrl + "/tim-kiem/" + cleanKeyword + "/";
        } else {
            return baseUrl + "/tim-kiem/" + cleanKeyword + "/trang-" + page + ".html";
        }
    } catch (e) {
        return getBaseUrl() + "/";
    }
}

function getUrlDetail(slug) {
    if (!slug) return getBaseUrl() + "/";
    if (slug.indexOf("http") === 0) return slug;
    
    var cleanSlug = slug.replace(/^\/|\/$/g, '').replace(/^phim\//, '');
    return getBaseUrl() + "/phim/" + cleanSlug + "/";
}

function getUrlCategories() { return getBaseUrl(); }
function getUrlCountries() { return getBaseUrl(); }
function getUrlYears() { return getBaseUrl(); }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(htmlContent) {
    try {
        var movies = [];
        var seen = {};

        // Pattern bóc tách từng thẻ chứa phim
        var linkPattern = /<a[^>]*href="([^"]*\/phim\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
        var match;

        while ((match = linkPattern.exec(htmlContent)) !== null) {
            var href = match[1];
            var innerContent = match[2];

            // Rút gọn slug
            var slugMatch = /\/phim\/([^/]+)/.exec(href);
            var slug = slugMatch ? slugMatch[1] : "";
            slug = slug.replace(/\/$/, '');

            if (!slug || seen[slug]) continue;

            // Bóc tách Tiêu đề
            var titleMatch = /title="([^"]+)"/i.exec(match[0]) || 
                             /<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/i.exec(innerContent) ||
                             /alt="([^"]+)"/i.exec(innerContent);
            
            var title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, "").trim() : slug;

            // Bóc tách Ảnh
            var imgMatch = /(?:data-src|src)="([^"]+)"/i.exec(innerContent) || /(?:data-src|src)="([^"]+)"/i.exec(match[0]);
            var posterUrl = imgMatch ? imgMatch[1] : "";

            // Bóc tách Tập phim
            var epMatch = /<i>([^<]+)<\/i>/i.exec(innerContent) || /class="[^"]*eps[^"]*"[^>]*>([\s\S]*?)<\/span>/i.exec(innerContent);
            var episode_current = epMatch ? "Tập " + epMatch[1].replace(/<[^>]*>/g, "").trim() : "";

            seen[slug] = true;
            movies.push({
                id: slug,
                title: title,
                posterUrl: posterUrl,
                backdropUrl: posterUrl,
                year: 0,
                quality: "HD",
                episode_current: episode_current,
                lang: "Vietsub"
            });
        }

        // Bóc tách phân trang
        var totalPages = 1;
        var pageMatch = /trang-(\d+)\.html/gi;
        var pMatch;
        while ((pMatch = pageMatch.exec(htmlContent)) !== null) {
            var pNum = parseInt(pMatch[1]);
            if (pNum > totalPages) totalPages = pNum;
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
        var rawUrl = idMatch ? idMatch[1] : "";
        var slugMatch = /\/phim\/([^/]+)/.exec(rawUrl);
        var slug = slugMatch ? slugMatch[1] : "unknown";

        var titleMatch = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(htmlContent);
        var title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, "").trim() : "";

        var descMatch = /class="(?:Description|description|film-info-desc)"[^>]*>([\s\S]*?)<\/div>/i.exec(htmlContent);
        var description = descMatch ? descMatch[1].replace(/<[^>]*>/g, "").trim() : "";

        var posterMatch = /(?:data-src|src)="([^"]+)"/i.exec(htmlContent);
        var posterUrl = posterMatch ? posterMatch[1] : "";

        var genres = [];
        var genrePattern = /\/the-loai\/[^"]+"[^>]*>([^<]+)<\/a>/gi;
        var gMatch;
        var seenG = {};
        while ((gMatch = genrePattern.exec(htmlContent)) !== null) {
            var gName = gMatch[1].trim();
            if (!seenG[gName]) {
                seenG[gName] = true;
                genres.push(gName);
            }
        }

        // Bóc tách danh sách tập
        var episodes = [];
        var epPattern = /<a\s+[^>]*href="([^"]*\/tap-[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
        var epMatch;
        var seenEp = {};
        var baseUrl = getBaseUrl();

        while ((epMatch = epPattern.exec(htmlContent)) !== null) {
            var epUrl = epMatch[1];
            var epName = epMatch[2].replace(/<[^>]*>/g, "").trim();

            if (epUrl.indexOf('http') !== 0) {
                epUrl = baseUrl + (epUrl.startsWith('/') ? '' : '/') + epUrl;
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
                name: "Server Vietsub",
                episodes: episodes
            });
        }

        var extra = "";
        if (slug !== "unknown") {
            extra = baseUrl + "/phim/" + slug + "/xem-phim.html";
        }

        return JSON.stringify({
            id: slug,
            title: title,
            posterUrl: posterUrl,
            backdropUrl: posterUrl,
            description: description,
            year: 2024,
            servers: servers,
            episode_current: episodes.length > 0 ? "Tập " + episodes.length : "",
            lang: "Vietsub",
            quality: "FHD",
            category: genres,
            country: ["Nhật Bản"],
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
                    "Referer": pageUrl || "https://animevietsub.tv/",
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
                    "Referer": "https://animevietsub.tv/"
                },
                subtitles: []
            });
        }

        var nextUrlMatch = url.match(/nextUrl=([^&]+)/);
        var referer = nextUrlMatch ? decodeURIComponent(nextUrlMatch[1]) : "https://animevietsub.tv/";

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

function parseCategoriesResponse(htmlContent) {
    return "[]";
}

function parseCountriesResponse(htmlContent) { return "[]"; }
function parseYearsResponse(htmlContent) { return "[]"; }
