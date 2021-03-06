var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.arrayIteratorImpl = function(e) {
    var d = 0;
    return function() {
        return d < e.length ? {
            done: !1,
            value: e[d++]
        }: {
            done: !0
        }
    }
};
$jscomp.arrayIterator = function(e) {
    return {
        next: $jscomp.arrayIteratorImpl(e)
    }
};
$jscomp.ASSUME_ES5 = !1;
$jscomp.ASSUME_NO_NATIVE_MAP = !1;
$jscomp.ASSUME_NO_NATIVE_SET = !1;
$jscomp.SIMPLE_FROUND_POLYFILL = !1;
$jscomp.defineProperty = $jscomp.ASSUME_ES5 || "function" == typeof Object.defineProperties ? Object.defineProperty: function(e, d, a) {
    e != Array.prototype && e != Object.prototype && (e[d] = a.value)
};
$jscomp.getGlobal = function(e) {
    return "undefined" != typeof window && window === e ? e: "undefined" != typeof global && null != global ? global: e
};
$jscomp.global = $jscomp.getGlobal(this);
$jscomp.SYMBOL_PREFIX = "jscomp_symbol_";
$jscomp.initSymbol = function() {
    $jscomp.initSymbol = function() {};
    $jscomp.global.Symbol || ($jscomp.global.Symbol = $jscomp.Symbol)
};
$jscomp.Symbol = function() {
    var e = 0;
    return function(d) {
        return $jscomp.SYMBOL_PREFIX + (d || "") + e++
    }
} ();
$jscomp.initSymbolIterator = function() {
    $jscomp.initSymbol();
    var e = $jscomp.global.Symbol.iterator;
    e || (e = $jscomp.global.Symbol.iterator = $jscomp.global.Symbol("iterator"));
    "function" != typeof Array.prototype[e] && $jscomp.defineProperty(Array.prototype, e, {
        configurable: !0,
        writable: !0,
        value: function() {
            return $jscomp.iteratorPrototype($jscomp.arrayIteratorImpl(this))
        }
    });
    $jscomp.initSymbolIterator = function() {}
};
$jscomp.initSymbolAsyncIterator = function() {
    $jscomp.initSymbol();
    var e = $jscomp.global.Symbol.asyncIterator;
    e || (e = $jscomp.global.Symbol.asyncIterator = $jscomp.global.Symbol("asyncIterator"));
    $jscomp.initSymbolAsyncIterator = function() {}
};
$jscomp.iteratorPrototype = function(e) {
    $jscomp.initSymbolIterator();
    e = {
        next: e
    };
    e[$jscomp.global.Symbol.iterator] = function() {
        return this
    };
    return e
};
var _createClass = function() {
    function e(d, a) {
        for (var c = 0; c < a.length; c++) {
            var b = a[c];
            b.enumerable = b.enumerable || !1;
            b.configurable = !0;
            "value" in b && (b.writable = !0);
            Object.defineProperty(d, b.key, b)
        }
    }
    return function(d, a, c) {
        a && e(d.prototype, a);
        c && e(d, c);
        return d
    }
} ();
function _possibleConstructorReturn(e, d) {
    if (!e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return ! d || "object" !== typeof d && "function" !== typeof d ? e: d
}
function _inherits(e, d) {
    if ("function" !== typeof d && null !== d) throw new TypeError("Super expression must either be null or a function, not " + typeof d);
    e.prototype = Object.create(d && d.prototype, {
        constructor: {
            value: e,
            enumerable: !1,
            writable: !0,
            configurable: !0
        }
    });
    d && (Object.setPrototypeOf ? Object.setPrototypeOf(e, d) : e.__proto__ = d)
}
function _classCallCheck(e, d) {
    if (! (e instanceof d)) throw new TypeError("Cannot call a class as a function");
}
var Emitter = function() {
    function e() {
        _classCallCheck(this, e)
    }
    _createClass(e, [{
        key: "on",
        value: function(d, a) {
            this._callbacks = this._callbacks || {};
            this._callbacks[d] || (this._callbacks[d] = []);
            this._callbacks[d].push(a);
            return this
        }
    },
    {
        key: "emit",
        value: function(d) {
            this._callbacks = this._callbacks || {};
            var a = this._callbacks[d];
            if (a) {
                for (var c = arguments.length,
                b = Array(1 < c ? c - 1 : 0), f = 1; f < c; f++) b[f - 1] = arguments[f];
                $jscomp.initSymbol();
                $jscomp.initSymbolIterator();
                for (c = 0; ! (c >= a.length);) a[c++].apply(this, b)
            }
            return this
        }
    },
    {
        key: "off",
        value: function(d, a) {
            if (!this._callbacks || 0 === arguments.length) return this._callbacks = {},
            this;
            var c = this._callbacks[d];
            if (!c) return this;
            if (1 === arguments.length) return delete this._callbacks[d],
            this;
            for (var b = 0; b < c.length; b++) if (c[b] === a) {
                c.splice(b, 1);
                break
            }
            return this
        }
    }]);
    return e
} (),
Dropzone = function(e) {
    function d(a, c) {
        _classCallCheck(this, d);
        var b = _possibleConstructorReturn(this, (d.__proto__ || Object.getPrototypeOf(d)).call(this)),
        f = void 0,
        g = void 0;
        b.element = a;
        b.version = d.version;
        b.defaultOptions.previewTemplate = b.defaultOptions.previewTemplate.replace(/\n*/g, "");
        b.clickableElements = [];
        b.listeners = [];
        b.files = [];
        "string" === typeof b.element && (b.element = document.querySelector(b.element));
        if (!b.element || null == b.element.nodeType) throw Error("Invalid dropzone element.");
        if (b.element.dropzone) throw Error("Dropzone already attached.");
        d.instances.push(b);
        b.element.dropzone = b;
        var e = null != (g = d.optionsForElement(b.element)) ? g: {};
        b.options = d.extend({},
        b.defaultOptions, e, null != c ? c: {});
        if (b.options.forceFallback || !d.isBrowserSupported()) {
            var h;
            return h = b.options.fallback.call(b),
            _possibleConstructorReturn(b, h)
        }
        null == b.options.url && (b.options.url = b.element.getAttribute("action"));
        if (!b.options.url) throw Error("No URL provided.");
        if (b.options.acceptedFiles && b.options.acceptedMimeTypes) throw Error("You can't provide both 'acceptedFiles' and 'acceptedMimeTypes'. 'acceptedMimeTypes' is deprecated.");
        if (b.options.uploadMultiple && b.options.chunking) throw Error("You cannot set both: uploadMultiple and chunking.");
        b.options.acceptedMimeTypes && (b.options.acceptedFiles = b.options.acceptedMimeTypes, delete b.options.acceptedMimeTypes);
        null != b.options.renameFilename && (b.options.renameFile = function(a) {
            return b.options.renameFilename.call(b, a.name, a)
        });
        b.options.method = b.options.method.toUpperCase(); (f = b.getExistingFallback()) && f.parentNode && f.parentNode.removeChild(f); ! 1 !== b.options.previewsContainer && (b.previewsContainer = b.options.previewsContainer ? d.getElement(b.options.previewsContainer, "previewsContainer") : b.element);
        b.options.clickable && (b.clickableElements = !0 === b.options.clickable ? [b.element] : d.getElements(b.options.clickable, "clickable"));
        b.init();
        return b
    }
    _inherits(d, e);
    _createClass(d, null, [{
        key: "initClass",
        value: function() {
            this.prototype.Emitter = Emitter;
            this.prototype.events = "drop dragstart dragend dragenter dragover dragleave addedfile addedfiles removedfile thumbnail error errormultiple processing processingmultiple uploadprogress totaluploadprogress sending sendingmultiple success successmultiple canceled canceledmultiple complete completemultiple reset maxfilesexceeded maxfilesreached queuecomplete".split(" ");
            this.prototype.defaultOptions = {
                url: null,
                method: "post",
                withCredentials: !1,
                timeout: 3E4,
                parallelUploads: 2,
                uploadMultiple: !1,
                chunking: !1,
                forceChunking: !1,
                chunkSize: 2E6,
                parallelChunkUploads: !1,
                retryChunks: !1,
                retryChunksLimit: 3,
                maxFilesize: 256,
                paramName: "file",
                createImageThumbnails: !0,
                maxThumbnailFilesize: 10,
                thumbnailWidth: 120,
                thumbnailHeight: 120,
                thumbnailMethod: "crop",
                resizeWidth: null,
                resizeHeight: null,
                resizeMimeType: null,
                resizeQuality: .8,
                resizeMethod: "contain",
                filesizeBase: 1E3,
                maxFiles: null,
                headers: null,
                clickable: !0,
                ignoreHiddenFiles: !0,
                acceptedFiles: null,
                acceptedMimeTypes: null,
                autoProcessQueue: !0,
                autoQueue: !0,
                addRemoveLinks: !1,
                previewsContainer: null,
                hiddenInputContainer: "body",
                capture: null,
                renameFilename: null,
                renameFile: null,
                forceFallback: !1,
                dictDefaultMessage: "\u62d6\u52a8\u56fe\u7247\u6587\u4ef6\u5230\u8fd9\u91cc\u4e0a\u4f20",
                dictFallbackMessage: "Your browser does not support drag'n'drop file uploads.",
                dictFallbackText: "Please use the fallback form below to upload your files like in the olden days.",
                dictFileTooBig: "File is too big ({{filesize}}MiB). Max filesize: {{maxFilesize}}MiB.",
                dictInvalidFileType: "You can't upload files of this type.",
                dictResponseError: "Server responded with {{statusCode}} code.",
                dictCancelUpload: "\u53d6\u6d88\u4e0a\u4f20",
                dictUploadCanceled: "Upload canceled.",
                dictCancelUploadConfirmation: "Are you sure you want to cancel this upload?",
                dictRemoveFile: "\u5220\u9664\u6587\u4ef6",
                dictRemoveFileConfirmation: null,
                dictMaxFilesExceeded: "You can not upload any more files.",
                dictFileSizeUnits: {
                    tb: "TB",
                    gb: "GB",
                    mb: "MB",
                    kb: "KB",
                    b: "b"
                },
                init: function() {},
                params: function(a, c, b) {
                    if (b) return {
                        dzuuid: b.file.upload.uuid,
                        dzchunkindex: b.index,
                        dztotalfilesize: b.file.size,
                        dzchunksize: this.options.chunkSize,
                        dztotalchunkcount: b.file.upload.totalChunkCount,
                        dzchunkbyteoffset: b.index * this.options.chunkSize
                    }
                },
                accept: function(a, c) {
                    return c()
                },
                chunksUploaded: function(a, c) {
                    c()
                },
                fallback: function() {
                    var a = void 0;
                    this.element.className += " dz-browser-not-supported";
                    $jscomp.initSymbol();
                    $jscomp.initSymbolIterator();
                    for (var c = this.element.getElementsByTagName("div"), b = 0; ! (b >= c.length);) {
                        var f = c[b++];
                        if (/(^| )dz-message($| )/.test(f.className)) {
                            a = f;
                            f.className = "dz-message";
                            break
                        }
                    }
                    a || (a = d.createElement('<div class="dz-message"><span></span></div>'), this.element.appendChild(a));
                    if (a = a.getElementsByTagName("span")[0]) null != a.textContent ? a.textContent = this.options.dictFallbackMessage: null != a.innerText && (a.innerText = this.options.dictFallbackMessage);
                    return this.element.appendChild(this.getFallbackForm())
                },
                resize: function(a, c, b, f) {
                    var d = {
                        srcX: 0,
                        srcY: 0,
                        srcWidth: a.width,
                        srcHeight: a.height
                    },
                    e = a.width / a.height;
                    null == c && null == b ? (c = d.srcWidth, b = d.srcHeight) : null == c ? c = b * e: null == b && (b = c / e);
                    c = Math.min(c, d.srcWidth);
                    b = Math.min(b, d.srcHeight);
                    var h = c / b;
                    if (d.srcWidth > c || d.srcHeight > b) if ("crop" === f) e > h ? (d.srcHeight = a.height, d.srcWidth = d.srcHeight * h) : (d.srcWidth = a.width, d.srcHeight = d.srcWidth / h);
                    else if ("contain" === f) e > h ? b = c / e: c = b * e;
                    else throw Error("Unknown resizeMethod '" + f + "'");
                    d.srcX = (a.width - d.srcWidth) / 2;
                    d.srcY = (a.height - d.srcHeight) / 2;
                    d.trgWidth = c;
                    d.trgHeight = b;
                    return d
                },
                transformFile: function(a, c) {
                    return (this.options.resizeWidth || this.options.resizeHeight) && a.type.match(/image.*/) ? this.resizeImage(a, this.options.resizeWidth, this.options.resizeHeight, this.options.resizeMethod, c) : c(a)
                },
                previewTemplate: '<div class="dz-preview dz-file-preview" onclick="select(this)">\n  <div class="dz-image"><img data-dz-thumbnail class="scrollLoading" onload="loadImage(this)" onerror="this.parentNode.removeChild(this)"/></div>\n  <div class="dz-details">\n    <div class="dz-size"><span data-dz-size></span></div>\n    <div class="dz-filename"><a href="javascript:undefined;" data-dz-name><span>\u6253\u5f00</span></a> <a href="javascript:undefined;" data-dz-remove><span>\u5220\u9664</span></a></div>\n  </div>\n  <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>\n  <div class="dz-error-message"><span data-dz-errormessage></span></div>\n  <div class="dz-success-mark">\n    <svg width="54px" height="54px" viewBox="0 0 54 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns">\n      <title>Check</title>\n      <defs></defs>\n      <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">\n        <path d="M23.5,31.8431458 L17.5852419,25.9283877 C16.0248253,24.3679711 13.4910294,24.366835 11.9289322,25.9289322 C10.3700136,27.4878508 10.3665912,30.0234455 11.9283877,31.5852419 L20.4147581,40.0716123 C20.5133999,40.1702541 20.6159315,40.2626649 20.7218615,40.3488435 C22.2835669,41.8725651 24.794234,41.8626202 26.3461564,40.3106978 L43.3106978,23.3461564 C44.8771021,21.7797521 44.8758057,19.2483887 43.3137085,17.6862915 C41.7547899,16.1273729 39.2176035,16.1255422 37.6538436,17.6893022 L23.5,31.8431458 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z" id="Oval-2" stroke-opacity="0.198794158" stroke="#747474" fill-opacity="0.816519475" fill="#FFFFFF" sketch:type="MSShapeGroup"></path>\n      </g>\n    </svg>\n  </div>\n  <div class="dz-error-mark">\n    <svg width="54px" height="54px" viewBox="0 0 54 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns">\n      <title>Error</title>\n      <defs></defs>\n      <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">\n        <g id="Check-+-Oval-2" sketch:type="MSLayerGroup" stroke="#747474" stroke-opacity="0.198794158" fill="#FFFFFF" fill-opacity="0.816519475">\n          <path d="M32.6568542,29 L38.3106978,23.3461564 C39.8771021,21.7797521 39.8758057,19.2483887 38.3137085,17.6862915 C36.7547899,16.1273729 34.2176035,16.1255422 32.6538436,17.6893022 L27,23.3431458 L21.3461564,17.6893022 C19.7823965,16.1255422 17.2452101,16.1273729 15.6862915,17.6862915 C14.1241943,19.2483887 14.1228979,21.7797521 15.6893022,23.3461564 L21.3431458,29 L15.6893022,34.6538436 C14.1228979,36.2202479 14.1241943,38.7516113 15.6862915,40.3137085 C17.2452101,41.8726271 19.7823965,41.8744578 21.3461564,40.3106978 L27,34.6568542 L32.6538436,40.3106978 C34.2176035,41.8744578 36.7547899,41.8726271 38.3137085,40.3137085 C39.8758057,38.7516113 39.8771021,36.2202479 38.3106978,34.6538436 L32.6568542,29 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z" id="Oval-2" sketch:type="MSShapeGroup"></path>\n        </g>\n      </g>\n    </svg>\n  </div>\n  <div class="dz-msg">\n        \t<span class="text_label edit" data-dz-msg></span>\n        \t<input type="text" data-dz-msg-value value="" />\n   </div>\n</div>',
                drop: function(a) {
                    return this.element.classList.remove("dz-drag-hover")
                },
                dragstart: function(a) {},
                dragend: function(a) {
                    return this.element.classList.remove("dz-drag-hover")
                },
                dragenter: function(a) {
                    return this.element.classList.add("dz-drag-hover")
                },
                dragover: function(a) {
                    return this.element.classList.add("dz-drag-hover")
                },
                dragleave: function(a) {
                    return this.element.classList.remove("dz-drag-hover")
                },
                paste: function(a) {},
                reset: function() {
                    return this.element.classList.remove("dz-started")
                },
                addedfile: function(a) {
                    var c = this;
                    this.element === this.previewsContainer && this.element.classList.add("dz-started");
                    if (this.previewsContainer) {
                        a.previewElement = d.createElement(this.options.previewTemplate.trim());
                        a.previewTemplate = a.previewElement;
                        this.previewsContainer.appendChild(a.previewElement);
                        var b = function(b) {
                            b.preventDefault();
                            b.stopPropagation();
                            a.status !== d.UPLOADING && ("" == a.upload.library ? window.open(rootPath + "/onebyone/" + a.upload.filename) : window.open(rootPath + "/onebyone/library/" + a.upload.library + "/" + a.upload.filename))
                        };
                        $jscomp.initSymbol();
                        $jscomp.initSymbolIterator();
                        for (var f = a.previewElement.querySelectorAll("[data-dz-name]"), g = 0; ! (g >= f.length);) {
                            var e = f[g++];
                            e.addEventListener("click", b)
                        }
                        $jscomp.initSymbol();
                        $jscomp.initSymbolIterator();
                        b = a.previewElement.querySelectorAll("[data-dz-msg]");
                        f = !0;
                        g = 0;
                        for (b = f ? b: b[Symbol.iterator]();;) {
                            if (f) {
                                if (g >= b.length) break;
                                e = b[g++]
                            } else {
                                g = b.next();
                                if (g.done) break;
                                e = g.value
                            }
                            e.textContent = a.upload.file_alias
                        }
                        $jscomp.initSymbol();
                        $jscomp.initSymbolIterator();
                        b = a.previewElement.querySelectorAll("[data-dz-msg-value]");
                        f = !0;
                        g = 0;
                        for (b = f ? b: b[Symbol.iterator]();;) {
                            if (f) {
                                if (g >= b.length) break;
                                e = b[g++]
                            } else {
                                g = b.next();
                                if (g.done) break;
                                e = g.value
                            }
                            e.value = a.upload.file_alias;
                            e.onblur = function(b) {
                                b = b.target.value;
                                b != a.upload.file_alias && confirm("\u4f60\u786e\u5b9a\u8981\u66f4\u65b0" + a.upload.file_alias + "\u540d\u5b57\u4e3a" + b + "\u5417\uff1f") && $.ajax({
                                    url: "" != a.upload.library ? rootPath + "/rest/library/" + a.upload.library + "/updatePersonnel/" + a.upload.filename + "?fileAlias=" + b: rootPath + "/rest/updatePersonnel/" + a.upload.filename + "?fileAlias=" + b,
                                    type: "GET",
                                    headers: {
                                        version: "1.0.0"
                                    },
                                    success: function(a) {
                                        200 != a.code && alert(a.msg)
                                    }
                                })
                            }
                        }
                        $jscomp.initSymbol();
                        $jscomp.initSymbolIterator();
                        b = a.previewElement.querySelectorAll("[data-dz-size]");
                        for (f = 0; ! (f >= b.length);) e = b[f++],
                        e.innerHTML = this.filesize(a.size);
                        this.options.addRemoveLinks && (a._removeLink = d.createElement('<a class="dz-remove" href="javascript:undefined;" data-dz-remove>' + this.options.dictRemoveFile + "</a>"), a.previewElement.appendChild(a._removeLink));
                        e = function(b) {
                            b.preventDefault();
                            b.stopPropagation();
                            return a.status === d.UPLOADING ? d.confirm(c.options.dictCancelUploadConfirmation,
                            function() {
                                return c.removeFile(a)
                            }) : c.options.dictRemoveFileConfirmation ? d.confirm(c.options.dictRemoveFileConfirmation,
                            function() {
                                "" == a.upload.library ? $.ajax({
                                    url: rootPath + "/rest/upload/" + a.upload.filename,
                                    type: "DELETE"
                                }) : $.ajax({
                                    url: rootPath + "/rest/library/" + a.upload.library + "/upload/" + a.upload.filename,
                                    type: "DELETE"
                                });
                                return c.removeFile(a)
                            }) : c.removeFile(a)
                        };
                        $jscomp.initSymbol();
                        $jscomp.initSymbolIterator();
                        b = a.previewElement.querySelectorAll("[data-dz-remove]");
                        for (f = 0; ! (f >= b.length);) b[f++].addEventListener("click", e)
                    }
                },
                removedfile: function(a) {
                    null != a.previewElement && null != a.previewElement.parentNode && a.previewElement.parentNode.removeChild(a.previewElement);
                    return this._updateMaxFilesReachedClass()
                },
                thumbnail: function(a, c) {
                    if (a.previewElement) {
                        a.previewElement.classList.remove("dz-file-preview");
                        $jscomp.initSymbol();
                        $jscomp.initSymbolIterator();
                        for (var b = a.previewElement.querySelectorAll("[data-dz-thumbnail]"), f = 0; ! (f >= b.length);) {
                            var d = b[f++];
                            d.alt = a.name;
                            d.setAttribute("data-url", c);
                            d.src = rootPath + "/image/pixel.gif"
                        }
                        return setTimeout(function() {
                            return a.previewElement.classList.add("dz-image-preview")
                        },
                        1)
                    }
                },
                error: function(a, c) {
                    if (a.previewElement) {
                        a.previewElement.classList.add("dz-error");
                        "String" !== typeof c && c.error && (c = c.error);
                        $jscomp.initSymbol();
                        $jscomp.initSymbolIterator();
                        for (var b = a.previewElement.querySelectorAll("[data-dz-errormessage]"), f = 0; ! (f >= b.length);) b[f++].textContent = c
                    }
                },
                errormultiple: function() {},
                processing: function(a) {
                    if (a.previewElement && (a.previewElement.classList.add("dz-processing"), a._removeLink)) return a._removeLink.innerHTML = this.options.dictCancelUpload
                },
                processingmultiple: function() {},
                uploadprogress: function(a, c, b) {
                    if (a.previewElement) for ($jscomp.initSymbol(), $jscomp.initSymbolIterator(), a = a.previewElement.querySelectorAll("[data-dz-uploadprogress]"), b = 0; ! (b >= a.length);) {
                        var f = a[b++];
                        "PROGRESS" === f.nodeName ? f.value = c: f.style.width = c + "%"
                    }
                },
                totaluploadprogress: function() {},
                sending: function() {},
                sendingmultiple: function() {},
                success: function(a) {
                    if (a.previewElement) return a.previewElement.classList.add("dz-success")
                },
                successmultiple: function() {},
                canceled: function(a) {
                    return this.emit("error", a, this.options.dictUploadCanceled)
                },
                canceledmultiple: function() {},
                complete: function(a) {
                    a._removeLink && (a._removeLink.innerHTML = this.options.dictRemoveFile);
                    if (a.previewElement) return a.previewElement.classList.add("dz-complete")
                },
                completemultiple: function() {},
                maxfilesexceeded: function() {},
                maxfilesreached: function() {},
                queuecomplete: function() {},
                addedfiles: function() {}
            };
            this.prototype._thumbnailQueue = [];
            this.prototype._processingThumbnail = !1
        }
    },
    {
        key: "extend",
        value: function(a) {
            for (var c = arguments.length,
            b = Array(1 < c ? c - 1 : 0), f = 1; f < c; f++) b[f - 1] = arguments[f];
            $jscomp.initSymbol();
            $jscomp.initSymbolIterator();
            for (c = 0; ! (c >= b.length);) {
                f = b[c++];
                for (var d in f) a[d] = f[d]
            }
            return a
        }
    }]);
    _createClass(d, [{
        key: "getAcceptedFiles",
        value: function() {
            return this.files.filter(function(a) {
                return a.accepted
            }).map(function(a) {
                return a
            })
        }
    },
    {
        key: "getRejectedFiles",
        value: function() {
            return this.files.filter(function(a) {
                return ! a.accepted
            }).map(function(a) {
                return a
            })
        }
    },
    {
        key: "getFilesWithStatus",
        value: function(a) {
            return this.files.filter(function(c) {
                return c.status === a
            }).map(function(a) {
                return a
            })
        }
    },
    {
        key: "getQueuedFiles",
        value: function() {
            return this.getFilesWithStatus(d.QUEUED)
        }
    },
    {
        key: "getUploadingFiles",
        value: function() {
            return this.getFilesWithStatus(d.UPLOADING)
        }
    },
    {
        key: "getAddedFiles",
        value: function() {
            return this.getFilesWithStatus(d.ADDED)
        }
    },
    {
        key: "getActiveFiles",
        value: function() {
            return this.files.filter(function(a) {
                return a.status === d.UPLOADING || a.status === d.QUEUED
            }).map(function(a) {
                return a
            })
        }
    },
    {
        key: "init",
        value: function() {
            var a = this;
            "form" === this.element.tagName && this.element.setAttribute("enctype", "multipart/form-data");
            this.element.classList.contains("dropzone") && !this.element.querySelector(".dz-message") && this.element.appendChild(d.createElement('<div class="dz-default dz-message"><span>' + this.options.dictDefaultMessage + "</span></div>"));
            this.clickableElements.length &&
            function h() {
                a.hiddenFileInput && a.hiddenFileInput.parentNode.removeChild(a.hiddenFileInput);
                a.hiddenFileInput = document.createElement("input");
                a.hiddenFileInput.setAttribute("type", "file"); (null === a.options.maxFiles || 1 < a.options.maxFiles) && a.hiddenFileInput.setAttribute("multiple", "multiple");
                a.hiddenFileInput.className = "dz-hidden-input";
                null !== a.options.acceptedFiles && a.hiddenFileInput.setAttribute("accept", a.options.acceptedFiles);
                null !== a.options.capture && a.hiddenFileInput.setAttribute("capture", a.options.capture);
                a.hiddenFileInput.style.visibility = "hidden";
                a.hiddenFileInput.style.position = "absolute";
                a.hiddenFileInput.style.top = "0";
                a.hiddenFileInput.style.left = "0";
                a.hiddenFileInput.style.height = "0";
                a.hiddenFileInput.style.width = "0";
                d.getElement(a.options.hiddenInputContainer, "hiddenInputContainer").appendChild(a.hiddenFileInput);
                return a.hiddenFileInput.addEventListener("change",
                function() {
                    var b = a.hiddenFileInput.files;
                    if (b.length) {
                        $jscomp.initSymbol();
                        $jscomp.initSymbolIterator();
                        for (var c = 0; ! (c >= b.length);) {
                            var f = b[c++];
                            a.addFile(f)
                        }
                    }
                    a.emit("addedfiles", b);
                    return h()
                })
            } ();
            this.URL = null !== window.URL ? window.URL: window.webkitURL;
            $jscomp.initSymbol();
            $jscomp.initSymbolIterator();
            for (var c = this.events,
            b = 0; ! (b >= c.length);) {
                var f = c[b++];
                this.on(f, this.options[f])
            }
            this.on("uploadprogress",
            function() {
                return a.updateTotalUploadProgress()
            });
            this.on("removedfile",
            function() {
                return a.updateTotalUploadProgress()
            });
            this.on("canceled",
            function(b) {
                return a.emit("complete", b)
            });
            this.on("complete",
            function(b) {
                if (0 === a.getAddedFiles().length && 0 === a.getUploadingFiles().length && 0 === a.getQueuedFiles().length) return setTimeout(function() {
                    return a.emit("queuecomplete")
                },
                0)
            });
            var e = function(a) {
                a.stopPropagation();
                return a.preventDefault ? a.preventDefault() : a.returnValue = !1
            };
            this.listeners = [{
                element: this.element,
                events: {
                    dragstart: function(b) {
                        return a.emit("dragstart", b)
                    },
                    dragenter: function(b) {
                        e(b);
                        return a.emit("dragenter", b)
                    },
                    dragover: function(b) {
                        var c = void 0;
                        try {
                            c = b.dataTransfer.effectAllowed
                        } catch(m) {}
                        b.dataTransfer.dropEffect = "move" === c || "linkMove" === c ? "move": "copy";
                        e(b);
                        return a.emit("dragover", b)
                    },
                    dragleave: function(b) {
                        return a.emit("dragleave", b)
                    },
                    drop: function(b) {
                        e(b);
                        return a.drop(b)
                    },
                    dragend: function(b) {
                        return a.emit("dragend", b)
                    }
                }
            }];
            this.clickableElements.forEach(function(b) {
                return a.listeners.push({
                    element: b,
                    events: {
                        click: function(c) { (b !== a.element || c.target === a.element || d.elementInside(c.target, a.element.querySelector(".dz-message"))) && a.hiddenFileInput.click();
                            return ! 0
                        }
                    }
                })
            });
            this.enable();
            return this.options.init.call(this)
        }
    },
    {
        key: "destroy",
        value: function() {
            this.disable();
            this.removeAllFiles(!0);
            null != this.hiddenFileInput && this.hiddenFileInput.parentNode && (this.hiddenFileInput.parentNode.removeChild(this.hiddenFileInput), this.hiddenFileInput = null);
            delete this.element.dropzone;
            return d.instances.splice(d.instances.indexOf(this), 1)
        }
    },
    {
        key: "updateTotalUploadProgress",
        value: function() {
            var a = 0,
            c = 0;
            if (this.getActiveFiles().length) {
                $jscomp.initSymbol();
                $jscomp.initSymbolIterator();
                var b = this.getActiveFiles();
                for (var f = 0; ! (f >= b.length);) {
                    var d = b[f++];
                    a += d.upload.bytesSent;
                    c += d.upload.total
                }
                b = 100 * a / c
            } else b = 100;
            return this.emit("totaluploadprogress", b, c, a)
        }
    },
    {
        key: "_getParamName",
        value: function(a) {
            return "function" === typeof this.options.paramName ? this.options.paramName(a) : "" + this.options.paramName + (this.options.uploadMultiple ? "[" + a + "]": "")
        }
    },
    {
        key: "_renameFile",
        value: function(a) {
            return "function" !== typeof this.options.renameFile ? a.name: this.options.renameFile(a)
        }
    },
    {
        key: "getFallbackForm",
        value: function() {
            var a, c = void 0;
            if (a = this.getExistingFallback()) return a;
            a = '<div class="dz-fallback">';
            this.options.dictFallbackText && (a += "<p>" + this.options.dictFallbackText + "</p>");
            a += '<input type="file" name="' + this._getParamName(0) + '" ' + (this.options.uploadMultiple ? 'multiple="multiple"': void 0) + ' /><input type="submit" value="Upload!"></div>';
            a = d.createElement(a);
            "FORM" !== this.element.tagName ? (c = d.createElement('<form action="' + this.options.url + '" enctype="multipart/form-data" method="' + this.options.method + '"></form>'), c.appendChild(a)) : (this.element.setAttribute("enctype", "multipart/form-data"), this.element.setAttribute("method", this.options.method));
            return null != c ? c: a
        }
    },
    {
        key: "getExistingFallback",
        value: function() {
            for (var a = ["div", "form"], c = 0; c < a.length; c++) {
                a: {
                    var b = this.element.getElementsByTagName(a[c]);
                    $jscomp.initSymbol();
                    $jscomp.initSymbolIterator();
                    for (var f = 0; ! (f >= b.length);) {
                        var d = b[f++];
                        if (/(^| )fallback($| )/.test(d.className)) {
                            b = d;
                            break a
                        }
                    }
                    b = void 0
                }
                if (b) return b
            }
        }
    },
    {
        key: "setupEventListeners",
        value: function() {
            return this.listeners.map(function(a) {
                var c = [],
                b;
                for (b in a.events) c.push(a.element.addEventListener(b, a.events[b], !1));
                return c
            })
        }
    },
    {
        key: "removeEventListeners",
        value: function() {
            return this.listeners.map(function(a) {
                var c = [],
                b;
                for (b in a.events) c.push(a.element.removeEventListener(b, a.events[b], !1));
                return c
            })
        }
    },
    {
        key: "disable",
        value: function() {
            var a = this;
            this.clickableElements.forEach(function(a) {
                return a.classList.remove("dz-clickable")
            });
            this.removeEventListeners();
            this.disabled = !0;
            return this.files.map(function(c) {
                return a.cancelUpload(c)
            })
        }
    },
    {
        key: "enable",
        value: function() {
            delete this.disabled;
            this.clickableElements.forEach(function(a) {
                return a.classList.add("dz-clickable")
            });
            return this.setupEventListeners()
        }
    },
    {
        key: "filesize",
        value: function(a) {
            var c = 0,
            b = "b";
            if (0 < a) {
                for (var f = ["tb", "gb", "mb", "kb", "b"], d = 0; d < f.length; d++) {
                    var e = f[d];
                    if (a >= Math.pow(this.options.filesizeBase, 4 - d) / 10) {
                        c = a / Math.pow(this.options.filesizeBase, 4 - d);
                        b = e;
                        break
                    }
                }
                c = Math.round(10 * c) / 10
            }
            return "<strong>" + c + "</strong> " + this.options.dictFileSizeUnits[b]
        }
    },
    {
        key: "_updateMaxFilesReachedClass",
        value: function() {
            return null != this.options.maxFiles && this.getAcceptedFiles().length >= this.options.maxFiles ? (this.getAcceptedFiles().length === this.options.maxFiles && this.emit("maxfilesreached", this.files), this.element.classList.add("dz-max-files-reached")) : this.element.classList.remove("dz-max-files-reached")
        }
    },
    {
        key: "drop",
        value: function(a) {
            if (a.dataTransfer) {
                this.emit("drop", a);
                for (var c = [], b = 0; b < a.dataTransfer.files.length; b++) c[b] = a.dataTransfer.files[b];
                this.emit("addedfiles", c);
                c.length && ((a = a.dataTransfer.items) && a.length && null != a[0].webkitGetAsEntry ? this._addFilesFromItems(a) : this.handleFiles(c))
            }
        }
    },
    {
        key: "paste",
        value: function(a) {
            if (null != __guard__(null != a ? a.clipboardData: void 0,
            function(a) {
                return a.items
            }) && (this.emit("paste", a), a = a.clipboardData.items, a.length)) return this._addFilesFromItems(a)
        }
    },
    {
        key: "handleFiles",
        value: function(a) {
            $jscomp.initSymbol();
            $jscomp.initSymbolIterator();
            for (var c = 0; ! (c >= a.length);) {
                var b = a[c++];
                this.addFile(b)
            }
        }
    },
    {
        key: "_addFilesFromItems",
        value: function(a) {
            var c = [];
            $jscomp.initSymbol();
            $jscomp.initSymbolIterator();
            for (var b = 0; ! (b >= a.length);) {
                var d = a[b++],
                e;
                null != d.webkitGetAsEntry && (e = d.webkitGetAsEntry()) ? e.isFile ? c.push(this.addFile(d.getAsFile())) : e.isDirectory ? c.push(this._addFilesFromDirectory(e, e.name)) : c.push(void 0) : null != d.getAsFile ? null == d.kind || "file" === d.kind ? c.push(this.addFile(d.getAsFile())) : c.push(void 0) : c.push(void 0)
            }
            return c
        }
    },
    {
        key: "_addFilesFromDirectory",
        value: function(a, c) {
            var b = this,
            d = a.createReader(),
            e = function(a) {
                return __guardMethod__(console, "log",
                function(b) {
                    return b.log(a)
                })
            };
            return function h() {
                return d.readEntries(function(a) {
                    if (0 < a.length) {
                        $jscomp.initSymbol();
                        $jscomp.initSymbolIterator();
                        for (var d = 0; ! (d >= a.length);) {
                            var f = a[d++];
                            f.isFile ? f.file(function(a) {
                                if (!b.options.ignoreHiddenFiles || "." !== a.name.substring(0, 1)) return a.fullPath = c + "/" + a.name,
                                b.addFile(a)
                            }) : f.isDirectory && b._addFilesFromDirectory(f, c + "/" + f.name)
                        }
                        h()
                    }
                    return null
                },
                e)
            } ()
        }
    },
    {
        key: "accept",
        value: function(a, c) {
            return this.options.maxFilesize && a.size > 1048576 * this.options.maxFilesize ? c(this.options.dictFileTooBig.replace("{{filesize}}", Math.round(a.size / 1024 / 10.24) / 100).replace("{{maxFilesize}}", this.options.maxFilesize)) : d.isValidFile(a, this.options.acceptedFiles) ? null != this.options.maxFiles && this.getAcceptedFiles().length >= this.options.maxFiles ? (c(this.options.dictMaxFilesExceeded.replace("{{maxFiles}}", this.options.maxFiles)), this.emit("maxfilesexceeded", a)) : this.options.accept.call(this, a, c) : c(this.options.dictInvalidFileType)
        }
    },
    {
        key: "addFile",
        value: function(a) {
            var c = this;
            a.upload = {
                uuid: d.uuidv4(),
                progress: 0,
                total: a.size,
                bytesSent: 0,
                filename: this._renameFile(a),
                chunked: this.options.chunking && (this.options.forceChunking || a.size > this.options.chunkSize),
                totalChunkCount: Math.ceil(a.size / this.options.chunkSize)
            };
            this.files.push(a);
            a.status = d.ADDED;
            this.emit("addedfile", a);
            this._enqueueThumbnail(a);
            return this.accept(a,
            function(b) {
                b ? (a.accepted = !1, c._errorProcessing([a], b)) : (a.accepted = !0, c.options.autoQueue && c.enqueueFile(a));
                return c._updateMaxFilesReachedClass()
            })
        }
    },
    {
        key: "enqueueFiles",
        value: function(a) {
            $jscomp.initSymbol();
            $jscomp.initSymbolIterator();
            for (var c = 0; ! (c >= a.length);) {
                var b = a[c++];
                this.enqueueFile(b)
            }
            return null
        }
    },
    {
        key: "enqueueFile",
        value: function(a) {
            var c = this;
            if (a.status === d.ADDED && !0 === a.accepted) {
                if (a.status = d.QUEUED, this.options.autoProcessQueue) return setTimeout(function() {
                    return c.processQueue()
                },
                0)
            } else throw Error("This file can't be queued because it has already been processed or was rejected.");
        }
    },
    {
        key: "_enqueueThumbnail",
        value: function(a) {
            var c = this;
            if (this.options.createImageThumbnails && a.type.match(/image.*/) && a.size <= 1048576 * this.options.maxThumbnailFilesize) return this._thumbnailQueue.push(a),
            setTimeout(function() {
                return c._processThumbnailQueue()
            },
            0)
        }
    },
    {
        key: "_processThumbnailQueue",
        value: function() {
            var a = this;
            if (!this._processingThumbnail && 0 !== this._thumbnailQueue.length) {
                this._processingThumbnail = !0;
                var c = this._thumbnailQueue.shift();
                return this.createThumbnail(c, this.options.thumbnailWidth, this.options.thumbnailHeight, this.options.thumbnailMethod, !0,
                function(b) {
                    a.emit("thumbnail", c, b);
                    a._processingThumbnail = !1;
                    return a._processThumbnailQueue()
                })
            }
        }
    },
    {
        key: "removeFile",
        value: function(a) {
            a.status === d.UPLOADING && this.cancelUpload(a);
            this.files = without(this.files, a);
            this.emit("removedfile", a);
            if (0 === this.files.length) return this.emit("reset")
        }
    },
    {
        key: "removeAllFiles",
        value: function(a) {
            null == a && (a = !1);
            $jscomp.initSymbol();
            $jscomp.initSymbolIterator();
            for (var c = this.files.slice(), b = 0; ! (b >= c.length);) {
                var f = c[b++]; (f.status !== d.UPLOADING || a) && this.removeFile(f)
            }
            return null
        }
    },
    {
        key: "resizeImage",
        value: function(a, c, b, f, e) {
            var g = this;
            return this.createThumbnail(a, c, b, f, !0,
            function(b, c) {
                if (null == c) return e(a);
                var f = g.options.resizeMimeType;
                null == f && (f = a.type);
                var h = c.toDataURL(f, g.options.resizeQuality);
                if ("image/jpeg" === f || "image/jpg" === f) h = ExifRestore.restore(a.dataURL, h);
                return e(d.dataURItoBlob(h))
            })
        }
    },
    {
        key: "createThumbnail",
        value: function(a, c, b, d, e, l) {
            var f = this,
            g = new FileReader;
            g.onload = function() {
                a.dataURL = g.result;
                if ("image/svg+xml" === a.type) null != l && l(g.result);
                else return f.createThumbnailFromUrl(a, c, b, d, e, l)
            };
            return g.readAsDataURL(a)
        }
    },
    {
        key: "createThumbnailFromUrl",
        value: function(a, c, b, d, e, l, h) {
            var f = this,
            g = document.createElement("img");
            h && (g.crossOrigin = h);
            g.onload = function() {
                var h = function(a) {
                    return a(1)
                };
                "undefined" !== typeof EXIF && null !== EXIF && e && (h = function(a) {
                    return EXIF.getData(g,
                    function() {
                        return a(EXIF.getTag(this, "Orientation"))
                    })
                });
                return h(function(e) {
                    a.width = g.width;
                    a.height = g.height;
                    var h = f.options.resize.call(f, a, c, b, d),
                    k = document.createElement("canvas"),
                    m = k.getContext("2d");
                    k.width = h.trgWidth;
                    k.height = h.trgHeight;
                    4 < e && (k.width = h.trgHeight, k.height = h.trgWidth);
                    switch (e) {
                    case 2:
                        m.translate(k.width, 0);
                        m.scale( - 1, 1);
                        break;
                    case 3:
                        m.translate(k.width, k.height);
                        m.rotate(Math.PI);
                        break;
                    case 4:
                        m.translate(0, k.height);
                        m.scale(1, -1);
                        break;
                    case 5:
                        m.rotate(.5 * Math.PI);
                        m.scale(1, -1);
                        break;
                    case 6:
                        m.rotate(.5 * Math.PI);
                        m.translate(0, -k.width);
                        break;
                    case 7:
                        m.rotate(.5 * Math.PI);
                        m.translate(k.height, -k.width);
                        m.scale( - 1, 1);
                        break;
                    case 8:
                        m.rotate( - .5 * Math.PI),
                        m.translate( - k.height, 0)
                    }
                    drawImageIOSFix(m, g, null != h.srcX ? h.srcX: 0, null != h.srcY ? h.srcY: 0, h.srcWidth, h.srcHeight, null != h.trgX ? h.trgX: 0, null != h.trgY ? h.trgY: 0, h.trgWidth, h.trgHeight);
                    e = k.toDataURL("image/png");
                    if (null != l) return l(e, k)
                })
            };
            null != l && (g.onerror = l);
            return g.src = a.dataURL
        }
    },
    {
        key: "processQueue",
        value: function() {
            var a = this.options.parallelUploads,
            c = this.getUploadingFiles().length,
            b = c;
            if (! (c >= a)) {
                var d = this.getQueuedFiles();
                if (0 < d.length) {
                    if (this.options.uploadMultiple) return this.processFiles(d.slice(0, a - c));
                    for (; b < a && d.length;) this.processFile(d.shift()),
                    b++
                }
            }
        }
    },
    {
        key: "processFile",
        value: function(a) {
            return this.processFiles([a])
        }
    },
    {
        key: "processFiles",
        value: function(a) {
            $jscomp.initSymbol();
            $jscomp.initSymbolIterator();
            for (var c = 0; ! (c >= a.length);) {
                var b = a[c++];
                b.processing = !0;
                b.status = d.UPLOADING;
                this.emit("processing", b)
            }
            this.options.uploadMultiple && this.emit("processingmultiple", a);
            return this.uploadFiles(a)
        }
    },
    {
        key: "_getFilesWithXhr",
        value: function(a) {
            return this.files.filter(function(c) {
                return c.xhr === a
            }).map(function(a) {
                return a
            })
        }
    },
    {
        key: "cancelUpload",
        value: function(a) {
            if (a.status === d.UPLOADING) {
                var c = this._getFilesWithXhr(a.xhr);
                $jscomp.initSymbol();
                $jscomp.initSymbolIterator();
                for (var b = 0; ! (b >= c.length);) c[b++].status = d.CANCELED;
                "undefined" !== typeof a.xhr && a.xhr.abort();
                $jscomp.initSymbol();
                $jscomp.initSymbolIterator();
                for (a = 0; ! (a >= c.length);) b = c[a++],
                this.emit("canceled", b);
                this.options.uploadMultiple && this.emit("canceledmultiple", c)
            } else if (a.status === d.ADDED || a.status === d.QUEUED) a.status = d.CANCELED,
            this.emit("canceled", a),
            this.options.uploadMultiple && this.emit("canceledmultiple", [a]);
            if (this.options.autoProcessQueue) return this.processQueue()
        }
    },
    {
        key: "resolveOption",
        value: function(a) {
            if ("function" === typeof a) {
                for (var c = arguments.length,
                b = Array(1 < c ? c - 1 : 0), d = 1; d < c; d++) b[d - 1] = arguments[d];
                return a.apply(this, b)
            }
            return a
        }
    },
    {
        key: "uploadFile",
        value: function(a) {
            return this.uploadFiles([a])
        }
    },
    {
        key: "uploadFiles",
        value: function(a) {
            var c = this;
            this._transformFiles(a,
            function(b) {
                if (a[0].upload.chunked) {
                    var f = a[0],
                    e = b[0],
                    l = 0;
                    f.upload.chunks = [];
                    var h = function() {
                        for (var b = 0; void 0 !== f.upload.chunks[b];) b++;
                        if (! (b >= f.upload.totalChunkCount)) {
                            l++;
                            var g = b * c.options.chunkSize,
                            h = Math.min(g + c.options.chunkSize, f.size);
                            g = {
                                name: c._getParamName(0),
                                data: e.webkitSlice ? e.webkitSlice(g, h) : e.slice(g, h),
                                filename: f.upload.filename,
                                chunkIndex: b
                            };
                            f.upload.chunks[b] = {
                                file: f,
                                index: b,
                                dataBlock: g,
                                status: d.UPLOADING,
                                progress: 0,
                                retries: 0
                            };
                            c._uploadData(a, [g])
                        }
                    };
                    f.upload.finishedChunkUpload = function(b) {
                        var e = !0;
                        b.status = d.SUCCESS;
                        b.dataBlock = null;
                        b.xhr = null;
                        for (b = 0; b < f.upload.totalChunkCount; b++) {
                            if (void 0 === f.upload.chunks[b]) return h();
                            f.upload.chunks[b].status !== d.SUCCESS && (e = !1)
                        }
                        e && c.options.chunksUploaded(f,
                        function() {
                            c._finished(a, "", null)
                        })
                    };
                    if (c.options.parallelChunkUploads) for (b = 0; b < f.upload.totalChunkCount; b++) h();
                    else h()
                } else {
                    for (var k = [], m = 0; m < a.length; m++) k[m] = {
                        name: c._getParamName(m),
                        data: b[m],
                        filename: a[m].upload.filename
                    };
                    c._uploadData(a, k)
                }
            })
        }
    },
    {
        key: "_getChunk",
        value: function(a, c) {
            for (var b = 0; b < a.upload.totalChunkCount; b++) if (void 0 !== a.upload.chunks[b] && a.upload.chunks[b].xhr === c) return a.upload.chunks[b]
        }
    },
    {
        key: "_uploadData",
        value: function(a, c) {
            var b = this,
            f = new XMLHttpRequest;
            $jscomp.initSymbol();
            $jscomp.initSymbolIterator();
            for (var e = 0; ! (e >= a.length);) a[e++].xhr = f;
            a[0].upload.chunked && (a[0].upload.chunks[c[0].chunkIndex].xhr = f);
            e = this.resolveOption(this.options.method, a);
            var l = this.resolveOption(this.options.url, a);
            f.open(e, l, !0);
            f.timeout = this.resolveOption(this.options.timeout, a);
            f.withCredentials = !!this.options.withCredentials;
            f.onload = function(c) {
                b._finishedUploading(a, f, c)
            };
            f.onerror = function() {
                b._handleUploadError(a, f)
            }; (null != f.upload ? f.upload: f).onprogress = function(c) {
                return b._updateFilesUploadProgress(a, f, c)
            };
            e = {
                Accept: "application/json",
                "Cache-Control": "no-cache",
                "X-Requested-With": "XMLHttpRequest"
            };
            this.options.headers && d.extend(e, this.options.headers);
            for (var h in e)(l = e[h]) && f.setRequestHeader(h, l);
            h = new FormData;
            if (this.options.params) {
                e = this.options.params;
                "function" === typeof e && (e = e.call(this, a, f, a[0].upload.chunked ? this._getChunk(a[0], f) : null));
                for (var k in e) h.append(k, e[k])
            }
            $jscomp.initSymbol();
            $jscomp.initSymbolIterator();
            for (k = 0; ! (k >= a.length);) e = a[k++],
            this.emit("sending", e, f, h);
            this.options.uploadMultiple && this.emit("sendingmultiple", a, f, h);
            this._addFormElementData(h);
            for (k = 0; k < c.length; k++) e = c[k],
            h.append(e.name, e.data, e.filename);
            this.submitRequest(f, h, a)
        }
    },
    {
        key: "_transformFiles",
        value: function(a, c) {
            for (var b = this,
            d = [], e = 0, l = function(f) {
                b.options.transformFile.call(b, a[f],
                function(b) {
                    d[f] = b; ++e === a.length && c(d)
                })
            },
            h = 0; h < a.length; h++) l(h)
        }
    },
    {
        key: "_addFormElementData",
        value: function(a) {
            if ("FORM" === this.element.tagName) {
                $jscomp.initSymbol();
                $jscomp.initSymbolIterator();
                for (var c = this.element.querySelectorAll("input, textarea, select, button"), b = 0; ! (b >= c.length);) {
                    var d = c[b++],
                    e = d.getAttribute("name"),
                    l = d.getAttribute("type");
                    l && (l = l.toLowerCase());
                    if ("undefined" !== typeof e && null !== e) if ("SELECT" === d.tagName && d.hasAttribute("multiple")) for ($jscomp.initSymbol(), $jscomp.initSymbolIterator(), d = d.options, l = 0; ! (l >= d.length);) {
                        var h = d[l++];
                        h.selected && a.append(e, h.value)
                    } else(!l || "checkbox" !== l && "radio" !== l || d.checked) && a.append(e, d.value)
                }
            }
        }
    },
    {
        key: "_updateFilesUploadProgress",
        value: function(a, c, b) {
            if ("undefined" !== typeof b) {
                var d = 100 * b.loaded / b.total;
                if (a[0].upload.chunked) {
                    var e = a[0];
                    c = this._getChunk(e, c);
                    c.progress = d;
                    c.total = b.total;
                    c.bytesSent = b.loaded;
                    e.upload.progress = 0;
                    e.upload.total = 0;
                    for (d = e.upload.bytesSent = 0; d < e.upload.totalChunkCount; d++) void 0 !== e.upload.chunks[d] && void 0 !== e.upload.chunks[d].progress && (e.upload.progress += e.upload.chunks[d].progress, e.upload.total += e.upload.chunks[d].total, e.upload.bytesSent += e.upload.chunks[d].bytesSent);
                    e.upload.progress /= e.upload.totalChunkCount
                } else for ($jscomp.initSymbol(), $jscomp.initSymbolIterator(), e = 0; ! (e >= a.length);) c = a[e++],
                c.upload.progress = d,
                c.upload.total = b.total,
                c.upload.bytesSent = b.loaded;
                $jscomp.initSymbol();
                $jscomp.initSymbolIterator();
                for (d = 0; ! (d >= a.length);) b = a[d++],
                this.emit("uploadprogress", b, b.upload.progress, b.upload.bytesSent)
            } else {
                b = !0;
                d = 100;
                $jscomp.initSymbol();
                $jscomp.initSymbolIterator();
                for (e = 0; ! (e >= a.length);) {
                    c = a[e++];
                    if (100 !== c.upload.progress || c.upload.bytesSent !== c.upload.total) b = !1;
                    c.upload.progress = d;
                    c.upload.bytesSent = c.upload.total
                }
                if (!b) for ($jscomp.initSymbol(), $jscomp.initSymbolIterator(), b = 0; ! (b >= a.length);) e = a[b++],
                this.emit("uploadprogress", e, d, e.upload.bytesSent)
            }
        }
    },
    {
        key: "_finishedUploading",
        value: function(a, c, b) {
            var e = void 0;
            if (a[0].status !== d.CANCELED && 4 === c.readyState) {
                if ("arraybuffer" !== c.responseType && "blob" !== c.responseType && (e = c.responseText, c.getResponseHeader("content-type") && ~c.getResponseHeader("content-type").indexOf("application/json"))) try {
                    e = JSON.parse(e)
                } catch(g) {
                    b = g,
                    e = "Invalid JSON response from server."
                }
                this._updateFilesUploadProgress(a);
                200 <= c.status && 300 > c.status ? a[0].upload.chunked ? a[0].upload.finishedChunkUpload(this._getChunk(a[0], c)) : this._finished(a, e, b) : this._handleUploadError(a, c, e)
            }
        }
    },
    {
        key: "_handleUploadError",
        value: function(a, c, b) {
            if (a[0].status !== d.CANCELED) {
                if (a[0].upload.chunked && this.options.retryChunks) {
                    var e = this._getChunk(a[0], c);
                    if (e.retries++<this.options.retryChunksLimit) {
                        this._uploadData(a, [e.dataBlock]);
                        return
                    }
                    console.warn("Retried this chunk too often. Giving up.")
                }
                $jscomp.initSymbol();
                $jscomp.initSymbolIterator();
                for (e = 0; ! (e >= a.length);) e++,
                this._errorProcessing(a, b || this.options.dictResponseError.replace("{{statusCode}}", c.status), c)
            }
        }
    },
    {
        key: "submitRequest",
        value: function(a, c, b) {
            a.send(c)
        }
    },
    {
        key: "_finished",
        value: function(a, c, b) {
            $jscomp.initSymbol();
            $jscomp.initSymbolIterator();
            for (var e = 0; ! (e >= a.length);) {
                var g = a[e++];
                g.status = d.SUCCESS;
                this.emit("success", g, c, b);
                this.emit("complete", g)
            }
            this.options.uploadMultiple && (this.emit("successmultiple", a, c, b), this.emit("completemultiple", a));
            if (this.options.autoProcessQueue) return this.processQueue()
        }
    },
    {
        key: "_errorProcessing",
        value: function(a, c, b) {
            $jscomp.initSymbol();
            $jscomp.initSymbolIterator();
            for (var e = 0; ! (e >= a.length);) {
                var g = a[e++];
                g.status = d.ERROR;
                this.emit("error", g, c, b);
                this.emit("complete", g)
            }
            this.options.uploadMultiple && (this.emit("errormultiple", a, c, b), this.emit("completemultiple", a));
            if (this.options.autoProcessQueue) return this.processQueue()
        }
    }], [{
        key: "uuidv4",
        value: function() {
            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,
            function(a) {
                var c = 16 * Math.random() | 0;
                return ("x" === a ? c: c & 3 | 8).toString(16)
            })
        }
    }]);
    return d
} (Emitter);
Dropzone.initClass();
Dropzone.version = "5.5.0";
Dropzone.options = {};
Dropzone.optionsForElement = function(e) {
    if (e.getAttribute("id")) return Dropzone.options[camelize(e.getAttribute("id"))]
};
Dropzone.instances = [];
Dropzone.forElement = function(e) {
    "string" === typeof e && (e = document.querySelector(e));
    if (null == (null != e ? e.dropzone: void 0)) throw Error("No Dropzone found for given element. This is probably because you're trying to access it before Dropzone had the time to initialize. Use the `init` option to setup any additional observers on your Dropzone.");
    return e.dropzone
};
Dropzone.autoDiscover = !0;
Dropzone.discover = function() {
    var e = void 0;
    if (document.querySelectorAll) e = document.querySelectorAll(".dropzone");
    else {
        e = [];
        var d = function(a) {
            var c = [];
            $jscomp.initSymbol();
            $jscomp.initSymbolIterator();
            for (var b = 0; ! (b >= a.length);) {
                var d = a[b++];
                /(^| )dropzone($| )/.test(d.className) ? c.push(e.push(d)) : c.push(void 0)
            }
            return c
        };
        d(document.getElementsByTagName("div"));
        d(document.getElementsByTagName("form"))
    }
    return function() {
        var a = [];
        $jscomp.initSymbol();
        $jscomp.initSymbolIterator();
        for (var c = e,
        b = 0; ! (b >= c.length);) {
            var d = c[b++]; ! 1 !== Dropzone.optionsForElement(d) ? a.push(new Dropzone(d)) : a.push(void 0)
        }
        return a
    } ()
};
Dropzone.blacklistedBrowsers = [/opera.*(Macintosh|Windows Phone).*version\/12/i];
Dropzone.isBrowserSupported = function() {
    var e = !0;
    if (window.File && window.FileReader && window.FileList && window.Blob && window.FormData && document.querySelector) if ("classList" in document.createElement("a")) {
        $jscomp.initSymbol();
        $jscomp.initSymbolIterator();
        for (var d = Dropzone.blacklistedBrowsers,
        a = 0; ! (a >= d.length);) d[a++].test(navigator.userAgent) && (e = !1)
    } else e = !1;
    else e = !1;
    return e
};
Dropzone.dataURItoBlob = function(e) {
    var d = atob(e.split(",")[1]);
    e = e.split(",")[0].split(":")[1].split(";")[0];
    for (var a = new ArrayBuffer(d.length), c = new Uint8Array(a), b = 0, f = d.length, g = 0 <= f; g ? b <= f: b >= f; g ? b++:b--) c[b] = d.charCodeAt(b);
    return new Blob([a], {
        type: e
    })
};
var without = function(e, d) {
    return e.filter(function(a) {
        return a !== d
    }).map(function(a) {
        return a
    })
},
camelize = function(e) {
    return e.replace(/[\-_](\w)/g,
    function(d) {
        return d.charAt(1).toUpperCase()
    })
};
Dropzone.createElement = function(e) {
    var d = document.createElement("div");
    d.innerHTML = e;
    return d.childNodes[0]
};
Dropzone.elementInside = function(e, d) {
    if (e === d) return ! 0;
    for (; e = e.parentNode;) if (e === d) return ! 0;
    return ! 1
};
Dropzone.getElement = function(e, d) {
    var a = void 0;
    "string" === typeof e ? a = document.querySelector(e) : null != e.nodeType && (a = e);
    if (null == a) throw Error("Invalid `" + d + "` option provided. Please provide a CSS selector or a plain HTML element.");
    return a
};
Dropzone.getElements = function(e, d) {
    var a = void 0,
    c = void 0;
    if (e instanceof Array) {
        c = [];
        try {
            $jscomp.initSymbol();
            $jscomp.initSymbolIterator();
            for (var b = 0; ! (b >= e.length);) a = e[b++],
            c.push(this.getElement(a, d))
        } catch(g) {
            c = null
        }
    } else if ("string" === typeof e) {
        c = [];
        $jscomp.initSymbol();
        $jscomp.initSymbolIterator();
        b = document.querySelectorAll(e);
        for (var f = 0; ! (f >= b.length);) a = b[f++],
        c.push(a)
    } else null != e.nodeType && (c = [e]);
    if (null == c || !c.length) throw Error("Invalid `" + d + "` option provided. Please provide a CSS selector, a plain HTML element or a list of those.");
    return c
};
Dropzone.confirm = function(e, d, a) {
    if (window.confirm(e)) return d();
    if (null != a) return a()
};
Dropzone.isValidFile = function(e, d) {
    if (!d) return ! 0;
    d = d.split(",");
    var a = e.type,
    c = a.replace(/\/.*$/, "");
    $jscomp.initSymbol();
    $jscomp.initSymbolIterator();
    for (var b = d,
    f = 0; ! (f >= b.length);) {
        var g = b[f++];
        g = g.trim();
        if ("." === g.charAt(0)) {
            if ( - 1 !== e.name.toLowerCase().indexOf(g.toLowerCase(), e.name.length - g.length)) return ! 0
        } else if (/\/\*$/.test(g)) {
            if (c === g.replace(/\/.*$/, "")) return ! 0
        } else if (a === g) return ! 0
    }
    return ! 1
};
"undefined" !== typeof jQuery && null !== jQuery && (jQuery.fn.dropzone = function(e) {
    return this.each(function() {
        return new Dropzone(this, e)
    })
});
"undefined" !== typeof module && null !== module ? module.exports = Dropzone: window.Dropzone = Dropzone;
Dropzone.ADDED = "added";
Dropzone.QUEUED = "queued";
Dropzone.ACCEPTED = Dropzone.QUEUED;
Dropzone.UPLOADING = "uploading";
Dropzone.PROCESSING = Dropzone.UPLOADING;
Dropzone.CANCELED = "canceled";
Dropzone.ERROR = "error";
Dropzone.SUCCESS = "success";
var detectVerticalSquash = function(e) {
    var d = e.naturalHeight,
    a = document.createElement("canvas");
    a.width = 1;
    a.height = d;
    a = a.getContext("2d");
    a.drawImage(e, 0, 0);
    e = a.getImageData(1, 0, 1, d).data;
    a = 0;
    for (var c = d,
    b = d; b > a;) 0 === e[4 * (b - 1) + 3] ? c = b: a = b,
    b = c + a >> 1;
    d = b / d;
    return 0 === d ? 1 : d
},
drawImageIOSFix = function(e, d, a, c, b, f, g, l, h, k) {
    var m = detectVerticalSquash(d);
    return e.drawImage(d, a, c, b, f, g, l, h, k / m)
},
ExifRestore = function() {
    function e() {
        _classCallCheck(this, e)
    }
    _createClass(e, null, [{
        key: "initClass",
        value: function() {
            this.KEY_STR = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
        }
    },
    {
        key: "encode64",
        value: function(d) {
            for (var a = "",
            c, b, e, g, l, h, k = 0; c = d[k++], b = d[k++], e = d[k++], g = c >> 2, c = (c & 3) << 4 | b >> 4, l = (b & 15) << 2 | e >> 6, h = e & 63, isNaN(b) ? l = h = 64 : isNaN(e) && (h = 64), a = a + this.KEY_STR.charAt(g) + this.KEY_STR.charAt(c) + this.KEY_STR.charAt(l) + this.KEY_STR.charAt(h), k < d.length;);
            return a
        }
    },
    {
        key: "restore",
        value: function(d, a) {
            if (!d.match("data:image/jpeg;base64,")) return a;
            var c = this.decode64(d.replace("data:image/jpeg;base64,", ""));
            c = this.slice2Segments(c);
            c = this.exifManipulation(a, c);
            return "data:image/jpeg;base64," + this.encode64(c)
        }
    },
    {
        key: "exifManipulation",
        value: function(d, a) {
            var c = this.getExifArray(a);
            c = this.insertExif(d, c);
            return new Uint8Array(c)
        }
    },
    {
        key: "getExifArray",
        value: function(d) {
            for (var a, c = 0; c < d.length;) {
                a = d[c];
                if (255 === a[0] & 225 === a[1]) return a;
                c++
            }
            return []
        }
    },
    {
        key: "insertExif",
        value: function(d, a) {
            var c = d.replace("data:image/jpeg;base64,", ""),
            b = this.decode64(c),
            e = b.indexOf(255, 3);
            c = b.slice(0, e);
            b = b.slice(e);
            c = c.concat(a);
            return c = c.concat(b)
        }
    },
    {
        key: "slice2Segments",
        value: function(d) {
            for (var a = 0,
            c = []; ! (255 === d[a] & 218 === d[a + 1]);) {
                if (255 === d[a] & 216 === d[a + 1]) a += 2;
                else {
                    var b = 256 * d[a + 2] + d[a + 3];
                    b = a + b + 2;
                    a = d.slice(a, b);
                    c.push(a);
                    a = b
                }
                if (a > d.length) break
            }
            return c
        }
    },
    {
        key: "decode64",
        value: function(d) {
            var a = 0,
            c = [];
            /[^A-Za-z0-9\+\/=]/g.exec(d) && console.warn("There were invalid base64 characters in the input text.\nValid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\nExpect errors in decoding.");
            for (d = d.replace(/[^A-Za-z0-9\+\/=]/g, "");;) {
                var b = this.KEY_STR.indexOf(d.charAt(a++));
                var e = this.KEY_STR.indexOf(d.charAt(a++));
                var g = this.KEY_STR.indexOf(d.charAt(a++));
                var l = this.KEY_STR.indexOf(d.charAt(a++));
                b = b << 2 | e >> 4;
                e = (e & 15) << 4 | g >> 2;
                var h = (g & 3) << 6 | l;
                c.push(b);
                64 !== g && c.push(e);
                64 !== l && c.push(h);
                if (! (a < d.length)) break
            }
            return c
        }
    }]);
    return e
} ();
ExifRestore.initClass();
var contentLoaded = function(e, d) {
    var a = !1,
    c = !0,
    b = e.document,
    f = b.documentElement,
    g = b.addEventListener ? "addEventListener": "attachEvent",
    l = b.addEventListener ? "removeEventListener": "detachEvent",
    h = b.addEventListener ? "": "on",
    k = function n(c) {
        if ("readystatechange" !== c.type || "complete" === b.readyState) if (("load" === c.type ? e: b)[l](h + c.type, n, !1), !a && (a = !0)) return d.call(e, c.type || c)
    },
    m = function n() {
        try {
            f.doScroll("left")
        } catch(p) {
            setTimeout(n, 50);
            return
        }
        return k("poll")
    };
    if ("complete" !== b.readyState) {
        if (b.createEventObject && f.doScroll) {
            try {
                c = !e.frameElement
            } catch(n) {}
            c && m()
        }
        b[g](h + "DOMContentLoaded", k, !1);
        b[g](h + "readystatechange", k, !1);
        return e[g](h + "load", k, !1)
    }
};
Dropzone._autoDiscoverFunction = function() {
    if (Dropzone.autoDiscover) return Dropzone.discover()
};
contentLoaded(window, Dropzone._autoDiscoverFunction);
function __guard__(e, d) {
    return "undefined" !== typeof e && null !== e ? d(e) : void 0
}
function __guardMethod__(e, d, a) {
    if ("undefined" !== typeof e && null !== e && "function" === typeof e[d]) return a(e, d)
};