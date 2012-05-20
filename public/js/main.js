$(function () {
  window.ui.initSidebar();
  window.ui.initSearch();

  function processHash() {
    var hash = window.location.hash || "#!/special";
    if (hash == "#" || hash == "#!" || hash == "#!/") {
      hash = "#!/special";
    }
    var parts = hash.split('/');
    var filter = parts[1];
    var value = parts[2];

    window.ui.initMessages(filter, value);
  }

  $(window).hashchange(processHash);
  processHash();

  var socket = io.connect();
  socket.on('new_message', function (msg) {
    ui.addMessage(msg, true);
  });


  function prettyTime() {
    $('.pretty-time').each(function (indx, item) {
      item = $(item);
      item.html(window.utils.convertDateToText(item.data('ts')));
    });
  }

  setInterval(prettyTime, 1000 * 60);
  prettyTime();

});
