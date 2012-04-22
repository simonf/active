(function() {
  var root;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.SFUtils = {
    splitNumbersAndUnits: function(anInput) {
      var arr, myInput, parsedNumber;
      if (anInput) {
        myInput = anInput.trim();
        if (myInput.length > 0) {
          arr = myInput.split(' ');
          if (arr.length > 1) {
            arr[0] = this.trim(arr[0]);
            arr[1] = this.trim(arr[1]);
            parsedNumber = parseFloat("0" + arr[0]);
            if (parsedNumber && parsedNumber.toString === arr[0]) {
              return {
                num: parsedNumber,
                units: arr[1]
              };
            } else {
              return {
                num: arr[0],
                units: arr[1]
              };
            }
          } else {
            return {
              num: myInput,
              units: ''
            };
          }
        }
      }
      return {
        num: '',
        units: ''
      };
    },
    trim: function(charString) {
      var frontTrimmed;
      frontTrimmed = charString.replace(/^\s*/, '');
      return frontTrimmed.replace(/\s*$/, '');
    },
    setCaretPosition: function(ctrl, pos) {
      var range;
      if (ctrl.setSelectionRange) {
        ctrl.focus();
        ctrl.setSelectionRange(pos, pos);
      } else if (ctrl.createTextRange) {
        range = ctrl.createTextRange();
        range.collapse(true);
        range.moveEnd('character', pos);
        range.moveStart('character', pos);
        range.select();
      }
    },
    yesterdayTimestamp: function() {
      return (new Date().getTime() - 86400000).toString();
    },
    todayMidday: function() {
      var d;
      d = new Date();
      d.setUTCHours(12);
      d.setMinutes(0);
      d.setSeconds(0);
      d.setMilliseconds(0);
      return d;
    },
    yesterdayMidday: function() {
      var d;
      d = new Date();
      d.setTime(d.getTime() - 24 * 3600 * 1000);
      d.setUTCHours(12);
      d.setMinutes(0);
      d.setSeconds(0);
      d.setMilliseconds(0);
      return d;
    },
    DoubleMatcher: function() {
      return {
        h: {},
        makeMatches: function(coll, va1, va2) {
          var that;
          that = this;
          _.each(coll, function(it) {
            var k, v;
            v = $.trim(it.get(va2));
            k = $.trim(it.get(va1));
            if (k && k.length > 0) return that.h[k] = v;
          });
        },
        listAll: function() {
          _.each(h, function(n) {
            return console.log(n);
          });
        },
        match: function(srcInputElement, destInputElement) {
          var k, v;
          k = $(srcInputElement).val();
          if (k && k.length > 0) v = this.h[k];
          if (v && v.length > 0) $(destInputElement).val(v);
        }
      };
    },
    ListOfValues: function() {
      return {
        values: [],
        makeMatches: function(coll, va) {
          var bbone_model_group, keyvalues, that;
          that = this;
          bbone_model_group = _.groupBy(coll, function(it) {
            return $.trim(it.get(va));
          });
          keyvalues = _.keys(bbone_model_group);
          that.values = _.sortBy(keyvalues, function(kv) {
            return kv;
          });
        },
        listAll: function() {
          _.each(values, function(n) {
            return console.log(n);
          });
        }
      };
    }
  };

}).call(this);
