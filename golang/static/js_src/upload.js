var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.arrayIteratorImpl = function(a) {
    var c = 0;
    return function() {
        return c < a.length ? {
            done: !1,
            value: a[c++]
        }: {
            done: !0
        }
    }
};
$jscomp.arrayIterator = function(a) {
    return {
        next: $jscomp.arrayIteratorImpl(a)
    }
};
$jscomp.ASSUME_ES5 = !1;
$jscomp.ASSUME_NO_NATIVE_MAP = !1;
$jscomp.ASSUME_NO_NATIVE_SET = !1;
$jscomp.SIMPLE_FROUND_POLYFILL = !1;
$jscomp.defineProperty = $jscomp.ASSUME_ES5 || "function" == typeof Object.defineProperties ? Object.defineProperty: function(a, c, b) {
    a != Array.prototype && a != Object.prototype && (a[c] = b.value)
};
$jscomp.getGlobal = function(a) {
    return "undefined" != typeof window && window === a ? a: "undefined" != typeof global && null != global ? global: a
};
$jscomp.global = $jscomp.getGlobal(this);
$jscomp.SYMBOL_PREFIX = "jscomp_symbol_";
$jscomp.initSymbol = function() {
    $jscomp.initSymbol = function() {};
    $jscomp.global.Symbol || ($jscomp.global.Symbol = $jscomp.Symbol)
};
$jscomp.SymbolClass = function(a, c) {
    this.$jscomp$symbol$id_ = a;
    $jscomp.defineProperty(this, "description", {
        configurable: !0,
        writable: !0,
        value: c
    })
};
$jscomp.SymbolClass.prototype.toString = function() {
    return this.$jscomp$symbol$id_
};
$jscomp.Symbol = function() {
    function a(b) {
        if (this instanceof a) throw new TypeError("Symbol is not a constructor");
        return new $jscomp.SymbolClass($jscomp.SYMBOL_PREFIX + (b || "") + "_" + c++, b)
    }
    var c = 0;
    return a
} ();
$jscomp.initSymbolIterator = function() {
    $jscomp.initSymbol();
    var a = $jscomp.global.Symbol.iterator;
    a || (a = $jscomp.global.Symbol.iterator = $jscomp.global.Symbol("Symbol.iterator"));
    "function" != typeof Array.prototype[a] && $jscomp.defineProperty(Array.prototype, a, {
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
    var a = $jscomp.global.Symbol.asyncIterator;
    a || (a = $jscomp.global.Symbol.asyncIterator = $jscomp.global.Symbol("Symbol.asyncIterator"));
    $jscomp.initSymbolAsyncIterator = function() {}
};
$jscomp.iteratorPrototype = function(a) {
    $jscomp.initSymbolIterator();
    a = {
        next: a
    };
    a[$jscomp.global.Symbol.iterator] = function() {
        return this
    };
    return a
};
var clear = function() {
    confirm("\u4f60\u786e\u5b9a\u8981\u6e05\u7a7a\u5417\uff1f") && $.ajax({
        url: "" != thisDropzone.options.headers.library ? rootPath + "/rest/library/" + thisDropzone.options.headers.library + "/uploads": rootPath + "/rest/uploads",
        type: "DELETE",
        headers: {
            Accept: "application/json; charset=utf-8",
            all: "eyecool"
        },
        success: function() {
            get(!0)
        }
    });
    return ! 1
},
add = function() {
    var a = prompt("\u8bf7\u8f93\u5165\u56fe\u5e93\u7684\u540d\u5b57", ""),
    c = rootPath + "/rest/librarys",
    b = [{
        Text: a,
        Value: a
    }];
    null != a && $.ajax({
        url: c,
        type: "POST",
        success: function(b) {
            200 == b.code ? fetch(rootPath + "/rest/librarys", {
                headers: {
                    version: "1.0.0"
                }
            }).then(function(a) {
                return a.json()
            }).then(function(b) {
                console.log(JSON.stringify(b));
                librarys.options = b.data;
                librarys.lid = a;
                librarys.onChange()
            }) : alert(b.msg)
        },
        data: JSON.stringify(b),
        contentType: "application/json; charset=utf-8"
    });
    return ! 1
},
del = function() {
    if (0 < thisDropzone.files.length) return alert("\u5220\u9664\u524d\u9700\u8981\u5148\u6e05\u7a7a\u8be5\u56fe\u5e93\uff01"),
    !1;
    var a = rootPath + "/rest/library/" + librarys.lid;
    null != name && $.ajax({
        url: a,
        type: "DELETE",
        success: function(a) {
            200 == a.code ? fetch(rootPath + "/rest/librarys", {
                headers: {
                    version: "1.0.0"
                }
            }).then(function(a) {
                return a.json()
            }).then(function(a) {
                console.log(JSON.stringify(a));
                librarys.options = a.data;
                librarys.lid = "";
                librarys.onChange()
            }) : alert(a.msg)
        },
        contentType: "application/json; charset=utf-8"
    });
    return ! 1
},
dels = {},
select = function(a) {
    a = $(a).children("div").get(0);
    var c = $(a).children("img").get(0);
    void 0 === dels[c.alt] ? dels[c.alt] = a: delete dels[c.alt];
    a.style.boxShadow = "rgb(11, 210, 241) 7px 7px 30px" == a.style.boxShadow ? "7px 7px 30px #888888": "7px 7px 30px #0bd2f1";
    0 < Object.getOwnPropertyNames(dels).length ? ($("#resetselect")[0].style.display = "", $("#delselect")[0].style.display = "") : ($("#resetselect")[0].style.display = "none", $("#delselect")[0].style.display = "none")
},
delselect = function() {
    _dels = [];
    for (var a in dels) _dels[_dels.length] = {
        identity_id: "",
        feature_id: a
    };
    0 < _dels.length ? confirm("\u4f60\u786e\u5b9a\u8981\u522a\u9664\u8fd9\u4e9b\u4eba\u5458\u5417\uff1f") && (a = JSON.stringify(_dels), $.ajax({
        url: "" != thisDropzone.options.headers.library ? rootPath + "/rest/library/" + thisDropzone.options.headers.library + "/uploads": rootPath + "/rest/uploads",
        type: "DELETE",
        headers: {
            Accept: "application/json; charset=utf-8"
        },
        data: a,
        success: function() {
            get(!0)
        }
    })) : alert("\u8bf7\u9009\u62e9\u8981\u5220\u9664\u7684\u4eba\u5458");
    return ! 1
},
resetselect = function() {
    for (var a in dels) dels[a].style.boxShadow = "7px 7px 30px #888888";
    $("#resetselect")[0].style.display = "none";
    $("#delselect")[0].style.display = "none";
    dels = {}
},
isbool = !0,
BOTTOM_OFFSET = 10,
scroll = function() {
    var a = $(window),
    c = window.innerHeight;
    a = a.scrollTop();
    var b = $(document).height();
    if (BOTTOM_OFFSET + a >= b - c && isbool) {
        isbool = !1;
        var e = setTimeout(function() {
            isbool = !0
        },
        1E3);
        get(!1,
        function() {
            isbool = !0;
            clearTimeout(e)
        })
    }
};
timeFormat = function(a, c) {
    var b = a.getMilliseconds().toString();
    1 == b.length && (b = "0" + b);
    2 == b.length && (b = "0" + b);
    b = {
        "M+": a.getMonth() + 1,
        "d+": a.getDate(),
        "h+": 0 == a.getHours() % 12 ? 12 : a.getHours() % 12,
        "H+": a.getHours(),
        "m+": a.getMinutes(),
        "s+": a.getSeconds(),
        "q+": Math.floor((a.getMonth() + 3) / 3),
        S: b
    };
    var e = {
        0 : "/u65e5",
        1 : "/u4e00",
        2 : "/u4e8c",
        3 : "/u4e09",
        4 : "/u56db",
        5 : "/u4e94",
        6 : "/u516d"
    };
    /(y+)/.test(c) && (c = c.replace(RegExp.$1, (a.getFullYear() + "").substr(4 - RegExp.$1.length)));
    /(E+)/.test(c) && (c = c.replace(RegExp.$1, (1 < RegExp.$1.length ? 2 < RegExp.$1.length ? "/u661f/u671f": "/u5468": "") + e[a.getDay() + ""]));
    for (var d in b)(new RegExp("(" + d + ")")).test(c) && (c = c.replace(RegExp.$1, 1 == RegExp.$1.length ? b[d] : ("00" + b[d]).substr(("" + b[d]).length)));
    return c
};
$(document).ready(function() {
    $(window).scroll(function() {
        scroll()
    })
});
var cursor = 1136185445E3,
doing = cursor,
get = function(a, c) {
    var b = (new Date).getTime();
    if (2E3 > b - doing) doing = b;
    else {
        b = thisDropzone.options.headers.library;
        b = "" != b ? rootPath + "/rest/library/" + b + "/uploads": rootPath + "/rest/uploads";
        a && (cursor = 1136185445E3);
        var e = timeFormat(new Date(cursor), "yyyy-MM-dd HH:mm:ss.S");
        console.log(e);
        $.get(b, {
            cursor: e,
            limit: 50
        },
        function(b) {
            b = b.data;
            a && (thisDropzone.cleaningUp = !0, thisDropzone.removeAllFiles(), thisDropzone.cleaningUp = !1);
            null != b && (c && c(), $.each(b,
            function(a, b) {
                var c = {
                    name: b.file_id,
                    size: b.file_size,
                    upload: {
                        filename: b.file_id,
                        library: b.library,
                        file_alias: b.file_alias
                    }
                };
                thisDropzone.emit("addedfile", c);
                "" == b.library ? thisDropzone.options.thumbnail.call(thisDropzone, c, rootPath + "/public/uploads/" + b.file_id.substring(0, 2) + "/thumbnail_" + b.file_id) : thisDropzone.options.thumbnail.call(thisDropzone, c, rootPath + "/public/library/" + b.library + "/" + b.file_id.substring(0, 2) + "/thumbnail_" + b.file_id);
                thisDropzone.emit("complete", c);
                thisDropzone.files.push(c);
                b.file_modtime > cursor && (cursor = b.file_modtime)
            }), 0 < b.length && ($(".scrollLoading").scrollLoading(), retext()), doing = cursor)
        })
    }
};
Dropzone.options.myDropzone = {
    paramName: "file",
    acceptedFiles: ".jpg,.png,.jpeg,.bmp",
    headers: {
        library: lid
    },
    maxFilesize: 20,
    thumbnailWidth: null,
    thumbnailHeight: "120",
    dictRemoveFileConfirmation: "\u4f60\u786e\u5b9a\u5220\u9664\u5417?",
    init: function() {
        thisDropzone = this;
        this.on("success",
        function(a, c) {
            console.log("uploaded " + JSON.stringify(c));
            a.upload.filename = c.data.file_id;
            a.upload.library = c.data.library;
            a.upload.file_alias = c.data.file_alias;
            c.data.file_modtime > cursor && (cursor = c.data.file_modtime);
            $jscomp.initSymbol();
            $jscomp.initSymbolIterator();
            var b = a.previewElement.querySelectorAll("[data-dz-msg]"),
            e = !0,
            d = 0;
            for (b = e ? b: b[Symbol.iterator]();;) {
                if (e) {
                    if (d >= b.length) break;
                    var f = b[d++]
                } else {
                    d = b.next();
                    if (d.done) break;
                    f = d.value
                }
                f.textContent = c.data.file_alias
            }
            $jscomp.initSymbol();
            $jscomp.initSymbolIterator();
            b = a.previewElement.querySelectorAll("[data-dz-msg-value]");
            e = !0;
            d = 0;
            for (b = e ? b: b[Symbol.iterator]();;) {
                if (e) {
                    if (d >= b.length) break;
                    f = b[d++]
                } else {
                    d = b.next();
                    if (d.done) break;
                    f = d.value
                }
                f.value = c.data.file_alias;
                f.onblur = function(a) {
                    a = a.target.value;
                    a != c.data.file_alias && confirm("\u4f60\u786e\u5b9a\u8981\u66f4\u65b0" + c.data.file_alias + "\u540d\u5b57\u4e3a" + a + "\u5417\uff1f") && $.ajax({
                        url: "" != c.data.library ? rootPath + "/rest/library/" + c.data.library + "/updatePersonnel/" + c.data.file_id + "?fileAlias=" + a: rootPath + "/rest/updatePersonnel/" + c.data.file_id + "?fileAlias=" + a,
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
            $(".scrollLoading").scrollLoading();
            $jscomp.initSymbol();
            $jscomp.initSymbolIterator();
            b = a.previewElement.querySelectorAll("[data-dz-thumbnail]");
            e = !0;
            d = 0;
            for (b = e ? b: b[Symbol.iterator]();;) {
                if (e) {
                    if (d >= b.length) break;
                    f = b[d++]
                } else {
                    d = b.next();
                    if (d.done) break;
                    f = d.value
                }
                f.onload = function(a) {
                    setArtist(this, JSON.parse(c.data.info))
                }
            }
            retext()
        });
        get(!1)
    }
};
var barOffSetTop = document.getElementById("bar").offsetTop;
window.addEventListener("scroll",
function(a) {
    barOffSetTop < document.body.scrollTop ? bar.classList.add("add-fixed") : bar.classList.remove("add-fixed")
});
var librarys = new Vue({
    el: "#app",
    delimiters: ["${", "}"],
    data: {
        lid: lid,
        level: level,
        options: []
    },
    computed: {
        url: function() {
            return "" != this.lid ? rootPath + "/onebymany/library/" + this.lid: rootPath + "/onebymany"
        }
    },
    methods: {
        onChange: function() {
            if ("" != this.lid) {
                var a = rootPath + "/library/" + this.lid;
                thisDropzone.options.url = rootPath + "/rest/library/" + this.lid + "/uploads"
            } else a = rootPath + "/",
            thisDropzone.options.url = rootPath + "/rest/uploads";
            window.history.pushState({},
            0, a);
            thisDropzone.options.headers.library = this.lid;
            resetselect();
            get(!0)
        }
    },
    created: function() {
        var a = this;
        fetch(rootPath + "/rest/librarys", {
            headers: {
                version: "1.0.0"
            }
        }).then(function(a) {
            return a.json()
        }).then(function(c) {
            console.log(JSON.stringify(c));
            a.options = c.data
        })
    }
});