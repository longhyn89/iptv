// ========================================================
// SIÊU TẦM PHIM - NATIVE EXOPLAYER K-20 API V12.0.0
// ========================================================

var BASE_URL = "https://www.sieutamphim.pro";
var API_URL = BASE_URL + "/wp-json/wp/v2";
var popup_html = "<div class='donate-container'><h2 class='donate-heading'>DONATE</h2><p class='donate-description'>Mời nhóm phát triển 2 ly cà phê để duy trì Plugin nhé!</p></div>";

function getManifest() {
  return JSON.stringify({
    "id": "sieutamphim",
    "name": "Sưu Tầm Phim",
    "version": "12.0.0",
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
    "Referer": refererUrl || BASE_URL,
    "Accept": "*/*"
  };
}

// ========================================================
// HOME & SEARCH (SỬ DỤNG WP REST API)
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
  return API_URL + "/posts?per_page=18&page=" + page;
}

function getUrlSearch(keyword, filtersJson) {
  var filters = JSON.parse(filtersJson || "{}");
  var page = filters.page || 1;
  return API_URL + "/posts?search=" + encodeURIComponent(keyword) + "&per_page=18&page=" + page;
}

function getUrlDetail(id) {
  if (!id) return "";
  if (id.startsWith("http")) {
    var slugMatch = id.match(/\/([^\/]+)\.html/);
    if (slugMatch) return API_URL + "/posts?slug=" + slugMatch[1];
    return id;
  }
  return API_URL + "/posts?slug=" + id;
}

// ========================================================
// PARSE API RESPONSE & MOVIE DETAIL
// ========================================================

function parseListResponse(jsonStr) {
  try {
    var posts = JSON.parse(jsonStr);
    var items = [];

    for (var i = 0; i < posts.length; i++) {
      var post = posts[i];
      var title = post.title && post.title.rendered ? post.title.rendered : "Phim";
      var slug = post.slug || "";
      var link = post.link || (BASE_URL + "/" + slug + ".html");
      
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

function parseMovieDetail(jsonStr, url) {
  try {
    var posts = JSON.parse(jsonStr);
    var post = Array.isArray(posts) ? posts[0] : posts;

    if (!post) return JSON.stringify({ servers: [] });

    var title = post.title && post.title.rendered ? post.title.rendered : "Phim";
    var contentHtml = post.content && post.content.rendered ? post.content.rendered : "";
    var slug = post.slug || "";
    var webLink = post.link || (BASE_URL + "/" + slug + ".html");

    var episodes = [];
    var usedEp = {};

    // 1. Tìm liên kết iframe/server sc.k-20.xyz hoặc abyssplayer từ content HTML
    var streamRegex = /(https?:\/\/(?:sc\.k-20\.xyz|abyssplayer\.com)[^"'\s<>]+)/gi;
    var matchStream;
    var epIndex = 1;

    while ((matchStream = streamRegex.exec(contentHtml)) !== null) {
      var streamLink = matchStream[1].replace(/&amp;/g, "&");
      if (!usedEp[streamLink]) {
        usedEp[streamLink] = true;
        episodes.push({
          id: streamLink,
          name: "Tập " + epIndex,
          slug: "tap-" + epIndex
        });
        epIndex++;
      }
    }

    // 2. Tìm thẻ tập dạng HTML truyền thống trong content
    if (episodes.length === 0) {
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
    }

    // Fallback nếu không bóc tách được tập lẻ
    if (episodes.length === 0) {
      episodes.push({
        id: webLink,
        name: "Xem Phim Full",
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
      servers: [{ name: "Server ExoPlayer Native", episodes: episodes }]
    });
  } catch (e) {
    return JSON.stringify({ servers: [] });
  }
}

// ========================================================
// PARSE STREAM (GỬI TRỰC TIẾP LUỒNG SC.K-20 CHO EXOPLAYER)
// ========================================================

function parseDetailResponse(htmlOrUrl, url) {
  var targetUrl = (typeof htmlOrUrl === "string" && htmlOrUrl.startsWith("http")) ? htmlOrUrl : url;
  
  // Nếu là đường dẫn server stream trực tiếp
  if (targetUrl.includes("sc.k-20.xyz") || targetUrl.includes("hx-mp4") || targetUrl.includes(".m3u8") || targetUrl.includes(".mp4")) {
    return JSON.stringify({
      url: targetUrl,
      isEmbed: false, // Ép ExoPlayer phát stream trực tiếp Status 206
      headers: getStandardHeaders(targetUrl)
    });
  }

  // Nếu trong nội dung HTML trả về có chứa link server sc.k-20.xyz
  if (typeof htmlOrUrl === "string") {
    var k20Match = htmlOrUrl.match(/(https?:\/\/sc\.k-20\.xyz\/[^\s"'<>]+)/i) ||
                   htmlOrUrl.match(/(https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)/i);
    if (k20Match) {
      return JSON.stringify({
        url: k20Match[1],
        isEmbed: false,
        headers: getStandardHeaders(k20Match[1])
      });
    }
  }

  return JSON.stringify({
    url: targetUrl,
    isEmbed: false,
    headers: getStandardHeaders(targetUrl)
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
