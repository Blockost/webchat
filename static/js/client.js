let socket = io();
socket.rooms = [];

/*********************/
/* Messages handling */
/*********************/

let $msg_container = $('.messages_container');
let $channels_container = $('.channels_container');
let $channel_members = $('.channel_members');
let $channel_header_name = $('.channel_header_name');
let $msg_input = $('#message_input');
let last_message;

socket.on('username_verified', (user) => {
    let profile_picture = $('.channels_panel_header > .user');
    socket.username = user.username;
    profile_picture.append(buildUserRow(user.username, user.color));
});


socket.on('members_update', (members) => {

    let $members_list = $('.members_list');
    let $members_online = $('.members_online');

    $members_online.text('Online (all channels): ' + members.length);

    $members_list.empty();
    let user_row;
    members.forEach((member) => {
        user_row = buildUserRow(member.username, member.color);
        $members_list.append(user_row.addClass('hoverable'));
    });
});

/**
 * On message received
 */
socket.on('message', (message) => {

    if (message.channel === socket.currentChannel) {

        let channel = socket.rooms[getChannelIndexByName(socket.currentChannel)];
        last_message = channel.last_message;
        // Create a handful message object
        message = new Message(message.from, message.text, message.date, message.color);
        buildAndAppendMessage(message, last_message, $msg_container);
        // Scroll div to bottom
        scrollToBottom($msg_container);
        // Update last message received
        channel.last_message = message;
    } else {
        // Display a badge with the number of unread messages
        let $channel_row = getChannelRowByName(message.channel);
        let $channel_misc = $channel_row.find('.channel_misc');

        // If a badge is already appended, update its value
        // Create a now one, otherwise
        let badge = $channel_misc.find('.badge');
        badge.length > 0 ? badge.text(parseInt(badge.text()) + 1)
            : $channel_misc.append(buildBadge(1));
    }
});


socket.on('channel_members_update', (users) => {
    $channel_members.empty();
    users.forEach((user) => {
        $channel_members.append(buildAvatar(user.username, user.color));
    });
});


/**
 * On channel joined
 */
socket.on('channel_joined', (channel) => {

    if (getChannelIndexByName(channel.name) == -1)
        socket.rooms.push({name: channel.name});

    socket.currentChannel = channel.name;

    getChannelRowByName(channel.name)
        .replaceWith(buildChannelRow(channel.name, channel.owner));

    // Update chat header
    $channel_header_name.text('#' + channel.name);


    $msg_container.empty();
    last_message = undefined;

    channel.history.forEach((message, index) => {
        message = new Message(message.from, message.text, message.date, message.color);
        buildAndAppendMessage(message, last_message, $msg_container);
        let tmp_message = channel.history[index];
        last_message = new Message(tmp_message.from, tmp_message.text, tmp_message.date, tmp_message.color);
    });
    scrollToBottom($msg_container);
    $msg_input.focus();
});

/**
 * On channel left
 */
socket.on('channel_left', (channel) => {
    socket.rooms.splice(getChannelIndexByName(channel.name), 1);

    /**
     * If this event doesn't come from a 'channel_deleted' event:
     * update channel row. Otherwise, do nothing...
     */
    if (!channel.deleted)
        getChannelRowByName(channel.name)
            .replaceWith(buildChannelRow(channel.name, channel.owner));

    if (channel.name === socket.currentChannel) {
        $msg_container.empty();
        $channel_members.empty();
        $channel_header_name.empty();
        socket.currentChannel = '';
    }
});

/**
 * On channel successfully added
 */
socket.on('channel_added', (channel) => {
    $channels_container
        .append(buildChannelRow(channel.name, channel.owner))
});


/**
 * On channel deleted
 */
socket.on('channel_deleted', (channel_name) => {
    getChannelRowByName(channel_name).remove();
});


/*************************************************************************/

/**
 * Build whether a fully detailed message (sender + date)
 * or a shortly detailed message (text only)
 * @param {Message} new_message
 * @param {Message} last_message
 * @param {JQuery} $message_container The DOM container of the returned message
 * @Return {JQuery} The DOM 'message' element built
 */
function buildAndAppendMessage(new_message, last_message, $message_container) {

    /**
     * Compare sender from previous and new messages
     * Compare time
     * If same sender and time diff <= 30s,
     * append message to previous ones
     */
    if (typeof last_message !== 'undefined'
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


function buildAvatar(username, color) {
    return $('<div>').addClass('avatar ' + color)
        .append($('<div>').addClass('avatar_name')
            .text(username.charAt(0)))
}

/**
 * Construct a user row (avatar + username) as a Jquery object (DOM Tree)
 * @param username client's name
 * @param color client's custom color
 * @returns {JQuery} The created 'JQuery' DOM tree
 */
function buildUserRow(username, color) {
    let avatar = buildAvatar(username, color);
    return $('<div>').addClass('user_row')
        .append(avatar)
        .append($('<div>').addClass('user_name').text(username));
}


function buildChannelRow(channel_name, channel_owner) {

    let $channel_name = $('<div>').addClass('channel_name')
        .text('#' + channel_name);

    let $channel_misc = $('<div>').addClass('channel_misc');

    // If socket is in the channel
    // allows leaving it
    if (getChannelIndexByName(channel_name) != -1)
        var $btn_leave = $('<button>').addClass('btn btn_leave').click(leaveChannel)
            .append($('<i>').addClass('fa fa-external-link'));

    // If socket is channel owner
    // allows deleting it
    if (channel_owner === socket.username)
        var $btn_delete = $('<button>').addClass('btn btn_delete').click(deleteChannel)
            .append($('<i>').addClass('fa fa-trash'));

    $channel_misc.append($btn_leave).append($btn_delete);

    return $('<div>').addClass('channel_row hoverable clickable')
        .attr('id', channel_name)
        .append($channel_name)
        .append($channel_misc)
        .click(selectChannel);
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
        .find('.channel_row[id="' + channel_name + '"]');
}

function getChannelIndexByName(channel_name) {
    for (let i = 0; i < socket.rooms.length; i++) {
        let channel = socket.rooms[i];
        if (channel.name == channel_name)
            return i;
    }
    return -1;
}

function selectChannel(event) {
    let channel_name = $(event.target).attr('id');
    if (socket.currentChannel != channel_name)
        socket.emit('join_channel', channel_name);
}

function leaveChannel(event) {
    let channel_name = $(event.target)
        .closest('.channel_row')
        .attr('id');

    socket.emit('leave_channel', channel_name);
}

function deleteChannel(event) {
    let channel_name = $(event.target)
        .closest('.channel_row')
        .attr('id');

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

    if (socket.currentChannel !== '') {
        let $msg = $('#message_input');
        let message = {
            text: $msg.val(),
            channel: socket.currentChannel
        };

        // Automatically send an 'message' event
        socket.send(message);

        $msg.val('');
    }


    e.preventDefault();
});