// ========================================================
// SIÊU TẦM PHIM VAAPP PLUGIN - BẢN FIX CHUYÊN BIỆT V6.0.0
// ========================================================

var BASE_URL = "https://www.sieutamphim.pro";
var popup_html = "<div class='donate-container'><h2 class='donate-heading'>DONATE</h2><p class='donate-description'>Mời nhóm phát triển 2 ly cà phê để duy trì Plugin nhé!</p></div>";

function getManifest() {
  return JSON.stringify({
    "id": "sieutamphim",
    "name": "Sưu Tầm Phim",
    "version": "6.0.0",
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

function getStandardHeaders(refererUrl) {
  return {
    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
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
// PARSE MOVIE DETAIL (QUÉT FULL TẬP TỪ BẢNG VÀ LINK TẬP)
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

    // CƠ CHẾ 1: Bắt tất cả thẻ <a> chứa liên kết tập phim (dạng /tap-X, ?tap=X, hoặc bài viết tập lẻ)
    var epRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    var match;
    while ((match = epRegex.exec(html)) !== null) {
      var href = match[1].replace(/&amp;/g, "&");
      var text = match[2].replace(/<[^>]*>/g, "").trim();

      // Kiểm tra xem liên kết có thuộc danh sách tập không
      if (text && (text.match(/Tập\s*\d+|Full|\b\d+\b/i) || href.includes("tap") || href.includes("episode"))) {
        if (!href.startsWith("http")) href = BASE_URL + (href.startsWith("/") ? "" : "/") + href;

        // Bỏ qua các liên kết trang chủ, nhãn chung
        if (!href.includes("/search/label/") && !usedEp[href]) {
          usedEp[href] = true;
          episodes.push({
            id: href,
            name: text.length > 25 ? ("Tập " + (episodes.length + 1)) : text,
            slug: "tap-" + (episodes.length + 1)
          });
        }
      }
    }

    // CƠ CHẾ 2: Quét trực tiếp các thuộc tính data-tap, data-num nếu có nút chuyển tập JS
    if (episodes.length <= 1) {
      var dataEpRegex = /data-(?:tap|num|episode)=["']([^"']+)["'][^>]*>([\s\S]*?)<\/(?:span|a|li|button)>/gi;
      while ((match = dataEpRegex.exec(html)) !== null) {
        var num = match[1];
        var label = match[2].replace(/<[^>]*>/g, "").trim() || ("Tập " + num);
        var customUrl = cleanUrl + "?tap=" + num;

        if (!usedEp[customUrl]) {
          usedEp[customUrl] = true;
          episodes.push({
            id: customUrl,
            name: label,
            slug: "tap-" + num
          });
        }
      }
    }

    // CƠ CHẾ 3: Dự phòng nếu chỉ có 1 tập
    if (episodes.length === 0) {
      episodes.push({
        id: url,
        name: "Tập Full / Tập 1",
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
// PARSE STREAM (CHỈ LẤY ĐÚNG KHUNG IFRAME PLAYER CHÍNH)
// ========================================================

function parseDetailResponse(html, url) {
  try {
    var headers = getStandardHeaders(url);

    // 1. Tìm luồng m3u8 phát trực tiếp nếu có
    var m3u8Match = html.match(/(https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)/i);
    if (m3u8Match) {
      return JSON.stringify({
        url: m3u8Match[1],
        mimeType: "application/x-mpegURL",
        isEmbed: false,
        headers: headers
      });
    }

    // 2. Lấy liên kết Iframe của Player (Lọc bỏ các Iframe không phải trình phát như Facebook, Widget, QC)
    var iframeRegex = /<iframe[^>]+src=["']([^"']+)["']/gi;
    var iframeMatch;
    while ((iframeMatch = iframeRegex.exec(html)) !== null) {
      var embedSrc = iframeMatch[1];
      if (embedSrc.startsWith("//")) embedSrc = "https:" + embedSrc;

      if (!embedSrc.includes("facebook.com") && 
          !embedSrc.includes("googletagmanager") && 
          !embedSrc.includes("disqus") &&
          !embedSrc.includes("widgets")) {
        
        // Trả về duy nhất liên kết Player này để WebView chỉ tải khung video
        return JSON.stringify({
          url: embedSrc,
          isEmbed: true,
          headers: getStandardHeaders(embedSrc)
        });
      }
    }

    // 3. Nếu URL truyền vào đã là link Iframe trực tiếp
    if (url.includes("embed") || url.includes("player") || url.includes("hxfile") || url.includes("ok.ru")) {
      return JSON.stringify({
        url: url,
        isEmbed: true,
        headers: headers
      });
    }

    // Fallback nếu không tách được iframe
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
