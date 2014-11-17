var express = require('express'),
    mongoskin = require('mongoskin');

var app = express();

var db = mongoskin.db('mongodb://localhost:27017/nodetest2', {
    native_parser:true
});

app.use(function(request, response, next) {
    request.db = db;
    next();
});

app.get('/', function(request, response) {
    response.json({'Hello': 'World'});
});

var server = app.listen(3000, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Server is running at http://%s:%s', host, port);
});