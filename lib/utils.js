var urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
var tagRegex = /[#]+[ÄäÅåÖöA-Za-z0-9-_]+/;

var types = require('./mediatypes').media;

var Thumbbot = require('thumbbot');


exports.parseMessage = function (message, callback) {
  var msg = message.toString();
  var urls = [];
  var tags = [];

  var url;
  while (url = urlRegex.exec(msg)) {
    urls.push({url: url[0], type: "website"});
    msg = msg.replace(url[0], "");
  }

  var tag;
  while (tag = tagRegex.exec(msg)) {
    tags.push(tag[0].substring(1));
    msg = msg.replace(tag[0], "");
  }

  var data = {
    urls: urls,
    tags: tags
  };

  (function nextUrl(i) {
    var url = urls[i];
    if (url == null) {
      callback(null, data);
      return;
    }

    (function nextType(x) {
      var type = types[x];
      if (type == null) {
        return nextUrl(++i);
      }
      type.check(url.url, function (err, match) {
        if (match) {
          url.type = type.name;
          type.metadata(url.url, function (err, data) {
            if (err) {
              console.log("Error", url, type, err);
              nextUrl(++i);
              return;
            }
            url.metadata = data;
            nextUrl(++i);
          });
        } else {
          nextType(++x);
        }
      });
    })(0);
  })(0);
};

exports.makeWebPageThumbnail = function (url, target, callback) {
  console.log("Creating thumbnail", url, target);
  var bot = new Thumbbot(url, target);
  bot.set({width: 200, height: 150, method: 'resize'});
  bot.snap(callback);
};