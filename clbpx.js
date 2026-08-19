var BASEURL = "https://clbpx.alokillgtv.workers.dev";
var BASESOURCE = "";

var popup_html = "<div class='donate-container'><h2 class='donate-heading'>DONATE</h2><p class='donate-description'>Anh em yêu quý có thể mời bọn mình 2 ly cà phê nhé. Để có động lực duy trì App, cập nhật plugin và tìm thêm nhiều nguồn mới và hay cho anh em. Một chút lòng thành cũng làm bọn mình tiếp tục hoạt động tốt hơn, cám ơn anh em.</p><div class='donate-grid'><div class='donate-card'><div class='donate-title'>Donate Tác giả Plugin</div><div class='qr-wrapper'><img src='https://vaxplugin.alokillgtv.workers.dev/img/qrht.png' alt='Donate Tác giả Plugin' /></div></div><div class='donate-card'><div class='donate-title'>Donate Tác giả App</div><div class='qr-wrapper'><img src='https://vaxplugin.alokillgtv.workers.dev/img/qryb.png' alt='Donate Tác giả App' /></div></div></div></div><style>.donate-container{max-width:800px;margin:0 auto;padding:10px;box-sizing:border-box;font-family:Arial,sans-serif;text-align:center;color:#eee}.donate-heading{font-size:22px;font-weight:bold;margin:0 0 12px 0;color:#fff;text-transform:uppercase;letter-spacing:1px}.donate-description{font-size:14px;line-height:1.5;margin-bottom:18px;color:#ccc}.donate-grid{display:flex;flex-direction:row;justify-content:center;align-items:stretch;gap:16px}.donate-card{flex:1;min-width:0;background:#22252a;border-radius:12px;padding:14px;border:1px solid #33373e;display:flex;flex-direction:column;align-items:center}.donate-title{font-weight:bold;font-size:15px;margin-bottom:12px;color:#fff}.qr-wrapper{width:100%;max-width:240px;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;background:#181a1d;border-radius:8px;padding:8px;box-sizing:border-box}.qr-wrapper img{width:100%;height:100%;object-fit:contain;border-radius:4px}@media(max-width:600px){.donate-grid{flex-direction:column}.donate-heading{font-size:18px;margin-bottom:8px}.donate-description{font-size:13px;margin-bottom:12px}.qr-wrapper{max-width:180px}}</style>";

function getManifest() {
  return JSON.stringify({
    "id": "clbpxVIP",
    "name": "CLB Phim Xưa VIP",
    "version": "1.1.9",
    "info": "",
    "BASEURL": BASEURL,
    "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/clbpxVIP.png",
    "isEnabled": true,
    "isAdult": false,
    "adblock": false,
    "type": "MOVIE",
    "author": "alokillgtv",
    "playerType": "exoplayer",
    "layoutType": "HORIZONTAL",
    "popup_html": popup_html
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

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
  var filters = {};
  try {
    filters = JSON.parse(filtersJson || "{}");
  } catch(e) {}
  
  var page = filters.page || 1;
  var baseUrl = BASEURL;

  if (!slug || slug === '' || slug === 'home') {
    if (page > 1) {
      return baseUrl + "/page/" + page + "/";
    }
    return baseUrl + "/";
  }

  if (page > 1) {
    return baseUrl + "/category/" + slug + "/page/" + page + "/";
  }
  return baseUrl + "/category/" + slug + "/";
}

function getUrlSearch(keyword, filtersJson) {
  var filters = {};
  try {
    filters = JSON.parse(filtersJson || "{}");
  } catch(e) {}
  
  var page = filters.page || 1;
  if (page > 1) {
    return BASEURL + "/page/" + page + "/?s=" + encodeURIComponent(keyword);
  }
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

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(htmlResponse, url) {
  var items = [];
  if (!htmlResponse) {
    return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
  }

  var regex = /<article[^>]*>[\s\S]*?<a\s+href="([^"]+)"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"[^>]*alt="([^"]+)"/gi;
  var match;

  while ((match = regex.exec(htmlResponse)) !== null) {
    var link = match[1] || "";
    var thumb = match[2] || "";
    var title = match[3] || "";

    title = title.replace(/&#8211;/g, '-').replace(/&#8217;/g, "'");

    var cleanLink = link.replace(/\/$/, "");
    var parts = cleanLink.split('/');
    var slug = parts[parts.length - 1] || link;

    var year = 0;
    var yearMatch = title.match(/19\d{2}|20\d{2}/);
    if (yearMatch) {
      year = parseInt(yearMatch[0], 10);
    }

    items.push({
      id: slug,
      title: title.trim(),
      posterUrl: thumb,
      backdropUrl: thumb,
      year: year
    });
  }

  var totalPages = 1;
  var currentPage = 1;
  var pageRegex = /<a class="page-numbers".*?>(\d+)<\/a>/gi;
  var pm;
  while ((pm = pageRegex.exec(htmlResponse)) !== null) {
    var pNum = parseInt(pm[1], 10);
    if (pNum > totalPages) totalPages = pNum;
  }
  
  var curPageMatch = htmlResponse.match(/<span aria-current="page" class="page-numbers current">(\d+)<\/span>/i);
  if (curPageMatch) {
    currentPage = parseInt(curPageMatch[1], 10);
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
  return parseListResponse(htmlResponse);
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
      var canonicalUrl = slugMatch[1].replace(/\/$/, "");
      var parts = canonicalUrl.split('/');
      id = parts[parts.length - 1] || "unknown_movie";
    } else {
      id = "movie_" + new Date().getTime();
    }

    var titleMatch = htmlResponse.match(/<h1 class="single-title">([^<]+)<\/h1>/i);
    if (titleMatch) title = titleMatch[1].trim();
    title = title.replace(/&#8211;/g, '-').replace(/&#8217;/g, "'");
    nameMV = title;
    
    var posterMatch = htmlResponse.match(/<img[^>]*class="[^"]*wp-post-image[^"]*"[^>]*src="([^"]+)"/i);
    if (!posterMatch) {
      posterMatch = htmlResponse.match(/<img[^>]*src="([^"]+)"[^>]*class="[^"]*wp-post-image[^"]*"/i);
    }
    if (!posterMatch) {
      posterMatch = htmlResponse.match(/<article[^>]*>[\s\S]*?<figure>\s*<img[^>]*src="([^"]+)"/i);
    }
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
      if (pathAndQuery.indexOf('/') !== 0) {
        pathAndQuery = '/' + pathAndQuery;
      }
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
            epLabel = sectionEpisodes.length === 0 && boldSections.length === 1 ? "Xem phim" : "Tập " + (sectionEpisodes.length + 1);
          }

          var vMatch = epUrl.match(/[?&]v=([a-zA-Z0-9_-]+)/);
          var videoId = vMatch ? vMatch[1] : "";
          if (videoId) saveEp.push(videoId);
          var link = "https://sc.k-20.xyz/stream/series/clbpx:lo2b09rr074-2q1390mfi:" + videoId + ".json";
          sectionEpisodes.push({
            id: link,
            name: epLabel,
            slug: epUrl
          });
        }

        if (sectionEpisodes.length > 0) {
          var finalServerName = serverName || ("Server " + (servers.length + 1));
          saveSV.push({
            nameMV: nameMV,
            name: finalServerName,
            episodes: saveEp
          });
          servers.push({
            name: finalServerName,
            episodes: sectionEpisodes
          });
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
        var link = "https://sc.k-20.xyz/stream/series/clbpx:lo2b09rr074-2q1390mfi:" + videoId + ".json";
        episodes.push({
          id: link,
          name: epLabel,
          slug: epUrl
        });
      }

      if (episodes.length > 0) {
        saveSV.push({
          nameMV: nameMV,
          name: "Thuyết Minh",
          episodes: fallbackSaveEp
        });
        servers.push({
          name: "Thuyết Minh",
          episodes: episodes
        });
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
    return "null";
  }
}

function parseDetailResponse(htmlResponse, fallbackUrl, datasend) {
  try {
    var $data = JSON.parse(htmlResponse);
    var streamUrl = "";

    // Đọc URL từ mảng streams trả về từ server sc.k-20.xyz
    if ($data && $data.streams && $data.streams.length > 0) {
      streamUrl = $data.streams[0].url || "";
    } else if ($data && $data.url) {
      streamUrl = $data.url;
    }

    if (!streamUrl) {
      streamUrl = fallbackUrl || "";
    }

    streamUrl = streamUrl.trim();

    // Chuẩn hóa MimeType chính xác cho MP4 Direct Stream
    var mimeType = "video/mp4";
    if (streamUrl.indexOf(".m3u8") !== -1) {
      mimeType = "application/x-mpegURL";
    }

    return JSON.stringify({
      url: streamUrl,
      mimeType: mimeType,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*"
      }
    });

  } catch (error) {
    return JSON.stringify({
      url: fallbackUrl || "",
      headers: {}
    });
  }
}
