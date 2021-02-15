const faceapi = require('face-api.js');
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const fs = require('fs');
const path = require('path');
const { canvas, faceDetectionNet, faceDetectionOptions, saveFile, Image } = require('./commons');
const { padImageData, createBitmapFile, createBitmap } = require('bitmap-js');
//变量
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
//bitmap to image
var loadImage = function(bmp_img_raw, bmp_img_width, bmp_img_height, callback) {
//	let unpaddedImageData = bmp_img_raw;
	let unpaddedImageData = getUnpaddedImageData(bmp_img_raw, bmp_img_width, bmp_img_height);
	let imageData = padImageData({
	  unpaddedImageData: unpaddedImageData,
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
};
//本地测试
fs.readFile(path.resolve(__dirname, inputFile), (err, data) => {
//	let width = 358;
//	let height = 441;
//	let width = 96;
//	let height = 133;
	let width = 96;
	let height = 133;
	loadImage(data, width, height, function(){});
});
