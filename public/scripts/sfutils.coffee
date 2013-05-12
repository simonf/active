root = exports ? this

root.SFUtils = {

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
	
};



#  var tests=["    3.4   hours ", "1minute", "50.0secs  ", "    03:00:00","1"];
#  for(var i=0;i<tests.length;i++) {
#   console.log(SFUtils.splitNumbersAndUnits(tests[i]));
#  }