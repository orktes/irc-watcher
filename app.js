var express = require('express');
var irc = require('./lib/irc');

var app = express.createServer();

app.get('/', function(req, res){
    res.send('Hello World');
});

//app.listen(settings.http.port);
irc.client.init();