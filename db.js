let MongoClient = require('mongodb').MongoClient;
let db;


exports.connect = (url, callback) => {
    MongoClient.connect(url, (err, db) => {
        if(err) callback(err);
        this.db = db;
        callback();
    });
};

exports.get = () => {
    return this.db;
};

exports.close = (callback) => {
    if(this.db){
        this.db.close((err, res) => {
            if(err) callback(err);
            this.db = null;
            callback(null, res);
        });
    }
};