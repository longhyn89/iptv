// ========================================================
// SIÊU TẦM PHIM VAAPP PLUGIN - BẢN FIX LINK PHÁT & NĂM PHÁT HÀNH
// ========================================================

var BASE_URL = "https://www.sieutamphim.pro";
var popup_html = "<div class='donate-container'><h2 class='donate-heading'>DONATE</h2><p class='donate-description'>Mời nhóm phát triển 2 ly cà phê để duy trì Plugin nhé!</p></div>";

function getManifest() {
  return JSON.stringify({
    "id": "sieutamphim",
    "name": "Sưu Tầm Phim",
    "version": "1.4.0",
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
  if (id.startsWith("play-")) return id.replace("play-", "");
  if (id.startsWith("http")) return id;
  // Ưu tiên tải HTML trực tiếp để lấy đủ dữ liệu postId và Năm sản xuất
  return BASE_URL + "/" + id + ".html";
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
// PARSE MOVIE DETAIL (LẤY CHI TIẾT & NĂM PHÁT HÀNH)
// ========================================================

function parseMovieDetail(html, url) {
  if (url && url.includes("server=")) {
    return JSON.stringify({ id: url, servers: [] });
  }
  try {
    var title = "", poster = "", description = "", movieUrl = url, postId = "", releaseYear = "";

    // 1. Lấy Tiêu đề
    title = (html.match(/<meta property="og:title" content="([^"]+)"/i) || [])[1] || "";
    if (!title) {
      var tMatch = html.match(/<h1[^>]*class="[^"]*entry-title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i);
      title = tMatch ? tMatch[1].replace(/<[^>]*>/g, "").trim() : "";
    }

    // 2. Lấy Poster
    poster = (html.match(/<meta property="og:image" content="([^"]+)"/i) || [])[1] || "";

    // 3. Lấy Mô tả
    description = (html.match(/<meta property="og:description" content="([^"]+)"/i) || [])[1] || "";

    // 4. Lấy Post ID chuẩn từ HTML
    var postIdMatch = html.match(/class=["'][^"']*post-(\d+)[^"']*["']/) || 
                      html.match(/post-id=["'](\d+)["']/) || 
                      html.match(/postId\s*:\s*(\d+)/) ||
                      html.match(/value=["'](\d+)["']\s+id=["']comment_post_ID["']/);
    postId = postIdMatch ? postIdMatch[1] : "";

    // 5. Lấy Năm phát hành (Trích xuất từ text hoặc tag)
    var yearMatch = html.match(/\b(19\d\d|20\d\d)\b/); // Tìm năm từ 1900-2099 trong HTML
    if (yearMatch) {
      releaseYear = yearMatch[1];
    } else {
      releaseYear = new Date().getFullYear().toString();
    }

    var servers = [];
    var usedServer = {};

    // Quét danh sách Server và Tập phim
    var groupRegex = /data-server=['"]([^'"]+)['"]/gi;
    var m;
    while ((m = groupRegex.exec(html)) !== null) {
      var serverId = m[1];
      if (usedServer[serverId]) continue;
      usedServer[serverId] = true;

      var epBlockRegex = new RegExp('data-server=["\']' + serverId + '["\'][\\s\\S]*?data-episodes=([\'"])([\\s\\S]*?)\\1', "i");
      var epBlockMatch = html.match(epBlockRegex);

      var epCount = 0;
      if (epBlockMatch) {
        var rawEpisodes = epBlockMatch[2];
        var matches = rawEpisodes.match(/\{"([^"]+)","([^"]+)"\}/g);
        epCount = matches ? matches.length : 1;
      }
      if (epCount === 0) epCount = 1;

      var episodes = [];
      for (var j = 1; j <= epCount; j++) {
        // ID tập phim chứa đầy đủ link gốc + Post ID + Server + Số tập
        episodes.push({
          id: "play-" + url + "?id=" + postId + "&server=" + encodeURIComponent(serverId) + "&tap=" + j,
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
          id: "play-" + url + "?id=" + postId + "&server=default&tap=1",
          name: "Full",
          slug: "full"
        }]
      });
    }

    return JSON.stringify({
      id: getSlugFromUrl(url),
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

// ========================================================
// PARSE STREAM (GIẢI MÃ LINK PHÁT)
// ========================================================

function parseDetailResponse(html, url) {
  log("Fetching stream for URL: " + url);
  try {
    var targetTap = 1;
    var tapMatch = url.match(/tap=(\d+)/);
    if (tapMatch) targetTap = parseInt(tapMatch[1], 10);

    // Tìm tất cả các khối data-episodes trong HTML
    var epBlocks = html.match(/data-episodes=(['"])([\s\S]*?)\1/gi) || [];
    
    for (var b = 0; b < epBlocks.length; b++) {
      var blockContent = epBlocks[b];
      var matches = blockContent.match(/\{"([^"]+)","([^"]+)"\}/g) || [];

      if (matches.length >= targetTap) {
        var targetEp = matches[targetTap - 1];
        var rawSrcMatch = targetEp.match(/\{"([^"]+)"/);
        
        if (rawSrcMatch) {
          var rawSrc = rawSrcMatch[1];

          // Giải mã XOR Key 42
          var decrypted = "";
          for (var i = 0; i < rawSrc.length; i++) {
            decrypted += String.fromCharCode(rawSrc.charCodeAt(i) ^ 42);
          }

          log("Decrypted Link: " + decrypted);

          // 1. Nếu là M3U8 -> Chạy ExoPlayer
          if (decrypted.indexOf(".m3u8") !== -1) {
            return JSON.stringify({
              url: decrypted,
              mimeType: "application/x-mpegURL",
              isEmbed: false,
              headers: { "Referer": BASE_URL + "/", "User-Agent": "Mozilla/5.0" }
            });
          }

          // 2. Lấy Embed URL cho WebView
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

    // Dự phòng: Trả về link trang để WebView tự load
    var cleanUrl = url.replace("play-", "").split("?")[0];
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
    .replace(/&#8220;/g, '"').replace(/&#8221;/g, '"')
    .replace(/&#8216;/g, "'").replace(/&#8217;/g, "'")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ").trim();
}

function parseCategoriesResponse(html) { return "[]"; }
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
