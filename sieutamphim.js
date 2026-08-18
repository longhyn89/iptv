// ========================================================
// SIÊU TẦM PHIM VAAPP PLUGIN - NATIVE EXOPLAYER V10.0.0
// ========================================================

var BASE_URL = "https://www.sieutamphim.pro";
var popup_html = "<div class='donate-container'><h2 class='donate-heading'>DONATE</h2><p class='donate-description'>Mời nhóm phát triển 2 ly cà phê để duy trì Plugin nhé!</p></div>";

function getManifest() {
  return JSON.stringify({
    "id": "sieutamphim",
    "name": "Sưu Tầm Phim",
    "version": "10.0.0",
    "baseUrl": BASE_URL,
    "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/sieutamphim.png",
    "isEnabled": true,
    "isAdult": false,
    "type": "MOVIE",
    popup_html: popup_html,
    "layoutType": "VERTICAL",
    "playerType": "exoplayer" // Bắt buộc ExoPlayer
  });
}

function getStandardHeaders(refererUrl) {
  return {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Referer": refererUrl || (BASE_URL + "/"),
    "Origin": BASE_URL
  };
}

// ========================================================
// HOME & SEARCH
// ========================================================

function getHomeSections() {
  return JSON.stringify([
    { slug: "phim-bo", title: "Phim Bộ Mới", type: "Horizontal" },
    { slug: "phim-le", title: "Phim Lẻ Mới", type: "Horizontal" },
    { slug: "long-tieng", title: "Phim Lồng Tiếng", type: "Horizontal" },
    { slug: "thuyet-minh", title: "Phim Thuyết Minh", type: "Horizontal" }
  ]);
}

function getPrimaryCategories() {
  return JSON.stringify([
    { name: 'Phim Lẻ', slug: 'phim-le' },
    { name: 'Phim Bộ', slug: 'phim-bo' },
    { name: 'Hoạt Hình', slug: 'hoat-hinh' },
    { name: 'Phim Hàn Quốc', slug: 'phim-han-quoc' },
    { name: 'Phim Trung Quốc', slug: 'phim-trung-quoc' }
  ]);
}

function getFilterConfig() { return JSON.stringify({ sort: [], category: [] }); }

function getUrlList(slug, filtersJson) {
  var filters = JSON.parse(filtersJson || "{}");
  var page = filters.page || 1;
  if (page === 1) return BASE_URL + "/search/label/" + slug;
  return BASE_URL + "/search/label/" + slug + "/page/" + page;
}

function getUrlSearch(keyword, filtersJson) {
  var filters = JSON.parse(filtersJson || "{}");
  var page = filters.page || 1;
  return BASE_URL + "/page/" + page + "?s=" + encodeURIComponent(keyword);
}

function getUrlDetail(id) {
  if (!id) return "";
  if (id.startsWith("http")) return id;
  return BASE_URL + "/" + id + ".html";
}

// ========================================================
// PARSE LIST
// ========================================================

function parseListResponse(html) {
  try {
    var items = [];
    var used = {};
    var chunks = html.split(/class=["']col post-item["']/i);
    if (chunks.length <= 1) chunks = html.split(/class=["'][^"']*post-col[^"']*["']/i);

    for (var i = 1; i < chunks.length; i++) {
      var blockHtml = chunks[i];
      var urlMatch = blockHtml.match(/href=["']([^"']+\.html|[^"']*\?p=\d+)["']/i);
      if (!urlMatch) continue;

      var url = urlMatch[1];
      if (!url.startsWith("http")) url = BASE_URL + url;
      if (used[url]) continue;
      used[url] = true;

      var titleMatch = blockHtml.match(/post-title[^>]*?>([\s\S]*?)<\/a>/i) || blockHtml.match(/alt=["']([^"']+)["']/i);
      var title = titleMatch ? decodeHtmlEntities(titleMatch[1].replace(/<[^>]*>/g, "")) : "Phim";

      var posterMatch = blockHtml.match(/data-src=["']([^"']+)["']/i) || blockHtml.match(/src=["']([^"']+)["']/i);
      var poster = posterMatch ? posterMatch[1] : "";
      if (poster.startsWith("//")) poster = "https:" + poster;

      items.push({
        id: url,
        title: title,
        posterUrl: poster
      });
    }

    return JSON.stringify({ items: items, pagination: { currentPage: 1, totalPages: 999 } });
  } catch (e) {
    return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
  }
}

function parseSearchResponse(html) { return parseListResponse(html); }

// ========================================================
// PARSE MOVIE DETAIL (LẤY TẬP TRONG MÃ NGUỒN)
// ========================================================

function parseMovieDetail(html, url) {
  try {
    var cleanUrl = url.split("?")[0].split("#")[0];
    var title = (html.match(/<meta property=["']og:title["'] content=["']([^"']+)["']/i) || [])[1] || "Phim";
    var poster = (html.match(/<meta property=["']og:image["'] content=["']([^"']+)["']/i) || [])[1] || "";
    var description = (html.match(/<meta property=["']og:description["'] content=["']([^"']+)["']/i) || [])[1] || "";

    var episodes = [];
    var used = {};

    // 1. Quét tìm danh sách tập từ mảng JSON/Script
    var epRegex = /href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    var match;
    while ((match = epRegex.exec(html)) !== null) {
      var href = match[1].replace(/&amp;/g, "&");
      var text = match[2].replace(/<[^>]*>/g, "").trim();

      if (text && (text.match(/^Tập\s*\d+/i) || text.match(/^Ep\s*\d+/i))) {
        if (!href.startsWith("http")) href = BASE_URL + (href.startsWith("/") ? "" : "/") + href;
        if (!used[href]) {
          used[href] = true;
          episodes.push({
            id: href,
            name: text,
            slug: "tap-" + (episodes.length + 1)
          });
        }
      }
    }

    // 2. Fallback nếu không quét được tập
    if (episodes.length === 0) {
      episodes.push({
        id: cleanUrl,
        name: "Phim Full",
        slug: "full"
      });
    }

    return JSON.stringify({
      id: cleanUrl,
      title: decodeHtmlEntities(title.replace(" - Siêu Tầm Phim", "").trim()),
      posterUrl: poster,
      backdropUrl: poster,
      description: description,
      releaseYear: "2026",
      servers: [{ name: "VIP ExoPlayer", episodes: episodes }]
    });
  } catch (e) {
    return JSON.stringify({ servers: [] });
  }
}

// ========================================================
// PARSE STREAM (UNPACK & TRÍCH XUẤT M3U8 NATIVE EXOPLAYER)
// ========================================================

function parseDetailResponse(html, url) {
  try {
    var headers = getStandardHeaders(url);

    // 1. Quét luồng m3u8 trực tiếp trong HTML
    var m3u8Match = html.match(/(https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)/i);
    if (m3u8Match) {
      return JSON.stringify({
        url: m3u8Match[1],
        mimeType: "application/x-mpegURL",
        isEmbed: false,
        headers: headers
      });
    }

    // 2. Tự động Unpack các đoạn mã JS mã hóa (eval(function(p,a,c,k,e,d)...))
    var packedMatches = html.match(/eval\(function\(p,a,c,k,e,d\)[\s\S]*?\)\)/gi) || [];
    for (var i = 0; i < packedMatches.length; i++) {
      var unpacked = unpackJS(packedMatches[i]);
      var streamUrl = (unpacked.match(/(https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)/i) || [])[1] ||
                        (unpacked.match(/(https?:\/\/[^"'\s]+\.mp4[^"'\s]*)/i) || [])[1];
      if (streamUrl) {
        return JSON.stringify({
          url: streamUrl,
          mimeType: streamUrl.includes(".m3u8") ? "application/x-mpegURL" : "video/mp4",
          isEmbed: false,
          headers: headers
        });
      }
    }

    // 3. Quét link iframe player ẩn
    var iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    if (iframeMatch) {
      var embedSrc = iframeMatch[1];
      if (embedSrc.startsWith("//")) embedSrc = "https:" + embedSrc;
      return JSON.stringify({
        url: embedSrc,
        isEmbed: false, // Ép ExoPlayer tự bắt luồng stream từ iframe này
        headers: headers
      });
    }

    return JSON.stringify({ url: url, isEmbed: false, headers: headers });
  } catch (e) {
    return JSON.stringify({ url: url, isEmbed: false, headers: getStandardHeaders(url) });
  }
}

function parseEmbedResponse(html, sourceUrl, datasend) {
  return parseDetailResponse(html, sourceUrl);
}

// ========================================================
// TOOL UNPACK JAVASCRIPT ĐỂ BÓC M3U8
// ========================================================

function unpackJS(packed) {
  try {
    var reg = new RegExp("}\\('(.*)',\\s*(\\d+),\\s*(\\d+),\\s*'(.*)'\\.split\\('\\|'\\)", "i");
    var matches = packed.match(reg);
    if (!matches) return packed;
    
    var p = matches[1], a = parseInt(matches[2]), c = parseInt(matches[3]), k = matches[4].split('|');
    while (c--) {
      if (k[c]) p = p.replace(new RegExp('\\b' + c.toString(a) + '\\b', 'g'), k[c]);
    }
    return p;
  } catch (e) {
    return packed;
  }
}

function decodeHtmlEntities(str) {
  if (!str) return "";
  return str.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}

function parseCategoriesResponse(html) { return "[]"; }
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
