(function() {

  $(function() {
    if (CookieChecker.isLoggedIn()) {
      window.location.pathname = window.location.pathname.replace('login', 'index');
    }
    $('#un').on('keyup', function() {
      var un;
      un = $('#un').val();
      if (un.length < 1) un = '~';
      $.get('/check_un/' + un, function(data) {
        $('#un').addClass('recognised');
      });
    });
    $('.submit-on-enter').on('keypress', function(e) {
      if ((e.which && e.which === 13) || (e.keyCode && e.keyCode === 13)) {
        $('button.default-button').click();
        $('#action-in').focus();
        return false;
      } else {
        return true;
      }
    });
    return $('#un').focus();
  });

}).call(this);
