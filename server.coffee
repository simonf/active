db = require('./couch-calls')
express = require('express')
cookies = require('cookies').express

app = express.createServer() 
app.use(cookies())
app.use express.methodOverride()
app.use express.bodyParser()
app.use '/public', express.static __dirname + '/public'

loggedInOrRedirect = (req,res) ->
	# sess = req.session
	return true if req.cookies.get('user')
	# return true if sess.user
	res.redirect '/public/login.html'
	return false

db.checkOrCreateDB()

app.get '/categories', (req,res) ->
	res.header 'Cache-Control','max-age=10'
	if loggedInOrRedirect(req,res)
		db.getCategories res

app.get '/category', (req,res) ->
	res.header 'Cache-Control','max-age=10'
	if loggedInOrRedirect(req,res)
		db.getCategoryEvents req,res

#List all activities
app.get '/activities', (req,res) ->
	res.header 'Cache-Control','max-age=10'
	if loggedInOrRedirect(req,res)
		db.getPagedActivities req,res

#Get a single activity
app.get '/activities/:id', (req, res) ->
	if loggedInOrRedirect(req,res)
		db.getActivity req.params.id,res

#Create an activity
app.post '/activities', (req,res) ->
	console.log req.body
	if loggedInOrRedirect(req,res)
		db.addActivity req.body,res

#Update an activity
app.put '/activities/:id', (req, res) ->
	console.log req.body
	if loggedInOrRedirect(req,res)
		db.updateActivity req.body,res

#Allow deletions
app.del '/activities/:id', (req,res) ->
	console.log req
	if loggedInOrRedirect(req,res)
    	db.delActivity req.params.id,res

#Check login username
app.get '/check_un/:un', (req,res) ->
	db.check_un req.params.un, res

#Log in
app.post '/login', (req,res) ->
	console.log req.body
	db.check_unpw req, res

app.listen 3000