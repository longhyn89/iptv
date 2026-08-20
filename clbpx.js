// ========================================================
// CLB PHIM XƯA VIP PLUGIN (FIXED DESCRIPTION & DIRECT STREAM)
// ========================================================

var BASEURL = "https://clbpx.alokillgtv.workers.dev";
var BASESOURCE = "";

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
    "layoutType": "HORIZONTAL"
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

function cleanHtmlText(str) {
  if (!str) return "";
  return str
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#8211;/g, '-').replace(/&#8212;/g, '-')
    .replace(/&#8220;/g, '"').replace(/&#8221;/g, '"')
    .replace(/&#8216;/g, "'").replace(/&#8217;/g, "'")
    .replace(/&#038;/g, "&").replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

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

    // 1. Lấy ID
    var slugMatch = htmlResponse.match(/<link rel="canonical" href="([^"]+)"/i);
    if (slugMatch) {
      var parts = slugMatch[1].replace(/\/$/, "").split('/');
      id = parts[parts.length - 1] || "movie";
    } else id = "movie_" + new Date().getTime();

    // 2. Lấy Tên Phim
    var titleMatch = htmlResponse.match(/<h1 class="single-title">([^<]+)<\/h1>/i) || htmlResponse.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (titleMatch) title = titleMatch[1].trim().replace(/&#8211;/g, '-').replace(/&#8217;/g, "'");

    // 3. Lấy Ảnh Poster
    var posterMatch = htmlResponse.match(/<img[^>]*class="[^"]*wp-post-image[^"]*"[^>]*src="([^"]+)"/i) || htmlResponse.match(/<meta property="og:image" content="([^"]+)"/i);
    if (posterMatch) posterUrl = posterMatch[1];

    // 4. BÓC TÁCH MÔ TẢ PHIM (DESCRIPTION)
    var descMatch = htmlResponse.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i) || htmlResponse.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
    if (descMatch && descMatch[1].trim().length > 10) {
      description = descMatch[1];
    } else {
      var contentMatch = htmlResponse.match(/<div class="entry-content[^"]*">([\s\S]*?)<\/div>/i) || htmlResponse.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
      if (contentMatch) {
        var paragraphs = contentMatch[1].match(/<p>([\s\S]*?)<\/p>/gi);
        if (paragraphs && paragraphs.length > 0) {
          var filteredText = [];
          for (var i = 0; i < paragraphs.length; i++) {
            var pText = cleanHtmlText(paragraphs[i]);
            if (pText && !pText.includes("http") && pText.length > 15) {
              filteredText.push(pText);
            }
          }
          description = filteredText.join("\n\n");
        }
      }
    }
    description = cleanHtmlText(description);

    // 5. Lấy Năm Phát Hành
    var year = 0;
    var yearMatch = title.match(/(19\d{2}|20\d{2})/);
    if (yearMatch) year = parseInt(yearMatch[1], 10);

    // 6. Bóc Tách Tập Phim & Link MP4 Direct
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

      var embedUrl = "https://abyssplayer.com/" + videoId;
      var directMp4 = "https://sc.k-20.xyz/hx-mp4?embed=" + encodeURIComponent(embedUrl) + "&res=4&size=2879240765";

      episodes.push({
        id: directMp4,
        url: directMp4,
        file: directMp4,
        link: directMp4,
        datasend: directMp4,
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

function parseDetailResponse(htmlResponse, fallbackUrl, datasend) {
  var streamUrl = fallbackUrl || datasend || "";

  if (typeof htmlResponse === 'string' && htmlResponse.trim().indexOf('{') === 0) {
    try {
      var $data = JSON.parse(htmlResponse);
      if ($data && $data.streams && $data.streams.length > 0) {
        streamUrl = $data.streams[0].url || streamUrl;
      }
    } catch (e) {}
  } else if (typeof htmlResponse === 'string' && htmlResponse.indexOf("http") === 0) {
    streamUrl = htmlResponse.trim();
  }

  return JSON.stringify({
    url: streamUrl,
    playUrl: streamUrl,
    file: streamUrl,
    link: streamUrl,
    mimeType: "video/mp4",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Referer": "https://sc.k-20.xyz/",
      "Accept": "*/*"
    }
  });
}

function getStream(htmlResponse, fallbackUrl, datasend) {
  return parseDetailResponse(htmlResponse, fallbackUrl, datasend);
}
