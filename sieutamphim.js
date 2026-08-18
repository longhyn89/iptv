// ========================================================
// SIÊU TẦM PHIM VAAPP PLUGIN - BẢN FIX FULL CHUẨN URL & PLAYER V3.0.0
// ========================================================

var BASE_URL = "https://www.sieutamphim.pro";
var popup_html = "<div class='donate-container'><h2 class='donate-heading'>DONATE</h2><p class='donate-description'>Mời nhóm phát triển 2 ly cà phê để duy trì Plugin nhé!</p></div>";

function getManifest() {
  return JSON.stringify({
    "id": "sieutamphim",
    "name": "Sưu Tầm Phim",
    "version": "3.0.0",
    "baseUrl": BASE_URL,
    "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/sieutamphim.png",
    "isEnabled": true,
    "isAdult": false,
    "type": "MOVIE",
    popup_html: popup_html,
    "layoutType": "VERTICAL",
    "playerType": "exoplayer"
  });
}

function log(msg) {
  if (typeof nativeLog !== 'undefined') {
    nativeLog("[STPhim] " + msg);
  }
}

function getSlugFromUrl(url) {
  if (!url) return "";
  var cleanUrl = url.split("?")[0].split("#")[0];
  var match = cleanUrl.match(/\/([^\/]+)\.html$/i);
  if (match) return match[1];
  var parts = cleanUrl.split("/");
  var last = parts[parts.length - 1] || parts[parts.length - 2] || "";
  return last.replace(".html", "");
}

function getStandardHeaders() {
  return {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Referer": BASE_URL + "/",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
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
// PARSE MOVIE DETAIL (FIX DỨT ĐIỂM LỖI NĂM PHÁT HÀNH)
// ========================================================

function parseMovieDetail(html, url) {
  try {
    var title = "", poster = "", description = "", releaseYear = "";

    // 1. Trích xuất Năm phát hành trực tiếp từ cấu trúc URL (Ví dụ: /2026/07/...)
    var urlYearMatch = url.match(/\/([12]\d{3})\/(\d{2})\//);
    if (urlYearMatch) {
      releaseYear = urlYearMatch[1];
    }

    // 2. Dự phòng lấy năm trong thẻ meta / tiêu đề nếu URL không có
    if (!releaseYear) {
      var metaYearMatch = html.match(/article:published_time["']\s+content=["']([12]\d{3})/i) || html.match(/\b(202[0-6]|201[0-9])\b/);
      releaseYear = metaYearMatch ? metaYearMatch[1] : "2026";
    }

    // 3. Têu đề & Ảnh
    title = (html.match(/<meta property=["']og:title["'] content=["']([^"']+)["']/i) || [])[1] || "";
    if (!title) {
      var tMatch = html.match(/<h1[^>]*class=["'][^"']*entry-title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i);
      title = tMatch ? tMatch[1].replace(/<[^>]*>/g, "").trim() : "";
    }

    poster = (html.match(/<meta property=["']og:image["'] content=["']([^"']+)["']/i) || [])[1] || "";
    description = (html.match(/<meta property=["']og:description["'] content=["']([^"']+)["']/i) || [])[1] || "";

    var cleanUrl = url.split("?")[0].split("#")[0];
    var episodes = [];

    // 4. Bóc tách danh sách tập phim từ Menu Server/Episode List trên trang
    var epRegex = /href=["']([^"']*(?:\?|&amp;|&)tap=\d+[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
    var match;
    var usedEp = {};

    while ((match = epRegex.exec(html)) !== null) {
      var epUrl = match[1].replace(/&amp;/g, "&");
      var epName = match[2].replace(/<[^>]*>/g, "").trim();
      if (!epUrl.startsWith("http")) epUrl = BASE_URL + epUrl;

      if (!usedEp[epUrl] && epName) {
        usedEp[epUrl] = true;
        episodes.push({
          id: epUrl,
          name: epName.length > 15 ? ("Tập " + episodes.length + 1) : epName,
          slug: "tap-" + (episodes.length + 1)
        });
      }
    }

    // Nếu không tìm thấy danh sách tập dạng menu, tạo tập mặc định theo đường dẫn hiện tại
    if (episodes.length === 0) {
      episodes.push({
        id: url,
        name: "Tập 1 / Full",
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
      servers: [{ name: "VIP SERVER", episodes: episodes }]
    });
  } catch (e) {
    return JSON.stringify({ servers: [] });
  }
}

// ========================================================
// PARSE STREAM (FIX LỖI KẾT NỐI SERVER & LẤY PLAYER)
// ========================================================

function parseDetailResponse(html, url) {
  try {
    var headers = getStandardHeaders();

    // 1. Quét iframe Embed Player (Okru, Hydrax, Dood, Fembed, Hxfile, v.v...)
    var iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    if (iframeMatch) {
      var embedSrc = iframeMatch[1];
      if (embedSrc.startsWith("//")) embedSrc = "https:" + embedSrc;
      return JSON.stringify({
        url: embedSrc,
        isEmbed: true,
        headers: headers
      });
    }

    // 2. Quét luồng m3u8 trực tiếp trong nguồn trang
    var m3u8Match = html.match(/(https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)/i);
    if (m3u8Match) {
      return JSON.stringify({
        url: m3u8Match[1],
        mimeType: "application/x-mpegURL",
        isEmbed: false,
        headers: headers
      });
    }

    // 3. Dự phòng mở trang qua Embed Player
    return JSON.stringify({
      url: url,
      isEmbed: true,
      headers: headers
    });

  } catch (e) {
    return JSON.stringify({ url: url, isEmbed: true });
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
