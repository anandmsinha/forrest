var passport = require('passport'),
    BearerStratergy = require('passport-http-bearer').Strategy,
    LocalStragtergy = require('passport-local'),
    bcrypt = require('bcrypt')

module.exports = function(db) {
    var User = require('../models/user')(db)

    passport.use(new BearerStratergy(function(token, done) {
        User.getById(token, function(err, user) {
            if (err) { return done(err) }
            if (!user) { return done(null, false) }

            return done(null, user)
        })
    }))

    passport.use(new LocalStragtergy({ usernameField: 'username', passwordField: 'password' }, function(username, password, done) {
        User.getOne({username: username}, function(err, user) {
            if (err) { return done(err) }
            if (!user) { return done(null, false) }

            bcrypt.compare(password, user.password, function(err, isMatch) {
                if (err || !isMatch) { return done(null, false) }
                return done(null, user)
            })
        })
    }))

    passport.serializeUser(function(user, done) {
        done(null, user)
    })

    passport.deserializeUser(function(obj, done) {
        done(null, obj)
    })

    return passport
}