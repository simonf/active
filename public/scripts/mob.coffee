$ ->
	#Code below here gets run when the page loads (jQuery on-document-ready stuff)
	
	#Do we have a client side cookie set? If not, redirect to login.html
	CookieChecker.checkLogin()

	# Set up login info
	# $('#logged-in-username').append(CookieChecker.getUserName())
	
	#Some local vars
	SFLocals = {
		actions: [],
		categories: [],
		matchedActionCategories: [],
		setDay: (nd) ->
			$('#when-in').val(nd.toString('dd-MMM'))
			$('#upAt').val(nd.getTime())
	}

	SFLocals.setDay SFUtils.todayMidday()
	
	SimpleClient.fetchCategoriesAndActionsForUser (dat) ->
		for row in dat
			SFLocals.actions.push row.key[1] if SFLocals.categories.indexOf(row.key[1]) == -1
			SFLocals.categories.push row.key[2] if SFLocals.categories.indexOf(row.key[2]) == -1
			SFLocals.matchedActionCategories.push [row.key[1],row.key[2]]
		#Bind some autocompletion events for jQueryUI
		$('#action-in').autocomplete {source: SFLocals.actions}
		$('#category-in').autocomplete {source: SFLocals.categories}
		$('#action-in').blur ->
			poss = hit[1] for hit in SFLocals.matchedActionCategories when hit[0] == $('#action-in').val()
			$('#category-in').val poss if poss && poss.length > 0
			return
		return

	SimpleClient.fetchEventsForUser 10, (row) ->
		rv = '<div class="item-row"><span class="item-dt">' + new Date(parseInt(row.updatedAt)).toString('dd-MMM')+'</span>'
		rv += '<span class="item-action">'+ row.action + '</span>'
		rv += '<span class="item-category">' + row.category + '</span>'
		rv += '<span class="item-qty">'+ row.quantity + ' '+row.units+'</span></div>'
		$('#list').append(rv)
	
	#Manage date radio buttons
	$('#today-button').on 'change', ->
		nd = SFUtils.todayMidday()
		SFLocals.setDay nd

	$('#yesterday-button').on 'change', ->
		nd = SFUtils.yesterdayMidday()
		SFLocals.setDay nd
	
	# Treat <Enter> keypress in any form input field the same as clicking on the "Add item" button
	$('#new-item-form').on 'submit', (e) ->
		e.preventDefault()
		r = SFUtils.splitNumbersAndUnits $('#quantity-in').val()
		$.post '/activities', { 
			action: $('#action-in').val(), 
			category: $('#category-in').val(),
			quantity: r.num,
			units: r.units,
			updatedAt: $('#upAt').val()
			},
			(data) ->
				alert("Data Loaded: " + data)
		return false

	# Set initial focus to the first field in the form
	$('#action-in').focus()
