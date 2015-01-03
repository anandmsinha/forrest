var os = require('os')
    express = require('express'),
    mongoskin = require('mongoskin'),
    path = require('path'),
    bodyParser = require('body-parser'),
    routeOAuth = require('./routes/oauth'),
    Register = require('./routes/register'),
    Quests = require('./routes/quests'),
    Links = require('./routes/links'),
    Root = require('./routes/root'),
    Login = require('./routes/login'),
    Logout = require('./routes/logout')

var env = 'production'
var port_number = process.env.PORT || 3000;
database_url = 'mongodb://forrest:admin@ds029821.mongolab.com:29821/forresterkikkola'

if (os.hostname() == "anand-Ideapad-Z560") {
    env = 'developement'
    database_url = 'mongodb://localhost:27017/nodetest2'
}

var app = express()
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')
app.use(express.static(path.join(__dirname, 'public')))

var db = mongoskin.db(database_url, {
    native_parser:true,
    poolSize: 5,
    auto_reconnect: true
})

db.open(function(err, db) {
    if (err) { console.log('Error opening the db connection.') }
    else {
        console.log('Db connection successfully opened.')
        console.log('Ensuring proper indexes')
        db.collection('quests').ensureIndex({user_id: 1}, {background: true, sparse: true}, function(err, indexname) {
            if (err || !indexname) { console.log('Error creating index on quests') }
            else { console.log('Index created on quests collection with name ' + indexname) }
        })
    }
})


app.use(function(req, res, next) {
    req.db = db
    next()
})

var middleware = require('./config/middlewares')
middleware.middleware(app)

var passport = require('./config/passport')(db)
app.use(passport.initialize())
app.use(passport.session({
    secret: '1234567890QWERT',
    cookie: {maxAge: 24*60*60*1000}
}))
var passport_bear = passport.authenticate('bearer', { session: false })

var parsers = {
    url: bodyParser.urlencoded({extended: false}),
    json: bodyParser.json()
}

var isAuthenticated = function(req, res, next) {
    if (req.isAuthenticated())
        return next();

    next(new Error('Auth failed'))
}

app.get('/', Root.GET)
app.post('/login', parsers.json, function(req, res, next) { Login.POST(req, res, next, passport) })
app.post('/logout', Logout.POST)
app.get('/oauth', routeOAuth.GET)
app.post('/oauth', parsers.url, function(req, res, next) { routeOAuth.POST(req, res, next, passport) })
app.post('/register', parsers.json, Register.POST)
app.post('/checkuser', parsers.json, Register.checkUnique)
app.post('/backend/quests', parsers.url, isAuthenticated, parsers.json, Quests.POST)
app.get('/backend/quests', parsers.url, isAuthenticated, Quests.GET)
app.post('/backend/quests/fetch', parsers.json, isAuthenticated, Quests.GETQuest)
app.post('/backend/quests/add', parsers.json, isAuthenticated, Links.POST)
//app.get('/api/quests', passport_bear, Quests.GET)
//app.post('/api/quests', passport_bear, parsers.json, Quests.POST)
//app.get('/api/links', passport_bear, Links.GET)
//app.post('/api/links', passport_bear, parsers.json, Links.POST)

app.use(function(err, req, res, next) {
    console.log(err);
    if (req.xhr || req.method === 'POST') {
        res.status(500).json({error: 'Something blew up!.', status: false})
    } else {
        next(err)
    }
})

var server = app.listen(port_number, function() {
    console.log('Sever is running at http://%s:%s', server.address().address, server.address().port)
})

module.exports = app