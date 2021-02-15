const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const faceapi = require('face-api.js');

var PORT = 50051;
var PROTO_PATH = __dirname + '/protos/face.proto';
//var Threshold = 0.6;
var Threshold = 40;

var library_images = {};

function toArrayBuffer(buf) {
    var ab = new ArrayBuffer(buf.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return ab;
}

function compare(property){
    return function(obj1,obj2){
        var value1 = obj1[property];
        var value2 = obj2[property];
        return value2 - value1;// 升序
    }
}

/**
 * Implements the SayHello RPC method.
 */
var GetIdentityID = function(call, callback) {
	console.log('GetIdentityID');
//	console.log(call.request);
	// { face_feature:
	// { value: <Buffer 52 45 59 51 41 4a 67 42 6d 41 45 41 41 41 41 41 41 41 69
	// 4e 50 58 73 43 61 54 2f 4c 45 59 51 2b 54 4d 37 76 76 51 74 38 31 44 36
	// 4b 45 6b 43 2b 41 55 ... >,
	// version: '1030',
	// expire_time: '0',
	// update_time: '0' },
	// face_match_options:
	// { match_threshold: 10,
	// top_n: 1,
	// feature_library: { library_name: '222' },
	// num_pieces: 0,
	// piece_sequence: 0,
	// disable_check_crc: false },
	// identity_id: '123',
	// requestor:
	// { company_id: '',
	// application_id: '',
	// device_id: '',
	// access_code: '',
	// user_id: '',
	// password: '',
	// request_sequence: '' } }
	let feature = new Float32Array(toArrayBuffer(new Buffer(call.request.face_feature.value.toString(), 'base64')));
	let match_threshold = call.request.face_match_options.match_threshold;
	console.log('match_threshold', match_threshold);
	let top_n = call.request.face_match_options.top_n;
	console.log('top_n', top_n);
	let library = call.request.face_match_options.feature_library.library_name;
	console.log('library', library);
	let identity_id = call.request.identity_id;
	console.log('identity_id', identity_id);
	let result = {
		matched_identity : []
	};
	var images = library_images[library];
	if (images !== undefined) {
		for ( let key in images) {
			let image = images[key];
			console.log('image =', image);
			let face_feature = new Float32Array(toArrayBuffer(new Buffer(image.value.toString(), 'base64')));
			let dist = faceapi.euclideanDistance(feature, face_feature);
			dist = (1 - dist) * 100;
			console.log('dist', dist);
//			if(dist < Threshold) {
			if(dist > match_threshold) {
				result.matched_identity[result.matched_identity.length] = {
						identity_id : image.identity_id,
						identity_name : image.identity_name,
						match_score : dist,
						feature_id : image.feature_id
				};
			}
		}
	}
//	result.matched_identity[result.matched_identity.length] = {
//		identity_id : 'updated',
//		identity_name : '',
//		match_score : 95.0,
//		feature_id : ''
//	};
	result.matched_identity = result.matched_identity.sort(compare('match_score'));
	result.matched_identity = result.matched_identity.slice(0, top_n);
	console.log('result', result);
	callback(null, result);
	// { image:
	// { image_bytes: <Buffer ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff
	// ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff
	// ff ff ff ff ff ff ff ff ff ... >,
	// image_param: { width: 358, height: 441, channel: 'RGB' },
	// image_source: '',
	// image_sequence: '0' },
	// face_params: null,
	// face_detection: true,
	// liveness_detection: false,
	// feature_extraction: false,
	// liveness_threshold: 0,
	// face_detection_minimum_size: 0,
	// requestor: null }
};
var GetMatchScore = function(call, callback) {
	console.log(call.request);
};
var ListFaceFeatures = function(call, callback) {
	console.log(call.request);
};
var ListFaceFeatures = function(call, callback) {
	console.log(call.request);
};
var CountFaceFeatures = function(call, callback) {
	console.log(call.request);
};
var GetFeatureLibraries = function(call, callback) {
	console.log(call.request);
};
var UpdateFaceFeatures = function(call, callback) {
	console.log('UpdateFaceFeatures');
	call.on('data', function(point) {
		 console.log(point);
		 console.log('point.face_feature.value.toString()', point.face_feature.value.toString());
			
		// { identity_id: '123',
		// face_feature:
		// { value: <Buffer 52 45 59 51 41 4a 67 42 6d 41 45 41 41 41 41 41 41
		// 41 69 4e 50 58 73 43 61 54 2f 4c 45 59 51 2b 54 4d 37 76 76 51 74 38
		// 31 44 36 4b 45 6b 43 2b 41 55 ... >,
		// version: '1030',
		// expire_time: '0',
		// update_time: '0' },
		// feature_id: '469a47ce9c88c959cfb12420fc287e93ce5320b5%2e%6a%70%67',
		// feature_library: { library_name: '222' },
		// identity_name: '',
		// requestor:
		// { company_id: '',
		// application_id: '',
		// device_id: '',
		// access_code: '',
		// user_id: '',
		// password: '',
		// request_sequence: '' } }
		let library = point.feature_library.library_name;
		if (library_images[library] === undefined) {
			library_images[library] = {};
		}
		let identity_id = point.identity_id;
		let feature_id = point.feature_id;
		let identity_name = point.identity_name;
		let key = identity_id + '$$' + feature_id;
		let feature = point.face_feature;
		feature.identity_id = identity_id;
		feature.feature_id = feature_id;
		feature.identity_name = identity_name;
		feature.library = library;
		library_images[library][key] = feature;
		console.log('feature =', feature);
	});
	call.on('end', function() {
		let result = {
			num_updated : 1,
			num_added : 1,
			num_deleted : 1,
			num_failed : 1,
			num_features : 1,
			latest_update_time : 1
		};
		callback(null, result);
	});

};
var DeleteFaceFeatures = function(call, callback) {
	console.log('DeleteFaceFeatures');
	console.log(call.request);

};
var DeleteFeatures = function(call, callback) {
	console.log('DeleteFeatures');
	console.log(call.request);
	let identity_ids = call.request.identity_id;
	let library = call.request.feature_library.library_name;
//	{ identity_id: [ '61' ],
//		  feature_library: { library_name: 'Test' },
//		  requestor: null }
	for(let i in identity_ids) {
		let identity_id = identity_ids[i];
		delete library_images[library][identity_id];
	}
	console.log('library_images', library_images);
	let result = {
		num_updated : 1,
		num_added : 1,
		num_deleted : 1,
		num_failed : 1,
		num_features : 1,
		latest_update_time : 1
	};
	console.log('DeleteFeatures result', result);
	callback(result);
};
var DeleteFaceFeatureLibrary = function(call, callback) {
	console.log('DeleteFaceFeatureLibrary');
	console.log(call.request);
};
// grpc加载服务
var packageDefinition = protoLoader.loadSync(PROTO_PATH, {
	keepCase : true,
	longs : String,
	enums : String,
	defaults : true,
	oneofs : true
});
var face_proto = grpc.loadPackageDefinition(packageDefinition).face_service;
/**
 * Starts an RPC server that receives requests for the Greeter service at the
 * sample server port
 */
var main = function() {
	let server = new grpc.Server();
	server.addService(face_proto.FaceMatchService.service, {
		GetIdentityID : GetIdentityID,
		GetMatchScore : GetMatchScore,
		ListFaceFeatures : ListFaceFeatures,
		CountFaceFeatures : CountFaceFeatures,
		GetFeatureLibraries : GetFeatureLibraries,
		UpdateFaceFeatures : UpdateFaceFeatures,
		DeleteFaceFeatures : DeleteFaceFeatures,
		DeleteFeatures : DeleteFeatures,
		DeleteFaceFeatureLibrary : DeleteFaceFeatureLibrary
	});
	server.bind('0.0.0.0:' + PORT, grpc.ServerCredentials.createInsecure());
	server.start();
	console.log('listening on *:' + PORT);
};
// 启动grpc
main();
