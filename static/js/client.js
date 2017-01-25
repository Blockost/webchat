let socket = io();
socket.rooms = [];

/*********************/
/* Messages handling */
/*********************/

let $msg_container = $('.messages_container');
let $channels_container = $('.channels_container');
let $channel_header_name = $('.channel_header_name');
let last_message;

let username = window.prompt("Username: ", "Kévin");
socket.emit('username_set', username);

socket.on('username_verified', (user) => {
    let channels_panel_header = $('.channels_panel_header');
    socket.username = user.name;
    channels_panel_header.append(buildUserRow(user.name, user.color));
});

socket.on('channels_update', (channels) => {
    $channels_container.empty();
    channels.forEach((channel) => {
        $channels_container.append(buildChannelRow(channel.name, channel.owner))
    });
});


socket.on('members_update', (members) => {

    //TODO display members according to current_channel

    let $members_list = $('.members_list');
    let $members_online = $('.members_online');

    $members_online.text('Online: ' + members.length);

    $members_list.empty();
    members.forEach((member) => {
        $members_list.append(buildUserRow(member.name, member.color).addClass('hoverable'));
    });
});

socket.on('message', (message) => {

    console.log(message);

    if (message.channel === socket.currentChannel) {
        // Create a handful message object
        message = new Message(message.from, message.text, message.date, message.color);
        buildAndAppendMessage(message, last_message, $msg_container);
        // Scroll div to bottom
        scrollToBottom($msg_container);
        // Update last message received
        last_message = message;
    } else {
        // Display a badge with the number of unread messages
        let $channel_row = getChannelRowByName(socket.currentChannel);

        // If a badge is already appended, update its value
        // Create a now one, otherwise
        let badge = $channel_row.find('.badge');
        badge.length > 0 ? badge.text(parseInt(badge.text()) + 1)
            : $channel_row.append(buildBadge(1));
    }
});

socket.on('channel_joined', (channel) => {
    if (socket.rooms.indexOf(channel.name) == -1)
        socket.rooms.push(channel.name);

    socket.currentChannel = channel.name;

    getChannelRowByName(channel.name)
        .replaceWith(buildChannelRow(channel.name, channel.owner));

    // Update chat header
    $channel_header_name.text(channel.name);

    $msg_container.empty();
    channel.history.forEach((message) => {
        message = new Message(message.from, message.text, message.date, message.color);
        buildAndAppendMessage(message, last_message, $msg_container);
    });
    scrollToBottom($msg_container);
});

socket.on('channel_left', (channel) => {
    socket.rooms.splice(channel.name, 1);
    getChannelRowByName(channel.name)
        .replaceWith(buildChannelRow(channel.name, channel.owner));
});

socket.on('channel_deleted', (channel) => {
    socket.rooms.splice(channel.name, 1);
    getChannelRowByName(channel.name).remove();
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
 * @returns {JQuery} The created 'JQuery' DOM tree
 */
function buildUserRow(username, color) {
    return $('<div>').addClass('user_row')
        .append($('<div>').addClass('avatar').css('background-color', color)
            .append($('<div>').addClass('avatar_name').text(username.charAt(0))))
        .append($('<div>').addClass('user_name').text(username));
}


function buildChannelRow(channel_name, channel_owner) {

    let $channel_name = $('<div>').addClass('channel_name')
        .text(channel_name).click(selectChannel);

    // If socket is in the channel
    // allows leaving it
    if (socket.rooms.indexOf(channel_name) !== -1)
        $channel_name.append($('<btn>').addClass('btn').click(leaveChannel)
            .append($('<i>').addClass('fa fa-external-link')));

    // If socket is channel owner
    // allows deleting it
    if (channel_owner === socket.username)
        $channel_name.append($('<btn>').addClass('btn').click(deleteChannel)
            .append($('<i>').addClass('fa fa-trash')));

    return $('<div>').addClass('channel_row hoverable clickable')
        .attr('name', channel_name)
        .append($channel_name);
}


/**
 * Build a DOM element containing the number of unread messages in a channel
 * @param message_numbers The number of unread message
 * @returns {JQuery} The created 'JQuery' DOM element
 */
function buildBadge(message_numbers) {
    return $('<div>').addClass('badge').text(message_numbers);

}


function getChannelRowByName(channel_name) {
    return $channels_container
        .find('.channel_row[name="' + channel_name + '"]');
}

function selectChannel(event) {
    let channel_name = $(event.target).text();
    socket.emit('join_channel', channel_name);
}

function leaveChannel(event) {
    let channel_name = $(event.target).text();
    socket.emit('leave_channel', channel_name);
}

function deleteChannel(event) {
    let channel_name = $(event.target).text();
    socket.emit('delete_channel', channel_name);
}


/*************************************/

$('.channel_form').submit((e) => {

    let $channel = $('#channel_input');
    socket.emit('add_channel', $channel.val());

    $channel.val('');
    e.preventDefault();
});

$('.message_form').submit((e) => {

    let $msg = $('#message_input');
    let message = {
        text: $msg.val(),
        channel: socket.currentChannel
    };

    // Automatically send an 'message' event
    socket.send(message);

    $msg.val('');
    e.preventDefault();
});