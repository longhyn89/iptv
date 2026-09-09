BASEURL = "https://clbphimxua.com";
BASESOURCE = "";

function getValidCookie() {
  var domain = "https://clbphimxua.com";
  var userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

  // 1. Kiểm tra Cookie hiện tại của domain bằng getSetCookies
  console.log("[LOG] -> Kiểm tra trạng thái đăng nhập qua getSetCookies...");
  var checkCookies = getSetCookies(domain, {
    "User-Agent": userAgent
  });
  var checkCookieStr = "";

  if (checkCookies && checkCookies.length > 0) {
    checkCookieStr = checkCookies.map(function(c) {
      return c.split(";")[0].trim();
    }).join("; ");
  }

  // 2. Nếu đã có cookie wordpress_logged_in_ -> Dùng luôn, KHÔNG cần đăng nhập lại
  if (checkCookieStr && checkCookieStr.indexOf("wordpress_logged_in_") !== -1) {
    console.log("[LOG] -> ĐÃ ĐĂNG NHẬP SẴN! Dùng lại Cookie hiện tại.");
    return checkCookieStr;
  }

  // 3. Nếu chưa đăng nhập -> Mới tiến hành POST đăng nhập
  console.log("[LOG] -> CHƯA ĐĂNG NHẬP! Tiến hành gửi POST đăng nhập...");
  return loginAndGetCookie();
}

function loginAndGetCookie() {
  var domain = "https://clbphimxua.com";
  var loginUrl = domain + "/wp-login.php";
  var userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

  // Bước 1: Dùng getSetCookies lấy test cookie ban đầu
  var initCookiesArr = getSetCookies(loginUrl, {
    "User-Agent": userAgent
  });
  var initialCookies = "";

  if (initCookiesArr && initCookiesArr.length > 0) {
    initialCookies = initCookiesArr.map(function(c) {
      return c.split(";")[0].trim();
    }).join("; ");
  }

  if (initialCookies.indexOf("wordpress_test_cookie") === -1) {
    initialCookies += (initialCookies ? "; " : "") + "wordpress_test_cookie=WP%20Cookie%20check";
  }

  // Bước 2: POST đăng nhập
  var bodyData = "log=" + encodeURIComponent("gun95941@gmail.com") +
    "&pwd=" + encodeURIComponent("123456") +
    "&rememberme=forever" +
    "&wp-submit=" + encodeURIComponent("Đăng nhập") +
    "&redirect_to=" + encodeURIComponent(domain + "/wp-admin/") +
    "&testcookie=1";

  var loginRes = httpRequest(loginUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": initialCookies,
      "Origin": domain,
      "Referer": loginUrl,
      "User-Agent": userAgent
    },
    body: bodyData
  });

  // Bước 3: Lấy Set-Cookie xác thực trả về
  var authCookiesArr = [];
  if (loginRes && loginRes.setCookies) {
    authCookiesArr = loginRes.setCookies.map(function(c) {
      return c.split(";")[0].trim();
    });
  }

  var fullCookieStr = authCookiesArr.join("; ");

  if (fullCookieStr && fullCookieStr.indexOf("wordpress_") !== -1) {
    toast("Đăng nhập thành công!");
    return fullCookieStr;
  } else {
    toast("Đăng nhập thất bại!");
    return "";
  }
}

// Chạy kiểm tra phiên trước
var cookie = getValidCookie();

function getManifest() {
  return JSON.stringify({
    "id": "clbpxVIP",
    "name": "CLB Phim Xưa VIP",
    "version": "1.0.1",
    "info": "",
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
  return JSON.stringify([{
      name: 'Kiếm Hiệp',
      slug: 'phim-bo-kiem-hiep-co-trang'
    },
    {
      name: 'Tiên Hiệp',
      slug: 'tien-hiep-ngon-tinh'
    },
    {
      name: 'Tâm Lý',
      slug: 'tlhd'
    },
    {
      name: 'Ma Kinh Dị',
      slug: 'ma-kinh-di'
    },
    {
      name: 'Điện Ảnh Châu Á',
      slug: 'phim-hk-tk'
    },
    {
      name: 'Điện Ảnh Âu Mỹ',
      slug: 'dien-anh-tay'
    },
    {
      name: 'Hàn Quốc',
      slug: 'drama-hq-nb'
    },
    {
      name: 'Anime',
      slug: 'phim-hoat-hinh'
    },
    {
      name: 'TV Series',
      slug: 'phim-tv'
    },
    {
      name: 'Thập Niên 60',
      slug: 'thap-nien-60'
    },
    {
      name: 'Thập Niên 70',
      slug: 'thap-nien-70'
    },
    {
      name: 'Thập Niên 80',
      slug: 'thap-nien-80'
    },
    {
      name: 'Thập Niên 90',
      slug: 'thap-nien-90'
    },
    {
      name: 'Thập Niên 2000',
      slug: 'thap-nien-2000'
    }
  ]);
}

function getFilterConfig() {
  return JSON.stringify({
    sort: [{
        name: 'Cũ nhất',
        value: 'oldest'
      },
      {
        name: 'Mới nhất',
        value: 'newest'
      }
    ]
  });
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
  var filters = JSON.parse(filtersJson || "{}");
  var page = filters.page || 1;
  var baseUrl = BASEURL;

  if (slug === '' || slug === 'home') {
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
  var filters = JSON.parse(filtersJson || "{}");
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

function getUrlCategories() {
  return "";
}

function getUrlCountries() {
  return "";
}

function getUrlYears() {
  return "";
}

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(htmlResponse, url) {
  console.log("list\n" + url);

  var items = [];
  var regex = /<article.*?id="post-[^>]+>[\s\S]*?<a href="([^"]+)".*?>\s*<figure[\s\S]*?<img.*?src="([^"]+)".*?alt="([^"]+)".*?>/gi;
  var match;

  while ((match = regex.exec(htmlResponse)) !== null) {
    var link = match[1] || "";
    var thumb = match[2] || "";
    var title = match[3] || "";

    title = title.replace(/&#8211;/g, '-').replace(/&#8217;/g, "'");

    var slugMatch = link.match(/clbphimxua\.com\/([^\/]+)\/?/);
    var slug = slugMatch ? slugMatch[1] : link;
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
    if (parseInt(pm[1]) > totalPages) {
      totalPages = parseInt(pm[1]);
    }
  }
  var curPageMatch = htmlResponse.match(/<span aria-current="page" class="page-numbers current">(\d+)<\/span>/i);
  if (curPageMatch) {
    currentPage = parseInt(curPageMatch[1]);
    if (currentPage > totalPages) totalPages = currentPage;
  }
  //console.log("list:\n" + JSON.stringify(items));
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
      if (code < 128) {
        utf8Bytes.push(code);
      } else if (code < 2048) {
        utf8Bytes.push((code >> 6) | 192, (code & 63) | 128);
      } else if (
        (code & 0xfc00) === 0xd800 &&
        i + 1 < str.length &&
        (str.charCodeAt(i + 1) & 0xfc00) === 0xdc00
      ) {
        code =
          0x10000 + ((code & 0x03ff) << 10) + (str.charCodeAt(++i) & 0x03ff);
        utf8Bytes.push(
          (code >> 18) | 240,
          ((code >> 12) & 63) | 128,
          ((code >> 6) & 63) | 128,
          (code & 63) | 128,
        );
      } else {
        utf8Bytes.push(
          (code >> 12) | 224,
          ((code >> 6) & 63) | 128,
          (code & 63) | 128,
        );
      }
    }

    var chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var encoded = "";
    var byte1, byte2, byte3;
    var b1, b2, b3, b4;

    for (var j = 0; j < utf8Bytes.length; j += 3) {
      byte1 = utf8Bytes[j];
      byte2 = j + 1 < utf8Bytes.length ? utf8Bytes[j + 1] : NaN;
      byte3 = j + 2 < utf8Bytes.length ? utf8Bytes[j + 2] : NaN;

      b1 = byte1 >> 2;
      b2 = ((byte1 & 3) << 4) | (isNaN(byte2) ? 0 : byte2 >> 4);
      b3 = isNaN(byte2) ?
        64 :
        ((byte2 & 15) << 2) | (isNaN(byte3) ? 0 : byte3 >> 6);
      b4 = isNaN(byte3) ? 64 : byte3 & 63;

      encoded +=
        chars.charAt(b1) +
        chars.charAt(b2) +
        chars.charAt(b3) +
        chars.charAt(b4);
    }

    return encoded;
  } catch (e) {
    console.log("[BASE64ENCODE Error]:", e.message || e);
    return "";
  }
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
      var canonicalUrl = slugMatch[1];
      var parts = canonicalUrl.split('/');
      id = parts[parts.length - 2] || parts[parts.length - 1] || "unknown_movie";
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

    var serverPatterns = [{
        pattern: /\(L\u1ed3ng Ti\u1ebfng\)/gi,
        name: "Lồng Tiếng"
      },
      {
        pattern: /\(L&#7891;ng Ti&#7871;ng\)/gi,
        name: "Lồng Tiếng"
      },
      {
        pattern: /\(Ph\u1ee5 \u0110\u1ec1\)/gi,
        name: "Phụ Đề"
      },
      {
        pattern: /\(Ph&#7909; &#272;&#7873;\)/gi,
        name: "Phụ Đề"
      },
      {
        pattern: /\(Thuy\u1ebft Minh\)/gi,
        name: "Thuyết Minh"
      },
      {
        pattern: /\(Thuy&#7871;t Minh\)/gi,
        name: "Thuyết Minh"
      }
    ];

    var boldSections = [];
    var boldRegex = /<b[^>]*>([\s\S]*?)<\/b>/gi;
    var bMatch;
    while ((bMatch = boldRegex.exec(contentArea)) !== null) {
      boldSections.push(bMatch[1]);
    }

    // ✅ Đã sửa: Chuẩn hóa URL bằng Regex cực kỳ an toàn, không lo lỗi crash
    function normalizeEpUrl(rawUrl) {
      if (!rawUrl) return "";
      // Loại bỏ domain cũ nếu có (http://domain.com hoặc https://domain.com)
      var pathAndQuery = rawUrl.replace(/^https?:\/\/[^\/]+/i, '');

      // Bắt buộc phải có dấu / ở đầu đường dẫn
      if (!pathAndQuery.startsWith('/')) {
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
          var link = BASEURL + "?"
          sectionEpisodes.push({
            id: epUrl,
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
        var link = "https://sc.k-20.xyz/stream/series/clbpx:lo2b09rr074-2q1390mfi:" + videoId + ".json"
        episodes.push({
          id: epUrl,
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

    var $return = JSON.stringify({
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

    console.log("return parseMovie\n" + $return);
    return $return;

  } catch (error) {
    console.error("parseMovieDetail error: ", error);
    return "null";
  }
}



function parseDetailResponse(htmlResponse, fallbackUrl, datasend) {
  try {
    console.log("Detailt:\n" + fallbackUrl)
    var vMatch = fallbackUrl.match(/[?&]v=([a-zA-Z0-9_-]+)/);
    var videoId = vMatch ? vMatch[1] : "";
    var stream = "https://abysscdn.com/?v=" + videoId;
    console.log("Stream:\n" + stream)
    return JSON.stringify({
      url: stream,
      mimeType: "video/mp4",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      }
    });
  } catch (error) {
    console.log("Lỗi parseDetail\n" + error);
    return JSON.stringify({
      url: "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4",
      mimeType: "video/mp4",
      isEmbed: false,
      headers: {},
      subtitles: []
    });
  }
}
