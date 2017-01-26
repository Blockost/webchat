'use strict';

let secureUser = require('./securedUser');

function SecuredUsers() {

    let pool = [];

    this.find = (object, callback) => {

        if (object.username) {
            let l = pool.length;
            for (let i = 0; i < l; i++) {
                if (object.username === pool[i].username)
                    return callback(undefined, pool[i])
            }
        } else 
            return callback('username not specified', undefined);

        return callback('user not found', undefined)
    };

    this.add = (username, password) => {
        let securedUser = new secureUser(username, password);
        pool.push(securedUser);
    };
    
}


module.exports = SecuredUsers;
