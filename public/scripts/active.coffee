$ ->
	#Code below here gets run when the page loads (jQuery on-document-ready stuff)
	
	#Do we have a client side cookie set? If not, redirect to login.html
	CookieChecker.checkLogin()

	# Set up login info
	$('#logged-in-username').append(CookieChecker.getUserName())
	
	# Define the new view, fetch the first page of content and display it
	listView = new ListView() 
	#Bind some autocompletion events for jQueryUI
	# $('#action-in').autocomplete {source: listView.actionMatcher.values}
	# $('#category-in').autocomplete {source: listView.categoryMatcher.values}
	SFLocals = {
		actions: [],
		categories: [],
		matchedActionCategories: [],
		setDay: (nd) ->
			$('#when-in').val(nd.toString('dd-MMM'))
			$('#upAt').val(nd.getTime())
	}

	SimpleClient.fetchCategoriesAndActionsForUser (dat) ->
		for row in dat
			SFLocals.actions.push row.key[1] if SFLocals.actions.indexOf(row.key[1]) == -1
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

	# Bind some navigation events
	$('#logout-link').on 'click', ->
		CookieChecker.clearUserName()
		CookieChecker.checkLogin()
		return
	$('#pre-page').on 'click', ->
		listView.collection.getPrevPage()
	$('#nxt-page').on 'click', ->
		listView.collection.getNextPage();
	# Treat <Enter> keypress in any form input field the same as clicking on the "Add item" button
	$('.submit-on-enter').on 'keypress', (e) ->
		if (e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)
			$('button.default-button').click()
			$('#action-in').focus()
			return false
		else
			return true
		return
	# Add datepicker to the input field
	$('#ts-in').datepicker({ dateFormat: "yy-mm-dd" })
	# Set initial focus to the first field in the form
	$('#action-in').focus()
