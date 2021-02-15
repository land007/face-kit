const axios = require('axios');

var url = 'http://192.168.0.96:8019/eye/rest/getSync';

axios({
    method:'get',
    url,
//    auth: {
//        username: 'the_username',
//        password: 'the_password'
//    }
})
.then(function (response) {
//	console.log(JSON.stringify(response.data));
	sync_time = response.data.sync_time;
	console.log('sync_time', sync_time);
	sync_count = response.data.sync_count;
	console.log('sync_count', sync_count);
})
.catch(function (error) {
    console.log(error);
});