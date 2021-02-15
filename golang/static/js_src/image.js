var setArtist = function(b, a) {
    var f = a.faceInfos;
    if (void 0 !== f) for (var g = 0; g < f.length; g++) {
        var e = f[g];
        try {
            e.rcItem = JSON.parse(e.rcItem)
        } catch(n) {}
        if (void 0 !== e.rcItem) {
            var k = b.width,
            d = b.height,
            l = b.offsetLeft,
            m = b.offsetTop,
            c = JSON.parse(e.headPosi);
            3 == c.length ? 70 < Math.abs(c[0]) ? c = "#ff99cc": 30 < Math.abs(c[0]) ? c = "#ff3333": 13 < Math.abs(c[1]) ? c = "#66ff99": 13 < Math.abs(c[2]) ? (n33++, c = "#00cc33") : c = "blue": c = "blue";
            c = "blue";
            a.faceSeq == g && (c = "red");
            l = parseFloat(l) + parseFloat(k) * parseFloat(e.rcItem[0]) + 2;
            m = parseFloat(m) + parseFloat(d) * parseFloat(e.rcItem[1]) + 2;
            k = parseFloat(k) * parseFloat(e.rcItem[2]);
            e = parseFloat(d) * parseFloat(e.rcItem[3]);
            d = document.createElement("Div");
            a.faceSeq == g && (d.onclick = function() {
                var a = b.getAttribute("cropping");
                window.open(a);
                return ! 1
            });
            if (1 < f.length) {
                var h = document.createElement("Div");
                h.style.position = "inherit";
                h.style.top = e + "px";
                h.style.backgroundColor = c;
                h.innerText = g + 1;
                d.append(h)
            }
            d.className = "kuang";
            d.style.position = "absolute";
            d.style.left = l + "px";
            d.style.top = m + "px";
            d.style.width = k + "px";
            d.style.height = e + "px";
            d.style.color = "white";
            void 0 === a.pin || "" == a.pin ? d.style.border = "1px solid " + c: a.faceSeq == g ? (d.style.border = "1px solid " + c, time = (new Date).getTime()) : d.style.border = "1px solid " + c;
            b.parentNode.append(d)
        }
    }
},
loadImage = function(b) {
    EXIF.getData(b,
    function() {
        var a = EXIF.getTag(this, "Artist");
        void 0 !== a ? (a = JSON.parse(a), setArtist(b, a)) : (a = b.src.replace("thumbnail_", "") + ".info.json", $.ajax({
            url: a,
            type: "GET",
            success: function(a) {
                setArtist(b, a)
            }
        }))
    })
},
IMG = null,
loadThumbnail = function(b) {
    var a = b.src.replace("thumbnail_", "") + ".info.json";
    $.ajax({
        url: a,
        type: "GET",
        success: function(a) {
            vue_data.faceInfos = a.faceInfos;
            vue_data.faceSeq = a.faceSeq;
            vue_data.pin = a.pin;
            setArtist(b, vue_data)
        }
    })
},
loadImageOne = function(b) {
    $(".kuang").remove();
    void 0 === b ? null != IMG && (b = IMG) : IMG = b;
    null == vue_data.pin ? EXIF.getData(b,
    function() {
        var a = EXIF.getTag(this, "Orientation");
        console.log("orient = " + a);
        if (void 0 !== a) switch (a) {
        case 8:
            $(b).css({
                transform:
                "rotate(-90deg)"
            });
            break;
        case 6:
            $(b).css({
                transform:
                "rotate(90deg)"
            });
            break;
        case 3:
            $(b).css({
                transform:
                "rotate(180deg)"
            })
        }
        a = EXIF.getTag(this, "Artist");
        console.log("artist = " + a);
        if (void 0 !== a) try {
            var f = JSON.parse(a);
            vue_data.faceInfos = f.faceInfos;
            vue_data.faceSeq = f.faceSeq;
            vue_data.pin = f.pin;
            setArtist(b, f)
        } catch(g) {
            loadThumbnail(b)
        } else loadThumbnail(b)
    }) : setArtist(b, vue_data)
},
playAudo = function(b) { (new Audio(b)).play()
};