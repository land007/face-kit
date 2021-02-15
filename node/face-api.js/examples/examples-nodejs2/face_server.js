"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var faceapi = require("face-api.js");
var grpc = require("grpc");
var protoLoader = require("@grpc/proto-loader");
var fs = require("fs");
var commons_1 = require("./commons");
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var img, detections, out;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, commons_1.faceDetectionNet.loadFromDisk('../../weights')];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, commons_1.canvas.loadImage('../images/bbt1.jpg')];
                case 2:
                    img = _a.sent();
                    return [4 /*yield*/, faceapi.detectAllFaces(img, commons_1.faceDetectionOptions)];
                case 3:
                    detections = _a.sent();
                    out = faceapi.createCanvasFromMedia(img);
                    faceapi.drawDetection(out, detections);
                    commons_1.saveFile('faceDetection.jpg', out.toBuffer('image/jpeg'));
                    console.log('done, saved results to out/faceDetection.jpg');
                    return [2 /*return*/];
            }
        });
    });
}
run();
var PROTO_PATH = __dirname + '/protos/face.proto';
var packageDefinition = protoLoader.loadSync(PROTO_PATH, { keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
var face_proto = grpc.loadPackageDefinition(packageDefinition).face_service;
/**
 * Implements the SayHello RPC method.
 */
function faceProcess(call, callback) {
    console.log(call.request);
    var image = call.request.image.image_bytes;
    fs.writeFile(__dirname + '/input.jpg', image, function (err) {
        if (err) {
            return console.error(err);
        }
        console.log("数据写入成功！");
    });
    callback(null, { message: 'Hello' });
    //  callback(null, {message: 'Hello ' + call.request.name});
}
/**
 * Starts an RPC server that receives requests for the Greeter service at the
 * sample server port
 */
function main() {
    var server = new grpc.Server();
    server.addService(face_proto.FaceService.service, { faceProcess: faceProcess });
    server.bind('0.0.0.0:3000', grpc.ServerCredentials.createInsecure());
    server.start();
}
main();
