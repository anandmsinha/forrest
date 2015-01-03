var validator = require('validator')

var post = function(req, res, next, passport) {
    var username = req.body.username,
        password = req.body.password,
        redirect_uri = req.body.redirect_uri,
        client_id = req.body.client_id,
        response_type = req.body.response_type

    if (client_id && redirect_uri && response_type && client_id == 'chrome' && validator.isURL(redirect_uri)) {
        console.log('Basic details are correct')
        if (username && password) {
            passport.authenticate('local', function(err, user, info) {
                var redirect_url = '/oauth?client_id=' + client_id + '&response_type=' + response_type + '&redirect_uri=' + redirect_uri
                if (err || !user) {
                    console.log('password dont match')
                    return res.redirect(redirect_url)
                }
                req.logIn(user, function(err) {
                    console.log('passwords match now trying to log in.')
                    if (err) { return res.redirect(redirect_url) }
                    return res.redirect(redirect_uri + '#authToken=' + user._id)
                })
            })(req, res, next)
        }
    } else {
        res.status(400).send('Invalid request')
    }
}

var get = function(req, res) {
    var client_id = req.param('client_id'),
        redirect_uri = req.param('redirect_uri')
        response_type = req.param('response_type')

    if (client_id && redirect_uri && response_type) {
        if (req.isAuthenticated()) { return res.redirect(redirect_uri + '#authToken=' + req.user._id) }
        else { res.render('login', { form_url: '/oauth', redirect_uri: redirect_uri, client_id: client_id, response_type: response_type }) }
    } else {
        res.status(400).send('Invalid request')
    }
}

module.exports = {
    GET: get,
    POST: post
}