const convert = require('xml-js');

const options = {
	compact : true,
	ignoreComment : true,
	spaces : 4,

	ignoreComment : true,
	alwaysChildren : true
};

const getRequest = function(axis_xml_obj) {
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
					"_text" : axis_xml_obj['req-time']//"请求日期"
				},
				"req-seq-no" : {
					"_text" : axis_xml_obj['req-seq-no']//"请求流水号"
				}
			},
			"cust-info" : {
				"cust-fea-id" : {
					"_text" : axis_xml_obj['cust-fea-id']//"特征主键ID"
				},
				"cust-face-image" : {
					"_text" : axis_xml_obj['cust-face-image']//"现场图像"
				},
				"match-score" : {
					"_text" : axis_xml_obj['match-score']//"匹配分值"
				},
				"match-time" : {
					"_text" : axis_xml_obj['match-time']//"匹配时间"
				}
			},
			"ws-info" : {
				"camera-flag" : {
					"_text" : axis_xml_obj['camera-flag']//"摄像机IP地址"
				}
			}
		}
	};

	let result1 = convert.json2xml(json1, options);
	// console.log(result1);

	let json2 = {
		"soapenv:Envelope" : {
			"_attributes" : {
				"xmlns:soapenv" : "http://schemas.xmlsoap.org/soap/envelope/",
				"xmlns:int" : "http://interfaces.bios.eyecool.cn"
			},
			"soapenv:Header" : {},
			"soapenv:Body" : {
				"int:putIdentifyData" : {
					"int:in0" : {
						"_cdata" : result1
					}
				}
			}
		}
	};

	let result2 = convert.json2xml(json2, options);
//	console.log(result2);
	return result2;
}

const getRequestDemo = function() {
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
					"_text" : "请求日期"
				},
				"req-seq-no" : {
					"_text" : "请求流水号"
				}
			},
			"cust-info" : {
				"cust-fea-id" : {
					"_text" : "特征主键ID"
				},
				"cust-face-image" : {
					"_text" : "现场图像"
				},
				"match-score" : {
					"_text" : "匹配分值"
				},
				"match-time" : {
					"_text" : "匹配时间"
				}
			},
			"ws-info" : {
				"camera-flag" : {
					"_text" : "摄像机IP地址"
				}
			}
		}
	};

	let result1 = convert.json2xml(json1, options);
	// console.log(result1);

	let json2 = {
		"soapenv:Envelope" : {
			"_attributes" : {
				"xmlns:soapenv" : "http://schemas.xmlsoap.org/soap/envelope/",
				"xmlns:int" : "http://interfaces.bios.eyecool.cn"
			},
			"soapenv:Header" : {},
			"soapenv:Body" : {
				"int:putIdentifyData" : {
					"int:in0" : {
						"_cdata" : result1
					}
				}
			}
		}
	};

	let result2 = convert.json2xml(json2, options);
//	console.log(result2);
	return result2;
}

var getReponse = function(xml) {
	let result1 = convert.xml2js(xml, options);
	console.log('result1' + JSON.stringify(result1, null, 4));

//	let response1 = result1['soapenv:Envelope']['soapenv:Body']['int:putIdentifyDataResponse'];
	let response1 = result1['soap:Envelope']['soap:Body']['ns1:putIdentifyDataResponse'];
	console.log('response1', JSON.stringify(response1));
	
//	let cdata = response1['int:out']['_cdata'];
	let cdata = response1['ns1:out']['_text'];
	console.log('cdata', JSON.stringify(cdata, null, 4));

	let result1_cdata = convert.xml2js(cdata, {
		compact : true,
		spaces : 4
	});
	console.log(result1_cdata);

//	let res_code = result1_cdata['res']['head']['res-code']['_text'];
//	console.log('res_code', res_code);
////	let res_msg = result1_cdata['res']['head']['res-msg']['_text'];
//	let res_msg = result1_cdata['res']['head']['res-message']['_text'];
//	console.log('res_msg', res_msg);
//	let res_time = result1_cdata['res']['head']['res-time']['_text'];
//	console.log('res_time', res_time);
//	let req_seq_no = result1_cdata['res']['head']['req-seq-no']['_text'];
//	console.log('req_seq_no', req_seq_no);
//	let res_seq_no = result1_cdata['res']['head']['res-seq-no']['_text'];
//	console.log('res_seq_no', res_seq_no);

	let res = {
		res_code : res_code,
		res_msg : res_msg,
		res_time : res_time,
		req_seq_no : req_seq_no,
		res_seq_no : res_seq_no
	};

	return {
		res : res
	}
}

module.exports = {
	getRequest,
	getReponse,
	getRequestDemo
};
