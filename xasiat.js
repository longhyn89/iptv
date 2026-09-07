BASEURL = "https://www.xasiat.ws";

function getManifest() {
  return JSON.stringify({
    "id": "xasiat",
    "name": "[XXX] XXX Châu Á",
    "description": "XXX Hay",
    "version": "1.1.5",
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
    nativeLog("[xasiat] " + msg);
  } else if (typeof console !== 'undefined' && console.log) {
    console.log("[xasiat] " + msg);
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
    log(e);
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
// PARSERS (Đã sửa bộ chọn selector linh hoạt hơn)
// =============================================================================
function parseListResponse(html, $url) {
  try {
    var items = [];
    var $doc = _$(html);
    
    // Mở rộng selector để bắt được nhiều dạng khung item khác nhau trên web
    var $elements = $doc.find(".item, .video-item, .thumb, article");
    if ($elements.length === 0) {
      $elements = $doc.find("a"); // Fallback nếu cấu trúc đơn giản hóa
    }

    $elements.each(function() {
      var href = this.attr("href");
      if (!href) return;
      
      if (href.indexOf("http") == -1) {
        href = BASEURL + (href.startsWith("/") ? "" : "/") + href;
      }
      
      var quality = this.find('span[class*="is-"], .quality, .badge').text();
      var imgTag = this.find("img");
      var title = imgTag.attr("alt") || this.attr("title") || this.text();
      
      // Hỗ trợ lấy link ảnh từ nhiều thuộc tính khác nhau (data-original, data-src, src)
      var src = imgTag.attr("data-original") || imgTag.attr("data-src") || imgTag.attr("src") || "";
      
      if (src && src.indexOf("http") == -1) {
        src = BASEURL + (src.startsWith("/") ? "" : "/") + src;
      }

      if (href && href.indexOf("http") > -1 && title) {
        var cleanThumb = src.replace(/&amp;/g, '&');

        items.push({
          "id": href,
          "title": title.trim(),
          "posterUrl": cleanThumb,
          "backdropUrl": cleanThumb,
          "quality": quality ? quality.trim() : "",
          "lang": "",
          "episode_current": ""
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
    log("parseListResponse error: " + e);
    return JSON.stringify({
      "items": [],
      "pagination": {
        "currentPage": 1,
        "totalPages": 1
      }
    });
  }
}

function parseSearchResponse(html) {
  return parseListResponse(html);
}

function parseScript(rawScript) {
  const result = {
    success: false,
    data: {},
    embedHtml: ''
  };

  if (!rawScript || typeof rawScript !== 'string') {
    return result;
  }

  try {
    const embedMatch = rawScript.match(/return\s+('(?:[^'\\]|\\.)*')/);
    if (embedMatch) {
      result.embedHtml = embedMatch[1].slice(1, -1);
    }

    const objectContentMatch = rawScript.match(/var\s+\w+\s*=\s*\{([\s\S]*?)\};/);

    if (objectContentMatch) {
      const objectBody = objectContentMatch[1];
      const pairRegex = /(\w+)\s*:\s*(?:'((?:[^'\\]|\\.)*)'|([^,\s}]+))/g;
      let match;

      while ((match = pairRegex.exec(objectBody)) !== null) {
        const key = match[1];
        let value = match[2] !== undefined ? match[2] : match[3];

        if (match[2] !== undefined) {
          value = value.replace(/\\'/g, "'").replace(/\\"/g, '"');
        } else {
          if (value === 'true') value = true;
          else if (value === 'false') value = false;
          else if (!isNaN(value)) value = Number(value);
        }

        result.data[key] = value;
      }

      if (Object.keys(result.data).length > 0) {
        result.success = true;
      }
    }
  } catch (error) {
    console.error("SafeParser Error:", error);
  }

  return result;
}

function parseMovieDetail(html, url) {
  var cachedMovieDetailId = "";
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
        id: url || "error",
        title: "Không thể tải video",
        description: "Không tìm thấy dữ liệu kịch bản video hoặc video riêng tư.",
        posterUrl: "",
        backdropUrl: "",
        servers: []
      });
    }
    
    var idMatch = /<link\s+rel="canonical"\s+href="([^"]+)"/i.exec(html) ||
      /<meta\s+property="og:url"\s+content="([^"]+)"/i.exec(html);
    id = idMatch ? idMatch[1] : (url || "");

    cachedMovieDetailId = id;
    lname = $dataVD.data.video_title || "Video";
    limg = $dataVD.data.preview_url || "";
    ldes = $dataVD.data.video_tags || "";
    category = $dataVD.data.video_categories || "";
    lactor = $dataVD.data.video_models || "";
    
    var episodes = [];
    if ($dataVD.data.video_alt_url3) {
      var link = $dataVD.data.video_alt_url3;
      episodes.push({
        id: link.replace(/[\s\S]*?http/i, "http") + "#.m3u8",
        name: "Độ Phân Giải " + ($dataVD.data.video_alt_url3_text || "HD 3"),
        slug: "hd3"
      });
    }
    if ($dataVD.data.video_alt_url2) {
      var link = $dataVD.data.video_alt_url2;
      episodes.push({
        id: link.replace(/[\s\S]*?http/i, "http") + "#.m3u8",
        name: "Độ Phân Giải " + ($dataVD.data.video_alt_url2_text || "HD 2"),
        slug: "hd2"
      });
    }
    if ($dataVD.data.video_alt_url) {
      var link = $dataVD.data.video_alt_url;
      episodes.push({
        id: link.replace(/[\s\S]*?http/i, "http") + "#.m3u8",
        name: "Độ Phân Giải Cao",
        slug: "hd1"
      });
    }
    if ($dataVD.data.video_url) {
      var link = $dataVD.data.video_url;
      episodes.push({
        id: link.replace(/[\s\S]*?http/i, "http") + "#.m3u8",
        name: "Độ Phân Giải Thấp",
        slug: "sd"
      });
    }
    
    if (episodes.length > 0) {
      servers.push({
        name: "Server Chính",
        episodes: episodes
      });
    }

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
    log("parseMovieDetail error: " + e);
    return JSON.stringify({
      id: url || "error",
      title: "Lỗi phân tích",
      servers: []
    });
  }
}

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

function getLISTmenu() {
  return `[{"link":"/categories/jav-4k/","name":"Hàng 4K"},{"link":"/categories/gravure-idols/","name":"Gravure Idols"},{"link":"/categories/amateur3/","name":"Amateur"},{"link":"/categories/southeast-asia/","name":"Southeast Asia"},{"link":"/categories/jav-uncensored/","name":"JAV Uncensored"},{"link":"/categories/jav-amateur/","name":"JAV Amateur"},{"link":"/categories/western-girls/","name":"Western Girls"},{"link":"/categories/china-taiwan/","name":"China & Taiwan"},{"link":"/categories/korea/","name":"South Korea"},{"link":"/categories/jav/","name":"JAV & AV Models"},{"link":"/categories/cosplay/","name":"Cosplay"}]`;
}

function buildMenu(menuArray, type) {
  try {
    var menuObj = typeof menuArray === 'string' ? JSON.parse(menuArray) : menuArray;
    let menulist = [];
    if (!menuObj || !Array.isArray(menuObj)) return menulist;
    const typeStr = type !== undefined ? String(type).trim() : undefined;
    
    for (let i = 0; i < menuObj.length; i++) {
      let item = menuObj[i];
      if (!item) continue;
      let link = item.link ? String(item.link).trim() : "";
      let name = item.name ? String(item.name).trim() : "";
      if (!link || !name) continue;
      
      let menuItem = {};
      if (typeStr === "false") {
        menuItem = { "slug": link, "title": name, "type": "Horizontal" };
      } else if (typeStr === "true") {
        menuItem = { "slug": link, "title": name, "type": "Grid" };
      } else {
        menuItem = { "slug": link, "name": name };
      }
      menulist.push(menuItem);
    }
    return menulist;
  } catch(err) {
    return [];
  }
}

// =============================================================================
// MINI-JQUERY ENGINE (Giữ nguyên cấu trúc phân tích DOM)
// =============================================================================
function _$(param) {
  function parseHTML(htmlString) {
    let nodes = [];
    let root = { id: 0, tag: "ROOT", attrs: {}, childrenIds: [], parentId: null };
    nodes.push(root);

    try {
      let html = (htmlString || "").trim();
      if (!html) return { root, nodes };

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
          nodes.push({ id: textId, tag: "#text", text: textBefore, attrs: {}, childrenIds: [], parentId: parentId });
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
          let node = { id: nodeId, tag: tagName, attrs: attrs, childrenIds: [], parentId: parentId };
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
        nodes.push({ id: textId, tag: "#text", text: remainingText, attrs: {}, childrenIds: [], parentId: parentId });
        nodes[parentId].childrenIds.push(textId);
      }
    } catch (err) {}
    return { root, nodes };
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

  function matchSingleSelector(node, sel, nodes) {
    if (!node || node.tag === "#text" || node.tag === "ROOT") return false;
    let cleanSel = sel.replace(/:first|:last|:eq\([0-9]+\)/gi, "").trim();

    let pseudoContentArg = null;
    let contentMatch = cleanSel.match(/:content\((['"]?)(.*?)\1\)/i);
    if (contentMatch) {
      pseudoContentArg = contentMatch[2];
      cleanSel = cleanSel.replace(contentMatch[0], "").trim();
    }

    if (cleanSel && cleanSel !== "*") {
      let tagMatch = cleanSel.match(/^[a-zA-Z0-9_-]+/);
      if (tagMatch && node.tag !== tagMatch[0].toLowerCase()) return false;

      let idMatch = cleanSel.match(/#([a-zA-Z0-9_-]+)/);
      if (idMatch && (!node.attrs || node.attrs.id !== idMatch[1])) return false;

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
      return querySelectorAllSingleLevel(startNode, selector, nodes);
    } catch (err) {
      return [];
    }
  }

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
    attr: function(name) {
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
    }
  };

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
