db = require('./couch-calls')

root = exports ? this

debug=false

root.suggest = (req,resp) ->
	today=[]
	lastfivedays=[]
	lastthreeweeks=[]
	# separate out today's events
	db.getToday req, (t) ->
		if t is null or t is undefined or t.rows is undefined
			console.log "No actions found for today" if debug is true
		else
			today=uniqueCategoryAction t
			console.log "#{t.rows.length} actions so far today" if debug is true
		db.getLastFiveDays req,(five) ->
			console.log "#{five.rows.length} actions in the last 5 days" if debug is true
			f = uniqueCategoryAction five
			console.log "#{f.length} unique actions" if debug is true
			lastfivedays=removematches today, moreFrequentThan(f,4)
			console.log "#{lastfivedays.length} remain" if debug is true
			makeCandidates resp, lastfivedays
		return
	return

makeCandidates = (resp, catactionobjarray) ->
	vlist=[]
	for ca in catactionobjarray
		vlist.push {"category": ca.key.category, "action":ca.key.action, "quantity": mostFrequent(ca.values), "units": ca.units}
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
	return valarray.filter (x) -> x.count >= num

uniqueCategoryAction = (dat) ->
	caqu = doubleshift dat
	console.log caqu if debug is true
	ucaobjectarray = []
	for item in caqu
		console.log "processing item" if debug is true
		matched = false
		for obj in ucaobjectarray
			if not matched and obj.key.category is item.key[0] and obj.key.action is item.key[1]
				obj.count += 1
				obj.values.push item.key[2]
				obj.units = item.key[3]
				matched = true
		if not matched
			obj = {"key":{"category": item.key[0],"action": item.key[1]}, "count": 1, "values":[item.key[2]],"units": item.key[3]}
			ucaobjectarray.push obj
			console.log "added #{obj}" if debug is true
	return ucaobjectarray
	
	
doubleshift = (dat) ->
	for d in dat.rows
		d.key.shift()
		d.key.shift()
	dat

removematches = (tomatch,list) ->
	if tomatch is null or tomatch.length==0
		console.log "Nothing to match" if debug is true
		return list
	else
		# filter will return true only for items in list that are not in tomatch
		# for each item in list, it returns true to the filter only when there is no matching key in tomatch
		console.log "Filtering #{list.length} unique 5-day entries vs #{tomatch.length} unique entries today" if debug is true
		return list.filter (x) -> (z for z in tomatch when keyEqual(z.key,x.key)).length == 0		
	
keyEqual = (a, b) ->
	if typeof a is 'object' and typeof b is 'object'
		return (a.category is b.category and a.action is b.action)
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