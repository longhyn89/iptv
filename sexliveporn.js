// =============================================================================
// SexLive.porn Plugin (ExoPlayer Optimized for SuperOK & Vax)
// =============================================================================

var BASEURL = "https://sexlive.porn";

function getManifest() {
    return JSON.stringify({
        "id": "sexliveporn",
        "name": "SexLive Porn",
        "description": "Nguồn livestream và video trực tuyến SexLive.porn Full HD.",
        "info": "Nguồn livestream và video trực tuyến SexLive.porn Full HD.",
        "version": "1.0.3",
        "baseUrl": BASEURL,
        "iconUrl": "https://raw.githubusercontent.com/hieu-TQS/movie-SuperOK/refs/heads/main/icons/sexlive.ico",
        "isEnabled": true,
        "isAdult": true,
        "type": "MOVIE",
        "playerType": "exoplayer"
    });
}

function decodeHtmlEntities(str) {
    if (!str) return "";
    return str
        .replace(/&#x([0-9a-fA-F]+);/g, function(match, hex) {
            return String.fromCharCode(parseInt(hex, 16));
        })
        .replace(/&#(\d+);/g, function(match, dec) {
            return String.fromCharCode(parseInt(dec, 10));
        })
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\s+/g, " ")
        .trim();
}

function buildMenu(listurl) {
    var menulist = [];
    var regex = /^([^@\r\n]+)@@([^@\r\n]+)(?:@@([^@\r\n]+))?/gm;
    var match;

    while ((match = regex.exec(listurl)) !== null) {
        var link = match[1].trim();
        var name = match[2].trim();
        var check = match[3] ? match[3].trim() : undefined;

        var item = {};
        if (check === "false") {
            item = { "slug": link, "title": name, "type": "Horizontal" };
        } else if (check === "true") {
            item = { "slug": link, "title": name, "type": "Grid" };
        } else {
            item = { "slug": link, "name": name, "value": link };
        }
        menulist.push(item);
    }
    return menulist;
}

function getHomeSections() {
    var listurl = ""
        + "/@@Mới Cập Nhật@@true\n"
        + "genres/stripchat@@Stripchat@@true\n"
        + "genres/mmlive@@MMLive@@true\n"
        + "genres/korean-bj@@Korean BJ@@true\n"
        + "genres/yylive@@YYLive@@true\n"
        + "genres/qqlive@@QQLive@@true\n"
        + "genres/onlyfanss@@Onlyfans Leak@@true\n"
        + "genres/chinese-girl@@Chinese Girl@@true\n"
        + "genres/hot51@@Hot51@@true\n"
        + "genres/love678@@Love678@@true\n"
        + "genres/fulllivehott@@FullLiveHot@@true\n"
        + "genres/hot-live@@Hot Live@@true\n"
        + "idols/anna-gau@@Anna Gấu@@false\n"
        + "idols/be-ngoc@@Bé Ngọc@@false\n"
        + "idols/suchibi@@Suchibi@@false\n"
        + "idols/tra-giang@@Trà Giang@@false\n"
        + "idols/nhu-y@@Như Ý@@false\n"
        + "idols/eira2004@@Eira2004@@false\n"
        + "idols/pandaclass@@PandaClass@@false";
    return JSON.stringify(buildMenu(listurl));
}

function getCategoryData() {
    return [
        { slug: "/", name: "Mới Cập Nhật" },
        { slug: "genres/stripchat", name: "Stripchat" },
        { slug: "genres/mmlive", name: "MMLive" },
        { slug: "genres/korean-bj", name: "KOREAN BJ" },
        { slug: "genres/yylive", name: "YYLive" },
        { slug: "genres/qqlive", name: "QQLive" },
        { slug: "genres/onlyfanss", name: "Onlyfans Leak" },
        { slug: "genres/chinese-girl", name: "CHINESE GIRL" },
        { slug: "genres/hot51", name: "Hot51" },
        { slug: "genres/love678", name: "Love678" },
        { slug: "genres/fulllivehott", name: "Fulllivehot" },
        { slug: "genres/qmh", name: "QMH" },
        { slug: "genres/phim-sex-sinh-vien", name: "Sinh Viên" },
        { slug: "genres/hot-live", name: "Hot Live" },
        { slug: "genres/hot-idol", name: "Hot Idol" },
        { slug: "genres/teen", name: "Teen" },
        { slug: "genres/some", name: "Some" },
        { slug: "genres/789live", name: "789Live" },
        { slug: "genres/clip-hot", name: "Clip Hot" },
        { slug: "genres/bdsm", name: "BDSM" },
        { slug: "genres/thu-dam", name: "Thủ Dâm" },
        { slug: "genres/hot-scandal", name: "Hot Scandal" },
        { slug: "genres/lo-clip", name: "Lộ Clip" },
        { slug: "genres/check-hang", name: "Check Hàng" },
        { slug: "genres/clip-phot", name: "Clip Phốt" },
        { slug: "genres/gachich", name: "Gạ Chịch" },
        { slug: "genres/swaglive", name: "Swaglive" },
        { slug: "genres/bigo-live", name: "Bigo Live" },
        { slug: "genres/pandatv-live", name: "Pandatv Live" },
        { slug: "idols/anna-gau", name: "Idol: Anna Gấu" },
        { slug: "idols/tra-giang", name: "Idol: Trà Giang" },
        { slug: "idols/suchibi", name: "Idol: Suchibi" },
        { slug: "idols/be-ngoc", name: "Idol: Bé Ngọc" },
        { slug: "idols/nhu-y", name: "Idol: Như Ý" },
        { slug: "idols/ha-my", name: "Idol: Hà My" },
        { slug: "idols/eira2004", name: "Idol: Eira2004" },
        { slug: "idols/jennie_spa", name: "Idol: Jennie_spa" },
        { slug: "idols/luna", name: "Idol: Luna" },
        { slug: "idols/ai-ngoc", name: "Idol: Ái Ngọc" },
        { slug: "idols/pandaclass", name: "Idol: PandaClass" },
        { slug: "idols/jinricp", name: "Idol: jinricp" },
        { slug: "idols/mscrew33", name: "Idol: mscrew33" },
        { slug: "idols/bejeni-sweet", name: "Idol: Bejeni Sweet" },
        { slug: "idols/moem9e9", name: "Idol: moem9e9" },
        { slug: "idols/spa14020", name: "Idol: spa14020" },
        { slug: "idols/loveu22", name: "Idol: loveu22" },
        { slug: "idols/theredtime", name: "Idol: theredtime" },
        { slug: "idols/hikikomori52", name: "Idol: hikikomori52" },
        { slug: "idols/podo0311", name: "Idol: podo0311" },
        { slug: "idols/moto7272", name: "Idol: moto7272" }
    ];
}

function getPrimaryCategories() {
    var cats = getCategoryData();
    var list = [];
    for (var i = 0; i < cats.length; i++) {
        list.push({ slug: cats[i].slug, name: cats[i].name, value: cats[i].slug });
    }
    return JSON.stringify(list);
}

function getFilterConfig() {
    var cats = getCategoryData();
    var list = [];
    for (var i = 0; i < cats.length; i++) {
        list.push({ name: cats[i].name, value: cats[i].slug });
    }
    return JSON.stringify({ category: list });
}

function getUrlList(slug, filtersJson) {
    try {
        var page = 1;
        var path = "";
        if (filtersJson) {
            var filters = null;
            if (typeof filtersJson === "number") {
                page = filtersJson;
            } else if (typeof filtersJson === "string") {
                try {
                    var fixedJson = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
                    filters = JSON.parse(fixedJson);
                } catch (e) {}
            } else if (typeof filtersJson === "object") {
                filters = filtersJson;
            }
            if (filters) {
                if (filters.page) page = parseInt(filters.page, 10) || 1;
                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) {
                        path = filters.category[0].slug || filters.category[0].value || path;
                    } else if (typeof filters.category === "string") {
                        path = filters.category;
                    }
                }
            }
        }
        if (!path) path = slug || "";
        var url = path;
        if (url.indexOf("http") !== 0) {
            if (url.charAt(0) === "/") url = url.substring(1);
            url = BASEURL + "/" + url;
        }
        if (page > 1) {
            if (url.indexOf("?") > -1) {
                url = url.replace(/([?&])p=\d+/i, "$1p=" + page);
                if (url.indexOf("p=") === -1) url += "&p=" + page;
            } else {
                url += "?p=" + page;
            }
        }
        return url;
    } catch (e) {
        return BASEURL + "/";
    }
}

function getUrlSearch(keyword, filtersJson) {
    var page = 1;
    if (filtersJson) {
        var filters = null;
        if (typeof filtersJson === "number") {
            page = filtersJson;
        } else if (typeof filtersJson === "string") {
            try {
                var fixedJson = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
                filters = JSON.parse(fixedJson);
            } catch (e) {}
        } else if (typeof filtersJson === "object") {
            filters = filtersJson;
        }
        if (filters && filters.page) page = parseInt(filters.page, 10) || 1;
    }
    var q = keyword ? encodeURIComponent(keyword) : "";
    var url = BASEURL + "/search?Keyword=" + q;
    if (page > 1) url += "&p=" + page;
    return url;
}

function getSearchUrl(q, page) { return getUrlSearch(q, page); }
function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.indexOf("http") === 0) return slug;
    if (slug.charAt(0) !== "/") slug = "/" + slug;
    return BASEURL + slug;
}

function getUrlEpisodePlayer(slug, episodeSlug, serverName) {
    if (episodeSlug && (episodeSlug.indexOf(".m3u8") > -1 || episodeSlug.indexOf("http") === 0)) {
        return episodeSlug;
    }
    return getUrlDetail(slug);
}

function parseListResponse(html, url) {
    try {
        var items = [];
        if (!html) return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1, hasNext: false } });

        var itemRegex = /<div class="item">([\s\S]*?)<\/div>\s*<\/div>/gi;
        var match;
        var seenLinks = {};

        while ((match = itemRegex.exec(html)) !== null) {
            var block = match[1];
            var linkMatch = block.match(/href="([^"]*\/view\/[^"]*)"/i);
            if (!linkMatch) continue;
            var link = linkMatch[1].trim();
            if (link.indexOf("http") !== 0) {
                if (link.charAt(0) !== "/") link = "/" + link;
                link = BASEURL + link;
            }
            if (seenLinks[link]) continue;
            seenLinks[link] = true;

            var titleMatch = block.match(/<h3[^>]*class="item__title"[^>]*>[\s\S]*?<a[^>]*title="([^"]*)"[^>]*>/i) ||
                             block.match(/<h3[^>]*class="item__title"[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i);
            var title = titleMatch ? decodeHtmlEntities(titleMatch[1].replace(/<[^>]+>/g, "").trim()) : "";

            var imgMatch = block.match(/<img[^>]+(?:src|data-src)="([^"]+)"/i);
            var posterUrl = imgMatch ? imgMatch[1].trim() : "";
            if (posterUrl && posterUrl.indexOf("http") !== 0) {
                if (posterUrl.charAt(0) !== "/") posterUrl = "/" + posterUrl;
                posterUrl = BASEURL + posterUrl;
            }

            items.push({
                "id": link,
                "title": title || "Video Live",
                "posterUrl": posterUrl,
                "backdropUrl": posterUrl,
                "year": 2026,
                "quality": "Full HD",
                "rating": ""
            });
        }

        var currentPage = 1;
        if (url) {
            var mPage = url.match(/[?&]p=(\d+)/i) || url.match(/[?&]page=(\d+)/i);
            if (mPage) currentPage = parseInt(mPage[1], 10) || 1;
        }

        return JSON.stringify({
            "items": items,
            "pagination": { "currentPage": currentPage, "totalPages": 999, "hasNext": items.length >= 24 }
        });
    } catch (e) {
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1, hasNext: false } });
    }
}

function parseList(html, url) { return parseListResponse(html, url); }
function parseHomeResponse(html, url) { return parseListResponse(html, url); }
function parseSearchResponse(html, url) { return parseListResponse(html, url); }
function parseSearchResult(html, url) { return parseListResponse(html, url); }

function parseMovieDetail(responseStr, url) {
    try {
        var title = "";
        var posterUrl = "";
        var description = "";
        var streamUrl = "";
        var serverEpisodes = [];

        if (!responseStr) return JSON.stringify({ "id": url || "", "title": "Không có dữ liệu", "servers": [] });

        var jsonLdMatch = responseStr.match(/<script\s+type="application\/ld(?:&#x2B;|\+)json">([\s\S]*?)<\/script>/i);
        if (jsonLdMatch) {
            try {
                var jld = JSON.parse(jsonLdMatch[1]);
                if (jld) {
                    if (jld.name) title = decodeHtmlEntities(jld.name);
                    if (jld.thumbnailUrl) posterUrl = jld.thumbnailUrl;
                    if (jld.description) description = decodeHtmlEntities(jld.description);
                    if (jld.embedUrl) streamUrl = jld.embedUrl;
                }
            } catch (e) {}
        }

        if (!title) {
            var tMatch = responseStr.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || responseStr.match(/<title>([^<]*)<\/title>/i);
            if (tMatch) title = decodeHtmlEntities(tMatch[1].replace(/<[^>]+>/g, "").trim());
        }

        if (!posterUrl) {
            var imgMatch = responseStr.match(/<meta\s+property="og:image"\s+content="([^"]*)"/i);
            if (imgMatch) posterUrl = imgMatch[1].trim();
        }

        if (!streamUrl) {
            var m3u8Match = responseStr.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
            if (m3u8Match) streamUrl = m3u8Match[0].trim();
        }

        var episodes = [{
            "id": streamUrl || url,
            "name": "Full HD",
            "slug": "full"
        }];

        serverEpisodes.push({
            "name": "ExoPlayer Server",
            "episodes": episodes
        });

        return JSON.stringify({
            "id": url || "",
            "title": title || "Video",
            "posterUrl": posterUrl,
            "backdropUrl": posterUrl,
            "description": description,
            "year": 2026,
            "rating": 5.0,
            "quality": "Full HD",
            "servers": serverEpisodes
        });
    } catch (e) {
        return JSON.stringify({ "id": url || "", "title": "Lỗi", "servers": [] });
    }
}

function parseDetail(responseStr, url) { return parseMovieDetail(responseStr, url); }

function parseDetailResponse(html, url) {
    try {
        var streamUrl = url || "";

        if (html) {
            var jsonLdMatch = html.match(/<script\s+type="application\/ld(?:&#x2B;|\+)json">([\s\S]*?)<\/script>/i);
            if (jsonLdMatch) {
                try {
                    var jld = JSON.parse(jsonLdMatch[1]);
                    if (jld && jld.embedUrl) streamUrl = jld.embedUrl;
                } catch (e) {}
            }
            if (!streamUrl || streamUrl.indexOf(".m3u8") === -1) {
                var m3u8Match = html.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
                if (m3u8Match) streamUrl = m3u8Match[0];
            }
        }

        // Cấu trúc tinh gọn chuẩn nhất cho ExoPlayer nhận diện luồng HLS
        return JSON.stringify({
            "url": streamUrl,
            "isEmbed": false,
            "mimeType": "application/x-mpegURL"
        });
    } catch (e) {
        return JSON.stringify({
            "url": url || "",
            "isEmbed": false,
            "mimeType": "application/x-mpegURL"
        });
    }
}

function parseEmbedResponse(html, url) { return parseDetailResponse(html, url); }
function parseEpisodePlayer(response, url) { return parseDetailResponse(response, url); }
function parsePlayerUrl(response, url) { return parseDetailResponse(response, url); }
function parseCategoriesResponse(apiResponseJson) { return JSON.stringify(getCategoryData()); }
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
