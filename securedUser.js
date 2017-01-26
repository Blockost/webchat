function SecuredUser(username, password){

    this.username = username;
    this.password = password;

    this.auth = (pw) => {
        return this.password === pw;
    };
    this.toJSON = () => {
        return {
            username: username,
            password: password
        };
    }
}

exports = SecuredUser;