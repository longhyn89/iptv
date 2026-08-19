// ========================================================
// SIÊU TẦM PHIM - CHUẨN HÓA THEO LUỒNG KKPHIM
// ========================================================

var BASE_URL = "https://www.sieutamphim.pro";

function getManifest() {
  return JSON.stringify({
    "id": "sieutamphim",
    "name": "Sưu Tầm Phim",
    "version": "1.5.0",
    "baseUrl": BASE_URL,
    "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/sieutamphim.png",
    "isEnabled": true,
    "author": "Youngbi",
    "type": "MOVIE"
  });
}

function log(msg) {
  if (typeof nativeLog !== 'undefined') {
    nativeLog("[STPhim] " + msg);
  }
}

function getSlugFromUrl(url) {
  if (!url) return "";
  var cleanUrl = url.split("?")[0];
  var match = cleanUrl.match(/\/([^\/]+)\.html$/i);
  if (match) return match[1];
  var parts = cleanUrl.split("/");
  var last = parts[parts.length - 1] || parts[parts.length - 2] || "";
  return last.replace(".html", "");
}

// ========================================================
// HOME & CATEGORIES
// ========================================================

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
    { name: 'Phim Việt Nam', slug: 'phim-viet-nam' },
    { name: 'Phim Hàn Quốc', slug: 'phim-han-quoc' },
    { name: 'Phim Trung Quốc', slug: 'phim-trung-quoc' },
    { name: 'Phim Nhật Bản', slug: 'phim-nhat-ban' },
    { name: 'Hành Động', slug: 'hanh-dong' },
    { name: 'Viễn Tưởng', slug: 'vien-tuong' }
  ]);
}

function getFilterConfig() {
  return JSON.stringify({ sort: [], category: [] });
}

// ========================================================
// URL GENERATION
// ========================================================

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
  if (!id) return BASE_URL;
  if (id.startsWith("http://") || id.startsWith("https://")) return id;
  return BASE_URL + "/wp-json/wp/v2/posts?slug=" + encodeURIComponent(id);
}

// ========================================================
// PARSE LIST
// ========================================================

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

    return JSON.stringify({
      items: items,
      pagination: { currentPage: 1, totalPages: 999 }
    });
  } catch (e) {
    return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
  }
}

function parseSearchResponse(html) {
  return parseListResponse(html);
}

// ========================================================
// PARSE DETAIL (GIẢI MÃ VÀ GÁN TRỰC TIẾP STREAM VÀO EPISODES.ID)
// ========================================================

function parseMovieDetail(html, url) {
  try {
    var title = "";
    var poster = "";
    var description = "";
    var movieUrl = url;
    var contentHtml = html;
    var year = "2026";

    if (url && url.includes("/wp-json/wp/v2/posts")) {
      var posts = JSON.parse(html);
      if (!posts || posts.length === 0) return JSON.stringify({ servers: [] });
      var post = posts[0];
      title = post.title ? post.title.rendered : "";
      movieUrl = post.link || url;
      contentHtml = post.content ? post.content.rendered : "";
      description = post.excerpt ? post.excerpt.rendered.replace(/<[^>]*>/g, "").trim() : "";
      poster = post.jetpack_featured_media_url || post.featured_media_src_url || "";
      if (post.date) year = post.date.substring(0, 4);
    } else {
      title = (html.match(/<meta property="og:title" content="([^"]+)"/i) || [])[1] || "";
      var ogImageMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i);
      poster = ogImageMatch ? ogImageMatch[1] : "";
      description = (html.match(/<meta property="og:description" content="([^"]+)"/i) || [])[1] || "";
      movieUrl = (html.match(/<meta property="og:url" content="([^"]+)"/i) || [])[1] || url;
    }

    var servers = [];
    var usedServer = {};

    var groupRegex = /data-server=['"]([^'"]+)['"]/gi;
    var m;
    while ((m = groupRegex.exec(contentHtml)) !== null) {
      var serverId = m[1];
      if (usedServer[serverId]) continue;
      usedServer[serverId] = true;

      var epBlockRegex = new RegExp('data-server=["\']' + serverId + '["\'][\\s\\S]*?data-episodes=(["\'])([\\s\\S]*?)\\1', "i");
      var epBlockMatch = contentHtml.match(epBlockRegex);

      var episodes = [];
      if (epBlockMatch) {
        var rawEpisodes = epBlockMatch[2];
        var epRegex = /\{"([^"]+)","([^"]+)"\}/g;
        var epMatch;
        var count = 1;

        while ((epMatch = epRegex.exec(rawEpisodes)) !== null) {
          var rawSrc = epMatch[1];
          var decrypted = "";
          for (var i = 0; i < rawSrc.length; i++) {
            decrypted += String.fromCharCode(rawSrc.charCodeAt(i) ^ 42);
          }

          var streamUrl = "";
          if (decrypted.indexOf(".m3u8") !== -1) {
            streamUrl = decrypted;
          } else {
            var vMatch = decrypted.match(/(?:[?&]v=|\/)([a-zA-Z0-9_-]+)(?:[?&]|$)/);
            var videoId = vMatch ? vMatch[1] : "";
            if (videoId) {
              streamUrl = "https://hx-mp4.k-20.xyz/stream/series/clbpx:lo2b09rr074-2q1390mfi:" + videoId + ".mp4";
            }
          }

          if (streamUrl) {
            episodes.push({
              id: streamUrl, // Gán trực tiếp URL Stream như KKPhim
              name: epMatch[2] || ("Tập " + count),
              slug: "tap-" + count
            });
          }
          count++;
        }
      }

      if (episodes.length > 0) {
        servers.push({
          name: serverId.toUpperCase(),
          episodes: episodes
        });
      }
    }

    return JSON.stringify({
      id: getSlugFromUrl(movieUrl),
      title: decodeHtmlEntities(title.replace(" - Siêu Tầm Phim", "").trim()),
      posterUrl: poster,
      backdropUrl: poster,
      description: description,
      year: year,
      category: "Phim Hay",
      country: "Tổng Hợp",
      servers: servers,
      quality: "HD",
      status: "Hoàn thành"
    });
  } catch (e) {
    return JSON.stringify({ servers: [] });
  }
}

// ========================================================
// STREAM PARSER (MÔ PHỎNG GIỐNG KKPHIM)
// ========================================================

function parseDetailResponse(apiResponseJson) {
  return JSON.stringify({
    url: "",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Referer": "https://hx-mp4.k-20.xyz/"
    },
    subtitles: []
  });
}

function parseEmbedResponse(html, sourceUrl, datasend) {
  return parseDetailResponse(html);
}

// ========================================================
// HELPERS
// ========================================================

function decodeHtmlEntities(str) {
  if (!str) return "";
  return str
    .replace(/&#8211;/g, "-").replace(/&#8212;/g, "-")
    .replace(/&#8220;/g, '"').replace(/&#8221;/g, '"')
    .replace(/&#8216;/g, "'").replace(/&#8217;/g, "'")
    .replace(/&#038;/g, "&").replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ").trim();
}

function parseCategoriesResponse(html) { return "[]"; }
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
