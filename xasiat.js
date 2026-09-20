// =============================================================================
// CẤU HÌNH CƠ BẢN
// =============================================================================
var BASEURL = "https://www.xasiat.ws";

function _isArray(arr) {
    return Object.prototype.toString.call(arr) === '[object Array]';
}

function _trim(str) {
    if (!str) return "";
    return String(str).replace(/^\s+|\s+$/g, '');
}

function log(msg) {
    if (typeof nativeLog !== 'undefined') {
        nativeLog("[XAsiat] " + msg);
    } else if (typeof console !== 'undefined' && console.log) {
        console.log("[XAsiat] " + msg);
    }
}

// =============================================================================
// THÔNG TIN APP & MENU
// =============================================================================
function getManifest() {
    return JSON.stringify({
        "id": "xasiat",
        "name": "XXX Châu Á",
        "description": "Kho video XXX Châu Á tổng hợp đa dạng.",
        "info": "Kho video XXX Châu Á tổng hợp đa dạng.",
        "version": "1.0.7",
        "baseUrl": BASEURL,
        "iconUrl": "https://raw.githubusercontent.com/hieu-TQS/movie-SuperOK/refs/heads/main/icons/xasiat.png",
        "isEnabled": true,
        "isAdult": true,
        "type": "MOVIE",
        "playerType": "exoplayer"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { "slug": "/latest-updates/", "title": "Hàng Mới", "type": "Grid" },
        { "slug": "/categories/jav-4k/", "title": "Hàng 4K", "type": "Horizontal" },
        { "slug": "/categories/jav-uncensored/", "title": "JAV Không Che", "type": "Horizontal" },
        { "slug": "/categories/china-taiwan/", "title": "Trung & Đài", "type": "Horizontal" },
        { "slug": "/categories/korea/", "title": "Hàn Quốc", "type": "Horizontal" }
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
        "category": menulist
    });
}

// =============================================================================
// QUẢN LÝ URL
// =============================================================================
function getUrlList(slug, filtersJson) {
    try {
        var page = 1;
        var path = slug || "";
        
        if (filtersJson) {
            try {
                var filters = typeof filtersJson === 'object' ? filtersJson : JSON.parse(filtersJson);
                page = parseInt(filters.page, 10) || 1;
                if (filters.category) {
                    if (_isArray(filters.category) && filters.category.length > 0) {
                        path = filters.category[0].slug || filters.category[0].id || "";
                    } else if (typeof filters.category === 'string') {
                        path = filters.category;
                    }
                }
            } catch (jsonErr) {}
        }
        
        if (!path) path = "/latest-updates/";
        
        var fullUrl = path;
        if (fullUrl.indexOf("http") !== 0) {
            fullUrl = BASEURL + (fullUrl.charAt(0) === '/' ? fullUrl : '/' + fullUrl);
        }
        
        if (fullUrl.indexOf("?") !== -1) {
            fullUrl = fullUrl.substring(0, fullUrl.indexOf("?"));
        }
        
        if (fullUrl.slice(-1) === '/') fullUrl = fullUrl.slice(0, -1);
        
        if (fullUrl.indexOf("/search/") !== -1) {
            if (page > 1) return fullUrl + "/?from_videos=" + page;
            return fullUrl + "/";
        }
        
        if (page > 1) return fullUrl + "/" + page + "/";
        return fullUrl + "/";
    } catch (e) {
        return BASEURL + "/latest-updates/";
    }
}

function getUrlSearch(keyword, filtersJson) {
    var page = 1;
    if (filtersJson) {
        try {
            var filters = typeof filtersJson === 'object' ? filtersJson : JSON.parse(filtersJson);
            page = parseInt(filters.page, 10) || 1;
        } catch (e) {}
    }
    var cleanKeyword = encodeURIComponent(keyword || "").replace(/%20/g, "+");
    if (page > 1) {
        return BASEURL + "/search/" + cleanKeyword + "/?from_videos=" + page;
    }
    return BASEURL + "/search/" + cleanKeyword + "/";
}

function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.indexOf('http') === 0) return slug;
    return BASEURL + "/" + slug;
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS DỮ LIỆU
// =============================================================================
function parseListResponse(html, $url) {
    try {
        var items = [];
        _$(html).find(".item").find("a").each(function() {
            var current = this.find(".duration").text() || "";
            var href = this.attr("href") || "";
            if (href.indexOf("http") == -1) {
                href = BASEURL + (href.charAt(0) === '/' ? href : '/' + href);
            }
            var quality = this.find('span[class*="is-"]').text() || "";
            var title = this.find("strong.title").text() || this.find("img").attr("alt") || this.attr("title") || "";
            var src = this.find("img").attr("data-original") || this.find("img").attr("data-webp") || this.find("img").attr("src") || "";
            
            if (src && src.indexOf("http") == -1) {
                src = BASEURL + (src.charAt(0) === '/' ? src : '/' + src);
            }
            
            if (href && href.indexOf("http") > -1) {
                var cleanThumb = src.replace(/&amp;/g, '&');
                items.push({
                    "id": href,
                    "title": _trim(title),
                    "posterUrl": cleanThumb,
                    "backdropUrl": cleanThumb,
                    "quality": _trim(quality),
                    "lang": "",
                    "episode_current": _trim(current)
                });
            }
        });
        
        return JSON.stringify({
            "items": items,
            "pagination": { "currentPage": 1, "totalPages": 999 }
        });
    } catch (e) {
        return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1 } });
    }
}

function parseSearchResponse(html, $url) {
    return parseListResponse(html, $url);
}

function parseMovieDetail(html, url) {
    try {
        var id = "";
        var lname = "Đang cập nhật...";
        var limg = "";
        var ldes = "Không có mô tả.";
        var category = "";
        var highQualityEpisodes = []; // Server 1: 4K / FHD / HD
        var sdQualityEpisodes = [];   // Server 2: SD / Cơ bản
        var foundUrls = [];

        var idMatch = /<link\s+rel="canonical"\s+href="([^"]+)"/i.exec(html) ||
            /<meta\s+property="og:url"\s+content="([^"]+)"/i.exec(html);
        id = idMatch ? idMatch[1] : (url || "");

        var getField = function(name) {
            var m1 = html.match(new RegExp("\\b" + name + "\\b\\s*[:=]\\s*'((?:[^'\\\\]|\\\\.)*)'"));
            if (m1) return m1[1].replace(/\\'/g, "'").replace(/\\"/g, '"');
            var m2 = html.match(new RegExp("\\b" + name + "\\b\\s*[:=]\\s*\"((?:[^\"\\\\]|\\\\.)*)\""));
            if (m2) return m2[1].replace(/\\'/g, "'").replace(/\\"/g, '"');
            return "";
        };

        var titleMatch = html.match(/<title>([^<]+)<\/title>/i);
        lname = getField('video_title') || (titleMatch ? titleMatch[1] : lname);
        limg = getField('preview_url') || getField('preview_url3') || getField('preview_url1') || "";
        ldes = getField('video_tags') || "Không có mô tả.";
        category = getField('video_categories') || "";

        var extractAndPush = function(keys, epName, isHighQuality) {
            for (var i = 0; i < keys.length; i++) {
                var vUrl = getField(keys[i]);
                if (vUrl) {
                    if (vUrl.indexOf('%3A') !== -1 || vUrl.indexOf('%2F') !== -1) {
                        try { vUrl = decodeURIComponent(vUrl); } catch(e){}
                    }
                    if (vUrl.indexOf("http") !== -1 || vUrl.indexOf("//") === 0) {
                        if (vUrl.indexOf("//") === 0) vUrl = "https:" + vUrl;
                        var cleanUrl = vUrl.replace(/[\s\S]*?http/i, "http");
                        if (foundUrls.indexOf(cleanUrl) === -1) {
                            foundUrls.push(cleanUrl);
                            var safeId = BASEURL + "/?direct_play=" + encodeURIComponent(cleanUrl);
                            var epObj = { id: safeId, name: epName, slug: "full" };
                            if (isHighQuality) {
                                highQualityEpisodes.push(epObj);
                            } else {
                                sdQualityEpisodes.push(epObj);
                            }
                        }
                    }
                }
            }
        };

        // Gom các biến chất lượng cao vào Server 1
        extractAndPush(['video_alt_url4', 'video_url_4k'], '4K Ultra HD', true);
        extractAndPush(['video_alt_url3', 'video_url_2160p'], '2160p / 4K', true);
        extractAndPush(['video_alt_url2', 'video_url_1080p'], '1080p / Full HD', true);
        extractAndPush(['video_alt_url', 'video_url_hd'], '720p / HD', true);

        // Gom biến chất lượng thấp vào Server 2
        extractAndPush(['video_url', 'video_url_sd'], 'SD / 480p', false);

        // Fallback quét thẻ <source> trong HTML5
        var sourceRegex = /<source\s+[^>]*src=["']([^"']+)["'][^>]*>/gi;
        var srcMatch;
        while ((srcMatch = sourceRegex.exec(html)) !== null) {
            var sUrl = srcMatch[1];
            var labelMatch = srcMatch[0].match(/(?:title|label|res)=["']([^"']+)["']/i);
            var sName = labelMatch ? labelMatch[1] : "Nguồn phát";
            
            if (sUrl.indexOf("http") !== -1 || sUrl.indexOf("//") === 0) {
                if (sUrl.indexOf("//") === 0) sUrl = "https:" + sUrl;
                var cleanSrc = sUrl.replace(/[\s\S]*?http/i, "http");
                if (foundUrls.indexOf(cleanSrc) === -1) {
                    foundUrls.push(cleanSrc);
                    var safeId = BASEURL + "/?direct_play=" + encodeURIComponent(cleanSrc);
                    highQualityEpisodes.push({ id: safeId, name: sName, slug: "full" });
                }
            }
        }

        var servers = [];
        if (highQualityEpisodes.length > 0) {
            servers.push({
                name: "Server 4K / HD (Chất lượng cao)",
                episodes: highQualityEpisodes
            });
        }
        if (sdQualityEpisodes.length > 0) {
            servers.push({
                name: "Server SD (Cơ bản)",
                episodes: sdQualityEpisodes
            });
        }

        if (servers.length === 0) {
            return JSON.stringify({
                id: id || url || "error",
                title: "Video không khả dụng",
                description: "Video riêng tư hoặc không tìm thấy nguồn phát.",
                posterUrl: limg || "",
                backdropUrl: limg || "",
                servers: []
            });
        }

        return JSON.stringify({
            id: id,
            title: _trim(lname),
            posterUrl: limg,
            backdropUrl: limg,
            description: _trim(ldes),
            quality: "",
            year: 2026,
            rating: 0,
            status: "",
            category: category,
            episode_current: "",
            servers: servers,
            duration: "",
            casts: getField('video_models') || "",
            director: "",
            extra: ""
        });
    } catch (e) {
        return JSON.stringify({ id: url || "error", title: "Lỗi", servers: [] });
    }
}

function parseDetailResponse(html, url) {
    try {
        var streamUrl = "";
        if (url && url.indexOf("?direct_play=") !== -1) {
            streamUrl = decodeURIComponent(url.split("?direct_play=")[1]);
        } else if (url && typeof url === 'string' && url.indexOf("http") === 0) {
            streamUrl = url;
        } else if (html && typeof html === 'string' && html.indexOf("http") === 0) {
            streamUrl = html;
        }

        return JSON.stringify({
            "url": streamUrl,
            "isEmbed": false,
            "headers": {
                "Referer": BASEURL + "/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            "subtitles": []
        });
    } catch (e) {
        return JSON.stringify({ "url": url || "", "headers": {} });
    }
}

function parseEpisodePlayer(response, fetchedUrl) { return parseDetailResponse(response, fetchedUrl); }
function parsePlayerUrl(response) { return parseDetailResponse(response, ""); }
function parseEmbedPlayer(html, url) { return parseDetailResponse(html, url); }
function parseCategoriesResponse(apiResponseJson) { return getPrimaryCategories(); }
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }

// =============================================================================
// MENU DATA VÀ HELPER
// =============================================================================
function getLISTmenu() {
    return '[{"link":"/categories/jav-4k/","name":"Hàng 4K"},{"link":"/categories/gravure-idols/","name":"Gravure Idols"},{"link":"/categories/amateur3/","name":"Amateur"},{"link":"/categories/southeast-asia/","name":"Southeast Asia"},{"link":"/categories/jav-uncensored/","name":"JAV Uncensored9508"},{"link":"/categories/jav-amateur/","name":"JAV Amateur"},{"link":"/categories/western-girls/","name":"Western Girls"},{"link":"/categories/china-taiwan/","name":"China & Taiwan"},{"link":"/categories/korea/","name":"South Korea"},{"link":"/categories/jav/","name":"JAV & AV Models"},{"link":"/categories/cosplay/","name":"Cosplay"},{"link":"/tags/japanese/","name":"japanese"},{"link":"/tags/asian/","name":"asian"},{"link":"/tags/onlyfans2/","name":"onlyfans"},{"link":"/tags/beautiful/","name":"beautiful"},{"link":"/tags/blowjob/","name":"blowjob"},{"link":"/tags/teen/","name":"teen"},{"link":"/tags/big-tits/","name":"big tits"}]';
}

function buildMenu(menuArray, type) {
    var parsedArray = [];
    try {
        parsedArray = typeof menuArray === 'string' ? JSON.parse(menuArray) : menuArray;
    } catch (e) { parsedArray = []; }
    var menulist = [];
    if (!_isArray(parsedArray)) return menulist;
    var typeStr = type !== undefined ? _trim(String(type)) : undefined;
    for (var i = 0; i < parsedArray.length; i++) {
        var item = parsedArray[i];
        if (!item) continue;
        var link = item.link ? _trim(String(item.link)) : "";
        var name = item.name ? _trim(String(item.name)) : "";
        if (!link || !name) continue;
        var menuItem = {};
        if (typeStr === "false") {
            menuItem = { "slug": link, "title": name, "name": name, "type": "Horizontal" };
        } else if (typeStr === "true") {
            menuItem = { "slug": link, "title": name, "name": name, "type": "Grid" };
        } else {
            menuItem = { "slug": link, "title": name, "name": name };
        }
        menulist.push(menuItem);
    }
    return menulist;
}

// =============================================================================
// MINI JQUERY PARSER (_$)
// =============================================================================
function _$(htmlOrBlock) {
    if (htmlOrBlock && typeof htmlOrBlock === 'object' && htmlOrBlock.elements) return htmlOrBlock;
    var instance = {
        sourceHtml: typeof htmlOrBlock === 'string' ? htmlOrBlock : '',
        elements: _isArray(htmlOrBlock) ? htmlOrBlock : (htmlOrBlock ? [htmlOrBlock] : []),
        find: function(selector) {
            if (selector.indexOf(',') !== -1) {
                var results = [];
                var selectors = selector.split(',');
                for (var s = 0; s < selectors.length; s++) {
                    var sel = _trim(selectors[s]);
                    if (sel === "") continue;
                    var subInstance = this.find(sel);
                    for (var r = 0; r < subInstance.elements.length; r++) {
                        var element = subInstance.elements[r];
                        if (results.indexOf(element) === -1) results.push(element);
                    }
                }
                var multiInstance = _$(results);
                multiInstance.sourceHtml = this.sourceHtml;
                return multiInstance;
            }
            var results = [];
            var contentFilter = "";
            if (selector.indexOf(":content(") !== -1) {
                var contentMatch = selector.match(/:content\((?:"([^"]*)"|'([^']*)'|([^)]*))\)/);
                if (contentMatch) {
                    contentFilter = contentMatch[1] || contentMatch[2] || contentMatch[3] || "";
                    selector = selector.replace(/:content\((?:"[^"]*"|'[^']*'|[^)]*)\)/, "");
                }
            }
            var attrNameFilter = "";
            var attrValueFilter = "";
            var attrOperator = "=";
            var hasAttrFilter = false;
            var attrMatch = selector.match(/\[([a-zA-Z0-9_-]+)\s*([*^$]?=)\s*(?:"([^"]*)"|'([^']*)'|([^\]"']*))\]/);
            if (attrMatch) {
                hasAttrFilter = true;
                attrNameFilter = attrMatch[1];
                attrOperator = attrMatch[2];
                attrValueFilter = attrMatch[3] || attrMatch[4] || attrMatch[5] || "";
                selector = selector.replace(/\[.*?\]/, "");
            }
            var notSelector = "";
            if (selector.indexOf(":not(") !== -1) {
                var notMatch = selector.match(/:not\(([^)]+)\)/);
                if (notMatch) {
                    notSelector = notMatch[1];
                    selector = selector.replace(/:not\([^)]+\)/, "");
                }
            }
            var isFirstFilter = selector.indexOf(":first") !== -1;
            var isLastFilter = selector.indexOf(":last") !== -1;
            selector = selector.replace(/:first|:last/g, "");
            var targetTagName = "";
            var targetId = "";
            var targetClasses = [];
            var selectorToParse = _trim(selector);
            if (selectorToParse !== "") {
                var idIndex = selectorToParse.indexOf('#');
                if (idIndex !== -1) {
                    var afterId = selectorToParse.substring(idIndex + 1);
                    var nextDot = afterId.indexOf('.');
                    targetId = nextDot === -1 ? afterId : afterId.substring(0, nextDot);
                    selectorToParse = selectorToParse.substring(0, idIndex) + (nextDot === -1 ? "" : "." + afterId.substring(nextDot + 1));
                }
                var classParts = selectorToParse.split('.');
                var possibleTag = classParts.shift();
                if (possibleTag) targetTagName = possibleTag.toLowerCase();
                for (var c = 0; c < classParts.length; c++) {
                    if (classParts[c].length > 0) targetClasses.push(classParts[c]);
                }
            }
            for (var i = 0; i < this.elements.length; i++) {
                var currentHtml = this.elements[i];
                var pos = 0;
                var subResults = [];
                while ((pos = currentHtml.indexOf('<', pos)) !== -1) {
                    if (currentHtml.charAt(pos + 1) === '/' || currentHtml.charAt(pos + 1) === '!') { pos++; continue; }
                    var endOpenTag = -1;
                    var insideQuote = false;
                    var quoteChar = '';
                    for (var j = pos + 1; j < currentHtml.length; j++) {
                        var char = currentHtml.charAt(j);
                        if ((char === '"' || char === "'") && currentHtml.charAt(j - 1) !== '\\') {
                            if (!insideQuote) { insideQuote = true; quoteChar = char; }
                            else if (char === quoteChar) insideQuote = false;
                        }
                        if (char === '>' && !insideQuote) { endOpenTag = j; break; }
                    }
                    if (endOpenTag === -1) break;
                    var fullOpenTag = currentHtml.substring(pos, endOpenTag + 1);
                    var tagMatch = fullOpenTag.match(/^<([a-zA-Z0-9_-]+)/);
                    var currentTagName = tagMatch ? tagMatch[1].toLowerCase() : "";
                    var isMatched = true;
                    if (targetTagName && targetTagName !== currentTagName) isMatched = false;
                    var getClassAttr = fullOpenTag.match(/class\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
                    var classMatchStr = getClassAttr ? (getClassAttr[1] || getClassAttr[2] || getClassAttr[3] || "") : "";
                    var getIdAttr = fullOpenTag.match(/id\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
                    var idMatchStr = getIdAttr ? (getIdAttr[1] || getIdAttr[2] || getIdAttr[3] || "") : "";
                    if (isMatched && targetId && idMatchStr !== targetId) isMatched = false;
                    if (isMatched && targetClasses.length > 0) {
                        if (classMatchStr) {
                            var currentClasses = classMatchStr.trim().split(/\s+/);
                            for (var c = 0; c < targetClasses.length; c++) {
                                if (currentClasses.indexOf(targetClasses[c]) === -1) { isMatched = false; break; }
                            }
                        } else isMatched = false;
                    }
                    if (isMatched && hasAttrFilter) {
                        var actualValue = "";
                        if (attrNameFilter === "class") actualValue = classMatchStr;
                        else if (attrNameFilter === "id") actualValue = idMatchStr;
                        else {
                            var getAnyAttr = fullOpenTag.match(new RegExp(attrNameFilter + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i'));
                            actualValue = getAnyAttr ? (getAnyAttr[1] || getAnyAttr[2] || getAnyAttr[3] || "") : "";
                        }
                        if (fullOpenTag.search(new RegExp(attrNameFilter + '\\s*=', 'i')) === -1) isMatched = false;
                        else {
                            if (attrOperator === "=") {
                                if (attrNameFilter === "class") {
                                    if (actualValue.trim().split(/\s+/).indexOf(attrValueFilter) === -1) isMatched = false;
                                } else if (actualValue !== attrValueFilter) isMatched = false;
                            } else if (attrOperator === "*=") {
                                if (actualValue.indexOf(attrValueFilter) === -1) isMatched = false;
                            } else if (attrOperator === "^=") {
                                if (actualValue.indexOf(attrValueFilter) !== 0) isMatched = false;
                            } else if (attrOperator === "$=") {
                                if (actualValue.slice(-attrValueFilter.length) !== attrValueFilter) isMatched = false;
                            }
                        }
                    }
                    if (isMatched) {
                        var startTagPos = pos;
                        var endTagPos = endOpenTag + 1;
                        var selfClosingTags = ['img', 'source', 'input', 'br', 'hr', 'link', 'meta'];
                        if (selfClosingTags.indexOf(currentTagName) === -1 && fullOpenTag.indexOf('/>') === -1) {
                            var depth = 1;
                            var scanPos = endOpenTag + 1;
                            var openStr = '<' + currentTagName;
                            var closeStr = '</' + currentTagName + '>';
                            while (depth > 0 && scanPos < currentHtml.length) {
                                var nextOpen = currentHtml.indexOf(openStr, scanPos);
                                var nextClose = currentHtml.indexOf(closeStr, scanPos);
                                if (nextClose === -1) { scanPos = currentHtml.length; break; }
                                if (nextOpen !== -1 && nextOpen < nextClose) { depth++; scanPos = nextOpen + openStr.length; }
                                else { depth--; scanPos = nextClose + closeStr.length; if (depth === 0) endTagPos = nextClose + closeStr.length; }
                            }
                        }
                        var foundBlock = currentHtml.substring(startTagPos, endTagPos);
                        if (contentFilter) {
                            var pureText = _trim(foundBlock.replace(/<[^>]+>/g, ""));
                            if (pureText.indexOf(contentFilter) === -1) { pos = endTagPos; continue; }
                        }
                        if (notSelector) {
                            var isNotClass = notSelector.indexOf('.') === 0;
                            var isNotId = notSelector.indexOf('#') === 0;
                            var notValue = notSelector.substring(1);
                            var hasNot = false;
                            if (isNotClass && classMatchStr.indexOf(notValue) !== -1) hasNot = true;
                            if (isNotId && idMatchStr.indexOf(notValue) !== -1) hasNot = true;
                            if (!hasNot) subResults.push(foundBlock);
                        } else subResults.push(foundBlock);
                        pos = endTagPos;
                    } else pos++;
                }
                if (isFirstFilter && subResults.length > 0) subResults = [subResults[0]];
                if (isLastFilter && subResults.length > 0) subResults = [subResults[subResults.length - 1]];
                results = results.concat(subResults);
            }
            var newInstance = _$(results);
            newInstance.sourceHtml = this.sourceHtml || currentHtml;
            return newInstance;
        },
        each: function(callback) {
            for (var i = 0; i < this.elements.length; i++) {
                var childInstance = _$(this.elements[i]);
                childInstance.sourceHtml = this.sourceHtml;
                callback.call(childInstance, i, this.elements[i]);
            }
            return this;
        },
        attr: function(attrName) {
            if (this.elements.length === 0) return "";
            var getAttr = this.elements[0].match(new RegExp(attrName + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i'));
            return getAttr ? (getAttr[1] || getAttr[2] || getAttr[3] || "") : "";
        },
        text: function() {
            if (this.elements.length === 0) return "";
            var elem = this.elements[0];
            var start = elem.indexOf('>') + 1;
            var end = elem.lastIndexOf('</');
            if (start > 0 && end > start) {
                var content = elem.substring(start, end);
                var pureText = content.replace(/<\/?[^>]+(>|$)/g, "\n");
                var lines = pureText.split('\n');
                var res = [];
                for (var i = 0; i < lines.length; i++) {
                    var t = _trim(lines[i]);
                    if (t !== '') res.push(t);
                }
                return res.join(' ');
            }
            return "";
        }
    };
    return instance;
}
