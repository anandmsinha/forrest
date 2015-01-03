var bcrypt = require('bcrypt')

var post = function(req, res, next) {
    if (req.body && req.body.username && req.body.password) {
        var username = req.body.username.trim().toLowerCase(),
            password = req.body.password.trim()
        req.db.collection('users').findOne({username: username}, function(err, main_user) {
            if (!(err || !main_user)) { res.status(400).json({status: false, message: 'this username has already been registered.'}) }
            else {
                if (username.length < 9 && username.length > 2 && password.length > 5 && password.length < 17) {
                    bcrypt.genSalt(10, function(err, salt) {
                        if (err) { return next(new Error('Internal server error')) }
                        bcrypt.hash(password, salt, function(err, hash) {
                            if (err) { return next(new Error('Internal server error')) }
                            var User = require('../models/user')(req.db)
                            User.insert({ username: username, password: hash}, function(err, tmpUser) {
                                if (err || !tmpUser) { return next(new Error('User cannot be created at this time')) }
                                if (Array.isArray(tmpUser)) {
                                    tmpUser = tmpUser[0]
                                }
                                req.login(tmpUser, function(err) {
                                    if (err) { return next(new Error('User has bee created there was some error logging him in.')) }
                                    delete tmpUser.password
                                    res.json({message: 'User successfully created', status: true, user: tmpUser})
                                })
                            })
                        })
                    })
                } else {
                    return next(new Error('username length should be in range 3-8 and password in 6-16'))
                }
            }
        })
    } else {
        next(new Error('Bad request'))
    }
}

var checkUnique = function(req, res, next) {
    if (req.body && req.body.username) {
        var username = req.body.username.trim()
        if (username.length < 3 || username.length > 8) {
            return res.status(400).json({status: false, message: 'username should be in range 3 to 8'})
        } else {
            username = username.toLowerCase()
            req.db.collection('users').findOne({username: username}, function(err, user) {
                if (err) { next(err) }
                else if (user) { res.json({status: true, exists: true, message: 'User with username already exists'}) }
                else { res.json({status: true, exists: false, message: 'username available.'}) }
            })
        }
    } else {
        next(new Error('Bad request'))
    }
}

module.exports = {
    POST: post,
    checkUnique: checkUnique
}