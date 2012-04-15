(function() {

  $(function() {
    CookieChecker.checkLogin();
    SimpleClient.fetchCategoriesAndActionsForUser();
    SimpleClient.fetchEventsForUser(10);
    $('.submit-on-enter').on('keypress', function(e) {
      if ((e.which && e.which === 13) || (e.keyCode && e.keyCode === 13)) {
        $('button.default-button').click();
        $('#action-in').focus();
        return false;
      } else {
        return true;
      }
    });
    return $('#action-in').focus();
  });

}).call(this);
