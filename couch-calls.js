(function() {
  var conn, cradle, createViews, database, fs, root, server;

  fs = require('fs');

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
        console.log('database already exists');
      } else {
        console.log('database does not exist. Creating it');
        database.create(function(err, dat) {
          if (err) return console.log(err);
        });
        createViews;
      }
    });
  };

  createViews = function() {
    var design_doc, view_id;
    view_id = '_design/activity';
    design_doc = {
      language: "javascript",
      views: {
        all: {
          map: "function(doc) { if (doc.type == 'activity')  emit(doc._id, doc) }"
        },
        by_action: {
          map: "function(doc) { if (doc.type == 'activity')  emit(doc.action, doc) }"
        },
        by_category: {
          map: "function(doc) { if (doc.type == 'activity')  emit(doc.category,{action: doc.action, date: parseInt(doc.updatedAt), qty: doc.quantity, units: doc.units}) }"
        },
        by_date: {
          map: "function(doc) { if (doc.type == 'activity')  emit(doc.updatedAt, doc) }"
        },
        distinct_category: {
          map: "function(doc) { if (doc.type == 'activity') emit(doc.category, null) }",
          reduce: "function(keys,values) { emit(null) }"
        },
        categoryactions: {
          map: "function(doc) { if (doc.type == 'activity')  emit([doc.category.trim(), doc.action.trim()]) }",
          reduce: "function(keys,values) { emit(null) }"
        },
        actioncategories: {
          map: "function(doc) { if(doc.type == 'activity') emit([doc.action.trim(),doc.category.trim()]) }",
          reduce: "function(keys,values) { emit(null) }"
        }
      }
    };
    database.get(view_id, function(err, dat) {
      if (err) {
        console.log(err);
        database.save(view_id, design_doc);
        console.log("Created views");
      } else {
        console.log("Views already exist");
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
    var options;
    options = {
      group: true
    };
    database.view('activity/distinct_category', options, function(err, dat) {
      if (err) {
        resp.send(JSON.stringify(err));
      } else {
        console.log(dat);
        resp.send(dat);
      }
    });
  };

  root.getCategoryEvents = function(req, resp) {
    var options;
    options = {};
    console.log(req.query);
    if (req.query.key) options.key = req.query.key;
    database.view('activity/by_category', options, function(err, dat) {
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
