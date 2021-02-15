Stream = require('node-rtsp-stream');

var RTSPURL =  process.env['RTSPURL'] || 'rtsp://admin:Admin123@192.168.0.241:554/h264/ch1/sub/av_stream';//摄像机RTSPURL  

stream = new Stream({
    name: 'name',
    streamUrl: RTSPURL,
    wsPort: 7101
});