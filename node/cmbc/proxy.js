const http = require('http'),
    httpProxy = require('http-proxy');

const port = 3101;

//
// Create a proxy server with custom application logic
//
var proxy = httpProxy.createProxyServer({});

var option = {
  target: 'http://127.0.0.1:5060',
  selfHandleResponse : true
};

proxy.on('proxyReq', function(proxyReq, req, res, options) {
	proxyReq.setHeader('X-Special-Proxy-Header', 'foobar');
	console.log("url:" + proxyReq.path);
});

proxy.on('proxyRes', function (proxyRes, req, res) {
    var body = new Buffer('');
    proxyRes.on('data', function (data) {
        body = Buffer.concat([body, data]);
    });
    proxyRes.on('end', function () {
        body = body.toString();
        console.log("res:", body);
//        body = '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"  xmlns:tns="http://service.external.eyecool.com/"><soap:Body><ns2:syncPersonInfoResponse xmlns:ns2="http://service.external.eyecool.com/><return>{&quot;code&quot;:&quot;0000&quot;,&quot;msg&quot;:&quot;操作成功&quot;}</return></ns2:syncPersonInfoResponse></soap:Body></soap:Envelope>';
        res.end(body);
    });
});

//
// Create your custom server and just call `proxy.web()` to proxy
// a web request to the target passed in the options
// also you can use `proxy.ws()` to proxy a websockets request
//
var server = http.createServer(function(req, res) {
  // You can define here your custom logic to handle the request
  // and then proxy the request.
  proxy.web(req, res, option);
});

console.log("listening on port " + port)
server.listen(port);