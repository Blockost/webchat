var socket = io();

$('form').submit(function(){
	socket.emit('chat message', $('#m').val());
  	$('#m').val('');
  	return false; // event.preventDefault();
});

socket.on('chat message', function(msg){
  	$("#messages").append($("<li>").text(msg));
});

socket.on('new user connected', function(){
	$("#messages").append($("<li>")).append($("<red>").text("A new user is connected !"));
})