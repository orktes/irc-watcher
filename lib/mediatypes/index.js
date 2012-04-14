var fs = require('fs');
var files = fs.readdirSync(__dirname);
exports.media = [];

files.forEach(function (file) {
  if (file !== 'index.js' && file !== 'test') {
    var name = file.split('.')[0];
    exports.media.push(require('./'+name));
  }
});
