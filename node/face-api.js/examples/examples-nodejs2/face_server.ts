import * as faceapi from 'face-api.js';
import * as grpc from 'grpc';
import * as protoLoader from '@grpc/proto-loader';
import * as fs from 'fs';
import * as path from 'path';

import { canvas, faceDetectionNet, faceDetectionOptions, saveFile } from './commons';

async function run() {

  await faceDetectionNet.loadFromDisk('../../weights')

  const img = await canvas.loadImage('../images/bbt1.jpg')
  const detections = await faceapi.detectAllFaces(img, faceDetectionOptions)

  const out = faceapi.createCanvasFromMedia(img) as any
  faceapi.drawDetection(out, detections)

  saveFile('faceDetection.jpg', out.toBuffer('image/jpeg'))
  console.log('done, saved results to out/faceDetection.jpg')
}

run()

var PROTO_PATH = __dirname + '/protos/face.proto';
var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
var face_proto = grpc.loadPackageDefinition(packageDefinition).face_service;

async function run2(image) {

//    await faceDetectionNet.loadFromDisk('../../weights')

//    const img = await canvas.loadImage(image.image_bytes)
//    const mycanvas = canvas.createCanvas(image.image_param.width, image.image_param.height, image.image_param.channel)
    const width = image.image_param.width;
    const height = image.image_param.height;
    const image_bytes = image.image_byte;
    const mydata = canvas.createImageData(image_bytes, width, height)
    const mycanvas = canvas.createCanvas(width, height, {alpha: false, pixelFormat: "RGB24"});
    const myctx = mycanvas.getContext('2d');
    myctx.putImageData(mydata, 0, 0);
    var out = fs.createWriteStream(path.join(__dirname, 'crop5.bmp'))
    var stream = mycanvas.createJPEGStream({
      bufsize: 2048,
      quality: 80
    })
    stream.pipe(out)
    
//    const detections = await faceapi.detectAllFaces(img, faceDetectionOptions)

//    const out = faceapi.createCanvasFromMedia(img) as any
//    faceapi.drawDetection(out, detections)
//
//    saveFile('faceDetection.jpg', out.toBuffer('image/jpeg'))
//    console.log('done, saved results to out/faceDetection.jpg')
  }

/**
 * Implements the SayHello RPC method.
 */
function faceProcess(call, callback) {
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
    run2(call.request.image);
//    var image = call.request.image.image_bytes;
//    fs.writeFile(__dirname + '/input.jpg', image,  function(err) {
//       if (err) {
//           return console.error(err);
//       }
//       console.log("数据写入成功！");
//    });
    callback(null, {message: 'Hello'});
//  callback(null, {message: 'Hello ' + call.request.name});
}

/**
 * Starts an RPC server that receives requests for the Greeter service at the
 * sample server port
 */
function main() {
  var server = new grpc.Server();
  server.addService(face_proto.FaceService.service, {faceProcess: faceProcess});
  server.bind('0.0.0.0:3000', grpc.ServerCredentials.createInsecure());
  server.start();
}

main();