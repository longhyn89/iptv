var BASEURL = "https://www.rophim.ad";
var BASEAPI = "https://rophim.alokillgtv.workers.dev";
var BASELINK = BASEAPI;

function getManifest() {
  try {
    return JSON.stringify({
      "id": "rophim",
      "name": "Nguồn RP Mới",
      "version": "1.2.3",
      "author": "Alokillgtv",
      "BASEURL": "https://www.rophim.ad",
      "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/rophim.png",
      "isEnabled": true,
      "isAdult": false,
      "adblock": false,
      "layoutType": "HORIZONTAL",
      "type": "MOVIE",
      "subtitleCat": false,
      "author": "Alokillgtv",
      "playerType": "embed"
    });
  } catch (e) {
    // VERTICAL
    return JSON.stringify({
      "id": "loiapp",
      "name": "Plugin bị lỗi cài đặt",
      "version": "1.0",
      "info": "Plugin đang bị lỗi: \n" + e,
      "baseUrl": "http://vkey.vn/",
      "iconUrl": "https://raw.githubusercontent.com/alokillgtv03/vaxplugins/main/img/novahd.png",
      "isEnabled": true,

      "type": "MOVIE",
      "playerType": "exoplayer"
    });
  }
}

// https://api.rophim.stream/api/v1/movie/filterV2?q=&countries=&genres=&years=&custom_year=&quality=&type=&status=&is_shown_in_theater=1&exclude_status=Upcoming&versions=&rating=&networks=&productions=&sort=release_date
// ===== HÀM MENU LIST BEGIN ======
{
  // Tạo List phim ở menu Home
  // https://api.rophim.stream/api/v1/movie/filterV2?q=&countries=&genres=&years=&custom_year=&quality=&type=&status=&is_shown_in_theater=1&exclude_status=Upcoming&versions=&rating=&networks=&productions=&sort=release_date&page=1
  // https://api.rophim.stream/api/v1/movie/hot
  // https://api.rophim.stream/api/v1/movie/filterV2?q=&countries=&genres=&years=&custom_year=&quality=&type=&status=&is_shown_in_theater=1&exclude_status=Upcoming&versions=&rating=&networks=&productions=&sort=release_date&page=1
  function getHomeSections() {
    localStorage.clear();
    return JSON.stringify([{
        "slug": "/api/v1/movie/filterV2?q=&countries=&genres=&years=&custom_year=&quality=&type=&status=&is_shown_in_theater=1&exclude_status=Upcoming&versions=&rating=&networks=&productions=&sort=release_date",
        "title": "Chiếu Rạp",
        "type": "Horizontal"
      },
      {
        "slug": "/api/v1/movie/filterV2?q=&countries=&genres=&years=&custom_year=&quality=&type=&status=completed&is_shown_in_theater=&exclude_status=Upcoming&versions=&rating=&networks=&productions=&sort=release_date",
        "title": "Trọn Bộ",
        "type": "Horizontal"
      },
      {
        "slug": "/api/v1/movie/filterV2?q=&countries=&genres=&years=&custom_year=&quality=&type=1&status=&is_shown_in_theater=&exclude_status=Upcoming&versions=&rating=&networks=&productions=&sort=release_date",
        "title": "Phim Lẻ",
        "type": "Horizontal"
      },
      {
        "slug": "/api/v1/movie/filterV2?q=&countries=&genres=&years=&custom_year=&quality=&type=2&status=&is_shown_in_theater=&exclude_status=Upcoming&versions=&rating=&networks=&productions=&sort=release_date",
        "title": "Phim Bộ",
        "type": "Horizontal"
      },
      {
        "slug": "/api/v1/movie/filterV2?q=&countries=&genres=&years=&custom_year=&quality=&type=&status=&is_shown_in_theater=&exclude_status=Upcoming&versions=4&rating=&networks=&productions=&sort=release_date",
        "title": "Thuyết Minh",
        "type": "Horizontal"
      },
      {
        "slug": "/api/v1/movie/filterV2?q=&countries=&genres=&years=&custom_year=&quality=&type=&status=&is_shown_in_theater=&exclude_status=Upcoming&versions=2&rating=&networks=&productions=&sort=release_date",
        "title": "Lồng Tiếng",
        "type": "Horizontal"
      },
      {
        "slug": "/api/v1/movie/filterV2?q=&countries=&genres=&years=&custom_year=&quality=&type=&status=&is_shown_in_theater=&exclude_status=Upcoming&versions=&rating=&networks=&productions=&sort=release_date",
        "title": "Phim Mới",
        "type": "Grid"
      }
    ]);
  }

  // Hàm khởi tạo thẻ chủ đề
  function getLISTmenu() {
    try {
      return `[
  {"link": "/api/v1/movie/filterV2?genres=jwVGrXo2&sort=release_date", "name": "Âm Nhạc"},
  {"link": "/api/v1/movie/filterV2?genres=8EVM6e0Y&sort=release_date", "name": "Anime"},
  {"link": "/api/v1/movie/filterV2?genres=PLeAbJ90&sort=release_date", "name": "Báo Thù"},
  {"link": "/api/v1/movie/filterV2?genres=aQe4Q9jJ&sort=release_date", "name": "Bí Ẩn"},
  {"link": "/api/v1/movie/filterV2?genres=Yo9mpemM&sort=release_date", "name": "Boy's Love"},
  {"link": "/api/v1/movie/filterV2?genres=8PVjqjXN&sort=release_date", "name": "Boys Love"},
  {"link": "/api/v1/movie/filterV2?genres=8EVMmGV0&sort=release_date", "name": "Cảm Động"},
  {"link": "/api/v1/movie/filterV2?genres=bPVJnlVp&sort=release_date", "name": "Thích Kịch"},
  {"link": "/api/v1/movie/filterV2?genres=xD96gXZK&sort=release_date", "name": "Chiến Tranh"},
  {"link": "/api/v1/movie/filterV2?genres=OzXk8VW1&sort=release_date", "name": "Chiếu Rạp"},
  {"link": "/api/v1/movie/filterV2?genres=bPVJl9p5&sort=release_date", "name": "Chính kịch"},
  {"link": "/api/v1/movie/filterV2?genres=q6eEE4eQ&sort=release_date", "name": "Chính Sự"},
  {"link": "/api/v1/movie/filterV2?genres=8PVjvVNA&sort=release_date", "name": "Chính Trị"},
  {"link": "/api/v1/movie/filterV2?genres=WoVal4XP&sort=release_date", "name": "Chữa Lành"},
  {"link": "/api/v1/movie/filterV2?genres=dQeple4Z&sort=release_date", "name": "Chuyển Thể"},
  {"link": "/api/v1/movie/filterV2?genres=x7VOkVj8&sort=release_date", "name": "Cổ Điển"},
  {"link": "/api/v1/movie/filterV2?genres=GxVo3VAn&sort=release_date", "name": "Cổ Trang"},
  {"link": "/api/v1/movie/filterV2?genres=o2el76VG&sort=release_date", "name": "Công Sở"},
  {"link": "/api/v1/movie/filterV2?genres=xOX0Re0B&sort=release_date", "name": "Cung Đấu"},
  {"link": "/api/v1/movie/filterV2?genres=lxewn4VK&sort=release_date", "name": "Cuối Tuần"},
  {"link": "/api/v1/movie/filterV2?genres=WoVa4XPj&sort=release_date", "name": "Dã Sử"},
  {"link": "/api/v1/movie/filterV2?genres=mjeRvdeq&sort=release_date", "name": "Dịp Lễ"},
  {"link": "/api/v1/movie/filterV2?genres=RweWMqXr&sort=release_date", "name": "Đô Thị"},
  {"link": "/api/v1/movie/filterV2?genres=K8V1MMVJ&sort=release_date", "name": "Đời Sống"},
  {"link": "/api/v1/movie/filterV2?genres=RweWkEer&sort=release_date", "name": "Đời Thường"},
  {"link": "/api/v1/movie/filterV2?genres=0398EXk2&sort=release_date", "name": "Gay Cấn"},
  {"link": "/api/v1/movie/filterV2?genres=jaendDXo&sort=release_date", "name": "Gia Đấu"},
  {"link": "/api/v1/movie/filterV2?genres=RweWEXrM&sort=release_date", "name": "Gia đình"},
  {"link": "/api/v1/movie/filterV2?genres=z8VPz9mG&sort=release_date", "name": "Giả Tưởng"},
  {"link": "/api/v1/movie/filterV2?genres=mjeRaDVq&sort=release_date", "name": "Giật gân"},
  {"link": "/api/v1/movie/filterV2?genres=Wy9D2Vn4&sort=release_date", "name": "Hài Hước"},
  {"link": "/api/v1/movie/filterV2?genres=w0ezvedE&sort=release_date", "name": "Hành Động"},
  {"link": "/api/v1/movie/filterV2?genres=P6XKaved&sort=release_date", "name": "Hành Sự"},
  {"link": "/api/v1/movie/filterV2?genres=P6XKv9d8&sort=release_date", "name": "Hình Sự"},
  {"link": "/api/v1/movie/filterV2?genres=QyXNlerW&sort=release_date", "name": "Hoạt Hình"},
  {"link": "/api/v1/movie/filterV2?genres=NrXgAeva&sort=release_date", "name": "Học Đường"},
  {"link": "/api/v1/movie/filterV2?genres=gNebg89E&sort=release_date", "name": "Hồi Hội"},
  {"link": "/api/v1/movie/filterV2?genres=WoVaKZ9P&sort=release_date", "name": "Hồi Hộp"},
  {"link": "/api/v1/movie/filterV2?genres=aQe4nQXj&sort=release_date", "name": "Hôn Nhân"},
  {"link": "/api/v1/movie/filterV2?genres=bPVJnPVp&sort=release_date", "name": "Huyền Huyền"},
  {"link": "/api/v1/movie/filterV2?genres=mZVvnV8R&sort=release_date", "name": "Khoa Học"},
  {"link": "/api/v1/movie/filterV2?genres=OAed519D&sort=release_date", "name": "Kịch Tính"},
  {"link": "/api/v1/movie/filterV2?genres=Wy9Dz2Vn&sort=release_date", "name": "Kiếm Hiệp"},
  {"link": "/api/v1/movie/filterV2?genres=o2elOVGK&sort=release_date", "name": "Kinh Dị"},
  {"link": "/api/v1/movie/filterV2?genres=NrXgZ59v&sort=release_date", "name": "Kinh Điển"},
  {"link": "/api/v1/movie/filterV2?genres=1WeLjXAK&sort=release_date", "name": "Kỳ Ảo"},
  {"link": "/api/v1/movie/filterV2?genres=K8V1M4VJ&sort=release_date", "name": "Lãng Mạn"},
  {"link": "/api/v1/movie/filterV2?genres=PMeQb91K&sort=release_date", "name": "Lãng mạn"},
  {"link": "/api/v1/movie/filterV2?genres=RrXYnV8l&sort=release_date", "name": "LGBTQ+"},
  {"link": "/api/v1/movie/filterV2?genres=PLeAJ907&sort=release_date", "name": "Lịch Sử"},
  {"link": "/api/v1/movie/filterV2?genres=28e3RLVZ&sort=release_date", "name": "Nghịch Tập"},
  {"link": "/api/v1/movie/filterV2?genres=w0ezDrXd&sort=release_date", "name": "Ngôn Tình"},
  {"link": "/api/v1/movie/filterV2?genres=KYVZW6eZ&sort=release_date", "name": "Ngược Luyện"},
  {"link": "/api/v1/movie/filterV2?genres=GxVo5Y9A&sort=release_date", "name": "Nữ Chủ"},
  {"link": "/api/v1/movie/filterV2?genres=QyXNvJXr&sort=release_date", "name": "Nữ Cường"},
  {"link": "/api/v1/movie/filterV2?genres=aQe4odVj&sort=release_date", "name": "Phá Án"},
  {"link": "/api/v1/movie/filterV2?genres=OAed5W9D&sort=release_date", "name": "Pháp Lý"},
  {"link": "/api/v1/movie/filterV2?genres=DOX75eKx&sort=release_date", "name": "Phiêu Lưu"},
  {"link": "/api/v1/movie/filterV2?genres=8EVMB6e0&sort=release_date", "name": "Phim Chính Kịch"},
  {"link": "/api/v1/movie/filterV2?genres=Yo9mEp9m&sort=release_date", "name": "Phim Ngắn"},
  {"link": "/api/v1/movie/filterV2?genres=P6XKaoed&sort=release_date", "name": "Quyền Mưu"},
  {"link": "/api/v1/movie/filterV2?genres=RweWMEXr&sort=release_date", "name": "Sắp Chiếu"},
  {"link": "/api/v1/movie/filterV2?genres=K8V1YMVJ&sort=release_date", "name": "Siêu Anh Hùng"},
  {"link": "/api/v1/movie/filterV2?genres=mZVv2nV8&sort=release_date", "name": "Siêu Nhiên"},
  {"link": "/api/v1/movie/filterV2?genres=PMeQ6b91&sort=release_date", "name": "Sitcom"},
  {"link": "/api/v1/movie/filterV2?genres=q6eEDVQa&sort=release_date", "name": "Tài liệu"},
  {"link": "/api/v1/movie/filterV2?genres=m4eyZr9O&sort=release_date", "name": "Tâm Linh"},
  {"link": "/api/v1/movie/filterV2?genres=OAedWVDl&sort=release_date", "name": "Tâm Lý"},
  {"link": "/api/v1/movie/filterV2?genres=mjeRDXqx&sort=release_date", "name": "Thần Thoại"},
  {"link": "/api/v1/movie/filterV2?genres=nw9qmr92&sort=release_date", "name": "Thần Tượng"},
  {"link": "/api/v1/movie/filterV2?genres=jwVGNrXo&sort=release_date", "name": "Thành Thị"},
  {"link": "/api/v1/movie/filterV2?genres=YNX5QLXL&sort=release_date", "name": "Thanh Xuân"},
  {"link": "/api/v1/movie/filterV2?genres=YNX5L9LM&sort=release_date", "name": "Thể Thao"},
  {"link": "/api/v1/movie/filterV2?genres=xOX0ZEe0&sort=release_date", "name": "Thôn Quê"},
  {"link": "/api/v1/movie/filterV2?genres=QyXN6lXr&sort=release_date", "name": "Thương Trường"},
  {"link": "/api/v1/movie/filterV2?genres=28e30p9Z&sort=release_date", "name": "Tiên Hiệp"},
  {"link": "/api/v1/movie/filterV2?genres=DOX7Y5eK&sort=release_date", "name": "Tình bạn"},
  {"link": "/api/v1/movie/filterV2?genres=Wy9D4Y9n&sort=release_date", "name": "Tình Báo"},
  {"link": "/api/v1/movie/filterV2?genres=m4eyb9Og&sort=release_date", "name": "Tình Cảm"},
  {"link": "/api/v1/movie/filterV2?genres=NrXgPAVv&sort=release_date", "name": "Tình Tiết"},
  {"link": "/api/v1/movie/filterV2?genres=KEXxoJ9d&sort=release_date", "name": "Tội Phạm"},
  {"link": "/api/v1/movie/filterV2?genres=PMeQ3bX1&sort=release_date", "name": "Trinh Thám"},
  {"link": "/api/v1/movie/filterV2?genres=nGe2zgeK&sort=release_date", "name": "Trường Học"},
  {"link": "/api/v1/movie/filterV2?genres=K8V1MVJq&sort=release_date", "name": "Truyền hình"},
  {"link": "/api/v1/movie/filterV2?genres=m4eyQbeO&sort=release_date", "name": "Truyền Hình Thực Tế"},
  {"link": "/api/v1/movie/filterV2?genres=z8VP2z9m&sort=release_date", "name": "TVB"},
  {"link": "/api/v1/movie/filterV2?genres=m4eyZb9O&sort=release_date", "name": "Văn Phòng"},
  {"link": "/api/v1/movie/filterV2?genres=jaen4XoK&sort=release_date", "name": "Viễn Tưởng"},
  {"link": "/api/v1/movie/filterV2?genres=nw9qm692&sort=release_date", "name": "Võ Hiệp"},
  {"link": "/api/v1/movie/filterV2?genres=KYVZP9Zb&sort=release_date", "name": "Võ Thuật"},
  {"link": "/api/v1/movie/filterV2?genres=PMeQ6Y91&sort=release_date", "name": "Webtoon"},
  {"link": "/api/v1/movie/filterV2?genres=OAednWXD&sort=release_date", "name": "Xuyên Không"},
  {"link": "/api/v1/movie/filterV2?genres=jaenE4Vo&sort=release_date", "name": "Y khoa"}
]
`;
    } catch (e) {
      log("getLISTmenu[err]:\n " + e);
      return `[
        {"link":"/","name":"Đang lỗi getLISTmenu()"},
      ]`;
    }
  }
} // getHomeSections(), getLISTmenu()
// ===== HÀM MENU LIST END ======

// ===== HÀM TẠO URL BEGIN ======
{
  function getUrlList(slug, filtersJson) {
    var paramPage = "&page=";
    try {
      //log("getUrlList[url]: \n" + slug);
      if (slug && slug.indexOf("http") > -1) {
        return slug;
      }
      var page = 1;
      var path = slug || "";
      if (filtersJson) {
        var fixedJson2 = filtersJson
          .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
        try {
          var filters = JSON.parse(fixedJson2);
          page = parseInt(filters.page) || 1;

          if (filters.category) {
            if (Array.isArray(filters.category) && filters.category.length > 0) {
              path = filters.category[0].slug;
            } else if (typeof filters.category === 'string') {
              path = filters.category;
            }
          }
        } catch (e) {
          log("getUrlList():\n" + e)
        }
      }
      var resultUrl = BASELINK;
      if (path) {
        resultUrl += (path.indexOf("/") === 0 ? "" : "/") + path;
      }
      if (page > 0 && resultUrl.indexOf("page=") === -1) {
        resultUrl += paramPage + page;
      }
      var finalUrl = resultUrl.replace(/([^:]\/)\/+/g, "$1");
      return finalUrl;
    } catch (e) {
      log("getUrlList[err]:\n " + e);
      return BASEURL;
    }
  }

  function getUrlSearch(keyword, filtersJson) {
    var paramSearch = "/api/v1/movie/filterV2?q=";
    var paramPage = "&page=";
    try {
      var page = 1;
      if (filtersJson) {
        var fixedJson = filtersJson
          .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
        try {
          var filters = JSON.parse(fixedJson);
          page = parseInt(filters.page) || 1;
        } catch (e) {
          log("getUrlList():\n" + e)
        }
      }
      var encodedKeyword = encodeURIComponent(keyword || "");

      var resultUrl = BASELINK + paramSearch + encodedKeyword;
      if (page > 1) {
        resultUrl += paramPage + page;
      }

      var finalUrl = resultUrl.replace(/([^:]\/)\/+/g, "$1");

      log("getUrlSearch[url]: \n" + finalUrl);
      return finalUrl;

    } catch (e) {
      log("getUrlSearch[err]:\n " + e);
      return BASEURL;
    }
  }
} // getUrlList, getUrlSearch
// http://vkey.vn/animevv
// /quoc-gia/M%E1%BB%B9
// /top
//filtersJson = "{page:5}"
//getUrlList("/top", filtersJson)
//getUrlSearch("girl", filtersJson)
// ===== HÀM TẠO URL END ======

// ===== HÀM TẠO KHỐI LIST PHIM BEGIN ======
function parseListResponse(html, $url) {
  console.log("listURL\n" + $url)
  //console.log(html)
  try {
    var $data = JSON.parse(html)
    var items = [];

    $data.result.items.forEach(function(item) {
      // https://www.rophim.ad/phim/star-wars-mandalorian-va-grogu.9W6jP8Wl
      var type = item.type;
      if (type == 2) {
        var id = BASEAPI + "/api/v1/movie/seasons?mId=" + item._id;
        console.log("apiSeason\n" + id)
      } else {

        var id = BASEAPI + "/api/v1/movie/gallery/" + item._id;
      }
      var title = item.title;
      var posterurl = item.images.posters;
      var linkIMG = "";
      if (posterurl && posterurl[0]) {
        linkIMG = "https://static.rp-cdn.net/vimg/300-0/" + posterurl[0].path;
      }
      var poster = linkIMG;
      var backurl = item.images.backdrops;
      if (backurl && backurl[0]) {
        linkIMG = "https://static.rp-cdn.net/vimg/1920-0/" + backurl[0].path;
      }

      var typeEpi = item.latest_episode
      var namelang = "Vietsub";
      for (const key in typeEpi) {
        if (key == 2) {
          namelang += "/Lồng Tiếng"
        }
        if (key == 3) {
          namelang += "/Thuyết Minh [MB]"
        }
        if (key == 4) {
          namelang += "/Thuyết Minh [MN]"
        }

      }
      var background = linkIMG;
      var texteq = item.quality.toUpperCase()
      var quality = texteq;
      var textstas = item.status;
      if (item.status) {
        textstas = textstas.replace(/on going/i, "Đang Ra")
          .replace(/released/i, "Hoàn Thành")
          .replace(/upcoming/i, "Sắp Ra")
      }
      var episode_current = textstas;
      var year = item.year;
      var lang = namelang;
      if (title.length > 1) {
        items.push({
          "id": id || "",
          "title": title || "",
          "quality": quality || "",
          "episode_current": episode_current || "",
          "posterUrl": poster || "",
          "backdropUrl": background || "",
          "year": year || "",
          "lang": lang || "",
          datasend: JSON.stringify(item)
        });
      }
    })
    var $return = JSON.stringify({
      "items": items,
      "pagination": {
        "currentPage": 1,
        "totalPages": 9999
      }
    });
    //console.log("Return 1:\n" + $return)
    return $return
  } catch (e) {
    log("parseListResponse[err]:\n " + e);
    return JSON.stringify({
      "items": [{
        "id": $url || "error_url",
        "title": "Lỗi: " + e,
        "posterUrl": "",
        "backdropUrl": ""
      }],
      "pagination": {
        "currentPage": 1,
        "totalPages": 1
      }
    });
  }
}

//html = sourceHTML;
//$data = parseJSDataIsolated(script);
// ===== HÀM TẠO KHỐI LIST PHIM END ======

// ===== HÀM TẠO KHỐI CHI TIẾT PHIM BEGIN ======
function parseMovieDetail(html, url, datasend) {
  if (url.indexOf("season") > -1) {
    log("Movie Raw\n" + html);
    log("datasend 1:\n" + datasend);
  }

  log("parseMovieDetail[url]: \n" + url);
  try {
    var item = JSON.parse(datasend);
    var id = url;
    var posterurl = item.images ? item.images.posters : null;
    var linkIMG = "";
    if (posterurl && posterurl[0]) {
      linkIMG = "https://static.rp-cdn.net/vimg/300-0/" + posterurl[0].path;
    }
    var posterUrl = linkIMG;
    var backurl = item.images ? item.images.backdrops : null;
    if (backurl && backurl[0]) {
      linkIMG = "https://static.rp-cdn.net/vimg/1920-0/" + backurl[0].path;
    }
    var backdropUrl = linkIMG;
    var title = item.title || "";
    var description = item.overview || "";
    var director = "";
    var casts = "";
    var merge = [];
    if (item.genres && Array.isArray(item.genres)) {
      item.genres.forEach(function(box) {
        merge.push("[" + box.name + "](/api/v1/movie/filterV2?genres=" + box._id + "&sort=release_date)");
      });
    }
    var category = merge.join(", ");
    var duration = "";
    var status = "";
    var episode_current = "";
    var year = item.year || "";
    var quality = item.quality ? item.quality.toUpperCase() : "";
    var rating = item.rating || "";
    var country = (item.countries && Array.isArray(item.countries)) ? item.countries.map(function(c) {
      return c.name;
    }).join(", ") : "";
    var extra = "";
    var servers = [];
    var episodes = [];

    if (item.type == 1) {
      var typeEpi = item.latest_episode;
      for (var key in typeEpi) {
        var namesv = "Vietsub";
        if (key == 2) {
          namesv = "Lồng Tiếng";
        }
        if (key == 3) {
          namesv = "Thuyết Minh [MB]";
        }
        if (key == 4) {
          namesv = "Thuyết Minh [MN]";
        }
        // https://api.rophim.stream/player/embed?id=ezexbGWK&version=1&season=1&episode=1
        episodes.push({
          id: "https://api.rophim.stream/player/embed?id=" + item._id + "&ver=" + key,
          name: namesv,
          slug: "full"
        });
      }
      servers.push({
        name: "Server",
        episodes: episodes
      });

    } else {
      var seasonMV = JSON.parse(html);
      if (seasonMV && seasonMV.result && Array.isArray(seasonMV.result)) {
        var serverMap = {};

        seasonMV.result.forEach(function(season) {
          var seasonID = season._id;
          if (season.episodes && Array.isArray(season.episodes)) {
            season.episodes.forEach(function(ep) {
              var epi = ep.episode_number;
              var sesa = ep.season_number;
              var versions = ep.versions || [];

              versions.forEach(function(verObj) {
                var type = verObj.type;
                if (!serverMap[type]) {
                  serverMap[type] = [];
                }
                var link = "https://api.rophim.stream/player/embed?id=" + seasonID + "&ep=" + epi + "&ss=" + sesa + "&ver=" + type + "&version=1";
                serverMap[type].push({
                  id: link,
                  name: "[Mùa " + sesa + "] Tập " + epi,
                  slug: "mua-" + sesa + "-tap-" + epi
                });
              });
            });
          }
        });

        for (var verKey in serverMap) {
          var namesv = "Vietsub";
          if (verKey == 2) {
            namesv = "Lồng Tiếng";
          } else if (verKey == 3) {
            namesv = "Thuyết Minh [MB]";
          } else if (verKey == 4) {
            namesv = "Thuyết Minh [MN]";
          }

          servers.push({
            name: namesv,
            episodes: serverMap[verKey]
          });
        }
      }
    }

    var $return = JSON.stringify({
      id: url || "",
      title: title || "",
      posterUrl: posterUrl || "",
      backdropUrl: backdropUrl || "",
      description: description || "",
      quality: quality || "",
      year: year || "",
      rating: rating || "",
      status: status || "",
      category: category || "",
      episode_current: episode_current || "",
      servers: servers || [],
      duration: duration || "",
      casts: casts || "",
      director: director || "",
      country: country || "",
      extra: extra || ""
    });
    // log("Return 2\n" + $return);
    return $return;
  } catch (e) {
    log("parseMovieDetail[err]:\n " + e);
    return JSON.stringify({
      id: "error",
      title: "error",
      description: url + "\n" + e,
      servers: []
    });
  }
}
//var url = "https://novahd.cc/api/show/1413"
//var url = "http://vkey.vn/novahd/api/show/1413"
// https://novahd.cc/api/shows/1413
//var html = sourceHTML;
//JSON.parse(parseMovieDetail(sourceHTML, url))
// ===== HÀM TẠO KHỐI CHI TIẾT PHIM END ======

// ===== HÀM TẠO XỬ LÝ STREAM PHIM BEGIN ======
{
  function parseDetailResponse(html, url) {
    console.log("parseDetailResponse dang xu ly: " + url);
    try {
      // Mimetype application/x-mpegURL video/mp4
      return JSON.stringify({
        url: url,
        isEmbed: false,
        mimeType: "application/x-mpegURL",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Referer": "https://api.rophim.stream/",
          "Origin": "https://api.rophim.stream",
          "Custom-Js": rawJS(url)
        },
        subtitles: [{
          lang: "",
          url: ""
        }],

      });
    } catch (e) {
      console.log("parseDetailResponse[err]:\n " + e);
      return JSON.stringify({
        url: "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4",
        mimeType: "video/mp4",
        isEmbed: false,
        headers: {},
        subtitles: []
      });
    }
  }


} // parseDetailResponse, parseEmbedResponse
// ===== HÀM TẠO XỬ LÝ STREAM PHIM END ======

// ==== HÀM TẠO CUSTOM SCRIPT BEGIN ====

function rawJS() {
  return `
function bridgeLog(msg) {
    try {
      if (window.SnifferBridge && typeof window.SnifferBridge.log === 'function') {
        window.SnifferBridge.log(msg);
      } else if (typeof console !== 'undefined' && console.log) {
        console.log(msg);
      }
    } catch(e) {}
}

(function () {
  'use strict';

  if (window.__SUB_SNIFFER_INIT__) return;
  window.__SUB_SNIFFER_INIT__ = true;
  window.__CAPTURED_SUB_URLS__ = window.__CAPTURED_SUB_URLS__ || new Set();
  window.__CAPTURED_M3U8_URLS__ = window.__CAPTURED_M3U8_URLS__ || new Set();

  bridgeLog('[Clean-Video] 🕵️ Tích hợp Network Interceptor (Đã lọc Thumbnails)...');

  // Hàm kiểm tra xem URL có phải là file thumbnail preview hay không
  function isThumbnailUrl(url) {
    if (!url) return true;
    const lower = url.toLowerCase();
    return lower.includes('thumb') || lower.includes('.jpg') || lower.includes('.png') || lower.includes('sprite');
  }

  // Hàm kiểm tra và gửi link m3u8 sang SnifferBridge
  function checkAndPlayM3u8(url) {
    if (!url) return;
    const lower = url.toLowerCase();
    if ((lower.includes('.m3u8') || lower.includes('m3u8')) && !window.__CAPTURED_M3U8_URLS__.has(url)) {
      window.__CAPTURED_M3U8_URLS__.add(url);
      bridgeLog('[M3U8-Sniffer] 🎯 Hứng được link M3U8: ' + url);
      try {
        if (window.SnifferBridge && typeof window.SnifferBridge.play === 'function') {
          window.SnifferBridge.play(url);
          bridgeLog('[M3U8-Sniffer] 🚀 Đã gửi link tới SnifferBridge.play()');
        }
      } catch(e) {
        bridgeLog('[M3U8-Sniffer] ❌ Lỗi khi gửi tới SnifferBridge: ' + e.message);
      }
    }
  }

  // 1. CAN THIỆP FETCH API
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url ? args[0].url : '');
    if (url) {
      checkAndPlayM3u8(url);
      if (url.includes('.vtt') || url.includes('.srt') || url.includes('subtitle') || url.includes('caption')) {
        if (!isThumbnailUrl(url) && !window.__CAPTURED_SUB_URLS__.has(url)) {
          window.__CAPTURED_SUB_URLS__.add(url);
          bridgeLog('[Sub-Sniffer] 🎯 Hứng được Subtitle URL chuẩn: ' + url);
        }
      }
    }
    return originalFetch.apply(this, args);
  };

  // 2. CAN THIỆP XHR
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url) {
    if (typeof url === 'string') {
      checkAndPlayM3u8(url);
      if (url.includes('.vtt') || url.includes('.srt') || url.includes('subtitle') || url.includes('caption')) {
        if (!isThumbnailUrl(url) && !window.__CAPTURED_SUB_URLS__.has(url)) {
          window.__CAPTURED_SUB_URLS__.add(url);
          bridgeLog('[Sub-Sniffer] 🎯 Hứng được Subtitle URL chuẩn (XHR): ' + url);
        }
      }
    }
    return originalXHROpen.apply(this, arguments);
  };

  // Tải & Nhúng Subtitle thực sự
  async function loadAndAttachCapturedSubtitles(videoEl) {
    const subUrls = Array.from(window.__CAPTURED_SUB_URLS__);
    
    // Vét lại cấu hình JWPlayer nếu XHR chưa bắt kịp
    if (typeof window.jwplayer === 'function') {
      try {
        const inst = window.jwplayer();
        const playlist = inst.getPlaylist?.() || [];
        const item = playlist[0] || {};
        
        // Vét luôn file m3u8 từ JWPlayer playlist nếu có
        if (item.file) {
          checkAndPlayM3u8(item.file);
        }
        if (Array.isArray(item.sources)) {
          item.sources.forEach(s => {
            if (s.file) checkAndPlayM3u8(s.file);
          });
        }

        const tracks = item.tracks || inst.getCaptionsList?.() || [];
        tracks.forEach(t => {
          const u = t.file || t.src || t.url;
          if (u && t.kind !== 'thumbnails' && !isThumbnailUrl(u)) {
            if (!subUrls.includes(u)) subUrls.push(u);
          }
        });
      } catch(e) {}
    }

    bridgeLog('[Clean-Sub] 📊 Tổng số Subtitle hợp lệ tìm thấy: ' + subUrls.length);

    let attachedCount = 0;
    for (let i = 0; i < subUrls.length; i++) {
      const subUrl = subUrls[i];
      try {
        const res = await fetch(subUrl);
        if (!res.ok) continue;
        const text = await res.text();

        // LỌC NỘI DUNG: Nếu chứa tọa độ ảnh (#xywh=) hoặc đuôi .jpg -> Bỏ qua
        if (text.includes('#xywh=') || text.includes('.jpg') || text.includes('.png')) {
          bridgeLog('[Clean-Sub] ⚠️ Đã loại bỏ file Thumbnail VTT: ' + subUrl);
          continue;
        }

        const preview = text.split('\\n').filter(l => l.trim() && !l.includes('-->')).slice(0, 3).join(' | ');
        bridgeLog('[Clean-Sub] 📄 [Nội dung Sub Chuẩn]: ' + preview);

        // Tạo Blob URL
        const blob = new Blob([text], { type: 'text/vtt' });
        const blobUrl = URL.createObjectURL(blob);

        const trackEl = document.createElement('track');
        trackEl.kind = 'subtitles';
        trackEl.label = 'Tiếng Việt' + (attachedCount > 0 ? ' ' + (attachedCount + 1) : '');
        trackEl.srclang = 'vi';
        trackEl.src = blobUrl;
        trackEl.default = attachedCount === 0;

        videoEl.appendChild(trackEl);
        attachedCount++;
        bridgeLog('[Clean-Sub] ✅ Đã gắn thành công Track Phụ Đề Chữ!');
      } catch (err) {
        bridgeLog('[Clean-Sub] ❌ Lỗi fetch Sub: ' + err.message);
      }
    }
  }

  async function executeUnwrapAndRebuild(player) {
    if (window.__IS_CLEAN_VIDEO_DONE__) return;

    try {
      const container = player.getContainer?.() || document.querySelector('.jwplayer');
      const videoEl = container ? container.querySelector('video') : document.querySelector('video');

      if (!videoEl) return;

      window.__IS_CLEAN_VIDEO_DONE__ = true;
      bridgeLog('[Clean-Video] 🎯 Đã xác định vị trí thẻ <video>!');

      // Ép Quality Max
      try {
        const levels = player.getQualityLevels?.() || [];
        if (levels.length > 0) {
          let maxIdx = 0, maxH = -1;
          levels.forEach((l, i) => {
            if (l.height && l.height > maxH) { maxH = l.height; maxIdx = i; }
          });
          player.setCurrentQuality(maxIdx);
          bridgeLog('[Clean-Video] 🔒 Ép Quality max: ' + maxH + 'p');
        }
      } catch(e) {}

      // Tải phụ đề sạch
      await loadAndAttachCapturedSubtitles(videoEl);

      // Unwrap DOM
      const rootPlayerNode = player.getContainer?.() || videoEl.closest('.jwplayer') || videoEl.parentElement;
      const targetParent = rootPlayerNode.parentElement;

      if (!targetParent) return;

      const originalWidth = rootPlayerNode.offsetWidth || '100%';
      const originalHeight = rootPlayerNode.offsetHeight || '100%';

      videoEl.remove();
      rootPlayerNode.remove();
      bridgeLog('[Clean-Video] 🧹 Đã xóa sạch khung JWPlayer!');

      const newWrapper = document.createElement('div');
      newWrapper.id = 'pure-video-wrapper';
      newWrapper.style.position = 'relative';
      newWrapper.style.width = typeof originalWidth === 'number' ? originalWidth + 'px' : originalWidth;
      newWrapper.style.height = typeof originalHeight === 'number' ? originalHeight + 'px' : originalHeight;
      newWrapper.style.backgroundColor = '#000';
      newWrapper.style.display = 'flex';
      newWrapper.style.justifyContent = 'center';
      newWrapper.style.alignItems = 'center';

      videoEl.controls = true;
      videoEl.autoplay = true;
      videoEl.playsInline = true;
      videoEl.style.width = '100%';
      videoEl.style.height = '100%';
      videoEl.style.objectFit = 'contain';

      newWrapper.appendChild(videoEl);
      targetParent.appendChild(newWrapper);

      // Kích hoạt TextTrack
      setTimeout(() => {
        try {
          if (videoEl.textTracks) {
            for (let i = 0; i < videoEl.textTracks.length; i++) {
              videoEl.textTracks[i].mode = 'showing';
            }
            bridgeLog('[Clean-Video] ✅ ModeTextTrack = showing!');
          }
        } catch(e) {}
      }, 300);

      bridgeLog('[Clean-Video] 🎉 HOÀN TẤT!');

      if (videoEl.paused) {
        videoEl.play().catch(e => {});
      }

    } catch (e) {
      bridgeLog('[Clean-Video] ❌ Lỗi: ' + e.message);
    }
  }

  function setupHooks(inst) {
    inst.on('firstFrame', function() {
      bridgeLog('[Clean-Video] 🎬 Bắt được firstFrame!');
      setTimeout(() => executeUnwrapAndRebuild(inst), 200);
    });

    inst.on('play', function() {
      setTimeout(() => executeUnwrapAndRebuild(inst), 500);
    });
  }

  const watcher = setInterval(() => {
    if (window.__IS_CLEAN_VIDEO_DONE__) {
      clearInterval(watcher);
      return;
    }

    if (typeof window.jwplayer === 'function') {
      try {
        const inst = window.jwplayer();
        if (inst && typeof inst.on === 'function') {
          setupHooks(inst);
          clearInterval(watcher);
        }
      } catch (e) {}
    }
  }, 250);

})();
  `;
}











// ==== HÀM TẠO CUSTOM SCRIPT END ====


// ==== HIDEMENU ====
{
  // ## Hàm Hỗ Trợ. Hide function
  function iframe64(url) {
    var html = `
  <html><style>body, html { margin: 0; padding: 0; width: 100%; height: 100%; background: #000; overflow: hidden; }iframe { width: 100%; height: 100%; object-fit: contain; }</style><body style='margin:0;padding:0;background:#000;'><iframe id='player' src='${url}' scrolling='no' frameborder='0' class='openloadvideo lab-pinned-child' allowfullscreen='true' webkitallowfullscreen='true' mozallowfullscreen='true' name='watch'></iframe></body></html>
  `;
    return "data:text/html;base64," + BASE64.encode(html);

  }

  function getUrlDetail(slug) {
    try {
      if (!slug) return "";
      if (slug.indexOf('http') === 0) return slug;
      var detailUrl = BASEURL + "/" + slug;
      log("getUrlDetail[url]: \n" + detailUrl);
      return detailUrl;
    } catch (e) {
      log("getUrlDetail[err]:\n " + e);
      return "";
    }
  }

  function getUrlCategories() {
    try {
      log("getUrlCategories[url]: \n" + BASEURL);
      return BASEURL;
    } catch (e) {
      log("getUrlCategories[err]:\n " + e);
      return "";
    }
  }

  function getUrlCountries() {
    try {
      return "";
    } catch (e) {
      log("getUrlCountries[err]:\n " + e);
      return "";
    }
  }

  function getUrlYears() {
    try {
      return "";
    } catch (e) {
      log("getUrlYears[err]:\n " + e);
      return "";
    }
  }

  function parseCategoriesResponse(apiResponseJson) {
    try {
      var listurl = getLISTmenu();
      var menulist = buildMenu(listurl);
      return JSON.stringify(menulist);
    } catch (e) {
      log("parseCategoriesResponse[err]:\n " + e);
      return JSON.stringify([]);
    }
  }

  function parseCountriesResponse(html) {
    try {
      return "[]";
    } catch (e) {
      log("parseCountriesResponse[err]:\n " + e);
      return "[]";
    }
  }

  function parseYearsResponse(html) {
    try {
      return "[]";
    } catch (e) {
      log("parseYearsResponse[err]:\n " + e);
      return "[]";
    }
  }

  function parseSearchResponse(html, url) {
    try {
      log("parseSearchResponse[url]: \n" + url);
      return parseListResponse(html, url);
    } catch (e) {
      log("parseSearchResponse[err]:\n " + e);
      return JSON.stringify({
        "items": [],
        "pagination": {
          "currentPage": 1,
          "totalPages": 1
        }
      });
    }
  }
  // Tạo thẻ chủ đè ở menu home lấy dữ liệu ben dưới
  function getPrimaryCategories() {
    try {
      var listurl = getLISTmenu();
      var menulist = buildMenu(listurl);
      return JSON.stringify(menulist);
    } catch (e) {
      log("getPrimaryCategories[err]:\n " + e);
      return JSON.stringify([]);
    }
  }
  // Tạo thẻ chủ đề filter..
  function getFilterConfig() {
    try {
      var listurl = getLISTmenu();
      var menulist = buildMenu(listurl);
      return JSON.stringify({
        category: menulist
      });
    } catch (e) {
      log("getFilterConfig[err]:\n " + e);
      return JSON.stringify({
        category: []
      });
    }
  }
  // Hàm chuyển đổi text html %20 sang text thuần
  function buildMenu(menuStr, type) {
    var menuArray = JSON.parse(menuStr);
    let menulist = [];
    if (!menuArray || !Array.isArray(menuArray)) return menulist;
    var typeStr = type !== undefined ? String(type).trim() : undefined;
    for (var i = 0; i < menuArray.length; i++) {
      var item = menuArray[i];
      if (!item) continue;
      var link = item.link ? String(item.link).trim() : "";
      var name = item.name ? String(item.name).trim() : "";
      if (!link || !name) continue;
      var menuItem = {};
      if (typeStr === "false") {
        menuItem = {
          "slug": link,
          "title": name,
          "type": "Horizontal"
        };
      } else if (typeStr === "true") {
        menuItem = {
          "slug": link,
          "title": name,
          "type": "Grid"
        };
      } else {
        menuItem = {
          "slug": link,
          "name": name
        };
      }
      menulist.push(menuItem);
    }
    return menulist;
  }

  function _$(param) {
    // -------------------------------------------------------------
    // 1. HELPER PARSER & UTILS
    // -------------------------------------------------------------
    function parseHTML(htmlString) {
      let nodes = [];
      let root = {
        id: 0,
        tag: "ROOT",
        attrs: {},
        childrenIds: [],
        parentId: null
      };
      nodes.push(root);

      try {
        let html = (htmlString || "").trim();
        if (!html) return {
          root,
          nodes
        };

        const VOID_TAGS = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
        let stack = [0];
        let tagRegex = /<(?:\/([a-zA-Z0-9_-]+)|([a-zA-Z0-9_-]+)([^>]*?)(\/)?)\s*>/g;

        let lastIndex = 0;
        let match;
        let maxIter = 50000;
        let iter = 0;

        while ((match = tagRegex.exec(html)) !== null && iter++ < maxIter) {
          let textBefore = html.slice(lastIndex, match.index).trim();
          let parentId = stack[stack.length - 1];

          if (textBefore) {
            let textId = nodes.length;
            nodes.push({
              id: textId,
              tag: "#text",
              text: textBefore,
              attrs: {},
              childrenIds: [],
              parentId: parentId
            });
            nodes[parentId].childrenIds.push(textId);
          }

          lastIndex = tagRegex.lastIndex;
          let isCloseTag = !!match[1];
          let tagName = (match[1] || match[2] || "").toLowerCase();
          let attrStr = match[3] || "";
          let isSelfClosing = !!match[4] || VOID_TAGS.has(tagName);

          if (isCloseTag) {
            for (let i = stack.length - 1; i > 0; i--) {
              if (nodes[stack[i]].tag === tagName) {
                stack.splice(i);
                break;
              }
            }
          } else {
            let attrs = {};
            let attrRegex = /([a-zA-Z0-9_-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
            let attrMatch;
            while ((attrMatch = attrRegex.exec(attrStr)) !== null) {
              attrs[attrMatch[1].toLowerCase()] = attrMatch[2] || attrMatch[3] || attrMatch[4] || "";
            }

            let nodeId = nodes.length;
            let node = {
              id: nodeId,
              tag: tagName,
              attrs: attrs,
              childrenIds: [],
              parentId: parentId
            };
            nodes.push(node);
            nodes[parentId].childrenIds.push(nodeId);

            if (!isSelfClosing) {
              stack.push(nodeId);
            }
          }
        }

        let remainingText = html.slice(lastIndex).trim();
        if (remainingText && stack.length > 0) {
          let parentId = stack[stack.length - 1];
          let textId = nodes.length;
          nodes.push({
            id: textId,
            tag: "#text",
            text: remainingText,
            attrs: {},
            childrenIds: [],
            parentId: parentId
          });
          nodes[parentId].childrenIds.push(textId);
        }
      } catch (err) {
        if (typeof window !== "undefined" && window.log) window.log("parseHTML error: " + err.message);
      }
      return {
        root,
        nodes
      };
    }

    function getNodeText(node, nodes, depth) {
      if (!node || (depth || 0) > 20) return "";
      if (node.tag === "#text") return node.text || "";
      let text = "";
      if (node.childrenIds) {
        for (let cid of node.childrenIds) {
          text += getNodeText(nodes[cid], nodes, (depth || 0) + 1) + " ";
        }
      }
      return text.trim();
    }

    // -------------------------------------------------------------
    // 2. QUERY ENGINE & SELECTOR MATCHING
    // -------------------------------------------------------------
    function matchSingleSelector(node, sel, nodes) {
      if (!node || node.tag === "#text" || node.tag === "ROOT") return false;

      let cleanSel = sel;

      // 1. Tách pseudo positional (:first, :last, :eq)
      cleanSel = cleanSel.replace(/:first|:last|:eq\([0-9]+\)/gi, "").trim();

      // 2. Tách pseudo :content(...)
      let pseudoContentArg = null;
      let contentMatch = cleanSel.match(/:content\((['"]?)(.*?)\1\)/i);
      if (contentMatch) {
        pseudoContentArg = contentMatch[2];
        cleanSel = cleanSel.replace(contentMatch[0], "").trim();
      }

      // 3. Khớp Selector gốc
      if (cleanSel && cleanSel !== "*") {
        let tagMatch = cleanSel.match(/^[a-zA-Z0-9_-]+/);
        if (tagMatch && node.tag !== tagMatch[0].toLowerCase()) return false;

        let idMatch = cleanSel.match(/#([a-zA-Z0-9_-]+)/);
        if (idMatch && (!node.attrs || node.attrs.id !== idMatch[1])) return false;

        // Class matching (hỗ trợ Tailwind)
        let classMatches = cleanSel.match(/\.([a-zA-Z0-9_\-\/\\:]+)/g);
        if (classMatches) {
          if (!node.attrs || !node.attrs.class) return false;
          let elClasses = node.attrs.class.split(/\s+/);
          for (let c of classMatches) {
            let targetClass = c.substring(1);
            if (!elClasses.includes(targetClass)) return false;
          }
        }

        let attrMatch = cleanSel.match(/\[([a-zA-Z0-9_-]+)(?:=['"]?(.*?)['"]?)?\]/);
        if (attrMatch) {
          let attrName = attrMatch[1].toLowerCase();
          let attrVal = attrMatch[2];
          if (!node.attrs || !(attrName in node.attrs)) return false;
          if (attrVal !== undefined && node.attrs[attrName] !== attrVal) return false;
        }
      }

      if (pseudoContentArg !== null) {
        let fullText = getNodeText(node, nodes, 0);
        let keywords = pseudoContentArg.split("|").map(k => k.trim().toLowerCase());
        let found = keywords.some(kw => fullText.toLowerCase().includes(kw));
        if (!found) return false;
      }

      return true;
    }

    function querySelectorAllSingleLevel(startNode, selector, nodes) {
      let results = [];

      function search(currentId, depth) {
        if (depth > 50) return;
        let current = nodes[currentId];
        if (!current) return;

        if (current.tag !== "ROOT" && current.tag !== "#text" && current.id !== startNode.id) {
          if (matchSingleSelector(current, selector, nodes)) {
            results.push(current);
          }
        }
        if (current.childrenIds) {
          for (let cid of current.childrenIds) {
            search(cid, depth + 1);
          }
        }
      }
      search(startNode.id, 0);

      if (selector.indexOf(":first") !== -1) return results.slice(0, 1);
      if (selector.indexOf(":last") !== -1) return results.slice(-1);

      let eqMatch = selector.match(/:eq\(([0-9]+)\)/i);
      if (eqMatch) {
        let idx = parseInt(eqMatch[1], 10);
        return results[idx] ? [results[idx]] : [];
      }

      return results;
    }

    function querySelectorAll(startNode, selector, nodes) {
      try {
        if (!startNode || !selector) return [];

        if (selector.indexOf(',') !== -1) {
          let groupSelectors = selector.split(',').map(s => s.trim());
          let resMap = new Map();
          for (let gSel of groupSelectors) {
            let subRes = querySelectorAll(startNode, gSel, nodes);
            for (let r of subRes) resMap.set(r.id, r);
          }
          return Array.from(resMap.values());
        }

        let spaceParts = selector.trim().split(/\s+/);
        if (spaceParts.length > 1) {
          let currentNodes = [startNode];
          for (let part of spaceParts) {
            let nextLevelNodes = [];
            let addedIds = new Set();
            for (let cNode of currentNodes) {
              let subResults = querySelectorAllSingleLevel(cNode, part, nodes);
              for (let r of subResults) {
                if (!addedIds.has(r.id)) {
                  addedIds.add(r.id);
                  nextLevelNodes.push(r);
                }
              }
            }
            currentNodes = nextLevelNodes;
            if (currentNodes.length === 0) break;
          }
          return currentNodes;
        }

        return querySelectorAllSingleLevel(startNode, selector, nodes);
      } catch (err) {
        return [];
      }
    }

    // -------------------------------------------------------------
    // 3. MINIJQ CLASS CONSTRUCTOR & PROTOTYPE
    // -------------------------------------------------------------
    function MiniJQ(elements, nodesStore) {
      this.elements = Array.isArray(elements) ? elements : (elements ? [elements] : []);
      this.nodes = nodesStore || [];
      this.length = this.elements.length;
    }

    MiniJQ.prototype = {
      find: function(selector) {
        if (this.elements.length === 0) return new MiniJQ([], this.nodes);
        let matched = [];
        let addedIds = new Set();
        for (let el of this.elements) {
          let res = querySelectorAll(el, selector, this.nodes);
          for (let r of res) {
            if (!addedIds.has(r.id)) {
              addedIds.add(r.id);
              matched.push(r);
            }
          }
        }
        return new MiniJQ(matched, this.nodes);
      },

      text: function() {
        if (this.elements.length === 0) return "";
        return getNodeText(this.elements[0], this.nodes, 0);
      },

      html: function() {
        if (this.elements.length === 0) return "";
        let self = this;
        let serialize = function(nodeId, depth) {
          if (depth > 20) return "";
          let node = self.nodes[nodeId];
          if (!node) return "";
          if (node.tag === "#text") return node.text || "";
          let attrs = Object.entries(node.attrs || {}).map(([k, v]) => ` ${k}="${v}"`).join("");
          let childrenHTML = (node.childrenIds || []).map(cid => serialize(cid, depth + 1)).join("");
          return `<${node.tag}${attrs}>${childrenHTML}</${node.tag}>`;
        };
        return (this.elements[0].childrenIds || []).map(cid => serialize(cid, 0)).join("");
      },

      attr: function(name, value) {
        if (value !== undefined) {
          for (let el of this.elements) {
            if (el && el.tag !== "#text") {
              if (!el.attrs) el.attrs = {};
              el.attrs[name] = value;
            }
          }
          return this;
        }
        if (this.elements.length === 0 || !this.elements[0].attrs) return "";
        return this.elements[0].attrs[name] || "";
      },

      each: function(callback) {
        if (typeof callback !== 'function') return this;
        this.elements.forEach((el, index) => {
          let jqEl = new MiniJQ([el], this.nodes);
          callback.call(jqEl, index, jqEl);
        });
        return this;
      },

      textAll: function(delimiter) {
        if (delimiter === undefined) delimiter = " ";
        let texts = [];
        for (let el of this.elements) {
          texts.push(getNodeText(el, this.nodes, 0));
        }
        return texts.join(delimiter);
      },

      first: function() {
        return new MiniJQ(this.elements.length > 0 ? [this.elements[0]] : [], this.nodes);
      },

      last: function() {
        return new MiniJQ(this.elements.length > 0 ? [this.elements[this.elements.length - 1]] : [], this.nodes);
      },

      eq: function(index) {
        return new MiniJQ(this.elements[index] ? [this.elements[index]] : [], this.nodes);
      },

      parent: function() {
        let parents = [];
        let addedIds = new Set();
        for (let el of this.elements) {
          if (el && el.parentId !== null && el.parentId !== 0) {
            let pNode = this.nodes[el.parentId];
            if (pNode && !addedIds.has(pNode.id)) {
              addedIds.add(pNode.id);
              parents.push(pNode);
            }
          }
        }
        return new MiniJQ(parents, this.nodes);
      },

      next: function() {
        let nexts = [];
        for (let el of this.elements) {
          if (!el || el.parentId === null) continue;
          let pNode = this.nodes[el.parentId];
          if (!pNode) continue;

          let siblings = pNode.childrenIds.map(cid => this.nodes[cid]).filter(c => c && c.tag !== "#text");
          let idx = siblings.findIndex(s => s.id === el.id);
          if (idx !== -1 && idx + 1 < siblings.length) {
            nexts.push(siblings[idx + 1]);
          }
        }
        return new MiniJQ(nexts, this.nodes);
      },

      before: function() {
        let befores = [];
        for (let el of this.elements) {
          if (!el || el.parentId === null) continue;
          let pNode = this.nodes[el.parentId];
          if (!pNode) continue;

          let siblings = pNode.childrenIds.map(cid => this.nodes[cid]).filter(c => c && c.tag !== "#text");
          let idx = siblings.findIndex(s => s.id === el.id);
          if (idx > 0) {
            befores.push(siblings[idx - 1]);
          }
        }
        return new MiniJQ(befores, this.nodes);
      },

      after: function() {
        return this.next();
      },

      closest: function(selector) {
        let matched = [];
        let addedIds = new Set();
        for (let el of this.elements) {
          let currParentId = el.parentId;
          let depth = 0;
          while (currParentId !== null && currParentId !== 0 && depth++ < 30) {
            let curr = this.nodes[currParentId];
            if (!curr) break;
            if (matchSingleSelector(curr, selector, this.nodes)) {
              if (!addedIds.has(curr.id)) {
                addedIds.add(curr.id);
                matched.push(curr);
              }
              break;
            }
            currParentId = curr.parentId;
          }
        }
        return new MiniJQ(matched, this.nodes);
      }
    };

    // -------------------------------------------------------------
    // 4. MAIN ENTRY POINT LOGIC FOR _$
    // -------------------------------------------------------------
    try {
      if (!param) return new MiniJQ([], []);
      if (param instanceof MiniJQ) return param;
      if (typeof param === "string") {
        let parsed = parseHTML(param);
        return new MiniJQ(parsed.root, parsed.nodes);
      }
      return new MiniJQ(param, []);
    } catch (err) {
      return new MiniJQ([], []);
    }
  }

  function log(msg) {
    console.log(msg);
  }

  BASE64 = {
    encode: function(str) {
      try {
        if (!str) return "";

        // 1. Encode String ra mảng UTF-8 Bytes trước
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
            // Ký tự Surrogate Pair
            code =
              0x10000 + ((code & 0x03ff) << 10) + (str.charCodeAt(++i) & 0x03ff);
            utf8Bytes.push(
              (code >> 18) | 240,
              ((code >> 12) & 63) | 128,
              ((code >> 6) & 63) | 128,
              (code & 63) | 128
            );
          } else {
            utf8Bytes.push(
              (code >> 12) | 224,
              ((code >> 6) & 63) | 128,
              (code & 63) | 128
            );
          }
        }

        // 2. Chuyển mảng UTF-8 Bytes thành chuỗi Base64
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
        console.log("[BASE64.encode Error]:", e.message || e);
        return "";
      }
    },

    decode: function(base64String) {
      try {
        if (!base64String) return "";

        // 1. Dọn dẹp chuỗi & xử lý nếu URL-encoded (ví dụ: %2B, %2F)
        var str = decodeURIComponent(base64String.trim());

        // Chuyển URL-safe base64 về base64 chuẩn
        str = str.replace(/-/g, "+").replace(/_/g, "/");

        // Bảng ký tự Base64
        var chars =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var output = [];
        var buffer = 0,
          bits = 0;

        // 2. Decode Base64 thành Mảng Byte
        for (var i = 0; i < str.length; i++) {
          var char = str.charAt(i);
          if (char === "=") break; // Bỏ qua padding
          var index = chars.indexOf(char);
          if (index === -1) continue; // Bỏ qua ký tự không hợp lệ

          buffer = (buffer << 6) | index;
          bits += 6;

          if (bits >= 8) {
            bits -= 8;
            output.push((buffer >> bits) & 0xff);
          }
        }

        // 3. Decode UTF-8 từ mảng Byte ra String
        var result = "";
        var j = 0;
        while (j < output.length) {
          var c = output[j++];
          if (c < 128) {
            result += String.fromCharCode(c);
          } else if (c > 191 && c < 224) {
            var c2 = output[j++];
            result += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
          } else if (c > 223 && c < 240) {
            var c2 = output[j++];
            var c3 = output[j++];
            result += String.fromCharCode(
              ((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)
            );
          } else if (c >= 240) {
            var c2 = output[j++];
            var c3 = output[j++];
            var c4 = output[j++];
            var u =
              (((c & 7) << 18) | ((c2 & 63) << 12) | ((c3 & 63) << 6) | (c4 & 63)) -
              0x10000;
            result += String.fromCharCode(0xd800 + (u >> 10), 0xdc00 + (u & 0x3ff));
          }
        }

        return result;
      } catch (e) {
        console.log("[BASE64.decode Error]:", e.message || e);
        return "";
      }
    }
  };

  function checkRaw(scriptStr, returnFixed) {
    try {
      if (!scriptStr || typeof scriptStr !== "string") {
        console.log(
          "[Lỗi escape runJS]\r\n\t Dữ liệu đầu vào không phải là chuỗi hợp lệ!",
        );
        return scriptStr || "";
      }

      var lines = scriptStr.split("\n");
      var fixedLines = [];
      var hasError = false;

      for (var i = 0; i < lines.length; i++) {
        var currentLine = lines[i];
        var lineNum = i + 1;
        var lineErrorFound = false; // 1. Kiểm tra lỗi escape newline/tab nguy hiểm nằm trần trong chuỗi quote
        // Trường hợp chưa được escape dạng '\\n' hoặc '\\t' trong chuỗi ghép

        if (/([^\\]|^)(\r\n|\r|\n)/.test(currentLine)) {
          console.log(
            "[Lỗi escape runJS]\r\n\t Phát hiện xuống dòng chưa escape ở Dòng " +
            lineNum +
            ": " +
            currentLine.trim(),
          );
          lineErrorFound = true;
        } // 2. Kiểm tra lỗi quên escape ký tự Tab trần không hợp lệ

        if (/\t/.test(currentLine) && !/\\t/.test(currentLine)) {
          console.log(
            "[Lỗi escape runJS]\r\n\t Phát hiện ký tự Tab trần ở Dòng " +
            lineNum +
            ": " +
            currentLine.trim(),
          );
          lineErrorFound = true;
        } // 3. Kiểm tra dấu xược ngược single trailing backlash ở cuối dòng (dễ làm gãy chuỗi)

        if (/([^\\])\\$/.test(currentLine)) {
          console.log(
            "[Lỗi escape runJS]\r\n\t Dấu Backslash (\\) cô đơn ở cuối Dòng " +
            lineNum +
            ": " +
            currentLine.trim(),
          );
          lineErrorFound = true;
        }

        if (lineErrorFound) {
          hasError = true;
        } // Tiến hành SỬA LỖI tự động nếu tham số returnFixed = true

        var fixedLine = currentLine;
        if (returnFixed) {
          // Chuẩn hóa ký tự xuống dòng và tab đặc biệt
          fixedLine = fixedLine.replace(/\r/g, "").replace(/\t/g, "  "); // Thay Tab trần bằng 2 khoảng trắng cho an toàn
        }

        fixedLines.push(fixedLine);
      } // 4. Kiểm tra cú pháp nhanh xem toàn bộ chuỗi có parse được JS không

      try {
        new Function(scriptStr);
      } catch (syntaxErr) {
        hasError = true;
        console.log(
          "[Lỗi escape runJS]\r\n\t 💥 LỖI CÚ PHÁP (SyntaxError) toàn cục: " +
          syntaxErr.message,
        );
      }

      if (!hasError) {
        console.log("[checkRaw] 🟢 Chuỗi Raw JS hoàn toàn sạch lỗi!");
      } // Trả về bản đã fix hoặc bản gốc theo tham số returnFixed

      return returnFixed ? fixedLines.join("\n") : scriptStr;
    } catch (e) {
      console.log(
        "[Lỗi escape runJS]\r\n\t Lỗi ngoại lệ trong hàm checkRaw: " + e.message,
      );
      return scriptStr; // Luôn an toàn: Fallback trả về chuỗi gốc chứ không làm sập script
    }
  }

  function decodeHTMLtext(str) {
    try {
      if (!str) return "";
      return str.replace(/&#(\d+);|&#x([0-9a-fA-F]+);/g, (match, dec, hex) => {
        if (dec) {
          return String.fromCharCode(parseInt(dec, 10));
        }
        if (hex) {
          return String.fromCharCode(parseInt(hex, 16));
        }
        return match;
      });
    } catch (e) {
      log("decodeHTMLEntities[err]:\n " + e);
    }
  }

  function clearJS(func) {
    if (typeof func !== "function") return "";

    // Lấy toàn bộ mã nguồn của hàm dưới dạng string
    var funcStr = func.toString();

    // Dùng Regex bóc tách lấy nội dung bên trong cặp ngoặc nhọn {} đầu tiên và cuối cùng
    var match = funcStr.match(/\{([\s\S]*)\}/);
    if (!match) return "";

    var innerCode = match[1].trim();

    // (Tùy chọn) Bạn có thể tận dụng luôn hàm checkRaw sẵn có trong template của bạn 
    // để nó tự động rà soát và fix các ký tự xuống dòng/tab nguy hiểm cho an toàn tuyệt đối:
    var safeCode = checkRaw(innerCode, true);

    return safeCode;
  }
}
// ==== HIDEMENU ====