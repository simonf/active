$ ->
	#Code below here gets run when the page loads (jQuery on-document-ready stuff)
	
	#Do we have a client side cookie set? If not, redirect to login.html
	#CookieChecker.checkLogin()

	# Set up login info
	$('#logged-in-username').append(CookieChecker.getUserName())
	
	#Create an object to hold autocompletion data
	SFLocals = {
		actions: [],
		categories: []
		, refreshLookups: ->
			SFLocals.actions=[]
			SFLocals.categories=[]
			SimpleClient.fetchCategoriesAndActionsForUser (dat) ->
				for row in dat
					SFLocals.actions.push row.key[1] if SFLocals.actions.indexOf(row.key[1]) == -1
					SFLocals.categories.push row.key[2] if SFLocals.categories.indexOf(row.key[2]) == -1
				SFLocals.popCategory()
				SFLocals.popActivity()
			return			
		, popCategory: ->
			$("#category-from").empty()
			for cat in SFLocals.categories
				$("#category-from").append "<option>#{cat}</option>"
		, popActivity: ->
			$("#activity-from").empty()
			for act in SFLocals.actions
				$("#activity-from").append "<option>#{act}</option>"
	}

	SFLocals.refreshLookups()

	$('#cat-button').on 'click', ->
		vf = $('#category-from').val()
		vt = $('#category-to').val()
		url = "/changeCategory/"+vf+"/"+vt
		$.get(url, 
				(dat,stat) ->
					if stat == 'success'
						msg = "<p>Updated #{dat.matchcnt} records from category #{vf} to #{vt} with #{dat.errcnt} errors</p>"
					else
						msg = "<p>Error: #{dat.errmsg}"
					$("#cat-msg").append msg
					SFLocals.refreshLookups()
				,"json")

	$('#act-button').on 'click', ->
		vf = $('#activity-from').val()
		vt = $('#activity-to').val()
		url = "/changeActivity/"+vf+"/"+vt
		$.get(url, 
				(dat,stat) ->
					if stat == 'success'
						msg = "<p>Updated #{dat.matchcnt} records from action #{vf} to #{vt} with #{dat.errcnt} errors</p>"
					else
						msg = "<p>Error: #{dat.errmsg}"
					$("#act-msg").append msg
					SFLocals.refreshLookups()
				,"json")

	return
	