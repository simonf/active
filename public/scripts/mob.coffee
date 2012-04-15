$ ->
	#Code below here gets run when the page loads (jQuery on-document-ready stuff)
	
	#Do we have a client side cookie set? If not, redirect to login.html
	CookieChecker.checkLogin()

	# Set up login info
	# $('#logged-in-username').append(CookieChecker.getUserName())
	
	#Bind some autocompletion events for jQueryUI
	# $('#action-in').autocomplete {source: listView.actionMatcher.values}
	# $('#category-in').autocomplete {source: listView.categoryMatcher.values}

	SimpleClient.fetchCategoriesAndActionsForUser()
	SimpleClient.fetchEventsForUser(10)
	# Treat <Enter> keypress in any form input field the same as clicking on the "Add item" button
	$('.submit-on-enter').on 'keypress', (e) ->
		if (e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)
			$('button.default-button').click()
			$('#action-in').focus()
			return false
		else
			return true
		return
	# Set initial focus to the first field in the form
	$('#action-in').focus()
