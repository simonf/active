// Generated by CoffeeScript 1.3.3
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
    postNewActivity: function(a, c, q, u, t, o, callback) {
      var posting;
      posting = $.post('/activities', {
        action: a,
        category: c,
        quantity: q,
        units: u,
        updatedAt: t,
        user: o
      });
      posting.done(function(data) {
        return callback(data);
      });
      posting.fail(function(data) {
        return alert(data);
      });
    },
    getSuggestions: function(handleDataFunc) {
      var url;
      url = '/suggestions';
      $.get(url, function(dat) {
        return handleDataFunc(dat);
      });
    },
    saveMood: function(cnt) {
      var url;
      url = '/mood';
      $.post('/mood', {
        mood: cnt
      });
    }
  };

}).call(this);
