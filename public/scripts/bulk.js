// Generated by CoffeeScript 1.7.1
(function() {
  var root;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.DoBulk = {
    showSuggestions: function() {
      SimpleClient.getSuggestions(function(data) {
        var item, _i, _len;
        if (data.length > 0) {
          $('div#bulk_entry').show();
          $('table#bulk_table tbody').empty();
          $('table#bulk_table tbody').append('<form>');
          for (_i = 0, _len = data.length; _i < _len; _i++) {
            item = data[_i];
            $('table#bulk_table tbody').append(DoBulk.makeSuggestionRow(item));
          }
        }
      });
    },
    makeSuggestionRow: function(item) {
      return "<tr><td><input type='text' value='" + item.category + "' class='bcat_in'></td><td><input type='text' value='" + item.action + "' class='bact_in'></td><td><input type='text' value='" + item.quantity + " " + item.units + "' class='bqty_in'></td><td><input type='checkbox' value='' class='bdo_in'/></td></tr>";
    },
    saveSuggestions: function() {
      var loc;
      loc = SFUtils.currentLocation;
      $('.bdo_in:checked').each(function(index, el) {
        var a, c, n, o, r, t;
        t = new Date().getTime().toString();
        c = $(el).parent().parent().find('td input.bcat_in').val();
        a = $(el).parent().parent().find('td input.bact_in').val();
        n = $(el).parent().parent().find('td input.bqty_in').val();
        o = CookieChecker.getUserName();
        r = SFUtils.splitNumbersAndUnits(n);
        SimpleClient.postNewActivity(a, c, r.num, r.units, t, o, loc, function(data) {
          console.log(data);
          $('#table-body').prepend(DoBulk.makeVisibleRow(a, c, r, t, data));
        });
      });
      $('table#bulk_table tbody').empty();
      $('div#bulk_entry').hide();
    },
    makeVisibleRow: function(a, c, r, t, id) {
      var d;
      d = new Date(parseInt(t)).toString('d-MMM-yy HH:mm');
      return "<span class='col_activity tb-bg'>" + a + "&nbsp;</span><span class='col_category tb-bg'>" + c + "&nbsp;</span><span class='col_quantity tb-bg'>" + r.num + "&nbsp;" + r.units + "</span><span class='col_timestamp tb-bg'>" + d + "</span><span class='col_buttons'><a href='#' class='item-delete' data-id='" + id + "'><img id='del-img' src='img/cross_48.png'/></a></span>";
    }
  };

}).call(this);
