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
	postNewActivity: (a, c, q, u, t, o, callback) ->
		posting = $.post('/activities',{ action: a, category: c, quantity: q, units: u, updatedAt: t, user: o },)
		posting.done (data) ->
			callback data
		posting.fail (data) ->
			alert data
		return
	,
	getSuggestions: (handleDataFunc) ->
		url='/suggestions'
		$.get url,(dat) ->
			handleDataFunc(dat)
		return
	,
	saveMood: (cnt) ->
		url='/mood'
		$.post('/mood',{mood: cnt})
		return
}

