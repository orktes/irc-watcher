var request = require('request');
var parse = require('url').parse;

function getIdFromUrl(url) {
  var urlData = parse(url);
  if (urlData.host != "gist.github.com") {
    return null;
  }

  return urlData.path.split("/")[1];
}

function getGistDataById(id, callback) {
  request('https://gist.github.com/' + id + '.json', function (err, res, body) {
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
      src: data.div

    };
    metadata.author = data.owner;
    callback(null, metadata);

  });
}


var type = exports = module.exports = {};
type.name = "gist";
type.check = function (url, callback) {
  return callback(null, (getIdFromUrl(url) != null));
};
type.metadata = function (url, callback) {
  getGistDataById(getIdFromUrl(url), callback);
};