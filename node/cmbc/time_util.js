const moment = require('moment');

const FORMAT = 'YYYYMMDDHHmmssSSS';
const TIMEFORMAT = 'YYYY-MM-DD HH:mm:ss';
const DATEFORMAT = 'YYYY-MM-DD';

var toStrTime = function(longTime) {
	let strTime = moment(new Date(longTime)).format(TIMEFORMAT);
	console.log('strTime', strTime);
	return strTime;
};

var nowStrTime = function() {
	let strTime = moment(new Date()).format(TIMEFORMAT);
	console.log('strTime', strTime);
	return strTime;
};

var nowStrDate = function() {
	let strTime = moment(new Date()).format(DATEFORMAT);
	console.log('strTime', strTime);
	return strTime;
};

var getReqSeqNo = function() {
	let strTime = 'eyecool_cmbc___' + moment(new Date()).format(FORMAT);
//	let strTime = '201903131428484' + moment(new Date()).format(FORMAT);
	console.log('strTime', strTime);
	return strTime;
};

var toLongTime = function(strTime) {
	console.log('strTime', typeof strTime);
	let longTime = moment(strTime, TIMEFORMAT);
	//                              20190371042600051
	console.log('longTime', longTime);
	return longTime;
};

var toLongDateTime = function(strTime) {
	let longTime = moment(strTime, "YYYYMMDD");
	console.log('longTime', longTime);
	return longTime;
};

module.exports = {toStrTime, toLongTime, nowStrTime, nowStrDate, toLongDateTime, getReqSeqNo};
