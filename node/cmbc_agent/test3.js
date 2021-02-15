var moment = require('moment');

let time = new Date().getTime();
console.log('time', time);

//let oldTime = moment(new Date(new Date().getTime())).format('YYYY-MM-DD%20HH:mm:ss.SSS');
let oldTime = moment(new Date(time)).format('YYYYMMDDHHmmssSSS');
console.log('oldTime', oldTime);


let ssTime = moment(oldTime, "YYYYMMDDHHmmssSSS");
console.log('ssTime', ssTime);
//console.log('ssTime', ssTime.milliseconds());
console.log('ssTime', ssTime.valueOf() + 1);