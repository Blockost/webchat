let socket = io();

$('form').submit(function (e) {

    let $msg = $('#message_input');
    let message = {
        from: socket.username,
        text: $msg.val()
    };

    socket.emit('send_message', message);
    $msg.val('');

    e.preventDefault();
});

let $channel_members = $('#channel_members');
let $msg_container = $('#messages_container');

socket.on('username_set', (username) => {
    socket.username = username;
});


socket.on('channel_members', (members) => {
    $channel_members.empty();
    members.forEach((member) => {
        $channel_members.append('<p>' + member + '</p>');
    });
});


socket.on('user_connected', function (username) {
    $msg_container.append($("<p>").text("A new user is connected : \"" + username + "\""));
});

socket.on('user_disconnected', function (username) {
    $msg_container.append($("<p>").text("\"" + username + "\" has disconnected"));
});

socket.on('message_received', function (message) {
    buildMessage(message).appendTo('#messages_container');
});

function buildMessage(message) {
    return $('<strong>' + message.from + '</strong><br>'
        + '<p>' + message.text + '</p>');
}