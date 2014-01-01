// Generated by CoffeeScript 1.3.3
(function() {
  var app, db, express, suggest;

  db = require('./couch-calls');

  suggest = require('./suggest');

  express = require('express');

  app = express();

  app.use(express.cookieParser());

  app.use(express.session({
    secret: "n0n53n53"
  }));

  app.use(express.methodOverride());

  app.use(express.bodyParser());

  app.use('/public/index.html', function(req, res, next) {
    if (req.session.user) {
      return next();
    } else {
      return res.redirect("http://" + req.host + "/public/login.html");
    }
  });

  app.use('/public/entry.html', function(req, res, next) {
    if (req.session.user) {
      return next();
    } else {
      return res.redirect("http://" + req.host + "/public/login.html");
    }
  });

  app.use('/public', express["static"](__dirname + '/public'));

  app.use('/favicon.ico', express["static"](__dirname + '/public/img/favicon.ico'));

  db.checkOrCreateDB();

  app.get('/categories', function(req, res) {
    res.header('Cache-Control', 'max-age=10');
    return db.getCategories(req, res);
  });

  app.get('/category', function(req, res) {
    res.header('Cache-Control', 'max-age=10');
    return db.getCategoryEvents(req, res);
  });

  app.get('/actioncategory', function(req, res) {
    res.header('Cache-Control', 'max-age=10');
    return db.getActionCategories(req, res);
  });

  app.get('/activities', function(req, res) {
    res.header('Cache-Control', 'max-age=10');
    return db.getPagedActivities(req, res);
  });

  app.get('/csv', function(req, res) {
    return db.getCommaDelimited(req, res);
  });

  app.get('/rdf', function(req, res) {
    return db.getRDF(req, res);
  });

  app.get('/activities/:id', function(req, res) {
    return db.getActivity(req.params.id, res);
  });

  app.post('/activities', function(req, res) {
    return db.addActivity(req, res);
  });

  app.put('/activities/:id', function(req, res) {
    console.log(req.body);
    return db.updateActivity(req.body, res);
  });

  app.del('/activities/:id', function(req, res) {
    console.log(req);
    return db.delActivity(req.params.id, res);
  });

  app.get('/changeCategory/:from/:to', function(req, res) {
    console.log("Change category from " + req.params.from + " to " + req.params.to);
    return db.renameCategory(req, res);
  });

  app.get('/changeActivity/:from/:to', function(req, res) {
    console.log("Change activity from " + req.params.from + " to " + req.params.to);
    return db.renameAction(req, res);
  });

  app.get('/suggestions', function(req, res) {
    return suggest.suggest(req, res);
  });

  app.get('/today', function(req, res) {
    return db.getToday(req, function(dat) {
      return res.send(dat);
    });
  });

  app.get('/check_un/:un', function(req, res) {
    return db.check_un(req.params.un, res);
  });

  app.post('/login', function(req, res) {
    console.log(req.body);
    return db.check_unpw(req, res);
  });

  app.get('/logout', function(req, res) {
    console.log("Logout");
    delete req.session.user;
    res.clearCookie('validuser');
    return res.redirect("http://" + req.host + "/public/login.html");
  });

  app.listen(3000);

}).call(this);
