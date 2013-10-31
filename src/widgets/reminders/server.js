var connect = require('connect');
var http = require('http');

var app = connect().use(connect.static(__dirname));

http.createServer(app).listen(8282, function() {
    console.log('Running on port 8282');
});