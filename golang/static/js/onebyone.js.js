window.onresize = function() {
	loadImageOne();
};
Dropzone.options.myDropzone = {
    paramName: "file", // The name that will be used to transfer the file
    acceptedFiles: ".jpg,.png,.jpeg,.bmp", //上传的类型
//    headers: { "compare_id": ":{{.cid}}", "library": "{{.lid}}" },//人员id, 库id
    headers: { "compare_id": ":" + cid, "library": lid },//人员id, 库id
    maxFilesize: 20, //文件大小，单位：MB
//             addRemoveLinks:true,
    thumbnailWidth: null,
    thumbnailHeight: '120',
    init: function () {
        thisDropzone = this;
        this.on("success", function(file, body) {
            console.log("File " + file.name + " uploaded " + body);
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

                node.textContent = body.match_score;
            }
            for (var _iterator7 = file.previewElement.querySelectorAll("[data-dz-msg2]"), _isArray7 = true, _i7 = 0, _iterator7 = _isArray7 ? _iterator7 : _iterator7[Symbol.iterator]();;) {
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
                node.textContent = '分';
                loadImageOne();//宽度变化重新定位
            }
        });
        this.on("removedfile", function(file) {
            console.log("File " + file.name + " removed");
        });
    }
};
var vue_data = new Vue({
    el: '#app',
    delimiters: ['${', '}'],
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
    	personnelSelection: function (index) {
    		if(this.faceSeq != index) {
        		if (confirm('你确定要更新' + fileAlias + '为头像' + (index + 1) + '吗？')) {
        			//var url = 'http://192.168.0.96:8019/eye/rest/library/Elan/updatePersonnel/1111111111111_xixi:4T8xNjgFf4Rf9V9W8PoAYt4Q8V47NSbP.jpg?faceSeq=0';
        			if(this.lid != '') {
        				var url = rootPath + '/rest/library/' + this.lid + '/updatePersonnel/' + this.cid + '?faceSeq=' + index;
        			} else {
        				var url = rootPath + '/rest/updatePersonnel/' + this.cid + '?faceSeq=' + index;
        			}
        			$.ajax({
        		        url: url,
        		        type: 'GET',
        		        headers: {version: '1.0.0'},
        		        success: function(body) {
        		        	if(body.code == 200) {
        		        		vue_data.faceSeq = index;
                        		loadImageOne();
        		        	} else {
        		        		alert(body.msg);
        		        	}
        		        }
        		    });
        		}
    		}
        },
    	personnelReName: function () {
    		var fileAlias = $('#fileAlias')[0].value;
    		if(this.name == fileAlias) {
    			//alert('请修改姓名！');
    			return;
    		}
    		if (confirm('你确定要更新' + fileAlias + '名字为' + fileAlias + '吗？')) {
    			//var url = 'http://192.168.0.96:8019/eye/rest/library/Elan/updatePersonnel/1111111111111_xixi:4T8xNjgFf4Rf9V9W8PoAYt4Q8V47NSbP.jpg?faceSeq=0';
    			if(this.lid != '') {
    				var url = rootPath + '/rest/library/' + this.lid + '/updatePersonnel/' + this.cid + '?fileAlias=' + fileAlias;//faceSeq=' + this.faceSeq + '&
    			} else {
    				var url = rootPath + '/rest/updatePersonnel/' + this.cid + '?fileAlias=' + fileAlias;//faceSeq=' + this.faceSeq + '&
    			}
    			$.ajax({
    		        url: url,
    		        type: 'GET',
    		        headers: {version: '1.0.0'},
    		        success: function(body) {
    		        	if(body.code == 200) {
    		        		vue_data.name = fileAlias;
    		        	}
    		        }
    		    });
    		}
        }
    }
});