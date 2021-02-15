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
        for (var b = 0; b < a.length; b++) {
            var c = a[b];
            c.enumerable = c.enumerable || !1;
            c.configurable = !0;
            "value" in c && (c.writable = !0);
            Object.defineProperty(d, c.key, c)
        }
    }
    return function(d, a, b) {
        a && e(d.prototype, a);
        b && e(d, b);
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
                for (var b = arguments.length,
                c = Array(1 < b ? b - 1 : 0), f = 1; f < b; f++) c[f - 1] = arguments[f];
                $jscomp.initSymbol();
                $jscomp.initSymbolIterator();
                for (b = 0; ! (b >= a.length);) a[b++].apply(this, c)
            }
            return this
        }
    },
    {
        key: "off",
        value: function(d, a) {
            if (!this._callbacks || 0 === arguments.length) return this._callbacks = {},
            this;
            var b = this._callbacks[d];
            if (!b) return this;
            if (1 === arguments.length) return delete this._callbacks[d],
            this;
            for (var c = 0; c < b.length; c++) if (b[c] === a) {
                b.splice(c, 1);
                break
            }
            return this
        }
    }]);
    return e
} (),
Dropzone = function(e) {
    function d(a, b) {
        _classCallCheck(this, d);
        var c = _possibleConstructorReturn(this, (d.__proto__ || Object.getPrototypeOf(d)).call(this)),
        f = void 0,
        h = void 0;
        c.element = a;
        c.version = d.version;
        c.defaultOptions.previewTemplate = c.defaultOptions.previewTemplate.replace(/\n*/g, "");
        c.clickableElements = [];
        c.listeners = [];
        c.files = [];
        "string" === typeof c.element && (c.element = document.querySelector(c.element));
        if (!c.element || null == c.element.nodeType) throw Error("Invalid dropzone element.");
        if (c.element.dropzone) throw Error("Dropzone already attached.");
        d.instances.push(c);
        c.element.dropzone = c;
        var e = null != (h = d.optionsForElement(c.element)) ? h: {};
        c.options = d.extend({},
        c.defaultOptions, e, null != b ? b: {});
        if (c.options.forceFallback || !d.isBrowserSupported()) {
            var g;
            return g = c.options.fallback.call(c),
            _possibleConstructorReturn(c, g)
        }
        null == c.options.url && (c.options.url = c.element.getAttribute("action"));
        if (!c.options.url) throw Error("No URL provided.");
        if (c.options.acceptedFiles && c.options.acceptedMimeTypes) throw Error("You can't provide both 'acceptedFiles' and 'acceptedMimeTypes'. 'acceptedMimeTypes' is deprecated.");
        if (c.options.uploadMultiple && c.options.chunking) throw Error("You cannot set both: uploadMultiple and chunking.");
        c.options.acceptedMimeTypes && (c.options.acceptedFiles = c.options.acceptedMimeTypes, delete c.options.acceptedMimeTypes);
        null != c.options.renameFilename && (c.options.renameFile = function(a) {
            return c.options.renameFilename.call(c, a.name, a)
        });
        c.options.method = c.options.method.toUpperCase(); (f = c.getExistingFallback()) && f.parentNode && f.parentNode.removeChild(f); ! 1 !== c.options.previewsContainer && (c.previewsContainer = c.options.previewsContainer ? d.getElement(c.options.previewsContainer, "previewsContainer") : c.element);
        c.options.clickable && (c.clickableElements = !0 === c.options.clickable ? [c.element] : d.getElements(c.options.clickable, "clickable"));
        c.init();
        return c
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
                dictDefaultMessage: "\u62d6\u52a8\u56fe\u7247\u6587\u4ef6\u5230\u8fd9\u91cc\u6bd4\u5bf9",
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
                params: function(a, b, c) {
                    if (c) return {
                        dzuuid: c.file.upload.uuid,
                        dzchunkindex: c.index,
                        dztotalfilesize: c.file.size,
                        dzchunksize: this.options.chunkSize,
                        dztotalchunkcount: c.file.upload.totalChunkCount,
                        dzchunkbyteoffset: c.index * this.options.chunkSize
                    }
                },
                accept: function(a, b) {
                    return b()
                },
                chunksUploaded: function(a, b) {
                    b()
                },
                fallback: function() {
                    var a = void 0;
                    this.element.className += " dz-browser-not-supported";
                    $jscomp.initSymbol();
                    $jscomp.initSymbolIterator();
                    for (var b = this.element.getElementsByTagName("div"), c = 0; ! (c >= b.length);) {
                        var f = b[c++];
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
                resize: function(a, b, c, f) {
                    var d = {
                        srcX: 0,
                        srcY: 0,
                        srcWidth: a.width,
                        srcHeight: a.height
                    },
                    e = a.width / a.height;
                    null == b && null == c ? (b = d.srcWidth, c = d.srcHeight) : null == b ? b = c * e: null == c && (c = b / e);
                    b = Math.min(b, d.srcWidth);
                    c = Math.min(c, d.srcHeight);
                    var g = b / c;
                    if (d.srcWidth > b || d.srcHeight > c) if ("crop" === f) e > g ? (d.srcHeight = a.height, d.srcWidth = d.srcHeight * g) : (d.srcWidth = a.width, d.srcHeight = d.srcWidth / g);
                    else if ("contain" === f) e > g ? c = b / e: b = c * e;
                    else throw Error("Unknown resizeMethod '" + f + "'");
                    d.srcX = (a.width - d.srcWidth) / 2;
                    d.srcY = (a.height - d.srcHeight) / 2;
                    d.trgWidth = b;
                    d.trgHeight = c;
                    return d
                },
                transformFile: function(a, b) {
                    return (this.options.resizeWidth || this.options.resizeHeight) && a.type.match(/image.*/) ? this.resizeImage(a, this.options.resizeWidth, this.options.resizeHeight, this.options.resizeMethod, b) : b(a)
                },
                previewTemplate: '<div class="dz-preview dz-file-preview">\n  <div class="dz-image"><img data-dz-thumbnail /></div>\n  <div class="dz-details">\n    <div class="dz-size"><span data-dz-size></span></div>\n    <div class="dz-filename"><a href="javascript:undefined;" data-dz-remove><span>\u5220\u9664\u6587\u4ef6</span></a></div>\n  </div>\n  <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>\n  <div class="dz-error-message"><span data-dz-errormessage></span></div>\n  <div class="dz-success-mark">\n    <svg width="54px" height="54px" viewBox="0 0 54 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns">\n      <title>Check</title>\n      <defs></defs>\n      <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">\n        <path d="M23.5,31.8431458 L17.5852419,25.9283877 C16.0248253,24.3679711 13.4910294,24.366835 11.9289322,25.9289322 C10.3700136,27.4878508 10.3665912,30.0234455 11.9283877,31.5852419 L20.4147581,40.0716123 C20.5133999,40.1702541 20.6159315,40.2626649 20.7218615,40.3488435 C22.2835669,41.8725651 24.794234,41.8626202 26.3461564,40.3106978 L43.3106978,23.3461564 C44.8771021,21.7797521 44.8758057,19.2483887 43.3137085,17.6862915 C41.7547899,16.1273729 39.2176035,16.1255422 37.6538436,17.6893022 L23.5,31.8431458 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z" id="Oval-2" stroke-opacity="0.198794158" stroke="#747474" fill-opacity="0.816519475" fill="#FFFFFF" sketch:type="MSShapeGroup"></path>\n      </g>\n    </svg>\n  </div>\n  <div class="dz-error-mark">\n    <svg width="54px" height="54px" viewBox="0 0 54 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns">\n      <title>Error</title>\n      <defs></defs>\n      <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">\n        <g id="Check-+-Oval-2" sketch:type="MSLayerGroup" stroke="#747474" stroke-opacity="0.198794158" fill="#FFFFFF" fill-opacity="0.816519475">\n          <path d="M32.6568542,29 L38.3106978,23.3461564 C39.8771021,21.7797521 39.8758057,19.2483887 38.3137085,17.6862915 C36.7547899,16.1273729 34.2176035,16.1255422 32.6538436,17.6893022 L27,23.3431458 L21.3461564,17.6893022 C19.7823965,16.1255422 17.2452101,16.1273729 15.6862915,17.6862915 C14.1241943,19.2483887 14.1228979,21.7797521 15.6893022,23.3461564 L21.3431458,29 L15.6893022,34.6538436 C14.1228979,36.2202479 14.1241943,38.7516113 15.6862915,40.3137085 C17.2452101,41.8726271 19.7823965,41.8744578 21.3461564,40.3106978 L27,34.6568542 L32.6538436,40.3106978 C34.2176035,41.8744578 36.7547899,41.8726271 38.3137085,40.3137085 C39.8758057,38.7516113 39.8771021,36.2202479 38.3106978,34.6538436 L32.6568542,29 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z" id="Oval-2" sketch:type="MSShapeGroup"></path>\n        </g>\n      </g>\n    </svg>\n  </div>\n  <div class="dz-msg"> <p class="p1" data-dz-msg></p> <p class="p2" data-dz-msg2></p> </div>\n</div>',
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
                    var b = this;
                    this.element === this.previewsContainer && this.element.classList.add("dz-started");
                    if (this.previewsContainer) {
                        a.previewElement = d.createElement(this.options.previewTemplate.trim());
                        a.previewTemplate = a.previewElement;
                        this.previewsContainer.appendChild(a.previewElement);
                        a.previewElement.addEventListener("mouseover",
                        function(b) {
                            b.preventDefault();
                            b.stopPropagation();
                            a.status !== d.UPLOADING && void 0 !== mouseover && mouseover(a)
                        });
                        a.previewElement.addEventListener("mouseout",
                        function(b) {
                            b.preventDefault();
                            b.stopPropagation();
                            a.status !== d.UPLOADING && void 0 != mouseout && mouseout(a)
                        });
                        $jscomp.initSymbol();
                        $jscomp.initSymbolIterator();
                        for (var c = a.previewElement.querySelectorAll("[data-dz-name]"), f = 0; ! (f >= c.length);) {
                            var h = c[f++];
                            h.textContent = a.name
                        }
                        $jscomp.initSymbol();
                        $jscomp.initSymbolIterator();
                        c = a.previewElement.querySelectorAll("[data-dz-size]");
                        for (f = 0; ! (f >= c.length);) h = c[f++],
                        h.innerHTML = this.filesize(a.size);
                        this.options.addRemoveLinks && (a._removeLink = d.createElement('<a class="dz-remove" href="javascript:undefined;" data-dz-remove>' + this.options.dictRemoveFile + "</a>"), a.previewElement.appendChild(a._removeLink));
                        h = function(c) {
                            c.preventDefault();
                            c.stopPropagation();
                            return a.status === d.UPLOADING ? d.confirm(b.options.dictCancelUploadConfirmation,
                            function() {
                                return b.removeFile(a)
                            }) : b.options.dictRemoveFileConfirmation ? d.confirm(b.options.dictRemoveFileConfirmation,
                            function() {
                                return b.removeFile(a)
                            }) : b.removeFile(a)
                        };
                        $jscomp.initSymbol();
                        $jscomp.initSymbolIterator();
                        c = a.previewElement.querySelectorAll("[data-dz-remove]");
                        for (f = 0; ! (f >= c.length);) c[f++].addEventListener("click", h)
                    }
                },
                removedfile: function(a) {
                    null != a.previewElement && null != a.previewElement.parentNode && a.previewElement.parentNode.removeChild(a.previewElement);
                    return this._updateMaxFilesReachedClass()
                },
                thumbnail: function(a, b) {
                    if (a.previewElement) {
                        a.previewElement.classList.remove("dz-file-preview");
                        $jscomp.initSymbol();
                        $jscomp.initSymbolIterator();
                        for (var c = a.previewElement.querySelectorAll("[data-dz-thumbnail]"), f = 0; ! (f >= c.length);) {
                            var d = c[f++];
                            d.alt = a.name;
                            d.src = b
                        }
                        return setTimeout(function() {
                            return a.previewElement.classList.add("dz-image-preview")
                        },
                        1)
                    }
                },
                error: function(a, b) {
                    if (a.previewElement) {
                        a.previewElement.classList.add("dz-error");
                        "String" !== typeof b && b.error && (b = b.error);
                        $jscomp.initSymbol();
                        $jscomp.initSymbolIterator();
                        for (var c = a.previewElement.querySelectorAll("[data-dz-errormessage]"), f = 0; ! (f >= c.length);) c[f++].textContent = b
                    }
                },
                errormultiple: function() {},
                processing: function(a) {
                    if (a.previewElement && (a.previewElement.classList.add("dz-processing"), a._removeLink)) return a._removeLink.innerHTML = this.options.dictCancelUpload
                },
                processingmultiple: function() {},
                uploadprogress: function(a, b, c) {
                    if (a.previewElement) for ($jscomp.initSymbol(), $jscomp.initSymbolIterator(), a = a.previewElement.querySelectorAll("[data-dz-uploadprogress]"), c = 0; ! (c >= a.length);) {
                        var f = a[c++];
                        "PROGRESS" === f.nodeName ? f.value = b: f.style.width = b + "%"
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
            for (var b = arguments.length,
            c = Array(1 < b ? b - 1 : 0), f = 1; f < b; f++) c[f - 1] = arguments[f];
            $jscomp.initSymbol();
            $jscomp.initSymbolIterator();
            for (b = 0; ! (b >= c.length);) {
                f = c[b++];
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
            return this.files.filter(function(b) {
                return b.status === a
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
            function g() {
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
                            var d = b[c++];
                            a.addFile(d)
                        }
                    }
                    a.emit("addedfiles", b);
                    return g()
                })
            } ();
            this.URL = null !== window.URL ? window.URL: window.webkitURL;
            $jscomp.initSymbol();
            $jscomp.initSymbolIterator();
            for (var b = this.events,
            c = 0; ! (c >= b.length);) {
                var f = b[c++];
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
            b = 0;
            if (this.getActiveFiles().length) {
                $jscomp.initSymbol();
                $jscomp.initSymbolIterator();
                var c = this.getActiveFiles();
                for (var d = 0; ! (d >= c.length);) {
                    var e = c[d++];
                    a += e.upload.bytesSent;
                    b += e.upload.total
                }
                c = 100 * a / b
            } else c = 100;
            return this.emit("totaluploadprogress", c, b, a)
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
            var a, b = void 0;
            if (a = this.getExistingFallback()) return a;
            a = '<div class="dz-fallback">';
            this.options.dictFallbackText && (a += "<p>" + this.options.dictFallbackText + "</p>");
            a += '<input type="file" name="' + this._getParamName(0) + '" ' + (this.options.uploadMultiple ? 'multiple="multiple"': void 0) + ' /><input type="submit" value="Upload!"></div>';
            a = d.createElement(a);
            "FORM" !== this.element.tagName ? (b = d.createElement('<form action="' + this.options.url + '" enctype="multipart/form-data" method="' + this.options.method + '"></form>'), b.appendChild(a)) : (this.element.setAttribute("enctype", "multipart/form-data"), this.element.setAttribute("method", this.options.method));
            return null != b ? b: a
        }
    },
    {
        key: "getExistingFallback",
        value: function() {
            for (var a = ["div", "form"], b = 0; b < a.length; b++) {
                a: {
                    var c = this.element.getElementsByTagName(a[b]);
                    $jscomp.initSymbol();
                    $jscomp.initSymbolIterator();
                    for (var d = 0; ! (d >= c.length);) {
                        var e = c[d++];
                        if (/(^| )fallback($| )/.test(e.className)) {
                            c = e;
                            break a
                        }
                    }
                    c = void 0
                }
                if (c) return c
            }
        }
    },
    {
        key: "setupEventListeners",
        value: function() {
            return this.listeners.map(function(a) {
                var b = [],
                c;
                for (c in a.events) b.push(a.element.addEventListener(c, a.events[c], !1));
                return b
            })
        }
    },
    {
        key: "removeEventListeners",
        value: function() {
            return this.listeners.map(function(a) {
                var b = [],
                c;
                for (c in a.events) b.push(a.element.removeEventListener(c, a.events[c], !1));
                return b
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
            return this.files.map(function(b) {
                return a.cancelUpload(b)
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
            var b = 0,
            c = "b";
            if (0 < a) {
                for (var d = ["tb", "gb", "mb", "kb", "b"], e = 0; e < d.length; e++) {
                    var l = d[e];
                    if (a >= Math.pow(this.options.filesizeBase, 4 - e) / 10) {
                        b = a / Math.pow(this.options.filesizeBase, 4 - e);
                        c = l;
                        break
                    }
                }
                b = Math.round(10 * b) / 10
            }
            return "<strong>" + b + "</strong> " + this.options.dictFileSizeUnits[c]
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
                for (var b = [], c = 0; c < a.dataTransfer.files.length; c++) b[c] = a.dataTransfer.files[c];
                this.emit("addedfiles", b);
                b.length && ((a = a.dataTransfer.items) && a.length && null != a[0].webkitGetAsEntry ? this._addFilesFromItems(a) : this.handleFiles(b))
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
            for (var b = 0; ! (b >= a.length);) {
                var c = a[b++];
                this.addFile(c)
            }
        }
    },
    {
        key: "_addFilesFromItems",
        value: function(a) {
            var b = [];
            $jscomp.initSymbol();
            $jscomp.initSymbolIterator();
            for (var c = 0; ! (c >= a.length);) {
                var d = a[c++],
                e;
                null != d.webkitGetAsEntry && (e = d.webkitGetAsEntry()) ? e.isFile ? b.push(this.addFile(d.getAsFile())) : e.isDirectory ? b.push(this._addFilesFromDirectory(e, e.name)) : b.push(void 0) : null != d.getAsFile ? null == d.kind || "file" === d.kind ? b.push(this.addFile(d.getAsFile())) : b.push(void 0) : b.push(void 0)
            }
            return b
        }
    },
    {
        key: "_addFilesFromDirectory",
        value: function(a, b) {
            var c = this,
            d = a.createReader(),
            e = function(a) {
                return __guardMethod__(console, "log",
                function(b) {
                    return b.log(a)
                })
            };
            return function g() {
                return d.readEntries(function(a) {
                    if (0 < a.length) {
                        $jscomp.initSymbol();
                        $jscomp.initSymbolIterator();
                        for (var d = 0; ! (d >= a.length);) {
                            var f = a[d++];
                            f.isFile ? f.file(function(a) {
                                if (!c.options.ignoreHiddenFiles || "." !== a.name.substring(0, 1)) return a.fullPath = b + "/" + a.name,
                                c.addFile(a)
                            }) : f.isDirectory && c._addFilesFromDirectory(f, b + "/" + f.name)
                        }
                        g()
                    }
                    return null
                },
                e)
            } ()
        }
    },
    {
        key: "accept",
        value: function(a, b) {
            return this.options.maxFilesize && a.size > 1048576 * this.options.maxFilesize ? b(this.options.dictFileTooBig.replace("{{filesize}}", Math.round(a.size / 1024 / 10.24) / 100).replace("{{maxFilesize}}", this.options.maxFilesize)) : d.isValidFile(a, this.options.acceptedFiles) ? null != this.options.maxFiles && this.getAcceptedFiles().length >= this.options.maxFiles ? (b(this.options.dictMaxFilesExceeded.replace("{{maxFiles}}", this.options.maxFiles)), this.emit("maxfilesexceeded", a)) : this.options.accept.call(this, a, b) : b(this.options.dictInvalidFileType)
        }
    },
    {
        key: "addFile",
        value: function(a) {
            var b = this;
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
            function(c) {
                c ? (a.accepted = !1, b._errorProcessing([a], c)) : (a.accepted = !0, b.options.autoQueue && b.enqueueFile(a));
                return b._updateMaxFilesReachedClass()
            })
        }
    },
    {
        key: "enqueueFiles",
        value: function(a) {
            $jscomp.initSymbol();
            $jscomp.initSymbolIterator();
            for (var b = 0; ! (b >= a.length);) {
                var c = a[b++];
                this.enqueueFile(c)
            }
            return null
        }
    },
    {
        key: "enqueueFile",
        value: function(a) {
            var b = this;
            if (a.status === d.ADDED && !0 === a.accepted) {
                if (a.status = d.QUEUED, this.options.autoProcessQueue) return setTimeout(function() {
                    return b.processQueue()
                },
                0)
            } else throw Error("This file can't be queued because it has already been processed or was rejected.");
        }
    },
    {
        key: "_enqueueThumbnail",
        value: function(a) {
            var b = this;
            if (this.options.createImageThumbnails && a.type.match(/image.*/) && a.size <= 1048576 * this.options.maxThumbnailFilesize) return this._thumbnailQueue.push(a),
            setTimeout(function() {
                return b._processThumbnailQueue()
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
                var b = this._thumbnailQueue.shift();
                return this.createThumbnail(b, this.options.thumbnailWidth, this.options.thumbnailHeight, this.options.thumbnailMethod, !0,
                function(c) {
                    a.emit("thumbnail", b, c);
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
            for (var b = this.files.slice(), c = 0; ! (c >= b.length);) {
                var f = b[c++]; (f.status !== d.UPLOADING || a) && this.removeFile(f)
            }
            return null
        }
    },
    {
        key: "resizeImage",
        value: function(a, b, c, f, e) {
            var h = this;
            return this.createThumbnail(a, b, c, f, !0,
            function(b, c) {
                if (null == c) return e(a);
                var f = h.options.resizeMimeType;
                null == f && (f = a.type);
                var g = c.toDataURL(f, h.options.resizeQuality);
                if ("image/jpeg" === f || "image/jpg" === f) g = ExifRestore.restore(a.dataURL, g);
                return e(d.dataURItoBlob(g))
            })
        }
    },
    {
        key: "createThumbnail",
        value: function(a, b, c, d, e, l) {
            var f = this,
            h = new FileReader;
            h.onload = function() {
                a.dataURL = h.result;
                if ("image/svg+xml" === a.type) null != l && l(h.result);
                else return f.createThumbnailFromUrl(a, b, c, d, e, l)
            };
            return h.readAsDataURL(a)
        }
    },
    {
        key: "createThumbnailFromUrl",
        value: function(a, b, c, d, e, l, g) {
            var f = this,
            h = document.createElement("img");
            g && (h.crossOrigin = g);
            h.onload = function() {
                var g = function(a) {
                    return a(1)
                };
                "undefined" !== typeof EXIF && null !== EXIF && e && (g = function(a) {
                    return EXIF.getData(h,
                    function() {
                        return a(EXIF.getTag(this, "Orientation"))
                    })
                });
                return g(function(e) {
                    a.width = h.width;
                    a.height = h.height;
                    var g = f.options.resize.call(f, a, b, c, d),
                    k = document.createElement("canvas"),
                    m = k.getContext("2d");
                    k.width = g.trgWidth;
                    k.height = g.trgHeight;
                    4 < e && (k.width = g.trgHeight, k.height = g.trgWidth);
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
                    drawImageIOSFix(m, h, null != g.srcX ? g.srcX: 0, null != g.srcY ? g.srcY: 0, g.srcWidth, g.srcHeight, null != g.trgX ? g.trgX: 0, null != g.trgY ? g.trgY: 0, g.trgWidth, g.trgHeight);
                    e = k.toDataURL("image/png");
                    if (null != l) return l(e, k)
                })
            };
            null != l && (h.onerror = l);
            return h.src = a.dataURL
        }
    },
    {
        key: "processQueue",
        value: function() {
            var a = this.options.parallelUploads,
            b = this.getUploadingFiles().length,
            c = b;
            if (! (b >= a)) {
                var d = this.getQueuedFiles();
                if (0 < d.length) {
                    if (this.options.uploadMultiple) return this.processFiles(d.slice(0, a - b));
                    for (; c < a && d.length;) this.processFile(d.shift()),
                    c++
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
            for (var b = 0; ! (b >= a.length);) {
                var c = a[b++];
                c.processing = !0;
                c.status = d.UPLOADING;
                this.emit("processing", c)
            }
            this.options.uploadMultiple && this.emit("processingmultiple", a);
            return this.uploadFiles(a)
        }
    },
    {
        key: "_getFilesWithXhr",
        value: function(a) {
            return this.files.filter(function(b) {
                return b.xhr === a
            }).map(function(a) {
                return a
            })
        }
    },
    {
        key: "cancelUpload",
        value: function(a) {
            if (a.status === d.UPLOADING) {
                var b = this._getFilesWithXhr(a.xhr);
                $jscomp.initSymbol();
                $jscomp.initSymbolIterator();
                for (var c = 0; ! (c >= b.length);) b[c++].status = d.CANCELED;
                "undefined" !== typeof a.xhr && a.xhr.abort();
                $jscomp.initSymbol();
                $jscomp.initSymbolIterator();
                for (a = 0; ! (a >= b.length);) c = b[a++],
                this.emit("canceled", c);
                this.options.uploadMultiple && this.emit("canceledmultiple", b)
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
                for (var b = arguments.length,
                c = Array(1 < b ? b - 1 : 0), d = 1; d < b; d++) c[d - 1] = arguments[d];
                return a.apply(this, c)
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
            var b = this;
            this._transformFiles(a,
            function(c) {
                if (a[0].upload.chunked) {
                    var f = a[0],
                    e = c[0],
                    l = 0;
                    f.upload.chunks = [];
                    var g = function() {
                        for (var c = 0; void 0 !== f.upload.chunks[c];) c++;
                        if (! (c >= f.upload.totalChunkCount)) {
                            l++;
                            var h = c * b.options.chunkSize,
                            g = Math.min(h + b.options.chunkSize, f.size);
                            h = {
                                name: b._getParamName(0),
                                data: e.webkitSlice ? e.webkitSlice(h, g) : e.slice(h, g),
                                filename: f.upload.filename,
                                chunkIndex: c
                            };
                            f.upload.chunks[c] = {
                                file: f,
                                index: c,
                                dataBlock: h,
                                status: d.UPLOADING,
                                progress: 0,
                                retries: 0
                            };
                            b._uploadData(a, [h])
                        }
                    };
                    f.upload.finishedChunkUpload = function(c) {
                        var e = !0;
                        c.status = d.SUCCESS;
                        c.dataBlock = null;
                        c.xhr = null;
                        for (c = 0; c < f.upload.totalChunkCount; c++) {
                            if (void 0 === f.upload.chunks[c]) return g();
                            f.upload.chunks[c].status !== d.SUCCESS && (e = !1)
                        }
                        e && b.options.chunksUploaded(f,
                        function() {
                            b._finished(a, "", null)
                        })
                    };
                    if (b.options.parallelChunkUploads) for (c = 0; c < f.upload.totalChunkCount; c++) g();
                    else g()
                } else {
                    for (var k = [], m = 0; m < a.length; m++) k[m] = {
                        name: b._getParamName(m),
                        data: c[m],
                        filename: a[m].upload.filename
                    };
                    b._uploadData(a, k)
                }
            })
        }
    },
    {
        key: "_getChunk",
        value: function(a, b) {
            for (var c = 0; c < a.upload.totalChunkCount; c++) if (void 0 !== a.upload.chunks[c] && a.upload.chunks[c].xhr === b) return a.upload.chunks[c]
        }
    },
    {
        key: "_uploadData",
        value: function(a, b) {
            var c = this,
            f = new XMLHttpRequest;
            $jscomp.initSymbol();
            $jscomp.initSymbolIterator();
            for (var e = 0; ! (e >= a.length);) a[e++].xhr = f;
            a[0].upload.chunked && (a[0].upload.chunks[b[0].chunkIndex].xhr = f);
            e = this.resolveOption(this.options.method, a);
            var l = this.resolveOption(this.options.url, a);
            f.open(e, l, !0);
            f.timeout = this.resolveOption(this.options.timeout, a);
            f.withCredentials = !!this.options.withCredentials;
            f.onload = function(b) {
                c._finishedUploading(a, f, b)
            };
            f.onerror = function() {
                c._handleUploadError(a, f)
            }; (null != f.upload ? f.upload: f).onprogress = function(b) {
                return c._updateFilesUploadProgress(a, f, b)
            };
            e = {
                Accept: "application/json",
                "Cache-Control": "no-cache",
                "X-Requested-With": "XMLHttpRequest"
            };
            this.options.headers && d.extend(e, this.options.headers);
            for (var g in e)(l = e[g]) && f.setRequestHeader(g, l);
            g = new FormData;
            if (this.options.params) {
                e = this.options.params;
                "function" === typeof e && (e = e.call(this, a, f, a[0].upload.chunked ? this._getChunk(a[0], f) : null));
                for (var k in e) g.append(k, e[k])
            }
            $jscomp.initSymbol();
            $jscomp.initSymbolIterator();
            for (k = 0; ! (k >= a.length);) e = a[k++],
            this.emit("sending", e, f, g);
            this.options.uploadMultiple && this.emit("sendingmultiple", a, f, g);
            this._addFormElementData(g);
            for (k = 0; k < b.length; k++) e = b[k],
            g.append(e.name, e.data, e.filename);
            this.submitRequest(f, g, a)
        }
    },
    {
        key: "_transformFiles",
        value: function(a, b) {
            for (var c = this,
            d = [], e = 0, l = function(f) {
                c.options.transformFile.call(c, a[f],
                function(c) {
                    d[f] = c; ++e === a.length && b(d)
                })
            },
            g = 0; g < a.length; g++) l(g)
        }
    },
    {
        key: "_addFormElementData",
        value: function(a) {
            if ("FORM" === this.element.tagName) {
                $jscomp.initSymbol();
                $jscomp.initSymbolIterator();
                for (var b = this.element.querySelectorAll("input, textarea, select, button"), c = 0; ! (c >= b.length);) {
                    var d = b[c++],
                    e = d.getAttribute("name"),
                    l = d.getAttribute("type");
                    l && (l = l.toLowerCase());
                    if ("undefined" !== typeof e && null !== e) if ("SELECT" === d.tagName && d.hasAttribute("multiple")) for ($jscomp.initSymbol(), $jscomp.initSymbolIterator(), d = d.options, l = 0; ! (l >= d.length);) {
                        var g = d[l++];
                        g.selected && a.append(e, g.value)
                    } else(!l || "checkbox" !== l && "radio" !== l || d.checked) && a.append(e, d.value)
                }
            }
        }
    },
    {
        key: "_updateFilesUploadProgress",
        value: function(a, b, c) {
            if ("undefined" !== typeof c) {
                var d = 100 * c.loaded / c.total;
                if (a[0].upload.chunked) {
                    var e = a[0];
                    b = this._getChunk(e, b);
                    b.progress = d;
                    b.total = c.total;
                    b.bytesSent = c.loaded;
                    e.upload.progress = 0;
                    e.upload.total = 0;
                    for (d = e.upload.bytesSent = 0; d < e.upload.totalChunkCount; d++) void 0 !== e.upload.chunks[d] && void 0 !== e.upload.chunks[d].progress && (e.upload.progress += e.upload.chunks[d].progress, e.upload.total += e.upload.chunks[d].total, e.upload.bytesSent += e.upload.chunks[d].bytesSent);
                    e.upload.progress /= e.upload.totalChunkCount
                } else for ($jscomp.initSymbol(), $jscomp.initSymbolIterator(), e = 0; ! (e >= a.length);) b = a[e++],
                b.upload.progress = d,
                b.upload.total = c.total,
                b.upload.bytesSent = c.loaded;
                $jscomp.initSymbol();
                $jscomp.initSymbolIterator();
                for (d = 0; ! (d >= a.length);) c = a[d++],
                this.emit("uploadprogress", c, c.upload.progress, c.upload.bytesSent)
            } else {
                c = !0;
                d = 100;
                $jscomp.initSymbol();
                $jscomp.initSymbolIterator();
                for (e = 0; ! (e >= a.length);) {
                    b = a[e++];
                    if (100 !== b.upload.progress || b.upload.bytesSent !== b.upload.total) c = !1;
                    b.upload.progress = d;
                    b.upload.bytesSent = b.upload.total
                }
                if (!c) for ($jscomp.initSymbol(), $jscomp.initSymbolIterator(), c = 0; ! (c >= a.length);) e = a[c++],
                this.emit("uploadprogress", e, d, e.upload.bytesSent)
            }
        }
    },
    {
        key: "_finishedUploading",
        value: function(a, b, c) {
            var e = void 0;
            if (a[0].status !== d.CANCELED && 4 === b.readyState) {
                if ("arraybuffer" !== b.responseType && "blob" !== b.responseType && (e = b.responseText, b.getResponseHeader("content-type") && ~b.getResponseHeader("content-type").indexOf("application/json"))) try {
                    e = JSON.parse(e)
                } catch(h) {
                    c = h,
                    e = "Invalid JSON response from server."
                }
                this._updateFilesUploadProgress(a);
                200 <= b.status && 300 > b.status ? a[0].upload.chunked ? a[0].upload.finishedChunkUpload(this._getChunk(a[0], b)) : this._finished(a, e, c) : this._handleUploadError(a, b, e)
            }
        }
    },
    {
        key: "_handleUploadError",
        value: function(a, b, c) {
            if (a[0].status !== d.CANCELED) {
                if (a[0].upload.chunked && this.options.retryChunks) {
                    var e = this._getChunk(a[0], b);
                    if (e.retries++<this.options.retryChunksLimit) {
                        this._uploadData(a, [e.dataBlock]);
                        return
                    }
                    console.warn("Retried this chunk too often. Giving up.")
                }
                $jscomp.initSymbol();
                $jscomp.initSymbolIterator();
                for (e = 0; ! (e >= a.length);) e++,
                this._errorProcessing(a, c || this.options.dictResponseError.replace("{{statusCode}}", b.status), b)
            }
        }
    },
    {
        key: "submitRequest",
        value: function(a, b, c) {
            a.send(b)
        }
    },
    {
        key: "_finished",
        value: function(a, b, c) {
            $jscomp.initSymbol();
            $jscomp.initSymbolIterator();
            for (var e = 0; ! (e >= a.length);) {
                var h = a[e++];
                h.status = d.SUCCESS;
                this.emit("success", h, b, c);
                this.emit("complete", h)
            }
            this.options.uploadMultiple && (this.emit("successmultiple", a, b, c), this.emit("completemultiple", a));
            if (this.options.autoProcessQueue) return this.processQueue()
        }
    },
    {
        key: "_errorProcessing",
        value: function(a, b, c) {
            $jscomp.initSymbol();
            $jscomp.initSymbolIterator();
            for (var e = 0; ! (e >= a.length);) {
                var h = a[e++];
                h.status = d.ERROR;
                this.emit("error", h, b, c);
                this.emit("complete", h)
            }
            this.options.uploadMultiple && (this.emit("errormultiple", a, b, c), this.emit("completemultiple", a));
            if (this.options.autoProcessQueue) return this.processQueue()
        }
    }], [{
        key: "uuidv4",
        value: function() {
            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,
            function(a) {
                var b = 16 * Math.random() | 0;
                return ("x" === a ? b: b & 3 | 8).toString(16)
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
            var b = [];
            $jscomp.initSymbol();
            $jscomp.initSymbolIterator();
            for (var c = 0; ! (c >= a.length);) {
                var d = a[c++];
                /(^| )dropzone($| )/.test(d.className) ? b.push(e.push(d)) : b.push(void 0)
            }
            return b
        };
        d(document.getElementsByTagName("div"));
        d(document.getElementsByTagName("form"))
    }
    return function() {
        var a = [];
        $jscomp.initSymbol();
        $jscomp.initSymbolIterator();
        for (var b = e,
        c = 0; ! (c >= b.length);) {
            var d = b[c++]; ! 1 !== Dropzone.optionsForElement(d) ? a.push(new Dropzone(d)) : a.push(void 0)
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
    for (var a = new ArrayBuffer(d.length), b = new Uint8Array(a), c = 0, f = d.length, h = 0 <= f; h ? c <= f: c >= f; h ? c++:c--) b[c] = d.charCodeAt(c);
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
    b = void 0;
    if (e instanceof Array) {
        b = [];
        try {
            $jscomp.initSymbol();
            $jscomp.initSymbolIterator();
            for (var c = 0; ! (c >= e.length);) a = e[c++],
            b.push(this.getElement(a, d))
        } catch(h) {
            b = null
        }
    } else if ("string" === typeof e) {
        b = [];
        $jscomp.initSymbol();
        $jscomp.initSymbolIterator();
        c = document.querySelectorAll(e);
        for (var f = 0; ! (f >= c.length);) a = c[f++],
        b.push(a)
    } else null != e.nodeType && (b = [e]);
    if (null == b || !b.length) throw Error("Invalid `" + d + "` option provided. Please provide a CSS selector, a plain HTML element or a list of those.");
    return b
};
Dropzone.confirm = function(e, d, a) {
    if (window.confirm(e)) return d();
    if (null != a) return a()
};
Dropzone.isValidFile = function(e, d) {
    if (!d) return ! 0;
    d = d.split(",");
    var a = e.type,
    b = a.replace(/\/.*$/, "");
    $jscomp.initSymbol();
    $jscomp.initSymbolIterator();
    for (var c = d,
    f = 0; ! (f >= c.length);) {
        var h = c[f++];
        h = h.trim();
        if ("." === h.charAt(0)) {
            if ( - 1 !== e.name.toLowerCase().indexOf(h.toLowerCase(), e.name.length - h.length)) return ! 0
        } else if (/\/\*$/.test(h)) {
            if (b === h.replace(/\/.*$/, "")) return ! 0
        } else if (a === h) return ! 0
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
    for (var b = d,
    c = d; c > a;) 0 === e[4 * (c - 1) + 3] ? b = c: a = c,
    c = b + a >> 1;
    d = c / d;
    return 0 === d ? 1 : d
},
drawImageIOSFix = function(e, d, a, b, c, f, h, l, g, k) {
    var m = detectVerticalSquash(d);
    return e.drawImage(d, a, b, c, f, h, l, g, k / m)
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
            b, c, e, h, l, g, k = 0; b = d[k++], c = d[k++], e = d[k++], h = b >> 2, b = (b & 3) << 4 | c >> 4, l = (c & 15) << 2 | e >> 6, g = e & 63, isNaN(c) ? l = g = 64 : isNaN(e) && (g = 64), a = a + this.KEY_STR.charAt(h) + this.KEY_STR.charAt(b) + this.KEY_STR.charAt(l) + this.KEY_STR.charAt(g), k < d.length;);
            return a
        }
    },
    {
        key: "restore",
        value: function(d, a) {
            if (!d.match("data:image/jpeg;base64,")) return a;
            var b = this.decode64(d.replace("data:image/jpeg;base64,", ""));
            b = this.slice2Segments(b);
            b = this.exifManipulation(a, b);
            return "data:image/jpeg;base64," + this.encode64(b)
        }
    },
    {
        key: "exifManipulation",
        value: function(d, a) {
            var b = this.getExifArray(a);
            b = this.insertExif(d, b);
            return new Uint8Array(b)
        }
    },
    {
        key: "getExifArray",
        value: function(d) {
            for (var a, b = 0; b < d.length;) {
                a = d[b];
                if (255 === a[0] & 225 === a[1]) return a;
                b++
            }
            return []
        }
    },
    {
        key: "insertExif",
        value: function(d, a) {
            var b = d.replace("data:image/jpeg;base64,", ""),
            c = this.decode64(b),
            e = c.indexOf(255, 3);
            b = c.slice(0, e);
            c = c.slice(e);
            b = b.concat(a);
            return b = b.concat(c)
        }
    },
    {
        key: "slice2Segments",
        value: function(d) {
            for (var a = 0,
            b = []; ! (255 === d[a] & 218 === d[a + 1]);) {
                if (255 === d[a] & 216 === d[a + 1]) a += 2;
                else {
                    var c = 256 * d[a + 2] + d[a + 3];
                    c = a + c + 2;
                    a = d.slice(a, c);
                    b.push(a);
                    a = c
                }
                if (a > d.length) break
            }
            return b
        }
    },
    {
        key: "decode64",
        value: function(d) {
            var a = 0,
            b = [];
            /[^A-Za-z0-9\+\/=]/g.exec(d) && console.warn("There were invalid base64 characters in the input text.\nValid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\nExpect errors in decoding.");
            for (d = d.replace(/[^A-Za-z0-9\+\/=]/g, "");;) {
                var c = this.KEY_STR.indexOf(d.charAt(a++));
                var e = this.KEY_STR.indexOf(d.charAt(a++));
                var h = this.KEY_STR.indexOf(d.charAt(a++));
                var l = this.KEY_STR.indexOf(d.charAt(a++));
                c = c << 2 | e >> 4;
                e = (e & 15) << 4 | h >> 2;
                var g = (h & 3) << 6 | l;
                b.push(c);
                64 !== h && b.push(e);
                64 !== l && b.push(g);
                if (! (a < d.length)) break
            }
            return b
        }
    }]);
    return e
} ();
ExifRestore.initClass();
var contentLoaded = function(e, d) {
    var a = !1,
    b = !0,
    c = e.document,
    f = c.documentElement,
    h = c.addEventListener ? "addEventListener": "attachEvent",
    l = c.addEventListener ? "removeEventListener": "detachEvent",
    g = c.addEventListener ? "": "on",
    k = function n(b) {
        if ("readystatechange" !== b.type || "complete" === c.readyState) if (("load" === b.type ? e: c)[l](g + b.type, n, !1), !a && (a = !0)) return d.call(e, b.type || b)
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
    if ("complete" !== c.readyState) {
        if (c.createEventObject && f.doScroll) {
            try {
                b = !e.frameElement
            } catch(n) {}
            b && m()
        }
        c[h](g + "DOMContentLoaded", k, !1);
        c[h](g + "readystatechange", k, !1);
        return e[h](g + "load", k, !1)
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