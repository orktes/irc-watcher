var express = require('express');
var irc = require('./lib/irc');
var sio = require('socket.io');
var repositories = require('./lib/repositories');
var settings = require('./lib/settings');
var RedisEventEmitter = require('./lib/rediseventemitter').EventEmitter;
var eventEmitter = new RedisEventEmitter("messages");

var app = express.createServer();

app.use(express.static(__dirname + '/public'));

app.get('/messages/', function(req, res, next) {
  var skip = req.query.skip || 0;
  var limit = req.query.limit || 20;

  var search = req.query.s;

  if (search == undefined) {
    repositories.messages.getMessages(skip, limit, function (err, data) {
      if (err) {
        return next(err);
      }

      res.send({data: {messages: data, skip: skip, limit: limit}, status: 'ok'});
    });
  } else {
    repositories.messages.searchMessages(search, function (err, data) {
      if (err) {
        return next(err);
      }

      res.send({data: {messages: data, search: search}, status: 'ok'});
    });
  }
});

app.get('/messages/special', function(req, res, next) {
  var skip = req.query.skip || 0;
  var limit = req.query.limit || 20;

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

app.get('/messages/tag/:tag', function(req, res, next) {
  var skip = req.query.skip || 0;
  var limit = req.query.limit || 20;
  var tag = req.params.tag;

  repositories.messages.getMessagesByTag(tag, skip, limit, function (err, data) {
    if (err) {
      return next(err);
    }

    res.send({data: {messages: data, skip: skip, limit: limit}, status: 'ok'});
  });
});

app.get('/messages/to/:to', function(req, res, next) {
  var skip = req.query.skip || 0;
  var limit = req.query.limit || 20;
  var to = req.params.to;

  repositories.messages.getMessagesByTo(to, skip, limit, function (err, data) {
    if (err) {
      return next(err);
    }

    res.send({data:{messages: data, skip: skip, limit: limit}, status: 'ok'});
  });
});

app.get('/messages/type/:type', function(req, res, next) {
  var skip = req.query.skip || 0;
  var limit = req.query.limit || 20;
  var type = req.params.type;

  repositories.messages.getMessagesByType(type, skip, limit, function (err, data) {
    if (err) {
      return next(err);
    }

    res.send({data: {messages: data, skip: skip, limit: limit}, status: 'ok'});
  });
});

app.get('/messages/:id', function(req, res, next) {
  var id = req.params.id;
  var before = req.query.before;
  var after = req.query.after;

  repositories.messages.getMessage(id, function (err, data) {
    if (err) {
      return next(err);
    }

    if (data == null) {
      return next(new Error("No message found"));
    }

    res.send({data: data, status: 'ok'});

  });
});

app.get('/messages/:id/surrounding', function (req, res, next) {
  var id = req.params.id;
  var before = req.query.before;
  var after = req.query.after;

  before = Number(before || 0);
  after = Number(after || 0);

  if (before < 0 || after < 0) {
    return next(new Error("Values should be positive"));
  }

  repositories.messages.getMessagesSurrounding(id, before, after, function (err, messages) {
    if (err) {
      next(err);
      return;
    }

    var after = [];
    var before = [];

    messages.forEach(function (msg) {
      if (msg.id < id) {
        before.push(msg);
      } else if (msg.id > id) {
        after.push(msg);
      }
    });

    res.send({data: {id: id, after: after, before: before}, status: 'ok'});
  });
});

app.get('/tags', function(req, res, next) {
  repositories.messages.getTags(function (err, data) {
    if (err) {
      return next(err);
    }

    res.send({data: {tags: data}, status: 'ok'});
  });
});

app.get('/tos', function(req, res, next) {
  repositories.messages.getTos(function (err, data) {
    if (err) {
      return next(err);
    }

    res.send({data: {tos: data}, status: 'ok'});
  });
});

app.get('/types', function(req, res, next) {
  repositories.messages.getTypes(function (err, data) {
    if (err) {
      return next(err);
    }

    res.send({data: {types: data}, status: 'ok'});
  });
});

app.get('/ui/sidenav', function (req, res, next) {
  var calls = 0;
  var data = {};
  function createCallback(name) {
    return function (err, result) {
      calls++;
      data[name] = result;

      if (calls == 3) {
        res.send({data: data, status: 'ok'});
      }
    }
  }

  repositories.messages.getTypes(createCallback('types'));
  repositories.messages.getTos(createCallback('tos'));
  repositories.messages.getTags(createCallback('tags'));
});

app.listen(settings.http.port);
irc.client.init();

var io = sio.listen(app);
io.sockets.on('connection', function (socket) {
  console.log("Socket connected");
});


eventEmitter.on('new_message', function (message) {
  io.sockets.emit('new_message', message);
});
