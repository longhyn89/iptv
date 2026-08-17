// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================
var popuphtml = "<div class='donate-container'><h2 class='donate-heading'>DONATE</h2><p class='donate-description'>Anh em yêu quý có thể mời bọn mình 2 ly cà phê nhé. Để có động lực duy trì App, cập nhật plugin và tìm thêm nhiều nguồn mới và hay cho anh em. Một chút lòng thành cũng làm bọn mình tiếp tục hoạt động tốt hơn, cám ơn anh em.</p><div class='donate-grid'><div class='donate-card'><div class='donate-title'>Donate Tác giả Plugin</div><div class='qr-wrapper'><img src='https://vaxplugin.alokillgtv.workers.dev/img/qrht.png' alt='Donate Tác giả Plugin' /></div></div><div class='donate-card'><div class='donate-title'>Donate Tác giả App</div><div class='qr-wrapper'><img src='https://vaxplugin.alokillgtv.workers.dev/img/qryb.png' alt='Donate Tác giả App' /></div></div></div></div><style>.donate-container{max-width:800px;margin:0 auto;padding:10px;box-sizing:border-box;font-family:Arial,sans-serif;text-align:center;color:#eee}.donate-heading{font-size:22px;font-weight:bold;margin:0 0 12px 0;color:#fff;text-transform:uppercase;letter-spacing:1px}.donate-description{font-size:14px;line-height:1.5;margin-bottom:18px;color:#ccc}.donate-grid{display:flex;flex-direction:row;justify-content:center;align-items:stretch;gap:16px}.donate-card{flex:1;min-width:0;background:#22252a;border-radius:12px;padding:14px;border:1px solid #33373e;display:flex;flex-direction:column;align-items:center}.donate-title{font-weight:bold;font-size:15px;margin-bottom:12px;color:#fff}.qr-wrapper{width:100%;max-width:240px;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;background:#181a1d;border-radius:8px;padding:8px;box-sizing:border-box}.qr-wrapper img{width:100%;height:100%;object-fit:contain;border-radius:4px}@media(max-width:600px){.donate-grid{flex-direction:column}.donate-heading{font-size:18px;margin-bottom:8px}.donate-description{font-size:13px;margin-bottom:12px}.qr-wrapper{max-width:180px}}</style>";
function getManifest() {
    return JSON.stringify({
        "id": "nguoncnew",
        "name": "Phim NguonC VIP",
        "version": "1.5.5",
        "baseUrl": "https://phim.nguonc.com",
        "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/nguoncnew.png",
        "isEnabled": true,
        "type": "MOVIE",
        popuphtml: popuphtm,
        "author": "Alokillgtv",
        "playerType": "auto"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'phim-le', title: 'Phim Lẻ', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'phim-bo', title: 'Phim Bộ', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'tv-shows', title: 'TV Shows', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'hoat-hinh', title: 'Hoạt Hình', type: 'Horizontal', path: 'the-loai' },
        { slug: 'phim-moi-cap-nhat', title: 'Phim Mới Cập Nhật', type: 'Grid', path: 'phim-moi-cap-nhat' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Phim lẻ', slug: 'phim-le' },
        { name: 'Phim bộ', slug: 'phim-bo' },
        { name: 'TV Shows', slug: 'tv-shows' },
        { name: 'Hoạt hình', slug: 'hoat-hinh' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Mới cập nhật', value: 'updated' },
            { name: 'Mới nhất', value: 'new' },
            { name: 'Lượt xem', value: 'view' }
        ]
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = filters.page || 1;
        var sort = filters.sort || "updated"; // updated, view, year

        // Handle "Phim Mới Cập Nhật" specially if no filter
        if (slug === 'phim-moi-cap-nhat' && !filters.category && !filters.country && !filters.year) {
            return "https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=" + page;
        }

        // Priority 1: Category Support //v1/api/the-loai/{slug}
        if (filters.category) {
            return "https://phim.nguonc.com/api/films/the-loai/" + filters.category + "?page=" + page + "&sort=" + sort;
        }

        // Priority 2: Country Support //v1/api/quoc-gia/{slug}
        if (filters.country) {
            return "https://phim.nguonc.com/api/films/quoc-gia/" + filters.country + "?page=" + page + "&sort=" + sort;
        }

        // Priority 3: Year Support //v1/api/nam-phat-hanh/{year}
        if (filters.year) {
            return "https://phim.nguonc.com/api/films/nam-phat-hanh/" + filters.year + "?page=" + page + "&sort=" + sort;
        }

        // --- Slug-based Logic (if no active filter) ---

        // Handle Years (4 digits)
        if (/^\d{4}$/.test(slug)) {
            return "https://phim.nguonc.com/api/films/nam-phat-hanh/" + slug + "?page=" + page + "&sort=" + sort;
        }

        // Handle specific Lists (Danh sách)
        var listSlugs = ['phim-le', 'phim-bo', 'phim-dang-chieu', 'tv-shows', 'subteam'];
        // Note: 'hoat-hinh' is sometimes a list, sometimes a category. 
        // On NguonC, 'hoat-hinh' is usually in 'the-loai' but let's check standard lists.
        // NguonC commonly puts 'phim-hoat-hinh' in lists or 'hoat-hinh' in genres.

        if (listSlugs.indexOf(slug) >= 0) {
            // If slug is 'hoat-hinh', prefer 'the-loai' logic unless we know it's a list
            if (slug !== 'hoat-hinh') {
                return "https://phim.nguonc.com/api/films/danh-sach/" + slug + "?page=" + page + "&sort=" + sort;
            }
        }

        // Handle Countries (Fallback if slug matches country list)
        var countrySlugs = [
            'au-my', 'anh', 'trung-quoc', 'indonesia', 'viet-nam', 'phap', 'hong-kong',
            'han-quoc', 'nhat-ban', 'thai-lan', 'dai-loan', 'nga', 'ha-lan',
            'philippines', 'an-do', 'quoc-gia-khac'
        ];
        if (countrySlugs.indexOf(slug) >= 0) {
            return "https://phim.nguonc.com/api/films/quoc-gia/" + slug + "?page=" + page + "&sort=" + sort;
        }

        // Default to Genres (Thể loại)
        return "https://phim.nguonc.com/api/films/the-loai/" + slug + "?page=" + page + "&sort=" + sort;

    } catch (e) {
        return "https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=1";
    }
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    return "https://phim.nguonc.com/api/films/search?keyword=" + encodeURIComponent(keyword);
}

function getUrlDetail(slug) {
    if (slug.indexOf("http") === 0) return slug;
    return "https://phim.nguonc.com/api/film/" + slug;
}

// Just returning the home page to trigger the parser, which will return hardcoded data
function getUrlCategories() { return "https://phim.nguonc.com"; }
function getUrlCountries() { return "https://phim.nguonc.com"; }
function getUrlYears() { return "https://phim.nguonc.com"; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        // Handle NguonC structure: sometimes data is array directly (search), sometimes an object (list)
        var data = response.data || {};
        var items = [];

        if (Array.isArray(data)) {
            items = data;
        } else if (Array.isArray(response.items)) {
            items = response.items;
        } else if (data.items && Array.isArray(data.items)) {
            items = data.items;
        }

        // Handle NguonC 'paginate' structure
        // User provided: "paginate": { "current_page": 1, ... }
        var paginate = response.paginate || response.pagination || (data.params && data.params.pagination) || {};

        var movies = items.map(function (item) {
            return {
                id: item.slug,
                title: item.name,
                posterUrl: getImageUrl(item.thumb_url),
                backdropUrl: getImageUrl(item.poster_url),
                year: item.year || 0,
                quality: item.quality || "",
                // Handle different field names for current episode
                episode_current: item.current_episode || item.episode_current || "",
                // Handle different field names for language
                lang: item.language || item.lang || ""
            };
        });

        // Determine pagination values
        var currentPage = paginate.current_page || paginate.currentPage || 1;
        var totalItems = paginate.total_items || paginate.totalItems || 0;
        var itemsPerPage = paginate.items_per_page || paginate.itemsPerPage || paginate.totalItemsPerPage || 24;

        // Calculate total pages if not provided directly
        var totalPages = paginate.total_page || paginate.totalPages || 0;
        if (totalPages === 0 && itemsPerPage > 0) {
            totalPages = Math.ceil(totalItems / itemsPerPage);
        }
        if (totalPages === 0) totalPages = 1;

        return JSON.stringify({
            items: movies,
            pagination: {
                currentPage: currentPage,
                totalPages: totalPages,
                totalItems: totalItems,
                itemsPerPage: itemsPerPage
            }
        });
    } catch (error) {
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

function parseSearchResponse(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

function parseMovieDetail(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        // Normalize movie object (supports standard and potential variants)
        var movie = response.movie || response.data?.item || response.data || {};

        // Normalize episodes
        var rawEpisodes = movie.episodes || response.episodes || response.data?.item?.episodes || [];

        var servers = [];
        if (Array.isArray(rawEpisodes)) {
            rawEpisodes.forEach(function (server) {
                var episodes = [];
                var serverItems = server.items || server.server_data || [];

                if (Array.isArray(serverItems)) {
                    serverItems.forEach(function (ep) {
                        var embed = ep.embed || ep.link_embed || "";
                        var m3u8 = ep.m3u8 || ep.link_m3u8 || "";

                        // Use Embed URL as ID to allow scraping Referer/M3u8 details
                        // If no embed, use m3u8 directly.
                        var link = embed || m3u8;

                        if (link) {
                            episodes.push({
                                id: link,
                                name: ep.name || ep.episode_name || "",
                                slug: ep.slug || ep.episode_slug || ""
                            });
                        }
                    });
                }

                if (episodes.length > 0) {
                    servers.push({
                        name: server.server_name || server.name || "Server",
                        episodes: episodes
                    });
                }
            });
        }

        // Helper to extract category/country/year
        // Handles both { "1": { group: ..., list: [...] } } AND typical arrays
        var extractGroup = function (categoryObj, groupName) {
            if (!categoryObj) return "";

            // If it's an object with keys "1", "2"...
            for (var key in categoryObj) {
                var group = categoryObj[key];
                if (group && group.group && group.group.name === groupName && group.list && group.list.length > 0) {
                    return group.list.map(function (item) { return item.name; }).join(", ");
                }
            }
            return "";
        };

        var extractedYear = extractGroup(movie.category, "Năm");

        return JSON.stringify({
            id: movie.slug || "",
            title: movie.name || "",
            posterUrl: getImageUrl(movie.thumb_url),
            backdropUrl: getImageUrl(movie.poster_url),
            description: (movie.description || movie.content || "").replace(/<[^>]*>/g, ""),
            year: parseInt(movie.year || extractedYear) || 0,
            rating: parseFloat(movie.view) || 0,
            quality: movie.quality || "",
            servers: servers,
            episode_current: movie.current_episode || movie.episode_current || "",
            lang: movie.language || movie.lang || "",
            casts: movie.casts || movie.actor || "", // Fallback to 'actor' if casts is missing
            director: movie.director || "",
            category: extractGroup(movie.category, "Thể loại"),
            country: extractGroup(movie.category, "Quốc gia"),
            view: parseInt(movie.view) || 0,
            status: movie.status || ""
        });
    } catch (error) {
        return "{}";
    }
}


function parseDetailResponse(html, url) {
    try {
        var customjs = runJS();
        return JSON.stringify({
            "url": url,
            "headers": {
                "Referer": "https://embed.streamc.xyz/",
                "Origin": "https://embed.streamc.xyz/",
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
                // Đánh lừa thuật toán Client Hints của tường lửa
                "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
                "Sec-Ch-Ua-Mobile": "?1",
                "Sec-Ch-Ua-Platform": '"Android"',
                
                // Khai báo kiểu dữ liệu được chấp nhận giống như trình duyệt thật
                "Accept": "*/*",
                "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
                "X-Requested-With": "com.android.chrome",
                "Block-Ads": true,
                "Block-Css": "html,body,*",
                "Custom-Js": customjs.trim()
            },
            "subtitles": []
        });
        
    } catch (e) {
        return JSON.stringify({ "url": "", "headers": {} });
    }
}



function runJS() {
    return `
function bridgeLog(msg, check) {
    try {
      if (window.SnifferBridge && typeof window.SnifferBridge.log === 'function') {
        window.SnifferBridge.log(msg);
        if (check === true && typeof window.SnifferBridge.toast === 'function') {
          window.SnifferBridge.toast(msg, 1000);
        }
      } else if (typeof console !== 'undefined' && console.log) {
        console.log(msg);
      }
    } catch(e) {}
  }
(function injectCSS() {
  try {
    // 1. Khai báo nội dung CSS của bạn ở đây
    const cssStyle = "body,html,*{display:none!important,backgroud:black!important;opacity:0!important;z-index:-999999}";

    // 2. Tạo thẻ <style>
    const styleElement = document.createElement('style');
    styleElement.type = 'text/css';
    styleElement.setAttribute('data-injected-by', 'custom-script');

    if (styleElement.styleSheet) {
      // Dành cho các trình duyệt IE cũ
      styleElement.styleSheet.cssText = cssStyle;
    } else {
      // Dành cho trình duyệt hiện đại
      styleElement.appendChild(document.createTextNode(cssStyle));
    }

    // 3. Tìm vị trí để chèn (ưu tiên <head>, nếu chưa có head thì lấy documentElement)
    const targetNode = document.head || document.getElementsByTagName('head')[0] || document.documentElement;

    if (targetNode) {
      targetNode.appendChild(styleElement);
      bridgeLog("Chèn css ngay lập tức.")
    } else {
      // Fallback: Nếu DOM chưa sẵn sàng, chờ DOMContentLoaded rồi mới chèn
      document.addEventListener('DOMContentLoaded', function () {
        (document.head || document.documentElement).appendChild(styleElement);
        bridgeLog("Chèn Css sau khi load xong")
      });
    }
  } catch (error) {
    // Bắt toàn bộ lỗi để đảm bảo script chính vẫn tiếp tục chạy bình thường
    bridgeLog('Không thể chèn CSS tự động, bỏ qua lỗi:', error);
  }
})();

(function initLocalBlobSniffer() {
  if (window.__BLOB_SNIFFER_INITIALIZED__) return;
  window.__BLOB_SNIFFER_INITIALIZED__ = 1;

  var hasDispatchedAny = 0;
  var isFinished = 0;
  var timeoutTimer = null;

  

  // =========================================================================
  // 1. GIỚI HẠN THỜI GIAN 10 GIÂY (TIMEOUT)
  // =========================================================================
  bridgeLog("Đang tiến hành tìm link Video, xin chờ....", true);

  timeoutTimer = setTimeout(function() {
    if (hasDispatchedAny === 0 && isFinished === 0) {
      isFinished = 1;
      bridgeLog("❌ [TIMEOUT] Đã quá 10 giây nhưng không tìm thấy Blob M3U8!", false);
      bridgeLog("Không tìm thấy link video (Hết thời gian 10s).", true);
      
      // Fallback khi không tìm thấy
      if (window.SnifferBridge && typeof window.SnifferBridge.play === 'function') {
        window.SnifferBridge.play("https://google.com", "");
      }
    }
  }, 20000); // 10,000 ms = 10 giây

  function stopTimeout() {
    if (timeoutTimer) {
      clearTimeout(timeoutTimer);
      timeoutTimer = null;
    }
  }

  // =========================================================================
  // 2. KIỂM TRA M3U8 HỢP LỆ
  // =========================================================================
  function isValidM3U8(content) {
    if (typeof content !== 'string') return false;
    var trimmed = content.trim();
    return trimmed.indexOf('#EXTM3U') === 0 && 
          (trimmed.indexOf('#EXTINF') !== -1 || trimmed.indexOf('#EXT-X-STREAM-INF') !== -1);
  }

  // =========================================================================
  // 3. CHUYỂN NỘI DUNG M3U8 VỀ APP (LOCAL SERVER)
  // =========================================================================
  function dispatchM3u8ToApp(m3u8Content) {
    if (!m3u8Content || hasDispatchedAny === 1) return;
    hasDispatchedAny = 1;
    isFinished = 1;
    stopTimeout(); // Hủy đếm ngược 10s khi đã lấy thành công

    bridgeLog('🎯 [LOCAL-DISPATCH] Đã tìm thấy M3U8! Đang nạp vào Local Player...');
    bridgeLog("🎯 Bắt link thành công! Đang phát video...", true);

    try {
      if (window.SnifferBridge && typeof window.SnifferBridge.playM3u8Content === 'function') {
        // Truyền trực tiếp nội dung M3U8 thô + URL hiện tại làm Referer/BaseURL
        window.SnifferBridge.playM3u8Content(m3u8Content, window.location.href);
      } else {
        bridgeLog('❌ SnifferBridge.playM3u8Content không khả dụng!');
      }
    } catch(e) {
      bridgeLog('❌ [DISPATCH ERROR]: ' + e.message);
    }
  }

  // =========================================================================
  // 4. HOOK URL.createObjectURL (BẮT TRỰC TIẾP DỮ LIỆU BLOB M3U8)
  // =========================================================================
  try {
    if (typeof URL !== 'undefined' && URL.createObjectURL) {
      var originalCreateObjectURL = URL.createObjectURL;
      
      URL.createObjectURL = function(blob) {
        var blobUrl = originalCreateObjectURL.apply(this, arguments);

        if (isFinished === 0 && blob && (blob instanceof Blob || blob instanceof File)) {
          var processContent = function(content) {
            if (isValidM3U8(content)) {
              //bridgeLog('🎯 [FOUND-BLOB]: Phát hiện M3U8 từ Blob RAM!');
              dispatchM3u8ToApp(content);
            }
          };

          if (typeof blob.text === 'function') {
            blob.text().then(processContent).catch(function(){});
          } else {
            var reader = new FileReader();
            reader.onload = function(e) {
              processContent(e.target.result);
            };
            reader.readAsText(blob);
          }
        }

        return blobUrl;
      };
      
      bridgeLog('🚀 [INIT] Đã Hook thành công.');
    }
  } catch (e) {
    bridgeLog('❌ [INIT-ERROR]: ' + e.message);
  }
})();
  `;
}



// Hardcoded Categories (Genres)
function parseCategoriesResponse(apiResponseJson) {
    var genres = [
        { name: "Hành Động", slug: "hanh-dong" },
        { name: "Phiêu Lưu", slug: "phieu-luu" },
        { name: "Hoạt Hình", slug: "hoat-hinh" },
        { name: "Hài", slug: "phim-hai" },
        { name: "Hình Sự", slug: "hinh-su" },
        { name: "Tài Liệu", slug: "tai-lieu" },
        { name: "Chính Kịch", slug: "chinh-kich" },
        { name: "Gia Đình", slug: "gia-dinh" },
        { name: "Giả Tưởng", slug: "gia-tuong" },
        { name: "Lịch Sử", slug: "lich-su" },
        { name: "Kinh Dị", slug: "kinh-di" },
        { name: "Nhạc", slug: "phim-nhac" },
        { name: "Bí Ẩn", slug: "bi-an" },
        { name: "Lãng Mạn", slug: "lang-man" },
        { name: "Khoa Học Viễn Tưởng", slug: "khoa-hoc-vien-tuong" },
        { name: "Gây Cấn", slug: "gay-can" },
        { name: "Chiến Tranh", slug: "chien-tranh" },
        { name: "Tâm Lý", slug: "tam-ly" },
        { name: "Tình Cảm", slug: "tinh-cam" },
        { name: "Cổ Trang", slug: "co-trang" },
        { name: "Miền Tây", slug: "mien-tay" },
        { name: "Phim 18+", slug: "phim-18" }
    ];
    return JSON.stringify(genres);
}

// Hardcoded Countries
function parseCountriesResponse(apiResponseJson) {
    var countries = [
        { name: "Âu Mỹ", value: "au-my" },
        { name: "Anh", value: "anh" },
        { name: "Trung Quốc", value: "trung-quoc" },
        { name: "Indonesia", value: "indonesia" },
        { name: "Việt Nam", value: "viet-nam" },
        { name: "Pháp", value: "phap" },
        { name: "Hồng Kông", value: "hong-kong" },
        { name: "Hàn Quốc", value: "han-quoc" },
        { name: "Nhật Bản", value: "nhat-ban" },
        { name: "Thái Lan", value: "thai-lan" },
        { name: "Đài Loan", value: "dai-loan" },
        { name: "Nga", value: "nga" },
        { name: "Hà Lan", value: "ha-lan" },
        { name: "Philippines", value: "philippines" },
        { name: "Ấn Độ", value: "an-do" },
        { name: "Quốc gia khác", value: "quoc-gia-khac" }
    ];
    return JSON.stringify(countries);
}

// Hardcoded Years
function parseYearsResponse(apiResponseJson) {
    var years = [];
    for (var i = 2026; i >= 2004; i--) {
        years.push({ name: i.toString(), value: i.toString() });
    }
    return JSON.stringify(years);
}

function getImageUrl(path) {
    if (!path) return "";
    if (path.indexOf("http") === 0) return path;
    // Base image URL for NguonC
    return "https://img.phimapi.com/" + path;
}
