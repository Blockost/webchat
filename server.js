/* 
 same as: var app = require('express')();
 */

let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let fs = require('fs');
let url = require('url');
let clients_pool = [];
let channels_pool = ["general"];

// routing
app.use('/static', express.static(__dirname + '/static'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));


app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});


app.get('/test', function (req, res) {
    var reqObj = url.parse(req.url, true);
    res.end('request received at ' + reqObj.pathname + "\n" + JSON.stringify(reqObj));
});

///TODO Add rooms (channels)
io.on('connection', function (socket) {
    // Attribute a random username to the client
    //TODO Replace with real authentication
    let username = 'anonymous' + clients_pool.length + 1;

    socket.username = username;
    socket.emit('username_set', username);

    // Update clients array
    clients_pool.push(socket);

    sendMembersUpdate();

    // Client sent a message
    socket.on('send_message', function (message) {
        
        // No broadcast of empty messages
        if(message.text.trim() !== ''){
            message.from = socket.username;
            message.text = escapeHtmlChars(message.text);
            message.date = new Date();
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
 * Send all members to clients
 * In order to update the channel_members div (right panel)
 */
function sendMembersUpdate() {
    io.emit('channel_members', clients_pool.map((socket) => {
        return socket.username
    }));
}


/**
 * Escape all html chars in a string
 * @param {String} s string needed to be escaped
 * @returns {String} the escaped string
 */
function escapeHtmlChars(s) {

    let chars_matching = {
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#39;',
        '<': '&lt;',
        '>': '&gt;'
    };

    return s.replace(/[&"<>']/g,  (c) => {
        return chars_matching[c];
    });
}


