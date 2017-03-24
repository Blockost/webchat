let router = require('express').Router();
let crypto = require('crypto');
let db = require('../db');
let Logger = require('../Logger');

// Login page
router.get('/', requireNoAuth, (req, res) => {
    res.sendFile('index.xhtml', {root: __dirname + '/../static/html/'});
});

router.post('/login', (req, res) => {


    let username = req.body.username || '';
    let password = req.body.password || '';

    if (username.length < 4 || password < 4) {
        return res.send({message: 'Username or password too short'});
    }

    db.getUser(username, (err, user) => {

        if (err) Logger.getInstance().log(err, 'ERROR');
        else {

            // User found: user must not be already authenticated
            // AND passwords must match
            if (user) {
                const hash = crypto.createHash('sha256');
                const hashed_pwd = hash.update(password).digest('base64');
                if (hashed_pwd === user.password) {
                    req.session.user = username;
                    return res.send({
                        message: 'User authenticated',
                        redirectTo: '/chat'
                    });
                }
                return res.send({message: 'Passwords mismatch'});
            }

            // User not found: let's create it!
            const hash = crypto.createHash('sha256');
            const hashed_pwd = hash.update(password).digest('base64');
            db.insertUser(username, hashed_pwd, (err) => {
                if (err) Logger.getInstance().log(err, 'ERROR');
                else {
                    req.session.user = username;
                    return res.send({
                        message: 'User created',
                        redirectTo: '/chat'
                    });
                }
            });
        }

    });
});


// Chat page - Need to be authenticated to access it
router.get('/chat', requireAuth, (req, res) => {
    res.sendFile('/chat.xhtml', {root: __dirname + '/../static/html/'});
});

router.get('/about', (req, res) => {
    res.sendFile('/about.xhtml', {root: __dirname + '/../static/html/'});
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

/**
 * Check if user
 * @param req The request user sends
 * @param res The responds we'll send to the user
 * @param next The next delegate routing handler
 */
function requireNoAuth(req, res, next) {
    if (req.session && req.session.user) {
        return res.redirect('/chat');
    }
    next();
}

/**
 * Check if user is authenticated
 * @param req The request user sends
 * @param res The responds we'll send to the user
 * @param next The next delegate routing handler
 */
function requireAuth(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.redirect('/');
    }
    // If session cookie exists, continue...
    next();
}

module.exports = router;