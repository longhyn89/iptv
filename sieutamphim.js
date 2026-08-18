// ========================================================
// SIÊU TẦM PHIM VAAPP PLUGIN - BẢN FIX FULL SCRIPT V8.0.0
// ========================================================

var BASE_URL = "https://www.sieutamphim.pro";
var popup_html = "<div class='donate-container'><h2 class='donate-heading'>DONATE</h2><p class='donate-description'>Mời nhóm phát triển 2 ly cà phê để duy trì Plugin nhé!</p></div>";

function getManifest() {
  return JSON.stringify({
    "id": "sieutamphim",
    "name": "Sưu Tầm Phim",
    "version": "8.0.0",
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

function getStandardHeaders(refererUrl) {
  return {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Referer": refererUrl || (BASE_URL + "/"),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
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
// PARSE MOVIE DETAIL (QUÉT ĐA TẦNG JAVASCRIPT & HTML)
// ========================================================

function parseMovieDetail(html, url) {
  try {
    var title = "", poster = "", description = "", releaseYear = "2026";

    var urlYearMatch = url.match(/\/([12]\d{3})\/(\d{2})\//);
    if (urlYearMatch) releaseYear = urlYearMatch[1];

    title = (html.match(/<meta property=["']og:title["'] content=["']([^"']+)["']/i) || [])[1] || "";
    poster = (html.match(/<meta property=["']og:image["'] content=["']([^"']+)["']/i) || [])[1] || "";
    description = (html.match(/<meta property=["']og:description["'] content=["']([^"']+)["']/i) || [])[1] || "";

    var cleanUrl = url.split("?")[0].split("#")[0];
    var episodes = [];
    var usedEp = {};

    // PHƯƠNG PHÁP 1: Bóc tách danh sách từ Script JS/JSON nhúng ngầm
    var scriptMatches = html.match(/<script[\s\S]*?<\/script>/gi) || [];
    for (var s = 0; s < scriptMatches.length; s++) {
      var scriptContent = scriptMatches[s];
      if (scriptContent.includes("episode") || scriptContent.includes("tap") || scriptContent.includes("link") || scriptContent.includes("file")) {
        
        // Quét dạng Json Object hoặc Link iframe/m3u8 nằm trong script
        var linkInScriptRegex = /(https?:\/\/[^"'\s]+\.(?:m3u8|mp4|html)|https?:\/\/[^"'\s]+\/(?:embed|v|e)\/[^"'\s]+)/gi;
        var m;
        var epIdx = 1;
        while ((m = linkInScriptRegex.exec(scriptContent)) !== null) {
          var epUrl = m[1];
          if (!epUrl.includes("facebook") && !epUrl.includes("google") && !usedEp[epUrl]) {
            usedEp[epUrl] = true;
            episodes.push({
              id: epUrl,
              name: "Tập " + epIdx,
              slug: "tap-" + epIdx
            });
            epIdx++;
          }
        }
      }
    }

    // PHƯƠNG PHÁP 2: Nếu Script không có, quét toàn bộ thẻ HTML có dạng tập
    if (episodes.length === 0) {
      var epRegex = /href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
      var match;
      while ((match = epRegex.exec(html)) !== null) {
        var href = match[1].replace(/&amp;/g, "&");
        var text = match[2].replace(/<[^>]*>/g, "").trim();

        if (text && (text.match(/^(?:Tập|Ep|T)\s*\d+/i) || href.match(/\/(?:tap|episode)[-\=]\d+/i))) {
          if (!href.startsWith("http")) href = BASE_URL + (href.startsWith("/") ? "" : "/") + href;
          if (!usedEp[href]) {
            usedEp[href] = true;
            episodes.push({
              id: href,
              name: text.length > 20 ? ("Tập " + (episodes.length + 1)) : text,
              slug: "tap-" + (episodes.length + 1)
            });
          }
        }
      }
    }

    // PHƯƠNG PHÁP 3: Quét iframe trực tiếp trong trang nếu là phim Lẻ
    if (episodes.length === 0) {
      var iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
      var embedUrl = iframeMatch ? iframeMatch[1] : cleanUrl;
      if (embedUrl.startsWith("//")) embedUrl = "https:" + embedUrl;

      episodes.push({
        id: embedUrl,
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
      servers: [{ name: "VIP SERVER", episodes: episodes }]
    });
  } catch (e) {
    return JSON.stringify({ servers: [] });
  }
}

// ========================================================
// PARSE STREAM (TRẮC NGHIỆM LINK EMBED CHUẨN MẸ)
// ========================================================

function parseDetailResponse(html, url) {
  try {
    var headers = getStandardHeaders(url);

    // 1. Nếu URL truyền vào đã là link stream/embed trực tiếp từ Tập
    if (url.includes(".m3u8")) {
      return JSON.stringify({ url: url, mimeType: "application/x-mpegURL", isEmbed: false, headers: headers });
    }

    if (url.includes("embed") || url.includes("player") || url.includes("hxfile") || url.includes("ok.ru") || url.includes("hydrax") || url.includes("fembed")) {
      return JSON.stringify({ url: url, isEmbed: true, headers: headers });
    }

    // 2. Tìm m3u8 trong HTML
    var m3u8Match = html.match(/(https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)/i);
    if (m3u8Match) {
      return JSON.stringify({ url: m3u8Match[1], mimeType: "application/x-mpegURL", isEmbed: false, headers: headers });
    }

    // 3. Tìm iframe phát phim thực sự
    var iframeRegex = /<iframe[^>]+src=["']([^"']+)["']/gi;
    var iframeMatch;
    while ((iframeMatch = iframeRegex.exec(html)) !== null) {
      var embedSrc = iframeMatch[1];
      if (embedSrc.startsWith("//")) embedSrc = "https:" + embedSrc;

      if (!embedSrc.includes("facebook.com") && 
          !embedSrc.includes("googletagmanager") && 
          !embedSrc.includes("disqus") && 
          !embedSrc.includes("widgets")) {
        return JSON.stringify({
          url: embedSrc,
          isEmbed: true,
          headers: getStandardHeaders(embedSrc)
        });
      }
    }

    return JSON.stringify({ url: url, isEmbed: true, headers: headers });
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
