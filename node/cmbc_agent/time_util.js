const moment = require('moment');

var toStrTime = function(longTime) {
	let strTime = moment(new Date(longTime)).format('YYYYMMDDHHmmssSSS');
	console.log('strTime', strTime);
	return strTime;
};

var nowStrTime = function() {
	let strTime = moment(new Date()).format('YYYYMMDDHHmmssSSS');
	console.log('strTime', strTime);
	return strTime;
};

var getReqSeqNo = function() {
	let strTime = 'eyecool_cmbc___' + moment(new Date()).format('YYYYMMDDHHmmssSSS');
//	let strTime = '201903131428484' + moment(new Date()).format('YYYYMMDDHHmmssSSS');
	console.log('strTime', strTime);
	return strTime;
};

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

module.exports = {toStrTime, toLongTime, nowStrTime, toLongDateTime, getReqSeqNo};
