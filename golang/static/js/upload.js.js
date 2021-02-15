var clear = function() {
	if (confirm('你确定要清空吗？')){
		let url
		if(thisDropzone.options.headers.library != '') {
            url = rootPath + '/rest/library/'+thisDropzone.options.headers.library+'/uploads';
        } else {
            url = rootPath + '/rest/uploads';
        }
		$.ajax({
	        url: url,
	        type: 'DELETE',
	        headers: {
	            Accept: "application/json; charset=utf-8",
		        all: "eyecool"
	        },
	        success: function(){
	        	get(true);
	        },
	    });
	}
	return false;
};

var add = function() {
	var name = prompt("请输入图库的名字", ""); // 弹出input框
	let url = rootPath + '/rest/librarys';
	let data = [{'Text': name, 'Value': name}];
	let type = 'application/json; charset=utf-8';
	if(name != null) {
		$.ajax({
	        url: url,
	        type: 'POST',
	        success: function(body) {
	        	if(body.code == 200) {
//		        	alert('添加成功');
		        	fetch(rootPath + '/rest/librarys', {headers: {version: '1.0.0'}})
		                .then(response => response.json())
		                .then(json=> {
		                    console.log(JSON.stringify(json));
		                    librarys.options = json.data;
		                    librarys.lid = name;
		                    librarys.onChange();
		                })
	        	} else {
	        		alert(body.msg);
	        	}
	        },
	        data: JSON.stringify(data),
	        contentType: type
	    });
	}
	return false;
};

var del = function() {
	if(thisDropzone.files.length > 0) {
		alert('删除前需要先清空该图库！');
		return false;
	}
//	var name = prompt("请输入要删除图库的名字" + thisDropzone.options.headers.library, ""); // 弹出input框
//	if(name == null) {
//		return false;
//	}
//	if(name != thisDropzone.options.headers.library || name == '') {
//		alert('输入不正确，请输入当前图库的名字：' + thisDropzone.options.headers.library);
//		return false;
//	}
	let url = rootPath + '/rest/library/' + librarys.lid;
	let type = 'application/json; charset=utf-8';
	if(name != null) {
		$.ajax({
	        url: url,
	        type: 'DELETE',
	        success: function(body) {
	        	if(body.code == 200) {
//		        	alert('删除成功');
		        	fetch(rootPath + '/rest/librarys', {headers: {version: '1.0.0'}})
		                .then(response => response.json())
		                .then(json=> {
		                    console.log(JSON.stringify(json));
		                    librarys.options = json.data;
		                    librarys.lid = '';
		                    librarys.onChange();
		                })
	        	} else {
	        		alert(body.msg);
	        	}
	        },
	        contentType: type
	    });
	}
	return false;
};

var dels = {};

var select = function(dom) {
	let dom1 = $(dom).children('div').get(0);
	let img1 = $(dom1).children('img').get(0);
	if(dels[img1.alt] === undefined) {
		dels[img1.alt] = dom1;
	} else {
		delete dels[img1.alt];
	}
	if(dom1.style.boxShadow == 'rgb(11, 210, 241) 7px 7px 30px') {
		dom1.style.boxShadow = '7px 7px 30px #888888';
	} else {
		dom1.style.boxShadow = '7px 7px 30px #0bd2f1';
	}
	if(Object.getOwnPropertyNames(dels).length > 0) {
		$('#resetselect')[0].style.display = '';
		$('#delselect')[0].style.display = '';
	} else {
		$('#resetselect')[0].style.display = 'none';
		$('#delselect')[0].style.display = 'none';
	}
};

var delselect = function() {
	_dels = []
	for(let d in dels) {
		_dels[_dels.length] = {identity_id: '', feature_id: d};
	}
	if(_dels.length > 0) {
		if (confirm('你确定要刪除这些人员吗？')){
			let data = JSON.stringify(_dels);
//			alert(data);
			let url
			if(thisDropzone.options.headers.library != '') {
		        url = rootPath + '/rest/library/'+thisDropzone.options.headers.library+'/uploads';
		    } else {
		        url = rootPath + '/rest/uploads';
		    }
			$.ajax({
		        url: url,
		        type: 'DELETE',
		        headers: {
		            Accept: "application/json; charset=utf-8",
		        },
		        data: data,
		        success: function(){
		        	get(true);
		        },
		    });
		}
	} else {
		alert('请选择要删除的人员');
	}
	return false;
};

var resetselect = function() {
	for(let d in dels) {
		dels[d].style.boxShadow = '7px 7px 30px #888888';
	}
	$('#resetselect')[0].style.display = 'none';
	$('#delselect')[0].style.display = 'none';
	dels = {};
};

var isbool = true;//触发开关，防止多次调用事件
var BOTTOM_OFFSET = 10;

var scroll = function() {
    var $currentWindow = $(window);
    //当前窗口的高度
    // var windowHeight = $currentWindow.height();
    var windowHeight = window.innerHeight;
    // console.log("current widow height is " + windowHeight);
    //当前滚动条从上往下滚动的距离
    var scrollTop = $currentWindow.scrollTop();
    // console.log("current scrollOffset is " + scrollTop);
    //当前文档的高度
    var docHeight = $(document).height();
    // console.log("current docHeight is " + docHeight);

    //当 滚动条距底部的距离 + 滚动条滚动的距离 >= 文档的高度 - 窗口的高度
    //换句话说：（滚动条滚动的距离 + 窗口的高度 = 文档的高度）  这个是基本的公式
    if ((BOTTOM_OFFSET + scrollTop) >= docHeight - windowHeight && isbool) {
    	isbool = false;
    	var timeOut = setTimeout(function(){
    		isbool = true;
    	}, 1000);
        get(false, function() {
            isbool = true;
            clearTimeout(timeOut);
        });
    }
}
timeFormat = function(date, fmt) {
	var milliseconds = date.getMilliseconds().toString();
	if(milliseconds.length == 1) {
		milliseconds = '0' + milliseconds;
	}
	if(milliseconds.length == 2) {
		milliseconds = '0' + milliseconds;
	}
    var o = {         
    "M+" : date.getMonth()+1, //月份         
    "d+" : date.getDate(), //日         
    "h+" : date.getHours()%12 == 0 ? 12 : date.getHours()%12, //小时         
    "H+" : date.getHours(), //小时         
    "m+" : date.getMinutes(), //分         
    "s+" : date.getSeconds(), //秒         
    "q+" : Math.floor((date.getMonth()+3)/3), //季度         
    "S" :  milliseconds//毫秒         
    };         
    var week = {         
    "0" : "/u65e5",         
    "1" : "/u4e00",         
    "2" : "/u4e8c",         
    "3" : "/u4e09",         
    "4" : "/u56db",         
    "5" : "/u4e94",         
    "6" : "/u516d"        
    };         
    if(/(y+)/.test(fmt)){         
        fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));         
    }         
    if(/(E+)/.test(fmt)){         
        fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "/u661f/u671f" : "/u5468") : "")+week[date.getDay()+""]);         
    }         
    for(var k in o){         
        if(new RegExp("("+ k +")").test(fmt)){         
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));         
        }         
    }         
    return fmt;         
}
$(document).ready(function () {
    $(window).scroll(function () {
        scroll();
    });
});
var cursor = 1136185445000;//2006-01-02 15:04:05
var doing = cursor;
var get = function(reset, callback) {
	var current = new Date().getTime();
	if(current - doing < 2000) {
		doing = current;
		return
	}
    let lid = thisDropzone.options.headers.library;
    let url;
    if(lid != '') {
        url = rootPath + '/rest/library/' + lid + '/uploads';
    } else {
        url = rootPath + '/rest/uploads';
    }
    if(reset) {
    	cursor = 1136185445000;//2006-01-02 15:04:05
    }
    var _cursor = timeFormat(new Date(cursor), "yyyy-MM-dd HH:mm:ss.S");
    console.log(_cursor);
    var limit = 50;
    $.get(url, {cursor: _cursor, limit : limit}, function (body) {
    	let data = body.data;
        // 7
        // thisDropzone.emit("reset");
        if(reset) {
            thisDropzone.cleaningUp = true;
            thisDropzone.removeAllFiles();
            thisDropzone.cleaningUp = false;
        }
        if (data == null) {
            return;
        }
        if(callback) {
            callback();
        }
        $.each(data, function (key, value) {
            var mockFile = { name: value.file_id, size: value.file_size, upload: {filename: value.file_id, library: value.library, file_alias: value.file_alias}};
            thisDropzone.emit("addedfile", mockFile);
            if(value.library == '') {
                thisDropzone.options.thumbnail.call(thisDropzone, mockFile, rootPath + '/public/uploads/' + value.file_id.substring(0,2) + '/thumbnail_' + value.file_id);
            } else {
                thisDropzone.options.thumbnail.call(thisDropzone, mockFile, rootPath + '/public/library/' + value.library + '/' + value.file_id.substring(0,2) + '/thumbnail_' + value.file_id);
            }
            // Make sure that there is no progress bar, etc...
            thisDropzone.emit("complete", mockFile);
            // thisDropzone.files=[];
            thisDropzone.files.push(mockFile);
            if(value.file_modtime > cursor) {
            	cursor = value.file_modtime;
            }
        });
        if(data.length > 0) {
            $(".scrollLoading").scrollLoading();
            retext();
        }
        doing = cursor;
    });
}
Dropzone.options.myDropzone = {
    paramName: "file", // The name that will be used to transfer the file
    acceptedFiles: ".jpg,.png,.jpeg,.bmp", //上传的类型
//    headers: { "library": "{{.lid}}" },//库id
    headers: { "library": lid },//库id
    maxFilesize: 20, //文件大小，单位：MB
    // addRemoveLinks: true,
    // createImageThumbnails: false,
    thumbnailWidth: null,
    thumbnailHeight: '120',
    dictRemoveFileConfirmation: "你确定删除吗?",
    init: function () {
        thisDropzone = this;
        this.on("success", function(file, body) {
            console.log("uploaded " + JSON.stringify(body));
            file.upload.filename = body.data.file_id;
            file.upload.library = body.data.library;
            file.upload.file_alias = body.data.file_alias;
            if(body.data.file_modtime > cursor) {
            	cursor = body.data.file_modtime;
            }
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

                node.textContent = body.data.file_alias;
            }
            for (var _iterator7 = file.previewElement.querySelectorAll("[data-dz-msg-value]"), _isArray7 = true, _i7 = 0, _iterator7 = _isArray7 ? _iterator7 : _iterator7[Symbol.iterator]();;) {
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

                node.value = body.data.file_alias;
                
                node.onblur = function(event){
                	var fileAlias = event.target.value;
//                	alert(fileAlias);
                	if(fileAlias != body.data.file_alias) {
                		if (confirm('你确定要更新' + body.data.file_alias + '名字为' + fileAlias + '吗？')) {
                        	if(body.data.library != '') {
                				var url = rootPath + '/rest/library/' + body.data.library + '/updatePersonnel/' + body.data.file_id + '?fileAlias=' + fileAlias;
                			} else {
                				var url = rootPath + '/rest/updatePersonnel/' + body.data.file_id + '?fileAlias=' + fileAlias;
                			}
                			$.ajax({
                		        url: url,
                		        type: 'GET',
                		        headers: {version: '1.0.0'},
                		        success: function(body) {
                		        	if(body.code != 200) {
                		        		alert(body.msg);
                		        	}
                		        }
                		    });
                		}
                	}
                }
            }
            $(".scrollLoading").scrollLoading();
            for (var _iterator7 = file.previewElement.querySelectorAll("[data-dz-thumbnail]"), _isArray7 = true, _i7 = 0, _iterator7 = _isArray7 ? _iterator7 : _iterator7[Symbol.iterator]();;) {
                var _ref6;

                if (_isArray7) {
                    if (_i7 >= _iterator7.length) break;
                    _ref6 = _iterator7[_i7++];
                } else {
                    _i7 = _iterator7.next();
                    if (_i7.done) break;
                    _ref6 = _i7.value;
                }
				_ref6.onload = function(event) {
//						loadImage(this)  
					setArtist(this, JSON.parse(body.data.info))
                }
            }
            retext();
        });
        // 6
        get(false);
    }
};
var barOffSetTop = document.getElementById('bar').offsetTop;
window.addEventListener('scroll', (e) => {
    if(barOffSetTop < document.body.scrollTop){
        bar.classList.add('add-fixed')
    }else{
        bar.classList.remove('add-fixed')
    }
});
var librarys = new Vue({
    el: '#app',
    delimiters: ['${', '}'],
    data: {
        lid: lid,
        level: level,
//        {{if .lid}}
//        url: rootPath + '/onebymany/library/{{.lid}}',
//        {{else}}
//        url: rootPath + '/onebymany',
//        {{end}}
        options: [
            // { text: '苹果', value: 'apple' },
        ]
    },
    computed: {
    	url: function () {
    		if(this.lid != '') {
    			return rootPath + '/onebymany/library/' + this.lid;
    		} else {
    			return rootPath + '/onebymany';
    		}
        }
    },
    methods: {
        onChange: function () {
            let url;
            if(this.lid != '') {
                url = rootPath + '/library/'+this.lid;
//                this.url = rootPath + '/onebymany/library/' + this.lid;
                thisDropzone.options.url = rootPath + '/rest/library/' + this.lid + '/uploads';
            } else {
                url = rootPath + '/';
//                this.url = rootPath + '/onebymany';
                thisDropzone.options.url = rootPath + '/rest/uploads';
            }
            window.history.pushState({}, 0, url);
            thisDropzone.options.headers.library = this.lid;
            resetselect();
            get(true);
        }
    },
    created () {
        fetch(rootPath + '/rest/librarys', {headers: {version: '1.0.0'}})
            .then(response => response.json())
            .then(json=> {
                console.log(JSON.stringify(json));
                this.options = json.data;
            })
    }
});