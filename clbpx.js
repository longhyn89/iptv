var BASEURL = "https://clbphimxua.com";
var BASESOURCE = "";

// Chuỗi cookie xác thực tài khoản VIP của bạn
var cookie = "wordpress_logged_in_4f11e66873917c29d453ff7fc4f26e7b=gun95941%40gmail.com%7C1789111271%7CpWnW9tgQoN5g2rbk31ZegbEpI16ZDx6HwHxxVoezaVy%7Ced83aa1b6f0e0490444d39bcf243547f9848316b9189fa860883ea3782ffe920; wordpress_sec_4f11e66873917c29d453ff7fc4f26e7b=gun95941%40gmail.com%7C1789111271%7CpWnW9tgQoN5g2rbk31ZegbEpI16ZDx6HwHxxVoezaVy%7Cefe268c46f1d6d88ae82af755c35653c63673dc55abca12f6d862a97639bef41";

function getValidCookie() {
  return cookie;
}

function getManifest() {
  return JSON.stringify({
    "id": "clbpxVIP",
    "name": "CLB Phim Xưa VIP",
    "version": "1.3.6",
    "info": "Full code fix cứng cookie và bóc tách danh sách phim",
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

// Hàm lấy danh sách phim theo trang hoặc chuyên mục
function getList(url, page) {
  var targetUrl = url;
  if (!targetUrl || targetUrl === "") {
    targetUrl = BASEURL;
  }
  if (page > 1) {
    targetUrl = targetUrl + (targetUrl.includes("?") ? "&" : "?") + "page=" + page;
  }

  var response = httpRequest({
    "url": targetUrl,
    "method": "GET",
    "headers": {
      "Cookie": cookie,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Referer": BASEURL
    }
  });

  return parseListResponse(response);
}

// Hàm phân tích HTML trả về để trích xuất danh sách phim (Tiêu đề, Link, Hình ảnh)
function parseListResponse(html) {
  var list = [];
  if (!html) return JSON.stringify(list);

  // Regex quét các khối item phim phổ biến trên mã nguồn WordPress (thường nằm trong các thẻ article, post hoặc div class item)
  // Bạn có thể tinh chỉnh lại biểu thức regex nếu cấu trúc website sử dụng class khác
  var regex = /<article[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>[\s\S]*?(?:src|data-src)="([^"]+)"[\s\S]*?alt="([^"]+)"/g;
  var match;
  
  while ((match = regex.exec(html)) !== null) {
    var link = match[1];
    var thumb = match[2];
    var title = match[3];

    if (link && title) {
      list.push({
        "name": title.trim(),
        "link": link.startsWith("http") ? link : BASEURL + link,
        "thumbUrl": thumb ? thumb.trim() : ""
      });
    }
  }

  // Fallback dự phòng nếu Regex trên không khớp cấu trúc thẻ article
  if (list.length === 0) {
    var altRegex = /<div class="item"[^>]*>[\s\S]*?<a href="([^"]+)"[^>]*>[\s\S]*?data-src="([^"]+)"[\s\S]*?<span>([^<]+)<\/span>/g;
    while ((match = altRegex.exec(html)) !== null) {
      list.push({
        "name": match[3].trim(),
        "link": match[1].startsWith("http") ? match[1] : BASEURL + match[1],
        "thumbUrl": match[2].trim()
      });
    }
  }

  return JSON.stringify(list);
}
