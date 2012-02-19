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
          activity.updatedAt = new Date().getTime().toString();
        }
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
    var options;
    options = {
      descending: true
    };
    console.log(req.query);
    if (req.query.limit) options.limit = req.query.limit;
    if (req.query.startkey) options.startkey = req.query.startkey;
    database.view('activity/by_date', options, function(err, dat) {
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

}).call(this);
