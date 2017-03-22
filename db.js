/**
 * Authors: Simon ESPIGOLÉ, Teddy GILBERT, Hugo LEGRAND
 */

let MongoClient = require('mongodb').MongoClient;
let db;

const COLLECTION_USER = 'users';


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

exports.getUser = (username, callback) => {
    this.db.collection(COLLECTION_USER)
        .findOne({username: username}, (err, user) => {
            if (err) callback(err);
            callback(null, user);
        });
};

exports.insertUser = (username, password, callback) => {
    this.db.collection(COLLECTION_USER).insertOne({
        username: username,
        password: password
    }, (err, user) => {
        if (err) callback(err);
        callback(null, user);
    });
};