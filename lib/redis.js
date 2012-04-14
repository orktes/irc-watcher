var settings = require('./settings').redis;
var redis = require('redis');
r = redis.createClient(settings.port, settings.host);
r.select(settings.db, function (err) {
  if (err) {
    console.log(err);
    console.log(err.stack);
  }
});

var reds = require('reds');
reds.createClient = function () {
  return r;
};

exports = module.exports = r;