/**
 * Authors: Simon ESPIGOLÉ, Teddy GILBERT, Hugo LEGRAND
 */

function ChannelPool() {

    this.pool = [];

    this.indexOf = (channel_name) => {
        for (let i = 0; i < this.pool.length; i++) {
            if (this.pool[i].name == channel_name)
                return i
        }
        return -1;
    };

    this.push = (channel) => {
        this.pool.push(channel);
    };

    this.remove = (channel) => {
        let index = this.indexOf(channel.name);
        if (index != -1) this.pool.splice(index, 1);
    };

    this.getUsersIn = (channel_name) => {
        let channel = this.pool[this.indexOf(channel_name)];
        let users_distinct = [];
        let channel;
        for (let i = 0; i < this.pool.length; i++) {
            channel = this.pool[i];
            if (!isDuplicate(current.username, users_distinct))
                users_distinct[i] = {
                    username: current.username,
                    color: current.color
                };
        }

        return users_distinct;
    }
}

module.exports = ChannelPool;