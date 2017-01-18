let socket = io();

$('#channel_form').submit((e) => {

    let $channel = $('#channel_input');
    //TODO Add channel '#$channel.val()';

    //socket.emit('add_channel', null);

    e.preventDefault();
});

$('.message_form').submit((e) => {

    let $msg = $('#message_input');

    // No need to create a Message class as this
    // object will be serialized when it passes
    // throughout the socket and because there is
    // no server-side message processing
    let message = {
        from: socket.username,
        text: $msg.val(),
        date: new Date()
    };

    if (message.text.trim() !== '')
        socket.emit('send_message', message);

    $msg.val('');

    e.preventDefault();
});

/*********************/
/* Messages handling */
/*********************/

let $channel_members = $('.members');
let $msg_container = $('.messages_container');
let last_message;

socket.on('username_set', (username) => {
    socket.username = username;
});


socket.on('channel_members', (members) => {
    $channel_members.empty();
    members.forEach((member) => {
        $channel_members.append($('<div>').addClass('clickable').text(member));
    });
});

socket.on('message_received', function (message) {

    message = new Message(message.from, message.text, message.date);
    buildAndAppendMessage(message, last_message, $msg_container);
    // Scroll div to bottom
    scrollToBottom($msg_container);
    // Update last message received
    last_message = message;
});

/**
 * Build whether a fully detailed message (sender + date)
 * or a shortly detailed message (text only)
 * @param {Message} new_message
 * @param {Message} last_message
 * @Return {Object} a jquery object
 */
function buildAndAppendMessage(new_message, last_message, $message_container) {

    /**
     * Compare sender from previous and new messages
     * Compare time
     * If same sender and time diff <= 30s,
     * append message to previous ones
     */
    if (!(typeof last_message === 'undefined')
        && new_message.hasSameSourceThan(last_message)
        && new_message.getTimeIntervalWith(last_message) <= 30000) {

        new_message.buildShortMessage().appendTo('.msg_group:last');
    } else {

        new_message.buildFullMessage().appendTo($message_container);
    }

}


function scrollToBottom($div) {
    $div.scrollTop($div.prop('scrollHeight'));
}




