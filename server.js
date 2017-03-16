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

/*********************/
/**** Variables ****/
/*********************/
let clients_pool = [];
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
    saveUninitialized: false, // Don't save unmodified cookies
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
 */
let mongodb_url = 'mongodb://localhost:27017/F21NA_se22_chat';
db.connect(mongodb_url, (err) => {
    if (err) throw err;
    console.log('-- Connected to ' + mongodb_url);
});

// Controllers middleware
app.use(require('./controllers/baseController'));


/**
 * On client's connection, do something...
 */
io.on('connection', function (socket) {

    socket.username = socket.request.session.user;
    socket.color = utils.getRandomColor();

    // Send updated username + 'unique' custom color
    socket.emit('username_verified', {
        name: socket.username, color: socket.color
    });

    // Update clients array
    clients_pool.push(socket);

    sendMembersUpdate();

    // Automatically connect it to 'general' channel
    let channel_general = channels_pool[0];
    socket.join(channel_general.name);
    socket.emit('channel_joined', channel_general.toJSON());

    socket.emit('channels_update');

    // Send to socket all the channels available
    for(let c of channels_pool){
        socket.emit('channel_added', c.toShortJSON());
    }


    // Client sent a message
    socket.on('message', function (message) {

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
        if(channel_name !== '' && !getChannelByName(channel_name)){
            let channel = new Channel(channel_name, socket.username);
            channels_pool.push(channel);
            // Broadcast to all sockets the new channel
            io.emit('channel_added', channel.toShortJSON());
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
            socket.emit('channel_left', getChannelByName(channel_name).toShortJSON());
        }
    });

    socket.on('delete_channel', (channel_name) => {
        let channel = getChannelByName(channel_name);
        if (channel && channel.owner === socket.username) {

            // Retrieve short JSON object
            channel = channel.toShortJSON();
            channel.deleted = true;

            // Send a confirmation to each sockets in this channel
            // Every socket will leave the channel
            io.emit('channel_deleted', channel_name);
            io.in(channel_name).emit('channel_left', channel);

            channels_pool.splice(channels_pool.indexOf(channel), 1);
        }

    });

    // Client has disconnected
    socket.on('disconnect', function () {
        clients_pool.splice(clients_pool.indexOf(socket), 1);
        sendMembersUpdate();
    });
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


/**
 *
 * @param socket
 */
function sendChannelsUpdate(channel) {

    /**
     * if a socket has been passed,
     * send update to it.
     * Broadcast otherwise
     */
    
    if(channel){
        io.emit('channels_update', channel.toJSON()); 
    } else {
        socket.emit('channels_update', channels_pool.map((channel) => {
            return channel.toJSON();
        }));
    }    
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


/********************/
/*** START SERVER ***/
/********************/
http.listen(3000, () => {
    console.log('Server running on *:3000');
});


