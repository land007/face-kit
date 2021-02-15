var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.arrayIteratorImpl = function(a) {
    var b = 0;
    return function() {
        return b < a.length ? {
            done: !1,
            value: a[b++]
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
$jscomp.defineProperty = $jscomp.ASSUME_ES5 || "function" == typeof Object.defineProperties ? Object.defineProperty: function(a, b, c) {
    a != Array.prototype && a != Object.prototype && (a[b] = c.value)
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
$jscomp.Symbol = function() {
    var a = 0;
    return function(b) {
        return $jscomp.SYMBOL_PREFIX + (b || "") + a++
    }
} ();
$jscomp.initSymbolIterator = function() {
    $jscomp.initSymbol();
    var a = $jscomp.global.Symbol.iterator;
    a || (a = $jscomp.global.Symbol.iterator = $jscomp.global.Symbol("iterator"));
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
    a || (a = $jscomp.global.Symbol.asyncIterator = $jscomp.global.Symbol("asyncIterator"));
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
var mouse_filename = "",
mouseover = function(a) {
    a = a.upload.library + "_" + a.name;
    mouse_filename != a && (mouse_filename = a, console.log("mouseover " + mouse_filename), console.log(all_data[mouse_filename]), data.items = all_data[mouse_filename])
},
all_data = {},
data = new Vue({
    el: "#list-complete-demo",
    delimiters: ["${", "}"],
    data: {
        items: [],
        nextNum: 10
    },
    computed: {
        currentImage: function() {
            return function(a) {
                return "" != this.items[a].library ? rootPath + "/public/library/" + this.items[a].library + "/" + this.items[a].feature_id.substring(0, 2) + "/thumbnail_" + this.items[a].feature_id: rootPath + "/public/uploads/" + this.items[a].feature_id.substring(0, 2) + "/thumbnail_" + this.items[a].feature_id
            }
        }
    },
    methods: {}
});
Dropzone.options.myDropzone = {
    paramName: "file",
    acceptedFiles: ".jpg,.png,.jpeg,.bmp",
    headers: {
        compare_id: cid,
        library: lid
    },
    maxFilesize: 20,
    addRemoveLinks: !0,
    thumbnailWidth: null,
    thumbnailHeight: "120",
    init: function() {
        thisDropzone = this;
        this.on("success",
        function(a, b) {
            console.log("File " + a.name + " uploaded " + JSON.stringify(b));
            $jscomp.initSymbol();
            $jscomp.initSymbolIterator();
            for (var c = a.previewElement.querySelectorAll("[data-dz-msg]"), d = 0; ! (d >= c.length);) c[d++].textContent = "\u6bd4\u5bf9" + options[thisDropzone.options.headers.library];
            data.items = b.data;
            c = thisDropzone.options.headers.library;
            a.upload.library = c;
            all_data[c + "_" + a.name] = b.data
        });
        this.on("removedfile",
        function(a) {
            console.log("File " + a.name + " removed")
        })
    }
};
var options = {},
data2 = new Vue({
    el: "#app",
    delimiters: ["${", "}"],
    data: {
        lid: lid,
        level: level,
        options: []
    },
    computed: {
        url: function() {
            return "" != this.lid ? rootPath + "/library/" + this.lid: rootPath + "/"
        }
    },
    methods: {
        onChange: function() {
            window.history.pushState({},
            0, "" != this.lid ? rootPath + "/onebymany/library/" + this.lid: rootPath + "/onebymany/");
            thisDropzone.options.headers.library = this.lid
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
        }).then(function(b) {
            for (var c in b.data) options[b.data[c].value] = b.data[c].text;
            console.log(JSON.stringify(b));
            a.options = b.data
        })
    }
});