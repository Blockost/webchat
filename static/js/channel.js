function Channel(name, owner) {

    if(name.charAt(0) !== '#')
        name = '#' + name;
    
    this.name = name;
    this.owner = owner;

    this.toString = () => {
        console.log(name, owner);
    };
    
    this.toJSON = () => {
        return {
            name: this.name,
            owner: this.owner
        };
    }
}

module.exports = Channel;
