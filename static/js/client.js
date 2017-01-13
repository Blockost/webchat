let socket = io();

$('form').submit(function (e) {

    let $msg = $('#message_input');
    let message = {
        from: socket.username,
        text: $msg.val(),
        time: new Date()
    };

    socket.emit('send_message', message);
    $msg.val('');

    e.preventDefault();
});

let $channel_members = $('#channel_members');
let $msg_container = $('#messages_container');
let last_message;

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
    buildMessage(message, last_message).appendTo('#messages_container');
    // Update last message received
    last_message = message;
});

function buildMessage(new_message, last_message) {
    if(!(typeof last_message === 'undefined')){

        /**
         * Compare sender from previous and new messages
         * Compare time
         * If same sender and time diff <= 30s,
         * append message to previous ones
         */
        if (new_message.from === last_message.from
            && Math.abs(new_message.time - last_message.time) <= 30000) {
            return appendMessageToPrevious(new_message);
        }
    }

    return buildNewMessage(new_message);
}


function appendMessageToPrevious(message){
    return $('<p>' + message.text + '</p>');
}

function buildNewMessage(message){
    return $('<span class="msg_sender">' + message.from + '</span><span class="msg_time">'
        + formatDate(message.time) + '</span><br>'
        + '<p>' + message.text + '</p>');
}

function formatDate(date){
    console.log(typeof date);
    return date.toTimeString()
        .split(' ')[0]
        .toString();
}