(function() {

  $(function() {
    var SFLocals;
    CookieChecker.checkLogin();
    SFLocals = {
      actions: [],
      categories: [],
      matchedActionCategories: [],
      setDay: function(nd) {
        $('#when-in').val(nd.toString('dd-MMM'));
        $('#upAt').val(nd.getTime());
      },
      appendRow: function(row) {
        var rv;
        rv = SFLocals.drawRow(row);
        $('#list').append(rv);
      },
      prependRow: function(row) {
        var rv;
        rv = SFLocals.drawRow(row);
        $('#list').prepend(rv);
      },
      drawRow: function(row) {
        var rv;
        rv = '<div class="item-row"><span class="item-dt">' + new Date(parseInt(row.updatedAt)).toString('dd-MMM') + '</span>';
        rv += '<span class="item-action">' + row.action + '</span>';
        rv += '<span class="item-category">' + row.category + '</span>';
        rv += '<span class="item-qty">' + row.quantity + ' ' + row.units + '</span></div>';
        return rv;
      },
      makeRow: function() {
        var r;
        r = SFUtils.splitNumbersAndUnits($('#quantity-in').val());
        return {
          action: $('#action-in').val(),
          category: $('#category-in').val(),
          quantity: r.num,
          units: r.units,
          updatedAt: $('#upAt').val()
        };
      }
    };
    SFLocals.setDay(SFUtils.todayMidday());
    SimpleClient.fetchCategoriesAndActionsForUser(function(dat) {
      var row, _i, _len;
      for (_i = 0, _len = dat.length; _i < _len; _i++) {
        row = dat[_i];
        if (SFLocals.categories.indexOf(row.key[1]) === -1) {
          SFLocals.actions.push(row.key[1]);
        }
        if (SFLocals.categories.indexOf(row.key[2]) === -1) {
          SFLocals.categories.push(row.key[2]);
        }
        SFLocals.matchedActionCategories.push([row.key[1], row.key[2]]);
      }
      $('#action-in').autocomplete({
        source: SFLocals.actions
      });
      $('#category-in').autocomplete({
        source: SFLocals.categories
      });
      $('#action-in').blur(function() {
        var hit, poss, _j, _len2, _ref;
        _ref = SFLocals.matchedActionCategories;
        for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
          hit = _ref[_j];
          if (hit[0] === $('#action-in').val()) poss = hit[1];
        }
        if (poss && poss.length > 0) $('#category-in').val(poss);
      });
    });
    SimpleClient.fetchEventsForUser(10, SFLocals.appendRow);
    $('#today-button').on('change', function() {
      var nd;
      nd = SFUtils.todayMidday();
      return SFLocals.setDay(nd);
    });
    $('#yesterday-button').on('change', function() {
      var nd;
      nd = SFUtils.yesterdayMidday();
      return SFLocals.setDay(nd);
    });
    $('#new-item-form').on('submit', function(e) {
      var row;
      e.preventDefault();
      row = SFLocals.makeRow();
      $.post('/activities', row, function(data) {
        return SFLocals.prependRow(row);
      });
      return false;
    });
    return $('#action-in').focus();
  });

}).call(this);
