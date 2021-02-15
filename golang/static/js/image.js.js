var setArtist = function(img, datas_json) {
//	let datas_json = {
//			  "saveFileBegin": 1539922488072,
//			  "saveFileEnd": 1539922488084,
//			  "capturedAt": 1539922487923,
//			  "fsMax": 0,
//			  "frameNumber": 91348,
//			  "producerBegin": 1539922487923,
//			  "frameTime": 40,
//			  "oldFrameNumber": 91344,
//			  "uCnt": 1,
//			  "detectBegin": 1539922488017,
//			  "sResReceivedAt": 1539922488222,
//			  "lengthInTime": 913480,
//			  "faceInfos": [
//			    {
//			      "blurType": "3",
//			      "index": 0,
//			      "detectEnd": 1539922488190,
//			      "detectBegin": 1539922488163,
//			      "headPosi": "[-14,-64,8]",
//			      "rcItem": "[0.74121094,0.5625,0.051757812,0.09201389]"
//			    }
//			  ],
//			  "oldProducerBegin": 1539922487883,
//			  "detectEnd": 1539922488072,
//			  "fsIndexs": [],
//			  "sReqSendedAt": 1539922488190,
//			  "workQueueSize": 0,
//			  "oldCapturedAt": 1539922487883,
//			  "tiaoFrame": 2,
//			  "faceSeq": 0,
//			  "reqid": "bj001/bj1002/2018-10-19/12/14/47_923_91348",
//			  "blurType": "3",
//			  "score": 96.06
//			};
	let faceInfos = datas_json.faceInfos;
	if(faceInfos !== undefined)
	for (let d = 0; d < faceInfos.length; d++) {
		let data = faceInfos[d];
		try {
			data.rcItem = JSON.parse(data.rcItem);
		} catch (e) {
		}
		if(data.rcItem !== undefined) {
			var imgWith = img.width;
			var imgHeight = img.height;
			var left = img.offsetLeft;
			var top = img.offsetTop;
			// var str = deleteStr(data.rcItem);
			// var arr = str.split(",");
			
			let jsa = JSON.parse(data.headPosi);
			var message;
			var color;
			if(jsa.length == 3) {
				if(Math.abs(jsa[0])>70) {
					message = '图像旋转';
					color = '#ff99cc';
				} else if(Math.abs(jsa[0])>30) {
					message = '头太歪';
					color = '#ff3333';
				} else if(Math.abs(jsa[1])>13) {
					message = '转头过大';
					color = '#66ff99';
				} else if(Math.abs(jsa[2])>13) {
					n33++;
					message = '低抬头过大';
					color = '#00cc33';
				} else {
					message = '姿态稍不佳';
					color = 'blue';
				}
			} else {
				message = '姿态不佳';
				color = 'blue';
			}
			var color = 'blue'
			if(datas_json.faceSeq == d) {
				color = 'red';
			}
			var divLeft = parseFloat(left)+parseFloat(imgWith)*parseFloat(data.rcItem[0]) + 2;
			var divTop = parseFloat(top)+parseFloat(imgHeight)*parseFloat(data.rcItem[1]) + 2;
			var divWidth = parseFloat(imgWith)*parseFloat(data.rcItem[2]);
			var divHeight = parseFloat(imgHeight)*parseFloat(data.rcItem[3]);
			var divChild = document.createElement('Div');
			if(datas_json.faceSeq == d) {
				divChild.onclick = function () {
//					var cropping_url = img.src;
					var cropping_url = img.getAttribute("cropping");
//					alert(cropping_url);
					window.open(cropping_url); 
					return false;
//				    this.parentElement.removeChild(this);
				};
			}
			if(faceInfos.length > 1) {
				var _divChild = document.createElement('Div');
				_divChild.style.position='inherit';
				_divChild.style.top=divHeight+'px';
				_divChild.style.backgroundColor=color;
				_divChild.innerText=d+1;
				divChild.append(_divChild);
			}
			
//				divChild.name='kuang';
			divChild.className='kuang';
			divChild.style.position='absolute';
			divChild.style.left=divLeft+'px';
			divChild.style.top=divTop+'px';
			divChild.style.width=divWidth+'px';
			divChild.style.height=divHeight+'px';
			divChild.style.color='white';
//			divChild.style.textAlign='right';
			var text = '';
			var text2 = '';
			if(datas_json.pin === undefined || datas_json.pin == ''){
				divChild.style.border='1px solid '+color;
				if(data.blurType == 1) {
					text='质量太低';
				} else if(data.blurType == 2) {
					text='提不出姿态';
				} else if(data.blurType == 3) {
					text='姿态太差';
				} else if(data.blurType == 4) {
					text='提不出特征';
				} else if(data.blurType == 5) {
					text='上送比对';
				} else if(data.blurType == 6) {
					text='人脸太小';
				}
			} else {
				// console.log(faceInfos.length + ' ' + datas_json.faceSeq + ' ' + datas_json.pin);
				if(datas_json.faceSeq == d) {
					divChild.style.border='1px solid '+color;
					// text=datas_json.pin+'\n';
					text='pin';
					time = new Date().getTime();
				} else {
					divChild.style.border='1px solid '+color;
				}
			}
			text = text + ' ' + data.index;
//			divChild.innerText=text;
//			divChild.innerText=message;
			img.parentNode.append(divChild);
		}
	}
}
var loadImage = function(img) {
	EXIF.getData(img, function() {
        var artist = EXIF.getTag(this, "Artist");
        if(artist !== undefined) {
        	let datas_json = JSON.parse(artist);
        	setArtist(img, datas_json);
        } else {
        	let infoUrl = img.src.replace('thumbnail_', '') + '.info.json';
//        	alert(infoUrl)
        	$.ajax({
    	        url: infoUrl,
    	        type: 'GET',
    	        success: function(body) {
    	        	
//    	        	alert(JSON.stringify(body))
    	        	setArtist(img, body);
    	        }
    	    });
        }
    });
};
var IMG = null;
var loadThumbnail = function(img){
	let infoUrl = img.src.replace('thumbnail_', '') + '.info.json';
//	alert(infoUrl)
	$.ajax({
        url: infoUrl,
        type: 'GET',
        success: function(body) {
        	vue_data.faceInfos = body.faceInfos;
        	vue_data.faceSeq = body.faceSeq;
        	vue_data.pin = body.pin;
//        	alert(JSON.stringify(body))
        	setArtist(img, vue_data);
        }
    });
}
var loadImageOne = function(img) {
	$(".kuang").remove();
	if(img === undefined) {
		if(IMG != null) {
			img = IMG;
		}
	} else {
		IMG = img;
	}
	if(vue_data.pin == null) {
		EXIF.getData(img, function() {
			var orient = EXIF.getTag(this, 'Orientation');
			console.log("orient = " + orient);
			if(orient !== undefined) {
				switch (orient) {
				case 8:
					$(img).css({'transform': 'rotate(-90deg)'});
					break;
				case 6:
					$(img).css({'transform': 'rotate(90deg)'});
					break;
				case 3:
					$(img).css({'transform': 'rotate(180deg)'});
					break;
				default:
					break;
				}
			}
	        var artist = EXIF.getTag(this, "Artist");
			console.log("artist = " + artist);
	        if(artist !== undefined) {
	        	try {
		        	let datas_json = JSON.parse(artist);
		        	vue_data.faceInfos = datas_json.faceInfos;
		        	vue_data.faceSeq = datas_json.faceSeq;
		        	vue_data.pin = datas_json.pin;
		        	setArtist(img, datas_json);
				} catch (e) {
					loadThumbnail(img);
				}
	        } else {
	        	loadThumbnail(img);
	        }
	    });
	} else {
		setArtist(img, vue_data);
	}
};

var playAudo = function(audo_url) {
	var audio = new Audio(audo_url);
	audio.play();
};