/* 
	same as: var app = require('express')();
*/

var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var url = require('url');

// public directory for external files
app.use(express.static('public'));

app.get('/', function (req, res){
	res.sendFile(__dirname+'/index.html');
});


app.get('/test', function (req, res){
	var reqObj = url.parse(req.url, true);
	res.end('request received at '+reqObj.pathname+"\n"+JSON.stringify(reqObj));
})


io.on('connection', function(socket){
	// What to send to all conected clients
	io.emit('new user connected');
	socket.on('chat message', function(msg){
		console.log(msg);
    	io.emit('chat message', msg);
 	});
});



http.listen(3000, function(){
	console.log('Server running on *:3000');
});


