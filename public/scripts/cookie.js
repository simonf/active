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
    },
    setTargetCookie: function() {
      $.cookie('tgt', unescape(window.location.pathname), {
        path: '/'
      });
    },
    getTargetCookie: function() {
      return $.cookie('tgt');
    },
    checkLogin: function() {
      if (!this.isLoggedIn()) {
        this.setTargetCookie();
        window.location.pathname = '/public/login.html';
      }
    }
  };

}).call(this);
