/**
 * Authors: Simon ESPIGOLÉ, Teddy GILBERT, Hugo LEGRAND
 */

function ClientPool() {

    this.pool = [];

    this.indexOf = (socket) => {
        for (let i = 0; i < this.pool.length; i++) {
            if (this.pool[i].username == socket.username)
                return i
        }
        return -1;
    };

    this.push = (socket) => {
        this.pool.push(socket);
    };

    this.remove = (socket) => {
        let index = this.indexOf(socket);
        if (index != -1) this.pool.splice(index, 1);
    };

    this.map = (callback) => {
        return this.pool.map(callback);
    };

    this.getClients = () => {
        let sockets_distinct = [];
        let current_socket;
        for (let i = 0; i < this.pool.length; i++) {
            current_socket = this.pool[i];
            if (!isDuplicate(current_socket.username, sockets_distinct))
                sockets_distinct[i] = {
                    username: current_socket.username,
                    color: current_socket.color
                };
        }

        return sockets_distinct;
    }
}

function isDuplicate(username, arr) {
    for (let s of arr) {
        if (s.username === username)
            return true;
    }
    return false;
}

module.exports = ClientPool;