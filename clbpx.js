var BASEURL = "https://clbphimxua.com";
var BASESOURCE = "";

// Chuỗi Cookie VIP đã được tích hợp cố định từ tài khoản của bạn
var cookie = "wordpress_logged_in_4f11e66873917c29d453ff7fc4f26e7b=gun95941%40gmail.com%7C1789111271%7CpWnW9tgQoN5g2rbk31ZegbEpI16ZDx6HwHxxVoezaVy%7Ced83aa1b6f0e0490444d39bcf243547f9848316b9189fa860883ea3782ffe920; wordpress_sec_4f11e66873917c29d453ff7fc4f26e7b=gun95941%40gmail.com%7C1789111271%7CpWnW9tgQoN5g2rbk31ZegbEpI16ZDx6HwHxxVoezaVy%7Cefe268c46f1d6d88ae82af755c35653c63673dc55abca12f6d862a97639bef41";

function getValidCookie() {
  console.log("[LOG] -> Sử dụng Cookie VIP cố định.");
  return cookie;
}

function getManifest() {
  return JSON.stringify({
    "id": "clbpxVIP",
    "name": "CLB Phim Xưa VIP",
    "version": "1.3.6",
    "info": "Fix lỗi không load danh sách phim (Fixed Cookie)",
    "BASEURL": "https://clbphimxua.com",
    "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/clbpxVIP.png",
    "headers": {
      "Host": "clbphimxua.com",
      "Referer": "https://clbphimxua.com",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Cookie": cookie
    },
    "isEnabled": true,
    "isAdult": false,
    "adblock": false,
    "type": "MOVIE",
    "author": "alokillgtv",
    "playerType": "exoplayer",
    "layoutType": "HORIZONTAL"
  });
}

function getHomeSections() {
  return JSON.stringify([{
    slug: 'home',
    title: 'Mới Cập Nhật',
    type: 'Grid',
    path: ''
  }]);
}

function getPrimaryCategories() {
  if (typeof localStorage !== 'undefined' && localStorage.getItem("SVDATA")) {
    localStorage.removeItem("SVDATA");
  }
  return JSON.stringify([
    { name: 'Kiếm Hiệp', slug: 'phim-bo-kiem-hiep-co-trang' },
    { name: 'Tiên Hiệp', slug: 'tien-hiep-ngon-tinh' },
    { name: 'Tâm Lý', slug: 'tlhd' },
    { name: 'Ma Kinh Dị', slug: 'ma-kinh-di' },
    { name: 'Điện Ảnh Châu Á', slug: 'phim-hk-tk' },
    { name: 'Điện Ảnh Âu Mỹ', slug: 'dien-anh-tay' },
    { name: 'Hàn Quốc', slug: 'drama-hq-nb' },
    { name: 'Anime', slug: 'phim-hoat-hinh' },
    { name: 'TV Series', slug: 'phim-tv' },
    { name: 'Thập Niên 60', slug: 'thap-nien-60' },
    { name: 'Thập Niên 70', slug: 'thap-nien-70' },
    { name: 'Thập Niên 80', slug: 'thap-nien-80' },
    { name: 'Thập Niên 90', slug: 'thap-nien-90' },
    { name: 'Thập Niên 2000', slug: 'thap-nien-2000' }
  ]);
}

function getFilterConfig() {
  return JSON.stringify({
    sort: [
      { name: 'Cũ nhất', value: 'oldest' },
      { name: 'Mới nhất', value: 'newest' }
    ]
  });
}

function getUrlList(slug, filtersJson) {
  var filters = JSON.parse(filtersJson || "{}");
  var page = filters.page || 1;
  var baseUrl = BASEURL;

  if (slug === '' || slug === 'home') {
    if (page > 1) return baseUrl + "/page/" + page + "/";
    return baseUrl + "/";
  }

  if (page > 1) return baseUrl + "/category/" + slug + "/page/" + page + "/";
  return baseUrl + "/category/" + slug + "/";
}

function getUrlSearch(keyword, filtersJson) {
  var filters = JSON.parse(filtersJson || "{}");
  var page = filters.page || 1;
  if (page > 1) return BASEURL + "/page/" + page + "/?s=" + encodeURIComponent(keyword);
  return BASEURL + "/?s=" + encodeURIComponent(keyword);
}

function getUrlDetail(slug) {
  if (!slug) return "";
  if (slug.indexOf("http") === 0) return slug;
  return BASEURL + "/" + slug + "/";
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============== HÀM BÓC TÁCH DANH SÁCH ===============
function parseListResponse(htmlResponse, url) {
  console.log("Loading List Data From:\n" + url);
  var items = [];

  var contentArea = htmlResponse;
  var mainMatch = htmlResponse.match(/(<main[\s\S]*?<\/main>|<div[^>]*id="primary"[^>]*>[\s\S]*?<\/div>\s*<footer)/i);
  if (mainMatch) {
    contentArea = mainMatch[0];
  }

  var blockRegex = /<article[^>]*>([\s\S]*?)<\/article>/gi;
  var blocks = [];
  var match;
  while ((match = blockRegex.exec(contentArea)) !== null) {
    blocks.push(match[1]);
  }

  if (blocks.length > 0) {
    for (var i = 0; i < blocks.length; i++) {
      var block = blocks[i];
      var linkMatch = block.match(/<a[^>]+href="([^"]+)"/i);
      
      var imgMatch = block.match(/<img[^>]+(?:data-lazy-src|data-src|src)="([^"]+)"/i);
      var titleMatch = block.match(/<img[^>]+alt="([^"]+)"/i) || block.match(/title="([^"]+)"/i) || block.match(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/i);

      if (linkMatch && imgMatch) {
        var link = linkMatch[1];
        var thumb = imgMatch[1];
        
        if (thumb.indexOf("data:image") === 0 || thumb.indexOf("blank.gif") !== -1) {
          var realImgMatch = block.match(/data-src="([^"]+)"/i) || block.match(/data-lazy-src="([^"]+)"/i);
          if (realImgMatch) thumb = realImgMatch[1];
        }

        var title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : "Không có tên";
        title = title.replace(/&#8211;/g, '-').replace(/&#8217;/g, "'").trim();

        var slugMatch = link.match(/clbphimxua\.com\/([^\/]+)\/?/);
        var slug = slugMatch ? slugMatch[1] : link;

        var year = 0;
        var yearMatch = title.match(/(19\d{2}|20\d{2})/);
        if (yearMatch) year = parseInt(yearMatch[1], 10);

        items.push({
          id: slug,
          title: title,
          posterUrl: thumb,
          backdropUrl: thumb,
          year: year
        });
      }
    }
  } else {
    var fallbackRegex = /<a[^>]+href="([^"]+)"[^>]*>[\s\S]*?<img[^>]+(?:data-lazy-src|data-src|src)="([^"]+)"/gi;
    var fbMatch;
    while ((fbMatch = fallbackRegex.exec(contentArea)) !== null) {
      var fbLink = fbMatch[1];
      var fbThumb = fbMatch[2];
      
      if (fbLink.indexOf('/category/') !== -1 || fbLink.indexOf('/tag/') !== -1 || fbLink.indexOf('/author/') !== -1) continue;
      if (fbThumb.indexOf("data:image") === 0) continue;

      var fbSlugMatch = fbLink.match(/clbphimxua\.com\/([^\/]+)\/?/);
      var fbSlug = fbSlugMatch ? fbSlugMatch[1] : fbLink;

      items.push({
        id: fbSlug,
        title: "Phim " + fbSlug,
        posterUrl: fbThumb,
        backdropUrl: fbThumb,
        year: 0
      });
    }
  }

  var totalPages = 1;
  var currentPage = 1;
  var pageRegex = /<a class="page-numbers".*?>(\d+)<\/a>/gi;
  var pm;
  while ((pm = pageRegex.exec(htmlResponse)) !== null) {
    if (parseInt(pm[1]) > totalPages) {
      totalPages = parseInt(pm[1]);
    }
  }
  var curPageMatch = htmlResponse.match(/<span aria-current="page"[^>]*>(\d+)<\/span>/i);
  if (curPageMatch) {
    currentPage = parseInt(curPageMatch[1]);
    if (currentPage > totalPages) totalPages = currentPage;
  }

  return JSON.stringify({
    items: items,
    pagination: {
      currentPage: currentPage,
      totalPages: totalPages
    }
  });
}

function parseSearchResponse(htmlResponse) {
  return parseListResponse(htmlResponse, "Search");
}

function extractVideoId(url) {
  if (!url) return "";
  var match = url.match(/[?&]v=([^&]+)/);
  return match ? match[1] : url;
}

function BASE64ENCODE(str) {
  try {
    if (!str) return "";
    var utf8Bytes = [];
    for (var i = 0; i < str.length; i++) {
      var code = str.charCodeAt(i);
      if (code < 128) { utf8Bytes.push(code); } 
      else if (code < 2048) { utf8Bytes.push((code >> 6) | 192, (code & 63) | 128); } 
      else if ((code & 0xfc00) === 0xd800 && i + 1 < str.length && (str.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
        code = 0x10000 + ((code & 0x03ff) << 10) + (str.charCodeAt(++i) & 0x03ff);
        utf8Bytes.push((code >> 18) | 240, ((code >> 12) & 63) | 128, ((code >> 6) & 63) | 128, (code & 63) | 128);
      } else {
        utf8Bytes.push((code >> 12) | 224, ((code >> 6) & 63) | 128, (code & 63) | 128);
      }
    }
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var encoded = "";
    var byte1, byte2, byte3, b1, b2, b3, b4;
    for (var j = 0; j < utf8Bytes.length; j += 3) {
      byte1 = utf8Bytes[j];
      byte2 = j + 1 < utf8Bytes.length ? utf8Bytes[j + 1] : NaN;
      byte3 = j + 2 < utf8Bytes.length ? utf8Bytes[j + 2] : NaN;
      b1 = byte1 >> 2;
      b2 = ((byte1 & 3) << 4) | (isNaN(byte2) ? 0 : byte2 >> 4);
      b3 = isNaN(byte2) ? 64 : ((byte2 & 15) << 2) | (isNaN(byte3) ? 0 : byte3 >> 6);
      b4 = isNaN(byte3) ? 64 : byte3 & 63;
      encoded += chars.charAt(b1) + chars.charAt(b2) + chars.charAt(b3) + chars.charAt(b4);
    }
    return encoded;
  } catch (e) { return ""; }
}

function parseMovieDetail(htmlResponse) {
  try {
    var id = "";
    var title = "";
    var posterUrl = "";
    var description = "";
    var saveSV = [];
    var nameMV = "";
    
    var slugMatch = htmlResponse.match(/<link rel="canonical" href="([^"]+)"/i);
    if (slugMatch) {
      var parts = slugMatch[1].split('/').filter(Boolean);
      id = parts[parts.length - 1] || "unknown_movie";
    } else {
      id = "movie_" + new Date().getTime();
    }

    var titleMatch = htmlResponse.match(/<h1 class="single-title">([^<]+)<\/h1>/i);
    if (titleMatch) title = titleMatch[1].trim();
    title = title.replace(/&#8211;/g, '-').replace(/&#8217;/g, "'");
    nameMV = title;

    var posterMatch = htmlResponse.match(/<img[^>]*class="[^"]*wp-post-image[^"]*"[^>]*src="([^"]+)"/i) 
                    || htmlResponse.match(/<img[^>]*src="([^"]+)"[^>]*class="[^"]*wp-post-image[^"]*"/i)
                    || htmlResponse.match(/<article[^>]*>[\s\S]*?<figure>\s*<img[^>]*src="([^"]+)"/i);
    
    if (posterMatch) posterUrl = posterMatch[1];
    else {
      var ogImg = htmlResponse.match(/<meta property="og:image" content="([^"]+)"/i);
      if (ogImg) posterUrl = ogImg[1];
    }

    var descMatch = htmlResponse.match(/<div class="sigle-post-content-area">([\s\S]*?)<a href/i);
    if (descMatch) {
      description = descMatch[1].replace(/<[^>]+>/g, '').trim();
    }

    var year = 0;
    var yearMatch = title.match(/(19\d{2}|20\d{2})/);
    if (yearMatch) year = parseInt(yearMatch[1], 10);

    var servers = [];
    var contentArea = "";
    var contentMatch = htmlResponse.match(/<div class="sigle-post-content-area">([\s\S]*?)<\/div>/i);
    contentArea = contentMatch ? contentMatch[1] : htmlResponse;

    var serverPatterns = [
      { pattern: /\(L\u1ed3ng Ti\u1ebfng\)/gi, name: "Lồng Tiếng" },
      { pattern: /\(L&#7891;ng Ti&#7871;ng\)/gi, name: "Lồng Tiếng" },
      { pattern: /\(Ph\u1ee5 \u0110\u1ec1\)/gi, name: "Phụ Đề" },
      { pattern: /\(Ph&#7909; &#272;&#7873;\)/gi, name: "Phụ Đề" },
      { pattern: /\(Thuy\u1ebft Minh\)/gi, name: "Thuyết Minh" },
      { pattern: /\(Thuy&#7871;t Minh\)/gi, name: "Thuyết Minh" }
    ];

    var boldSections = [];
    var boldRegex = /<b[^>]*>([\s\S]*?)<\/b>/gi;
    var bMatch;
    while ((bMatch = boldRegex.exec(contentArea)) !== null) {
      boldSections.push(bMatch[1]);
    }

    function normalizeEpUrl(rawUrl) {
      if (!rawUrl) return "";
      var pathAndQuery = rawUrl.replace(/^https?:\/\/[^\/]+/i, '');
      if (!pathAndQuery.startsWith('/')) pathAndQuery = '/' + pathAndQuery;
      return "https://example.com" + pathAndQuery;
    }

    if (boldSections.length > 0) {
      for (var si = 0; si < boldSections.length; si++) {
        var section = boldSections[si];
        var serverName = "";
        for (var pi = 0; pi < serverPatterns.length; pi++) {
          serverPatterns[pi].pattern.lastIndex = 0;
          if (serverPatterns[pi].pattern.test(section)) {
            serverName = serverPatterns[pi].name;
            break;
          }
        }
        if (!serverName) {
          var headerMatch = section.match(/^\s*\(([^)]+)\)/);
          if (headerMatch) serverName = headerMatch[1].trim();
        }

        var sectionEpisodes = [];
        var sectionLinkRegex = /<a href="([^"]*clbpx(?:\.html)?\?v=[a-zA-Z0-9_-]+)"[^>]*>([\s\S]*?)<\/a>/gi;
        var slMatch;
        var saveEp = [];

        while ((slMatch = sectionLinkRegex.exec(section)) !== null) {
          var epUrl = normalizeEpUrl(slMatch[1]);
          var epLabel = slMatch[2].replace(/<[^>]+>/g, '').trim();

          if (!epLabel || /^\s*$/.test(epLabel) || /<img/i.test(slMatch[2])) {
            epLabel = (sectionEpisodes.length === 0 && boldSections.length === 1) ? "Xem phim" : "Tập " + (sectionEpisodes.length + 1);
          }

          var vMatch = epUrl.match(/[?&]v=([a-zA-Z0-9_-]+)/);
          var videoId = vMatch ? vMatch[1] : "";
          if (videoId) saveEp.push(videoId);
          
          sectionEpisodes.push({
            id: epUrl,
            name: epLabel,
            slug: epUrl
          });
        }

        if (sectionEpisodes.length > 0) {
          var finalServerName = serverName || ("Server " + (servers.length + 1));
          saveSV.push({ nameMV: nameMV, name: finalServerName, episodes: saveEp });
          servers.push({ name: finalServerName, episodes: sectionEpisodes });
        }
      }
    }

    if (servers.length === 0) {
      var episodes = [];
      var fallbackSaveEp = [];
      var allLinksRegex = /<a href="([^"]*clbpx(?:\.html)?\?v=[a-zA-Z0-9_-]+)"[^>]*>([\s\S]*?)<\/a>/gi;
      var lMatch;

      while ((lMatch = allLinksRegex.exec(htmlResponse)) !== null) {
        var epUrl = normalizeEpUrl(lMatch[1]);
        var epLabel = lMatch[2].replace(/<[^>]+>/g, '').trim();

        if (!epLabel || /^\s*$/.test(epLabel) || /<img/i.test(lMatch[2])) {
          epLabel = "Tập " + (episodes.length + 1);
        }

        var vMatch = epUrl.match(/[?&]v=([a-zA-Z0-9_-]+)/);
        var videoId = vMatch ? vMatch[1] : "";
        if (videoId) fallbackSaveEp.push(videoId);

        episodes.push({
          id: epUrl,
          name: epLabel,
          slug: epUrl
        });
      }

      if (episodes.length > 0) {
        saveSV.push({ nameMV: nameMV, name: "Thuyết Minh", episodes: fallbackSaveEp });
        servers.push({ name: "Thuyết Minh", episodes: episodes });
      }
    }

    return JSON.stringify({
      id: id,
      title: title,
      posterUrl: posterUrl,
      backdropUrl: posterUrl,
      description: description,
      year: year,
      rating: 0,
      quality: "HD",
      servers: servers,
      category: "",
      country: "",
      director: "",
      casts: "",
      datasend: ""
    });

  } catch (error) {
    console.error("parseMovieDetail error: ", error);
    return JSON.stringify({});
  }
}

function parseDetailResponse(htmlResponse, fallbackUrl, datasend) {
  try {
    var vMatch = fallbackUrl.match(/[?&]v=([a-zA-Z0-9_-]+)/);
    var videoId = vMatch ? vMatch[1] : "";
    var stream = "https://abysscdn.com/?v=" + videoId;
    return JSON.stringify({
      url: stream,
      mimeType: "video/mp4",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      }
    });
  } catch (error) {
    return JSON.stringify({
      url: "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4",
      mimeType: "video/mp4",
      isEmbed: false,
      headers: {},
      subtitles: []
    });
  }
}
