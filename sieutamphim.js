// ========================================================
// SIÊU TẦM PHIM VAAPP PLUGIN - FIX FULL TẬP & WEBVIEW PLAYER V4.0.0
// ========================================================

var BASE_URL = "https://www.sieutamphim.pro";
var popup_html = "<div class='donate-container'><h2 class='donate-heading'>DONATE</h2><p class='donate-description'>Mời nhóm phát triển 2 ly cà phê để duy trì Plugin nhé!</p></div>";

function getManifest() {
  return JSON.stringify({
    "id": "sieutamphim",
    "name": "Sưu Tầm Phim",
    "version": "4.0.0",
    "baseUrl": BASE_URL,
    "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/sieutamphim.png",
    "isEnabled": true,
    "isAdult": false,
    "type": "MOVIE",
    popup_html: popup_html,
    "layoutType": "VERTICAL",
    "playerType": "webview" // Chuyển sang webview để tối ưu phát các nguồn Player dạng Iframe
  });
}

function log(msg) {
  if (typeof nativeLog !== 'undefined') {
    nativeLog("[STPhim] " + msg);
  }
}

function getStandardHeaders(refererUrl) {
  return {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Referer": refererUrl || (BASE_URL + "/"),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
  };
}

// ========================================================
// HOME & CATEGORY
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
// PARSE MOVIE DETAIL (QUÉT VÀ BẮT TẬP TỰ ĐỘNG)
// ========================================================

function parseMovieDetail(html, url) {
  try {
    var title = "", poster = "", description = "", releaseYear = "2026";

    // 1. Lấy năm phát hành
    var urlYearMatch = url.match(/\/([12]\d{3})\/(\d{2})\//);
    if (urlYearMatch) {
      releaseYear = urlYearMatch[1];
    } else {
      var metaYearMatch = html.match(/article:published_time["']\s+content=["']([12]\d{3})/i) || html.match(/\b(202[0-6]|201[0-9])\b/);
      if (metaYearMatch) releaseYear = metaYearMatch[1];
    }

    // 2. Tiêu đề & Ảnh
    title = (html.match(/<meta property=["']og:title["'] content=["']([^"']+)["']/i) || [])[1] || "";
    if (!title) {
      var tMatch = html.match(/<h1[^>]*class=["'][^"']*entry-title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i);
      title = tMatch ? tMatch[1].replace(/<[^>]*>/g, "").trim() : "";
    }

    poster = (html.match(/<meta property=["']og:image["'] content=["']([^"']+)["']/i) || [])[1] || "";
    description = (html.match(/<meta property=["']og:description["'] content=["']([^"']+)["']/i) || [])[1] || "";

    var cleanUrl = url.split("?")[0].split("#")[0];
    var episodes = [];
    var usedEp = {};

    // CƠ CHẾ 1: Tìm nút tập trong danh sách li/span/a
    var listBlockMatch = html.match(/class=["'](?:list-episode|episodes-list|server-list|halim-list-eps)[^"']*["']>([\s\S]*?)<\/ul>/i) ||
                       html.match(/class=["'](?:list-episode|episodes-list|server-list|halim-list-eps)[^"']*["']>([\s\S]*?)<\/div>/i);
    var searchArea = listBlockMatch ? listBlockMatch[1] : html;

    var epRegex = /(?:href=["']([^"']+)["'][^>]*>|data-id=["']([^"']+)["'][^>]*>|data-href=["']([^"']+)["'][^>]*>)([\s\S]*?)<\/(?:a|span|li|button)>/gi;
    var match;

    while ((match = epRegex.exec(searchArea)) !== null) {
      var epUrl = match[1] || match[2] || match[3] || "";
      var epName = match[4].replace(/<[^>]*>/g, "").trim();

      if (epName && (epName.match(/Tập|\d+/i) || epName === "Full")) {
        if (epUrl && !epUrl.startsWith("http") && !epUrl.startsWith("#") && !epUrl.startsWith("javascript")) {
          epUrl = BASE_URL + (epUrl.startsWith("/") ? "" : "/") + epUrl;
        } else if (!epUrl || epUrl.startsWith("#") || epUrl.startsWith("javascript")) {
          var epNumMatch = epName.match(/\d+/);
          var epNum = epNumMatch ? epNumMatch[0] : (episodes.length + 1);
          epUrl = cleanUrl + "?tap=" + epNum;
        }

        if (!usedEp[epUrl]) {
          usedEp[epUrl] = true;
          episodes.push({
            id: epUrl,
            name: epName.length > 20 ? ("Tập " + (episodes.length + 1)) : epName,
            slug: "tap-" + (episodes.length + 1)
          });
        }
      }
    }

    // CƠ CHẾ 2: Nếu chỉ tìm thấy <= 1 tập, quét xem phim có tổng số tập (VD: Tập 12/12, Tập 24) không
    if (episodes.length <= 1) {
      var totalEpsMatch = html.match(/(?:Tập|Episode)\s*(\d+)\s*\/\s*(\d+)/i) || html.match(/(\d+)\s*Tập/i);
      var totalEps = 1;
      if (totalEpsMatch) {
        totalEps = parseInt(totalEpsMatch[2] || totalEpsMatch[1]);
      }

      if (totalEps > 1) {
        episodes = [];
        for (var e = 1; e <= totalEps; e++) {
          var targetEpUrl = cleanUrl + "?tap=" + e;
          episodes.push({
            id: targetEpUrl,
            name: "Tập " + e,
            slug: "tap-" + e
          });
        }
      }
    }

    // CƠ CHẾ 3: Dự phòng cho Phim lẻ
    if (episodes.length === 0) {
      episodes.push({
        id: url,
        name: "Tập Full",
        slug: "full"
      });
    }

    return JSON.stringify({
      id: cleanUrl,
      title: decodeHtmlEntities(title.replace(" - Siêu Tầm Phim", "").trim()),
      posterUrl: poster,
      backdropUrl: poster,
      description: description,
      releaseYear: releaseYear,
      year: releaseYear,
      servers: [{ name: "SERVER VIP", episodes: episodes }]
    });
  } catch (e) {
    return JSON.stringify({ servers: [] });
  }
}

// ========================================================
// PARSE STREAM (TRÍCH XUẤT NGUỒN PHÁT WEBVIEW)
// ========================================================

function parseDetailResponse(html, url) {
  try {
    var headers = getStandardHeaders(url);

    // 1. Lấy link IFRAME trực tiếp
    var iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    if (iframeMatch) {
      var embedUrl = iframeMatch[1];
      if (embedUrl.startsWith("//")) embedUrl = "https:" + embedUrl;
      
      // Nếu có Iframe player (dạng Hxfile, Doodstream, Hydrax, Okru, v.v...)
      if (!embedUrl.includes("facebook.com") && !embedUrl.includes("googletagmanager")) {
        return JSON.stringify({
          url: embedUrl,
          isEmbed: true,
          headers: getStandardHeaders(embedUrl)
        });
      }
    }

    // 2. Lấy link M3U8 trực tiếp nếu có
    var m3u8Match = html.match(/(https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)/i);
    if (m3u8Match) {
      return JSON.stringify({
        url: m3u8Match[1],
        mimeType: "application/x-mpegURL",
        isEmbed: false,
        headers: headers
      });
    }

    // 3. Trả về chính URL tập phim
    return JSON.stringify({
      url: url,
      isEmbed: true,
      headers: headers
    });

  } catch (e) {
    return JSON.stringify({ url: url, isEmbed: true, headers: getStandardHeaders(url) });
  }
}

function parseEmbedResponse(html, sourceUrl, datasend) {
  return parseDetailResponse(html, sourceUrl);
}

// ========================================================
// HELPERS
// ========================================================

function decodeHtmlEntities(str) {
  if (!str) return "";
  return str
    .replace(/&#8211;/g, "-").replace(/&#8212;/g, "-")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ").trim();
}

function parseCategoriesResponse(html) { return "[]"; }
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
