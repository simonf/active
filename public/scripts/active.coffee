$ ->
	#Code below here gets run when the page loads (jQuery on-document-ready stuff)
	
	#Do we have a client side cookie set? If not, redirect to login.html
	#CookieChecker.checkLogin()

	# Set up login info
	$('#logged-in-username').append(CookieChecker.getUserName())
	
	# Define the new view, fetch the first page of content and display it
	listView = new ListView() 
	#Create an object to hold autocompletion data
	SFLocals = {
		actions: [],
		categories: [],
		matchedActionCategories: [],
		setDay: (nd) ->
			$('#when-in').val(nd.toString('dd-MMM'))
			$('#upAt').val(nd.getTime())
		, popCategory: ->
			for cat in SFLocals.categories
				$("#cat_list").append "<option>#{cat}</option>"
		, popActivity: ->
			for act in SFLocals.actions
				$("#act_list").append "<option>#{act}</option>"
	}
	# Populate it from the database
	SimpleClient.fetchCategoriesAndActionsForUser (dat) ->
		for row in dat
			SFLocals.actions.push row.key[1] if SFLocals.actions.indexOf(row.key[1]) == -1
			SFLocals.categories.push row.key[2] if SFLocals.categories.indexOf(row.key[2]) == -1
			SFLocals.matchedActionCategories.push [row.key[1],row.key[2]]
	#Bind some autocompletion events for jQueryUI
#		$('#action-in').autocomplete {source: SFLocals.actions}
		$('#action-in').inlineComplete {terms: SFLocals.actions}
#		$('#category-in').autocomplete {source: SFLocals.categories}
		$('#category-in').inlineComplete {terms: SFLocals.categories}
		SFLocals.popCategory()
		SFLocals.popActivity()
		$('#action-in').blur ->
			poss = hit[1] for hit in SFLocals.matchedActionCategories when hit[0] == $('#action-in').val()
			$('#category-in').val poss if poss && poss.length > 0
			return
		$('#category-in').blur ->
			$('#quantity-in').val listView.collection.getDefaultForCombo $('#category-in').val(), $('#action-in').val()
			return
		return

	# Bind some navigation events
#	$('#logout-link').on 'click', ->
#		CookieChecker.clearUserName()
#		CookieChecker.checkLogin()
#		return
	$('#pre-page').on 'click', ->
		listView.collection.getPrevPage()
	$('#nxt-page').on 'click', ->
		listView.collection.getNextPage();

	#Suggestions
	$('span#bulk_close').on 'click', ->
		$('div#bulk_entry').hide()
		return
	
	$('div.mood_img').on 'click', (e) ->
		el = e.currentTarget
		nm = el.attributes["id"].value
		n = parseInt(nm.substr(4,1))
		cursel = $(el).hasClass('selected_star')
		if cursel
			for i in [1..5]
				nm="div#star"+i
				$(nm).addClass("empty_star")
				$(nm).removeClass("selected_star")
		else
			for i in [1..n]
				nm="div#star"+i
				$(nm).addClass("selected_star")
				$(nm).removeClass("empty_star")
		return


	$('button#mood_submit').on 'click', (e) ->
		cnt = 0
		$('div.mood_img').each (ndx) ->
			cnt += 1 if $(this).hasClass('selected_star')
		SimpleClient.saveMood cnt, (data) ->
			if not parseInt(data) is 200 and not data is "OK"
				alert data
			else
				for i in [1..5]
					nm="div#star"+i
					$(nm).addClass("empty_star")
					$(nm).removeClass("selected_star")
			return
		return

	$('button#calc-daily').on 'click', (e) ->
		DoBulk.showSuggestions()
		return

	$('button#bulk_submit').on 'click', (e) ->
		DoBulk.saveSuggestions()
		return false

	$('#new-item-form').on 'submit', (e) ->
		e.preventDefault()

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
	SimpleClient.getMood 300, (dat) ->
		for d in dat 
			nm = "<img class='mooddatum' src='/public/img/#{d.value}.png'>"
			$("#recentmood").append(nm)
