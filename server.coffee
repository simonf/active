db = require('./couch-calls')
express = require('express')
app = express.createServer()
 
app.use express.methodOverride()
app.use express.bodyParser()
app.use '/public', express.static __dirname + '/public'

db.checkOrCreateDB()

app.get '/categories', (req,res) ->
	res.header 'Cache-Control','max-age=10'
	db.getCategories res

app.get '/category', (req,res) ->
	res.header 'Cache-Control','max-age=10'
	db.getCategoryEvents req,res

#List all activities
app.get '/activities', (req,res) ->
	res.header 'Cache-Control','max-age=10'
	db.getPagedActivities req,res

#Get a single activity
app.get '/activities/:id', (req, res) ->
	db.getActivity req.params.id,res

#Create an activity
app.post '/activities', (req,res) ->
	console.log req.body
	db.addActivity req.body,res

#Update an activity
app.put '/activities/:id', (req, res) ->
	console.log req.body
	db.updateActivity req.body,res

#Allow deletions
app.del '/activities/:id', (req,res) ->
    console.log req
    db.delActivity req.params.id,res

app.listen 3000