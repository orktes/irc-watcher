var request = require('request');

function getIdFromUrl(url) {
  var regExp = /^http:\/\/(www\.)?vimeo\.com\/(clip\:)?(\d+).*$/;
	var match = url.match(regExp);
	if (match&&match[3]){
	    return match[3];
	}else{
	    return null;
	}

}

function getVideoDataById(id, callback) {
  request('http://vimeo.com/api/oembed.json?url=http%3A//vimeo.com/' + id, function (err, res, body) {
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
      type: 'iframe',
      src: data.html

    };
    metadata.thumbnail = data.thumbnail_url;
    metadata.author = data.author_name;

    callback(null, metadata);

  });
}


var type = exports = module.exports = {};
type.name = "vimeo";
type.check = function (url, callback) {
  return callback(null, (getIdFromUrl(url) != null));
};
type.metadata = function (url, callback) {
  getVideoDataById(getIdFromUrl(url), callback);
};