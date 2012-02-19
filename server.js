(function() {
  var app, db, express;

  db = require('./couch-calls');

  express = require('express');

  app = express.createServer();

  app.use(express.methodOverride());

  app.use(express.bodyParser());

  app.use('/public', express.static(__dirname + '/public'));

  db.checkOrCreateDB();

  app.get('/categories', function(req, res) {
    res.header('Cache-Control', 'max-age=10');
    return db.getCategories(res);
  });

  app.get('/category', function(req, res) {
    res.header('Cache-Control', 'max-age=10');
    return db.getCategoryEvents(req, res);
  });

  app.get('/activities', function(req, res) {
    res.header('Cache-Control', 'max-age=10');
    return db.getPagedActivities(req, res);
  });

  app.get('/activities/:id', function(req, res) {
    return db.getActivity(req.params.id, res);
  });

  app.post('/activities', function(req, res) {
    console.log(req.body);
    return db.addActivity(req.body, res);
  });

  app.put('/activities/:id', function(req, res) {
    console.log(req.body);
    return db.updateActivity(req.body, res);
  });

  app.del('/activities/:id', function(req, res) {
    console.log(req);
    return db.delActivity(req.params.id, res);
  });

  app.listen(3000);

}).call(this);
