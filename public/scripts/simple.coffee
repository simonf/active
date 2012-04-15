root = exports ? this

root.SimpleClient = {
	fetchEventsForUser: (limit) ->
		url='/activities'
		url += '?limit='+limit if(limit)
		$.get(url,(dat) ->
			for row in dat
				rv = '<div class="item-row"><span class="item-dt">' + new Date(parseInt(row.value.updatedAt)).toString('dd-MMM')+'</span>'
				rv += '<span class="item-action">'+ row.value.action + '</span>'
				rv += '<span class="item-category">' + row.value.category + '</span>'
				rv += '<span class="item-qty">'+ row.value.quantity + ' '+row.value.units+'</span></div>'
				$('#list').append(rv)
		)
	,
	fetchCategoriesAndActionsForUser: ->
		url='/actioncategory'
		$.get(url,(dat) ->
			for row in dat
				console.log row.key[1]
		)
	,
	postNewActivity: (a, c, q, u) ->
		$.post('/activities',{ action: a, category: c, quantity: q, units: u })
}
