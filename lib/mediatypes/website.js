var http = require('http');
var https = require('https');
var parse = require('url').parse;
var $ = require('jquery');

var allowedContentTypes = ["text/html"];

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

function getContent(url, callback) {
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
        method: 'GET' },
      function(res) {
        var body = "";
        res.on('data', function (chunk) {
          body += chunk.toString();
        });
        res.on('end', function () {
          if (callback) {
            callback(null, body);
            callback = null;
          }
        });
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

function getData(content) {
  var ogData = {};
  var data = $(content);
  ogData.title = data.find('title').html();
  data.find('meta').each(function (indx, item) {
    item = $(item);
    var property = item.attr('property');
    var name = item.attr('name');
    if (property.indexOf('og:') === 0) {
      ogData[property.split(":")[1]] = item.attr('content');
    } else if (name == "description" && !ogData.description) {
      ogData.description = item.attr('content');
    }
  });

  return ogData;
}

var type = exports = module.exports = {};
type.name = "website";
type.check = function (url, callback) {

  getContentType(url, function (err, type) {
    if (err) {
      callback(err);
      return;
    }

    if (type == null || allowedContentTypes.indexOf(type.split(";")[0]) == -1) {
      callback(null, false);
      return;
    }

    getContent(url, function (err, content) {
      if (err) {
        callback(err);
        return;
      }

      var data = getData(content);

      if (Object.keys(data).length === 0) {
        callback(null, false);
        return;
      }

      callback(null, true, data);
    });
  });
};
