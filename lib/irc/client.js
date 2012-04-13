var irc = require('irc');
var utils = require('./utils');
var repo = require('../repositories/irc');
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
    console.log(to, "ei ole sallittu");
    return;
  }

  var data = utils.parseMessage(from, to, msg);
  console.log(data);
  repo.saveMessage(data);
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