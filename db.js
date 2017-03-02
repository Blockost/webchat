let MongoClient = require('mongodb').MongoClient;
let db;


exports.connect = (url, done) => {
    MongoClient.connect(url, (err, db) => {
        if(err) done(err);
        this.db = db;
        done();
    });
};

exports.get = () => {
    return this.db;
};

exports.close = (done) => {
    if(this.db){
        this.db.close((err, res) => {
            if(err) done(err);
            this.db = null;
            done(null, res);
        });
    }
};