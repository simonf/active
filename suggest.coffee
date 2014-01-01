db = require('./couch-calls')

root = exports ? this

root.suggest = (req,resp) ->
	today=[]
	lastfivedays=[]
	lastthreeweeks=[]
	# separate out today's events
	db.getToday req, (t) ->
		if t is null or t is undefined
			console.log "No actions found for today"
		else
			today=t
			# console.log "#{t.length} actions so far today"
		db.getLastFiveDays req, true, (five) ->
			lastfivedays=removematches today, moreFrequentThan(five.rows,4)
			makeCandidates req, resp, lastfivedays
	return

makeCandidates = (req, resp, catactionarray) ->
	db.getLastFiveDays req, false, (items) ->
		vlist=[]
		for ca in catactionarray
			values=[]
			units="" 
			for item in items
				if arrayEqual(ca, item.key)
					values.push item.value[0]
					units=item.value[1]
			vlist.push {"category": ca[0], "action":ca[1], "quantity": mostFrequent(values), "units": units}
		resp.send vlist
	return

mostFrequent = (valarray) ->
	rv = {}
	max = 0
	maxv = ""
	for val in valarray
		if rv[val] is undefined
			rv[val]=1
		else
			rv[val] = rv[val]+1
		if rv[val] > max
			max = rv[val]
			maxv = val
	return maxv

moreFrequentThan = (valarray,num) ->
	retval = []
	for v in valarray
	    retval.push v.key if v.value >= num
	return retval

normalisevalues = (keyvaluearray) ->
	(item.value for item in keyvaluearray)

removematches = (tomatch,list) ->
	if tomatch is null or tomatch.length==0
		# console.log "Nothing to match"
		return list
	else
		# filter will return true only for items in list that are not in tomatch
		# console.log "Filtering"
		return list.filter (x) -> (z.key for z in tomatch when arrayEqual z.key, x).length == 0		
	
arrayEqual = (a, b) ->
	if typeof a is 'object' and typeof b is 'object'
		return (a.length is b.length and a.every (elem, i) -> elem is b[i])
	else
		# console.log a
		console.log "Can't match values that are not arrays: #{a}, #{b}"
		return false
	
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