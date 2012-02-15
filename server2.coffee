cradle = require('cradle')
fs = require('fs')
server = fs.readFileSync 'db.ini', 'utf8'
conn =  new(cradle.Connection)(server,5984,{cache: true, raw: false})
db =  conn.database('activities')
express = require('express')
app = express.createServer
 
app.use express.methodOverride
app.use express.bodyParser
app.use '/public', express.static __dirname + '/public'

checkOrCreateDB = ->
	db.exists (err,exists) ->
		if err 
			console.log 'error',err
			return
		else if exists
			console.log 'database already exists'
			return
		else
			console.log 'database does not exist. Creating it'
			db.create (err,dat) ->
				if err
					console.log err
			createViews
			return

createViews = ->
	view_id = '_design/activity'
	design_doc = {
		language: "javascript",
		views:	{
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
	}
	db.get view_id, (err,dat) ->
		if err
			console.log err
			db.save view_id, design_doc
			console.log "Created views"
			return
		else
			console.log "Views already exist"
			return
	return

addActivity = (activity, resp) ->
	activity.type = 'activity'
	activity.updatedAt = new Date().getTime.toString if activity.updatedAt == undefined
	db.save(activity, (err,res) -> 
		if (err)
			console.log(err)
			return
		else 
			resp.send {id: res.id}
			return
	)
	return

updateActivity = (activity, resp) ->
	id=activity.id
	db.get(id, (err,dat) ->
		if(err)
			console.log err
			return
		else
			rev = dat._rev
			delete activity.id
			if(activity.updatedAt == undefined)
				activity.updatedAt = new Date().getTime().toString()
			activity.type = 'activity'
			db.save id, rev, activity, (err,res) ->
				if(err)
					console.log err
					return
				else
					resp.send 200
					return
	)
	return

getActivity = (id, resp) ->
	db.get id, (err,dat) ->
		if(err)
			resp.send JSON.stringify err
			return
		else
			resp.send dat
			return
	return
	
getActivities = (resp) ->
	db.view 'activity/by_date', (err,dat) ->
		if(err)
			resp.send JSON.stringify err
			return
		else
			resp.send dat
			return
	return
	
delActivity = (id,resp)	->
	db.get id, (err,dat) ->
		if(err)
			resp.send {error: err}, 404
			return
		else
			db.remove id, dat._rev, (err,dat) ->
				if(err)
					resp.send {error: err}, 404
					return
				else
					resp.send 204
					return
	return
	
checkOrCreateDB()

#List all activities
app.get('/activities',(req,res) ->
	res.header 'Cache-Control', 'max-age=10'
	getActivities res
	return
)

#Get one activity
app.get('/activities/:id', (req,res) ->
	getActivity req.params.id, res
	return
)

#Create an activity
app.post('/activities', (req,res) ->
	console.log req.body
	addActivity req.body, res
	return
)

#Update an activity
app.put('/activities/:id', (req,res) ->
	console.log req.body
	updateActivity req.body, res
	return
)

#Delete an activity
app.del('/activities/:id', (req,res) ->
	console.log req
	delActivity req.body, res
	return
)

app.listen 3000

# var cradle = require('cradle');
# var fs = require('fs');
# var server = fs.readFileSync('db.ini','utf8');
# var conn = new(cradle.Connection)(server,5984,{ cache: true, raw: false});
# var db = conn.database('activities');
# var express = require('express');
# var app = express.createServer();
# 
# app.use(express.methodOverride());
# app.use(express.bodyParser());
# app.use('/public',express.static(__dirname + '/public'));
# 
# var checkOrCreateDB = function(){
# 	db.exists(function (err, exists) {
# 	    if (err) {
# 	      console.log('error', err);
# 	    } else if (exists) {
# 	      console.log('database already exists.');
# 	    } else {
# 	      console.log('database does not exist. Creating it');
# 	      db.create(function(err,dat){
# 			if(err) {
# 				console.log(err);
# 			}
# 		  });
# 	      createViews();
# 	    }
# 	});
# }
# 
# var createViews = function() {
# 	var view_id="_design/activity";
# 	var design_doc = {
# 		  "language": "javascript",
# 		  "views":
# 		  {
# 		    "all": {
# 		      "map": "function(doc) { if (doc.type == 'activity')  emit(doc._id, doc) }"
# 		    },
# 		    "by_action": {
# 		      "map": "function(doc) { if (doc.type == 'activity')  emit(doc.action, doc) }"
# 		    },
# 		    "by_category": {
# 		      "map": "function(doc) { if (doc.type == 'activity')  emit(doc.category, doc) }"
# 		    },
# 		    "by_date": {
# 		      "map": "function(doc) { if (doc.type == 'activity')  emit(doc.updatedAt, doc) }"
# 		    }
# 		  }
# 		};
# 	
# 	db.get(view_id,function(err,dat) {
# 		if(err) {
# 			console.log(err);
# 			db.save(view_id,design_doc);
# 			console.log("Created views");
# 		} else {
# 			console.log("Views already exist");
# 		}
# 	});	
# }
# 
# var addActivity = function(activity,resp) {
# 	activity.type='activity';
# 	if(activity.updatedAt == undefined) {
# 		activity.updatedAt=new Date().getTime().toString();
# 	}
# 	var op = db.save(activity,function(err,res){
# 		if(err) {
# 			console.log(err);
# //			resp.send({ok:false});
# 		} else {
# 			resp.send({id: res.id});
# 		}
# 	});
# };
# 
# var updateActivity = function(activity,resp) {
# 	db.get(activity.id,function(err,dat) {
# 		if(err) {
# 			console.log(err);
# 		} else {
# 			var id = activity.id;
# 			var rev=dat._rev;
# 			delete activity.id;
# 			if(activity.updatedAt == undefined) {
# 				activity.updatedAt=new Date().getTime().toString();
# 			}
# 			activity.type="activity";
# 			db.save(id, rev, activity,function(err,res){
# 				if(err) {
# 					console.log(err);
# 				} else {
# 					resp.send(200);
# 				}
# 			});
# 		}
# 	});
# 	
# };
# 
# var getActivity = function(id, resp) {
# 	db.get(id,function(err,dat) {
# 		if(err) {
# 			resp.send(JSON.stringify(err));
# 		} else {
# 			resp.send(dat);
# 		}
# 	});
# }
# 
# var getActivities = function(resp) {
# 	db.view('activity/by_date', function (err, dat) {
# 		if(err) {
# 			resp.send(JSON.stringify(err));
# 		} else {
# //			console.log(dat);
# 			resp.send(dat);
# 	    }
# 	});
# }
# 
# var delActivity = function(id, resp) {
#     db.get(id,function(err,dat) {
# 	if(err) {
# 	    resp.send({error: err},404);
# 	} else {
# 	    db.remove(id,dat._rev,function(err,dat) {
# 		if(err) {
# 		    resp.send({error: err},404);
# 		} else {
# 		    resp.send(204);
# 		}
# 	    });
# 	}
#     });
# }
# 
# checkOrCreateDB();
# 
# //List all activities
# app.get('/activities', function(req,res) {
# 	res.header('Cache-Control','max-age=10');
# 	getActivities(res);
# });
# //Get a single activity
# app.get('/activities/:id', function(req, res){
# 	getActivity(req.params.id,res);
# });
# //Create an activity
# app.post('/activities',function(req,res){
# 	console.log(req.body);
# 	addActivity(req.body,res);
# });
# 
# //Update an activity
# app.put('/activities/:id', function(req, res){
# 	console.log(req.body);
# 	updateActivity(req.body,res);
# });
# 
# //Allow deletions
# app.del('/activities/:id',function(req,res){
#     console.log(req);
#     delActivity(req.params.id,res);
# });
# 
# app.listen(3000);