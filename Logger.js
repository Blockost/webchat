let fs = require('fs');

const path = 'log.txt';
const enc = 'utf8';
let instance = null;

let logger = (options) => {

    this.options = options || {};
    this.path = this.options.path || path;
    this.enc = this.options.enc || enc;

    this.log = (message, log_level) => {
        message = new Date() + '> ' + message;
        console.log(message);
        fs.appendFile(this.path, message + '\n', this.enc, (err) => {
            if (err) console.error("Couldn't write into '" + this.path + "'");
        });

        if (log_level === 'ERROR')
            throw message;
    };

    return this;
};

exports.getInstance = () => {
    if (!instance) instance = logger();
    return instance;
};