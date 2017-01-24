function Channel(name, owner, history) {

    if(name.charAt(0) !== '#')
        name = '#' + name;
    
    this.name = name;
    this.owner = owner;
    
    // History contains all  the previous messages sent to this channel
    // Simple structure message {from, text, date}
    this.history = history || [];

    this.toString = () => {
        console.log(name, owner);
    };
    
    this.toJSON = () => {
        return {
            name: this.name,
            owner: this.owner,
            history: this.history
        };
    }
}

module.exports = Channel;
