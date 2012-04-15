(function() {
  var areViewsListsDifferent, conn, cradle, database, fs, json, root, server, updateViews;

  fs = require('fs');

  json = require('./public/lib/json2.min.js');

  server = fs.readFileSync('db.ini', 'utf8');

  cradle = require('cradle');

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
          if (err) return console.log(err);
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

  root.addActivity = function(activity, resp) {
    activity.type = 'activity';
    if (activity.updatedAt === void 0) {
      activity.updatedAt = new Date().getTime.toString;
    }
    if (activity.user === void 0) activity.user = 'simon';
    database.save(activity, function(err, res) {
      if (err) {
        console.log(err);
      } else {
        resp.send({
          id: res.id
        });
      }
    });
  };

  root.updateActivity = function(activity, resp) {
    var id;
    id = activity.id;
    database.get(id, function(err, dat) {
      var rev;
      if (err) {
        console.log(err);
      } else {
        rev = dat._rev;
        delete activity.id;
        if (activity.updatedAt === void 0) {
          activity.updatedAt = new Date().getTime.toString;
        }
        if (activity.user === void 0) activity.user = 'simon';
        activity.type = 'activity';
        return database.save(id, rev, activity, function(err, res) {
          if (err) {
            console.log(err);
          } else {
            resp.send(200);
          }
        });
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
    usr = req.cookies.get('user');
    options = {
      descending: true
    };
    console.log(req.query);
    if (req.query.limit) options.limit = req.query.limit;
    options.endkey = [usr];
    options.startkey = [usr, {}];
    if (req.query.startkey) options.startkey = [usr, req.query.startkey];
    console.log(options);
    database.view('activity/user-bydate', options, function(err, dat) {
      if (err) {
        console.log(err);
        resp.send(JSON.stringify(err));
      } else {
        console.log(dat.length);
        if (dat.length > 0) {
          console.log(dat[0].key);
          console.log(dat[dat.length - 1].key);
        }
        resp.send(dat);
      }
    });
  };

  root.getCategories = function(resp) {
    var options, usr;
    usr = resp.cookies.get('user');
    options = {
      group: true,
      startkey: [usr],
      endkey: [usr, {}]
    };
    database.view('activity/distinct_usercategory', options, function(err, dat) {
      if (err) {
        resp.send(JSON.stringify(err));
      } else {
        console.log(dat);
        resp.send(dat);
      }
    });
  };

  root.getCategoryEvents = function(req, resp) {
    var options, usr;
    options = {};
    console.log(req.query);
    usr = req.cookies.get('user');
    if (req.query.key) options.key = [usr, req.query.key];
    database.view('activity/by_usercategory', options, function(err, dat) {
      if (err) {
        resp.send(JSON.stringify(err));
      } else {
        console.log(dat.length);
        if (dat.length > 0) {
          console.log(dat[0].key);
          console.log(dat[dat.length - 1].key);
        }
        resp.send(dat);
      }
    });
  };

  root.getActionCategories = function(req, resp) {
    var options, usr;
    usr = resp.cookies.get('user');
    options = {
      group: true,
      startkey: [usr],
      endkey: [usr, {}]
    };
    console.log(req.query);
    database.view('activity/distinct_useractioncategory', options, function(err, dat) {
      if (err) {
        resp.send(JSON.stringify(err));
      } else {
        console.log(dat);
        resp.send(dat);
      }
    });
  };

  root.getCommaDelimited = function(req, resp) {
    var usr;
    usr = resp.cookies.get('user');
    database.view('activity/all_byuser', function(err, dat) {
      var couchRow, _i, _len, _ref;
      if (err) {
        resp.send(JSON.stringify(err));
      } else {
        resp.contentType('text/csv');
        _ref = dat.rows;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          couchRow = _ref[_i];
          if (couchRow.key[0] === usr) resp.write(couchRow.key.join() + "\n");
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

  root.check_unpw = function(req, resp) {
    console.log('Logging in');
    database.get('users', function(err, dat) {
      var usr, _i, _len, _ref;
      if (err) {
        console.log('error in db');
        resp.send({
          error: err
        }, 404);
      } else {
        console.log('Trying ' + req.body.un + '/' + req.body.pw);
        _ref = dat.users;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          usr = _ref[_i];
          console.log('checking ' + usr.toString());
          if (usr.un === req.body.un && usr.pw === req.body.pw) {
            resp.cookies.set('user', usr.un, {
              httpOnly: false
            });
            console.log('login ok');
            resp.redirect('/public/index.html');
            return;
          }
        }
        console.log('no matching user');
        resp.send(404);
      }
    });
  };

}).call(this);
