(function() {

  $(function() {
    var SFLocals, listView;
    CookieChecker.checkLogin();
    $('#logged-in-username').append(CookieChecker.getUserName());
    listView = new ListView();
    SFLocals = {
      actions: [],
      categories: [],
      matchedActionCategories: [],
      setDay: function(nd) {
        $('#when-in').val(nd.toString('dd-MMM'));
        return $('#upAt').val(nd.getTime());
      }
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
    $('#logout-link').on('click', function() {
      CookieChecker.clearUserName();
      CookieChecker.checkLogin();
    });
    $('#pre-page').on('click', function() {
      return listView.collection.getPrevPage();
    });
    $('#nxt-page').on('click', function() {
      return listView.collection.getNextPage();
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
    return $('#action-in').focus();
  });

}).call(this);
