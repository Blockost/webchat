/**
 * Authors: Simon ESPIGOLÉ, Teddy GILBERT, Hugo LEGRAND
 */

/*********************/
/* Libs stack ***/

let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);

// Declare a middleware component which
// will parse incoming requests before
// they will be handled by the route handlers
let bodyParser = require('body-parser');


// Declare a middleware component which
// implements sessions and cookies
let sessions = require('express-session');

/*********************/
/**** Custom libs ****/
/*********************/
let db = require('./db');
let utils = require('./static/js/utils');
let Channel = require('./static/js/channel');
let ClientPool = require('./static/js/ClientPool');
let Logger = require('./Logger');

/*********************/
/**** Variables ****/
/*********************/
let clients_pool = new ClientPool();
let channels_pool = [new Channel('general', 'root')];


/******************/
/*** APP CONFIG ***/
/******************/

// routing
app.use('/static', express.static(__dirname + '/static'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

let sessionMiddleware = sessions({
    secret: '%%dZug37#tomiSJNpU#T4k*h8',
    maxAge: 30 * 60 * 1000, // cookie lives for 30 min
    httpOnly: true, // Cookies cannot be accessed via Javascript
    resave: false, // Do not resave a cookie if not modified during a request
    saveUninitialized: false // Don't save unmodified cookies
});


/**
 * sessions/cookies config
 */
app.use(sessionMiddleware);
// Sharing session between express and socket.io
io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res, next);
});


/**
 * Initiate db connection
 * Prod url: mongodb://se22:abcse22354@mongo-server-1/se22
 */
let mongodb_url = 'mongodb://localhost:27017/F21NA_se22_chat';
db.connect(mongodb_url, (err) => {
    if (err) Logger.getInstance().log(err, 'ERROR');
    else Logger.getInstance().log('-- Connected to ' + mongodb_url);
});

// Controllers middleware
app.use(require('./controllers/baseController'));


/**
 * On client's connection, do something...
 */
io.on('connection', (socket) => {

    // If a session has been append to the socket,
    // return immediately
    if (!socket.request || !socket.request.session)
        return;

    socket.username = socket.request.session.user;
    Logger.getInstance().log(socket.username + ' connected');
    socket.color = utils.getRandomColor();

    // Send updated username + 'unique' custom color
    socket.emit('username_verified', {
        username: socket.username, color: socket.color
    });

    // Update clients array
    clients_pool.push(socket);

    sendMembersUpdate();

    // Automatically connect it to 'general' channel
    let channel_general = channels_pool[0];
    onChannelJoin(socket, channel_general);

    socket.emit('channels_update');

    // Send to socket all the channels available
    for (let c of channels_pool) {
        socket.emit('channel_added', c.toShortJSON());
    }


    // Client sent a message
    socket.on('message', (message) => {

        // No broadcast of empty messages
        // or message sent to imaginary channel
        let channel = getChannelByName(message.channel);

        if (message.text.trim() !== '' && channel) {
            message.from = socket.username;
            message.text = message.text;
            message.date = new Date();
            message.color = socket.color;
            message.channel = channel.name;

            // Add message to channel's history
            channel.history.push(message);

            // Broadcast to all clients in this channel
            io.in(channel.name).send(message);
        }
    });

    // Client wants to create a new channel
    socket.on('add_channel', (channel_name) => {
        channel_name = channel_name.trim();
        if (channel_name !== '' && !getChannelByName(channel_name)) {
            let channel = new Channel(channel_name, socket.username);
            channels_pool.push(channel);
            // Broadcast to all sockets the new channel
            io.emit('channel_added', channel.toShortJSON());
            Logger.getInstance().log('New channel added: #' + channel_name + ' by ' + socket.username);
        }
    });

    socket.on('join_channel', (channel_name) => {
        let channel = getChannelByName(channel_name);
        if (channel)
            onChannelJoin(socket, channel);
    });

    socket.on('leave_channel', (channel_name) => {
        let channel = getChannelByName(channel_name);
        if (channel)
            onChannelLeave(socket, channel)
    });

    socket.on('delete_channel', (channel_name) => {
        let channel = getChannelByName(channel_name);
        if (channel && channel.owner === socket.username) {

            channel.delete();

            // Send a confirmation to all sockets
            io.emit('channel_deleted', channel_name);

            channels_pool.splice(channels_pool.indexOf(channel), 1);
            Logger.getInstance().log(socket.username + ' has deleted its channel #' + channel_name);
        }

    });

    // Client has disconnected
    socket.on('disconnect', () => {
        clients_pool.remove(socket);
        channels_pool.forEach((channel) => {
            let text = buildLeaveMessage(socket.username, channel.name);
            let message = buildSystemMessage(text, channel.name);
            channel.leave(socket, message);
        });

        sendMembersUpdate();
        Logger.getInstance().log(socket.username + ' has disconnected. Bye!');
    });
});

function buildJoinMessage(username, channel_name) {
    return username + ' joined #' + channel_name;
}

function buildLeaveMessage(username, channel_name) {
    return username + ' left #' + channel_name;
}


function onChannelJoin(socket, channel) {

    socket.join(channel.name);
    socket.currentChannel = channel.name;

    let text = buildJoinMessage(socket.username, channel.name);
    let message = buildSystemMessage(text, channel.name);

    Logger.getInstance().log(text);

    channel.join(socket, message);

}


function onChannelLeave(socket, channel) {
    socket.leave(channel.name);

    if (socket.currentChannel == channel.name)
        socket.currentChannel = '';

    let text = buildLeaveMessage(socket.username, channel.name);
    let message = buildSystemMessage(text, channel.name);
    channel.leave(socket, message);

    Logger.getInstance().log(text);
}

/**
 * Send all members (username + special color) to clients
 * In order to update the channel_members div (right panel)
 */
function sendMembersUpdate() {
    io.emit('members_update', clients_pool.getClients());
}

/**
 * Retrieve a channel according to its name
 * @param {string} name The channel's name
 * @returns {Channel|null} The Channel if found, null otherwise
 */
function getChannelByName(name) {
    for (let channel of channels_pool) {
        if (channel.name === name) return channel;
    }
    return null;
}


function buildSystemMessage(message, channel_name) {
    return {from: 'system', text: message, channel: channel_name};
}


/********************/
/*** SERVER START ***/
/********************/
http.listen(3000, () => {
    Logger.getInstance().log('Server running on *:3000');
});

