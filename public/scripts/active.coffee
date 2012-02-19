$ ->
	#listCollection = null
	# Backbone model for individual entries

	#Code below here gets run when the page loads (jQuery on-document-ready stuff)
	
	# Define the new view, fetch the first page of content and display it
	listView = new ListView() 
	#Bind some autocompletion events for jQueryUI
	$('#action-in').autocomplete {source: listView.actionMatcher.values}
	$('#category-in').autocomplete {source: listView.categoryMatcher.values}
	# Bind some navigation events
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
	# Set initial focus to the first field in the form
	$('#action-in').focus()
