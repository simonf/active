(function() {
  var app, cookies, db, express, loggedInOrRedirect;

  db = require('./couch-calls');

  express = require('express');

  cookies = require('cookies').express;

  app = express.createServer();

  app.use(cookies());

  app.use(express.methodOverride());

  app.use(express.bodyParser());

  app.use('/public', express.static(__dirname + '/public'));

  loggedInOrRedirect = function(req, res) {
    if (req.cookies.get('user')) return true;
    res.redirect('/public/login.html');
    return false;
  };

  db.checkOrCreateDB();

  app.get('/categories', function(req, res) {
    res.header('Cache-Control', 'max-age=10');
    if (loggedInOrRedirect(req, res)) return db.getCategories(res);
  });

  app.get('/category', function(req, res) {
    res.header('Cache-Control', 'max-age=10');
    if (loggedInOrRedirect(req, res)) return db.getCategoryEvents(req, res);
  });

  app.get('/actioncategory', function(req, res) {
    res.header('Cache-Control', 'max-age=10');
    if (loggedInOrRedirect(req, res)) return db.getActionCategories(req, res);
  });

  app.get('/activities', function(req, res) {
    res.header('Cache-Control', 'max-age=10');
    if (loggedInOrRedirect(req, res)) return db.getPagedActivities(req, res);
  });

  app.get('/activities/:id', function(req, res) {
    if (loggedInOrRedirect(req, res)) return db.getActivity(req.params.id, res);
  });

  app.post('/activities', function(req, res) {
    console.log(req.body);
    if (loggedInOrRedirect(req, res)) return db.addActivity(req.body, res);
  });

  app.put('/activities/:id', function(req, res) {
    console.log(req.body);
    if (loggedInOrRedirect(req, res)) return db.updateActivity(req.body, res);
  });

  app.del('/activities/:id', function(req, res) {
    console.log(req);
    if (loggedInOrRedirect(req, res)) return db.delActivity(req.params.id, res);
  });

  app.get('/check_un/:un', function(req, res) {
    return db.check_un(req.params.un, res);
  });

  app.post('/login', function(req, res) {
    console.log(req.body);
    return db.check_unpw(req, res);
  });

  app.listen(3000);

}).call(this);
