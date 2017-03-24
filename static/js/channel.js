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

    this.users = [];
    
    this.delete = () => {
        this.deleted = true;
    };

    this.getUsernames = () => {
        return this.users;
    };

    this.indexOf = (username) => {
        for(let i = 0; i < this.users.length; i++){
            if(this.users[i].username = username)
                return i;
        }
        return -1;
    };

    this.isIn = (user) => {
        return this.indexOf(user.username) != -1;
    };

    this.join = (user) => {
        if(!this.isIn(user))
            this.users.push({username: user.username, color: user.color});
    };

    this.leave = (user) => {
        let index = this.indexOf(user.username);
        if(index != -1) this.users.splice(index, 1);
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
        JSON.users = this.users;
        return JSON;
    }
}

module.exports = Channel;
