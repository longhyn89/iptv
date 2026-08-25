var BASEURL = "https://sc.k-20.xyz";
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
  return JSON.stringify([{
    slug: 'series/home',
    title: 'Phim Bộ Mới',
    type: 'Grid',
    path: ''
  }]);
}

function getPrimaryCategories() {
  if (typeof localStorage !== 'undefined' && localStorage.getItem("SVDATA")) {
    localStorage.removeItem("SVDATA");
  }
  return JSON.stringify([
    { name: 'Kiếm Hiệp', slug: 'Kiếm Hiệp' },
    { name: 'Tiên Hiệp', slug: 'Tiên Hiệp' },
    { name: 'Tâm Lý', slug: 'Tâm Lý' },
    { name: 'Ma Kinh Dị', slug: 'Ma Kinh Dị' },
    { name: 'Điện Ảnh Châu Á', slug: 'Điện Ảnh Châu Á' },
    { name: 'Điện Ảnh Âu Mỹ', slug: 'Điện Ảnh Âu Mỹ' },
    { name: 'Hàn Quốc', slug: 'Hàn Quốc' },
    { name: 'Anime', slug: 'Anime' },
    { name: 'TV Series', slug: 'TV Series' },
    { name: 'Thập Niên 60', slug: 'Thập Niên 60' },
    { name: 'Thập Niên 70', slug: 'Thập Niên 70' },
    { name: 'Thập Niên 80', slug: 'Thập Niên 80' },
    { name: 'Thập Niên 90', slug: 'Thập Niên 90' },
    { name: 'Thập Niên 2000', slug: 'Thập Niên 2000' }
  ]);
}

function getFilterConfig() {
  return JSON.stringify({
    sort: [
      { name: 'Mới nhất', value: 'newest' },
      { name: 'Cũ nhất', value: 'oldest' }
    ]
  });
}

// =============================================================================
// HELPER: TẠO DIRECT MP4 PROXY URL TỪ STREMIO ID
// =============================================================================
function buildDirectMp4Url(rawId) {
  if (!rawId) return "";
  if (rawId.indexOf("http") === 0) return rawId;

  // Lấy hash cuối cùng từ ID (ví dụ: "clbpx:ho-boi-tu-than-2018:gDsKqKamz" -> "gDsKqKamz")
  var parts = rawId.split(':');
  var videoHash = parts[parts.length - 1];

  var embedUrl = "https://abyssplayer.com/" + videoHash;
  return BASEURL + "/hx-mp4?embed=" + encodeURIComponent(embedUrl) + "&res=5&size=2315264735";
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
  var filters = {};
  try { filters = JSON.parse(filtersJson || "{}"); } catch(e) {}
  var page = filters.page || 1;
  var skip = (page - 1) * 20;

  var type = "series";
  var catalogId = "clbpx-series";

  if (slug && slug.indexOf("movie") === 0) {
    type = "movie";
    catalogId = "clbpx-movie";
  }

  var cleanSlug = slug ? slug.replace(/^(series|movie)\/?/, "") : "";
  var path = "/catalog/" + type + "/" + catalogId;

  if (cleanSlug && cleanSlug !== "home" && cleanSlug !== "") {
    path += "/genre=" + encodeURIComponent("Thể loại: " + cleanSlug);
  }

  if (skip > 0) {
    path += "/skip=" + skip;
  }

  return BASEURL + path + ".json";
}

function getUrlSearch(keyword, filtersJson) {
  var filters = {};
  try { filters = JSON.parse(filtersJson || "{}"); } catch(e) {}
  var page = filters.page || 1;
  var skip = (page - 1) * 20;

  var path = "/catalog/series/clbpx-series/search=" + encodeURIComponent(keyword);
  if (skip > 0) {
    path += "/skip=" + skip;
  }
  return BASEURL + path + ".json";
}

function getUrlDetail(slug) {
  if (!slug) return "";
  if (slug.indexOf("http") === 0) return slug;

  if (slug.indexOf("/") !== -1) {
    return BASEURL + "/meta/" + slug + ".json";
  }
  return BASEURL + "/meta/series/" + slug + ".json";
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(jsonResponse, url) {
  var items = [];
  var currentPage = 1;

  try {
    var data = JSON.parse(jsonResponse);
    var metas = data.metas || [];

    for (var i = 0; i < metas.length; i++) {
      var item = metas[i];
      var itemType = item.type || "series";
      var fullId = itemType + "/" + item.id;

      var year = 0;
      if (item.year) {
        year = parseInt(item.year, 10);
      } else if (item.releaseInfo) {
        var yMatch = (item.releaseInfo + "").match(/\d{4}/);
        if (yMatch) year = parseInt(yMatch[0], 10);
      }

      items.push({
        id: fullId,
        title: item.name || "",
        posterUrl: item.poster || "",
        backdropUrl: item.background || item.poster || "",
        year: year
      });
    }
  } catch (e) {
    console.error("parseListResponse error: " + e);
  }

  var skipMatch = url ? url.match(/skip=(\d+)/) : null;
  if (skipMatch) {
    currentPage = Math.floor(parseInt(skipMatch[1], 10) / 20) + 1;
  }

  var totalPages = items.length >= 20 ? currentPage + 1 : currentPage;

  return JSON.stringify({
    items: items,
    pagination: {
      currentPage: currentPage,
      totalPage: totalPages,
      totalPages: totalPages
    }
  });
}

function parseSearchResponse(jsonResponse, url) {
  return parseListResponse(jsonResponse, url);
}

function parseMovieDetail(jsonResponse) {
  try {
    var data = JSON.parse(jsonResponse);
    var meta = data.meta || {};

    var id = meta.id || "";
    var title = meta.name || "";
    var posterUrl = meta.poster || "";
    var backdropUrl = meta.background || posterUrl;
    var description = meta.description || "";

    var year = 0;
    if (meta.year) {
      year = parseInt(meta.year, 10);
    } else if (meta.releaseInfo) {
      var yMatch = (meta.releaseInfo + "").match(/\d{4}/);
      if (yMatch) year = parseInt(yMatch[0], 10);
    }

    var servers = [];
    var videos = meta.videos || [];

    if (videos.length > 0) {
      var episodes = [];
      for (var i = 0; i < videos.length; i++) {
        var v = videos[i];
        var epId = v.id || id;
        var epName = v.title || v.name || ("Tập " + (v.episode || (i + 1)));

        // TỰ ĐỘNG GIẢI MÃ THÀNH LINK DIRECT STREAM HYBRID
        var directMp4 = buildDirectMp4Url(epId);

        episodes.push({
          id: directMp4,
          url: directMp4,
          file: directMp4,
          link: directMp4,
          datasend: directMp4,
          name: epName,
          slug: epId
        });
      }

      servers.push({
        name: "Server Standard VIP",
        episodes: episodes
      });
    } else {
      var movieDirectMp4 = buildDirectMp4Url(id);
      servers.push({
        name: "Server Standard VIP",
        episodes: [{
          id: movieDirectMp4,
          url: movieDirectMp4,
          file: movieDirectMp4,
          link: movieDirectMp4,
          datasend: movieDirectMp4,
          name: "Xem phim",
          slug: id
        }]
      });
    }

    return JSON.stringify({
      id: id,
      title: title,
      posterUrl: posterUrl,
      backdropUrl: backdropUrl,
      description: description,
      year: year,
      rating: 0,
      quality: "HD",
      servers: servers,
      category: (meta.genres || []).join(", "),
      country: "",
      director: "",
      casts: ""
    });

  } catch (error) {
    console.error("parseMovieDetail error: " + error);
    return "null";
  }
}

function parseDetailResponse(htmlResponse, fallbackUrl, datasend) {
  var streamUrl = fallbackUrl || datasend || "";

  if (typeof htmlResponse === 'string' && htmlResponse.trim().indexOf('{') === 0) {
    try {
      var $data = JSON.parse(htmlResponse);
      if ($data && $data.streams && $data.streams.length > 0) {
        streamUrl = $data.streams[0].url || streamUrl;
      } else if ($data && $data.url) {
        streamUrl = $data.url;
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
