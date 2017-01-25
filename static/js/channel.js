function Channel(name, owner, history) {

    if(name.charAt(0) !== '#')
        name = '#' + name;
    
    this.name = name.substr(0, 11);
    this.owner = owner;
    
    // History contains all  the previous messages sent to this channel
    // Simple structure message {from, text, date}
    this.history = history || [];

    this.toString = () => {
        console.log(name, owner);
    };
    
    this.toShortJSON = () => {
        return {
            name: this.name,
            owner: this.owner,
        };
    };
    
    this.toJSON = () => {
        let JSON = this.toShortJSON();
        JSON.history = this.history;
        return JSON;
    }
}

module.exports = Channel;
