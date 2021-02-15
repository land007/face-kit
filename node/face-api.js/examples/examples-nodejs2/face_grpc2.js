const faceapi = require('face-api.js');
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const fs = require('fs');
const path = require('path');
const { canvas, faceDetectionNet, faceDetectionOptions, saveFile, Image } = require('./commons');
const { padImageData, createBitmapFile, createBitmap } = require('bitmaps');
//变量
var PORT = 50051;
var PROTO_PATH = __dirname + '/protos/face.proto';
var saveNumber = 3;
var saveFile0 = 'acrop' + saveNumber + '.bmp';
var saveFile1 = 'acrop' + saveNumber + 'a.jpg';
var saveFile2 = 'acrop' + saveNumber + 'b.jpg';
//var inputFile = 'input.jpg.bmp';
var inputFile = 'output_1554197462330_96_133.jpg.bmp';
var outputName = 'aoutput' + saveNumber;
var outputSuffix = 'jpg.bmp';
var saveFile3 = 'afaceDetection' + saveNumber + '.jpg';
//var myContext = {pixelFormat: "A1"};
//var myContext = {pixelFormat: "A8"};
//var myContext = {pixelFormat: "RGB30"};
//var myContext = {pixelFormat: "RGB16_565"};
//var myContext = {alpha: true, pixelFormat: "RGBA32"};
var myContext = {alpha: false, pixelFormat: "RGB24"};
//var myContext = {pixelFormat: "BMP"};
//2018年12月3日 沈老师改写bmp倒序存图功能
var getUnpaddedImageData = function(data, width, height) {
	let buffer = new Buffer(data.length);
	for(let r=0; r < height; r++) {
		for(let c=0; c < width; c++) {
			for(let k=0; k < 3; k++) {
				buffer[r*width*3 + c*3 + k] =
					data[(height -r) * 
						width * 3 + c * 3
						+ 2 - k]
						//镜像
						//width * 3 + (width - c) * 3
						//+ Math.abs(2 - k)]
			}
		}
	}
	return buffer;
};
//2018年12月3日 沈老师改写bmp倒序存镜像图功能
var getUnpaddedImageData_V = function(data, width, height) {
	let buffer = new Buffer(data.length);
	for(let r=0; r < height; r++) {
		for(let c=0; c < width; c++) {
			for(let k=0; k < 3; k++) {
				buffer[r*width*3 + c*3 + k] =
					data[(height -r) * 
						width * 3 + (width - c) * 3
						+ Math.abs(2 - k)]
			}
		}
	}
	return buffer;
};
//2019年4月1日 贾轶秋改写bmp转换功能
var getUnpaddedImageData2 = function(data, width, height) {
	let buffer = new Buffer(data.length);
	for(let r=0; r < height; r++) {
		for(let c=0; c < width; c++) {
			for(let k=0; k < 3; k++) {
				buffer[r*width*3 + c*3 + k] =
					data[r * 
						width * 3 + c * 3
						+ 2 - k]
						//镜像
						//width * 3 + (width - c) * 3
						//+ Math.abs(2 - k)]
			}
		}
	}
	return buffer;
};
//检测
var run_face_detection = async function(img) {
  await faceDetectionNet.loadFromDisk('../../weights')
//  let img = await canvas.loadImage('../images/bbt1.jpg')
//  let img = await canvas.loadImage(path.resolve(__dirname, 'crop4.jpg'))
  let detections = await faceapi.detectAllFaces(img, faceDetectionOptions)
  let out = faceapi.createCanvasFromMedia(img)
  faceapi.drawDetection(out, detections)
  saveFile(saveFile3, out.toBuffer('image/jpeg'))
  console.log('done, saved results to out/' + saveFile3)
  return detections;
};
//特征
var run_face_feature = async function(img) {
  await faceDetectionNet.loadFromDisk('../../weights')
  await faceapi.nets.faceLandmark68Net.loadFromDisk('../../weights')
  await faceapi.nets.faceRecognitionNet.loadFromDisk('../../weights')
  let resultsRef = await faceapi.detectAllFaces(img, faceDetectionOptions)
    .withFaceLandmarks()
    .withFaceDescriptors()
  console.log('resultsRef', resultsRef)
  return resultsRef;
};
//识别
var run_face_recognizer = async function(img) {
  await faceDetectionNet.loadFromDisk('../../weights')
//  let img = await canvas.loadImage('../images/bbt1.jpg')
//  let img = await canvas.loadImage(path.resolve(__dirname, 'crop4.jpg'))
  let detections = await faceapi.detectAllFaces(img, faceDetectionOptions)
  let out = faceapi.createCanvasFromMedia(img)
  faceapi.drawDetection(out, detections)
  saveFile(saveFile3, out.toBuffer('image/jpeg'))
  console.log('done, saved results to out/' + saveFile3)
  return detections;
};
//人脸框转换器
//[{"_imageDims":{"_width":295,"_height":425},"_score":0.9994751811027527,"_classScore":0.9994751811027527,"_className":"","_box":{"_x":66.58125025789504,"_y":89.03687931597233,"_width":154.3143736073669,"_height":168.10841970145702}}]
//[{face_param:{cropping_box: {x, y, width, height, image_sequence, frame_width, frame_height}}}]
var converterCroppingBox = function(datas) {
	let faceReply = {face_params: {face_param: []}};
	for(let a in datas) {
		let data = datas[a];
		let cropping_box = {
			x: data._box._x,
			y: data._box._y,
			width: data._box._width,
			height: data._box._height,
			image_sequence: a,
			frame_width: data._imageDims._width,
			frame_height: data._imageDims._height
		};
		faceReply.face_params.face_param[faceReply.face_params.face_param.length] = {cropping_box};
	}
	return faceReply;
};
var converterFeature = function(datas) {
	let faceReply = {face_feature: [], face_params: {face_param: []}};
	for(let a in datas) {
		let data = datas[a];
		let cropping_box = {
			x: data.alignedRect._box._x,
			y: data.alignedRect._box._y,
			width: data.alignedRect._box._width,
			height: data.alignedRect._box._height,
			image_sequence: a,
			frame_width: data.alignedRect._imageDims._width,
			frame_height: data.alignedRect._imageDims._height
		};
		faceReply.face_params.face_param[faceReply.face_params.face_param.length] = {cropping_box};
//		console.log('data.descriptor', data.descriptor);//Float32Array
//		console.log('data.descriptor.buffer', data.descriptor.buffer);//ArrayBuffer
//		console.log('new Buffer(data.descriptor.buffer)', new Buffer(data.descriptor.buffer));//Buffer
		faceReply.face_feature[faceReply.face_feature.length] = {value: new Buffer(data.descriptor.buffer)};
	}
	return faceReply;
};
/**
 * Implements the SayHello RPC method.
 */
var faceProcess = function(call, callback) {
//    console.log(call.request);
//    { image:
//    { image_bytes: <Buffer ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ... >,
//      image_param: { width: 358, height: 441, channel: 'RGB' },
//      image_source: '',
//      image_sequence: '0' },
//   face_params: null,
//   face_detection: true,
//   liveness_detection: false,
//   feature_extraction: false,
//   liveness_threshold: 0,
//   face_detection_minimum_size: 0,
//   requestor: null } 
    console.log(call.request);
    let data = call.request.image.image_bytes;
    let width = call.request.image.image_param.width;
    let height = call.request.image.image_param.height;
    let face_detection = call.request.face_detection;
    let liveness_detection = call.request.liveness_detection;
    let feature_extraction = call.request.feature_extraction;
    let outputFile = outputName + '_' + new Date().getTime() + '_' + width + '_' + height + '.' + outputSuffix;
    fs.writeFile(__dirname + '/' + outputFile, data,  function(err) {
	   	if (err) {
		   	return console.error(err);
   	   	}
	   	console.log("数据写入成功！");
	   	loadImage(data, width, height, function(_img) {
			if(face_detection || liveness_detection) {
				let detections = run_face_detection(_img);
				detections.then(function(a){
	//				console.log('console.log(', JSON.stringify(a));
					//[{"_imageDims":{"_width":295,"_height":425},"_score":0.9994751811027527,"_classScore":0.9994751811027527,"_className":"","_box":{"_x":66.58125025789504,"_y":89.03687931597233,"_width":154.3143736073669,"_height":168.10841970145702}}]
	//				var faceReply = {
	////					message: 'Hello'
	////					face_params: {face_param:[{cropping_box: {x, y, width, height, image_sequence, frame_width, frame_height}}]}
	//				};
					var faceReply = converterCroppingBox(a);
					console.log('faceReply', JSON.stringify(faceReply));
				    callback(null, faceReply);
				});
			} else if(feature_extraction) {
				let detections = run_face_feature(_img);
				detections.then(function(a){
					console.log('console.log(', a);
					console.log('console.log(', JSON.stringify(a));
					var faceReply = converterFeature(a);
//					resultsRef [ { detection: 
//					     FaceDetection {
//					       _imageDims: [Dimensions],
//					       _score: 0.9994751811027527,
//					       _classScore: 0.9994751811027527,
//					       _className: '',
//					       _box: [Box] },
//					    landmarks: FaceLandmarks68 { _imgDims: [Dimensions], _shift: [Point], _positions: [Array] },
//					    unshiftedLandmarks: FaceLandmarks68 { _imgDims: [Dimensions], _shift: [Point], _positions: [Array] },
//					    alignedRect: 
//					     FaceDetection {
//					       _imageDims: [Dimensions],
//					       _score: 0.9994751811027527,
//					       _classScore: 0.9994751811027527,
//					       _className: '',
//					       _box: [Box] },
//					    descriptor: 
//					     Float32Array [
//					       -0.06384056806564331,
//					       ... 128 more items ] } ]
					
					//[{"_imageDims":{"_width":295,"_height":425},"_score":0.9994751811027527,"_classScore":0.9994751811027527,"_className":"","_box":{"_x":66.58125025789504,"_y":89.03687931597233,"_width":154.3143736073669,"_height":168.10841970145702}}]
//					var faceReply = {
//						message: 'Hello'
//						face_params: {face_param:[{cropping_box: {x, y, width, height, image_sequence, frame_width, frame_height}}]}
//					};
					console.log('faceReply', JSON.stringify(faceReply));
				    callback(null, faceReply);
				});
			}
		});
//	    run2(call.request.image);
//	  callback(null, {message: 'Hello ' + call.request.name});
    });
};
//grpc加载服务
var packageDefinition = protoLoader.loadSync(
  PROTO_PATH,
  {keepCase: true,
   longs: String,
   enums: String,
   defaults: true,
   oneofs: true
  });
var face_proto = grpc.loadPackageDefinition(packageDefinition).face_service;
/**
 * Starts an RPC server that receives requests for the Greeter service at the
 * sample server port
 */
var main = function() {
  let server = new grpc.Server();
  server.addService(face_proto.FaceService.service, {faceProcess: faceProcess});
  server.bind('0.0.0.0:' + PORT, grpc.ServerCredentials.createInsecure());
  server.start();
};
//启动grpc
main();
//bitmap to image
var loadImage = function(bmp_img_raw, bmp_img_width, bmp_img_height, callback) {
//	let unpaddedImageData = bmp_img_raw;
	let unpaddedImageData = getUnpaddedImageData(bmp_img_raw, bmp_img_width, bmp_img_height);
	let imageData = padImageData({
	  unpaddedImageData,
	  width: bmp_img_width,
	  height: bmp_img_height
	});
	console.log('imageData', imageData);
	console.log('imageData.length', imageData.length);
	let bmp_img = createBitmap({
	  imageData,
	  width: bmp_img_width,
	  height: bmp_img_height,
	  bitsPerPixel: 24
	});
	console.log('bmp_img', bmp_img);
	bmp_base64 = bmp_img.toString('base64');
//	console.log('bmp_base64', bmp_base64);
	fs.writeFile(saveFile0, bmp_img,  function(err) {
	   if (err) {
	       return console.error(err);
	   }
	   console.log("数据写入成功！");
	});
	//第一种保存方法
	let _data = getUnpaddedImageData2(bmp_img_raw);
	let u8ca = new Uint8ClampedArray(_data);
	let u16a = new Uint16Array(_data);
	let myCanvas = canvas.createCanvas(bmp_img_width, bmp_img_height);
	let myCtx = myCanvas.getContext('2d', myContext);
	let myImageData = canvas.createImageData(u8ca, bmp_img_width, bmp_img_height); // zero-copy
	myCtx.putImageData(myImageData, 0, 0); // sorta slow, #909 would help
	let myout = fs.createWriteStream(path.join(__dirname, saveFile1))
	let mystream = myCanvas.createJPEGStream({
	  bufsize: 2048,
	  quality: 80
	})
	mystream.pipe(myout);
	//第二种保存方法
	var haveTwo = true;
	if(!haveTwo) {
		return;
	}
	let img = new canvas.Image();
	img.onload = () => {
		console.log(img.width);
		console.log(img.height);
//		callback(imageData);
//		callback(mycanvas);
		callback(img);
		let canvas1 = canvas.createCanvas(bmp_img_width, bmp_img_height);
		let ctx1 = canvas1.getContext('2d');
		ctx1.drawImage(img, 0, 0);
		let out = fs.createWriteStream(path.join(__dirname, saveFile2))
		let stream = canvas1.createJPEGStream({
			bufsize: 2048,
			quality: 80
		});
		stream.pipe(out);
	};
	img.onerror = err => { throw err; };
//	img2.src = path.join(__dirname, 'bmp', '24-bit.bmp');
//	img.src = "data:image/bmp;base64," + bmp_base64; // Synchronous
	img.src = "data:image/bmp;base64," + bmp_img.toString('base64'); // Synchronous
//	img.src = "data:image/jpg;base64," + bmp_img.toString('base64'); // Synchronous
//	img.src = "data:image/bmp;base64," + data.toString('base64'); // Synchronous
//	console.log(mycanvas.toDataURL());
//	img.src = myCanvas.toDataURL();
};
//本地测试
fs.readFile(path.resolve(__dirname, inputFile), (err, data) => {
//	let width = 358;
//	let height = 441;
//	let width = 96;
//	let height = 133;
	let width = 96;
	let height = 133;
	loadImage(data, width, height, run_face_detection);
});
