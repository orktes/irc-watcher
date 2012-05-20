var request = require('request');
var parse = require('url').parse;

function checkUrl(url) {
  var urlData = parse(url);
  if (urlData.host.replace("www.", "") != "jsfiddle.net") {
    return false;
  }

  return true;
}

function getFiddle(url, callback) {

  if (!(/\/$/).test(url)) {
    url += "/";
  }

  var metadata = {};
  metadata.title = "";
  metadata.id = "";
  metadata.description = "";
  metadata.content = {
    type: 'html',
    src: ('<iframe style="width: 100%; height: 300px" src="' + url + 'embedded/"></iframe>')

  };
  callback(null, metadata);
}


var type = exports = module.exports = {};
type.name = "jsfiddle";
type.check = function (url, callback) {
  return callback(null, checkUrl(url));
};
type.metadata = function (url, callback) {
  getFiddle(url, callback);
};