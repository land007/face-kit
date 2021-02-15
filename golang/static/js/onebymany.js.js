var mouse_filename = '';
var mouseover = function(file) {//mouseout
    let filename = file.upload.library + '_' + file.name;
    if(mouse_filename != filename) {
        mouse_filename = filename
        console.log('mouseover ' + mouse_filename);
        console.log( all_data[mouse_filename]);
        data.items = all_data[mouse_filename];
    }
};
var all_data = {}; 
var data = new Vue({
    el: '#list-complete-demo',
    delimiters: ['${', '}'],
    data: {
        // items: [{feature_id:'951959df10ee3c6e4c90e8d22063cc4ea05b4fdd.jpg' , name: '1', match_score: 0},{feature_id:'0116000d4151abe2af7af4fb01b56e663fc4469a.jpg', name: '2', match_score: 0}],
        items: [],
        nextNum: 10
    },
    computed: {
        currentImage () {
            return function (n) {
                if(this.items[n].library != '') {
                    return rootPath + '/public/library/' + this.items[n].library +  '/' + this.items[n].feature_id.substring(0,2) + '/thumbnail_' + this.items[n].feature_id;
                } else {
                    return rootPath + '/public/uploads/' + this.items[n].feature_id.substring(0,2) + '/thumbnail_' + this.items[n].feature_id;
                }
            }
        }
    },
    methods: {
    }
});
Dropzone.options.myDropzone = {
    paramName: "file", // The name that will be used to transfer the file
    acceptedFiles: ".jpg,.png,.jpeg,.bmp", //上传的类型
//    headers: { "compare_id": "{{.cid}}", "library": "{{.lid}}" },//库id
    headers: { "compare_id": cid, "library": lid },//库id
    // maxFiles: 1,
    maxFilesize: 20, //文件大小，单位：MB
    addRemoveLinks:true,
    thumbnailWidth: null,
    thumbnailHeight: '120',
    init: function () {
        thisDropzone = this;
        this.on("success", function(file, body) {
            console.log("File " + file.name + " uploaded " + JSON.stringify(body));
            for (var _iterator7 = file.previewElement.querySelectorAll("[data-dz-msg]"), _isArray7 = true, _i7 = 0, _iterator7 = _isArray7 ? _iterator7 : _iterator7[Symbol.iterator]();;) {
                var _ref6;

                if (_isArray7) {
                    if (_i7 >= _iterator7.length) break;
                    _ref6 = _iterator7[_i7++];
                } else {
                    _i7 = _iterator7.next();
                    if (_i7.done) break;
                    _ref6 = _i7.value;
                }

                var node = _ref6;

                node.textContent = '比对' + options[thisDropzone.options.headers.library];
            }
            data.items = body.data;
            let _lid = thisDropzone.options.headers.library;
            file.upload.library = _lid;
            let filename = _lid + '_' + file.name;
            all_data[filename] = body.data;
        });
        this.on("removedfile", function(file) {
            console.log("File " + file.name + " removed");
        });
    }
};
var options = {};
var data2 = new Vue({
    el: '#app',
    delimiters: ['${', '}'],
    data: {
        lid: lid,
        level: level,
//        {{if .lid}}
//        url: rootPath + '/library/{{.lid}}',
//        {{else}}
//        url: rootPath + '/',
//        {{end}}
        options: [
            // { text: '苹果', value: 'apple' },
        ]
    },
    computed: {
    	url: function () {
    		if(this.lid != '') {
    			return rootPath + '/library/' + this.lid;
    		} else {
    			return rootPath + '/';
    		}
        }
    },
    methods: {
        onChange: function () {
            let url;
            if(this.lid != '') {
                url = rootPath + '/onebymany/library/'+this.lid;
//                this.url = rootPath + '/library/'+this.lid;
            } else {
                url = rootPath + '/onebymany/';
//                this.url = rootPath + '/';
            }
            window.history.pushState({}, 0, url);
            thisDropzone.options.headers.library=this.lid;
//            get(this.lid);
        }
    },
    created () {
        fetch(rootPath + '/rest/librarys', {headers: {version: '1.0.0'}})
            .then(response => response.json())
            .then(json=> {
                for(let i in json.data) {
                    options[json.data[i].value]=json.data[i].text;
                }
                console.log(JSON.stringify(json));
                this.options = json.data;
            })
    }
});