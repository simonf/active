db = require('./couch-calls')
suggest = require('./suggest')
express = require('express')
#cookies = require('cookies').express

app = express()

#CORS middleware
allowCrossDomain = (req, res, next) ->
    res.header 'Access-Control-Allow-Origin', '*'
    res.header 'Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE'
    res.header 'Access-Control-Allow-Headers', 'Content-Type'
    next()
    return


#app.use(cookies())
app.use express.cookieParser()
app.use express.session {secret: "n0n53n53"}
app.use express.methodOverride()
app.use express.bodyParser()
app.use allowCrossDomain
#app.use express.logger()
app.use '/public/index.html', (req,res,next) ->
	if req.session.user
	   next()
	else
	   res.redirect "http://#{req.host}/public/login.html"

app.use '/public/entry.html', (req,res,next) ->
	if req.session.user
	   next()
	else
	   res.redirect "http://#{req.host}/public/login.html"

app.use '/public', express.static __dirname + '/public'
app.use '/favicon.ico', express.static __dirname + '/public/img/favicon.ico'

db.checkOrCreateDB()

#List all categories
app.get '/categories', (req,res) ->
	res.header 'Cache-Control','max-age=10'
	db.getCategories req,res

#List all events ordered by category
app.get '/category', (req,res) ->
	res.header 'Cache-Control','max-age=10'
	db.getCategoryEvents req,res

#List all distinct action types, with their corresponding category
app.get '/actioncategory', (req,res) ->
	res.header 'Cache-Control', 'max-age=10'
	db.getActionCategories req,res

#List all activities
app.get '/activities', (req,res) ->
	res.header 'Cache-Control','max-age=10'
	db.getPagedActivities req,res
		
#Get CSV for a user
app.get '/csv', (req,res) ->
	db.getCommaDelimited req,res

#Get RDF
app.get '/rdf', (req,res) ->
	db.getRDF req,res

#Get a single activity
app.get '/activities/:id', (req, res) ->
	db.getActivity req.params.id,res

#Create an activity
app.post '/activities', (req,res) ->
	# console.log "Received: "
	#console.log req.body
	db.addActivity req,res

#Update an activity
app.put '/activities/:id', (req, res) ->
	#console.log req.body
	db.updateActivity req.body,res

#Allow deletions
app.del '/activities/:id', (req,res) ->
	#console.log req
	db.delActivity req.params.id,res

#Change a category
app.get '/changeCategory/:from/:to', (req,res) ->
	console.log "Change category from #{req.params.from} to #{req.params.to}"
	db.renameCategory(req,res)

#Change an activity
app.get '/changeActivity/:from/:to', (req,res) ->
	console.log "Change activity from #{req.params.from} to #{req.params.to}"
	db.renameAction(req,res)

#Get suggestions
app.get '/suggestions', (req,res) ->
	suggest.suggest(req,res)

app.get '/today', (req,res) ->
	db.getToday req, (dat) ->
		res.send dat

#Moods		
app.get '/mood', (req,res) ->
	db.getMoods req, (dat) ->
		res.send dat

app.post '/mood', (req,res) ->
#	console.log "Received: "
#	console.log req.body
	db.addMood req,res

#Check login username
app.get '/check_un/:un', (req,res) ->
	db.check_un req.params.un, res

#Log in
app.post '/login', (req,res) ->
	#console.log req.body
	db.check_unpw req, res

#Log out
app.get '/logout', (req,res) ->
	console.log "Logout"
	delete req.session.user
	res.clearCookie 'validuser'
	res.redirect "http://#{req.host}/public/login.html"

app.listen 3000
