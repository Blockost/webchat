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

        // Automatically connect it to '#general' channel
        socket.join(channels_pool[0].name);
        socket.emit('channel_joined', channels_pool[0].toJSON());

        sendChannelsUpdate(socket);
    });

    // Client sent a message
    socket.on('message', function (message) {

        //TODO Add message to channel's history
        // No broadcast of empty messages
        // or message sent to imaginary channel
        let channel = getChannelByName(message.channel);

        if (message.text.trim() !== '' && channel) {
            message.from = socket.username;
            message.text = message.text;
            message.date = new Date();
            message.color = socket.color;

            // Add message to channel's history
            channel.history.push(message);

            // Broadcast to all clients in this channel
            io.in(channel.name).send(message);
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
        let channel = getChannelByName(channel_name);
        if (channel) {
            socket.join(channel_name);
            socket.currentChannel = channel_name;
            // Warn user that he has successfully joined this channel
            // and send it its history
            socket.emit('channel_joined', channel.toJSON());
        }
    });

    socket.on('leave_channel', (channel_name) => {
        let channel = getChannelByName(channel_name);
        if (channel) {
            socket.leave(channel_name);
            socket.emit('channel_left', getChannelByName(channel_name).toJSON());
        }
    });

    socket.on('delete_channel', (channel_name) => {
        let channel = getChannelByName(channel_name);
        if (channel) {
            /*if(channel.owner === socket.username){
             io.in(channel_name).emit('channel_deleted', channel_name);
             io.sockets.in(channel_name).leave(channel_name);
             //TODO Remove everybody from that channel
             io.sockets.clients(channel_name).forEach(function(socket){
             socket.leave(channel_name);
             });
             channels_pool.splice(getChannelByName(channel_name), 1);
             }*/
        }
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

/**
 * Retrieve a channel according to its name
 * @param {string} name
 * @returns {Channel}
 */
function getChannelByName(name) {
    for (let channel of channels_pool) {
        if (channel.name === name) return channel;
    }
    return null;
}


