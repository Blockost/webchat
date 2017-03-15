let Logger = () => {
    this.logger = null;
    
    this.createInstance = () => {
        this.logger = {};
    };
    
    this.getInstance = () => {
        if(!this.logger)
            this.createInstance();
        return this.logger;
    };
    
    this.log = (message) => {
        console.log(message);
    }
};

module.exports = Logger;