var request = require('request');
var parse = require('url').parse;

function getIdFromUrl(url) {
  var urlData = parse(url);
  if (urlData.host.replace("www.", "") != "collegehumor.com") {
    return null;
  }

  var pathParts = urlData.path.split("/");
  pathParts.shift();

  var type = pathParts[0];
  var id = pathParts[1];
  var title = pathParts[2];

  if (type && type == "video" && id) {
    return id;
  }
}


function getVideoDataById(id, callback) {
  request('http://www.collegehumor.com/oembed.json?url=http%3A//collegehumor.com/video/' + id, function (err, res, body) {
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
    metadata.description = data.description;
    metadata.content = {
      type: 'html',
      src: data.html

    };
    metadata.thumbnail = data.thumbnail_url;
    metadata.author = data.author_name;

    callback(null, metadata);

  });
}


var type = exports = module.exports = {};
type.name = "collegehumor";
type.check = function (url, callback) {
  return callback(null, (getIdFromUrl(url) != null));
};
type.metadata = function (url, callback) {
  getVideoDataById(getIdFromUrl(url), callback);
};