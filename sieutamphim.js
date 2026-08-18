// ========================================================
// SIÊU TẦM PHIM VAAPP PLUGIN - BẢN HYBRID WEBVIEW FALLBACK
// ========================================================

var BASE_URL = "https://www.sieutamphim.pro";
var popup_html = "<div class='donate-container'><h2 class='donate-heading'>DONATE</h2><p class='donate-description'>Mời nhóm phát triển 2 ly cà phê để duy trì Plugin nhé!</p></div>";

function getManifest() {
  return JSON.stringify({
    "id": "sieutamphim",
    "name": "Sưu Tầm Phim",
    "version": "2.1.0",
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

function getHomeSections() {
  return JSON.stringify([
    { slug: "phim-bo", title: "Phim Bộ Mới", type: "Horizontal" },
    { slug: "phim-le", title: "Phim Lẻ Mới", type: "Horizontal" },
    { slug: "long-tieng", title: "Phim Lồng Tiếng", type: "Horizontal" },
    { slug: "thuyet-minh", title: "Phim Thuyết Minh", type: "Horizontal" },
    { slug: "phim-moi", title: "Mới cập nhật", type: "Grid" }
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
  if (id.startsWith("play-")) {
    return id.replace("play-", "");
  }
  if (id.startsWith("http")) return id;
  return BASE_URL + "/" + id + ".html";
}

function parseListResponse(html) {
  try {
    var items = [];
    var used = {};
    var chunks = html.split('class="col post-item"');
    for (var i = 1; i < chunks.length; i++) {
      var blockHtml = chunks[i];
      var urlMatch = blockHtml.match(/href="([^"]+\.html)"/i);
      if (!urlMatch) continue;

      var url = urlMatch[1];
      if (!url.startsWith("http")) url = BASE_URL + url;
      if (used[url]) continue;
      used[url] = true;

      var titleMatch = blockHtml.match(/post-title[^>]*?>([\s\S]*?)<\/a>/i) || blockHtml.match(/alt="([^"]+)"/i);
      var title = titleMatch ? decodeHtmlEntities(titleMatch[1].replace(/<[^>]*>/g, "")) : "Unknown";

      var posterMatch = blockHtml.match(/data-src="([^"]+)"/i) || blockHtml.match(/src="([^"]+)"/i);
      var poster = posterMatch ? posterMatch[1] : "";
      if (poster.startsWith("//")) poster = "https:" + poster;

      items.push({
        id: getSlugFromUrl(url),
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

function parseMovieDetail(html, url) {
  try {
    var title = "", poster = "", description = "", releaseYear = "2024";

    title = (html.match(/<meta property="og:title" content="([^"]+)"/i) || [])[1] || "";
    if (!title) {
      var tMatch = html.match(/<h1[^>]*class="[^"]*entry-title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i);
      title = tMatch ? tMatch[1].replace(/<[^>]*>/g, "").trim() : "";
    }

    poster = (html.match(/<meta property="og:image" content="([^"]+)"/i) || [])[1] || "";
    description = (html.match(/<meta property="og:description" content="([^"]+)"/i) || [])[1] || "";

    var yearMatch = html.match(/\b(19\d\d|20\d\d)\b/);
    if (yearMatch) {
      releaseYear = yearMatch[1];
    }

    var cleanUrl = url.split("#")[0].split("?")[0];
    var servers = [];

    // Tạo danh sách tập hướng về URL trang phát Webview
    var epMatches = html.match(/class=["']episode-item["'][^>]*>([\s\S]*?)<\/a>/gi) || [];
    var episodes = [];

    if (epMatches.length > 0) {
      for (var i = 0; i < epMatches.length; i++) {
        var epUrlMatch = epMatches[i].match(/href=["']([^"']+)["']/i);
        var epNameMatch = epMatches[i].match(/>([^<]+)<\/a>/i);
        var epUrl = epUrlMatch ? epUrlMatch[1] : cleanUrl;
        if (!epUrl.startsWith("http")) epUrl = BASE_URL + epUrl;

        episodes.push({
          id: "play-" + epUrl,
          name: epNameMatch ? epNameMatch[1].trim() : "Tập " + (i + 1),
          slug: "tap-" + (i + 1)
        });
      }
    } else {
      episodes.push({
        id: "play-" + cleanUrl,
        name: "Full",
        slug: "full"
      });
    }

    servers.push({ name: "VIP SERVER", episodes: episodes });

    return JSON.stringify({
      id: getSlugFromUrl(cleanUrl),
      title: decodeHtmlEntities(title.replace(" - Siêu Tầm Phim", "").trim()),
      posterUrl: poster,
      backdropUrl: poster,
      description: description,
      releaseYear: releaseYear,
      year: releaseYear,
      servers: servers
    });
  } catch (e) {
    return JSON.stringify({ servers: [] });
  }
}

function parseDetailResponse(html, url) {
  try {
    // Ưu tiên trích xuất Iframe nếu có
    var iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    if (iframeMatch) {
      var embedSrc = iframeMatch[1];
      if (embedSrc.startsWith("//")) embedSrc = "https:" + embedSrc;
      return JSON.stringify({
        url: embedSrc,
        isEmbed: true,
        headers: { "Referer": BASE_URL + "/", "User-Agent": "Mozilla/5.0" }
      });
    }

    // Luôn trả về URL trang phát nếu không trích xuất được trực tiếp
    var playUrl = url.replace("play-", "");
    return JSON.stringify({
      url: playUrl,
      isEmbed: true,
      headers: { "Referer": BASE_URL + "/", "User-Agent": "Mozilla/5.0" }
    });
  } catch (e) {
    return JSON.stringify({ url: BASE_URL, isEmbed: true });
  }
}

function parseEmbedResponse(html, sourceUrl, datasend) {
  return parseDetailResponse(html, sourceUrl);
}

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
