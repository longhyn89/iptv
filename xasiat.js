BASEURL = "https://www.xasiat.ws";

function getManifest() {
  return JSON.stringify({
    "id": "xasiat",
    "name": "[XXX] XXX Châu Á",
    "description": "XXX Hay",
    "version": "1.1.4",
    "baseUrl": "https://www.xasiat.ws",
    "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/xasiat.png",
    "isEnabled": true,
    "layoutType": "HORIZONTAL",
    "isAdult": true,
    "author": "Alokillgtv",
    "type": "VIDEO",
    "playerType": "exoplayer"
  });
}

function log(msg) {
  if (typeof nativeLog !== 'undefined') {
    nativeLog("[motchille] " + msg);
  } else if (typeof console !== 'undefined' && console.log) {
    console.log("[motchille] " + msg);
  }
}

function getHomeSections() {
  return JSON.stringify([{
      "slug": "/categories/jav-4k/",
      "title": "Phim 4K",
      "type": "Horizontal"
    },
    {
      "slug": "/categories/jav-uncensored/",
      "title": "JAV KO CHE",
      "type": "Horizontal"
    },
    {
      "slug": "/most-popular/",
      "title": "Xu Hướng",
      "type": "Horizontal"
    },
    {
      "slug": "/top-rated/",
      "title": "Video Hàng Đầu",
      "type": "Horizontal"
    },
    {
      "slug": "/latest-updates/",
      "title": "Phim Mới",
      "type": "Grid"
    }
  ]);
}


function getPrimaryCategories() {
  var listurl = getLISTmenu();
  var menulist = buildMenu(listurl);
  return JSON.stringify(menulist);
}

// ĐÃ SỬA: Lỗi cú pháp khai báo biến trong JSON.stringify
function getFilterConfig() {
  var listurl = getLISTmenu();
  var menulist = buildMenu(listurl);
  return JSON.stringify({
    category: menulist
  });
}

// =============================================================================
// URL GENERATION
// =============================================================================


function getUrlList(slug, filtersJson) {
  try {
    if (slug && slug.indexOf("http") > -1) {
      if (slug.indexOf("search") > -1) {
        if (filtersJson) {
          var fixedJson = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
          try {
            var filters = JSON.parse(fixedJson);
            var page = parseInt(filters.page) || 1;
            if (page > 1) {
              return slug + page + "/";
            } else {
              return slug;
            }
          } catch (jsonErr) {
            return slug;
          }
        }
      }
      return slug;
    }

    var page = 1;
    var path = slug || "";

    if (filtersJson) {
      var fixedJson2 = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
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
      } catch (jsonErr) {}
    }

    var resultUrl = BASEURL;
    if (path) {
      resultUrl += path;
    }
    if (page > 1) {
      resultUrl += page + "/";
    }
    return resultUrl.replace(/([^:]\/)\/+/g, "$1");
  } catch (e) {
    console.log(e);
    if (slug && slug.indexOf("http") > -1) {
      return slug;
    }
    var fallback = BASEURL + (slug ? "/" + slug : "");
    return fallback.replace(/([^:]\/)\/+/g, "$1");
  }
}

function getUrlSearch(keyword, filtersJson) {
  return BASEURL + "/vi/search/" + encodeURIComponent(keyword) + "/relevance/";
}

// https://www.1porn.tv/vi/categories/4k/5/
// https://www.1porn.tv/vi/search/blacked/relevance/3/

//var BASEURL = "https://motchille.cx";
//var filtersJson = '{page:11,category:[{"slug":"/movies?sort=year_desc&limit=24&category=18-plus","name":"Thiếu niên"}]}'; 
//var filtersJson = '{page:22}';
//getUrlSearch("naruto", filtersJson)
//console.log(getUrlList("https://www.1porn.tv/vi/search/blacked/relevance/", filtersJson));

function getUrlDetail(slug) {
  if (!slug) return "";
  if (slug.indexOf('http') === 0) return slug;
  return BASEURL + "/" + slug;
}

function getUrlCategories() {
  return BASEURL;
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
function parseListResponse(html, $url) {
  try {
    var items = [];
    var $doc = _$(html);
    $doc.find(".item").find("a").each(function() {
      var year = "";
      var lang = "";
      var current = "";
      var href = this.attr("href");
      if (href.indexOf("http") == -1) {
        href = BASEURL + href;
      }
      var quality = this.find('span[class*="is-"]').text();
      var title = this.find("img").attr("alt");
      var src = this.find("img").attr("data-original");
      if (src.indexOf("http") == -1) {
        src = BASEURL + src;
      }

      if (href && href.indexOf("http") > -1) {
        var cleanThumb = src.replace(/&amp;/g, '&');

        items.push({
          "id": href,
          "title": title.trim(),
          "posterUrl": cleanThumb,
          "backdropUrl": cleanThumb,
          "quality": quality,
          "lang": lang,
          "episode_current": current
        });
      }
    });

    return JSON.stringify({
      "items": items,
      "pagination": {
        "currentPage": 1,
        "totalPages": 999
      }
    });

  } catch (e) {
    log(e);
    return JSON.stringify({
      "items": [{
        "id": $url,
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
// https://motchille.cx/danh-sach/4
// https://motchille.cx/the-loai/kinh-di/4
// https://motchille.cx/search/4?q=girl
//var BASEURL = "https://www.xasiat.com";
//var htmlsource = $("#labHtmlEditorWrap #labHtmlTreeContainer .lab-dom-pure-text").html();
//JSON.parse(parseListResponse(outerHTML, BASEURL));
//var html = outerHTML;


function parseSearchResponse(html) {
  return parseListResponse(html);
}

function parseScript(rawScript) {
  const result = {
    success: false,
    data: {},
    embedHtml: ''
  };

  // Kiểm tra đầu vào cơ bản
  if (!rawScript || typeof rawScript !== 'string') {
    return result;
  }

  try {
    // 1. Trích xuất hàm getEmbed nếu bạn cần dùng code iframe của họ
    const embedMatch = rawScript.match(/return\s+('(?:[^'\\]|\\.)*')/);
    if (embedMatch) {
      // Loại bỏ dấu nháy ở đầu/cuối chuỗi iframe được tìm thấy
      result.embedHtml = embedMatch[1].slice(1, -1);
    }

    // 2. Tìm phần nội dung bên trong dấu ngoặc nhọn của biến object (var xxxx = { ... })
    const objectContentMatch = rawScript.match(/var\s+\w+\s*=\s*\{([\s\S]*?)\};/);

    if (objectContentMatch) {
      const objectBody = objectContentMatch[1];

      // 3. Regex quét các cặp key: 'value' hoặc key: value (phòng khi họ bỏ dấu nháy cho số)
      // Group 1: Key, Group 2: Value dạng chuỗi có nháy, Group 3: Value không nháy (số/boolean)
      const pairRegex = /(\w+)\s*:\s*(?:'((?:[^'\\]|\\.)*)'|([^,\s}]+))/g;
      let match;

      while ((match = pairRegex.exec(objectBody)) !== null) {
        const key = match[1];
        let value = match[2] !== undefined ? match[2] : match[3];

        // Nếu là chuỗi, xử lý các ký tự bị escape (ví dụ \' đổi lại thành ')
        if (match[2] !== undefined) {
          value = value.replace(/\\'/g, "'").replace(/\\"/g, '"');
        } else {
          // Nếu là số hoặc boolean thuần (không nằm trong nháy) thì ép kiểu tương ứng
          if (value === 'true') value = true;
          else if (value === 'false') value = false;
          else if (!isNaN(value)) value = Number(value);
        }

        result.data[key] = value;
      }

      // Đánh dấu thành công nếu lấy được dữ liệu
      if (Object.keys(result.data).length > 0) {
        result.success = true;
      }
    }
  } catch (error) {
    // Ghi nhận lỗi nội bộ ra console để debug nhưng KHÔNG làm sập script của bạn
    console.error("SafeParser Error:", error);
  }

  return result;
}

function parseMovieDetail(html, url) {
  cachedMovieDetailId = "";
  try {
    log(url);
    var id = "";
    var lname = "Đang cập nhật...";
    var limg = "";
    var ldes = "Không có mô tả.";
    var category = "";
    var episode_current = "";
    var quality = "";
    var year = 2026;
    var rating = 0;
    var servers = [];
    var extra = "";
    var lactor = "";
    var ldirec = "";
    var lduran = "";
    var status = "";
    var $doc = _$(html);
    var script = $doc.find("script:content('video_categories')").html();
    var $dataVD = parseScript(script);
    if ($dataVD.success == false) {
      return JSON.stringify({
        id: cachedMovieDetailId || url || "error",
        title: "Đây là video riêng tư",
        description: "Video riêng tư nên bi cấm xem đó bạn ơi. Kiếm video khác nhé.",
        posterUrl: "",
        backdropUrl: "",
        servers: []
      });
    }
    var idMatch = /<link\s+rel="canonical"\s+href="([^"]+)"/i.exec(html) ||
      /<meta\s+property="og:url"\s+content="([^"]+)"/i.exec(html);
    id = idMatch ? idMatch[1] : (url || "");

    // Lưu ID vào bộ nhớ tạm toàn cục để Lượt 2 lấy ra đối chiếu
    cachedMovieDetailId = id;
    lname = $dataVD.data.video_title;
    limg = $dataVD.data.preview_url;
    ldes = $dataVD.data.video_tags;
    category = $dataVD.data.video_categories;
    lactor = $dataVD.data.video_models;
    var episodes = [];
    var servers = [];
    if ($dataVD.data.video_alt_url3) {
      var link = $dataVD.data.video_alt_url3;
      episodes.push({
        id: link.replace(/[\s\S]*?http/i, "http") + "#.m3u8",
        name: "Độ Phân Giải " + $dataVD.data.video_alt_url3_text,
        slug: "hd3"
      })
    }
    if ($dataVD.data.video_alt_url2) {
      var link = $dataVD.data.video_alt_url2;
      episodes.push({
        id: link.replace(/[\s\S]*?http/i, "http") + "#.m3u8",
        name: "Độ Phân Giải " + $dataVD.data.video_alt_url2_text,
        slug: "hd2"
      })
    }
    if ($dataVD.data.video_alt_url) {
      var link = $dataVD.data.video_alt_url;
      episodes.push({
        id: link.replace(/[\s\S]*?http/i, "http") + "#.m3u8",
        name: "Độ Phân Giải Cao",
        slug: "hd3"
      })
    }
    if ($dataVD.data.video_url) {
      var link = $dataVD.data.video_url;
      episodes.push({
        id: link.replace(/[\s\S]*?http/i, "http") + "#.m3u8",
        name: "Độ Phân Giải Tháp",
        slug: "hd4"
      })
    }
    servers.push({
      name: "Server",
      episodes: episodes
    })
    log(JSON.stringify(servers))
    return JSON.stringify({
      id: id,
      title: lname,
      posterUrl: limg,
      backdropUrl: limg,
      description: ldes,
      quality: quality,
      year: year,
      rating: rating,
      status: status,
      category: category,
      episode_current: episode_current,
      servers: servers,
      duration: lduran || "",
      casts: lactor || "",
      director: ldirec || "",
      extra: extra
    });

  } catch (e) {
    log(e);
    return JSON.stringify({
      id: cachedMovieDetailId || url || "error",
      title: "error",
      servers: []
    });
  }
}




//BASEURL = "https://phimnganhdc.com";
//var html = outerHTML;
//var $url = "https://phimnganhdc.com/hot-babe-remy-cheats-with-bbc/";
//JSON.parse(parseMovieDetail(outerHTML,$url));


function parseDetailResponse(html, url) {
  try {
    return JSON.stringify({
      "url": "",
      "isEmbed": false,
      "mimeType": "application/x-mpegURL",
      "headers": {
        "Referer": BASEURL,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      "subtitles": []
    });

  } catch (e) {
    return JSON.stringify({
      "url": "",
      "headers": {}
    });
  }
}
/*
var html = outerHTML;
var url = "https://bilutv.asia/phim/kinh-thanh-ky-tham/tap-tap-01-398150?tapplay=12&type=m3u8";
JSON.parse(parseEmbedResponse(html, url))
function textJS(typevideo, checkepi){
    return `
    typevideo = '${typevideo}';
    checkepi = '${checkepi}';
    `
}
*/

function sortEpisodesByName(data) {
  data.forEach(server => {
    if (server.episodes && Array.isArray(server.episodes)) {
      server.episodes.sort((a, b) => {
        // Sử dụng Regex để tìm số đứng ngay sau chữ "Tập" (Không phân biệt hoa thường)
        const matchA = a.name.match(/Tập\s*(\d+)/i);
        const matchB = b.name.match(/Tập\s*(\d+)/i);

        // Nếu tìm thấy số thì chuyển thành kiểu Int, nếu không thấy thì mặc định là 0
        const numA = matchA ? parseInt(matchA[1], 10) : 0;
        const numB = matchB ? parseInt(matchB[1], 10) : 0;

        // Sắp xếp tăng dần: Số nhỏ xếp trước (lên trên), số lớn xếp sau (xuống dưới)
        return numA - numB;
      });
    }
  });
  return data;
}

function parseCategoriesResponse(apiResponseJson) {
  var listurl = getLISTmenu();
  var menulist = buildMenu(listurl);
  return JSON.stringify(menulist);
}

function parseCountriesResponse(html) {
  return "[]";
}

function parseYearsResponse(html) {
  return "[]";
}
// https://k8s.onflixcdn.com/api/movies?sort=year_desc&limit=24&category=chien-tranh

function getLISTmenu() {
  return `[{"link":"/categories/jav-4k/","name":"Hàng 4K"},{"link":"/categories/gravure-idols/","name":"Gravure Idols"},{"link":"/categories/amateur3/","name":"Amateur"},{"link":"/categories/southeast-asia/","name":"Southeast Asia"},{"link":"/categories/jav-uncensored/","name":"JAV Uncensored9508"},{"link":"/categories/jav-amateur/","name":"JAV Amateur"},{"link":"/categories/western-girls/","name":"Western Girls"},{"link":"/categories/china-taiwan/","name":"China & Taiwan"},{"link":"/categories/korea/","name":"South Korea"},{"link":"/categories/jav/","name":"JAV & AV Models"},{"link":"/categories/cosplay/","name":"Cosplay"},{"link":"/categories/","name":"Load more..."},{"link":"/tags/japanese/","name":"japanese"},{"link":"/tags/asian/","name":"asian"},{"link":"/tags/japan/","name":"japan"},{"link":"/tags/onlyfans2/","name":"onlyfans"},{"link":"/tags/beautiful/","name":"beautiful"},{"link":"/tags/creampie/","name":"creampie"},{"link":"/tags/blowjob/","name":"blowjob"},{"link":"/tags/teen/","name":"teen"},{"link":"/tags/big-tits/","name":"big tits"},{"link":"/tags/cute/","name":"cute"},{"link":"/tags/tiny-body/","name":"tiny body"},{"link":"/tags/big-dick/","name":"big dick"},{"link":"/tags/anal/","name":"anal"},{"link":"/tags/slim-body/","name":"slim body"},{"link":"/tags/wife/","name":"wife"},{"link":"/tags/chinese/","name":"chinese"},{"link":"/tags/fc2ppv/","name":"fc2ppv"},{"link":"/tags/slut/","name":"slut"},{"link":"/tags/masturbation/","name":"masturbation"},{"link":"/tags/virgin/","name":"virgin"},{"link":"/tags/black/","name":"black"},{"link":"/tags/student/","name":"student"},{"link":"/tags/babe/","name":"babe"},{"link":"/tags/small-tits/","name":"small tits"},{"link":"/tags/girls/","name":"girls"},{"link":"/tags/thai/","name":"thai"},{"link":"/tags/school/","name":"school"},{"link":"/tags/girlfriend/","name":"girlfriend"},{"link":"/tags/nude/","name":"nude"},{"link":"/tags/brunette/","name":"brunette"},{"link":"/tags/squirting/","name":"squirting"},{"link":"/tags/18-year-old/","name":"18-year-old"},{"link":"/tags/lovepop/","name":"lovepop"},{"link":"/tags/milf/","name":"milf"},{"link":"/tags/china/","name":"china"},{"link":"/tags/dildo/","name":"dildo"},{"link":"/tags/solo/","name":"solo"},{"link":"/tags/graphis/","name":"graphis"},{"link":"/tags/idol/","name":"idol"},{"link":"/tags/homemade/","name":"homemade"},{"link":"/tags/hardcore/","name":"hardcore"},{"link":"/tags/college/","name":"college"},{"link":"/tags/uniform/","name":"uniform"},{"link":"/tags/threesome/","name":"threesome"},{"link":"/tags/boyfriend2/","name":"boyfriend"},{"link":"/tags/teacher/","name":"teacher"},{"link":"/tags/friend/","name":"friend"},{"link":"/tags/20-year-old/","name":"20-year-old"},{"link":"/tags/","name":"Show All Tags"}]`
}

function buildMenu(menuArray, type) {
  var menuArray = JSON.parse(menuArray);
  let menulist = [];
  if (!menuArray || !Array.isArray(menuArray)) return menulist;
  const typeStr = type !== undefined ? String(type).trim() : undefined;
  for (let i = 0; i < menuArray.length; i++) {
    let item = menuArray[i];
    if (!item) continue;
    let link = item.link ? String(item.link).trim() : "";
    let name = item.name ? String(item.name).trim() : "";
    if (!link || !name) continue;
    let menuItem = {};
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
