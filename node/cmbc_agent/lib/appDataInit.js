const convert = require('xml-js');

const options = {
	compact : true,
	ignoreComment : true,
	spaces : 4,

	ignoreComment : true,
	alwaysChildren : true
};

const getRequest = function() {
	let json1 = {
		"_declaration" : {
			"_attributes" : {
				"version" : "1.0",
				"encoding" : "UTF-8"
			}
		},
		"req" : {
			"head" : {
				"req-time" : {
					"_text" : "请求时间"
				},
				"req-seq-no" : {
					"_text" : "32位请求流水号"
				}
			}
		}
	};
	let result1 = convert.json2xml(json1, options);
	let json2 = {
		"soapenv:Envelope" : {
			"_attributes" : {
				"xmlns:soapenv" : "http://schemas.xmlsoap.org/soap/envelope/",
				"xmlns:int" : "http://interfaces.bios.eyecool.cn"
			},
			"soapenv:Header" : {},
			"soapenv:Body" : {
				"int:appDataInit" : {
					"int:in0" : {
						"_cdata" : result1
					}
				}
			}
		}
	};
	let result2 = convert.json2xml(json2, options);
	// console.log(result2);
	return result2;
}

var getReponse = function(xml) {
	let result1 = convert.xml2js(xml, options);
	console.log('result1' + JSON.stringify(result1, null, 4));

	let response1 = result1['soapenv:Envelope']['soapenv:Body']['int:appDataInitResponse'];
	console.log('response1', JSON.stringify(response1));

	let cdata = response1['int:out']['_cdata'];
	console.log('cdata', JSON.stringify(cdata, null, 4));

	let result1_cdata = convert.xml2js(cdata, {
		compact : true,
		spaces : 4
	});
	console.log('result1_cdata', JSON.stringify(result1_cdata, null, 4));

	let res_code = result1_cdata['res']['head']['res-code']['_text'];
	console.log('res_code', res_code);
	let res_msg = result1_cdata['res']['head']['res-msg']['_text'];
	console.log('res_msg', res_msg);
	let res_time = result1_cdata['res']['head']['res-time']['_text'];
	console.log('res_time', res_time);
	let req_seq_no = result1_cdata['res']['head']['req-seq-no']['_text'];
	console.log('req_seq_no', req_seq_no);
	let res_seq_no = result1_cdata['res']['head']['res-seq-no']['_text'];
	console.log('res_seq_no', res_seq_no);

	let res = {
		res_code : res_code,
		res_msg : res_msg,
		res_time : res_time,
		req_seq_no : req_seq_no,
		res_seq_no : res_seq_no
	};

	let match_threshold = result1_cdata['res']['param-info']['match-threshold']['_text'];
	console.log('match_threshold', match_threshold);
	let liveness_threshold = result1_cdata['res']['param-info']['liveness-threshold']['_text'];
	console.log('liveness_threshold', liveness_threshold);
	return {
		res: res,
		match_threshold : match_threshold,
		liveness_threshold : liveness_threshold
	}
}

module.exports = {
	getRequest : getRequest,
	getReponse : getReponse
};
