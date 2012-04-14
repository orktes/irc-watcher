var utils = require('../utils');
var redis = require('../redis');
var RedisEventEmitter = require('../rediseventemitter').EventEmitter;
var reds = require('reds');
var search = reds.createSearch('messages');
var settings = require('../settings').messages;

var eventEmitter = new RedisEventEmitter("messages");

function serializeMessage(data) {
  var serialized = {};
  serialized.id = data.id;
  serialized.to = data.to;
  serialized.from = data.from;
  if (typeof data.ts === 'date') {
    serialized.ts = data.ts.getTime();
  } else {
    serialized.ts = data.ts;
  }
  serialized.msg = data.msg;
  serialized.urls = JSON.stringify(data.urls);
  serialized.tags = JSON.stringify(data.tags);
  serialized.s = data.s ? 1 : 0;
  return serialized;
}

function deSerializeMessage(data) {
  var deSerialized = {};
  deSerialized.id = data.id;
  deSerialized.to = data.to;
  deSerialized.from = data.from;
  deSerialized.ts = new Date(Number(data.ts));
  deSerialized.msg = data.msg;
  deSerialized.urls = JSON.parse(data.urls);
  deSerialized.tags = JSON.parse(data.tags);
  deSerialized.s = (data.s == "1");
  return deSerialized;
}

function getMessagesFromSortedSet(name, skip, limit, callback) {
  skip = Number(skip);
  limit = Number(limit);

  var start = -limit - skip;
  var end = -1 - skip;

  redis.zrange(name, start, end, function (err, ids) {
    if (err) {
      callback(err);
      return;
    }

    exports.getMessagesByIds(ids, callback);
  });
}

exports.getMessagesByIds = function (ids, callback) {
  var multi = redis.multi();

  ids.forEach(function (id) {
    multi.hgetall('message:' + id);
  });

  multi.exec(function (err, messages) {
    if (err) {
      callback(err);
      return;
    }

    messages = messages.map(function (msg) {
      return deSerializeMessage(msg);
    });

    messages.reverse();

    callback(null, messages);
  });
};

exports.getMessage = function (id, callback) {
  redis.hgetall('message:' + id, function (err, msg) {
    if (err) {
      callback(err);
      return;
    }

    callback(null, deSerializeMessage(msg));
  });
};

exports.getMessagesByTag = function (tag, skip, end, callback) {
  getMessagesFromSortedSet('messages_tag:' + tag, skip, end, callback);
};

exports.getMessagesByTo = function (to, skip, end, callback) {
  getMessagesFromSortedSet('messages_to:' + to, skip, end, callback);
};

exports.getMessagesByType = function (type, skip, end, callback) {
  getMessagesFromSortedSet('messages_type:' + type, skip, end, callback);
};

exports.getMessages = function (skip, end, callback) {
  getMessagesFromSortedSet('messages', skip, end, callback);
};

exports.getSpecialMessages = function (skip, end, callback) {
  getMessagesFromSortedSet('messages_s', skip, end, callback);
};

exports.saveMessage = function (message, callback) {
  utils.parseMessage(message.msg, function (err, data) {
    if (err) {
      callback(err);
      return;
    }
    data.from = message.from;
    data.to = message.to;
    data.msg = message.msg;

    if (data.urls.length == 0 && data.tags.length == 0 && settings.recordOnlySpecialMessages) {
      callback(null, false);
      return;
    }

    data.s = (data.urls.length != 0 || data.tags.length != 0);

    redis.incr('messageids:' + data.to, function (err, id) {
      if (err) {
        callback(err);
        return;
      }

      var time = (new Date()).getTime();

      data.id = id;
      data.ts = time;

      eventEmitter.trigger('new_message', data);

      var multi = redis.multi();

      var hash = 'message:' + id;

      multi.hmset(hash, serializeMessage(data));

      multi.zadd('messages', time, id);

      if (data.s) {
        multi.zadd('messages_s', time, id);
      }
      
      multi.zadd('tos', time, data.to);
      multi.zadd('messages_to:' + data.to, time, id);

      data.tags.forEach(function (tag) {
        multi.zadd('tags', time, tag);
        multi.zadd('messages_tag:' + tag, time, id);
      });

      data.urls.forEach(function (url) {
        multi.zadd('types', time, url.type);
        multi.zadd('messages_type:' + url.type, time, id);
      });

      multi.exec(function (err) {
        if (err) {
          callback(err);
          return;
        }

        search.index(data.from + " " + data.to + " " + data.msg, id, function () {
          if (err) {
            callback(err);
            return;
          }

          callback(null, true);
        });
      });

    });

  });
};