const Canvas = require('canvas');
const fs = require('fs');
const path = require('path');

const width = 358;
const height = 441;
const fd = fs.openSync('input.jpg.bmp', 'r');
const canvas = Canvas.createCanvas(width, height, {pixelFormat: "RGB24"});
fs.readSync(fd, canvas.buffer, 0, width * height * 3, 0);
// do things with the canvas
//fs.writeFileSync('modified.raw', canvas.buffer);
var out = fs.createWriteStream(path.join(__dirname, 'crop.jpg'))
var stream = canvas.createJPEGStream({
  bufsize: 2048,
  quality: 80
})

stream.pipe(out)
