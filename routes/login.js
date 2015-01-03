var login_post = function(req, res, next, passport) {
    var responseBody = {status: false, message: "Authentication failed"}
    if (req.body.username && req.body.password) {
        req.body.username = req.body.username.toLowerCase()
        passport.authenticate('local', function(err, user, info) {
            if (err || !user) { return res.json(responseBody) }
            req.logIn(user, function(err) {
                if (err) { return res.json(responseBody) }
                var tmpUser = user
                tmpUser.is_login = true
                tmpUser.id = user._id
                tmpUser.name = user.username
                delete tmpUser.password
                delete tmpUser._id
                responseBody.status = true
                delete responseBody.message
                responseBody.user = tmpUser
                return res.json(responseBody)
            })
        })(req, res, next)
    } else {
        console.log('No input given')
        console.log(req.body)
        res.status(400).json(responseBody)
    }
}

module.exports = {
    POST: login_post
}