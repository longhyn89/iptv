// ========================================================
// SIÊU TẦM PHIM VAAPP PLUGIN - FIX LỖI KHÔNG TÌM THẤY LINK
// ========================================================

var BASE_URL = "https://www.sieutamphim.pro";
var popup_html = "<div class='donate-container'><h2 class='donate-heading'>DONATE</h2><p class='donate-description'>Mời nhóm phát triển 2 ly cà phê để duy trì Plugin nhé!</p></div>";

function getManifest() {
  return JSON.stringify({
    "id": "sieutamphim",
    "name": "Sưu Tầm Phim",
    "version": "1.3.0",
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
// CATEGORY & HOME
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
  if (!id) return "";
  if (id.startsWith("play-")) return id.replace("play-", "");
  if (id.startsWith("http")) return id;
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

    return JSON.stringify({ items: items, pagination: { currentPage: 1, totalPages: 999 } });
  } catch (e) {
    return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
  }
}

function parseSearchResponse(html) { return parseListResponse(html); }

// ========================================================
// PARSE DETAIL (DANH SÁCH TẬP PHIM)
// ========================================================

function parseMovieDetail(html, url) {
  if (url && url.includes("server=")) {
    return JSON.stringify({ id: url, servers: [] });
  }
  try {
    var isWpApi = url && url.includes("/wp-json/wp/v2/posts");
    var title = "", poster = "", description = "", movieUrl = url, postId = "", contentHtml = html;

    if (isWpApi) {
      var posts = JSON.parse(html);
      if (!posts || posts.length === 0) return JSON.stringify({ servers: [] });
      var post = posts[0];
      title = post.title ? post.title.rendered : "";
      movieUrl = post.link || url;
      postId = String(post.id || "");
      contentHtml = post.content ? post.content.rendered : "";
      description = post.excerpt ? post.excerpt.rendered.replace(/<[^>]*>/g, "").trim() : "";
      poster = post.jetpack_featured_media_url || post.featured_media_src_url || "";
    } else {
      title = (html.match(/<meta property="og:title" content="([^"]+)"/i) || [])[1] || "";
      poster = (html.match(/<meta property="og:image" content="([^"]+)"/i) || [])[1] || "";
      description = (html.match(/<meta property="og:description" content="([^"]+)"/i) || [])[1] || "";
      movieUrl = (html.match(/<meta property="og:url" content="([^"]+)"/i) || [])[1] || url;
      var postIdMatch = html.match(/post-id=["'](\d+)/) || html.match(/postId\s*:\s*(\d+)/);
      postId = postIdMatch ? postIdMatch[1] : "";
    }

    var servers = [];
    var usedServer = {};

    // Quét tất cả các server có trong bài viết
    var groupRegex = /data-server=['"]([^'"]+)['"]/gi;
    var m;
    while ((m = groupRegex.exec(contentHtml)) !== null) {
      var serverId = m[1];
      if (usedServer[serverId]) continue;
      usedServer[serverId] = true;

      var epBlockRegex = new RegExp('data-server=["\']' + serverId + '["\'][\\s\\S]*?data-episodes=([\'"])([\\s\\S]*?)\\1', "i");
      var epBlockMatch = contentHtml.match(epBlockRegex);

      var epCount = 0;
      if (epBlockMatch) {
        var rawEpisodes = epBlockMatch[2];
        var matches = rawEpisodes.match(/\{[^}]+\}/g);
        epCount = matches ? matches.length : 1;
      }
      if (epCount === 0) epCount = 1;

      var episodes = [];
      for (var j = 1; j <= epCount; j++) {
        episodes.push({
          id: "play-" + movieUrl + "?id=" + postId + "&server=" + encodeURIComponent(serverId) + "&tap=" + j,
          name: epCount === 1 ? "Full" : "Tập " + j,
          slug: "tap-" + j
        });
      }

      servers.push({ name: serverId.toUpperCase(), episodes: episodes });
    }

    // Server dự phòng nếu không quét được
    if (servers.length === 0) {
      servers.push({
        name: "DEFAULT",
        episodes: [{
          id: "play-" + movieUrl + "?id=" + postId + "&server=default&tap=1",
          name: "Full",
          slug: "full"
        }]
      });
    }

    return JSON.stringify({
      id: "",
      title: decodeHtmlEntities(title.replace(" - Siêu Tầm Phim", "").trim()),
      posterUrl: poster,
      backdropUrl: poster,
      description: description,
      servers: servers
    });
  } catch (e) {
    return JSON.stringify({ servers: [] });
  }
}

// ========================================================
// PARSE DETAIL RESPONSE (BẮT LINK PHÁT VIDEO DỰ PHÒNG TỐI ĐA)
// ========================================================

function parseDetailResponse(html, url) {
  log("Start Parsing Video Stream: " + url);
  try {
    var targetTap = 1;
    var tapMatch = url.match(/tap=(\d+)/);
    if (tapMatch) targetTap = parseInt(tapMatch[1], 10);

    // BƯỚC 1: QUÉT TẤT CẢ KHỐI DATA-EPISODES TRONG HTML
    var allDataEpisodes = [];
    var epAttrRegex = /data-episodes=(['"])([\s\S]*?)\1/gi;
    var matchAttr;
    while ((matchAttr = epAttrRegex.exec(html)) !== null) {
      allDataEpisodes.push(matchAttr[2]);
    }

    for (var k = 0; k < allDataEpisodes.length; k++) {
      var rawAttr = allDataEpisodes[k];
      
      // Quét các phần tử dạng {"mã_mã_hóa","tên"} hoặc "mã_mã_hóa"
      var epMatches = rawAttr.match(/\{"([^"]+)","([^"]+)"\}|["']([^"']+)["']/g) || [];
      if (epMatches.length >= targetTap) {
        var targetEntry = epMatches[targetTap - 1];
        var rawSrc = "";
        
        var srcMatch = targetEntry.match(/\{"([^"]+)"/);
        if (srcMatch) {
          rawSrc = srcMatch[1];
        } else {
          rawSrc = targetEntry.replace(/['"]/g, "");
        }

        if (rawSrc && rawSrc.length > 5) {
          // Giải mã XOR Key 42
          var decrypted = "";
          for (var i = 0; i < rawSrc.length; i++) {
            decrypted += String.fromCharCode(rawSrc.charCodeAt(i) ^ 42);
          }

          log("Decrypted String: " + decrypted);

          // Trường hợp 1: Chuỗi giải mã là M3U8 trực tiếp
          if (decrypted.indexOf(".m3u8") !== -1) {
            return JSON.stringify({
              url: decrypted,
              mimeType: "application/x-mpegURL",
              isEmbed: false,
              headers: { "Referer": BASE_URL + "/", "User-Agent": "Mozilla/5.0" }
            });
          }

          // Trường hợp 2: Link Abyss Player / Embed
          var isAbyss = /abyss|short\.ink|short\.icu|k-20\.xyz/i.test(decrypted);
          if (isAbyss) {
            var vMatch = decrypted.match(/(?:[?&]v=|\/|embed\/)([a-zA-Z0-9_-]+)(?:[?&]|$)/);
            var videoId = vMatch ? vMatch[1] : "";
            var embedUrl = videoId ? ("https://abyssplayer.com/e/" + videoId) : decrypted;

            return JSON.stringify({
              url: embedUrl,
              isEmbed: true,
              headers: { "Referer": BASE_URL + "/", "User-Agent": "Mozilla/5.0" }
            });
          }

          // Trường hợp 3: Link web dạng http khác
          if (decrypted.startsWith("http")) {
            return JSON.stringify({
              url: decrypted,
              isEmbed: true,
              headers: { "Referer": BASE_URL + "/", "User-Agent": "Mozilla/5.0" }
            });
          }
        }
      }
    }

    // BƯỚC 2: QUÉT Iframe TRỰC TIẾP NẾU BƯỚC 1 BỊ LỖI
    var iframeMatch = html.match(/<iframe[^>]*src="([^"]+)"/i);
    if (iframeMatch) {
      var embedUrl = iframeMatch[1];
      if (embedUrl.startsWith("//")) embedUrl = "https:" + embedUrl;
      return JSON.stringify({
        url: embedUrl,
        isEmbed: true,
        headers: { "Referer": BASE_URL + "/", "User-Agent": "Mozilla/5.0" }
      });
    }

    // BƯỚC 3: QUÉT FILE M3U8 TRỰC TIẾP TRONG HTML
    var m3u8Match = html.match(/(https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)/i);
    if (m3u8Match) {
      return JSON.stringify({
        url: m3u8Match[1],
        mimeType: "application/x-mpegURL",
        isEmbed: false,
        headers: { "Referer": BASE_URL + "/", "User-Agent": "Mozilla/5.0" }
      });
    }

    // BƯỚC 4: FALLBACK - TRẢ VỀ LINK GỐC ĐỂ APP TỰ LOAD
    return JSON.stringify({
      url: url.replace("play-", "").split("?")[0],
      isEmbed: true,
      headers: { "Referer": BASE_URL + "/", "User-Agent": "Mozilla/5.0" }
    });

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
    .replace(/&#8220;/g, '"').replace(/&#8221;/g, '"')
    .replace(/&#8216;/g, "'").replace(/&#8217;/g, "'")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ").trim();
}

function parseCategoriesResponse(html) { return "[]"; }
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
