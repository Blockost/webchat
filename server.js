/* 
	same as: var app = require('express')();
*/

let express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var url = require('url');
var allClients = [];

// routing
app.use('/static', express.static(__dirname + '/static'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));

app.get('/', function (req, res){
	res.sendFile(__dirname+'/index.html');
});


app.get('/test', function (req, res){
	var reqObj = url.parse(req.url, true);
	res.end('request received at '+reqObj.pathname+"\n"+JSON.stringify(reqObj));
});

///TODO Add rooms (channels)
io.on('connection', function(socket){
	// Attribute a random username to the client
	//TODO Replace with real authentication
	let username = 'anonymous'+allClients.length+1;

	socket.username = username;
	socket.emit('username_set', username);

	// Update clients array
	allClients.push(socket);

	sendMembersUpdate();
	
	// Client sent a message
	socket.on('send_message', function(chat_message){
    	io.emit('message_received', chat_message);
 	});	

	// Client has disconnected
 	socket.on('disconnect', function(){
 		socket.broadcast.emit('user_disconnected', socket.username);
 		allClients.splice(allClients.indexOf(socket), 1);
		sendMembersUpdate();
 	});

});



http.listen(3000, function(){
	console.log('Server running on *:3000');
});


/**
 * Send all the member to clients
 * In order to update the channel_members div (right panel)
 */
function sendMembersUpdate(){
	io.emit('channel_members', allClients.map((socket) => {
		return socket.username
	}));
}


