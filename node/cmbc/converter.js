const time_util = require('./time_util');

var genRecognitionRequest = function(face_json_rest) {
	let axis_json_obj = {};
	axis_json_obj['location'] = face_json_rest.location;//1,马坡，2安外 ,
	axis_json_obj['customerId'] = face_json_rest.identity_id; //特征值唯一标识
	axis_json_obj['deviceNo'] = face_json_rest.device_no;//设备唯一编号
	axis_json_obj['deviceIp'] = face_json_rest.device_ip;//设备IP
	axis_json_obj['equipmentGroupId'] = '';//设备组ID
	axis_json_obj['matchDate'] = time_util.nowStrDate();
	axis_json_obj['matchTime'] = time_util.nowStrTime();
	axis_json_obj['matchImg'] = face_json_rest.base64_image;
	axis_json_obj['passMode'] = face_json_rest.passmode;//比对模式1刷卡2刷脸3卡或人脸4卡和人脸5刷身份证6身份证或人脸7身份证和人脸8卡或人脸或身份证
	axis_json_obj['serialNo'] = time_util.getReqSeqNo();
	axis_json_obj['matchRes'] = '1';
//	axis_json_obj['inOut'] = '0';
	axis_json_obj['access'] = '1';
//	axis_json_obj['userType'] = '1';//员工类型
//	axis_json_obj['customerName'] = '1';//人员名称
//	axis_json_obj['baseImg'] = '1';//底库照片
//	axis_json_obj['customerDeptName'] = '1';//部门名称
//	axis_json_obj['customerDeptId'] = 1;//部门编号
//	axis_json_obj['id'] = 1;//门禁记录表主键
//	axis_json_obj['matchRes'] = '1';//比对结果1成功默认
//	axis_json_obj['access'] = '1';//是否通过 1通过0未通过
	axis_json_obj['matchScore'] = face_json_rest.match_score.toFixed(2);
	axis_json_obj['position'] = face_json_rest.location;//'北门进入';//人员点位，从哪儿进的抓拍机专用属性
	
	
//	axis_json_obj['req-time'] = time_util.nowStrTime();
//	axis_json_obj['req-seq-no'] = time_util.getReqSeqNo();
//	axis_json_obj['cust-fea-id'] = face_json_rest.identity_id;
//	axis_json_obj['camera-flag'] = '127.0.0.1';//face_json_rest.camera_name;
//	axis_json_obj['cust-face-image'] = face_json_rest.base64_image;
//	axis_json_obj['match-score'] = face_json_rest.match_score.toFixed(2);
//	axis_json_obj['match-time'] = time_util.nowStrTime();//face_json_rest.match_time + '0000';
	return axis_json_obj;
};

module.exports = {genRecognitionRequest};