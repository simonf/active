(function() {
  var addActivity, app, checkOrCreateDB, conn, cradle, createViews, db, delActivity, express, fs, getActivities, getActivity, server, updateActivity;

  cradle = require('cradle');

  fs = require('fs');

  server = fs.readFileSync('db.ini', 'utf8');

  conn = new cradle.Connection(server, 5984, {
    cache: true,
    raw: false
  });

  db = conn.database('activities');

  express = require('express');

  app = express.createServer;

  app.use(express.methodOverride);

  app.use(express.bodyParser);

  app.use('/public', express.static(__dirname + '/public'));

  checkOrCreateDB = function() {
    return db.exists(function(err, exists) {
      if (err) {
        console.log('error', err);
      } else if (exists) {
        console.log('database already exists');
      } else {
        console.log('database does not exist. Creating it');
        db.create(function(err, dat) {
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
          map: "function(doc) { if (doc.type == 'activity')  emit(doc.category, doc) }"
        },
        by_date: {
          map: "function(doc) { if (doc.type == 'activity')  emit(doc.updatedAt, doc) }"
        }
      }
    };
    db.get(view_id, function(err, dat) {
      if (err) {
        console.log(err);
        db.save(view_id, design_doc);
        console.log("Created views");
      } else {
        console.log("Views already exist");
      }
    });
  };

  addActivity = function(activity, resp) {
    activity.type = 'activity';
    if (activity.updatedAt === void 0) {
      activity.updatedAt = new Date().getTime.toString;
    }
    db.save(activity, function(err, res) {
      if (err) {
        console.log(err);
      } else {
        resp.send({
          id: res.id
        });
      }
    });
  };

  updateActivity = function(activity, resp) {
    var id;
    id = activity.id;
    db.get(id, function(err, dat) {
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
        return db.save(id, rev, activity, function(err, res) {
          if (err) {
            console.log(err);
          } else {
            resp.send(200);
          }
        });
      }
    });
  };

  getActivity = function(id, resp) {
    db.get(id, function(err, dat) {
      if (err) {
        resp.send(JSON.stringify(err));
      } else {
        resp.send(dat);
      }
    });
  };

  getActivities = function(resp) {
    db.view('activity/by_date', function(err, dat) {
      if (err) {
        resp.send(JSON.stringify(err));
      } else {
        resp.send(dat);
      }
    });
  };

  delActivity = function(id, resp) {
    db.get(id, function(err, dat) {
      if (err) {
        resp.send({
          error: err
        }, 404);
      } else {
        return db.remove(id, dat._rev, function(err, dat) {
          if (err) {
            resp.send({
              error: err
            }, 404);
          } else {
            resp.send(204);
          }
        });
      }
    });
  };

  checkOrCreateDB();

  app.get('/activities', function(req, res) {
    res.header('Cache-Control', 'max-age=10');
    getActivities(res);
  });

  app.get('/activities/:id', function(req, res) {
    getActivity(req.params.id, res);
  });

  app.post('/activities', function(req, res) {
    console.log(req.body);
    addActivity(req.body, res);
  });

  app.put('/activities/:id', function(req, res) {
    console.log(req.body);
    updateActivity(req.body, res);
  });

  app.del('/activities/:id', function(req, res) {
    console.log(req);
    delActivity(req.body, res);
  });

  app.listen(3000);

}).call(this);
