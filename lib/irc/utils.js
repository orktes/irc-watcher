var urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
var tagRegex = /[#]+[ÄäÅåÖöA-Za-z0-9-_]+/;

exports.parseMessage = function (sender, channel, message) {
  var msg = message.toString();
  var urls = [];
  var tags = [];
  
  var url;
  while(url = urlRegex.exec(msg)) {
    urls.push(url[0]);
    msg = msg.replace(url[0], "");
  }

  var tag;
  while(tag = tagRegex.exec(msg)) {
    tags.push(tag[0].substring(1));
    msg = msg.replace(tag[0], "");
  }

  return {
    sender: sender,
    channel: channel,
    message: message,
    urls: urls,
    tags: tags
  };

};