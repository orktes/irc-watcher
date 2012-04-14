var settings = exports = module.exports = {};

settings.irc = {};
settings.irc.host = "localhost";
settings.irc.port = 6667;
settings.irc.nick = "watcher";
settings.irc.channels = ["#test"];

settings.redis = {};
settings.redis.host = "localhost";
settings.redis.port = 6379;
settings.redis.db = 1;

settings.http = {};
settings.http.port = 3000;

settings.messages = {};
settings.messages.recordOnlySpecialMessages = false;
