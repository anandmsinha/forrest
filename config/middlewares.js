var session = require('express-session'),
    cookieParser = require('cookie-parser')

var forrestMiddlewares = function(app) {

    app.use(session({
        secret: 'dabsdbjkasdkasdbnkasn',
        resave: false,
        saveUninitialized: true
    }))

    app.use(cookieParser())
}

module.exports = {
    middleware: forrestMiddlewares
}