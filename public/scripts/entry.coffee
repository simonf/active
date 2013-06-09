$ ->
	#Code below here gets run when the page loads (jQuery on-document-ready stuff)
	
	# Set up login info
	$('#logged-in-username').empty()
	if not CookieChecker.isLoggedIn()
		$('#logged-in-username').append("no-one")
	else
		$('#logged-in-username').append(CookieChecker.getUserName())
	
	#Create an object to hold autocompletion data
	SFLocals = {
		actions: [],
		categories: [],
		matchedActionCategories: [],
		setDay: (nd) ->
			$('#when-in').val(nd.toString('dd-MMM'))
			$('#upAt').val(nd.getTime())
	}
	# Populate it from the database
	SimpleClient.fetchCategoriesAndActionsForUser (dat) ->
		for row in dat
			SFLocals.actions.push row.key[1] if SFLocals.actions.indexOf(row.key[1]) == -1
			SFLocals.categories.push row.key[2] if SFLocals.categories.indexOf(row.key[2]) == -1
			SFLocals.matchedActionCategories.push [row.key[1],row.key[2]]
	#Bind some autocompletion events for jQueryUI
		$('#action-in').inlineComplete {terms: SFLocals.actions}
		$('#category-in').inlineComplete {terms: SFLocals.categories}
		$('#action-in').blur ->
			poss = hit[1] for hit in SFLocals.matchedActionCategories when hit[0] == $('#action-in').val()
			$('#category-in').val poss if poss && poss.length > 0
			return
		# $('#category-in').blur ->
		# 	$('#quantity-in').val listView.collection.getDefaultForCombo $('#category-in').val(), $('#action-in').val()
		# 	return
		return

	# Bind some navigation events
#	$('#logout-link').on 'click', ->
#		CookieChecker.clearUserName()
#		CookieChecker.checkLogin()
#		return
	# Treat <Enter> keypress in any form input field the same as clicking on the "Add item" button
	$('.submit-on-enter').on 'keypress', (e) ->
		if (e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)
			$('form').submit()
			$('#action-in').focus()
			return false
		else
			return true
		return
	# Add datepicker to the input field
	$('#otherdt').datepicker({ dateFormat: "yyyy-mm-dd" })
	# Set default date to today
	$('#otherdt').val SFUtils.dayNow()
	#Set up radio button actions
	$("input:radio").on 'change', (e) ->
		ty = $("input:radio:checked").val()
		ds = SFUtils.dayYesterday()
		ds = SFUtils.dayNow() if ty == 'today'
		$('#otherdt').val ds

	$('button.default-button').on 'click', (e) ->
		$('#action-in').focus()

	# Submit action
	$('form').on 'submit', () ->
		js = $(this).serializeArray()
		$.post '/activities', js, (data,status) ->
			console.log "#{status}: #{data}"
			$('#action-in').val ''
			$('#category-in').val ''
			$('#quantity-in').val ''
		return false

	# Set initial focus to the first field in the form
	$('#action-in').focus()
