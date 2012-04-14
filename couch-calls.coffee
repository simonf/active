# 
# Uses the following Couch views:
# activity/user-bydate
# activity/distinct_usercategory
# activity/by_usercategory
# 
fs = require('fs')
json = require('./public/lib/json2.min.js')
server = fs.readFileSync 'db.ini', 'utf8'
cradle = require('cradle')
conn =  new(cradle.Connection)(server,5984,{cache: true, raw: false})
database =  conn.database('activities')

root = exports ? this

root.checkOrCreateDB = ->
	database.exists (err,exists) ->
		if err 
			console.log 'error',err
			return
		else if exists
			# console.log 'database already exists'
			updateViews()
			return
		else
			console.log 'database does not exist. Creating it'
			database.create (err,dat) ->
				if err
					console.log err
			updateViews()
			return

areViewsListsDifferent = (localDefinition, dbDefinition) ->
	for viewName of localDefinition.views
		# console.log "Comparing "+viewName
		remView = dbDefinition.views[viewName]
		if typeof remView == 'undefined'
			console.log "New local view: "+viewName
			return true
		locView = localDefinition.views[viewName]
		for methodName in ['map','reduce']
			locMethod = locView[methodName]
			remMethod = remView[methodName]
			if locMethod
				if remMethod
					if locMethod.replace(/[\n\r\t ]/g,'') != remMethod.replace(/[\n\t\r ]/g,'')	
						console.log "Difference between:\n"+locMethod+"\nand\n"+remMethod
						return true
				else # no remote method matches
					console.log 'New local '+methodName+' found'
					return true
	return false

updateViews = (force) ->
	force = typeof force != 'undefined' ? force : false;
	view_id = '_design/activity'
	dd = fs.readFileSync 'view-definitions.json', 'utf8'
	design_doc = JSON.parse(dd)
	database.get view_id, (err,dat) ->
		if err
			console.log err
			database.save view_id, design_doc
			console.log "Created views"
			return
		else
			id = dat._id;
			rev = dat._rev;
			delete dat._id;
			delete dat._rev;		
			# console.log "Views already exist. Checking..."
			if areViewsListsDifferent design_doc, dat
				console.log "Some missing or outdated views. Updating"
				database.save id, rev, design_doc
			else
				console.log "Views OK."
			return
	return

root.addActivity = (activity, resp) ->
	activity.type = 'activity'
	activity.updatedAt = new Date().getTime.toString if activity.updatedAt == undefined
	activity.user = 'simon' if activity.user == undefined
	database.save(activity, (err,res) -> 
		if (err)
			console.log(err)
			return
		else 
			resp.send {id: res.id}
			return
	)
	return

root.updateActivity = (activity, resp) ->
	id=activity.id
	database.get(id, (err,dat) ->
		if(err)
			console.log err
			return
		else
			rev = dat._rev
			delete activity.id
			activity.updatedAt = new Date().getTime.toString if activity.updatedAt == undefined
			activity.user = 'simon' if activity.user == undefined
			activity.type = 'activity'
			database.save id, rev, activity, (err,res) ->
				if(err)
					console.log err
					return
				else
					resp.send 200
					return
	)
	return

root.getActivity = (id, resp) ->
	database.get id, (err,dat) ->
		if err
			resp.send JSON.stringify err
		else
			resp.send dat
		return
	return

root.getPagedActivities = (req,resp) ->
	usr = req.cookies.get('user')
	options = {descending: true} 
	console.log req.query
	options.limit = req.query.limit if req.query.limit
	options.endkey = [usr]
	options.startkey = [usr,{}]
	options.startkey = [usr,req.query.startkey] if req.query.startkey
	console.log(options)
	database.view 'activity/user-bydate', options, (err, dat) ->
		if err
			console.log err
			resp.send JSON.stringify err
		else
			console.log dat.length
			if dat.length>0
				console.log dat[0].key
				console.log dat[dat.length-1].key
			resp.send dat
		return
	return

root.getCategories = (resp) ->
	usr = resp.cookies.get('user')
	options = {group: true, startkey: [usr], endkey: [usr,{}]}
	database.view 'activity/distinct_usercategory',options, (err,dat) ->
		if err
			resp.send JSON.stringify err
		else
			console.log dat
			resp.send dat
		return
	return

root.getCategoryEvents = (req,resp) ->
	options = {}
	console.log req.query
	usr = req.cookies.get('user')
	options.key = [usr,req.query.key] if(req.query.key) 
	database.view 'activity/by_usercategory', options, (err, dat) ->
		if err
			resp.send JSON.stringify err
		else
			console.log dat.length
			if dat.length>0
				console.log dat[0].key
				console.log dat[dat.length-1].key
			resp.send(dat);
		return
	return

root.getActionCategories = (req,resp) ->
	usr = resp.cookies.get('user')
	options = {group: true, startkey: [usr], endkey: [usr,{}]}
	console.log req.query
	database.view 'activity/distinct_useractioncategory',options, (err,dat) ->
		if err
			resp.send JSON.stringify err
		else
			console.log dat
			resp.send dat
		return
	return

root.delActivity = (id, resp) ->
	database.get id, (err,dat) ->
		if err
	    	resp.send {error: err},404
		else
	    	database.remove id,dat._rev,(err,dat) ->
				if err
					resp.send {error: err},404
				else
					resp.send 204
				return
		return
	return

root.check_un = (un, resp) ->
	database.get 'users', (err,dat) ->
		if err
			resp.send {error: err},404
		else
			for usr in dat.users
				if usr.un == un
					resp.send 200 
					return
			resp.send 404
		return
	return

root.check_unpw = (req, resp) ->
	console.log 'Logging in'
	database.get 'users', (err,dat) ->
		if err
			console.log 'error in db'
			resp.send {error: err},404
		else
			console.log 'Trying '+req.body.un + '/' + req.body.pw
			for usr in dat.users
				console.log 'checking ' + usr.toString()
				if usr.un == req.body.un && usr.pw == req.body.pw
					# sess = req.session
					# sess.user = usr.un
					resp.cookies.set('user',usr.un,{httpOnly: false})
					console.log 'login ok'
					resp.redirect('/public/index.html')
					return
			console.log 'no matching user'
			resp.send 404
		return
	return
			
