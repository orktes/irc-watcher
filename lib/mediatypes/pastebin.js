var request = require('request');
var parse = require('url').parse;

function getIdFromUrl(url) {
  var urlData = parse(url);
  if (urlData.host.replace("www.", "") != "pastebin.com") {
    return null;
  }

  return urlData.path.split("/")[1];
}

function getPasteBinDataById(id, callback) {

    var metadata = {};
    metadata.title = "";
    metadata.id = id;
    metadata.description = "";
    metadata.content = {
      type: 'html',
      src: '<iframe src="http://pastebin.com/embed_iframe.php?i=' + id + '" style="border:none;width:100%"></iframe>'

    };
    callback(null, metadata);
}


var type = exports = module.exports = {};
type.name = "pastebin";
type.check = function (url, callback) {
  return callback(null, (getIdFromUrl(url) != null));
};
type.metadata = function (url, callback) {
  getPasteBinDataById(getIdFromUrl(url), callback);
};