var socket = io();

username = prompt("username (3 chars min): ", "Unknown User");
if(username === null  || username.length < 3){
	username = "FallaitEcouterGrosBatard";
}

socket.username = username;

socket.emit('username choosen', socket.username);

$('form').submit(function(){
	var chat_message = {
		from : socket.username,
		text : $('#m').val()
	}
	socket.emit('chat message', chat_message);
  	$('#m').val('');
  	return false; // event.preventDefault(); -> Do not refresh the page on sending
});

socket.on('user connected', function(username){
	$("#messages").append($("<li>")).append($("<blue>").text("A new user is connected : \""+username+"\""));
});

socket.on('user disconnected', function(username){
	$("#messages").append($("<li>")).append($("<red>").text("\""+username+"\" has disconnected"));
});

socket.on('users list', function(list){
	$("#messages").append($("<br>").text(list));
})

socket.on('chat message', function(chat_message){
  	$("#messages").append($("<li>").text(chat_message.from+" says : "+chat_message.text));
});

