const convert = require('xml-js');

const options = {
	compact : true,
	ignoreComment : true,
	spaces : 4,

	ignoreComment : true,
	alwaysChildren : true
};

const getRequest = function(request) {
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
					"_text" : request['req-time']//"请求日期"
				},
				"req-seq-no" : {
					"_text" : request['req-seq-no']//"请求流水号"
				}
			},
			"agent-info" : {
				"trans-type" : {
					"_text" : request['trans-type']//"交易类型"
				}
			},
			"ws-info" : {
				"syn-time" : {
					"_text" : request['syn-time']//"特征同步时间"
				},
				"syn-count" : {
					"_text" : request['syn-count']//"已同步的数据量"
				}
			},
			"cust-info" : {
				"cust-fea-id" : [
//				{
//					"_text" : "同步失败的特征id"
//				}, {
//					"_text" : "同步失败的特征id"
//				}
				]
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
				"int:synFeature" : {
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
			"agent-info" : {
				"trans-type" : {
					"_text" : "交易类型"
				}
			},
			"ws-info" : {
				"syn-time" : {
					"_text" : "特征同步时间"
				},
				"syn-count" : {
					"_text" : "已同步的数据量"
				}
			},
			"cust-info" : {
				"cust-fea-id" : [ {
					"_text" : "同步失败的特征id"
				}, {
					"_text" : "同步失败的特征id"
				} ]
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
				"int:putIdentifyData" : {
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
	let fea_data_list = [];
	let result1 = convert.xml2js(xml, options);
//	console.log('result1' + JSON.stringify(result1, null, 4));
	console.log('result1', result1);
//	if(result1['soap:Envelope'] === undefined) {
//		return fea_data_list;
//	}
//	let response1 = result1['soapenv:Envelope']['soapenv:Body']['int:putIdentifyDataResponse'];
	let response1 = result1['soap:Envelope']['soap:Body']['ns1:synFeatureResponse'];
//	console.log('response1', JSON.stringify(response1));
	console.log('response1', response1);
//	let cdata = response1['int:out']['_cdata'];
	let cdata = response1['ns1:out']['_text'];
//	console.log('cdata', JSON.stringify(cdata, null, 4));
	console.log('cdata', cdata);
	let result1_cdata = convert.xml2js(cdata, {
		compact : true,
		spaces : 4
	});
//	console.log(result1_cdata);

	let res_code = result1_cdata['res']['head']['res-code']['_text'];
	console.log('res_code', res_code);
//	let res_msg = result1_cdata['res']['head']['res-msg']['_text'];
	let res_msg = result1_cdata['res']['head']['res-message']['_text'];
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
	
	if(result1_cdata['res']['res-data']['fea-datas'] === undefined) {
		return {
			res: res,
			fea_data_list : fea_data_list
		}
	}
//	console.log('res-data' + JSON.stringify(result1_cdata['res']['res-data'], null, 4));
	let fea_datas = result1_cdata['res']['res-data']['fea-datas']['fea-data'];
	console.log('fea_datas' + JSON.stringify(fea_datas, null, 4));
	if(fea_datas instanceof Array) {
		for ( let f in fea_datas) {
			let fea_data = fea_datas[f];
			console.log(fea_data);
			let cust_fea_id = fea_data['cust-fea-id']['_text'];
			console.log('cust_fea_id', cust_fea_id);
			let nick_name = fea_data['nick-name']['_text'];
			console.log('nick_name', nick_name);
			let feature = fea_data['feature']['_text'];
			console.log('feature', feature);
			let group_id = fea_data['group-id']['_text'];
			console.log('group_id', group_id);
			let update_time = fea_data['update-time']['_text'];
			console.log('update_time', update_time);
			let enable_date = fea_data['enable-date']['_text'];
			console.log('enable_date', enable_date);
			fea_data_list[fea_data_list.length] = {
				cust_fea_id : cust_fea_id,
				nick_name : nick_name,
				feature : feature,
				group_id : group_id,
				update_time : update_time,
//				enable_date : enable_date//TODO 记得改回来
				enable_date : update_time
			}
		}
	} else {
		let fea_data = fea_datas;
		console.log(fea_data);
		let cust_fea_id = fea_data['cust-fea-id']['_text'];
		console.log('cust_fea_id', cust_fea_id);
		let nick_name = fea_data['nick-name']['_text'];
		console.log('nick_name', nick_name);
		let feature = fea_data['feature']['_text'];
		console.log('feature', feature);
		let group_id = fea_data['group-id']['_text'];
		console.log('group_id', group_id);
		let update_time = fea_data['update-time']['_text'];
		console.log('update_time', update_time);
		let enable_date = fea_data['enable-date']['_text'];
		console.log('enable_date', enable_date);
		fea_data_list[fea_data_list.length] = {
			cust_fea_id : cust_fea_id,
			nick_name : nick_name,
			feature : feature,
			group_id : group_id,
			update_time : update_time,
//			enable_date : enable_date//TODO 记得改回来
			enable_date : update_time
		}
	}
	return {
		res: res,
		fea_data_list : fea_data_list
	}
}

module.exports = {
	getRequest,
	getReponse,
	getRequestDemo
};
