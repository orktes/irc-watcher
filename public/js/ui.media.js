(function (window, undefined) {
  var ui = {
    media: {
      html: {
        icon: "/img/icons/vimeo.png",
        createElement: function (url, msg) {
          var html = tmpl($('#media-html-template').html(), {url: url, msg: msg});
          console.log(html);
          var element = $(html);
          return element;
        }
      },
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

          if (url.metadata && url.metadata.description && url.metadata.description.length > 450) {
            url.metadata.fullDescription = url.metadata.description;
            url.metadata.description = url.metadata.description.substring(0, 450) + "...";
          }

          var html = tmpl($('#media-website-template').html(), {url: url, msg: msg});
          var media = $(html);

          media.find('a').click(function (e) {

            var item = $(this);
            var action = item.data('action');

            if (action == "show-full-description") {
              e.preventDefault();
              media.find('.description-text').html(url.metadata.fullDescription);
            }
          });

          return media;
        }
      },
      video: {
        icon: "/img/icons/vimeo.png",
        createElement: function (url, msg) {

          url.metadata = url.metadata || {};
          url.metadata.description = url.metadata.description || "";
          if (url.metadata.description.length > 450) {
            url.metadata.fullDescription = url.metadata.description;
            url.metadata.description = url.metadata.description.substring(0, 450) + "...";
          }

          var html = tmpl($('#media-youtube-template').html(), {url: url, msg: msg});
          var media = $(html);

          media.find('a').click(function (e) {


            var item = $(this);
            var action = item.data('action');

            if (action == "play") {
              e.preventDefault();
              var src = decodeURI(item.data('src'));
              var type = item.data('type');

              switch (type) {
              case "html":
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

            } else if (action == "show-full-description") {
              e.preventDefault();
              media.find('.description-text').html(url.metadata.fullDescription);
            }

          });

          return media;
        }
      },
      vimeo: {
        icon: "/img/icons/vimeo.png",
        createElement: function (url, msg) {
          return window.ui.media.video.createElement(url, msg);
        }
      },
      youtube: {
        icon: "/img/icons/vimeo.png",
        createElement: function (url, msg) {
          return window.ui.media.video.createElement(url, msg);
        }
      },
      collegehumor: {
        icon: "/img/icons/vimeo.png",
        createElement: function (url, msg) {
          return window.ui.media.video.createElement(url, msg);
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