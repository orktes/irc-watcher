var irc = require('irc');
var utils = require('../utils');
var repo = require('../repositories/messages');
var settings = require('../settings').irc;

var client = null;

function connect() {
  console.log("Connected");
}

function join(channel, who) {
  console.log("join", arguments);
}

function message(from, to, msg) {
  if (settings.channels.indexOf(to) == -1) {
    return;
  }

  repo.saveMessage({from: from, to: to, msg: msg}, function (err) {
        if (err) {
          console.log("Error saving message: " + err.toString());
        }
      });
}

function error(err) {
  console.log("error", err);
}

exports.init = function () {
  console.log("IRC client init", settings);
  if (client != null) {
    return client;
  }

  client = new irc.Client(settings.host, settings.nick, { channels : settings.channels });
  client.on('connect', connect);
  client.on('error', error);
  client.on('message', message);
  client.on('join', join);


  return client;
};