"use strict";
exports.__esModule = true;
var faceapi = require("face-api.js");
//exports.faceDetectionNet = faceapi.nets.ssdMobilenetv1;
exports.faceDetectionNet = faceapi.nets.tinyFaceDetector;
// export const faceDetectionNet = tinyFaceDetector
// export const faceDetectionNet = mtcnn
// SsdMobilenetv1Options
var minConfidence = 0.5;
// TinyFaceDetectorOptions
//var inputSize = 408;
var inputSize = 384;
var scoreThreshold = 0.5;
// MtcnnOptions
var minFaceSize = 50;
var scaleFactor = 0.8;
function getFaceDetectorOptions(net) {
    return net === faceapi.nets.ssdMobilenetv1
        ? new faceapi.SsdMobilenetv1Options({ minConfidence: minConfidence })
        : (net === faceapi.nets.tinyFaceDetector
            ? new faceapi.TinyFaceDetectorOptions({ inputSize: inputSize, scoreThreshold: scoreThreshold })
            : new faceapi.MtcnnOptions({ minFaceSize: minFaceSize, scaleFactor: scaleFactor }));
}
exports.faceDetectionOptions = getFaceDetectorOptions(exports.faceDetectionNet);
