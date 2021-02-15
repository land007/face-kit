var allAdd = true;
var openSocketIo = true;
var wsUrl = 'ws://192.168.0.107:7101';
function launchFullscreen(element) {
	if(element.requestFullscreen) {
		element.requestFullscreen();
	} else if(element.mozRequestFullScreen) {
		element.mozRequestFullScreen();
	} else if(element.webkitRequestFullscreen) {
		element.webkitRequestFullscreen();
	} else if(element.msRequestFullscreen) {
		element.msRequestFullscreen();
	}
}
function exitFullscreen() {
	if(document.exitFullscreen) {
		document.exitFullscreen();
	} else if(document.mozCancelFullScreen) {
		document.mozCancelFullScreen();
	} else if(document.webkitExitFullscreen) {
		document.webkitExitFullscreen();
	}
}
function getParam(paramName) {
    paramValue = "", isFound = !1;
    if (this.location.search.indexOf("?") == 0 && this.location.search.indexOf("=") > 1) {
        arrSource = unescape(this.location.search).substring(1, this.location.search.length).split("&"), i = 0;
        while (i < arrSource.length && !isFound) arrSource[i].indexOf("=") > 0 && arrSource[i].split("=")[0].toLowerCase() == paramName.toLowerCase() && (paramValue = arrSource[i].split("=")[1], isFound = !0), i++
    }
    return paramValue == "" && (paramValue = null), paramValue
}
var camera_name = getParam('camera_name');
if(camera_name == null) {
	camera_name = 0;
}
var modalDatas = [];
Date.prototype.Format = function (fmt) { 
 var o = {
     "M+": this.getMonth() + 1, 
     "d+": this.getDate(), 
     "h+": this.getHours(), 
     "m+": this.getMinutes(), 
     "s+": this.getSeconds(), 
     "q+": Math.floor((this.getMonth() + 3) / 3), 
     "S": this.getMilliseconds() 
 };
 if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
 for (var k in o)
 if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
 return fmt;
}
var rotate = function() {
	var rectBox = $("#rectBox");
	rectBox.animate({"transform": "scale3d(1, 1, 1)"}, "slow", function() {
		setTimeout(function() {
	        $(".modal-box ").css("display", "none");
	        $(".modal ").css("display", "none");
		}, 1000);
	});
}
var openTTS = false;
var openModalSetTimeOut = null;
var openModal = function () {
	if(modalDatas.length > 0 && openModalSetTimeOut == null) {
		let modalData =  modalDatas.splice(0, 1)[0];
        $(".modal-box ").css("display", "block");
        $(".modal ").css("display", "block");
        $(".modal ").css("transform", "scale3d(0.1, 0.1, 1)");
        $(".modal .name").html(modalData.name);
        $(".modal .person-head").attr("src", modalData.img);
        if(openTTS) {
            playAudo(modalData.img+"?audo=1&random="+Math.random());
        }
        var rectBox = $("#rectBox");
    	rectBox.animate({"transform": "scale3d(1, 1, 1)"}, "slow", function() {
    		openModalSetTimeOut = setTimeout(function() {
    	        $(".modal-box ").css("display", "none");
    	        $(".modal ").css("display", "none");
    	        openModalSetTimeOut = null;
    	        openModal();
    		}, 1000);
    	});
	}
}
var old_time = new Date().getTime();
var time_chas = [];
var time_chas_max = 25;
var room = camera_name;
var timeOut = null;
var meetData = {
    meetName: "毕业典礼",
    meetTime: "05-02 13:00~15:00"
}
$(".meet-content .content-val").eq(0).html(meetData.meetName);
$(".meet-content .content-val").eq(1).html(meetData.meetTime);
$(".page-bottom .count_val").eq(0).html("10");
$(".page-bottom .count_val").eq(1).html("34");
$(".modal").click(function () {
    $(".modal-box ").css("display", "none");
    $(".modal ").css("display", "none");
})
$(".page-bottom .marquee").click(function () {
    showClosedPeopleList();
});
var setTime = function(){
	$(".page-bottom .marquee").html((new Date()).Format("yyyy年MM月dd日"));
}
setInterval(function(){
	setTime();
}, 1000*60);
var showClosedPeopleList = function() {
	let table_box = $(".table-box")
	if(table_box.css("display") == "none"){
		table_box.css("display", "block");
	} else {
		table_box.css("display", "none");
	}
}
$(".table-box .goback").click(function () {
	showClosedPeopleList();
});
$(".page-top").click(function () {
    $(".content-shade").css("display", "block");
});
$(".content-shade").click(function () {
    $(".content-shade").css("display", "none");
});
function setTableData() {
    var htmlstr = "";
    var k = 1;
    for (var i = 0; i < tableData.length; i++) {
        k = i + 1;
        var identity_img = tableData[i].identity_img;
        if(identity_img == '') {
        	identity_img =  tableData[i].bmp_base64;
		}
        htmlstr += '<tr>\n' +
            '                    <td>' + k + '</td>\n' +
            '                    <td><img class="person-head" src="' + identity_img + '"></td>\n' +
            '                    <td>' + tableData[i].identity_name + '</td>\n' +
            '                    <td>' + tableData[i].identity_id + '</td>\n' +
            '                    <td>' + tableData[i].time + '</td>\n' +
            '\n' +
            '                </tr>';
    }
    $(".table tbody").html(htmlstr);
}
var initStats = function() {
    var stats = new Stats();
    stats.setMode(0); 
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = stats_left;
    stats.domElement.style.top = stats_top;
    document.getElementById("Stats-output").appendChild(stats.domElement);
    return stats;
}
document.onkeydown=function(event) {
    var e = event || window.event;
    if(e && e.keyCode==113){ 
    	let stats_div = document.getElementById("Stats-output");
    	if(stats_div.style.display == 'none') {
    		stats_div.style.display = 'block';
    	} else {
    		stats_div.style.display = 'none';
    	}
    }
    if(e && e.keyCode==13){ 
    	if($(".modal ").css("display") == 'none') {
        	$(".modal ").css("display", "block");
    	} else {
    		$(".modal ").css("display", "none");
    	}
    }
 };
var playAudo = function(audo_url) {
	try {
    	var audio = new Audio(audo_url);
    	audio.play();
	} catch(err) {
	}
};
$(function() {
	setTime();
    var socket = io();
    var players = {};
    var stats = initStats();
    $('form').submit(function(){
        socket.emit('chat message', $('#m').val());
        return false;
    });
    var image_sequence = 0;
    socket.on('chat1 message', function(msg) {
    	var n = msg[0];
    	var msg = msg[1];
    	if(msg.image_sequence != image_sequence) {
    		$("#td .kuang").remove();
    		image_sequence = msg.image_sequence;
    		if(timeOut != null) {
    			clearTimeout(timeOut);
    		}
    		timeOut = setTimeout(function () {
    			$("#td .kuang").remove();
    			timeOut = null;
        	}, 300);
    	}
    	var imgWith = $("#canvas").width();
		var imgHeight = $("#canvas").height();
		var _divLeft = parseFloat(imgWith)*(parseFloat(msg.x)/msg.frame_width);
		var _divTop = parseFloat(imgHeight)*(parseFloat(msg.y)/msg.frame_height);
		var _divWidth = parseFloat(imgWith)*(parseFloat(msg.width)/msg.frame_width);
		var _divHeight = parseFloat(imgHeight)*(parseFloat(msg.height)/msg.frame_height);
		var bl = (imgWith/imgHeight)/(msg.frame_width/msg.frame_height)
    	var divLeft = _divLeft + (_divWidth * (bl - 1) / 4);
		var divTop = _divTop;
		var divWidth = _divWidth/bl;
		var divHeight = _divHeight;
		var divChild = document.createElement('Div');
		divChild.className='kuang';
		divChild.style.position='absolute';
		divChild.style.left=divLeft+'px';
		divChild.style.top=divTop+'px';
		divChild.style.width=divWidth+'px';
		divChild.style.height=divHeight+'px';
		divChild.style.color='white';
		divChild.style.border=kuang_border_style;
		$("#td").append(divChild);
    });
    var animation = function() {
    };
    socket.on('chat2 message', function(msg){
    	let list = JSON.parse(msg);
    	for(let i in list) {
    		let obj = list[i];
    		if(obj.identity_img == '') {
             	obj.identity_img =  obj.bmp_base64;
    		}
        	let name = obj.identity_name;
        	if(name == "") {
        		name = obj.identity_id;
        	}
        	if(name == "") {
        		name = obj.feature_id;
        	}
        	if(obj.identity_id !== '') {
            	modalDatas[modalDatas.length] = {name: name, img: obj.identity_img}
            	openModal();
        	}
        	let _item = obj;
        	let _items = [];
        	if(obj.identity_id != '') {
    			for(let i in vue_some_data.items) {
    				let item = vue_some_data.items[i];
    				if(item.identity_id != obj.identity_id) {
    					_items[_items.length] = vue_some_data.items[i];
    				}
    			}
    			_items.splice(0, 0, _item);
    			if(_items.length > some_max) {
    				_items.splice(_items.length - 1, 1);
    			}
    			vue_some_data.items = _items;
        	}
        	_items = [];
			for(let i in vue_realtime_data.items) {
				let item = vue_realtime_data.items[i];
				_items[_items.length] = vue_realtime_data.items[i];
			}
			_items.splice(0, 0, _item);
			if(_items.length > realtime_max) {
				_items.splice(_items.length - 1, 1);
			}
			vue_realtime_data.items = _items;
        	_items = [];
			for(let i in vue_complete_data.items) {
				let item = vue_complete_data.items[i];
				if(item.identity_id != obj.identity_id) {
					_items[_items.length] = vue_complete_data.items[i];
				}
			}
			_items.splice(0, 0, _item);
			if(_items.length > complete_max) {
				_items.splice(_items.length - 1, 1);
			}
			vue_complete_data.items = _items;
    	}
    });
    socket.on('chat3 message', function(msg){
    	let list = JSON.parse(msg);
    	for(let i in list) {
    		let obj = list[i];
        	if(obj.identity_id == '') {
				_item = obj;
	        	_items = [];
				for(let i in vue_stranger_data.items) {
					let item = vue_stranger_data.items[i];
					_items[_items.length] = vue_stranger_data.items[i];
				}
				_items.splice(0, 0, _item);
				if(_items.length > stranger_max) {
					_items.splice(_items.length - 1, 1);
				}
				vue_stranger_data.items = _items;
        	}
    	}
    });
    socket.on('chat4 message', function(msg) {
    	if(typeof appObj !== 'undefined') {
    		appObj.createVideoView(msg.i, msg.ar, videoDiv[msg.i].x, videoDiv[msg.i].y, videoDiv[msg.i].w, videoDiv[msg.i].h, videoDiv[msg.i].f);
    	}
    	console.log(msg.i + ' ' + msg.ar);
    });
    socket.on('chat5 message', function(msg) {
    	var canvas = document.getElementById('canvas');
    	let ctx = canvas.getContext('2d');
    	let minPoseConfidence = 0.1;
    	let minPartConfidence = 0.15;
    	let data = JSON.parse(msg[1]);
    	data.forEach((pose) => {
	        if (pose.score >= minPoseConfidence) {
	            drawKeypoints(pose.keypoints,
	                minPartConfidence, ctx);
	            drawSkeleton(pose.keypoints,
	                minPartConfidence, ctx);
	        }
	    });
    });
	socket.on('get room', function (data) {
		console.log('get room：' + JSON.stringify(data));
		if(typeof qt !== 'undefined') {
			new QWebChannel(qt.webChannelTransport, function(channel) {
				if(channel.objects.appObj !== undefined) {
					window.appObj = channel.objects.appObj;
					socket.emit('subscribe', { room: room + '__' });
				}
			});
		} else {
			socket.emit('subscribe', { room: room });
		}
		if(data == '1') {
			console.log('open tts');
			openTTS = true;
		}
	});
	if(openSocketIo) {
		socket.on('h264', function(msg) {
		    	var n = msg[0];
		    	if(players[n] === undefined) {
		        	var canvas = document.getElementById('canvas');
		        	canvas.style.display='block';
		        	canvas.style.zIndex=1;
		        	canvas.style.position= 'absolute';
		        	canvas.style.top=0;
		        	canvas.style.left=0;
		        	canvas.style.bottom=0;
		        	canvas.style.right=0;
		        	if(canvas == null) {
		        		canvas = document.createElement('canvas');
		    		 	canvas.id = 'video-canvas' + n;
		    		 	canvas.className = 'video-canvas';
		        	}
		        	players[n] = new JSMpeg.Player(null, {
			 		 	canvas: canvas,
			 		 	disableGl: true,
				 		source: JSMpeg.Source.Stream,
				 		onPlay: function(p) {
				 			console.log(p);
				 		},
				 		onVideoDecode: function(decoder, time) {
				 			var now = new Date().getTime();
				 			var time_cha = now - old_time;
				 			old_time = now;
				 			time_chas.splice(0, 0, time_cha);
				 	        	if(time_chas.length > time_chas_max) {
				 	        		time_chas.splice(time_chas.length - 1, 1);
				 			}
			 	        	let sum = time_chas.reduce((previous, current) => current += previous);
			 	        	let avg = sum / time_chas.length;
			 	        	if(stats != null) {
			 	        		stats.update();
			 	        	}
				 		}
				 	});
		    	}
		    	if(players[n] !== undefined) {
		    		if(players[n].wantsToPlay !== undefined && players[n].wantsToPlay == true) {
			    		var data = msg[1];
			    		players[n].source.write(data);
		    		}
		    	}
	    });
	} else {
		var canvas = document.getElementById('canvas');
		canvas.style.display='block';
    	canvas.style.zIndex=1;
    	canvas.style.position= 'absolute';
    	canvas.style.top=0;
    	canvas.style.left=0;
    	canvas.style.bottom=0;
    	canvas.style.right=0;
		var player = new JSMpeg.Player(wsUrl, {
		    canvas: canvas,
		});
	}
	socket.on('del rtsp', function (data) {
		console.log('del rtsp：' + JSON.stringify(data));
		setTimeout(function() {
			var canvas = document.getElementById('video-canvas' + data);
	    	if(canvas != null) {
	    		canvas.parentNode.removeChild(canvas);
	    	}
		}, 1000);
	});
	var vue_some_data = new Vue({
	  el: '#list-some-demo',
	  data: {
	    items: [],
	    nextNum: 8
	  },
	  computed: {
		  gidentity_img: function() {
			  return function (index) {
				  var identity_img = this.items[index].identity_img;
				  if(identity_img == '') {
					  identity_img =  this.items[index].bmp_base64;
				  }
				  return identity_img;
			  }
		  }
	  },
	  methods: {
	    randomIndex: function () {
	      return Math.floor(Math.random() * this.items.length)
	    },
	    add: function () {
	      this.items.splice(this.randomIndex(), 0, this.nextNum++)
	    },
	    remove: function () {
	      this.items.splice(this.randomIndex(), 1)
	    },
	    shuffle: function () {
	      console.log(this.items);
	      let _items = this.items;
	      this.items = [5, 1, 6, 8, 3, 2, 9, 7, 4];
	      console.log(_items);
	      console.log(this.items);
	      console.log(_items == this.items);
	    },
	    getOne: function(str) {
	    	var myRe = new RegExp("[^\x00-\xff]+", "g");
	    	var myArray = myRe.exec(str);
	    	if(myArray != null && myArray.length > 0) {
	    		return myArray[0];
	    	}
	    	return '';
	    }
	  },
	  created() {
		  fetch('/vue_some_data?camera_name=' + camera_name + '&max=' + some_max)
		  	.then(response=>response.json())
		  	.then(json=>{
		  		this.items = json;
		  	});
	  }
	});
	var vue_stranger_data = new Vue({
	  el: '#list-stranger-demo',
	  data: {
	    items: [],
	    nextNum: stranger_max
	  },
	  methods: {
	    randomIndex: function () {
	      return Math.floor(Math.random() * this.items.length)
	    },
	    add: function () {
	      this.items.splice(this.randomIndex(), 0, this.nextNum++)
	    },
	    remove: function () {
	      this.items.splice(this.randomIndex(), 1)
	    },
	    shuffle: function () {
	      console.log(this.items);
	      let _items = this.items;
	      this.items = [5, 1, 6, 8, 3, 2, 9, 7, 4];
	      console.log(_items);
	      console.log(this.items);
	      console.log(_items == this.items);
	    },
	    getOne: function(str) {
	    	var myRe = new RegExp("[^\x00-\xff]+", "g");
	    	var myArray = myRe.exec(str);
	    	if(myArray != null && myArray.length > 0) {
	    		return myArray[0];
	    	}
	    	return '';
	    }
	  },
	  created() {
		  fetch('/vue_stranger_data?camera_name=' + camera_name + '&max=' + stranger_max)
		  	.then(response=>response.json())
		  	.then(json=>{
		  		this.items = json;
		  	});
	  }
	});
	var vue_realtime_data = new Vue({
	  el: '#list-all-demo',
	  data: {
	    items: [],
	    nextNum: realtime_max
	  },
	  methods: {
	    randomIndex: function () {
	      return Math.floor(Math.random() * this.items.length)
	    },
	    add: function () {
	      this.items.splice(this.randomIndex(), 0, this.nextNum++)
	    },
	    remove: function () {
	      this.items.splice(this.randomIndex(), 1)
	    },
	    shuffle: function () {
	      console.log(this.items);
	      let _items = this.items;
	      this.items = [5, 1, 6, 8, 3, 2, 9, 7, 4];
	      console.log(_items);
	      console.log(this.items);
	      console.log(_items == this.items);
	    },
	    getOne: function(str) {
	    	var myRe = new RegExp("[^\x00-\xff]+", "g");
	    	var myArray = myRe.exec(str);
	    	if(myArray != null && myArray.length > 0) {
	    		return myArray[0];
	    	}
	    	return '';
	    },
	    calculate: function (index) {
	    	if(this.items[index].identity_id === undefined || this.items[index].identity_id == '') {
	    		return 'list-box red-box';
	    	} else {
	    		return 'list-box blue-box';
	    	}
	    },
	    getAge: function (index) {
	    	if(this.items[index].age === undefined) {
	    		return '';
	    	} else if(this.items[index].age <= 15) {
	    		return '少年 ';
	    	} else if(this.items[index].age <= 30) {
	    		return '青年 ';
	    	} else if(this.items[index].age <= 45) {
	    		return '中年 ';
	    	} else if(this.items[index].age <= 60) {
	    		return '老年 ';
	    	} else if(this.items[index].age > 60) {
	    		return '老年 ';
	    	} else {
	    		return '';
	    	}
	    },
	    getGender: function (index) {
	    	if(this.items[index].gender === undefined) {
	    		return '';
	    	} else if(this.items[index].gender == 1) {
	    		return '男';
	    	} else if(this.items[index].gender == 0) {
	    		return '女';
	    	} else {
	    		return '';
	    	}
	    }
	  },
	  created() {
		  fetch('/vue_realtime_data?camera_name=' + camera_name + '&max=' + realtime_max)
		  	.then(response=>response.json())
		  	.then(json=>{
		  		this.items = json;
		  	});
	  }
	});
	var vue_complete_data = new Vue({
		  el: '#list-complete-demo',
		  data: {
		    items: [],
		    nextNum: complete_max
		  },
		  methods: {
		    randomIndex: function () {
		      return Math.floor(Math.random() * this.items.length)
		    },
		    add: function () {
		      this.items.splice(this.randomIndex(), 0, this.nextNum++)
		    },
		    remove: function () {
		      this.items.splice(this.randomIndex(), 1)
		    },
		    shuffle: function () {
		      console.log(this.items);
		      let _items = this.items;
		      this.items = [5, 1, 6, 8, 3, 2, 9, 7, 4];
		      console.log(_items);
		      console.log(this.items);
		      console.log(_items == this.items);
		    }
		  },
		  created() {
			  fetch('/vue_complete_data?camera_name=' + camera_name + '&max=' + complete_max)
			  	.then(response=>response.json())
			  	.then(json=>{
			  		this.items = json;
			  	});
		  }
		});
});