root = exports ? this

root.SFUtils = {

	currentLocation : null,
	
	splitNumbersAndUnits : (anInput) ->		
		if anInput 
			myInput = anInput.trim()
			if myInput.length > 0
				arr = myInput.split(' ');
				if (arr.length > 1)
					arr[0]=this.trim(arr[0])
					arr[1]=this.trim(arr[1])
					parsedNumber = parseFloat("0"+arr[0])
					if(parsedNumber && parsedNumber.toString == arr[0])
						return {num: parsedNumber, units: arr[1]}
					else
						return {num: arr[0], units: arr[1]}
			
				else
					return  { num: myInput, units: ''}
		return {num: '', units: ''}
	,
	
	trim : (charString) ->
		frontTrimmed = charString.replace(/^\s*/,'')
		return frontTrimmed.replace(/\s*$/,'')
	,
	
	setCaretPosition: (ctrl, pos) ->
		if(ctrl.setSelectionRange)
			ctrl.focus();
			ctrl.setSelectionRange(pos,pos)
		else if (ctrl.createTextRange)
			range = ctrl.createTextRange()
			range.collapse(true)
			range.moveEnd('character', pos)
			range.moveStart('character', pos)
			range.select()
		return
	,
	
	yesterdayTimestamp: ->
		return (new Date().getTime()-86400000).toString()
	,
	
	todayMidday: ->
		d=new Date()
		d.setUTCHours(12)
		d.setMinutes(0)
		d.setSeconds(0)
		d.setMilliseconds(0)
		return d
	,
	
	yesterdayMidday: ->
		d=new Date()
		d.setTime(d.getTime()-24*3600*1000)
		d.setUTCHours(12)
		d.setMinutes(0)
		d.setSeconds(0)
		d.setMilliseconds(0)
		return d
	,

	dayNow: ->
		d=new Date()
		"#{d.getFullYear()}-#{d.getMonth()+1}-#{d.getDate()}"
	,

	dayYesterday: ->
		d1=new Date()
		dv = d1.getTime() - (24 * 3600 * 1000)
		d = new Date(dv)
		"#{d.getFullYear()}-#{d.getMonth()+1}-#{d.getDate()}"
	,

	timeNow: ->
		d = new Date()
		h = d.getHours()
		m = d.getMinutes()
		if m<10 
			return "#{h}:0#{m}"
		else
			return "#{h}:#{m}"

	
	DoubleMatcher: -> {
		h: {},
		
		makeMatches: (coll,va1, va2) ->
			that = this
			_.each(coll, (it) ->
				v = $.trim(it.get(va2))
				k = $.trim(it.get(va1))
				if(k && k.length >0) 
					that.h[k]=v
			)
			return
		,
		listAll: ->
			_.each(h, (n) ->
				console.log(n)
			)
			return
		,
		match: (srcInputElement, destInputElement) ->
			k = $(srcInputElement).val()
			if(k && k.length>0) 
				v=this.h[k]
			if(v && v.length>0) 
				$(destInputElement).val(v)
			return
	},
	ListOfValues: -> {
		values: [],
		
		makeMatches: (coll,va) ->
			that = this
			bbone_model_group=_.groupBy(coll, (it) ->
				return $.trim(it.get(va))
			)
			keyvalues = _.keys(bbone_model_group)
			that.values = _.sortBy(keyvalues, (kv) ->
				return kv
			)
			return
		,
		listAll: ->
			_.each(values, (n) ->
				console.log(n)
			)
			return
	},

	MostFrequent: (numarray) -> 
		hash = {}
		maxEl = numarray[0]
		maxCnt = 1
		for num in numarray
			ns = num.toString()
			if typeof hash[ns] == 'undefined'
				hash[ns] = 1
			else
				hash[ns] += 1
			if hash[ns] > maxCnt
				maxEl = num
				maxCnt = hash[ns]
		return maxEl
	,
	
	rememberLocation: ->
		SFUtils.calcLocation (loc) ->
			SFUtils.currentLocation = loc
	,
	
	calcLocation: (callback) ->
		if navigator.geolocation
			navigator.geolocation.getCurrentPosition \
				( (position) -> callback position.coords.latitude + "," + position.coords.longitude ) ,\
				( (error) ->
					if error.code is error.PERMISSION_DENIED
						console.log "User denied the request for Geolocation."
					else if error.code is error.POSITION_UNAVAILABLE
						console.log "Location information is unavailable."
					else if error.code = error.TIMEOUT
						console.log "The request to get user location timed out."
					else console.log "An unknown error occurred."
					callback null
				) 
		return

	,

	escapeHTML: (s) ->
        String(s).replace(/&(?!\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

};


#  var tests=["    3.4   hours ", "1minute", "50.0secs  ", "    03:00:00","1"];
#  for(var i=0;i<tests.length;i++) {
#   console.log(SFUtils.splitNumbersAndUnits(tests[i]));
#  }