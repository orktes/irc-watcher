var request = require('request');
var parse = require('url').parse;

function getIdFromUrl(url) {
  var urlData = parse(url);
  var hostParts = urlData.host.split(".");
  if (hostParts[hostParts.length - 2] != "twitter") {
    return null;
  }

  if (!urlData.hash) {
    return null;
  }


  var hashParts = urlData.hash.split("/");
  hashParts.shift();

  var user = hashParts[0];
  var type = hashParts[1];
  var id = hashParts[2];

  if (user && type && type == "status" && id) {
    return id;
  }
}

function getTweetDataById(id, callback) {
  request('https://api.twitter.com/1/statuses/oembed.json?id=' + id, function (err, res, body) {
    if (err) {
      callback(err);
      return;
    }

    var data;

    try {
      data = JSON.parse(body);
    } catch (e) {
      callback(e);
      return;
    }


    var metadata = {};
    metadata.title = data.title;
    metadata.id = id;
    metadata.content = {
      type: 'html',
      src: data.html

    };
    metadata.author = data.author_name;
    metadata.authorUrl = data.author_url;
    callback(null, metadata);

  });
}


var type = exports = module.exports = {};
type.name = "tweet";
type.check = function (url, callback) {
  return callback(null, (getIdFromUrl(url) != null));
};
type.metadata = function (url, callback) {
  getTweetDataById(getIdFromUrl(url), callback);
};