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
  return JSON.stringify([{ slug: 'home', title: 'Mới Cập Nhật', type: 'Grid', path: '' }]);
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
    sort: [{ name: 'Cũ nhất', value: 'oldest' }, { name: 'Mới nhất', value: 'newest' }]
  });
}

function getUrlList(slug, filtersJson) {
  var filters = {};
  try { filters = JSON.parse(filtersJson || "{}"); } catch(e) {}
  var page = filters.page || 1;
  var baseUrl = BASEURL;
  if (!slug || slug === '' || slug === 'home') {
    return page > 1 ? baseUrl + "/page/" + page + "/" : baseUrl + "/";
  }
  return page > 1 ? baseUrl + "/category/" + slug + "/page/" + page + "/" : baseUrl + "/category/" + slug + "/";
}

function getUrlSearch(keyword, filtersJson) {
  var filters = {};
  try { filters = JSON.parse(filtersJson || "{}"); } catch(e) {}
  var page = filters.page || 1;
  return page > 1 ? BASEURL + "/page/" + page + "/?s=" + encodeURIComponent(keyword) : BASEURL + "/?s=" + encodeURIComponent(keyword);
}

function getUrlDetail(slug) {
  if (!slug) return "";
  if (slug.indexOf("http") === 0) return slug;
  return BASEURL + "/" + slug + "/";
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

function parseListResponse(htmlResponse, url) {
  var items = [];
  if (!htmlResponse) return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });

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
    if (yearMatch) year = parseInt(yearMatch[0], 10);

    items.push({ id: slug, title: title.trim(), posterUrl: thumb, backdropUrl: thumb, year: year });
  }

  var totalPages = 1, currentPage = 1;
  var pageRegex = /<a class="page-numbers".*?>(\d+)<\/a>/gi, pm;
  while ((pm = pageRegex.exec(htmlResponse)) !== null) {
    var pNum = parseInt(pm[1], 10);
    if (pNum > totalPages) totalPages = pNum;
  }
  var curPageMatch = htmlResponse.match(/<span aria-current="page" class="page-numbers current">(\d+)<\/span>/i);
  if (curPageMatch) {
    currentPage = parseInt(curPageMatch[1], 10);
    if (currentPage > totalPages) totalPages = currentPage;
  }

  return JSON.stringify({ items: items, pagination: { currentPage: currentPage, totalPages: totalPages } });
}

function parseSearchResponse(htmlResponse) { return parseListResponse(htmlResponse); }

function parseMovieDetail(htmlResponse) {
  try {
    var id = "", title = "", posterUrl = "", description = "";
    var slugMatch = htmlResponse.match(/<link rel="canonical" href="([^"]+)"/i);
    if (slugMatch) {
      var parts = slugMatch[1].replace(/\/$/, "").split('/');
      id = parts[parts.length - 1] || "movie";
    } else id = "movie_" + new Date().getTime();

    var titleMatch = htmlResponse.match(/<h1 class="single-title">([^<]+)<\/h1>/i);
    if (titleMatch) title = titleMatch[1].trim().replace(/&#8211;/g, '-').replace(/&#8217;/g, "'");
    
    var posterMatch = htmlResponse.match(/<img[^>]*class="[^"]*wp-post-image[^"]*"[^>]*src="([^"]+)"/i);
    if (posterMatch) posterUrl = posterMatch[1];

    var year = 0;
    var yearMatch = title.match(/(19\d{2}|20\d{2})/);
    if (yearMatch) year = parseInt(yearMatch[1], 10);

    var servers = [];
    var episodes = [];
    var allLinksRegex = /<a href="([^"]*clbpx(?:\.html)?\?v=([a-zA-Z0-9_-]+))"[^>]*>([\s\S]*?)<\/a>/gi;
    var lMatch;

    while ((lMatch = allLinksRegex.exec(htmlResponse)) !== null) {
      var videoId = lMatch[2] || "";
      var epLabel = lMatch[3].replace(/<[^>]+>/g, '').trim();
      if (!epLabel || /^\s*$/.test(epLabel) || /<img/i.test(lMatch[3])) {
        epLabel = "Tập " + (episodes.length + 1);
      }

      var streamJsonUrl = "https://sc.k-20.xyz/stream/series/clbpx:lo2b09rr074-2q1390mfi:" + videoId + ".json";

      episodes.push({
        id: streamJsonUrl,
        url: streamJsonUrl,
        file: streamJsonUrl,
        link: streamJsonUrl,
        name: epLabel,
        slug: videoId
      });
    }

    if (episodes.length > 0) {
      servers.push({ name: "Server SV VIP", episodes: episodes });
    }

    return JSON.stringify({
      id: id,
      title: title,
      posterUrl: posterUrl,
      backdropUrl: posterUrl,
      description: description,
      year: year,
      quality: "HD",
      servers: servers
    });
  } catch (error) { return "null"; }
}

// Bổ sung Alias Handler cho cả 2 loại Engine của App
function parseDetailResponse(htmlResponse, fallbackUrl, datasend) {
  return extractStream(htmlResponse, fallbackUrl);
}

function getStream(htmlResponse, fallbackUrl) {
  return extractStream(htmlResponse, fallbackUrl);
}

function extractStream(htmlResponse, fallbackUrl) {
  try {
    var $data = (typeof htmlResponse === 'object') ? htmlResponse : JSON.parse(htmlResponse);
    var streamUrl = "";

    if ($data && $data.streams && $data.streams.length > 0) {
      streamUrl = $data.streams[0].url || "";
    } else if ($data && $data.url) {
      streamUrl = $data.url;
    }

    if (!streamUrl) streamUrl = fallbackUrl || "";
    streamUrl = streamUrl.trim();

    var result = {
      url: streamUrl,
      playUrl: streamUrl,
      file: streamUrl,
      link: streamUrl,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "*/*"
      }
    };

    return typeof htmlResponse === 'string' ? JSON.stringify(result) : result;
  } catch (error) {
    return JSON.stringify({ url: fallbackUrl || "", playUrl: fallbackUrl || "" });
  }
}
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
    if (yearMatch) year = parseInt(yearMatch[0], 10);

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
    
    var posterMatch = htmlResponse.match(/<img[^>]*class="[^"]*wp-post-image[^"]*"[^>]*src="([^"]+)"/i);
    if (!posterMatch) posterMatch = htmlResponse.match(/<img[^>]*src="([^"]+)"[^>]*class="[^"]*wp-post-image[^"]*"/i);
    if (!posterMatch) posterMatch = htmlResponse.match(/<article[^>]*>[\s\S]*?<figure>\s*<img[^>]*src="([^"]+)"/i);
    if (posterMatch) posterUrl = posterMatch[1];

    var year = 0;
    var yearMatch = title.match(/(19\d{2}|20\d{2})/);
    if (yearMatch) year = parseInt(yearMatch[1], 10);

    var servers = [];
    var episodes = [];
    var allLinksRegex = /<a href="([^"]*clbpx(?:\.html)?\?v=([a-zA-Z0-9_-]+))"[^>]*>([\s\S]*?)<\/a>/gi;
    var lMatch;

    while ((lMatch = allLinksRegex.exec(htmlResponse)) !== null) {
      var videoId = lMatch[2] || "";
      var epLabel = lMatch[3].replace(/<[^>]+>/g, '').trim();

      if (!epLabel || /^\s*$/.test(epLabel) || /<img/i.test(lMatch[3])) {
        epLabel = "Tập " + (episodes.length + 1);
      }

      // Chuẩn hóa link request stream tuyệt đối hợp lệ dạng URL
      var streamJsonUrl = "https://sc.k-20.xyz/stream/series/" + encodeURIComponent("clbpx:lo2b09rr074-2q1390mfi:" + videoId) + ".json";

      episodes.push({
        id: streamJsonUrl,
        url: streamJsonUrl,
        name: epLabel,
        slug: videoId
      });
    }

    if (episodes.length > 0) {
      servers.push({
        name: "Server SV VIP",
        episodes: episodes
      });
    }

    return JSON.stringify({
      id: id,
      title: title,
      posterUrl: posterUrl,
      backdropUrl: posterUrl,
      description: description,
      year: year,
      quality: "HD",
      servers: servers
    });

  } catch (error) {
    return "null";
  }
}

function parseDetailResponse(htmlResponse, fallbackUrl, datasend) {
  try {
    var $data = JSON.parse(htmlResponse);
    var streamUrl = "";

    if ($data && $data.streams && $data.streams.length > 0) {
      streamUrl = $data.streams[0].url || "";
    } else if ($data && $data.url) {
      streamUrl = $data.url;
    }

    if (!streamUrl) streamUrl = fallbackUrl || "";
    streamUrl = streamUrl.trim();

    return JSON.stringify({
      url: streamUrl,
      playUrl: streamUrl,
      link: streamUrl,
      mimeType: "video/mp4",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*"
      }
    });

  } catch (error) {
    return JSON.stringify({
      url: fallbackUrl || "",
      playUrl: fallbackUrl || "",
      headers: {}
    });
  }
}
