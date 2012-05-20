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

      if (prepend) {

        function increment(item, value) {
          item = $(item);
          var count = Number(item.find('a').data('count')) + 1;
          item.find('a').data('count', count);
          item.find('a').data('last-used', new Date());
          item.find('a').html(value + " (" + count + ")");
        }

        function add(type, value) {
          var item = $("<li><a></a></li>");
          item.addClass(type + "-" + value.replace("#", ""));
          item.find('a').data({
            action: "filter",
            filter: 'to',
            count: 1,
            "last-used": (new Date()).toString()
          });
          item.find('a').attr("href", "#!/" + type + "/" + value);
          item.find('a').html(value + " (1)");
          $("." + type + "s").after(item);
        }

        var to = msg.to;

        var item = $('.to-' + to.replace("#", ""))[0];

        if (item) {
          increment(item, to);
        } else {
          add("to", to);
        }

        $.each(msg.tags, function (idx, tag) {
          item = $('.tag-' + tag)[0];
          if (item) {
            increment(item, tag);
          } else {
            add("tag", tag);
          }
        });

        $.each(msg.urls, function (idx, url) {
          item = $('.type-' + url.type)[0];
          if (item) {
            increment(item, url.type);
          } else {
            add("type", url.type);
          }
        });

      }

      if (this.filterType != 'all') {
        switch (this.filterType) {
          case "tag":
            if ($.inArray(this.filterValue, msg.tags) === -1) {
              return false;
            }
            break;
          case "to":
            if (msg.to != this.filterValue) {
              return false;
            }
            break;
          case "type":
            var found = false;

            $.each(msg.urls, function (indx, url) {
              if (url.type == self.filterValue) {
                found = true;
              }
            });

            if (!found) {
              return false;
            }
            break;
          case "special":
            if (!msg.s) {
              return false;
            }
            break;
          case "search":
            if (prepend) {
              return false;
            }
            break;
        }
      }

      this.messageCount++;
      var messages = $('.messages');
      var element;
      msg.msg = $("<div></div>").text(msg.msg).html();
      if (msg.s) { // Special message
        if (msg.urls.length > 0) {
          msg.icon = this.media[msg.urls[0].type] ? this.media[msg.urls[0].type].icon : "";
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
          var mediaElement;
          if (self.media[url.type]) {
            mediaElement = self.media[url.type].createElement(url, msg);
          } else {
            mediaElement = self.media.html.createElement(url, msg);
          }
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

      if (type != "search") {
        $('input.search').val("");
      } else {
        $('input.search').val(value);
      }

    },
    loadMoreMessages: function (count) {
      var self = this;
      var skip = this.messageCount;
      var path = "";

      $('.menu-item').removeClass('active');

      switch (this.filterType) {
        case "tag":
        case "type":
        case "to":
          path = "/messages/" + this.filterType + "/" + encodeURIComponent(this.filterValue);
          break;
        case "all":
          $('.menu-item-all').addClass('active');
          path = "/messages/";
          break;
        case "special":
          $('.menu-item-special').addClass('active');
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
    },
    initSearch : function () {
      var lastSearch, searchTimeout, search, self;
      self = this;

      search = $('input.search');

      search.parent().submit(function (e) {
        clearTimeout(searchTimeout);
        var value = search.val();
        var hash = "#!/search/" + encodeURIComponent(value);

        if (document.location.hash != hash) {
          document.location = hash;
        } else {
          window.ui.initMessages("search", self.filterValue);
        }

        lastSearch = value;

        e.preventDefault();
      });

      search.keypress(function (e) {
        var item = $(this);
        window.ui.clearMessages();
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(function () {
          item.parent().submit();
        }, 2000);
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