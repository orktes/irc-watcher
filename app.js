var express = require('express');
var irc = require('./lib/irc');
var repositories = require('./lib/repositories');
var settings = require('./lib/settings');

var app = express.createServer();

app.use(express.static(__dirname + '/public'));

app.get('/messages/', function(req, res, next){
  var skip = req.query.skip || 0;
  var limit =  req.query.limit || 20;

  var search = req.query.search;

  if (search == undefined) {
    repositories.messages.getMessages(skip, limit, function (err, data) {
      if (err) {
        return next(err);
      }

      res.send({data: {messages: data, skip: skip, limit: limit}, status: 'ok'});
    });
  } else {
    
  }
});

app.get('/messages/special', function(req, res, next){
  var skip = req.query.skip || 0;
  var limit =  req.query.limit || 20;

  var search = req.query.search;

  if (search == undefined) {
    repositories.messages.getSpecialMessages(skip, limit, function (err, data) {
      if (err) {
        return next(err);
      }

      res.send({data: {messages: data, skip: skip, limit: limit}, status: 'ok'});
    });
  } else {

  }
});

app.get('/messages/tag/:tag', function(req, res, next){
  var skip = req.query.skip || 0;
  var limit =  req.query.limit || 20;
  var tag = req.params.tag;

  repositories.messages.getMessagesByTag(tag, skip, limit, function (err, data) {
    if (err) {
      return next(err);
    }

    res.send({data: {messages: data, skip: skip, limit: limit}, status: 'ok'});
  });
});

app.get('/messages/to/:to', function(req, res, next){
  var skip = req.query.skip || 0;
  var limit =  req.query.limit || 20;
  var to = req.params.to;

  repositories.messages.getMessagesByTo(to, skip, limit, function (err, data) {
    if (err) {
      return next(err);
    }

    res.send({data:{messages: data, skip: skip, limit: limit}, status: 'ok'});
  });
});

app.get('/messages/type/:type', function(req, res, next){
  var skip = req.query.skip || 0;
  var limit =  req.query.limit || 20;
  var type = req.params.type;

  repositories.messages.getMessagesByType(type, skip, limit, function (err, data) {
    if (err) {
      return next(err);
    }

    res.send({data: {messages: data, skip: skip, limit: limit}, status: 'ok'});
  });
});

app.listen(settings.http.port);
irc.client.init();