(function() {

  $(function() {
    var SFLocals;
    CookieChecker.checkLogin();
    SFLocals = {
      actions: [],
      categories: [],
      matchedActionCategories: []
    };
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
      return $('#category-in').autocomplete({
        source: SFLocals.categories
      });
    });
    SimpleClient.fetchEventsForUser(10, function(row) {
      var rv;
      rv = '<div class="item-row"><span class="item-dt">' + new Date(parseInt(row.updatedAt)).toString('dd-MMM') + '</span>';
      rv += '<span class="item-action">' + row.action + '</span>';
      rv += '<span class="item-category">' + row.category + '</span>';
      rv += '<span class="item-qty">' + row.quantity + ' ' + row.units + '</span></div>';
      return $('#list').append(rv);
    });
    $('#today-button').on('change', function() {
      var nd;
      nd = SFUtils.todayMidday();
      $('#when-in').val(nd.toString('dd-MMM'));
      return $('#upAt').val(nd.getTime());
    });
    $('#yesterday-button').on('change', function() {
      var nd;
      nd = SFUtils.yesterdayMidday();
      $('#when-in').val(nd.toString('dd-MMM'));
      return $('#upAt').val(nd.getTime());
    });
    $('#new-item-form').on('submit', function(e) {
      var r;
      e.preventDefault();
      r = SFUtils.splitNumbersAndUnits($('#quantity-in').val());
      $.post('/activities', {
        action: $('#action-in').val(),
        category: $('#category-in').val(),
        quantity: r.num,
        units: r.units,
        updatedAt: $('#upAt').val()
      }, function(data) {
        return alert("Data Loaded: " + data);
      });
      return false;
    });
    return $('#action-in').focus();
  });

}).call(this);
