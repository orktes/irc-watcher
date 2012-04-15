var request = require('request');

function getIdFromUrl(url) {
  var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
	var match = url.match(regExp);
	if (match&&match[7].length==11){
	    return match[7];
	}else{
	    return null;
	}

}

function getVideoDataById(id, callback) {
  request('http://gdata.youtube.com/feeds/api/videos/' + id + '?alt=json&v=2', function (err, res, body) {
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
    metadata.title = data.entry.title['$t'];
    metadata.author = data.entry.author[0].name['$t'];
    metadata.description = data.entry['media$group']['media$description']['$t'];
    metadata.id = id;
    metadata.published = new Date(data.entry.published['$t']);
    metadata.updated = new Date(data.entry.updated['$t']);
    metadata.content = data.entry.content;
    metadata.thumbnail = "http://i.ytimg.com/vi/" + id + "/hqdefault.jpg"
    callback(null, metadata);

  });
}


var type = exports = module.exports = {};
type.name = "youtube";
type.check = function (url, callback) {
  return callback(null, (getIdFromUrl(url) != null));
};
type.metadata = function (url, callback) {
  getVideoDataById(getIdFromUrl(url), callback);
};