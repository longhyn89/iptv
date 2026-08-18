// ========================================================
// SIÊU TẦM PHIM VAAPP PLUGIN - FIX DỨT ĐIỂM LINK PHÁT & NĂM PHÁT HÀNH
// ========================================================

var BASE_URL = "https://www.sieutamphim.pro";
var popup_html = "<div class='donate-container'><h2 class='donate-heading'>DONATE</h2><p class='donate-description'>Mời nhóm phát triển 2 ly cà phê để duy trì Plugin nhé!</p></div>";

function getManifest() {
  return JSON.stringify({
    "id": "sieutamphim",
    "name": "Sưu Tầm Phim",
    "version": "1.7.0",
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
  var cleanUrl = url.split("?")[0];
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
    // Trích xuất lại URL trang phim từ ID định dạng play-
    var rawUrl = id.replace("play-", "").split("#")[0];
    return rawUrl;
  }
  if (id.startsWith("http")) return id;
  return BASE_URL + "/wp-json/wp/v2/posts?slug=" + id;
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
        // ID đính kèm Link bài viết + Tên server + Vị trí tập
        episodes.push({
          id: "play-" + link + "#server=" + encodeURIComponent(serverId) + "&tap=" + j,
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
          id: "play-" + link + "#server=default&tap=1",
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
// PARSE STREAM (XỬ LÝ & GIẢI MÃ LINK PHÁT CỦA TẬP PHIM)
// ========================================================

function parseDetailResponse(html, url) {
  try {
    var targetTap = 1;
    var tapMatch = url.match(/tap=(\d+)/);
    if (tapMatch) targetTap = parseInt(tapMatch[1], 10);

    // Trích xuất danh sách tập từ thuộc tính data-episodes trong HTML
    var epBlocks = html.match(/data-episodes=(['"])([\s\S]*?)\1/gi) || [];
    
    for (var b = 0; b < epBlocks.length; b++) {
      var blockContent = epBlocks[b];
      var matches = blockContent.match(/\{"([^"]+)","([^"]+)"\}/g) || [];

      if (matches.length >= targetTap) {
        var targetEp = matches[targetTap - 1];
        var rawSrcMatch = targetEp.match(/\{"([^"]+)"/);
        
        if (rawSrcMatch) {
          var rawSrc = rawSrcMatch[1];

          // Giải mã chuỗi XOR Key 42
          var decrypted = "";
          for (var i = 0; i < rawSrc.length; i++) {
            decrypted += String.fromCharCode(rawSrc.charCodeAt(i) ^ 42);
          }

          log("Decrypted Stream: " + decrypted);

          if (decrypted.startsWith("//")) decrypted = "https:" + decrypted;

          // Nếu là file M3U8 trực tiếp
          if (decrypted.indexOf(".m3u8") !== -1) {
            return JSON.stringify({
              url: decrypted,
              mimeType: "application/x-mpegURL",
              isEmbed: false,
              headers: { "Referer": BASE_URL + "/", "User-Agent": "Mozilla/5.0" }
            });
          }

          // Lấy Video ID và trả về dạng Embed AbyssPlayer
          var vMatch = decrypted.match(/(?:[?&]v=|\/|embed\/)([a-zA-Z0-9_-]+)(?:[?&]|$)/);
          var videoId = vMatch ? vMatch[1] : "";
          var finalUrl = videoId ? ("https://abyssplayer.com/e/" + videoId) : decrypted;

          return JSON.stringify({
            url: finalUrl,
            isEmbed: true,
            headers: { "Referer": BASE_URL + "/", "User-Agent": "Mozilla/5.0" }
          });
        }
      }
    }

    // Dự phòng mở Webview chính trang phim nếu không quét được chuỗi
    var cleanUrl = url.replace("play-", "").split("#")[0];
    return JSON.stringify({
      url: cleanUrl,
      isEmbed: true,
      headers: { "Referer": BASE_URL + "/", "User-Agent": "Mozilla/5.0" }
    });

  } catch (e) {
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
