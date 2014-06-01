// Generated by CoffeeScript 1.7.1
(function() {
  var root;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.SimpleClient = {
    fetchEventsForUser: function(limit, rowDrawFunc) {
      var url;
      url = '/activities';
      if (limit) {
        url += '?limit=' + limit;
      }
      $.get(url, function(dat) {
        var row, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = dat.length; _i < _len; _i++) {
          row = dat[_i];
          _results.push(rowDrawFunc(row.value));
        }
        return _results;
      });
    },
    fetchCategoriesAndActionsForUser: function(handleDataFunc) {
      var url;
      url = '/actioncategory';
      $.get(url, function(dat) {
        return handleDataFunc(dat);
      });
    },
    postNewActivity: function(a, c, q, u, t, o, loc, callback) {
      var posting;
      posting = $.post('/activities', {
        action: a,
        category: c,
        quantity: q,
        units: u,
        updatedAt: t,
        user: o,
        location: loc
      });
      posting.done(function(data) {
        callback(data);
      });
      posting.fail(function(data) {
        alert(data);
      });
    },
    getSuggestions: function(handleDataFunc) {
      var url;
      url = '/suggestions';
      $.get(url, function(dat) {
        handleDataFunc(dat);
      });
    },
    saveMood: function(cnt, callback) {
      var posting;
      posting = $.post('/mood', {
        mood: cnt
      });
      posting.done(function(data) {
        callback(data);
      });
      posting.fail(function(data) {
        alert(data);
      });
    },
    getMood: function(lim, callback) {
      jQuery.get("/mood?limit=" + lim, function(dat) {
        callback(dat);
      });
    }
  };

}).call(this);
