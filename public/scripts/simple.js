(function() {
  var root;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.SimpleClient = {
    fetchEventsForUser: function(limit) {
      var url;
      url = '/activities';
      if (limit) url += '?limit=' + limit;
      return $.get(url, function(dat) {
        var row, rv, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = dat.length; _i < _len; _i++) {
          row = dat[_i];
          rv = '<div class="item-row"><span class="item-dt">' + new Date(parseInt(row.value.updatedAt)).toString('dd-MMM') + '</span>';
          rv += '<span class="item-action">' + row.value.action + '</span>';
          rv += '<span class="item-category">' + row.value.category + '</span>';
          rv += '<span class="item-qty">' + row.value.quantity + ' ' + row.value.units + '</span></div>';
          _results.push($('#list').append(rv));
        }
        return _results;
      });
    },
    fetchCategoriesAndActionsForUser: function() {
      var url;
      url = '/actioncategory';
      return $.get(url, function(dat) {
        var row, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = dat.length; _i < _len; _i++) {
          row = dat[_i];
          _results.push(console.log(row.key[1]));
        }
        return _results;
      });
    },
    postNewActivity: function(a, c, q, u) {
      return $.post('/activities', {
        action: a,
        category: c,
        quantity: q,
        units: u
      });
    }
  };

}).call(this);
