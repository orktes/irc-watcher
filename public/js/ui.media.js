(function (window, undefined) {
  var ui = {
    media: {
      image: {
        icon: "/img/icons/vimeo.png",
        createElement: function (url, msg) {
          var html = tmpl($('#media-image-template').html(), {url: url, msg: msg});
          var element = $(html);
          return element;
        }
      },
      website: {
        icon: "/img/icons/vimeo.png",
        createElement: function (url, msg) {
          var html = tmpl($('#media-website-template').html(), {url: url, msg: msg});
          var element = $(html);
          return element;
        }
      },
      youtube: {
        icon: "/img/icons/vimeo.png",
        createElement: function (url, msg) {
          var html = tmpl($('#media-youtube-template').html(), {url: url, msg: msg});
          var element = $(html);

          element.find('a').click(function (e) {


            var item = $(this);
            var action = item.data('action');

            if (action == "play") {
              e.preventDefault();
              var src = decodeURI(item.data('src'));
              var type = item.data('type');

              switch(type) {
                case "iframe":
                  var element = $(src);
                  element.width(item.find('img').width());
                  element.height(item.find('img').height());
                  item.parent().append(element);
                  item.remove();
                break;
                case "application/x-shockwave-flash":
                  var element = $('<object width="' + item.find('img').width() + '" height="' + item.find('img').height() + '"><param name="movie" value="' + src + '"></param><param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param><embed src="' + src + '" type="application/x-shockwave-flash" width="' + item.find('img').width() + '" height="' + item.find('img').height() + '" allowscriptaccess="always" allowfullscreen="true"></embed></object>');
                  item.parent().append(element);
                  item.remove();
                break;
              }

            }

          });

          return element;
        }
      },
      vimeo: {
        icon: "/img/icons/vimeo.png",
        createElement: function (url, msg) {
          return window.ui.media.youtube.createElement(url, msg);
        }
      }
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