// Generated by CoffeeScript 1.7.1
(function() {
  var areViewsListsDifferent, conn, cradle, database, doUpdate, formatCSVRow, formatter, fs, getUserFromSession, json, makeMidnight, n3, replaceAttributeValue, root, server, suggest, updateViews;

  fs = require('fs');

  n3 = require('./n3');

  json = require('./public/lib/json2.min.js');

  formatter = require('./formatter');

  server = "http://127.0.0.1";

  cradle = require('cradle');

  suggest = require('./suggest');

  conn = new cradle.Connection(server, 5984, {
    cache: true,
    raw: false
  });

  database = conn.database('activities');

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.checkOrCreateDB = function() {
    return database.exists(function(err, exists) {
      if (err) {
        console.log('error', err);
      } else if (exists) {
        updateViews();
      } else {
        console.log('database does not exist. Creating it');
        database.create(function(err, dat) {
          if (err) {
            return console.log(err);
          }
        });
        updateViews();
      }
    });
  };

  areViewsListsDifferent = function(localDefinition, dbDefinition) {
    var locMethod, locView, methodName, remMethod, remView, viewName, _i, _len, _ref;
    for (viewName in localDefinition.views) {
      remView = dbDefinition.views[viewName];
      if (typeof remView === 'undefined') {
        console.log("New local view: " + viewName);
        return true;
      }
      locView = localDefinition.views[viewName];
      _ref = ['map', 'reduce'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        methodName = _ref[_i];
        locMethod = locView[methodName];
        remMethod = remView[methodName];
        if (locMethod) {
          if (remMethod) {
            if (locMethod.replace(/[\n\r\t ]/g, '') !== remMethod.replace(/[\n\t\r ]/g, '')) {
              console.log("Difference between:\n" + locMethod + "\nand\n" + remMethod);
              return true;
            }
          } else {
            console.log('New local ' + methodName + ' found');
            return true;
          }
        }
      }
    }
    return false;
  };

  updateViews = function(force) {
    var dd, design_doc, view_id, _ref;
    force = (_ref = typeof force !== 'undefined') != null ? _ref : {
      force: false
    };
    view_id = '_design/activity';
    dd = fs.readFileSync('view-definitions.json', 'utf8');
    design_doc = JSON.parse(dd);
    database.get(view_id, function(err, dat) {
      var id, rev;
      if (err) {
        console.log(err);
        database.save(view_id, design_doc);
        console.log("Created views");
      } else {
        id = dat._id;
        rev = dat._rev;
        delete dat._id;
        delete dat._rev;
        if (areViewsListsDifferent(design_doc, dat)) {
          console.log("Some missing or outdated views. Updating");
          database.save(id, rev, design_doc);
        } else {
          console.log("Views OK.");
        }
      }
    });
  };

  root.addActivity = function(req, resp) {
    var activity;
    activity = req.body;
    activity = formatter.parseAndFixActivity(activity);
    if (activity.action !== void 0 && activity.action.length > 0) {
      if (activity.user === void 0) {
        activity.user = 'simon';
      }
      console.log("Saving:");
      console.log(activity);
      database.save(activity, function(err, res) {
        if (err) {
          console.log(err);
        } else {
          resp.send({
            id: res.id
          });
        }
      });
    }
  };

  root.addMood = function(req, resp) {
    var d, m, tosave, usr;
    m = req.body.mood;
    d = new Date().getTime();
    usr = getUserFromSession(req);
    if (m !== void 0 && m > 0) {
      tosave = {
        type: "mood",
        user: usr,
        level: m,
        timestamp: d
      };
      console.log("Saving: " + tosave);
      database.save(tosave, function(err, res) {
        if (err) {
          console.log(err);
        } else {
          resp.send(200);
        }
      });
    }
  };

  root.getMoods = function(req, callback) {
    var options, usr;
    usr = getUserFromSession(req);
    if (usr === void 0) {
      usr = 'simon';
    }
    options = {
      startkey: [usr]
    };
    database.view('activity/moods_byuseranddate', options, function(err, dat) {
      if (err) {
        console.log("getMoods: " + (JSON.stringify(err)));
        callback(JSON.stringify(err));
      } else {
        callback(dat);
      }
    });
  };

  doUpdate = function(activity, cb) {
    var id;
    id = activity.id;
    database.get(id, function(err, dat) {
      var rev;
      if (err) {
        console.log(err);
        return false;
      } else {
        rev = dat._rev;
        delete activity.id;
        if (activity.updatedAt === void 0) {
          activity.updatedAt = new Date().getTime.toString;
        }
        if (activity.user === void 0) {
          activity.user = 'simon';
        }
        activity.type = 'activity';
        return database.save(id, rev, activity, function(err, res) {
          if (err) {
            console.log(err);
            return cb(false);
          } else {
            return cb(true);
          }
        });
      }
    });
  };

  root.updateActivity = function(activity, resp) {
    doUpdate(activity, function(tf) {
      if (tf) {
        return resp.send(200);
      } else {
        return resp.send(500);
      }
    });
  };

  root.getActivity = function(id, resp) {
    database.get(id, function(err, dat) {
      if (err) {
        resp.send(JSON.stringify(err));
      } else {
        resp.send(dat);
      }
    });
  };

  root.getPagedActivities = function(req, resp) {
    var options, usr;
    usr = getUserFromSession(req);
    options = {
      descending: true
    };
    if (req.query.limit) {
      options.limit = req.query.limit;
    }
    options.endkey = [usr];
    options.startkey = [usr, {}];
    if (req.query.startkey) {
      options.startkey = [usr, req.query.startkey];
    }
    database.view('activity/user-bydate', options, function(err, dat) {
      if (err) {
        console.log(err);
        resp.send(JSON.stringify(err));
      } else {
        resp.send(dat);
      }
    });
  };

  root.getCategories = function(req, resp) {
    var options, usr;
    usr = getUserFromSession(req);
    if (usr === void 0) {
      usr = 'simon';
    }
    options = {
      group: true,
      startkey: [usr],
      endkey: [usr, {}]
    };
    database.view('activity/distinct_usercategory', options, function(err, dat) {
      if (err) {
        resp.send(JSON.stringify(err));
      } else {
        resp.send(dat);
      }
    });
  };

  root.getCategoryEvents = function(req, resp) {
    var options, usr;
    options = {};
    usr = getUserFromSession(req);
    if (req.query.key) {
      options.key = [usr, req.query.key];
    }
    database.view('activity/by_usercategory', options, function(err, dat) {
      if (err) {
        resp.send(JSON.stringify(err));
      } else {
        resp.send(dat);
      }
    });
  };

  root.getActionCategories = function(req, resp) {
    var options, usr;
    usr = getUserFromSession(req);
    if (usr === void 0) {
      usr = 'simon';
    }
    options = {
      group: true,
      startkey: [usr],
      endkey: [usr, {}]
    };
    database.view('activity/distinct_useractioncategory', options, function(err, dat) {
      if (err) {
        resp.send(JSON.stringify(err));
      } else {
        resp.send(dat);
      }
    });
  };

  makeMidnight = function() {
    var dt;
    dt = new Date();
    dt.setHours(0);
    dt.setMinutes(0);
    dt.setSeconds(0);
    dt.setMilliseconds(0);
    return dt.getTime();
  };

  root.getToday = function(req, callback) {
    var dt, options, usr;
    usr = getUserFromSession(req);
    if (usr === void 0) {
      usr = 'simon';
    }
    dt = parseInt((makeMidnight() / 86400000).toFixed(0));
    options = {
      startkey: [usr, dt]
    };
    database.view('activity/user-bynumericdate', options, function(err, dat) {
      if (err) {
        console.log("getToday: " + (JSON.stringify(err)));
        callback(JSON.stringify(err));
      } else {
        callback(dat);
      }
    });
  };

  root.getLastFiveDays = function(req, callback) {
    var ed, options, sd, usr;
    usr = getUserFromSession(req);
    if (usr === void 0) {
      usr = 'simon';
    }
    ed = parseInt((makeMidnight() / 86400000).toFixed(0));
    sd = ed - 5;
    options = {
      startkey: [usr, sd],
      endkey: [usr, ed]
    };
    database.view('activity/user-bynumericdate', options, function(err, dat) {
      if (err) {
        console.log("getLastFiveDays error: " + (JSON.stringify(err)));
        callback(JSON.stringify(err));
      } else {
        callback(dat);
      }
    });
  };

  formatCSVRow = function(rowarr) {
    var d, d2;
    rowarr.shift();
    d = new Date(rowarr[0]);
    d2 = "" + (d.getFullYear()) + "-" + (d.getMonth() + 1) + "-" + (d.getDate());
    rowarr[0] = d2;
    return rowarr.join() + "\n";
  };

  root.getCommaDelimited = function(req, resp) {
    var usr;
    usr = getUserFromSession(req);
    database.view('activity/all_byuser', function(err, dat) {
      var couchRow, _i, _len, _ref;
      if (err) {
        resp.send(JSON.stringify(err));
      } else {
        resp.contentType('text/csv');
        _ref = dat.rows;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          couchRow = _ref[_i];
          if (couchRow.key[0] === usr) {
            resp.write(formatCSVRow(couchRow.key));
          }
        }
        resp.end();
      }
    });
  };

  root.getRDF = function(req, resp) {
    database.view('activity/all', function(err, dat) {
      var cnt, couchRow, str, _i, _len, _ref;
      if (err) {
        resp.send(JSON.stringify(err));
      } else {
        resp.contentType('text/plain');
        resp.write(n3.getPrefixes());
        resp.write("\n");
        cnt = 1;
        _ref = dat.rows;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          couchRow = _ref[_i];
          str = n3.convertToN3(cnt, couchRow.value);
          resp.write("" + str + "\n");
          cnt += 1;
        }
        resp.end();
      }
    });
  };

  root.delActivity = function(id, resp) {
    database.get(id, function(err, dat) {
      if (err) {
        resp.send({
          error: err
        }, 404);
      } else {
        database.remove(id, dat._rev, function(err, dat) {});
      }
      if (err) {
        resp.send({
          error: err
        }, 404);
      } else {
        resp.send(204);
      }
      return;
    });
  };

  replaceAttributeValue = function(user, attname, fromval, toval, cb) {
    var retval;
    retval = {
      scanned: 0,
      usermatch: 0,
      matchcnt: 0,
      updcnt: 0,
      errcnt: 0,
      errmsg: ""
    };
    console.log("Replacing " + attname + " value " + fromval + " with " + toval + " for user " + user);
    return database.view('activity/all', function(err, dat) {
      var activity, couchRow, _i, _len, _ref, _results;
      if (err) {
        return retval.errmsg = JSON.stringify(err);
      } else {
        _ref = dat.rows;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          couchRow = _ref[_i];
          retval.scanned += 1;
          if (couchRow.value.user === user && couchRow.value.type === 'activity') {
            retval.usermatch += 1;
            if (couchRow.value[attname] === fromval) {
              retval.matchcnt += 1;
              activity = couchRow.value;
              activity[attname] = toval;
              activity.id = activity._id;
              delete activity._id;
              delete activity._rev;
              _results.push(doUpdate(activity, function(tf) {
                if (tf) {
                  retval.updcnt += 1;
                } else {
                  retval.errcnt += 1;
                }
                return cb(retval);
              }));
            } else {
              _results.push(void 0);
            }
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    });
  };

  root.renameAction = function(req, resp) {
    var user;
    user = getUserFromSession(req);
    return replaceAttributeValue(user, 'action', req.params.from, req.params.to, function(retval) {
      return resp.send(JSON.stringify(retval));
    });
  };

  root.renameCategory = function(req, resp) {
    var user;
    user = getUserFromSession(req);
    return replaceAttributeValue(user, 'category', req.params.from, req.params.to, function(retval) {
      return resp.send(JSON.stringify(retval));
    });
  };

  root.check_un = function(un, resp) {
    database.get('users', function(err, dat) {
      var usr, _i, _len, _ref;
      if (err) {
        resp.send({
          error: err
        }, 404);
      } else {
        _ref = dat.users;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          usr = _ref[_i];
          if (usr.un === un) {
            resp.send(200);
            return;
          }
        }
        resp.send(404);
      }
    });
  };

  getUserFromSession = function(req) {
    return req.session.user;
  };

  root.check_unpw = function(req, resp) {
    console.log('Logging in');
    database.get('users', function(err, dat) {
      var usr, _i, _len, _ref;
      if (err) {
        console.log("error in db: " + err);
      } else {
        _ref = dat.users;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          usr = _ref[_i];
          if (usr.un === req.body.un && usr.pw === req.body.pw) {
            req.session.user = usr.un;
            resp.cookie('validuser', usr.un);
            console.log('login ok');
            resp.redirect("http://" + req.host + "/public/index.html");
            return;
          }
        }
        console.log('no matching user');
      }
      resp.clearCookie('validuser');
      resp.redirect("http://" + req.host + "/public/login.html");
    });
  };

}).call(this);
