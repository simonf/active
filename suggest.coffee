db = require('./couch-calls')

root = exports ? this

root.suggest = (req,resp) ->
	today=[]
	lastfivedays=[]
	lastthreeweeks=[]
	# separate out today's events
	db.getToday req, (t) ->
		today=t
		db.getLastFiveDays req, (five) ->
			lastfivedays=removematches today, normalisevalues(five)
			resp.send makeCandidates lastfivedays
	return

makeCandidates = (catactionarray) ->
	retval = []
	for item in catactionarray
		u=""
		for k, v of item
			if k != 'unit'
				for kk, vv of v
			        category = k
					action = kk
					if vv.length > 2
						retval.push { "category": category, "action": action, "quantity": mostFrequent(vv), "units": item["unit"]}
	return retval

mostFrequent = (valarray) ->
	rv={}
	max = 0
	maxv = ""
	for v in valarray
	    rv[v] = (if rv[v] is undefined then 1 else rv[v]+1)
	    if rv[v] > max
	       max = rv[v]
	       maxv = v
	return maxv

normalisevalues = (keyvaluearray) ->
	(item.value for item in keyvaluearray)

removematches = (tomatch,list) ->
	list.filter (x) -> (z.k for z in tomatch when arrayEqual z.k, x.k).length == 0		
	
arrayEqual = (a, b) ->
	a.length is b.length and a.every (elem, i) -> elem is b[i]
	
todayStartAsMillis = ->
	d=new Date()
	d.setUTCHours(0)
	d.setMinutes(0)
	d.setSeconds(0)
	d.setMilliseconds(0)
	return d.getTime()

todayMidnightAsMillis = ->
	d=new Date()
	d.setUTCHours(23)
	d.setMinutes(59)
	d.setSeconds(59)
	d.setMilliseconds(0)
	return d.getTime()

uniqueDateString = (timeString) ->
	d = new Date(parseInt(timeString))
	return d.getFullYear()+d.getMonth()+d.getDate()