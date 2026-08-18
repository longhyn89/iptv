// ========================================================
// SIÊU TẦM PHIM - WORDPRESS NATIVE REST API V11.0.0
// ========================================================

var BASE_URL = "https://www.sieutamphim.pro";
var API_URL = BASE_URL + "/wp-json/wp/v2";
var popup_html = "<div class='donate-container'><h2 class='donate-heading'>DONATE</h2><p class='donate-description'>Mời nhóm phát triển 2 ly cà phê để duy trì Plugin nhé!</p></div>";

function getManifest() {
  return JSON.stringify({
    "id": "sieutamphim",
    "name": "Sưu Tầm Phim API",
    "version": "11.0.0",
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
    "Accept": "application/json"
  };
}

// ========================================================
// HOME & CATEGORIES (GỌI API)
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
    { name: 'Hoạt Hình', slug: 'hoat-hinh' }
  ]);
}

function getFilterConfig() { return JSON.stringify({ sort: [], category: [] }); }

function getUrlList(slug, filtersJson) {
  var filters = JSON.parse(filtersJson || "{}");
  var page = filters.page || 1;
  // Dùng API bài viết theo trang
  return API_URL + "/posts?per_page=18&page=" + page;
}

function getUrlSearch(keyword, filtersJson) {
  var filters = JSON.parse(filtersJson || "{}");
  var page = filters.page || 1;
  // Dùng API Search
  return API_URL + "/posts?search=" + encodeURIComponent(keyword) + "&per_page=18&page=" + page;
}

function getUrlDetail(id) {
  if (!id) return "";
  if (id.startsWith("http")) return id;
  // Lấy chi tiết bằng Slug hoặc ID qua API
  return API_URL + "/posts?slug=" + id;
}

// ========================================================
// PARSE API RESPONSE (LIST & DETAIL)
// ========================================================

function parseListResponse(jsonStr) {
  try {
    var posts = JSON.parse(jsonStr);
    var items = [];

    for (var i = 0; i < posts.length; i++) {
      var post = posts[i];
      var title = post.title && post.title.rendered ? post.title.rendered : "Phim";
      var slug = post.slug || "";
      
      // Bóc tách ảnh featured image nếu có, hoặc dùng fallback Regex
      var posterUrl = "";
      if (post.jetpack_featured_media_url) {
        posterUrl = post.jetpack_featured_media_url;
      } else if (post.featured_media_src_url) {
        posterUrl = post.featured_media_src_url;
      } else if (post.content && post.content.rendered) {
        var imgMatch = post.content.rendered.match(/src=["']([^"']+)["']/i);
        if (imgMatch) posterUrl = imgMatch[1];
      }

      items.push({
        id: slug,
        title: decodeHtmlEntities(title),
        posterUrl: posterUrl
      });
    }

    return JSON.stringify({ items: items, pagination: { currentPage: 1, totalPages: 999 } });
  } catch (e) {
    return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
  }
}

function parseSearchResponse(jsonStr) { return parseListResponse(jsonStr); }

// ========================================================
// PARSE DETAIL & BÓC TÁCH FULL TẬP TỪ API CONTENT
// ========================================================

function parseMovieDetail(jsonStr, url) {
  try {
    var posts = JSON.parse(jsonStr);
    var post = Array.isArray(posts) ? posts[0] : posts;

    if (!post) return JSON.stringify({ servers: [] });

    var title = post.title && post.title.rendered ? post.title.rendered : "Phim";
    var contentHtml = post.content && post.content.rendered ? post.content.rendered : "";
    var slug = post.slug || "";

    var episodes = [];
    var usedEp = {};

    // 1. Quét các thẻ Link Tập trong content HTML từ API
    var epRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    var match;

    while ((match = epRegex.exec(contentHtml)) !== null) {
      var href = match[1].replace(/&amp;/g, "&");
      var text = match[2].replace(/<[^>]*>/g, "").trim();

      if (text && (text.match(/^(?:Tập|Ep|Tap)\s*\d+/i) || href.match(/\/(?:tap|episode)[-\=]\d+/i))) {
        if (!usedEp[href]) {
          usedEp[href] = true;
          episodes.push({
            id: href,
            name: text,
            slug: "tap-" + (episodes.length + 1)
          });
        }
      }
    }

    // 2. Quét iframe trực tiếp có sẵn trong content nếu không có thẻ link danh sách
    if (episodes.length === 0) {
      var iframeMatches = contentHtml.match(/<iframe[^>]+src=["']([^"']+)["']/gi) || [];
      for (var k = 0; k < iframeMatches.length; k++) {
        var srcMatch = iframeMatches[k].match(/src=["']([^"']+)["']/i);
        if (srcMatch) {
          var iframeUrl = srcMatch[1];
          if (!iframeUrl.includes("facebook") && !iframeUrl.includes("googletag")) {
            episodes.push({
              id: iframeUrl,
              name: "Tập " + (k + 1),
              slug: "tap-" + (k + 1)
            });
          }
        }
      }
    }

    // Fallback 1 tập nếu là phim lẻ
    if (episodes.length === 0) {
      episodes.push({
        id: BASE_URL + "/" + slug + ".html",
        name: "Phim Full",
        slug: "full"
      });
    }

    return JSON.stringify({
      id: slug,
      title: decodeHtmlEntities(title),
      posterUrl: "",
      backdropUrl: "",
      description: "",
      releaseYear: "2026",
      servers: [{ name: "VIP ExoPlayer API", episodes: episodes }]
    });
  } catch (e) {
    return JSON.stringify({ servers: [] });
  }
}

// ========================================================
// PARSE STREAM (TRUYỀN TRỰC TIẾP CHO EXOPLAYER)
// ========================================================

function parseDetailResponse(htmlOrUrl, url) {
  var targetUrl = (typeof htmlOrUrl === "string" && htmlOrUrl.startsWith("http")) ? htmlOrUrl : url;
  var headers = getStandardHeaders(targetUrl);

  // Bắt link iframe/m3u8 phát thẳng qua ExoPlayer
  return JSON.stringify({
    url: targetUrl,
    isEmbed: false, // Bắt buộc ExoPlayer mở trực tiếp
    headers: headers
  });
}

function parseEmbedResponse(html, sourceUrl, datasend) {
  return parseDetailResponse(html, sourceUrl);
}

function decodeHtmlEntities(str) {
  if (!str) return "";
  return str.replace(/&#8211;/g, "-").replace(/&#8212;/g, "-").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}

function parseCategoriesResponse(html) { return "[]"; }
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
