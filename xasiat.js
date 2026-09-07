// https://www.xasiat.ws
var BASEURL = "https://www.xasiat.ws";

function getManifest() {
    return JSON.stringify({
        "id": "xasiat",
        "name": "XXX Châu Á",
        "description": "Kho video XXX Châu Á tổng hợp đa dạng.",
        "info": "Kho video XXX Châu Á tổng hợp đa dạng.",
        "version": "1.0.6",
        "baseUrl": BASEURL,
        "iconUrl": "https://raw.githubusercontent.com/hieu-TQS/movie-SuperOK/refs/heads/main/icons/xasiat.png",
        "isEnabled": true,
        "isAdult": true,
        "type": "MOVIE",
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
        category: menulist
    });
}

function getUrlList(slug, filtersJson) {
    try {
        var page = 1;
        var path = slug || "";
        
        if (filtersJson) {
            var fixedJson = typeof filtersJson === 'string' 
                ? filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':')
                : JSON.stringify(filtersJson);
            try {
                var filters = JSON.parse(fixedJson);
                page = parseInt(filters.page) || 1;
                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) {
                        path = filters.category[0].slug || filters.category[0].id || "";
                    } else if (typeof filters.category === 'string') {
                        path = filters.category;
                    }
                }
            } catch (jsonErr) {}
        }
        
        if (!path) {
            path = "/latest-updates/";
        }
        
        var fullUrl = path;
        if (fullUrl.indexOf("http") !== 0) {
            fullUrl = BASEURL + (fullUrl.charAt(0) === '/' ? fullUrl : '/' + fullUrl);
        }
        
        if (fullUrl.indexOf("?") !== -1) {
            var qIdx = fullUrl.indexOf("?");
            fullUrl = fullUrl.substring(0, qIdx);
        }
        
        if (fullUrl.slice(-1) === '/') {
            fullUrl = fullUrl.slice(0, -1);
        }
        
        if (fullUrl.indexOf("/search/") !== -1) {
            if (page > 1) {
                return fullUrl + "/?from_videos=" + page;
            }
            return fullUrl + "/";
        }
        
        if (page > 1) {
            return fullUrl + "/" + page + "/";
        }
        return fullUrl + "/";
    } catch (e) {
        log(e);
        return BASEURL + "/latest-updates/";
    }
}

function getUrlSearch(keyword, filtersJson) {
    var page = 1;
    if (filtersJson) {
        try {
            var fixedJson = typeof filtersJson === 'string'
                ? filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':')
                : JSON.stringify(filtersJson);
            var filters = JSON.parse(fixedJson);
            page = parseInt(filters.page) || 1;
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

function parseListResponse(html, $url) {
	try {
		var items = [];
		_$(html).find(".item").find("a").each(function() {
			var year = "";
			var lang = "";
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
					"title": title.trim(),
					"posterUrl": cleanThumb,
					"backdropUrl": cleanThumb,
					"quality": quality.trim(),
					"lang": lang,
					"episode_current": current.trim()
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
				"id": $url || "",
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

function parseSearchResponse(html, $url) {
    return parseListResponse(html, $url);
}

function parseMovieDetail(html, url) {
    var cachedMovieDetailId = "";
	try {
		var id = "";
		var lname = "Đang cập nhật...";
		var limg = "";
		var ldes = "Không có mô tả.";
		var category = "";
		var quality = "";
		var year = 2026;
		var rating = 0;
		var servers = [];

		var idMatch = /<link\s+rel="canonical"\s+href="([^"]+)"/i.exec(html) ||
			/<meta\s+property="og:url"\s+content="([^"]+)"/i.exec(html);
		id = idMatch ? idMatch[1] : (url || "");
		cachedMovieDetailId = id;

		var titleMatch = /<meta\s+property="og:title"\s+content="([^"]+)"/i.exec(html);
		if (titleMatch) lname = titleMatch[1];
		
		var imgMatch = /<meta\s+property="og:image"\s+content="([^"]+)"/i.exec(html);
		if (imgMatch) limg = imgMatch[1];

		var episodes = [];

		var fvMatch = html.match(/var\s+flashvars\s*=\s*\{([\s\S]*?)\};/);
		if (fvMatch) {
			var flashvarsBody = fvMatch[1];
			var getField = function(name) {
				var m = flashvarsBody.match(new RegExp(name + "\\s*:\\s*'((?:[^'\\\\]|\\\\.)*)'"));
				if (m) return m[1].replace(/\\'/g, "'").replace(/\\"/g, '"');
				var mNum = flashvarsBody.match(new RegExp(name + "\\s*:\\s*([^,\\s}]+)"));
				return mNum ? mNum[1] : "";
			};
			
			lname = getField('video_title') || lname;
			limg = getField('preview_url') || limg;
			ldes = getField('video_tags') || ldes;
			category = getField('video_categories') || "";

			var addEp = function(urlKey, textKey, defaultName, slug) {
				var vUrl = getField(urlKey);
				if (vUrl && vUrl.indexOf("http") !== -1) {
					var text = getField(textKey) || defaultName;
					var cleanUrl = vUrl.replace(/[\s\S]*?http/i, "http");
					episodes.push({ id: cleanUrl, name: "Chất lượng " + text, slug: slug });
				}
			};
			addEp('video_alt_url3', 'video_alt_url3_text', '4K / FHD', 'hd4k');
			addEp('video_alt_url2', 'video_alt_url2_text', '1080p', 'hd1080');
			addEp('video_alt_url', 'video_alt_url_text', 'HD', 'hd720');
			addEp('video_url', 'video_url_text', 'SD', 'sd');
		}

		if (episodes.length === 0 && html) {
			var matchSources = html.match(/(https:\/\/[^"'\s]+\.(?:mp4|m3u8|xascdn\.li)[^"'\s]*)/gi);
			if (matchSources) {
				var uniqueLinks = [];
				for (var i = 0; i < matchSources.length; i++) {
					var link = matchSources[i].replace(/&amp;/g, '&');
					if (uniqueLinks.indexOf(link) === -1) {
						uniqueLinks.push(link);
						episodes.push({
							id: link,
							name: "Nguồn phát " + (uniqueLinks.length),
							slug: "src_" + i
						});
					}
				}
			}
		}

		if (episodes.length > 0) {
			servers.push({
				name: "Phát trực tiếp",
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
			category: category,
			servers: servers
		});
		
	} catch (e) {
		log("ParseMovieDetail Error: " + e);
		return JSON.stringify({
			id: cachedMovieDetailId || url || "error",
			title: "error",
			servers: []
		});
	}
}

function parseDetailResponse(html, url) {
	try {
		var targetUrl = url || "";
		
		if (targetUrl.match(/\.(mp4|m3u8|ts|live)(\?.*)?$/i)) {
			return JSON.stringify({
				"url": targetUrl,
				"isEmbed": false,
				"mimeType": targetUrl.indexOf(".m3u8") !== -1 ? "application/x-mpegURL" : "video/mp4",
				"headers": {
					"Referer": BASEURL,
					"Origin": BASEURL,
					"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
				},
				"subtitles": []
			});
		}

		if (html && typeof html === 'string') {
			var matchCDN = html.match(/(https:\/\/[^"'\s]+\.(?:xascdn\.li|mp4|m3u8)[^"'\s]*)/i) ||
			               html.match(/https?:\/\/[^"'\s]+\b(stream|video|cdn)[^"'\s]+/i);
			if (matchCDN) {
				targetUrl = matchCDN[1] || matchCDN[0];
			}
		}

		if (!targetUrl && url) {
			targetUrl = url;
		}

		return JSON.stringify({
			"url": targetUrl,
			"isEmbed": false,
			"mimeType": targetUrl.indexOf(".m3u8") !== -1 ? "application/x-mpegURL" : "video/mp4",
			"headers": {
				"Referer": BASEURL,
				"Origin": BASEURL,
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

function sortEpisodesByName(data) {
    data.forEach(function(server) {
        if (server.episodes && Array.isArray(server.episodes)) {
            server.episodes.sort(function(a, b) {
                var matchA = a.name.match(/Tập\s*(\d+)/i);
                var matchB = b.name.match(/Tập\s*(\d+)/i);
                var numA = matchA ? parseInt(matchA[1], 10) : 0;
                var numB = matchB ? parseInt(matchB[1], 10) : 0;
                return numA - numB;
            });
        }
    });
    return data;
}

function parseCategoriesResponse(apiResponseJson) {
    var listurl = getLISTmenu();
    return JSON.stringify(buildMenu(listurl));
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }

function getLISTmenu() {
    return `[{"link":"/categories/jav-4k/","name":"Hàng 4K"},{"link":"/categories/gravure-idols/","name":"Gravure Idols"},{"link":"/categories/amateur3/","name":"Amateur"},{"link":"/categories/southeast-asia/","name":"Southeast Asia"},{"link":"/categories/jav-uncensored/","name":"JAV Uncensored"},{"link":"/categories/jav-amateur/","name":"JAV Amateur"},{"link":"/categories/western-girls/","name":"Western Girls"},{"link":"/categories/china-taiwan/","name":"China & Taiwan"},{"link":"/categories/korea/","name":"South Korea"},{"link":"/categories/jav/","name":"JAV & AV Models"},{"link":"/categories/cosplay/","name":"Cosplay"}]`;
}

function buildMenu(menuArray, type) {
    var parsedArray = [];
    try {
        parsedArray = typeof menuArray === 'string' ? JSON.parse(menuArray) : menuArray;
    } catch (e) {
        parsedArray = [];
    }
    var menulist = [];
    if (!parsedArray || !Array.isArray(parsedArray)) return menulist;
    for (var i = 0; i < parsedArray.length; i++) {
        var item = parsedArray[i];
        if (!item) continue;
        menulist.push({ "slug": item.link, "name": item.name });
    }
    return menulist;
}

function _$(htmlOrBlock) {
    if (htmlOrBlock && typeof htmlOrBlock === 'object' && htmlOrBlock.elements) {
        return htmlOrBlock;
    }
    var instance = {
        sourceHtml: typeof htmlOrBlock === 'string' ? htmlOrBlock : '',
        elements: Array.isArray(htmlOrBlock) ? htmlOrBlock : (htmlOrBlock ? [htmlOrBlock] : []),
        find: function(selector) {
            if (selector.indexOf(',') !== -1) {
                var results = [];
                var selectors = selector.split(',').map(function(s) { return s.trim(); });
                for (var s = 0; s < selectors.length; s++) {
                    if (selectors[s] === "") continue;
                    var subInstance = this.find(selectors[s]);
                    for (var r = 0; r < subInstance.elements.length; r++) {
                        var element = subInstance.elements[r];
                        if (results.indexOf(element) === -1) {
                            results.push(element);
                        }
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
            var selectorToParse = selector.trim();
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
                if (possibleTag) {
                    targetTagName = possibleTag.toLowerCase();
                }
                targetClasses = classParts.filter(function(c) { return c.length > 0; });
            }
            for (var i = 0; i < this.elements.length; i++) {
                var currentHtml = this.elements[i];
                var pos = 0;
                var subResults = [];
                while ((pos = currentHtml.indexOf('<', pos)) !== -1) {
                    if (currentHtml.charAt(pos + 1) === '/' || currentHtml.charAt(pos + 1) === '!') {
                        pos++;
                        continue;
                    }
                    var endOpenTag = -1;
                    var insideQuote = false;
                    var quoteChar = '';
                    for (var j = pos + 1; j < currentHtml.length; j++) {
                        var char = currentHtml.charAt(j);
                        if ((char === '"' || char === "'") && currentHtml.charAt(j - 1) !== '\\') {
                            if (!insideQuote) {
                                insideQuote = true;
                                quoteChar = char;
                            } else if (char === quoteChar) {
                                insideQuote = false;
                            }
                        }
                        if (char === '>' && !insideQuote) {
                            endOpenTag = j;
                            break;
                        }
                    }
                    if (endOpenTag === -1) break;
                    var fullOpenTag = currentHtml.substring(pos, endOpenTag + 1);
                    var tagMatch = fullOpenTag.match(/^<([a-zA-Z0-9_-]+)/);
                    var currentTagName = tagMatch ? tagMatch[1].toLowerCase() : "";
                    var isMatched = true;
                    if (targetTagName && targetTagName !== currentTagName) {
                        isMatched = false;
                    }
                    var getClassAttr = fullOpenTag.match(/class\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
                    var classMatchStr = getClassAttr ? (getClassAttr[1] || getClassAttr[2] || getClassAttr[3] || "") : "";
                    var getIdAttr = fullOpenTag.match(/id\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
                    var idMatchStr = getIdAttr ? (getIdAttr[1] || getIdAttr[2] || getIdAttr[3] || "") : "";
                    if (isMatched && targetId && idMatchStr !== targetId) {
                        isMatched = false;
                    }
                    if (isMatched && targetClasses.length > 0) {
                        if (classMatchStr) {
                            var currentClasses = classMatchStr.trim().split(/\s+/);
                            for (var c = 0; c < targetClasses.length; c++) {
                                if (currentClasses.indexOf(targetClasses[c]) === -1) {
                                    isMatched = false;
                                    break;
                                }
                            }
                        } else {
                            isMatched = false;
                        }
                    }
                    if (isMatched && hasAttrFilter) {
                        var actualValue = "";
                        if (attrNameFilter === "class") {
                            actualValue = classMatchStr;
                        } else if (attrNameFilter === "id") {
                            actualValue = idMatchStr;
                        } else {
                            var getAnyAttr = fullOpenTag.match(new RegExp(attrNameFilter + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i'));
                            actualValue = getAnyAttr ? (getAnyAttr[1] || getAnyAttr[2] || getAnyAttr[3] || "") : "";
                        }
                        var attrExists = fullOpenTag.search(new RegExp(attrNameFilter + '\\s*=', 'i')) !== -1;
                        if (!attrExists) {
                            isMatched = false;
                        } else {
                            if (attrOperator === "=") {
                                if (attrNameFilter === "class") {
                                    var classes = actualValue.trim().split(/\s+/);
                                    if (classes.indexOf(attrValueFilter) === -1) isMatched = false;
                                } else if (actualValue !== attrValueFilter) {
                                    isMatched = false;
                                }
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
                                if (nextClose === -1) {
                                    scanPos = currentHtml.length;
                                    break;
                                }
                                if (nextOpen !== -1 && nextOpen < nextClose) {
                                    depth++;
                                    scanPos = nextOpen + openStr.length;
                                } else {
                                    depth--;
                                    scanPos = nextClose + closeStr.length;
                                    if (depth === 0) endTagPos = nextClose + closeStr.length;
                                }
                            }
                        }
                        var foundBlock = currentHtml.substring(startTagPos, endTagPos);
                        if (contentFilter) {
                            var pureText = foundBlock.replace(/<[^>]+>/g, "").trim();
                            if (pureText.indexOf(contentFilter) === -1) {
                                pos = endTagPos;
                                continue;
                            }
                        }
                        if (notSelector) {
                            var isNotClass = notSelector.indexOf('.') === 0;
                            var isNotId = notSelector.indexOf('#') === 0;
                            var notValue = notSelector.substring(1);
                            var hasNot = false;
                            if (isNotClass && classMatchStr.indexOf(notValue) !== -1) hasNot = true;
                            if (isNotId && idMatchStr.indexOf(notValue) !== -1) hasNot = true;
                            if (!hasNot) subResults.push(foundBlock);
                        } else {
                            subResults.push(foundBlock);
                        }
                        pos = endTagPos;
                    } else {
                        pos++;
                    }
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
        eq: function(index) {
            if (index < 0) index = this.elements.length + index;
            var matchedElement = this.elements[index];
            this.elements = matchedElement ? [matchedElement] : [];
            return this;
        },
        attr: function(attrName) {
            if (this.elements.length === 0) return "";
            var elem = this.elements[0];
            var getAttr = elem.match(new RegExp(attrName + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i'));
            return getAttr ? (getAttr[1] || getAttr[2] || getAttr[3] || "") : "";
        },
        html: function() {
            if (this.elements.length === 0) return "";
            var elem = this.elements[0];
            var start = elem.indexOf('>') + 1;
            var end = elem.lastIndexOf('</');
            if (start > 0 && end > start) return elem.substring(start, end);
            return "";
        },
        text: function(separator) {
            if (this.elements.length === 0) return "";
            var elem = this.elements[0];
            var start = elem.indexOf('>') + 1;
            var end = elem.lastIndexOf('</');
            if (start > 0 && end > start) {
                var content = elem.substring(start, end);
                var pureText = content.replace(/<\/?[^>]+(>|$)/g, "\n");
                if (typeof separator === 'string') {
                    return pureText.split('\n').map(function(item) { return item.trim(); }).filter(function(item) { return item !== ''; }).join(separator);
                }
                return pureText.split('\n').map(function(item) { return item.trim(); }).filter(function(item) { return item !== ''; }).join(' ');
            }
            return "";
        }
    };
    return instance;
}
