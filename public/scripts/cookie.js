// Generated by CoffeeScript 1.7.1
(function() {
  var root;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.CookieChecker = {
    isLoggedIn: function() {
      if ($.cookie('validuser')) {
        return true;
      }
      return false;
    },
    getUserName: function() {
      return $.cookie('validuser');
    },
    clearUserName: function() {
      $.cookie('validuser', null, {
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
