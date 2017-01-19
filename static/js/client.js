let socket = io();

$('#channel_form').submit((e) => {

    let $channel = $('#channel_input');
    //TODO Add channel '#$channel.val()';

    //socket.emit('add_channel', null);

    e.preventDefault();
});

$('.message_form').submit((e) => {

    let $msg = $('#message_input');

    let message = {text: $msg.val()};
    socket.emit('send_message', message);

    $msg.val('');

    e.preventDefault();
});

/*********************/
/* Messages handling */
/*********************/

let $msg_container = $('.messages_container');
let last_message;

let username = window.prompt("Username: ", "Kévin");
socket.emit('username_set', username);

socket.on('username_verified', (res) => {
    let username = res[0];
    let color = res[1];
    
    let channels_panel_header = $('.channels_panel_header');
    channels_panel_header.append(buildUserRow(username, color));
});


socket.on('channel_members', (members) => {

    let $members_list = $('.members_list');
    let $members_online = $('.members_online');

    $members_online.text('Online: ' + members.length);

    $members_list.empty();
    members.forEach((member) => {
        $members_list.append(buildUserRow(member[0], member[1]).addClass('clickable'));
    });
});

socket.on('message_received', function (message) {
    // Create a handful message object
    message = new Message(message.from, message.text, message.date, message.color);
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

/**
 * Scroll a HTML object to the bottom end (if scrollable)
 * @param {Object} $div JQuery scrollable div
 */
function scrollToBottom($div) {
    $div.scrollTop($div.prop('scrollHeight'));
}


/**
 * Construct a user row (avatar + username) as a Jquery object (DOM Tree)
 * @param username client's name
 * @param color client's custom color
 * @returns {Object} The created 'JQuery' DOM tree
 */
function buildUserRow(username, color) {
    return $('<div>').addClass('user_row')
        .append($('<div>').addClass('avatar').css('background-color', color)
            .append($('<div>').addClass('avatar_name').text(username.charAt(0))))
        .append($('<div>').addClass('user_name').text(username));
}