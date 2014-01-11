// Generated by CoffeeScript 1.3.3
(function() {

  $(function() {
    var SFLocals;
    $('#logged-in-username').empty();
    if (!CookieChecker.isLoggedIn()) {
      $('#logged-in-username').append("no-one");
    } else {
      $('#logged-in-username').append(CookieChecker.getUserName());
    }
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
        if (SFLocals.actions.indexOf(row.key[1]) === -1) {
          SFLocals.actions.push(row.key[1]);
        }
        if (SFLocals.categories.indexOf(row.key[2]) === -1) {
          SFLocals.categories.push(row.key[2]);
        }
        SFLocals.matchedActionCategories.push([row.key[1], row.key[2]]);
      }
      $('#action-in').inlineComplete({
        terms: SFLocals.actions
      });
      $('#category-in').inlineComplete({
        terms: SFLocals.categories
      });
      $('#action-in').blur(function() {
        var hit, poss, _j, _len1, _ref;
        _ref = SFLocals.matchedActionCategories;
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          hit = _ref[_j];
          if (hit[0] === $('#action-in').val()) {
            poss = hit[1];
          }
        }
        if (poss && poss.length > 0) {
          $('#category-in').val(poss);
        }
      });
    });
    $('.submit-on-enter').on('keypress', function(e) {
      if ((e.which && e.which === 13) || (e.keyCode && e.keyCode === 13)) {
        $('form').submit();
        $('#action-in').focus();
        return false;
      } else {
        return true;
      }
    });
    $('#otherdt').datepicker({
      dateFormat: "yyyy-mm-dd"
    });
    $('#otherdt').val(SFUtils.dayNow());
    $("input:radio").on('change', function(e) {
      var ds, ty;
      ty = $("input:radio:checked").val();
      ds = SFUtils.dayYesterday();
      if (ty === 'today') {
        ds = SFUtils.dayNow();
      }
      return $('#otherdt').val(ds);
    });
    $('button.default-button').on('click', function(e) {
      return $('#action-in').focus();
    });
    $('form').on('submit', function() {
      var js;
      js = $(this).serializeArray();
      $.post('/activities', js, function(data, status) {
        console.log("" + status + ": " + data);
        $('#action-in').val('');
        $('#category-in').val('');
        return $('#quantity-in').val('');
      });
      return false;
    });
    return $('#action-in').focus();
  });

}).call(this);