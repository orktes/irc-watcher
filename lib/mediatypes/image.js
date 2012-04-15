var http = require('http');
var https = require('https');
var parse = require('url').parse;


function getContentType(url, callback) {
  var parts = parse(url);

  var type;

  if (parts.protocol == "http:") {
    type = http;
  } else {
    type = https;
  }

  var req = type.request({
        host: parts.host,
        port: parts.port,
        path: parts.path,
        method: 'HEAD' },
      function(res) {
        if (callback) {
          callback(null, res.headers['content-type']);
          callback = null;
        }
      }
  );

  req.on('error', function (err) {
    if (callback) {
      callback(err);
      callback = null;
    }
  });

  req.end();
}

var type = exports = module.exports = {};
type.name = "image";
type.check = function (url, callback) {
  getContentType(url, function (err, type) {
    if (err) {
      callback(err, false);
      return;
    }

    callback(null, (type.indexOf("image") > -1));
  });
};
type.metadata = function (url, callback) {
  callback(null, {});
};