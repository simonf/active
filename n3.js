// Generated by CoffeeScript 1.7.1
(function() {
  var makeDateFromTS, root;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  makeDateFromTS = function(ts) {
    var d, days, dow, h, m, mm, retval, t, y;
    days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    d = new Date(parseInt(ts));
    retval = {};
    retval.iso = d.toISOString();
    y = d.getUTCFullYear();
    m = d.getUTCMonth() + 1;
    if (m < 10) {
      m = "0" + m;
    }
    t = d.getUTCDate();
    if (t < 10) {
      t = "0" + t;
    }
    retval.day = "" + y + "-" + m + "-" + t + "Z";
    h = d.getUTCHours();
    if (h < 10) {
      h = "0" + h;
    }
    mm = d.getUTCMinutes();
    if (mm < 10) {
      mm = "0" + mm;
    }
    retval.time = "" + h + ":" + mm + ":00Z";
    dow = d.getUTCDay();
    retval.dow = days[dow];
    return retval;
  };

  root.getPrefixes = function() {
    var pa;
    pa = ["@prefix act: <http://schemas.simonf.net/activities/core#> .", "@prefix dc:  <http://purl.org/dc/elements/1.1/> .", "@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .", "@prefix tim: <http://www.w3.org/2006/time#> .", "@prefix unt: <http://www.w3.org/2007/ont/unit#> ."];
    return pa.join("\n");
  };

  root.convertToN3 = function(cnt, doc) {
    var act_pred, cat_pred, day_pred, dow_pred, dt, hr_min_pred, id, match, qty_id, qty_pred, retval, subject, trans, ts_pred, unit_equiv, unit_pred, usr_pred, val_pred;
    id = "_:activity" + cnt;
    dt = makeDateFromTS(doc.updatedAt);
    usr_pred = "dc:Creator";
    ts_pred = "tim:inXSDDateTime";
    dow_pred = "tim:DayOfWeek";
    day_pred = "dc:date";
    cat_pred = "act:Category";
    act_pred = "act:Action";
    val_pred = "act:Value";
    qty_id = "_:activity" + cnt + "qty";
    unit_pred = "act:Unit";
    qty_pred = "act:Quantity";
    unit_equiv = [
      {
        raw: "hr",
        cooked: "tim:hours"
      }, {
        raw: "hour",
        cooked: "tim:hours"
      }, {
        raw: "hours",
        cooked: "tim:hours"
      }, {
        raw: "min",
        cooked: "tim:minutes"
      }, {
        raw: "mins",
        cooked: "tim:minutes"
      }, {
        raw: "kg",
        cooked: "unt:kg"
      }, {
        raw: "mile",
        cooked: "unt:mile"
      }, {
        raw: "miles",
        cooked: "unt:mile"
      }, {
        raw: null,
        cooked: "unt:Quantity"
      }
    ];
    hr_min_pred = "tim:HourMinute";
    subject = id;
    retval = [];
    retval.push("" + id + " dc:Creator \"" + doc.user + "\" .");
    retval.push("" + id + " act:Category \"" + doc.category + "\" .");
    retval.push("" + id + " act:Action \"" + doc.action + "\" .");
    retval.push("" + id + " " + ts_pred + " \"" + dt.iso + "\"^^xsd:dateTime .");
    retval.push("" + id + " " + dow_pred + " \"" + dt.dow + "\" .");
    retval.push("" + id + " " + day_pred + " \"" + dt.day + "\"^^xsd:date .");
    retval.push("" + id + " " + qty_pred + " " + qty_id + " .");
    if ((doc.quantity != null) && doc.quantity.toString().match(":") !== null) {
      retval.push("" + qty_id + " " + hr_min_pred + " \"" + doc.quantity + "\" .");
    } else {
      if ((doc.quantity * 10) % 10 === 0) {
        retval.push("" + qty_id + " " + val_pred + " \"" + doc.quantity + "\"^^xsd:integer .");
      } else {
        retval.push("" + qty_id + " " + val_pred + " \"" + doc.quantity + "\" .");
      }
      match = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = unit_equiv.length; _i < _len; _i++) {
          trans = unit_equiv[_i];
          if (trans.raw === doc.units) {
            _results.push(trans.cooked);
          }
        }
        return _results;
      })();
      if (match.length === 1) {
        retval.push("" + qty_id + " " + unit_pred + " " + match[0] + " .");
      }
    }
    return retval.join("\n");
  };

}).call(this);
