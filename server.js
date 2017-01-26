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
let utils = require('./static/js/utils');
let Channel = require('./static/js/channel');


/*********************/
/**** Variables ****/
/*********************/
let clients_pool = [];
let channels_pool = [new Channel('#general', 'root')];


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

// sessions/cookies config
app.use(sessionMiddleware);
// Sharing session between express and socket.io
io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res, next);
});


/**
 * Serve index page to browser
 */

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/chat', requireAuth, (req, res) => {
    res.sendFile(__dirname + '/chat.html');
});


app.post('/login', (req, res) => {

    let username = req.body.username;
    let password = req.body.password;

    // If username exists, then the password must match the username
    // If username doesn't exist, then store username/password
    //TODO Ok, existing user auth
    // TODO No, existing user NOT AUTH

    if (username === 'lala' && password === 'lala') {
        req.session.user = username;
        return res.send({redirectTo: '/chat'});
    }

    return res.send('NO AUTH');
});


app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});


/**
 * Check if user is authenticated
 * @param req The request user sends
 * @param res The responds we'll send to the user
 * @param next The next delegate routing handler
 */
function requireAuth(req, res, next) {
    if (!req.session || !req.session.user){
        return res.redirect('/');
    }
    // If session cookie exists, continue...
    next();
}

function getSecuredUser(username) {
    //TODO check in a DS if username exists
    return null;
}


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

    // Automatically connect it to '#general' channel
    socket.join(channels_pool[0].name);
    socket.emit('channel_joined', channels_pool[0].toJSON());

    sendChannelsUpdate(socket);


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
            socket.emit('channel_left', getChannelByName(channel_name).toShortJSON());
        }
    });

    socket.on('delete_channel', (channel_name) => {
        let channel = getChannelByName(channel_name);
        if (channel) {
            /*if (channel.owner === socket.username) {
                io.in(channel_name).emit('channel_deleted', channel_name);
                /!*io.sockets.in(channel_name).leave(channel_name);*!/

                io.sockets.clients(channel_name).forEach((socket) => {
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


/********************/
/*** START SERVER ***/
/********************/
http.listen(3000, function () {
    console.log('Server running on *:3000');
});


