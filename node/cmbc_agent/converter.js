const crypto = require('crypto');
const time_util = require('./time_util');

var getSha1 = function(str) {
	let shasum = crypto.createHash('sha1');
	console.log('str', str);
	shasum.update(str);
	let hex = shasum.digest('hex');
	console.log('hex', hex);
	return hex;
}

var genInitRequest = function() {
	let axis_xml_obj = {};
	axis_xml_obj['req-time'] = time_util.nowStrTime();
	axis_xml_obj['req-seq-no'] = time_util.getReqSeqNo();
	return axis_xml_obj;
};

var genSyncRequest = function(syn_time, syn_count) {
	let axis_xml_obj = {};
	axis_xml_obj['req-time'] = time_util.nowStrTime();
	axis_xml_obj['req-seq-no'] = time_util.getReqSeqNo();
	axis_xml_obj['trans-type'] = 1;
	axis_xml_obj['syn-time'] = syn_time;
	axis_xml_obj['syn-count'] = syn_count;
	return axis_xml_obj;
};

var syncAxisToRest = function(axis_xml_obj) {
	let face_json_rest = {};
	face_json_rest.library = axis_xml_obj['group_id'];
	face_json_rest.identity_id = axis_xml_obj['cust_fea_id'];
	face_json_rest.feature_id = getSha1(axis_xml_obj['feature']);
	face_json_rest.name = axis_xml_obj['nick_name'];
	face_json_rest.feature = axis_xml_obj['feature'];
	face_json_rest.algo_version = '1030';
	face_json_rest.update_time = time_util.toLongTime(axis_xml_obj['update_time']);
	face_json_rest.expire_time = time_util.toLongDateTime(axis_xml_obj['enable_date']);
	return face_json_rest;
};

var syncAxisToRests = function(axis_xml_list) {
	let face_json_rests = [];
	for(var a in axis_xml_list) {
		let axis_xml_obj = axis_xml_list[a];
		let face_json_rest = {};
		face_json_rest.library = axis_xml_obj['group_id'];
		face_json_rest.identity_id = axis_xml_obj['cust_fea_id'];
		face_json_rest.feature_id = getSha1(axis_xml_obj['feature']);
		face_json_rest.name = axis_xml_obj['nick_name'];
		face_json_rest.feature = axis_xml_obj['feature'];
		face_json_rest.algo_version = '1030';
		console.log(face_json_rest.update_time);
		console.log('update_time1', axis_xml_obj['update_time']);
		face_json_rest.update_time = time_util.toLongTime(axis_xml_obj['update_time']).valueOf();
		console.log('update_time2', face_json_rest.update_time);
		face_json_rest.expire_time = time_util.toLongDateTime(axis_xml_obj['enable_date']).valueOf();
		face_json_rests[face_json_rests.length] = face_json_rest;
	}
	return face_json_rests;
};

var genRecognitionRequest = function(face_json_rest) {
	let axis_xml_obj = {};
	axis_xml_obj['req-time'] = time_util.nowStrTime();
	axis_xml_obj['req-seq-no'] = time_util.getReqSeqNo();
	axis_xml_obj['cust-fea-id'] = face_json_rest.identity_id;
	axis_xml_obj['camera-flag'] = '127.0.0.1';//face_json_rest.camera_name;
	axis_xml_obj['cust-face-image'] = face_json_rest.base64_image;
	axis_xml_obj['match-score'] = face_json_rest.match_score.toFixed(2);
	axis_xml_obj['match-time'] = time_util.nowStrTime();//face_json_rest.match_time + '0000';
	return axis_xml_obj;
};

module.exports = {genInitRequest, genSyncRequest, syncAxisToRest, genRecognitionRequest, syncAxisToRests};