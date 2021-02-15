window.onresize = function() {
    loadImageOne()
};
Dropzone.options.myDropzone = {
    paramName: "file",
    acceptedFiles: ".jpg,.png,.jpeg,.bmp",
    headers: {
        compare_id: ":" + cid,
        library: lid
    },
    maxFilesize: 20,
    thumbnailWidth: null,
    thumbnailHeight: "120",
    init: function() {
        thisDropzone = this;
        this.on("success",
        function(a, d) {
            console.log("File " + a.name + " uploaded " + d);
            var b = a.previewElement.querySelectorAll("[data-dz-msg]"),
            e = !0,
            c = 0;
            for (b = e ? b: b[Symbol.iterator]();;) {
                if (e) {
                    if (c >= b.length) break;
                    var f = b[c++]
                } else {
                    c = b.next();
                    if (c.done) break;
                    f = c.value
                }
                f.textContent = d.match_score
            }
            b = a.previewElement.querySelectorAll("[data-dz-msg2]");
            e = !0;
            c = 0;
            for (b = e ? b: b[Symbol.iterator]();;) {
                if (e) {
                    if (c >= b.length) break;
                    f = b[c++]
                } else {
                    c = b.next();
                    if (c.done) break;
                    f = c.value
                }
                f.textContent = "\u5206";
                loadImageOne()
            }
        });
        this.on("removedfile",
        function(a) {
            console.log("File " + a.name + " removed")
        })
    }
};
var vue_data = new Vue({
    el: "#app",
    delimiters: ["${", "}"],
    data: {
        lid: lid,
        cid: cid,
        name: name,
        level: level,
        faceInfos: [],
        faceSeq: 0,
        pin: null
    },
    methods: {
        personnelSelection: function(a) {
            this.faceSeq != a && confirm("\u4f60\u786e\u5b9a\u8981\u66f4\u65b0" + fileAlias + "\u4e3a\u5934\u50cf" + (a + 1) + "\u5417\uff1f") && $.ajax({
                url: "" != this.lid ? rootPath + "/rest/library/" + this.lid + "/updatePersonnel/" + this.cid + "?faceSeq=" + a: rootPath + "/rest/updatePersonnel/" + this.cid + "?faceSeq=" + a,
                type: "GET",
                headers: {
                    version: "1.0.0"
                },
                success: function(d) {
                    200 == d.code ? (vue_data.faceSeq = a, loadImageOne()) : alert(d.msg)
                }
            })
        },
        personnelReName: function() {
            var a = $("#fileAlias")[0].value;
            this.name != a && confirm("\u4f60\u786e\u5b9a\u8981\u66f4\u65b0" + a + "\u540d\u5b57\u4e3a" + a + "\u5417\uff1f") && $.ajax({
                url: "" != this.lid ? rootPath + "/rest/library/" + this.lid + "/updatePersonnel/" + this.cid + "?fileAlias=" + a: rootPath + "/rest/updatePersonnel/" + this.cid + "?fileAlias=" + a,
                type: "GET",
                headers: {
                    version: "1.0.0"
                },
                success: function(d) {
                    200 == d.code && (vue_data.name = a)
                }
            })
        }
    }
});