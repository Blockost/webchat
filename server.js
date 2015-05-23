/* 
	same as: var app = require('express')();
*/

var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var url = require('url');
var allClients = [];

// public directory for external files
app.use(express.static('public'));

app.get('/', function (req, res){
	res.sendFile(__dirname+'/index.html');
});


app.get('/test', function (req, res){
	var reqObj = url.parse(req.url, true);
	res.end('request received at '+reqObj.pathname+"\n"+JSON.stringify(reqObj));
});


io.on('connection', function(socket){
	// Update clients array
	allClients.push(socket);
	// Add username to socket
	socket.on('username choosen', function(username){
		console.log(username);
		socket.username = username;
		// Send this message to all conected clients except the one that fires this event
		socket.broadcast.emit('user connected', socket.username);
		socket.emit('users list', function(err, data){
			console.log(allClients);
		});
	});
	
	

	
	socket.on('chat message', function(chat_message){
    	io.emit('chat message', chat_message);
 	});




 	socket.on('disconnect', function(){
 		socket.broadcast.emit('user disconnected', socket.username);
 		allClients.splice(allClients.indexOf(socket), 1);
 	});

});



http.listen(3000, function(){
	console.log('Server running on *:3000');
});


