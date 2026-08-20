// ========================================================
// SIÊU TẦM PHIM VAAPP PLUGIN (DIRECT PROXY STREAM FIX)
// ========================================================

var BASE_URL = "https://www.sieutamphim.pro";
var popup_html = "<div class='donate-container'><h2 class='donate-heading'>DONATE</h2><p class='donate-description'>Anh em yêu quý có thể mời bọn mình 2 ly cà phê nhé. Để có động lực duy trì App, cập nhật plugin và tìm thêm nhiều nguồn mới và hay cho anh em. Một chút lòng thành cũng làm bọn mình tiếp tục hoạt động tốt hơn, cám ơn anh em.</p><div class='donate-grid'><div class='donate-card'><div class='donate-title'>Donate Tác giả Plugin</div><div class='qr-wrapper'><img src='https://vaxplugin.alokillgtv.workers.dev/img/qrht.png' alt='Donate Tác giả Plugin' /></div></div><div class='donate-card'><div class='donate-title'>Donate Tác giả App</div><div class='qr-wrapper'><img src='https://vaxplugin.alokillgtv.workers.dev/img/qryb.png' alt='Donate Tác giả App' /></div></div></div></div><style>.donate-container{max-width:800px;margin:0 auto;padding:10px;box-sizing:border-box;font-family:Arial,sans-serif;text-align:center;color:#eee}.donate-heading{font-size:22px;font-weight:bold;margin:0 0 12px 0;color:#fff;text-transform:uppercase;letter-spacing:1px}.donate-description{font-size:14px;line-height:1.5;margin-bottom:18px;color:#ccc}.donate-grid{display:flex;flex-direction:row;justify-content:center;align-items:stretch;gap:16px}.donate-card{flex:1;min-width:0;background:#22252a;border-radius:12px;padding:14px;border:1px solid #33373e;display:flex;flex-direction:column;align-items:center}.donate-title{font-weight:bold;font-size:15px;margin-bottom:12px;color:#fff}.qr-wrapper{width:100%;max-width:240px;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;background:#181a1d;border-radius:8px;padding:8px;box-sizing:border-box}.qr-wrapper img{width:100%;height:100%;object-fit:contain;border-radius:4px}@media(max-width:600px){.donate-grid{flex-direction:column}.donate-heading{font-size:18px;margin-bottom:8px}.donate-description{font-size:13px;margin-bottom:12px}.qr-wrapper{max-width:180px}}</style>";

function getManifest() {
  return JSON.stringify({
    "id": "sieutamphim",
    "name": "Sưu Tầm Phim",
    "version": "1.2.1",
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
  log("Resolving Detail ID: " + id);
  if (!id) return BASE_URL;
  if (id.startsWith("http://") || id.startsWith("https://")) {
    return id;
  }
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
// PARSE DETAIL (TỰ GIẢI MÃ VÀ DỰNG MP4 PROXY TRỰC TIẾP)
// ========================================================

function extractYearFromText(str) {
  if (!str) return "";
  var labelMatch = str.match(/(?:Năm phát hành|Năm sản xuất|Phát hành|Năm|Year|Release)[:\s]*<[^>]*>?\s*(19\d\d|20[0-2]\d)/i) ||
                   str.match(/(?:Năm phát hành|Năm sản xuất|Phát hành|Năm|Year|Release)[:\s]*(19\d\d|20[0-2]\d)/i);
  if (labelMatch) return labelMatch[1];

  var titleMatch = str.match(/[\(\[\s](19\d\d|20[0-2]\d)[\)\]\s]/);
  if (titleMatch) return titleMatch[1];

  return "";
}

function parseMovieDetail(html, url) {
  try {
    var title = "";
    var poster = "";
    var description = "";
    var movieUrl = url;
    var contentHtml = html;
    var detectedYear = "";

    if (url && url.includes("/wp-json/wp/v2/posts")) {
      var posts = JSON.parse(html);
      if (!posts || posts.length === 0) return JSON.stringify({ servers: [] });
      
      var post = posts[0];
      for (var p = 0; p < posts.length; p++) {
        if (url.includes(posts[p].slug)) {
          post = posts[p];
          break;
        }
      }

      title = post.title ? post.title.rendered : "";
      movieUrl = post.link || url;
      contentHtml = post.content ? post.content.rendered : "";
      description = post.excerpt ? post.excerpt.rendered.replace(/<[^>]*>/g, "").trim() : "";
      poster = post.jetpack_featured_media_url || post.featured_media_src_url || "";
      
      detectedYear = extractYearFromText(contentHtml) || extractYearFromText(title);
      if (!detectedYear && post.date && post.date.length >= 4) {
        detectedYear = post.date.substring(0, 4);
      }
    } else {
      title = (html.match(/<meta property="og:title" content="([^"]+)"/i) || [])[1] || "";
      var ogImageMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i);
      poster = ogImageMatch ? ogImageMatch[1] : "";
      description = (html.match(/<meta property="og:description" content="([^"]+)"/i) || [])[1] || "";
      movieUrl = (html.match(/<meta property="og:url" content="([^"]+)"/i) || [])[1] || url;
      
      detectedYear = extractYearFromText(html) || extractYearFromText(title);
    }

    if (!detectedYear || isNaN(parseInt(detectedYear, 10)) || parseInt(detectedYear, 10) > 2026) {
      detectedYear = "2024";
    }

    var servers = [];
    var usedServer = {};

    var groupRegex = /data-server=['"]([^'"]+)['"]/gi;
    var m;
    while ((m = groupRegex.exec(contentHtml)) !== null) {
      var serverId = m[1];
      if (usedServer[serverId]) continue;
      usedServer[serverId] = true;

      var epBlockRegex = new RegExp('data-server=["\']' + serverId + '["\'][\\s\\S]*?data-episodes=([\'"])([\\s\\S]*?)\\1', "i");
      var epBlockMatch = contentHtml.match(epBlockRegex);

      var episodes = [];

      if (epBlockMatch) {
        var rawEpisodes = epBlockMatch[2];
        var epRegex = /{"([^"]+)","([^"]+)"}/g;
        var epMatch;
        var epCount = 1;

        while ((epMatch = epRegex.exec(rawEpisodes)) !== null) {
          var rawSrc = epMatch[1];
          var epName = epMatch[2] || ("Tập " + epCount);

          // 1. Giải mã chuỗi mã hóa XOR 42
          var decrypted = "";
          for (var k = 0; k < rawSrc.length; k++) {
            decrypted += String.fromCharCode(rawSrc.charCodeAt(k) ^ 42);
          }

          var finalDirectUrl = decrypted;

          // 2. Nếu là link Embed (chứa abyssplayer.com) -> Chuyển thành link MP4 Proxy 720p (res=4) trực tiếp
          if (decrypted.indexOf(".m3u8") === -1 && decrypted.indexOf(".mp4") === -1) {
            var embedUrl = decrypted;
            if (!embedUrl.startsWith("http")) {
              embedUrl = "https://abyssplayer.com/" + embedUrl.replace(/^\//, "");
            }
            finalDirectUrl = "https://sc.k-20.xyz/hx-mp4?embed=" + encodeURIComponent(embedUrl) + "&res=4&size=2879240765";
          }

          episodes.push({
            id: finalDirectUrl,
            url: finalDirectUrl,
            file: finalDirectUrl,
            link: finalDirectUrl,
            datasend: finalDirectUrl,
            name: epName,
            slug: "tap-" + epCount
          });

          epCount++;
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
      year: detectedYear,
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
// STREAM HANDLER (BẢO HIỂM LẠI LINK MP4 PROXY)
// ========================================================

function parseDetailResponse(html, fallbackUrl, datasend) {
  var streamUrl = fallbackUrl || datasend || html || "";
  if (typeof streamUrl === 'string') streamUrl = streamUrl.trim();

  return JSON.stringify({
    url: streamUrl,
    playUrl: streamUrl,
    file: streamUrl,
    link: streamUrl,
    mimeType: streamUrl.indexOf(".m3u8") !== -1 ? "application/x-mpegURL" : "video/mp4",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Referer": "https://sc.k-20.xyz/",
      "Accept": "*/*"
    }
  });
}

function parseEmbedResponse(html, sourceUrl, datasend) {
  return parseDetailResponse(html, sourceUrl, datasend);
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
