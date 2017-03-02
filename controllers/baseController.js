let router = require('express').Router();
let db = require('../db');

// Login page
router.get('/', (req, res) => {
    res.sendFile('index.html', {root: './'});
});

router.post('/login', (req, res) => {

    let username = req.body.username;
    let password = req.body.password;

    db.get().collection('users')
        .findOne({username: username}, (err, user) => {

            if (err) throw err;

            // User found: user must not be already authenticated
            // AND passwords must match
            if (user) {

                if (/*!isUserConnected(username) && */user.password === password) {
                    req.session.user = username;
                    return res.send({redirectTo: '/chat'});
                }
                return res.send();
            }

            // User not found: let's create it!
            db.get().collection('users').insertOne({
                username: username,
                password: password
            }, (err) => {

                if (err) throw err;
                req.session.user = username;
                return res.send({redirectTo: '/chat'});
                
            });


        });
});


// Chat page
router.get('/chat', requireAuth, (req, res) => {
    res.sendFile('/chat.html', {root: './'});
});

router.get('/about', (req, res) => {
    res.sendFile('/about.html', {root: './'});
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

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