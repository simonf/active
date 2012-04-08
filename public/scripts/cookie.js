(function() {
  var root;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.CookieChecker = {
    isLoggedIn: function() {
      if ($.cookie('user')) return true;
      return false;
    },
    getUserName: function() {
      return $.cookie('user');
    },
    clearUserName: function() {
      $.cookie('user', null, {
        path: '/'
      });
    }
  };

}).call(this);
