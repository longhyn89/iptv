// ========================================================
// SIÊU TẦM PHIM VAAPP PLUGIN - DYNAMIC INTERCEPTOR V9.0.0
// ========================================================

var BASE_URL = "https://www.sieutamphim.pro";
var popup_html = "<div class='donate-container'><h2 class='donate-heading'>DONATE</h2><p class='donate-description'>Mời nhóm phát triển 2 ly cà phê để duy trì Plugin nhé!</p></div>";

function getManifest() {
  return JSON.stringify({
    "id": "sieutamphim",
    "name": "Sưu Tầm Phim",
    "version": "9.0.0",
    "baseUrl": BASE_URL,
    "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/sieutamphim.png",
    "isEnabled": true,
    "isAdult": false,
    "type": "MOVIE",
    popup_html: popup_html,
    "layoutType": "VERTICAL",
    "playerType": "webview"
  });
}

function getStandardHeaders(refererUrl) {
  return {
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Mobile/15E148 Safari/604.1",
    "Referer": refererUrl || (BASE_URL + "/")
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
// PARSE DETAIL & EPISODES
// ========================================================

function parseMovieDetail(html, url) {
  try {
    var cleanUrl = url.split("?")[0].split("#")[0];
    var title = (html.match(/<meta property=["']og:title["'] content=["']([^"']+)["']/i) || [])[1] || "Phim";
    var poster = (html.match(/<meta property=["']og:image["'] content=["']([^"']+)["']/i) || [])[1] || "";
    var description = (html.match(/<meta property=["']og:description["'] content=["']([^"']+)["']/i) || [])[1] || "";

    var episodes = [];
    var used = {};

    // Quét tìm mảng biến tập phim nếu web lưu dưới dạng var halim / episodes / list_ep
    var jsonEpMatch = html.match(/var\s+(?:episodes|list_ep|halim_episodes)\s*=\s*(\[[\s\S]*?\]);/i);
    if (jsonEpMatch) {
      try {
        var rawEps = JSON.parse(jsonEpMatch[1]);
        for (var k = 0; k < rawEps.length; k++) {
          var epItem = rawEps[k];
          var epName = epItem.name || epItem.episode || ("Tập " + (k + 1));
          var epLink = epItem.link || epItem.url || epItem.file || (cleanUrl + "?sv=1&ep=" + (k + 1));
          episodes.push({
            id: epLink,
            name: epName,
            slug: "tap-" + (k + 1)
          });
        }
      } catch (err) {}
    }

    // Nếu không trích xuất được JS Object, quét các thẻ option / id trong player
    if (episodes.length === 0) {
      var optRegex = /<option[^>]+value=["']([^"']+)["'][^>]*>([\s\S]*?)<\/option>/gi;
      var optMatch;
      while ((optMatch = optRegex.exec(html)) !== null) {
        var val = optMatch[1];
        var txt = optMatch[2].replace(/<[^>]*>/g, "").trim();
        if (txt && (txt.match(/Tập/i) || txt.match(/Ep/i) || val.match(/tap/i))) {
          if (!used[val]) {
            used[val] = true;
            episodes.push({ id: val.startsWith("http") ? val : (cleanUrl + "?ep=" + val), name: txt, slug: val });
          }
        }
      }
    }

    // Mặc định fallback 1 tập nếu là phim lẻ
    if (episodes.length === 0) {
      episodes.push({
        id: cleanUrl,
        name: "Xem Phim",
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
      servers: [{ name: "Server Chính", episodes: episodes }]
    });
  } catch (e) {
    return JSON.stringify({ servers: [] });
  }
}

// ========================================================
// PARSE STREAM (WEBVIEW CLEANER)
// ========================================================

function parseDetailResponse(html, url) {
  var headers = getStandardHeaders(url);

  // Bắt link m3u8 nếu tìm thấy trực tiếp
  var m3u8Match = html.match(/(https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)/i);
  if (m3u8Match) {
    return JSON.stringify({
      url: m3u8Match[1],
      mimeType: "application/x-mpegURL",
      isEmbed: false,
      headers: headers
    });
  }

  // Nếu không có m3u8, gửi URL dạng WebView kèm header chặn popup
  return JSON.stringify({
    url: url,
    isEmbed: true,
    headers: headers
  });
}

function parseEmbedResponse(html, sourceUrl, datasend) {
  return parseDetailResponse(html, sourceUrl);
}

function decodeHtmlEntities(str) {
  if (!str) return "";
  return str.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}

function parseCategoriesResponse(html) { return "[]"; }
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
