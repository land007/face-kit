console.log('=======================================================================');
const allAdd = true;
const StrangersSendOutOvertime = parseInt(process.env['STRANGERS_SEND_OUT_OVERTIME'] || '10') * 1000;
const ExpireOutTime = parseInt(process.env['EXPIRE_OUT_TIME'] || '100') * 1000;
const ClearTime = parseInt(process.env['CLEAR_TIME'] || '180') * 1000;
const CPROTO_PATH = __dirname + '/protos/snapshot.proto';
const SPROTO_PATH = __dirname + '/protos/face.proto';
const REMOTE_SNAPSHOT_SERVER = process.env['REMOTE_SNAPSHOT_SERVER'] || '127.0.0.1:50050';
const MATCH_SERVER = process.env['MATCH_SERVER'] || '127.0.0.1:50051';
const Root = process.env['Root'] || '/eye';
const LIBRARY = process.env['LIBRARY'] || 'Test';
const VideoSwitch = process.env['VIDEOSWITCHS'] || '1';
var video_switchs = VideoSwitch.split('|');
const BlockSwitch = process.env['BLOCKSWITCHS'] || '1';
var block_switchs = BlockSwitch.split('|');
var proxy_target = process.env['PROXYTARGET'] || 'http://127.0.0.1:8080';
const allInOne = process.env['ALLINONE'] || '0';
const sendImg = process.env['SENDIMG'] || '0';
const showRegistration = process.env['SHOW_REGISTRATION'] || '1';
const host = process.env['DbHost'] || 'eyecool-mysql';
const port = process.env['DbPort'] || '3306';
const user = process.env['DbUsername'] || 'root';
const password = process.env['DbPassword'] || '1234567';
const database = process.env['Database'] || 'io-grpc_release';
const UUID = require('uuid');
const APP_SERVER = '0.0.0.0:50053';
var STREAM_SECRET = process.argv[2] || 'supersecret',
	STREAM_PORT = process.argv[3] || 5101,
	PORT = process.argv[4] || 6101,
	WEBSOCKET_PORT = process.argv[5] || 7101,
	RECORD_STREAM = false;
const fs = require('fs');
const grpc = require('grpc');
const express = require('express');
const protoLoader = require('@grpc/proto-loader');
const httpProxy = require('http-proxy');
const url = require('url');
const querystring = require('querystring');
const RtspStreamList = require('rtsp-stream-list');
const app = express();
const http = require('http');
const ws = require('ws');
const httpServer = http.Server(app);
const io = require('socket.io')(httpServer);
const request = require('request');
const mysql = require('mysql');
const moment = require('moment');
const aesutil = require('./aesutil');
var pool  = mysql.createPool({
	connectionLimit : 10,
	host            : host,
	port            : port,
	user            : user,
	password        : password,
	database        : database,
});
var proxy = httpProxy.createProxyServer({});
var rtspStreamList = new RtspStreamList(io);
var stranger_identity_ids = {};
var match_client = null;
var dbSave = function(identity_id, feature_id, name, feature, media_type_id, bio_type_id, company_algorithm_id, library_code, match_data) {
	let sql = 'INSERT INTO `tab_video_comparison_record` (`identity_id`, `feature_id`, `name`, `feature`, `file_id`, `media_type_id`, `checksum`, `file_size`, `bio_type_id`, `create_time`, `company_algorithm_id`, `library_code`, `match_data`) VALUES (?, ?, ?, ?, NULL, ?, NULL, NULL, ?, CURRENT_TIMESTAMP(3), ?, ?, ?);';
	console.log('dbSave');
	console.log({identity_id, feature_id, name, feature, media_type_id, bio_type_id, company_algorithm_id, library_code, match_data});
	pool.getConnection(function(err, connection) {
		console.log('get connection');
		if (err) throw err;
		var query = connection.query(sql, 
			[identity_id, feature_id, name, feature, media_type_id, bio_type_id, company_algorithm_id, library_code, match_data],
			function (error, results, fields) {
				console.log('save');
				connection.release();
				if (error) throw error;
				console.log('save ok : ', results);
		});
		console.log('query.sql = ' + query.sql);
	});
};
var dbClear = function() {
	let sql = 'DELETE FROM `tab_video_comparison_record` WHERE `create_time` < ?';
	console.log('dbClear');
	let time = moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss');
	pool.getConnection(function(err, connection) {
		console.log('get connection');
		if (err) throw err;
		var query = connection.query(sql, 
			[time],
			function (error, results, fields) {
				console.log('clear');
				connection.release();
				if (error) throw error;
				console.log('clear ok : ', results);
		});
		console.log('query.sql = ' + query.sql);
	});
};
var VUE_COMPLETE_DATA = {items:[{
	identity_name: "胡歌",
	identity_id: "30405",
	time: 1543566779652,
	identity_img: "person-img/test (1).jpg"
}, {
	identity_name: "王力宏",
	identity_id: "9some_max432853",
	time: 1543566779652,
	identity_img: "person-img/test (2).jpg"
}, {
	identity_name: "陈力群",
	identity_id: "652342",
	time: 1543566779652,
	identity_img: "person-img/test (3).jpg"
}, {
	identity_name: "王不利",
	identity_id: "434322",
	time: 1543566779652,
	identity_img: "person-img/test (4).jpg"
}, {
	identity_name: "邱蓓峰",
	identity_id: "232343",
	time: 1543566779652,
	identity_img: "person-img/test (5).jpg"
}, {
	identity_name: "司徒凯",
	identity_id: "423243",
	time: 1543566779652,
	identity_img: "person-img/test (6).jpg"
}, {
	identity_name: "闫应强",
	identity_id: "324232343",
	time: 1543566779652,
	identity_img: "person-img/test (7).jpg"
}, {
	identity_name: "闫应强",
	identity_id: "304052",
	time: 1543566779652,
	identity_img: "person-img/test (10).jpg"
}, {
	identity_name: "陈力群",
	identity_id: "652343",
	time: 1543566779652,
	identity_img: "person-img/test (3).jpg"
}, {
	identity_name: "王不利",
	identity_id: "434323",
	time: 1543566779652,
	identity_img: "person-img/test (4).jpg"
}, {
	identity_name: "邱蓓峰",
	identity_id: "232344",
	time: 1543566779652,
	identity_img: "person-img/test (5).jpg"
}, {
	identity_name: "邱蓓峰",
	identity_id: "23234",
	time: 1543566779652,
	identity_img: "person-img/test (5).jpg"
}, {
	identity_name: "司徒凯",
	identity_id: "423244",
	time: 1543566779652,
	identity_img: "person-img/test (6).jpg"
}]};
var WHS =  process.env['WHS'] || '1280x720|1280x720|1280x720';
var whs = WHS.split('|');
var RTSPURLS =  process.env['RTSPURLS'] || ''
var rtspUrls = RTSPURLS.split('|');
console.log('rtspUrls = ' + rtspUrls);
var RTSPXS =  process.env['RTSPXS'] || '';
var rtspXs = RTSPXS.split('|');
console.log('rtspXs1 = ' + rtspXs);
var VideoMessageKeys = [];
for(let r in rtspXs) {
	let rtspX = rtspXs[r];
	let rtspXList = rtspX.split(',');
	for(let rx in rtspXList) {
		let rtspXL = rtspXList[rx];
		if(!VideoMessageKeys.includes(rtspXL)) {
			VideoMessageKeys[VideoMessageKeys.length] = rtspXL;
		}
	}
	rtspXs[r] = rtspXList;
}
console.log('rtspXs2 = ' + rtspXs);
var cam_number = rtspUrls.length;
console.log('cam_number = ' + cam_number);
var device_no =  process.env['DEVICE_NO'] || ''
console.log('device_no = ' + device_no);
var device_ip =  process.env['DEVICE_IP'] || ''
console.log('device_ip = ' + device_ip);
var location =  process.env['LOCATION'] || ''
console.log('location = ' + location);
var position =  process.env['POSITION'] || ''
console.log('position = ' + position);
var passmode =  process.env['PASSMODE'] || ''
console.log('passmode = ' + passmode);
var user_no =  process.env['USER_NO'] || ''
console.log('user_no = ' + user_no);
var saveRequire = function(dataJs, data) {
	var str = 'var world = ' + formatRequire(data)
			+ ';\nmodule.exports = world;\n';
	fs.writeFile(__dirname + '/' + dataJs + '.js.tmp', str, function(err) {
		if (err) {
			console.error(err);
			return;
		}
		fs.rename(__dirname + '/' + dataJs + '.js.tmp', __dirname + '/' + dataJs + '.js', function(err) {
			if (err) {
				console.error(err);
				return;
			}
			fs.stat(__dirname + '/' + dataJs + '.js', function(err, stats) {
				if (err) {
					console.error(err);
					return;
				}
				console.log('save ' + dataJs + ' ok');
			});
		});
	});
};
var getRequire = function(dataJs, defData) {
	try {
		var data = require(dataJs);
	} catch (e) {
		data = defData;
	}
	return data;
};
var formatRequire = function(data) {
	return JSON.stringify(data, null, 4);
};
var getNumber = function(str) {
	try {
		let number = parseInt(str);
		if(isNaN(number)) {
			return str;
		}
		return number;
	} catch (e) {
		return str;
	}
}
var vue_complete_datas = {};
var vue_stranger_datas = {};
var vue_realtime_datas = {};
var video_source_indexs = [];
console.log('video_source_indexs = ' + video_source_indexs);
var getVueCompleteData = function(i) {
	if(vue_complete_datas[i] === undefined) {
		vue_complete_datas[i] = getRequire('../data/complete' + i, {items:[]});
		console.log('video_source_indexs = ' + video_source_indexs);
		console.log(i);
		console.log(typeof i != 'string');
		if(typeof i != 'string') {
			video_source_indexs[video_source_indexs.length] = i;
			let video_source_index = parseInt(video_source_indexs[i]);
			getBlock(video_source_index, 0);
		}
	}
	return vue_complete_datas[i];
};
var getVueStrangerData = function(i) {
	if(vue_stranger_datas[i] === undefined) {
		vue_stranger_datas[i] = getRequire('../data/stranger' + i, {items:[]});
	}
	return vue_stranger_datas[i];
};
var getVueRealtimeData = function(i) {
	if(vue_realtime_datas[i] === undefined) {
		vue_realtime_datas[i] = getRequire('../data/realtime' + i, {items:[]});
	}
	return vue_realtime_datas[i];
};
var DOORMONITORS =  process.env['DOORMONITORS'] || ''
console.log('DOORMONITORS = ' + DOORMONITORS);
var doorMonitors = DOORMONITORS.split('|');
var parseString = function(str, obj) {
  Object.keys(obj).forEach(key => {
    str = str.replace(new RegExp(`{{${key}}}`,'g'), obj[key]);
  });
  return str;
}
var rooms = {};
var videoStreamObjs = [];
const some_max = 4;
const complete_max = 13;
const some_all_max = 500;
const stranger_max = 4;
const stranger_all_max = 4;
const realtime_max = 7;
const _a = require('bitmaps'), padImageData = _a.padImageData, createBitmapFile = _a.createBitmapFile, createBitmap = _a.createBitmap;
const cpackageDefinition = protoLoader.loadSync(
    CPROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
const spackageDefinition = protoLoader.loadSync(
    SPROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
app.use(express.static('public'));
app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});
app.get('/eye/*', function(req, res) {
  proxy.web(req, res, { target: proxy_target });
});
app.get('/personnel_all_data', function(req, res) {
  var args = querystring.parse(url.parse(req.url).query);
  var camera_name = getNumber(args.camera_name);
  res.writeHead(200, {
	'Content-Type': 'application/json; charset=utf-8'
  });
  res.end(JSON.stringify(getVueCompleteData(camera_name).items));
});
app.get('/vue_complete_data', function(req, res) {
  var args = querystring.parse(url.parse(req.url).query);
  var camera_name = getNumber(args.camera_name);
  var max = getNumber(args.max);
  if(max < complete_max) {
	  max = complete_max;
  }
  let items = [];
  if(getVueCompleteData(camera_name) === undefined) {
	  res.end(JSON.stringify(items));
	  return
  }
  for(let i = 0; i < getVueCompleteData(camera_name).items.length; i++) {
	  if(i == max) {
		  break;
	  }
	  items[i] = getVueCompleteData(camera_name).items[i];
  }
  res.writeHead(200, {
	'Content-Type': 'application/json; charset=utf-8'
  });
  res.end(JSON.stringify(items));
});
app.get('/vue_some_data', function(req, res) {
  var args = querystring.parse(url.parse(req.url).query);
  var camera_name = getNumber(args.camera_name);
  var max = getNumber(args.max);
  if(max < some_max) {
	  max = some_max;
  }
  let items = [];
  if(getVueCompleteData(camera_name) === undefined) {
	  res.end(JSON.stringify(items));
	  return
  }
  for(let i = 0; i < getVueCompleteData(camera_name).items.length; i++) {
	  if(i == max) {
		  break;
	  }
	  items[i] = getVueCompleteData(camera_name).items[i];
  }
  res.writeHead(200, {
	'Content-Type': 'application/json; charset=utf-8'
  });
  res.end(JSON.stringify(items));
});
app.get('/vue_stranger_data', function(req, res) {
  var args = querystring.parse(url.parse(req.url).query);
  var camera_name = getNumber(args.camera_name);
  var max = getNumber(args.max);
  if(max < stranger_max) {
	  max = stranger_max;
  }
  console.log('camera_name =', camera_name);
  let items = [];
  if(getVueStrangerData(camera_name) === undefined) {
	  res.end(JSON.stringify(items));
	  return
  }
  for(let i = 0; i < getVueStrangerData(camera_name).items.length; i++) {
	  if(i == max) {
		  break;
	  }
	  items[i] = getVueStrangerData(camera_name).items[i];
  }
  res.writeHead(200, {
	'Content-Type': 'application/json; charset=utf-8'
  });
  res.end(JSON.stringify(items));
});
app.get('/vue_realtime_data', function(req, res) {
  var args = querystring.parse(url.parse(req.url).query);
  var camera_name = getNumber(args.camera_name);
  var max = getNumber(args.max);
  if(max < realtime_max) {
	  max = realtime_max;
  }
  let items = [];
  if(getVueRealtimeData(camera_name) === undefined) {
	  res.end(JSON.stringify(items));
	  return
  }
  for(let i = 0; i < getVueRealtimeData(camera_name).items.length; i++) {
	  if(i == max) {
		  break;
	  }
	  items[i] = getVueRealtimeData(camera_name).items[i];
  }
  res.writeHead(200, {
	'Content-Type': 'application/json; charset=utf-8'
  });
  res.end(JSON.stringify(items));
});
io.on('connection', function(socket){
  console.log('a user connected');
  var TTS =  process.env['TTS'] || "";
  if(TTS != "") {
	  console.log('open tts');
	  socket.emit('get room', 1);
  } else {
	  socket.emit('get room', 0);
  }
  socket.on('subscribe', function(data) {
	  console.log('subscribe ' + data.room);
	  console.log('data.room', data.room);
	  console.log('typeof data.room', typeof data.room);
	  if(typeof data.room === 'string' && data.room.endsWith('__')) {
		  let n = data.room.substring(0, data.room.length - '__'.length);
		  let rtspUrl = rtspUrls[n];
		  if(rtspUrl !== undefined) {
			  let ar = aesutil.encryption(rtspUrl);
			  let msg = {
				  i: 'video',
				  ar: ar
			  };
			  socket.emit('chat4 message', msg);
		  } else {
			  for(let r in rtspUrls) {
				  if(rtspXs[r].includes(n)) {
					  let rtspUrl = rtspUrls[r];
					  let ar = aesutil.encryption(rtspUrl);
					  let msg = {
						  i: 'video' + r,
						  ar: ar
					  };
					  socket.emit('chat4 message', msg);
				  }
			  }
		  }
	  }
	  socket.join(data.room);
  });
  socket.on('unsubscribe', function(data) {
      console.log('unsubscribe ' + data.room);
      socket.leave(data.room);
  });
  socket.on('disconnect', function() {
	  console.log('user disconnected');
  });
  socket.on('chat message', function(msg) {
	  for(var room in socket.rooms) {
		  if(room != socket.id){
			  io.to(room).emit('chat message', msg);
			  rtspStreamList.verifyStartupVideoStream(msg, room);
		  }
	  }
  });
});
httpServer.listen(PORT, function(){
  console.log('listening on *:6101');
});
for(let r in rtspUrls) {
	let video_switch = false;
    if(video_switchs.length == 1) {
    	video_switch = video_switchs[0] !== undefined && video_switchs[0] == '1';
    } else {
    	video_switch = video_switchs[r] !== undefined && video_switchs[r] == '1';
    }
    if(video_switch) {
    	let rtspUrl = rtspUrls[r];
    	console.log('rtspUrl' + rtspUrl);
    	let rtspXList = rtspXs[r];
    	console.log('>> r ', r, ' rtspXList ', rtspXList);
    	for(let rx in rtspXList) {
    		let rtspX = rtspXList[rx];
    		console.log('runRtspUrl ', rtspUrl, ' ', rtspX);
    		rtspStreamList.verifyStartupVideoStream(rtspUrl, rtspX);
    	}
    	rtspStreamList.verifyStartupVideoStream(rtspUrl, r);
    }
}
var streamServer = http.createServer( function(request, response) {
var params = request.url.substr(1).split('/');
if (!params[0].startsWith(STREAM_SECRET) || params[0].length <= STREAM_SECRET.length) {
	console.log(
		'Failed Stream Connection: '+ request.socket.remoteAddress + ':' +
		request.socket.remotePort + ' - wrong secret.'
	);
	response.end();
}
response.connection.setTimeout(0);
console.log(
	'Stream Connected: ' + 
	request.socket.remoteAddress + ':' +
	request.socket.remotePort
);
request.on('data', function(data) {
	let n = parseInt(params[0].substring(STREAM_SECRET.length, params[0].length))
	if(n == 0) {
		socketServer.broadcast(data);
	}
	rtspStreamList.sendVideoStream(n, data, rtspXs[n]);
	if (request.socket.recording) {
		request.socket.recording.write(data);
	}
});
request.on('end',function() {
	console.log('close');
	if (request.socket.recording) {
		request.socket.recording.close();
	}
});
if (RECORD_STREAM) {
	let path = 'recordings/' + Date.now() + '.ts';
	request.socket.recording = fs.createWriteStream(path);
}
}).listen(STREAM_PORT);
console.log('Listening for incomming MPEG-TS Stream on http://127.0.0.1:'+STREAM_PORT+'/<secret>');
var socketServer = new ws.Server({port: WEBSOCKET_PORT, perMessageDeflate: false});
socketServer.connectionCount = 0;
socketServer.on('connection', function(socket, upgradeReq) {
	socketServer.connectionCount++;
	console.log(
		'New WebSocket Connection: ', 
		(upgradeReq || socket.upgradeReq).socket.remoteAddress,
		(upgradeReq || socket.upgradeReq).headers['user-agent'],
		'('+socketServer.connectionCount+' total)'
	);
	socket.on('message', function(data) {
		io.sockets.in(0).emit('chat5 message', [0, data]);
	});
	socket.on('close', function(code, message){
		socketServer.connectionCount--;
		console.log(
			'Disconnected WebSocket ('+socketServer.connectionCount+' total)'
		);
	});
});
socketServer.broadcast = function(data) {
socketServer.clients.forEach(function each(client) {
	if (client.readyState === ws.OPEN) {
		client.send(data);
	}
});
};
console.log('Awaiting WebSocket connections on ws://127.0.0.1:'+WEBSOCKET_PORT+'/');
var snapshot_proto = grpc.loadPackageDefinition(cpackageDefinition).snapshot_service;
var face_proto = grpc.loadPackageDefinition(spackageDefinition).face_service;
function sendFaceIdentity(call, callback) {
	let faces = call.request.face;
	for(let i = 0; i < faces.length; i++) {
		let personnels = [];
		let face = faces[i];
		let camera_name = face.image.image_source;
		let matched_identity = face.matched_identities.matched_identity[0];
		let age = face.face_param.age;
		let gender = face.face_param.gender;
		let n = personnels.length;
		personnels[n] = {};
		personnels[n].camera_name = camera_name;
		personnels[n].identity_id = matched_identity.identity_id;
		personnels[n].feature_id = matched_identity.feature_id;
		personnels[n].match_score = matched_identity.match_score;
		personnels[n].identity_name = matched_identity.identity_name;
		personnels[n].time = new Date().getTime();
		personnels[n].face_feature = face.face_feature.value;
		personnels[n].age = age;
		personnels[n].gender = gender;
		let bmp_base64 = undefined;
		if(sendImg == '1') {
			let data = new Buffer(face.image.image_bytes.length);
			for(let r=0; r < face.image.image_param.height; r++) {
				for(let c=0; c < face.image.image_param.width; c++) {
					for(let k=0; k < 3; k++) {
						data[r*face.image.image_param.width*3 + c*3 + k] =
							face.image.image_bytes[(face.image.image_param.height -r) * 
								face.image.image_param.width * 3 + c * 3
								+ 2 - k]
					}
				}
			}
			let cameraId = face.image.image_source;
			let width = face.image.image_param.width;
			let height = face.image.image_param.height;
			let imageData = padImageData({
			  unpaddedImageData: data,
			  width,
			  height
			});
			let bmp_img = createBitmap({
			  imageData,
			  width,
			  height,
			  bitsPerPixel: 24
			});
			bmp_base64 = bmp_img.toString('base64');
			personnels[n].bmp_base64 =  "data:image/bmp;base64," + bmp_base64;
		}
		if(showRegistration == '1' && personnels[n].identity_id != '') {
			personnels[n].identity_img = Root + '/rest/library/' + LIBRARY + '/personnels/' + personnels[n].identity_id;
		} else {
			personnels[n].identity_img = '';
		}
		let json = JSON.stringify(personnels);
		let identity_id = matched_identity.identity_id;
		let feature_id = matched_identity.feature_id;
		let name = camera_name;
		let feature = '';
		let media_type_id = '1';
		let bio_type_id = '2';
		let company_algorithm_id = '1';
		let library_code = LIBRARY;
		let match_data = '{}';
		if(identity_id !== '') {
			dbSave(identity_id, feature_id, name, feature, media_type_id, bio_type_id, company_algorithm_id, library_code, match_data);
		}
		if(matched_identity.identity_id != '') {
			let doorMonitor = '';
			if(doorMonitors.length == 1) {
				doorMonitor = doorMonitors[0];
			} else {
				doorMonitor = doorMonitors[camera_name];
			}
			if(doorMonitor !== undefined && doorMonitor != '') {
				var parseObj = {
				    "identity_id": matched_identity.identity_id,
				    "feature_id": matched_identity.feature_id,
				    "camera_name": camera_name,
					"device_no": device_no+'_'+camera_name,
					"device_ip": device_ip,
					"location": location,
					"position": position,
					"passmode": passmode,
					"user_no": user_no,
				    "match_score": matched_identity.match_score,
				    "match_time": new Date().getTime()
				};
				if(bmp_base64 !== undefined) {
					parseObj.base64_type =  "data:image/bmp;base64,";
					parseObj.base64_image =  bmp_base64;
				}
				let doorMonitorUrl = encodeURI(parseString(doorMonitor, parseObj));
				console.log('open door ' + doorMonitorUrl);
				var options = {
				  uri: doorMonitorUrl,
				  method: 'POST',
				  json: parseObj
				};
				request(options, function (error, response, body) {
				  if (!error && response.statusCode == 200) {
					  console.log(body)
				  } else {
					if(response !== undefined) {
						console.log(response.statusCode + ' ' + error);
					} else {
						console.log(error);
					}
				  }
				});
			}
		}
		let obj = personnels[n];
		delete obj.face_feature;
		let _item = obj;
		let _items = [];
		if(obj.identity_id != '') {
			for(let i in getVueCompleteData(camera_name).items) {
				let item = getVueCompleteData(camera_name).items[i];
				if(item.identity_id != obj.identity_id) {
					_items[_items.length] = getVueCompleteData(camera_name).items[i];
				}
			}
			_items.splice(0, 0, _item);
			if(_items.length > some_all_max) {
				_items.splice(_items.length - 1, 1);
			}
			getVueCompleteData(camera_name).items = _items;
			var rtspXList = rtspXs[camera_name];
			for(let rxl in rtspXList) {
				let rtspX = rtspXList[rxl];
				_items = [];
				for(let i in getVueCompleteData(rtspX).items) {
					let item = getVueCompleteData(rtspX).items[i];
					if(item.identity_id != obj.identity_id) {
						_items[_items.length] = getVueCompleteData(rtspX).items[i];
					}
				}
				_items.splice(0, 0, _item);
				if(_items.length > some_all_max) {
					_items.splice(_items.length - 1, 1);
				}
				getVueCompleteData(rtspX).items = _items;
			}
		}
		if(allAdd) {
    		if(obj.identity_id != '') {
    			_items = [];
    			for(let i in getVueRealtimeData(camera_name).items) {
    				let item = getVueRealtimeData(camera_name).items[i];
    				_items[_items.length] = getVueRealtimeData(camera_name).items[i];
    			}
    			_items.splice(0, 0, _item);
    			if(_items.length > realtime_max) {
    				_items.splice(_items.length - 1, 1);
    			}
    			getVueRealtimeData(camera_name).items = _items;
    		}
		} else {
			_items = [];
			for(let i in getVueRealtimeData(camera_name).items) {
				let item = getVueRealtimeData(camera_name).items[i];
				_items[_items.length] = getVueRealtimeData(camera_name).items[i];
			}
			_items.splice(0, 0, _item);
			if(_items.length > realtime_max) {
				_items.splice(_items.length - 1, 1);
			}
			getVueRealtimeData(camera_name).items = _items;
		}
		if(allAdd) {
    		if(obj.identity_id != '') {
    			var rtspXList = rtspXs[camera_name];
    			for(let rxl in rtspXList) {
    				let rtspX = rtspXList[rxl];
    				_items = [];
        			for(let i in getVueRealtimeData(rtspX).items) {
        				let item = getVueRealtimeData(rtspX).items[i];
        				_items[_items.length] = getVueRealtimeData(rtspX).items[i];
        			}
        			_items.splice(0, 0, _item);
        			if(_items.length > realtime_max) {
        				_items.splice(_items.length - 1, 1);
        			}
        			getVueRealtimeData(rtspX).items = _items;
    			}
    		}
		} else {
			var rtspXList = rtspXs[camera_name];
			for(let rxl in rtspXList) {
				let rtspX = rtspXList[rxl];
				_items = [];
				for(let i in getVueRealtimeData(rtspX).items) {
					let item = getVueRealtimeData(rtspX).items[i];
					_items[_items.length] = getVueRealtimeData(rtspX).items[i];
				}
				_items.splice(0, 0, _item);
				if(_items.length > realtime_max) {
					_items.splice(_items.length - 1, 1);
				}
				getVueRealtimeData(rtspX).items = _items;
			}
		}
		if(obj.identity_id == '') {
			let _match_data = {
				face_feature : {
					value : face.face_feature.value,
					version : "1030"
				},
				face_match_options : {
					match_threshold : 90.0,
					top_n : 20,
					feature_library : {
						library_name : "Stranger"
					},
					num_pieces : 0,
					piece_sequence : 0
				},
				requestor : {
					company_id : "",
					application_id : "",
					device_id : "",
					access_code : "",
					user_id : "",
					password : "",
					request_sequence : ""
				}
			};
			match_client.GetIdentityID(_match_data, function(err, response) {
				if(err){
					console.log(err);
					return;
				}
			    if(response.matched_identity.length == 0) {
			    	if(allAdd) {
    					console.log('chat2 message a');
			    		io.sockets.in(camera_name).emit('chat2 message', json);
			    		io.sockets.in(camera_name + '__').emit('chat2 message', json);
			    		var rtspXList = rtspXs[camera_name];
						for(let rxl in rtspXList) {
							let rtspX = rtspXList[rxl];
							io.sockets.in(rtspX).emit('chat2 message', json);
							io.sockets.in(rtspX + '__').emit('chat2 message', json);
						}
					}
					console.log('chat3 message b');
					io.sockets.in(camera_name).emit('chat3 message', json);
					io.sockets.in(camera_name + '__').emit('chat3 message', json);
					var rtspXList = rtspXs[camera_name];
					for(let rxl in rtspXList) {
						let rtspX = rtspXList[rxl];
						io.sockets.in(rtspX).emit('chat3 message', json);
						io.sockets.in(rtspX + '__').emit('chat3 message', json);
					}
			        	_items = [];
						for(let i in getVueStrangerData(camera_name).items) {
							let item = getVueStrangerData(camera_name).items[i];
							_items[_items.length] = getVueStrangerData(camera_name).items[i];
						}
						_items.splice(0, 0, _item);
						if(_items.length > stranger_all_max) {
							_items.splice(_items.length - 1, 1);
						}
						getVueStrangerData(camera_name).items = _items;
						if(allAdd) {
							_items = [];
							for(let i in getVueRealtimeData(camera_name).items) {
								let item = getVueRealtimeData(camera_name).items[i];
								_items[_items.length] = getVueRealtimeData(camera_name).items[i];
							}
							_items.splice(0, 0, _item);
							if(_items.length > realtime_max) {
								_items.splice(_items.length - 1, 1);
							}
							getVueRealtimeData(camera_name).items = _items;
						}
						var rtspXList = rtspXs[camera_name];
						for(let rxl in rtspXList) {
							let rtspX = rtspXList[rxl];
							_items = [];
							for(let i in getVueStrangerData(rtspX).items) {
								let item = getVueStrangerData(rtspX).items[i];
								_items[_items.length] = getVueStrangerData(rtspX).items[i];
							}
							_items.splice(0, 0, _item);
							if(_items.length > stranger_all_max) {
								_items.splice(_items.length - 1, 1);
							}
							getVueStrangerData(rtspX).items = _items;
						}
						if(allAdd) {
							var rtspXList = rtspXs[camera_name];
							for(let rxl in rtspXList) {
								let rtspX = rtspXList[rxl];
								_items = [];
								for(let i in getVueRealtimeData(rtspX).items) {
									let item = getVueRealtimeData(rtspX).items[i];
									_items[_items.length] = getVueRealtimeData(rtspX).items[i];
								}
								_items.splice(0, 0, _item);
								if(_items.length > realtime_max) {
									_items.splice(_items.length - 1, 1);
								}
								getVueRealtimeData(rtspX).items = _items;
							}
						}
			      var call = match_client.UpdateFaceFeatures();
			  	  call.on('data', function(feature) {
			  	  });
			  	  call.on('end', function() {
			  	  });
			  	  call.on('error', function(e) {
			  		  console.log('error1 ' + e);
			  	  });
			  	  call.on('status', function(status) {
			  	  });
			  	  let data = {
		  				identity_id : UUID.v1(),
		  				identity_name : '',
		  				face_feature : {
		  					value : face.face_feature.value,
		  					version : "1030",
		  					expire_time : new Date().getTime() + ExpireOutTime,
		  					update_time : new Date().getTime()
		  				},
		  				feature_id : UUID.v1(),
		  				feature_library : {
		  					library_name : "Stranger"
		  				},
		  				requestor : {
		  					company_id : "",
		  					application_id : "",
		  					device_id : "",
		  					access_code : "",
		  					user_id : "",
		  					password : "",
		  					request_sequence : "",
		  				}
		  			};
		  		  call.write(data);
			  	  call.end();
			    } else {
			    	let identity_ids = {};
			    	for(let ind in response.matched_identity) {
			    		let _identity_id = response.matched_identity[ind].identity_id;
			    		let _feature_id = response.matched_identity[ind].feature_id;
			    		if(identity_ids[_identity_id] === undefined ) {
			    			identity_ids[_identity_id] = [];
			    		}
			    		identity_ids[_identity_id][identity_ids[_identity_id].length] = {feature_id: _feature_id};
			    	}
			    	let identity_keys = Object.keys(identity_ids);
			    	if(identity_keys.length == 1) {
			    		let _identity_id = identity_keys[0];
			    		let now = new Date().getTime();
			    		if(stranger_identity_ids[_identity_id] === undefined ) {
			    			stranger_identity_ids[_identity_id] = now;
			    		}
			    		let time = now - stranger_identity_ids[_identity_id];
		    			if(time > StrangersSendOutOvertime) {
		    				if(allAdd) {
		    					console.log('chat2 message c');
	    						io.sockets.in(camera_name).emit('chat2 message', json);
	    						io.sockets.in(camera_name + '__').emit('chat2 message', json);
	    						var rtspXList = rtspXs[camera_name];
								for(let rxl in rtspXList) {
									let rtspX = rtspXList[rxl];
									io.sockets.in(rtspX).emit('chat2 message', json);
		    						io.sockets.in(rtspX + '__').emit('chat2 message', json);
								}
		    				}
		    				stranger_identity_ids[_identity_id] = now;
		    			}
			    		if(identity_ids[identity_keys[0]] < 100) {
			    			var call = match_client.UpdateFaceFeatures();
			    			call.on('data', function(feature) {
			    				console.log(feature);
			    			});
			    			call.on('end', function() {
			    			});
			    			call.on('error', function(e) {
			    				console.log('error1 ' + e);
			    			});
			    			call.on('status', function(status) {
			    			});
			    			let data = {
			    					identity_id : identity_keys[0],
			    					identity_name : '',
			    					face_feature : {
			    						value : face.face_feature.value,
			    						version : "1030",
			    						expire_time : new Date().getTime() + 100000,
			    						update_time : new Date().getTime()
			    					},
			    					feature_id : UUID.v1(),
			    					feature_library : {
			    						library_name : "Stranger"
			    					},
			    					requestor : {
			    						company_id : "",
			    						application_id : "",
			    						device_id : "",
			    						access_code : "",
			    						user_id : "",
			    						password : "",
			    						request_sequence : "",
			    					}
			    			};
			    			console.log(data);
			    			call.write(data);
			    			call.end();
			    		}
			    	} else {
			    	}
			    }
			});
		} else {
			if(allAdd) {
				if(personnels[n].identity_id !== '') {
					console.log('chat2 message d');
					io.sockets.in(camera_name).emit('chat2 message', json);
					io.sockets.in(camera_name + '__').emit('chat2 message', json);
					var rtspXList = rtspXs[camera_name];
					for(let rxl in rtspXList) {
						let rtspX = rtspXList[rxl];
						io.sockets.in(rtspX).emit('chat2 message', json);
						io.sockets.in(rtspX + '__').emit('chat2 message', json);
					}
				}
			} else {
				console.log('chat2 message e');
				io.sockets.in(camera_name).emit('chat2 message', json);
				io.sockets.in(camera_name + '__').emit('chat2 message', json);
				var rtspXList = rtspXs[camera_name];
				for(let rxl in rtspXList) {
					let rtspX = rtspXList[rxl];
					io.sockets.in(rtspX).emit('chat2 message', json);
					io.sockets.in(rtspX + '__').emit('chat2 message', json);
				}
			}
		}
	}
	callback(null);
}
var getBlock = function(video_source_index, size) {
	  size++;
	  console.log('getBlock = ', video_source_index, size);
	  let block_switch = false;
	  if(block_switchs.length == 1) {
		  block_switch = block_switchs[0] !== undefined && block_switchs[0] == '1';
	  } else {
		  block_switch = block_switchs[video_source_index] !== undefined && block_switchs[video_source_index] == '1';
	  }
	  if(block_switch) {
		  let client = new snapshot_proto.SnapshotService(REMOTE_SNAPSHOT_SERVER, grpc.credentials.createInsecure());
		  let call = client.GetCroppingBox({video_source_index: video_source_index});
		  call.on('data', function(feature) {
		      io.sockets.in(video_source_index).emit('chat1 message', [video_source_index, feature]);
		      var rtspXList = rtspXs[camera_name];
			  for(let rxl in rtspXList) {
				  let rtspX = rtspXList[rxl];
			      io.sockets.in(rtspX).emit('chat1 message', [video_source_index, feature]);
			  }
		  });
		  call.on('end', function() {
		  });
		  call.on('error', function(e) {
		  	  console.log('error ' + e);
		  	  call.destroy();
		  	  setTimeout(function() {
		  		getBlock(video_source_index, size);
		  	  }, 2000);
		  });
		  call.on('status', function(status) {
		  });
	  }
};
function main() {
  match_client = new face_proto.FaceMatchService(MATCH_SERVER, grpc.credentials.createInsecure());
  var server = new grpc.Server();
  server.addService(face_proto.FaceIdentityService.service, {sendFaceIdentity: sendFaceIdentity});
  server.bind(APP_SERVER, grpc.ServerCredentials.createInsecure());
  server.start();
  console.log('Listening port:' + APP_SERVER);
  console.log('Camera number:' + cam_number);
  for(let i = 0; i < cam_number; i++) {
  	getVueCompleteData(i);
  	getVueStrangerData(i);
  	getVueRealtimeData(i);
  }
  setInterval(() => {
  	for(let i = 0; i < cam_number; i++) {
  		saveRequire('../data/complete_' + i, getVueCompleteData(i+''));
  		saveRequire('../data/stranger_' + i, getVueStrangerData(i+''));
  		saveRequire('../data/realtime_' + i, getVueRealtimeData(i+''));
  	}
  	for(let v in VideoMessageKeys) {
  		let rtspX = VideoMessageKeys[v];
  		saveRequire('../data/complete_' + rtspX, getVueCompleteData(rtspX));
  		saveRequire('../data/stranger_' + rtspX, getVueStrangerData(rtspX));
  		saveRequire('../data/realtime_' + rtspX, getVueRealtimeData(rtspX));
  	}
	let now = new Date().getTime();
	let stranger_identity_keys = Object.keys(stranger_identity_ids);
	for(let stranger_identity in stranger_identity_keys) {
		let time = now - stranger_identity_keys[stranger_identity];
		if(time > ExpireOutTime) {
			delete stranger_identity_ids[stranger_identity];
		}
	}
	dbClear();
  }, ClearTime);
}
main();