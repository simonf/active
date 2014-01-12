root = exports ? this

root.SimpleClient = {	
	fetchEventsForUser: (limit, rowDrawFunc) ->
		url='/activities'
		url += '?limit='+limit if(limit)
		$.get url,(dat) ->
			for row in dat
				rowDrawFunc(row.value)
		return
	,
	fetchCategoriesAndActionsForUser: (handleDataFunc)->
		url='/actioncategory'
		$.get url,(dat) ->
			handleDataFunc(dat)
		return
	,
	postNewActivity: (a, c, q, u, t, o, loc, callback) ->
		posting = $.post('/activities',{ action: a, category: c, quantity: q, units: u, updatedAt: t, user: o, location: loc },)
		posting.done (data) ->
			callback data
			return
		posting.fail (data) ->
			alert data
			return
		return
	,
	getSuggestions: (handleDataFunc) ->
		url='/suggestions'
		$.get url,(dat) ->
			handleDataFunc(dat)
			return
		return
	,
	saveMood: (cnt, callback) ->
		posting = $.post('/mood',{mood: cnt})
		posting.done (data) ->
			callback data
			return
		posting.fail (data) ->
			alert data
			return
		return
	,
	getMood: (lim, callback) ->
		jQuery.get "/mood?limit=#{lim}", (dat) ->
			callback dat
			return
		return

}

