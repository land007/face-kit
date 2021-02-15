const { padImageData, createBitmapFile, createBitmap } = require('bitmap-js');
const faceapi = require('face-api.js');
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const fs = require('fs');
const path = require('path');
const { canvas, faceDetectionNet, faceDetectionOptions, saveFile, Image } = require('./commons');

async function run(img) {

  await faceDetectionNet.loadFromDisk('../../weights')

//  const img = await canvas.loadImage('../images/bbt1.jpg')
//  const img = await canvas.loadImage(path.resolve(__dirname, 'crop4.jpg'))
  const detections = await faceapi.detectAllFaces(img, faceDetectionOptions)

  const out = faceapi.createCanvasFromMedia(img)
  faceapi.drawDetection(out, detections)

  saveFile('faceDetection1.jpg', out.toBuffer('image/jpeg'))
  console.log('done, saved results to out/faceDetection1.jpg')
}

fs.readFile(path.resolve(__dirname, 'input.jpg.bmp'), (err, data) => {
	const width = 358;
	const height = 441;

	let unpaddedImageData = new Buffer(data.length);
	for(let r=0; r < height; r++) {
		for(let c=0; c < width; c++) {
			for(let k=0; k < 3; k++) {
				unpaddedImageData[r*width*3 + c*3 + k] =
					data[(height -r) * 
						width * 3 + c * 3
						+ 2 - k]
						//镜像
						//width * 3 + (width - c) * 3
						//+ Math.abs(2 - k)]
			}
		}
	}
	console.log('unpaddedImageData', unpaddedImageData);
	let imageData = padImageData({
	  unpaddedImageData,
	  width,
	  height
	});
	console.log('imageData', imageData);
	console.log('imageData.length', imageData.length);
	let bmp_img = createBitmap({
	  _imageData,
	  width,
	  height,
	  bitsPerPixel: 24
	});
	console.log('bmp_img', bmp_img);
//	let bmp_base64 = bmp_img.toString('base64');
//	console.log('bmp_base64', bmp_base64);
	
	var bb = new Uint8ClampedArray(id);
	const mycanvas = canvas.createCanvas(width, height, {alpha: false, pixelFormat: "RGB24"});
	const myctx = mycanvas.getContext('2d');
	const myImageData = canvas.createImageData(bb, width, height); // zero-copy
	myctx.putImageData(myImageData, 0, 0); // sorta slow, #909 would help
	
	var myout = fs.createWriteStream(path.join(__dirname, 'crop6.jpg'))
	var mystream = mycanvas.createJPEGStream({
	  bufsize: 2048,
	  quality: 80
	})
	mystream.pipe(myout)
	
	let img = new canvas.Image();
	img.onload = () => {
		console.log(img.width);
		console.log(img.height);
//		run(imageData);
//		run(mycanvas);
		
		
//		run(img);
		
		const canvas1 = canvas.createCanvas(width, height);
		const ctx1 = canvas1.getContext('2d');
		ctx1.drawImage(img, 0, 0)
		var out = fs.createWriteStream(path.join(__dirname, 'crop5.jpg'))
		var stream = canvas1.createJPEGStream({
			bufsize: 2048,
			quality: 80
		})
		stream.pipe(out)
	};
	img.onerror = err => { throw err; };
	//	   img2.src = path.join(__dirname, 'bmp', '24-bit.bmp');
//	img.src = "data:image/bmp;base64," + bmp_base64; // Synchronous
//	console.log(mycanvas.toDataURL());
	img.src = mycanvas.toDataURL();
});
