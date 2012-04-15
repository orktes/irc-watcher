(function (window, undefined) {
  var ui = {
    initSidebar: function (item) {
      $.getJSON('/ui/sidenav', function (result) {
        if (result.status == "ok") {
          var data = result.data;
          var html = tmpl($('#side-nav-template').html(), data);
          var element = $(html);
          $('.sidebar-nav').append(element);
        }
      });
    },
    addMessage: function (msg, prepend) {
      var self = this;
      this.messageCount++;
      var messages = $('.messages');
      var element;
      if (msg.s) { // Special message
        if (msg.urls.length > 0) {
          msg.icon = this.media[msg.urls[0].type].icon;
        } else {
          msg.icon = "";
        }

        $.each(msg.tags, function (indx, tag) {
          msg.msg = msg.msg.replace("#" + tag, '<a href="#!/tag/' + tag + '">#' + tag + '</a>');
        });

        $.each(msg.urls, function (indx, url) {
          msg.msg = msg.msg.replace(url.url, '<a target="_blank" href="' + url.url + '">' + url.url + '</a>');
        });

        var html = tmpl($('#special-message-template').html(), msg);
        element = $(html);

        var media = element.find('.urls');

        $.each(msg.urls, function (indx, url) {
          var mediaElement = self.media[url.type].createElement(url, msg);
          media.append(mediaElement);
        });


      } else {
        var html = tmpl($('#message-template').html(), msg);
        element = $(html);
      }
      if (prepend) {
        messages.prepend(element);
      } else {
        messages.append(element);
      }

    },
    clearMessages: function () {
      var messages = $('.messages');
      this.messageCount = 0;
      messages.empty();

    },
    initMessages: function (type, value) {
      this.clearMessages();
      this.filterType = type;
      this.filterValue = value;
      this.loadMoreMessages(20);
    },
    loadMoreMessages: function (count) {
      var self = this;
      var skip = this.messageCount;
      var path = "";

      switch (this.filterType) {
        case "tag":
        case "type":
        case "to":
          path = "/messages/" + this.filterType + "/" + encodeURIComponent(this.filterValue);
          break;
        case "all":
          path = "/messages/";
          break;
        case "special":
          path = "/messages/special"
          break;
        case "single":
          path = "/messages/" + this.filterValue;
          break;
        case "search":
          path = "/messages/?s=" + this.filterValue;
          break;
      }

      if (path.indexOf('?') === -1) {
        path += "?";
      } else {
        path += "&";
      }

      path += "skip=" + skip + "&limit=" + count;

      $.getJSON(path, function (result) {
        if (result.status == "ok") {
          var messages = result.data.messages;
          $.each(messages, function (indx, item) {
            self.addMessage(item);
          });
        }
      });
    }
  };

  if (window.ui === undefined) {
    window.ui = {};
  }

  var key;
  for (key in ui) {
    window.ui[key] = ui[key];
  }

})(window);