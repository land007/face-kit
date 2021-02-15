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

	var bb = new Uint8ClampedArray(data);
	const mycanvas = canvas.createCanvas(width, height, {alpha: false, pixelFormat: "RGB24"});
	const myctx = mycanvas.getContext('2d');
	const imageData = canvas.createImageData(bb, width, height); // zero-copy
	myctx.putImageData(imageData, 0, 0); // sorta slow, #909 would help
	
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
