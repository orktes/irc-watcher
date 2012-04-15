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
  if (data == null || data.id == undefined) {
    return null;
  }
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

function getMessagesByIds(ids, callback) {
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
}

function getMessagesFromSortedSetByScore(name, start, end, callback) {
  start = start.getTime();
  end = end.getTime();

  redis.zrangebyscore(name, start, end, function (err, ids) {
    if (err) {
      callback(err);
      return;
    }

    getMessagesByIds(ids, callback);
  });
}

function getMessagesFromSortedSetByRank(name, skip, limit, callback) {
  skip = Number(skip);
  limit = Number(limit);

  var start = -limit - skip;
  var end = -1 - skip;

  redis.zrange(name, start, end, function (err, ids) {
    if (err) {
      callback(err);
      return;
    }

    getMessagesByIds(ids, callback);
  });
}

function getCategoryData(name, callback) {
  redis.zrange(name + "s", 0, -1, "WITHSCORES", function (err, ids) {
    if (err) {
      callback(err);
      return;
    }

    var multi = redis.multi();

    for (var i = 0; i < ids.length; i += 2) {
      multi.get(name + ':last:' + ids[i]);
    }

    multi.exec(function (err, data) {
      data = data.map(function (lastUsed, i) {
        var item = {};
        item.name = ids[i * 2];
        item.count = Number(ids[(i * 2) + 1]);
        item.lastUsed = new Date(Number(lastUsed));

        return item;
      });

      data.reverse();

      callback(null, data);
    });

  });
}

function getRankForMessage(id, to, callback) {
  redis.zrank('messages_to:' + to, id, callback);
}

exports.searchMessages = function (query, callback) {
  search.query(query).end(function (err, ids) {
    if (err) {
      callback(err);
      return;
    }

    getMessagesByIds(ids, callback);
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

exports.getMessagesSurrounding = function (id, before, after, callback) {

  exports.getMessage(id, function (err, data) {
    if (err) {
      callback(err);
      return;
    }

    if (data == null) {
      return callback(new Error("No message found"));
    }

    getRankForMessage(id, data.to, function (err, rank) {
      if (err) {
        callback(err);
        return;
      }
      rank = Number(rank);
      var start = rank - before;
      var end = rank + after;

      if (start < 0) {
        start = 0;
      }


      redis.zrange('messages_to:' + data.to, start, end, function (err, ids) {
        if (err) {
          callback(err);
          return;
        }

        getMessagesByIds(ids, callback);
      });
    });

  });
};

exports.getMessagesByTag = function (tag, skip, end, callback) {
  getMessagesFromSortedSetByRank('messages_tag:' + tag, skip, end, callback);
};

exports.getMessagesByTo = function (to, skip, end, callback) {
  getMessagesFromSortedSetByRank('messages_to:' + to, skip, end, callback);
};

exports.getMessagesByType = function (type, skip, end, callback) {
  getMessagesFromSortedSetByRank('messages_type:' + type, skip, end, callback);
};

exports.getMessages = function (skip, end, callback) {
  getMessagesFromSortedSetByRank('messages', skip, end, callback);
};

exports.getSpecialMessages = function (skip, end, callback) {
  getMessagesFromSortedSetByRank('messages_s', skip, end, callback);
};

exports.getMessagesByTagByTime = function (tag, start, end, callback) {
  getMessagesFromSortedSetByScore('messages_tag:' + tag, start, end, callback);
};

exports.getMessagesByToByTime = function (to, start, end, callback) {
  getMessagesFromSortedSetByScore('messages_to:' + to, start, end, callback);
};

exports.getMessagesByTypeByTime = function (type, start, end, callback) {
  getMessagesFromSortedSetByScore('messages_type:' + type, start, end, callback);
};

exports.getMessagesByTime = function (start, end, callback) {
  getMessagesFromSortedSetByScore('messages', start, end, callback);
};

exports.getSpecialMessagesByTime = function (start, end, callback) {
  getMessagesFromSortedSetByScore('messages_s', start, end, callback);
};

exports.getTypes = function (callback) {
  getCategoryData('type', callback);
};

exports.getTags = function (callback) {
  getCategoryData('tag', callback);
};

exports.getTos = function (callback) {
  getCategoryData('to', callback);
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

      var multi = redis.multi();

      var hash = 'message:' + id;

      multi.hmset(hash, serializeMessage(data));

      multi.zadd('messages', time, id);

      if (data.s) {
        multi.zadd('messages_s', time, id);
      }

      multi.zincrby('tos', 1, data.to);
      multi.set('to:last:' + data.to, time);
      multi.zadd('messages_to:' + data.to, time, id);

      data.tags.forEach(function (tag) {
        multi.set('tag:last:' + tag, time);
        multi.zincrby('tags', 1, tag);
        multi.zadd('messages_tag:' + tag, time, id);
      });

      data.urls.forEach(function (url) {
        multi.set('type:last:' + url.type, time);
        multi.zincrby('types', 1, url.type);
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


          (function nextUrl(i) {
            var url = data.urls[i];
            if (url == null) {
              eventEmitter.trigger('new_message', data);
              callback(null, true);
              return;
            }

            if (url.type != 'website') {
              nextUrl(++i);
              return;
            }

            utils.makeWebPageThumbnail(url.url, __dirname + "/../../public/img/thumbnails/" + id + ".png", function (err) {
              if (err) {
                eventEmitter.trigger('new_message', data);
                callback(err);
                return;
              }
              nextUrl(++i);
            });
            
          })(0);
        });
      });

    });

  });
};