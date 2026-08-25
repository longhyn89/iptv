// =============================================================
// 1. CẤU HÌNH & MANIFEST
// =============================================================
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
      "playerType": "embed"
    });
  } catch (e) {
    log("getManifest[err]: " + e);
    return JSON.stringify({});
  }
}

// =============================================================
// 2. XỬ LÝ UNWRAP & KHẮC PHỤC MÀN HÌNH ĐEN (BLACK SCREEN FIX)
// =============================================================
(function () {
  'use strict';

  window.__IS_CLEAN_VIDEO_DONE__ = false;

  function bridgeLog(msg) {
    console.log('[SuperOK-Fix] ' + msg);
  }

  function executeUnwrapAndRebuild(inst) {
    if (window.__IS_CLEAN_VIDEO_DONE__) return;

    try {
      bridgeLog('Đang tiến hành tối ưu và làm sạch Player...');
      
      let videoEl = null;
      if (inst && typeof inst.getContainer === 'function') {
        const container = inst.getContainer();
        if (container) videoEl = container.querySelector('video');
      }
      if (!videoEl) {
        videoEl = document.querySelector('video');
      }

      if (!videoEl) {
        bridgeLog('⚠️ Chưa tìm thấy thẻ Video, thử lại sau...');
        return;
      }

      // Đảm bảo CSS hiển thị chuẩn (Tránh kích thước 0x0px gây màn hình đen)
      videoEl.style.cssText = `
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        width: 100% !important;
        height: 100% !important;
        object-fit: contain !important;
        background-color: #000 !important;
      `;

      if (videoEl.parentElement) {
        videoEl.parentElement.style.display = 'block';
        videoEl.parentElement.style.width = '100%';
        videoEl.parentElement.style.height = '100%';
      }

      // Lưu lại trạng thái phát video
      const currentTime = videoEl.currentTime || 0;
      const isPaused = videoEl.paused;
      const currentSrc = videoEl.src || videoEl.currentSrc;

      // Kích hoạt phụ đề nếu có
      setTimeout(() => {
        try {
          if (videoEl.textTracks && videoEl.textTracks.length > 0) {
            for (let i = 0; i < videoEl.textTracks.length; i++) {
              videoEl.textTracks[i].mode = 'showing';
            }
            bridgeLog('✅ ModeTextTrack = showing!');
          }
        } catch (e) {
          bridgeLog('⚠️ Lỗi cấu hình Subtitle: ' + e.message);
        }
      }, 300);

      // Khôi phục Playback nếu nguồn phát bị gián đoạn
      if (currentSrc && (!videoEl.src || videoEl.src === '')) {
        videoEl.src = currentSrc;
        videoEl.currentTime = currentTime;
      }

      if (isPaused) {
        let playPromise = videoEl.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Vượt rào cản chặn Autoplay của trình duyệt
            videoEl.muted = true;
            videoEl.play().catch(err => bridgeLog('Lỗi Play Video: ' + err.message));
          });
        }
      }

      window.__IS_CLEAN_VIDEO_DONE__ = true;
      bridgeLog('🎉 HOÀN TẤT TỐI ƯU VIDEO PLAYER!');

    } catch (e) {
      bridgeLog('❌ Lỗi xử lý Unwrap: ' + e.message);
    }
  }

  function setupHooks(inst) {
    if (!inst || typeof inst.on !== 'function') return;

    inst.on('firstFrame', function () {
      bridgeLog('🎬 Bắt được event firstFrame!');
      setTimeout(() => executeUnwrapAndRebuild(inst), 100);
    });

    inst.on('play', function () {
      bridgeLog('▶️ Bắt được event play!');
      setTimeout(() => executeUnwrapAndRebuild(inst), 200);
    });

    inst.on('ready', function () {
      bridgeLog('⚡ Player Ready!');
      setTimeout(() => executeUnwrapAndRebuild(inst), 300);
    });
  }

  const watcher = setInterval(() => {
    if (window.__IS_CLEAN_VIDEO_DONE__) {
      clearInterval(watcher);
      return;
    }

    // 1. Kiểm tra JWPlayer
    if (typeof window.jwplayer === 'function') {
      try {
        const inst = window.jwplayer();
        if (inst && typeof inst.on === 'function') {
          setupHooks(inst);
          clearInterval(watcher);
          return;
        }
      } catch (e) {}
    }

    // 2. Kiểm tra Thẻ Video thuần HTML5
    const rawVideo = document.querySelector('video');
    if (rawVideo && rawVideo.readyState >= 2) {
      executeUnwrapAndRebuild(null);
      clearInterval(watcher);
    }
  }, 250);

})();

// =============================================================
// 3. TRÌNH PHÂN TÍCH HTML (MINIJQ PARSER FULL)
// =============================================================
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

          if (!isSelfClosing) stack.push(nodeId);
        }
      }

      let remainingText = html.slice(lastIndex).trim();
      if (remainingText && stack.length > 0) {
        let parentId = stack[stack.length - 1];
        let textId = nodes.length;
        nodes.push({ id: textId, tag: "#text", text: remainingText, attrs: {}, childrenIds: [], parentId: parentId });
        nodes[parentId].childrenIds.push(textId);
      }
    } catch (err) {
      if (typeof window !== "undefined" && window.log) window.log("parseHTML error: " + err.message);
    }
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
          if (!elClasses.includes(c.substring(1))) return false;
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
      if (!keywords.some(kw => fullText.toLowerCase().includes(kw))) return false;
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
        if (matchSingleSelector(current, selector, nodes)) results.push(current);
      }
      if (current.childrenIds) {
        for (let cid of current.childrenIds) search(cid, depth + 1);
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

  function MiniJQ(elements, nodesStore) {
    this.elements = Array.isArray(elements) ? elements : (elements ? [elements] : []);
    this.nodes = nodesStore || [];
    this.length = this.elements.length;
  }

  MiniJQ.prototype = {
    find: function (selector) {
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
    text: function () {
      if (this.elements.length === 0) return "";
      return getNodeText(this.elements[0], this.nodes, 0);
    },
    html: function () {
      if (this.elements.length === 0) return "";
      let self = this;
      let serialize = function (nodeId, depth) {
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
    attr: function (name, value) {
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
    each: function (callback) {
      if (typeof callback !== 'function') return this;
      this.elements.forEach((el, index) => {
        let jqEl = new MiniJQ([el], this.nodes);
        callback.call(jqEl, index, jqEl);
      });
      return this;
    },
    textAll: function (delimiter) {
      if (delimiter === undefined) delimiter = " ";
      let texts = [];
      for (let el of this.elements) {
        texts.push(getNodeText(el, this.nodes, 0));
      }
      return texts.join(delimiter);
    },
    first: function () { return new MiniJQ(this.elements.length > 0 ? [this.elements[0]] : [], this.nodes); },
    last: function () { return new MiniJQ(this.elements.length > 0 ? [this.elements[this.elements.length - 1]] : [], this.nodes); },
    eq: function (index) { return new MiniJQ(this.elements[index] ? [this.elements[index]] : [], this.nodes); },
    parent: function () {
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
    next: function () {
      let nexts = [];
      for (let el of this.elements) {
        if (!el || el.parentId === null) continue;
        let pNode = this.nodes[el.parentId];
        if (!pNode) continue;
        let siblings = pNode.childrenIds.map(cid => this.nodes[cid]).filter(c => c && c.tag !== "#text");
        let idx = siblings.findIndex(s => s.id === el.id);
        if (idx !== -1 && idx + 1 < siblings.length) nexts.push(siblings[idx + 1]);
      }
      return new MiniJQ(nexts, this.nodes);
    },
    before: function () {
      let befores = [];
      for (let el of this.elements) {
        if (!el || el.parentId === null) continue;
        let pNode = this.nodes[el.parentId];
        if (!pNode) continue;
        let siblings = pNode.childrenIds.map(cid => this.nodes[cid]).filter(c => c && c.tag !== "#text");
        let idx = siblings.findIndex(s => s.id === el.id);
        if (idx > 0) befores.push(siblings[idx - 1]);
      }
      return new MiniJQ(befores, this.nodes);
    },
    after: function () { return this.next(); },
    closest: function (selector) {
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

// =============================================================
// 4. TIỆN ÍCH MÃ HÓA BASE64 & CHECK RAW
// =============================================================
var BASE64 = {
  encode: function (str) {
    try {
      if (!str) return "";
      var utf8Bytes = [];
      for (var i = 0; i < str.length; i++) {
        var code = str.charCodeAt(i);
        if (code < 128) {
          utf8Bytes.push(code);
        } else if (code < 2048) {
          utf8Bytes.push((code >> 6) | 192, (code & 63) | 128);
        } else if ((code & 0xfc00) === 0xd800 && i + 1 < str.length && (str.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
          code = 0x10000 + ((code & 0x03ff) << 10) + (str.charCodeAt(++i) & 0x03ff);
          utf8Bytes.push((code >> 18) | 240, ((code >> 12) & 63) | 128, ((code >> 6) & 63) | 128, (code & 63) | 128);
        } else {
          utf8Bytes.push((code >> 12) | 224, ((code >> 6) & 63) | 128, (code & 63) | 128);
        }
      }
      var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      var encoded = "";
      var byte1, byte2, byte3;
      var b1, b2, b3, b4;

      for (var j = 0; j < utf8Bytes.length; j += 3) {
        byte1 = utf8Bytes[j];
        byte2 = j + 1 < utf8Bytes.length ? utf8Bytes[j + 1] : NaN;
        byte3 = j + 2 < utf8Bytes.length ? utf8Bytes[j + 2] : NaN;

        b1 = byte1 >> 2;
        b2 = ((byte1 & 3) << 4) | (isNaN(byte2) ? 0 : byte2 >> 4);
        b3 = isNaN(byte2) ? 64 : ((byte2 & 15) << 2) | (isNaN(byte3) ? 0 : byte3 >> 6);
        b4 = isNaN(byte3) ? 64 : byte3 & 63;

        encoded += chars.charAt(b1) + chars.charAt(b2) + chars.charAt(b3) + chars.charAt(b4);
      }
      return encoded;
    } catch (e) {
      console.log("[BASE64.encode Error]:", e.message || e);
      return "";
    }
  },

  decode: function (base64String) {
    try {
      if (!base64String) return "";
      var str = decodeURIComponent(base64String.trim()).replace(/-/g, "+").replace(/_/g, "/");
      var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      var output = [];
      var buffer = 0, bits = 0;

      for (var i = 0; i < str.length; i++) {
        var char = str.charAt(i);
        if (char === "=") break;
        var index = chars.indexOf(char);
        if (index === -1) continue;

        buffer = (buffer << 6) | index;
        bits += 6;

        if (bits >= 8) {
          bits -= 8;
          output.push((buffer >> bits) & 0xff);
        }
      }

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
          result += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        } else if (c >= 240) {
          var c2 = output[j++];
          var c3 = output[j++];
          var c4 = output[j++];
          var u = (((c & 7) << 18) | ((c2 & 63) << 12) | ((c3 & 63) << 6) | (c4 & 63)) - 0x10000;
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
    if (!scriptStr || typeof scriptStr !== "string") return scriptStr || "";
    var lines = scriptStr.split("\n");
    var fixedLines = [];

    for (var i = 0; i < lines.length; i++) {
      var currentLine = lines[i];
      var fixedLine = currentLine;
      if (returnFixed) {
        fixedLine = fixedLine.replace(/\r/g, "").replace(/\t/g, "  ");
      }
      fixedLines.push(fixedLine);
    }

    try {
      new Function(scriptStr);
    } catch (syntaxErr) {
      console.log("[checkRaw] SyntaxError: " + syntaxErr.message);
    }

    return returnFixed ? fixedLines.join("\n") : scriptStr;
  } catch (e) {
    return scriptStr;
  }
}

function decodeHTMLtext(str) {
  try {
    if (!str) return "";
    return str.replace(/&#(\d+);|&#x([0-9a-fA-F]+);/g, (match, dec, hex) => {
      if (dec) return String.fromCharCode(parseInt(dec, 10));
      if (hex) return String.fromCharCode(parseInt(hex, 16));
      return match;
    });
  } catch (e) {
    log("decodeHTMLtext[err]: " + e);
  }
}

function clearJS(func) {
  if (typeof func !== "function") return "";
  var funcStr = func.toString();
  var match = funcStr.match(/\{([\s\S]*)\}/);
  if (!match) return "";
  return checkRaw(match[1].trim(), true);
}
// =============================================================
// 5. CÁC HÀM HỖ TRỢ DANH MỤC, MENU & BỘ LỌC
// =============================================================
function iframe64(url) {
  var html = `
  <html>
    <head>
      <style>
        body, html { margin: 0; padding: 0; width: 100%; height: 100%; background: #000; overflow: hidden; }
        iframe { width: 100%; height: 100%; border: 0; object-fit: contain; }
      </style>
    </head>
    <body>
      <iframe id='player' src='${url}' scrolling='no' frameborder='0' class='openloadvideo lab-pinned-child' allowfullscreen='true' webkitallowfullscreen='true' mozallowfullscreen='true' name='watch'></iframe>
    </body>
  </html>`;
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
  try { return ""; } catch (e) { log("getUrlCountries[err]:\n " + e); return ""; }
}

function getUrlYears() {
  try { return ""; } catch (e) { log("getUrlYears[err]:\n " + e); return ""; }
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

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }

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

function getFilterConfig() {
  try {
    var listurl = getLISTmenu();
    var menulist = buildMenu(listurl);
    return JSON.stringify({ category: menulist });
  } catch (e) {
    log("getFilterConfig[err]:\n " + e);
    return JSON.stringify({ category: [] });
  }
}

function buildMenu(menuStr, type) {
  try {
    var menuArray = typeof menuStr === 'string' ? JSON.parse(menuStr) : menuStr;
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
        menuItem = { "slug": link, "title": name, "type": "Horizontal" };
      } else if (typeStr === "true") {
        menuItem = { "slug": link, "title": name, "type": "Grid" };
      } else {
        menuItem = { "slug": link, "name": name };
      }
      menulist.push(menuItem);
    }
    return menulist;
  } catch (e) {
    log("buildMenu[err]: " + e);
    return [];
  }
}

// =============================================================
// 6. DANH SÁCH MENU MẶC ĐỊNH (LISTMENU)
// =============================================================
function getLISTmenu() {
  return JSON.stringify([
    { "name": "Phim Mới Nhất", "link": "danh-sach/phim-moi" },
    { "name": "Phim Lẻ", "link": "danh-sach/phim-le" },
    { "name": "Phim Bộ", "link": "danh-sach/phim-bo" },
    { "name": "Hoạt Hình", "link": "danh-sach/hoat-hinh" },
    { "name": "TV Shows", "link": "danh-sach/tv-shows" },
    { "name": "Phim Vietsub", "link": "danh-sach/phim-vietsub" },
    { "name": "Phim Thuyết Minh", "link": "danh-sach/phim-thuyet-minh" },
    { "name": "Phim Lồng Tiếng", "link": "danh-sach/phim-long-tieng" }
  ]);
}

// =============================================================
// 7. XỬ LÝ LẤY DANH SÁCH, PHÂN TRANG & TÌM KIẾM
// =============================================================
function getUrlList(slug, page) {
  try {
    if (!slug) return "";
    var pageNum = page ? parseInt(page, 10) : 1;
    var listUrl = "";

    if (slug.indexOf('http') === 0) {
      listUrl = slug;
    } else {
      listUrl = BASEURL + "/" + slug;
    }

    if (pageNum > 1) {
      if (listUrl.indexOf('?') !== -1) {
        listUrl += "&page=" + pageNum;
      } else {
        listUrl += "?page=" + pageNum;
      }
    }

    log("getUrlList[url]: \n" + listUrl);
    return listUrl;
  } catch (e) {
    log("getUrlList[err]:\n " + e);
    return "";
  }
}

function parseListResponse(html, url) {
  try {
    var $ = _$(html);
    var items = [];
    var currentPage = 1;
    var totalPages = 1;

    // Lấy thông tin phân trang
    var activePage = $(".pagination .active, .pagination .current, .pagination .page-item.active").text().trim();
    if (activePage) currentPage = parseInt(activePage, 10) || 1;

    var lastPageLink = $(".pagination a").last().attr("href") || "";
    if (lastPageLink) {
      var matchPage = lastPageLink.match(/page[=\/](\d+)/i);
      if (matchPage) totalPages = parseInt(matchPage[1], 10) || 1;
    }

    // Lấy danh sách phim
    $(".movie-item, .film-item, .item-movie, .col-item, article").each(function () {
      var $item = _$(this);
      var linkEl = $item.find("a").first();
      var href = linkEl.attr("href") || "";
      var title = $item.find(".title, .film-name, h3, h2").text().trim() || linkEl.attr("title") || "";
      var poster = $item.find("img").attr("src") || $item.find("img").attr("data-src") || "";

      if (href && title) {
        var slug = href.replace(BASEURL, "").replace(/^\/+/, "");
        items.push({
          "title": decodeHTMLtext(title),
          "slug": slug,
          "posterUrl": poster,
          "type": "MOVIE"
        });
      }
    });

    log("parseListResponse count: " + items.length);
    return JSON.stringify({
      "items": items,
      "pagination": {
        "currentPage": currentPage,
        "totalPages": totalPages
      }
    });
  } catch (e) {
    log("parseListResponse[err]: " + e);
    return JSON.stringify({
      "items": [],
      "pagination": { "currentPage": 1, "totalPages": 1 }
    });
  }
}

function getUrlSearch(keyword, page) {
  try {
    var pageNum = page ? parseInt(page, 10) : 1;
    var searchUrl = BASEURL + "/tim-kiem?keyword=" + encodeURIComponent(keyword);
    if (pageNum > 1) searchUrl += "&page=" + pageNum;
    log("getUrlSearch[url]: \n" + searchUrl);
    return searchUrl;
  } catch (e) {
    log("getUrlSearch[err]: " + e);
    return "";
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
      "pagination": { "currentPage": 1, "totalPages": 1 }
    });
  }
}
// =============================================================
// 8. XỬ LÝ CHI TIẾT PHIM & DANH SÁCH TẬP (EPISODES)
// =============================================================
function parseDetailResponse(html, url) {
  try {
    var $ = _$(html);
    
    // Lấy thông tin cơ bản
    var title = $(".movie-title, .film-info h1, .title-m").first().text().trim();
    var origTitle = $(".movie-org-title, .alias-name, .sub-title").first().text().trim();
    var poster = $(".movie-poster img, .poster img").attr("src") || $(".movie-poster img, .poster img").attr("data-src") || "";
    var description = $(".movie-description, .film-content, #description").text().trim();
    
    // Bóc tách danh sách tập phim
    var episodes = [];
    var $epElements = $(".list-episodes a, .episodes-list a, .list-server a");

    if ($epElements.length > 0) {
      $epElements.each(function (idx) {
        var $ep = _$(this);
        var epName = $ep.text().trim() || ("Tập " + (idx + 1));
        var epLink = $ep.attr("href") || "";

        if (epLink) {
          var epSlug = epLink.replace(BASEURL, "").replace(/^\/+/, "");
          episodes.push({
            "name": epName,
            "slug": epSlug,
            "embedUrl": ""
          });
        }
      });
    } else {
      // Trường hợp phim lẻ hoặc 1 tập duy nhất
      episodes.push({
        "name": "Full",
        "slug": url.replace(BASEURL, "").replace(/^\/+/, ""),
        "embedUrl": ""
      });
    }

    var movieDetail = {
      "title": decodeHTMLtext(title),
      "originalName": decodeHTMLtext(origTitle),
      "posterUrl": poster,
      "description": decodeHTMLtext(description),
      "episodes": episodes
    };

    log("parseDetailResponse success: " + title);
    return JSON.stringify(movieDetail);
  } catch (e) {
    log("parseDetailResponse[err]: " + e);
    return JSON.stringify({});
  }
}

// =============================================================
// 9. XỬ LÝ NGUỒN PHÁT (PLAYLINK / EMBED)
// =============================================================
function getUrlPlay(slug) {
  try {
    if (!slug) return "";
    if (slug.indexOf('http') === 0) return slug;
    var playUrl = BASEURL + "/" + slug;
    log("getUrlPlay[url]: \n" + playUrl);
    return playUrl;
  } catch (e) {
    log("getUrlPlay[err]: " + e);
    return "";
  }
}

function parsePlayResponse(html, url) {
  try {
    var $ = _$(html);
    var embedUrl = $("iframe#player, iframe.player-embed, .watch-iframe iframe").attr("src") || "";

    if (!embedUrl) {
      // Tìm link trong thẻ script nếu có player dạng JS
      var match = html.match(/file\s*:\s*["']([^"']+)["']/i) || html.match(/src\s*:\s*["']([^"']+)["']/i);
      if (match) embedUrl = match[1];
    }

    log("parsePlayResponse embedUrl: " + embedUrl);

    if (embedUrl) {
      // Nếu link dạng iframe truyền thống, có thể bọc qua iframe64 nếu cần
      if (embedUrl.indexOf("http") !== 0) {
        embedUrl = "https:" + embedUrl;
      }
      
      return JSON.stringify({
        "playUrl": embedUrl,
        "type": "embed"
      });
    }

    return JSON.stringify({});
  } catch (e) {
    log("parsePlayResponse[err]: " + e);
    return JSON.stringify({});
  }
}

// =============================================================
// 10. HÀM PHỤ TRỢ GIẢI MÃ KÝ TỰ HTML (DECODE)
// =============================================================
function decodeHTMLtext(str) {
  if (!str) return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ");
}
