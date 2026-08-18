// ========================================================
// SIÊU TẦM PHIM VAAPP PLUGIN - FIX DỨT ĐIỂM LINK PHÁT (POST AJAX)
// ========================================================

var BASE_URL = "https://www.sieutamphim.pro";
var popup_html = "<div class='donate-container'><h2 class='donate-heading'>DONATE</h2><p class='donate-description'>Mời nhóm phát triển 2 ly cà phê để duy trì Plugin nhé!</p></div>";

function getManifest() {
  return JSON.stringify({
    "id": "sieutamphim",
    "name": "Sưu Tầm Phim",
    "version": "1.8.0",
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

// ========================================================
// HOME & CATEGORY
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
    // Gọi trực tiếp cổng AJAX lấy tập phim
    return BASE_URL + "/wp-admin/admin-ajax.php";
  }
  if (id.startsWith("http")) return id;
  return BASE_URL + "/wp-json/wp/v2/posts?slug=" + id;
}

// Hàm gửi Body Data dạng POST khi nhấp vào tập phim
function getDetailPostData(id) {
  if (id && id.startsWith("play-")) {
    var raw = id.replace("play-", "");
    var params = {};
    var parts = raw.split("&");
    for (var i = 0; i < parts.length; i++) {
      var pair = parts[i].split("=");
      if (pair.length === 2) {
        params[pair[0]] = decodeURIComponent(pair[1]);
      }
    }
    
    return "action=get_player_html&id=" + (params.id || "") + 
           "&server=" + (params.server || "") + 
           "&tap=" + (params.tap || "1");
  }
  return "";
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

    return JSON.stringify({ items: items, pagination: { currentPage: 1, totalPages: 999 } });
  } catch (e) {
    return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
  }
}

function parseSearchResponse(html) { return parseListResponse(html); }

// ========================================================
// PARSE MOVIE DETAIL
// ========================================================

function parseMovieDetail(jsonStr, url) {
  try {
    var data = JSON.parse(jsonStr);
    var post = Array.isArray(data) ? data[0] : data;
    if (!post) return JSON.stringify({ servers: [] });

    var title = post.title && post.title.rendered ? post.title.rendered : "";
    var content = post.content && post.content.rendered ? post.content.rendered : "";
    var link = post.link || (BASE_URL + "/" + post.slug + ".html");
    var postId = post.id ? post.id.toString() : "";

    // Lấy Năm phát hành
    var releaseYear = "2024";
    if (post.date) {
      releaseYear = post.date.substring(0, 4);
    }

    // Lấy Poster
    var poster = "";
    var imgMatch = content.match(/src=["']([^"']+)["']/i);
    if (imgMatch) poster = imgMatch[1];

    var description = post.excerpt && post.excerpt.rendered ? post.excerpt.rendered.replace(/<[^>]*>/g, "").trim() : "";

    var servers = [];
    var usedServer = {};

    var groupRegex = /data-server=['"]([^'"]+)['"]/gi;
    var m;
    while ((m = groupRegex.exec(content)) !== null) {
      var serverId = m[1];
      if (usedServer[serverId]) continue;
      usedServer[serverId] = true;

      var epBlockRegex = new RegExp('data-server=["\']' + serverId + '["\'][\\s\\S]*?data-episodes=([\'"])([\\s\\S]*?)\\1', "i");
      var epBlockMatch = content.match(epBlockRegex);

      var epCount = 0;
      if (epBlockMatch) {
        var rawEpisodes = epBlockMatch[2];
        var matches = rawEpisodes.match(/\{"([^"]+)","([^"]+)"\}/g);
        epCount = matches ? matches.length : 1;
      }
      if (epCount === 0) epCount = 1;

      var episodes = [];
      for (var j = 1; j <= epCount; j++) {
        // Lưu thông số cần thiết để gửi Form Data POST
        episodes.push({
          id: "play-id=" + postId + "&server=" + encodeURIComponent(serverId) + "&tap=" + j,
          name: epCount === 1 ? "Full" : "Tập " + j,
          slug: "tap-" + j
        });
      }

      servers.push({ name: serverId.toUpperCase(), episodes: episodes });
    }

    if (servers.length === 0) {
      servers.push({
        name: "DEFAULT",
        episodes: [{
          id: "play-id=" + postId + "&server=default&tap=1",
          name: "Full",
          slug: "full"
        }]
      });
    }

    return JSON.stringify({
      id: getSlugFromUrl(link),
      title: decodeHtmlEntities(title.replace("&#8211;", "-").trim()),
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

// ========================================================
// PARSE STREAM (XỬ LÝ RESPONSE TỪ AJAX POST)
// ========================================================

function parseDetailResponse(html, url) {
  try {
    log("AJAX Response: " + html);

    var decrypted = "";

    // Trường hợp 1: Trả về link trong thuộc tính src của iframe
    var iframeMatch = html.match(/src=["']([^"']+)["']/i);
    if (iframeMatch) {
      decrypted = iframeMatch[1];
    } else {
      // Trường hợp 2: Trả về chuỗi mã hóa XOR
      var cleanHtml = html.replace(/<[^>]*>/g, "").trim();
      if (cleanHtml.length > 5) {
        for (var i = 0; i < cleanHtml.length; i++) {
          decrypted += String.fromCharCode(cleanHtml.charCodeAt(i) ^ 42);
        }
      }
    }

    if (decrypted.startsWith("//")) decrypted = "https:" + decrypted;

    log("Decrypted Stream URL: " + decrypted);

    // Xử lý link M3U8 trực tiếp
    if (decrypted.indexOf(".m3u8") !== -1) {
      return JSON.stringify({
        url: decrypted,
        mimeType: "application/x-mpegURL",
        isEmbed: false,
        headers: { "Referer": BASE_URL + "/", "User-Agent": "Mozilla/5.0" }
      });
    }

    // Xử lý link Embed Player (AbyssPlayer / Hydrax / Youtube)
    if (decrypted.startsWith("http")) {
      return JSON.stringify({
        url: decrypted,
        isEmbed: true,
        headers: { "Referer": BASE_URL + "/", "User-Agent": "Mozilla/5.0" }
      });
    }

    return JSON.stringify({ url: "", isEmbed: false });

  } catch (e) {
    log("Error parseDetailResponse: " + e.message);
    return JSON.stringify({ url: "", isEmbed: false });
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
