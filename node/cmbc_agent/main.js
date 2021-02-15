const soapRequest = require('easy-soap-request');
const fs = require('fs');
const axios = require('axios');
var http = require('http');
var util = require('util');
var querystring = require('querystring');
const appDataInit = require('./lib/appDataInit');
const synFeature = require('./lib/synFeature');
const putIdentifyData = require('./lib/putIdentifyData');
const converter = require('./converter');
const time_util = require('./time_util');
const rest_util = require('./rest_util');
const port = 3101;
const stream_secret = 'cmbc';
//const axisUrl = 'http://192.168.0.69:8088/mockIFDMAppInterfaceHttpBinding';
//const axisUrl = 'http://192.168.2.146:8083/vipface-interface/services/IFDMAppInterface';
var axisUrl =  process.env['AXISURL'] || '';
const headers = {
'user-agent': 'sampleTest',
'Content-Type': 'text/xml;charset=UTF-8',
'soapAction': '',
};
//const getSyncUrl = 'http://192.168.0.96:8019/eye/rest/getSync';
//const getSyncUrl = 'http://192.168.2.111:8119/eye/rest/getSync';
const getSyncUrl = 'http://127.0.0.1:8080/eye/rest/getSync';
var sync = function() {
	axios({
	    method:'get',
	    url: getSyncUrl
	})
	.then(function (response) {
		sync_time = response.data.sync_time;
		console.log('sync_time', sync_time);
		sync_count = response.data.sync_count;
		console.log('sync_count', sync_count);
		
		let str_sync_time = time_util.toStrTime(sync_time);
		console.log('str_sync_time',  str_sync_time);
//		str_sync_time = '20190311193720982';
//		                 20190312162832859
		let synFeatureObj = converter.genSyncRequest(str_sync_time, sync_count);
		let synFeatureRequest = synFeature.getRequest(synFeatureObj);
		console.log('synFeatureRequest', synFeatureRequest);
		(async () => {
			let { response } = await soapRequest(axisUrl, headers, synFeatureRequest, 5000);
			let { body, statusCode } = response;
			console.log('statusCode', statusCode);
//			console.log('body', body);
			let { res, fea_data_list } = synFeature.getReponse(body);
			console.log('res', res);
			console.log('fea_data_list', fea_data_list);
			face_json_rests = converter.syncAxisToRests(fea_data_list);
//			console.log('face_json_rests', face_json_rests);
			rest_util.sendPersonnel(face_json_rests);
		})();
	})
	.catch(function (error) {
	    console.log(error);
	});
};
if(axisUrl != '') {
	setInterval(sync, 20000);
	sync();
	http.createServer(function(req, res){
		var params = req.url.substr(1).split('/');
		if (params[0] !== stream_secret) {
			console.log(
				'Failed Stream Connection: '+ req.socket.remoteAddress + ':' +
				req.socket.remotePort + ' - wrong secret.'
			);
			res.end();
		}
	    let post = '';
	    req.on('data', function(chunk) {
	        post += chunk;
	    });
	    req.on('end', function() {
	        console.log(post);
//	        post = querystring.parse(post);
//	        let str = util.inspect(post);
	        let json = JSON.parse(post);
//	        console.log(post);
//	        for(p in post) {
//	        	var obj = post[p];
//	        	console.log(obj);
//	        }
	        let axis_xml_obj = converter.genRecognitionRequest(json);
	        console.log('axis_xml_obj', axis_xml_obj);
	        let putIdentifyDataRequest = putIdentifyData.getRequest(axis_xml_obj);
	        console.log('putIdentifyDataRequest', putIdentifyDataRequest);
	        (async () => {
	        	const { response } = await soapRequest(axisUrl, headers, putIdentifyDataRequest, 5000);
	        	const { body, statusCode } = response;
	        	console.log(statusCode);
	        	console.log(body);
	        	const { res } = putIdentifyData.getReponse(body);
	        	console.log(res);
	        })();
//	        res.end(post[0].name);
			res.writeHead(200, {
				"Content-Type" : "application/json",
				"Cache-Control" : "no-store, no-cache, must-revalidate",
				"Pragma" : "no-cache",
//				"Access-Control-Allow-Origin" : "*",
//				"Access-Control-Allow-Headers" : "Content-Type,Content-Length, Authorization, Accept,X-Requested-With",
//				"Access-Control-Allow-Methods" : "PUT,POST,GET,DELETE,OPTIONS",
			});
//	     	res.end(JSON.stringify(post));
	     	res.end(JSON.stringify({code: 200, msg: 'ok'}));
	    });
	}).listen(port);
	console.log('listening on *:' + port);
}
