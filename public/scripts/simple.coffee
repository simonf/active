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
	postNewActivity: (a, c, q, u, t) ->
		$.post('/activities',{ action: a, category: c, quantity: q, units: u, updatedAt: t })
		return
}

