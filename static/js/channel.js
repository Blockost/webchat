/**
 * Authors: Simon ESPIGOLÉ, Teddy GILBERT, Hugo LEGRAND
 */

function Channel(name, owner, history) {

    // 10 chars max for channel name
    this.name = name.substr(0, 11);
    this.owner = owner;

    // History contains all  the previous messages sent to this channel
    // Simple structure message {from, text, date}
    this.history = history || [];

    this.deleted = false;

    // Basically, an array containing each
    // socket connected to that channel
    this.sockets = [];

    this.delete = () => {
        this.deleted = true;
        this.sockets.forEach(socket => {
            socket.emit('channel_left', this.toShortJSON());
        });
    };

    this.getUsers = () => {
        return this.sockets.map((socket) => {
            return {
                username: socket.username,
                color: socket.color
            };
        });
    };

    this.indexOf = (username) => {
        for (let i = 0; i < this.sockets.length; i++) {
            if (this.sockets[i].username == username)
                return i;
        }
        return -1;
    };

    this.isIn = (socket) => {
        return this.indexOf(socket.username) != -1;
    };

    this.join = (socket, message) => {

        /* If the user is not already in the channel */
        if (!this.isIn(socket)) {
            this.sockets.push(socket);

            if (message) {
                this.history.push(message);
                this.sockets.forEach((_sock) => {
                    _sock.send(message);
                    _sock.emit('channel_members_update', this.getUsers());
                });
            }
        }

        // Notify user
        socket.emit('channel_joined', this.toJSON());
        socket.emit('channel_members_update', this.getUsers());
    };


    this.leave = (socket, message) => {
        let index = this.indexOf(socket.username);
        if (index != -1) {
            this.sockets.splice(index, 1);
            socket.emit('channel_left', this.toShortJSON());

            if (message) {
                this.history.push(message);
                this.sockets.forEach((_sock) => {
                    _sock.send(message);

                    // Send members update
                    if (_sock.currentChannel == this.name)
                        _sock.emit('channel_members_update', this.getUsers());
                });
            }
        }
    };

    this.toShortJSON = () => {
        return {
            name: this.name,
            owner: this.owner,
            deleted: this.deleted
        };
    };

    this.toJSON = () => {
        let JSON = this.toShortJSON();
        JSON.history = this.history;
        JSON.users = this.getUsers();
        return JSON;
    }
}

module.exports = Channel;
