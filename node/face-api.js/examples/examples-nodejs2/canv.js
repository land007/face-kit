const Canvas = require('canvas');
const fs = require('fs');
const path = require('path');
const Image = Canvas.Image

const width = 358;
const height = 441;
const canvas = Canvas.createCanvas(width, height, {alpha: false, pixelFormat: "RGB24"});
const ctx = canvas.getContext('2d');
const _a = require('bitmap-js'), padImageData = _a.padImageData, createBitmapFile = _a.createBitmapFile, createBitmap = _a.createBitmap;


//fs.readFile(path.resolve(__dirname, 'input.jpg.bmp'), (err, data) => {
////  assert(!err);
//	for (var i=0;i<imgData.data.length;i+=4)
//	  {
//	  imgData.data[i+0]=255;
//	  imgData.data[i+1]=0;
//	  imgData.data[i+2]=0;
//	  imgData.data[i+3]=255;
//	  }
//	
//	
//  const id = Canvas.createImageData(data, width, height); // zero-copy
//  ctx.putImageData(id, 0, 0); // sorta slow, #909 would help
//  // do things with the canvas
////  fs.writeFileSync('modified.raw', canvas.toBuffer('raw')); // memcpy here
//  
//  
//  var out = fs.createWriteStream(path.join(__dirname, 'crop.jpg'))
//  var stream = canvas.createJPEGStream({
//    bufsize: 2048,
//    quality: 80
//  })
//
//  stream.pipe(out)
//  
//  
//});

const img1 = new Image()
img1.onerror = function (err) {
	  throw err
	}
const canvas1 = Canvas.createCanvas(width, height)
const ctx1 = canvas1.getContext('2d')

fs.readFile(path.resolve(__dirname, 'input.jpg.bmp'), (err, data) => {
//  assert(!err);
//	console.log(data);
	var bb = new Uint8ClampedArray(data);
//	var bb = new Uint16Array(data);
//	console.log(bb);
	
	
	
	//2018年12月3日 沈老师改写bmp倒序存图功能
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

	let imageData = padImageData({
	  unpaddedImageData,
	  width,
	  height
	});
	console.log('pid', imageData);
	console.log('pid', imageData.length);
	let bmp_img = createBitmap({
	  imageData,
	  width,
	  height,
	  bitsPerPixel: 24
	});
	bmp_base64 = bmp_img.toString('base64');
//	console.log(bmp_base64);

//	const colorTable = Buffer.from([
//	  0xFF, 0x00, 0xFF, 0x00,
//	  0x00, 0xFF, 0xFF, 0x00
//	]);
//	createBitmapFile({
//		  filename: "234.bmp",
//		  imageData,
//		  width,
//		  height,
//		  bitsPerPixel: 1,
//		  colorTable
//		});
	
	fs.writeFile('123.bmp', bmp_img,  function(err) {
	   if (err) {
	       return console.error(err);
	   }
	   console.log("数据写入成功！");
	   
	   
	   
//		img1.onerror = err => { throw err }
//		img1.onload = () => {
//			console.log('in');
//			ctx1.drawImage(img1, 0, 0)
//			
//			
//			
			  const id = Canvas.createImageData(bb, width, height); // zero-copy
			  ctx.putImageData(id, 0, 0); // sorta slow, #909 would help
				console.log('====================================5');
			  // do things with the canvas
			//  fs.writeFileSync('modified.raw', canvas.toBuffer('raw')); // memcpy here
			  
			  
			var out = fs.createWriteStream(path.join(__dirname, 'crop4.jpg'))
			var stream = canvas.createJPEGStream({
			  bufsize: 2048,
			  quality: 80
			})
			
			stream.pipe(out)
//			
//		}
	   
	   
	   let img2 = new Image();

	   img2.onload = () => {
        console.log('onload');
        console.log(img2.width);
        console.log(img2.height);
        ctx1.drawImage(img2, 0, 0)
		var out2 = fs.createWriteStream(path.join(__dirname, 'crop3.jpg'))
		var stream2 = canvas1.createJPEGStream({
		  bufsize: 2048,
		  quality: 80
		})
		
		stream2.pipe(out2)
	   };
	   
	   img2.onerror = err => { throw err; };
//	   img2.src = path.join(__dirname, 'bmp', '24-bit.bmp');
	   img2.src = "data:image/bmp;base64," + bmp_base64; // Synchronous
	   
//	   const img2 = new Image();
//	   img2.onerror = function (err) {
//			  throw err
//			}
//	   console.time('BMPParser');
////	   img2.src = bmp_img; // Synchronous
////	   img2.src = "data:image/bmp;base64," + bmp_base64; // Synchronous
////	   console.log("data:image/bmp;base64," + bmp_base64);
////	   img2.src = "data:image/png;base64,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";
////	   img2.src = path.join(__dirname, '567.bmp')
//	   img2.src = path.join(__dirname, 'bmp', '1-bit.bmp');
//	   console.log(img2.src);
//	   console.timeEnd('BMPParser');
//	   ctx1.drawImage(img2, 0, 0)
	   
//	   img1.onload = function () {
//		   console.log('in');
//	   }
////		img1.src = bmp_img;
//		img1.src = path.join(__dirname, '123.bmp')
//		console.log('load ' + img1.src);
	   
	   
	   
	   
	});
	
	



  
});

//fs.readFile(path.resolve(__dirname, 'input.jpg.bmp'), (err, data) => {
//	  const canvas = new Canvas(width, height, data, Canvas.CAIRO_FORMAT_RGB24);
//	  
//	  // do things with the canvas
//	  canvas.flush();
//	  var out = fs.createWriteStream(path.join(__dirname, 'crop.jpg'))
//	  var stream = canvas.createJPEGStream({
//	    bufsize: 2048,
//	    quality: 80
//	  })
//
//	  stream.pipe(out)
//	  
//	  
//	  // save back to disk so we can use it as an input later on and/or pipe data to ffmpeg
//	});