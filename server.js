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


/*********************/
/**** Variables ****/
/*********************/
let clients_pool = [];
let channels_pool = ["general"];


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
        if(username.trim() === '')
            username = 'Anonymous';

        username = username.charAt(0).toUpperCase()
            + username.substr(1, username.length-1);
        
        socket.username = username;
        socket.color = utils.getRandomColor();

        sendMembersUpdate();
        
        // Send updated username + 'unique' custom color
        socket.emit('username_verified', [username, socket.color]);
    });

    // Update clients array
    clients_pool.push(socket);


    // Client sent a message
    socket.on('send_message', function (message) {

        // No broadcast of empty messages
        if(message.text.trim() !== ''){
            message.from = socket.username;
            message.text = message.text;
            message.date = new Date();
            message.color = socket.color;
            io.emit('message_received', message);
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
    io.emit('channel_members', clients_pool.map((socket) => {
        return [socket.username, socket.color];
    }));
}


