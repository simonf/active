var cradle = require('cradle');
var fs = require('fs');
var server = fs.readFileSync('db.ini','utf8');
var conn = new(cradle.Connection)(server,5984,{ cache: true, raw: false});
var db = conn.database('activities');
var express = require('express');
var app = express.createServer();

app.use(express.methodOverride());
app.use(express.bodyParser());
app.use('/public',express.static(__dirname + '/public'));

var checkOrCreateDB = function(){
	db.exists(function (err, exists) {
	    if (err) {
	      console.log('error', err);
	    } else if (exists) {
	      console.log('database already exists.');
	    } else {
	      console.log('database does not exist. Creating it');
	      db.create(function(err,dat){
			if(err) {
				console.log(err);
			}
		  });
	      createViews();
	    }
	});
}

var createViews = function() {
	var view_id="_design/activity";
	var design_doc = {
		  "language": "javascript",
		  "views":
		  {
		    "all": {
		      "map": "function(doc) { if (doc.type == 'activity')  emit(doc._id, doc) }"
		    },
		    "by_action": {
		      "map": "function(doc) { if (doc.type == 'activity')  emit(doc.action, doc) }"
		    },
		    "by_category": {
		      "map": "function(doc) { if (doc.type == 'activity') emit(doc.category,{action: doc.action, date: parseInt(doc.updatedAt), qty: doc.quantity, units: doc.units})}"
		    },
		    "by_date": {
		      "map": "function(doc) { if (doc.type == 'activity')  emit(doc.updatedAt, doc) }"
		    },
		   "distinct_category": {
		       "map": "function(doc) { if (doc.type == 'activity') emit(doc.category, null) }",
		       "reduce": "function(keys,values) { emit(null) }"
		   }
		  }
		};
	
	db.get(view_id,function(err,dat) {
		if(err) {
			console.log(err);
			db.save(view_id,design_doc);
			console.log("Created views");
		} else {
			console.log("Views already exist");
		}
	});	
}

var addActivity = function(activity,resp) {
	activity.type='activity';
	if(activity.updatedAt == undefined) {
		activity.updatedAt=new Date().getTime().toString();
	}
	var op = db.save(activity,function(err,res){
		if(err) {
			console.log(err);
//			resp.send({ok:false});
		} else {
			resp.send({id: res.id});
		}
	});
};

var updateActivity = function(activity,resp) {
	db.get(activity.id,function(err,dat) {
		if(err) {
			console.log(err);
		} else {
			var id = activity.id;
			var rev=dat._rev;
			delete activity.id;
			if(activity.updatedAt == undefined) {
				activity.updatedAt=new Date().getTime().toString();
			}
			activity.type="activity";
			db.save(id, rev, activity,function(err,res){
				if(err) {
					console.log(err);
				} else {
					resp.send(200);
				}
			});
		}
	});
	
};

var getActivity = function(id, resp) {
	db.get(id,function(err,dat) {
		if(err) {
			resp.send(JSON.stringify(err));
		} else {
			resp.send(dat);
		}
	});
}

var getPagedActivities = function(req,resp) {
	var options = {descending: true};
	console.log(req.query);
	if(req.query.limit) options.limit=req.query.limit;
	if(req.query.startkey) options.startkey=req.query.startkey;
	db.view('activity/by_date', options, function (err, dat) {
		if(err) {
			resp.send(JSON.stringify(err));
		} else {
			console.log(dat.length);
			if(dat.length>0) {
				console.log(dat[0].key);
				console.log(dat[dat.length-1].key);
			}
			resp.send(dat);
	    }
	});
}

var getCategories = function(resp) {
	var options = {group: true};
	db.view('activity/distinct_category',options,function(err,dat) {
		if(err) {
			resp.send(JSON.stringify(err));
		} else {
			console.log(dat);
			resp.send(dat);
	    }
	});
}

var getCategoryEvents = function(req,resp) {
	var options = {};
	console.log(req.query);
	if(req.query.key) options.key=req.query.key;
	db.view('activity/by_category', options,function (err, dat) {
		if(err) {
			resp.send(JSON.stringify(err));
		} else {
			console.log(dat.length);
			if(dat.length>0) {
				console.log(dat[0].key);
				console.log(dat[dat.length-1].key);
			}
			resp.send(dat);
	    }
	});
}

var delActivity = function(id, resp) {
    db.get(id,function(err,dat) {
	if(err) {
	    resp.send({error: err},404);
	} else {
	    db.remove(id,dat._rev,function(err,dat) {
		if(err) {
		    resp.send({error: err},404);
		} else {
		    resp.send(204);
		}
	    });
	}
    });
}

checkOrCreateDB();

// //List all activities with a limit and a start key
// app.get('/activities?limit=:lim&start=:start', function(req,res) {
// 	res.header('Cache-Control','max-age=10');
// 	getPagedActivities(req.params.lim, req.params.start,res);
// });
// //List all activities with a limit
// app.get('/activities?limit=:lim', function(req,res) {
// 	res.header('Cache-Control','max-age=10');
// 	getPagedActivities(req.params.lim, null, res);
// });
//List all activities in a given category (use for charting)
app.get('/categories', function(req,res) {
	res.header('Cache-Control','max-age=10');
	getCategories(res);
});
app.get('/category', function(req,res) {
	res.header('Cache-Control','max-age=10');
	getCategoryEvents(req,res);
});
//List all activities
app.get('/activities', function(req,res) {
	res.header('Cache-Control','max-age=10');
	getPagedActivities(req,res);
});
//Get a single activity
app.get('/activities/:id', function(req, res){
	getActivity(req.params.id,res);
});
//Create an activity
app.post('/activities',function(req,res){
	console.log(req.body);
	addActivity(req.body,res);
});

//Update an activity
app.put('/activities/:id', function(req, res){
	console.log(req.body);
	updateActivity(req.body,res);
});

//Allow deletions
app.del('/activities/:id',function(req,res){
    console.log(req);
    delActivity(req.params.id,res);
});

app.listen(3000);