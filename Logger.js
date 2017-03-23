let fs = require('fs');

const path = 'log.txt';
const enc = 'utf8';
let instance = null;

let logger = (options) => {

    this.options = options || {};
    this.path = this.options.path || path;
    this.enc = this.options.enc || enc;
    
    this.log = (message) => {
        message = new Date() + '> ' + message,
        console.log(message);
        fs.appendFile(this.path, message + '\n', this.enc, (err) => {
            if (err) console.error("Couldn't write into '" + this.path + "'");
        });
    };
    
    return this;
};

exports.getInstance = () => {
    if(!instance) instance = logger();
    return instance;
};