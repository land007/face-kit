const soapRequest = require('easy-soap-request');
const fs = require('fs');
const appDataInit = require('./lib/appDataInit');
const synFeature = require('./lib/synFeature');
const putIdentifyData = require('./lib/putIdentifyData');

const url = 'http://localhost:8088/mockIFDMAppInterfaceHttpBinding';
const headers = {
'user-agent': 'sampleTest',
'Content-Type': 'text/xml;charset=UTF-8',
'soapAction': '',
};

//const appDataInitRequest = appDataInit.getRequest();
//console.log(appDataInitRequest);
//(async () => {
//	const { response } = await soapRequest(url, headers, appDataInitRequest, 1000);
//	const { body, statusCode } = response;
//	console.log(statusCode);
//	console.log(body);
//	const { res, match_threshold, liveness_threshold } = appDataInit.getReponse(body);
//	console.log(res);
//	console.log(match_threshold);
//	console.log(liveness_threshold);
//})();

const synFeatureRequest = synFeature.getRequestDemo();
console.log(synFeatureRequest);
(async () => {
	const { response } = await soapRequest(url, headers, synFeatureRequest, 1000);
	const { body, statusCode } = response;
	console.log(statusCode);
	console.log(body);
	const { res, fea_data_list } = synFeature.getReponse(body);
	console.log(res);
	console.log(fea_data_list);
})();

const putIdentifyDataRequest = putIdentifyData.getRequest();
console.log(putIdentifyDataRequest);
(async () => {
	const { response } = await soapRequest(url, headers, putIdentifyDataRequest, 1000);
	const { body, statusCode } = response;
	console.log(statusCode);
	console.log(body);
	const { res } = putIdentifyData.getReponse(body);
	console.log(res);
})();