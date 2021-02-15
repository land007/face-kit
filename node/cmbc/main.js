const http = require('http');
const request = require('request');
const soap = require('soap');
const moment = require('moment');
const crypto = require('crypto');
const convert = require('xml-js');

const port = 3101;
//const port = 5060;
const stream_secrets = ['cmbc', 'eyecool/external/syncEquipment'];
const converter = require('./converter');
const rest_util = require('./rest_util');
const axisUrl =  process.env['AXISURL'] || 'http://127.0.0.1:5555/syncfaceFeature';
const milliseconds = 1 * 60 * 1000;//定期读取配置文件

const options = {
	compact : true,
	ignoreComment : true,
	spaces : 4,

	ignoreComment : true,
	alwaysChildren : true
};

var getSha1 = function(str) {
	let shasum = crypto.createHash('sha1');
	console.log('str', str);
	shasum.update(str);
	let hex = shasum.digest('hex');
	console.log('hex', hex);
	return hex;
}

var toLongTime = function(strTime) {
	console.log('strTime', typeof strTime);
	let longTime = moment(strTime, "YYYYMMDDHHmmssSSS");
	//                              20190371042600051
	console.log('longTime', longTime);
	return longTime;
};

var toLongDateTime = function(strTime) {
	let longTime = moment(strTime, "YYYYMMDD");
	console.log('longTime', longTime);
	return longTime;
};

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

var myService = {
      SoapServiceImplService: {
          SoapServiceImplPort: {
        	  syncPersonInfo1: function(args) {
            	  console.log('1');
            	  let json = {
                          code: '0000',
                          msg: '操作成功'
                      };
                  return {'return': JSON.stringify(json)};
              },

              // This is how to define an asynchronous function with a callback.
              syncPersonInfo: function(args, callback) {
            	// do some work
            	  let personInfos = null;
//            	  console.log(args.arg0);
            	  let isJson = false;
            	  if(args.arg0.res === undefined) {
            		  let result1 = convert.xml2js(args.arg0, options);
//            		  console.log(result1);
            		  personInfos = result1.res['res-data']['fea-datas']['fea-data'];
            	  } else {
            		  isJson = true;
            		  personInfos = args.arg0.res['res-data']['fea-datas']['fea-data'];
            	  }
            	  console.log(personInfos);
            	  let personnels = [];
            	  for(let p in personInfos) {
            		  let personInfo = personInfos[p];
            		  let personnel = {};
            		  if(isJson) {
                		  personnel.identity_id = personInfo['cust-fea-id'];
                		  let info = {};
                		  info.group_id = personInfo['group-id'];
                		  personnel.info = JSON.stringify(info);
                		  personnel.update_time = toLongTime(personInfo['update-time']).valueOf();
                		  personnel.expire_time = toLongDateTime(personInfo['enable-date']).valueOf();
                		  personnel.name = personInfo['nick-name'];
                		  personnel.feature = personInfo['feature'];
                		  personnel.feature_id = getSha1(personnel.feature);
                		  personnel.algo_version = '1030';
            		  } else {
                		  personnel.identity_id = personInfo['cust-fea-id']['_text'];
                		  let info = {};
            			  info.group_id = personInfo['group-id']['_text'];
                		  personnel.info = JSON.stringify(info);
                		  personnel.update_time = toLongTime(personInfo['update-time']['_text']).valueOf();
                		  personnel.expire_time = toLongDateTime(personInfo['enable-date']['_text']).valueOf();
                		  personnel.name = personInfo['nick-name']['_text'];
                		  personnel.feature = personInfo['feature']['_text'];
                		  personnel.feature_id = getSha1(personnel.feature);
                		  personnel.algo_version = '1030';
            		  }
//                	  console.log(personnel);
                	  personnels[personnels.length] = personnel;
            	  }
            	  rest_util.sendPersonnel(personnels, function() {
            		  console.log('in');
            		  let json = {
                          code: '0000',
                          msg: 'Successful operation'
                      };
                      callback({'return': JSON.stringify(json)});
            	  });
              },

              // This is how to define an asynchronous function with a Promise.
              MyPromiseFunction: function(args) {
            	  console.log('3');
                  return new Promise((resolve) => {
                    // do some work
                    resolve({
                      name: args.name
                    });
                  });
              },

              // This is how to receive incoming headers
              HeadersAwareFunction: function(args, cb, headers) {
            	  console.log('4');
                  return {
                      name: headers.Token
                  };
              },

              // You can also inspect the original `req`
              reallyDetailedFunction: function(args, cb, headers, req) {
            	  console.log('5');
                  console.log('SOAP `reallyDetailedFunction` request from ' + req.connection.remoteAddress);
                  return {
                      name: headers.Token
                  };
              }
          }
      }
  };



var wsdl = require('fs').readFileSync('syncPersonInfo.wsdl', 'utf8');


var equipment = getRequire('../data/equipment', {items:[]});
//console.log('equipment =', equipment);
setInterval(() => {
	equipment = getRequire('../data/equipment', {items:[]});
//	console.log('equipment =', equipment);
}, milliseconds);

//if(axisUrl != '') {
var server = http.createServer(function(req, res) {
		request_url  = req.url.substr(1);
		console.log('request_url =', request_url);
//		var params = req.url.substr(1).split('/');
//		console.log('params =', params);
//		console.log('params[0] =', params[0]);
		if (!stream_secrets.includes(request_url)) {
			console.log(
				'Failed Stream Connection: '+ req.socket.remoteAddress + ':' +
				req.socket.remotePort + ' - wrong secret.'
			);
			res.end();
			console.log('return');
			return;
		}
	    let post = '';
	    req.on('data', function(chunk) {
	        post += chunk;
	    });
	    req.on('end', function() {
	    	if(request_url === stream_secrets[0]) {
		    	console.log(post.length);
    			if(post.length > 0) {
		    		let json = JSON.parse(post);
		    		let axis_json_obj = converter.genRecognitionRequest(json);
//		    		console.log('axis_json_obj =', axis_json_obj);
//		    		console.log('JSON.stringify(axis_json_obj) =', JSON.stringify(axis_json_obj));
//		    		let requestData = {
//		    				"vendorName" : "XX管理子系统", // 接口调用方的系统名称
//		    				"data" : [ {
//		    					"location" : "安外",
//		    					"faceFeatureId" : "test (124)", // 特征值唯一标识
//		    					"deviceNo" : "8216d412537145c0bed48da80f179998",
//		    					"deviceIp" : "192.168.12.12", // 设备ID
//		    					"equipmentGroupId" : "1000010", // 设备组ID
//		    					"matchDate" : "2018-10-10",
//		    					"matchTime" : "2018-10-10 12:12:12",
//		    					"matchImg" : "比对照base64字符串",
//		    					"passMode" : "1",
//		    					"serialNo" : "12345",
//		    					"matchRes" : "1",
//		    					"inOut" : "0",
//		    					"access" : "1",
//		    					"matchScore" : "100",
//		    					"position" : "北门进入"
//		    				} ]
//		    			};
	    			request({
	    				url : axisUrl,
	    				method : "POST",
//	    				json : true,
	    				headers : {
	    					"content-type" : "application/json",
	    				},
	    				body : JSON.stringify(axis_json_obj)
	    			}, function(error, response, body) {
	    				if (error) {
	    					console.log('error =', error);
	    					return;
	    				}
	    				if (response.statusCode != 200) {
	    					console.log('response.statusCode =', response.statusCode);
	    					return;
	    				}
	    				console.log('body1 =', body);
	    			});
					res.writeHead(200, {
						"Content-Type" : "application/json",
						"Cache-Control" : "no-store, no-cache, must-revalidate",
						"Pragma" : "no-cache"
					});
			     	res.end(JSON.stringify({code: 200, msg: 'ok'}));
    			} else {
        			res.writeHead(200, {
    					"Content-Type" : "application/json",
    					"Cache-Control" : "no-store, no-cache, must-revalidate",
    					"Pragma" : "no-cache"
    				});
    		     	res.end(JSON.stringify({code: 200, msg: 'no body'}));
        		}
    		} else if(request_url === stream_secrets[1]) {
    			console.log('stream_secrets[1]');
		     	let json = {
					"code": "0000",
					"msg": "操作成功",
					"redirect": null,
					"data": equipment.items
				};
				res.writeHead(200, {"Content-Type": "application/json;charset=utf-8"});
				res.end(JSON.stringify(json));
    		} else {
    			res.writeHead(200, {
					"Content-Type" : "application/json",
					"Cache-Control" : "no-store, no-cache, must-revalidate",
					"Pragma" : "no-cache"
				});
		     	res.end(JSON.stringify({code: 200, msg: 'no secret'}));
    		}
	    });
	});
	server.listen(port);
	soap.listen(server, '/eyecool/ws/syncPersonInfo', myService, wsdl, function(){
		console.log('server initialized');
	});
	console.log('listening on *:' + port);
//}


