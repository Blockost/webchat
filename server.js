/*********************/
/* Libs stack ***/

let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);

/*********************/
/**** Custom libs ****/
/*********************/
let utils = require('./static/js/utils');
let Channel = require('./static/js/channel');


/*********************/
/**** Variables ****/
/*********************/
let clients_pool = [];
let channels_pool = [new Channel('#general', 'root')];


// routing
app.use('/static', express.static(__dirname + '/static'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));


/**
 * Serve index page to browser
 */
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});


/**
 * On client's connection, do something...
 */
io.on('connection', function (socket) {

    //TODO Add rooms (channels)

    //TODO Replace with real authentication ?
    socket.on('username_set', (username) => {
        if (username.trim() === '')
            username = 'Anonymous';

        username = username.charAt(0).toUpperCase()
            + username.substr(1, username.length - 1);

        socket.username = username;
        socket.color = utils.getRandomColor();

        // Send updated username + 'unique' custom color
        socket.emit('username_verified', {
            name: username, color: socket.color
        });

        // Update clients array
        clients_pool.push(socket);

        sendMembersUpdate();
        sendChannelsUpdate(socket);
    });

    // Client sent a message
    socket.on('send_message', function (message) {
        // No broadcast of empty messages
        if (message.text.trim() !== '') {
            message.from = socket.username;
            message.text = message.text;
            message.date = new Date();
            message.color = socket.color;
            io.emit('message_received', message);
        }
    });

    // Client wants to create a new channel
    socket.on('add_channel', (channel_name) => {
        channel_name = channel_name.trim();
        if (channel_name !== '') {
            let channel = new Channel(channel_name, socket.username);
            channels_pool.push(channel);
            sendChannelsUpdate();
        }
    });

    socket.on('join_channel', (channel_name) => {
        //TODO Check if channel exists
        socket.join(channel_name);
    });

    socket.on('leave_channel', (channel_name) => {
        //TODO Check if channel exists
        socket.leave(channel_name);
    });

    // Client has disconnected
    socket.on('disconnect', function () {
        clients_pool.splice(clients_pool.indexOf(socket), 1);
        sendMembersUpdate();
    });
});


http.listen(3000, function () {
    console.log('Server running on *:3000');
});


/**
 * Send all members (username + special color) to clients
 * In order to update the channel_members div (right panel)
 */
function sendMembersUpdate() {
    io.emit('members_update', clients_pool.map((socket) => {
        return {name: socket.username, color: socket.color};
    }));
}


function sendChannelsUpdate(socket) {
    let sender = socket || io;

    /**
     * if a socket has been passed,
     * send update to it.
     * Broadcast otherwise
     */
    sender.emit('channels_update', channels_pool.map((channel) => {
        return channel.toJSON();
    }));
}


