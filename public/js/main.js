$(function () {
  window.ui.initSidebar();

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
    var item = $('.pretty-time');
    item.html(window.utils.convertDateToText(item.data('ts')));
  }

  setInterval(prettyTime, 1000 * 60);
  prettyTime();

});