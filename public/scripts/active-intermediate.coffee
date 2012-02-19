$ ->
	listCollection = null
	# Backbone model for individual entries
	Item = Backbone.Model.extend {
		#Default values are almost never used XXX CHECK XXX
		defaults: {
			action: 'Something',
			category: 'General',
			quantity: 0,
			units: 'hours',
			updatedAt: new Date().getTime().toString()
		},
		dateAsString: ->
			ua = this.get 'updatedAt'
			if ua.indexOf("1")==0
				r1 = new Date(parseInt(ua)).toString('d-MMM-yy HH:mm')
				return r1 if(r1 && r1 != 'undefined') 
			if ua.indexOf("2")==0
				# it's actually a string in iso 8601 format. Parse and munge.
				dd = ua.split 'T'
				if dd.length == 2
					t1=dd[0].split '-'
					dy=t1[0].substring(2)
					dm=t1[1]
					d=t1[2]
					t2=dd[1].split ':'
					th=t2[0]
					tm=t2[1]
					return d+'-'+dm+'-'+dy+' '+th+':'+tm
			return ua if (typeof ua) == 'string'
			return ua.toString()
	}
	
	# Backbone view for displaying Items
	ItemView = Backbone.View.extend {
		# name of (orphan) root tag in this.el
		tagName: 'div',
		# classname for the element
		className: 'inner-row',
		# Bind some other events, this time DOM ones
		events: {
				"click .item-delete" : "deleteMe",
				"dblclick" : "editMe"
		},
		# Called on creation
		initialize: ->
			# ensure that "this" refers to the instance of ItemView in the named functions, regardless of where they are called from
			_.bindAll this,'render','editMe','deleteMe' # see comment on ListView. Make "this" sensible in render()
			# bind some Backbone model events to functions in this object
			this.model.bind 'change', this.render, this
			this.model.bind 'destroy', this.remove, this
			return
		,
		# Using a template, write some HTML for each item
		# return this to allow chaining - i.e. allow appendItem below to call itemView.render().el
		render: ->
			item_html = _.template $('#item-templ').html()
			$(this.el).html item_html {model: this.model}
			return this 
		,
		# Called when a model object is destroyed: remove it from the DOM
		remove: ->
			$(this.el).remove()
			return
		,
		# Called when the user clicks on a delete button. Note the model destroy event will call our remove function
		deleteMe: ->
			this.model.destroy {error: (model,response) -> console.log "Failed to destroy "+model.id; }
			return
		,
		#Called when the user double clicks an element. Use a different template to show an in-place edit form
		editMe: ->
			edit_html = _.template $('#item-edit').html()
			$(this.el).html edit_html {item: this.model}
			return
	}

	#Backbone collection for managing a list of items
	List = Backbone.Collection.extend {
		model: Item,
		# The URL that will be called by default to populate the collection
		url: '/activities?limit=25',
		#Called on creation
		initialize: ->
			# Ensure the value of "this" is correct in these functions
			_.bindAll this,'updatePageNumberInfo','getNextPage','getPrevPage'
			return
		,
		# Called by Backbone after a collection has been fetched from the server
		parse: (response) ->
			#console.log response
			# The JSON returned by the server is just a pass-through from Couch. It wraps an array around each Item, which is an object containing id and row attributes
			retval = _(response).map (row) ->
				return {
					id: row.id, 
					action: row.value.action, 
					category: row.value.category,
					quantity: row.value.quantity,
					units: row.value.units,
					updatedAt: row.value.updatedAt
				}
			
			# parse the start id and the last id from the response and remember them in the pageInfo structure
			this.pageInfo.pageStartKeys[this.pageInfo.tgtPage] = response[0].key
			this.pageInfo.pageStartKeys[this.pageInfo.tgtPage+1] = response[response.length-1].key
			return retval
		,
		# ...and here is the pageInfo structure.
		pageInfo: {
			rowsPerPage: 25,
			currentPageNum: 0,
			# store the id of the first item on each page, for rapid retrieval later
			pageStartKeys: [],
			tgtPage: 0
		},
		# called just before drawing the collection
		updatePageNumberInfo: ->
			this.pageInfo.currentPageNum = this.pageInfo.tgtPage
			return
		,
		# called when the user clicks next page link
		getNextPage: (view) ->
			pn = this.pageInfo.currentPageNum
			psk = this.pageInfo.pageStartKeys
			# fetch a page starting with a particular id if we know what it is
			if psk.length > pn + 1
				this.url='/activities?limit='+this.pageInfo.rowsPerPage+'&startkey='+psk[pn+1] 
			else 
				this.url='/activities?limit='+this.pageInfo.rowsPerPage
			this.pageInfo.tgtPage = pn+1 #so we will cache the retrieved startkey in the right place
			this.fetch { 
				success: ->
					listCollection.updatePageNumberInfo() # note we refer to listCollection because of visibility issues
					listCollection.trigger 'draw'
				}
			return
		,
		# called when the user clicks previous page link
		getPrevPage: (view) ->
			pn = this.pageInfo.currentPageNum
			psk = this.pageInfo.pageStartKeys
			# fetch a page starting with a particular id if we know what it is
			if pn > 0 
				this.url='/activities?limit='+this.pageInfo.rowsPerPage+'&startkey='+psk[pn-1]
			else
				this.url='/activities?limit='+this.pageInfo.rowsPerPage
			this.pageInfo.tgtPage = pn -1 #so we will cache the retrieved startkey in the right place
			this.fetch { 
				success: ->
					listCollection.updatePageNumberInfo()
					listCollection.trigger('draw')
			}
			return
	}

	# Backbone view for drawing the collection
	ListView = Backbone.View.extend {
		# attach the view to the main div
		el: $('#main'),
		# Only called once per page load
		initialize: ->
			# Ensure "this" means what it should mean in the following functions
			_.bindAll this,'render', 'addItem', 'appendItem', 'prependItem', 'updateItem'
			# create a holder for the list of items
			this.collection = new List()
			# give it a name visible "globally"
			listCollection = this.collection
			# whenever an item is added to the collection, call prependItem
			this.collection.bind 'add', this.prependItem
			# whenever the list of items receives the draw event, go ahead and draw the items
			this.collection.bind 'draw',this.render
			# When the page has loaded, fetch the initial set of Items
			this.collection.fetch {
				success: ->
					listView.render()
			}
			return
		,
		# Draw an item àt the end of the DOM element: called after loading a new set of items
		appendItem: (item) ->
			itemView = new ItemView {
				model: item
			}
			# the second (context) parameter in the jQuery selector call has to be a node 
			# (set in the el: assignment, above), NOT just a selector string
			$('#table-body', this.el).append itemView.render().el
			return
		,
		# Draw an item at the top of the DOM list element: called when the user has added something
		prependItem: (item) ->
			itemView = new ItemView {
				model: item
			}
			# the second (context) parameter in the jQuery selector call has to be a node 
			# (set in the el: assignment, above), NOT just a selector string
			$('#table-body', this.el).prepend itemView.render().el
			return
		,
		# An object used to do autocompletion on actions
		actionMatcher: new ListOfValues(),
		# An object used to do autocompletion on categories
		categoryMatcher: new ListOfValues(),
		# An object used to find the most likely value for a category after entering an action 
		doubleMatcher: new DoubleMatcher(),
		# Draw the list
		render: ->
			# for each element in models, call the appendItem function
			# render() is called as the page is loaded.
			$('#table-body',this.el).empty();
			_(this.collection.models).each (item) ->
				this.appendItem(item)
			, this
			#also at page load, we extract lists of values for categories and actions
			# this one is to match categories to selected actions
			this.doubleMatcher.makeMatches this.collection.models,'action','category'
			$('#action-in').blur(->
				listView.doubleMatcher.match $('#action-in'), $('#category-in')
			)
			#this one powers category autocomplete functionality
			this.categoryMatcher.makeMatches this.collection.models,'category'
			$('#category-in').autocomplete 'option','source',this.categoryMatcher.values
			#this one powers action autocomplete functionality
			this.actionMatcher.makeMatches this.collection.models,'action'
			$('#action-in').autocomplete 'option','source',this.actionMatcher.values
			return
		,
		# Clear the input form
		clearInput: ->
			$('#action-in').val('')
			$('#category-in').val('')
			$('#quantity-in').val(' ')
			return
		,
		# Add a new item based on what is in the input form
		addItem: ->
			item = new Item()
			#parse input field for quantity and units
			qu = SFUtils.splitNumbersAndUnits $('#quantity-in').val()
			inputaction = $('#action-in').val()
			# We must have an action, even if nothing else.
			if inputaction
				item.set {
					action: inputaction,
					category: $('#category-in').val(),
					quantity: qu.num,
					units: qu.units
				}
				this.clearInput()
				this.collection.add(item) # results in a call to appendItem (bound in initialize, above)
				item.save()
			return
		,
		# Update an item's values after editing. Called on keypress in any edit field
		updateItem: (e) ->
			#Ignore if the user did not hit return
			return if (!e || e.keyCode != 13)
			tid = $('#id-edit').html() # id of object in the collection
			mod = this.collection.get(tid) # model to change
			qty = $('#quantity-edit').val() # new value for quantity
			qu = SFUtils.splitNumbersAndUnits(qty)
			act = $('#action-edit').val() # new value for action
			cat = $('#category-edit').val() # new value for category
			# Update the displayed value
			mod.set {action: act, category: cat, quantity: qu.num, units: qu.units},{silent: true}
			# Save the value back to the server
			mod.save {action: act, category: cat, quantity: qu.num, units: qu.units}
			# Let everybody know the item changed
			mod.change();
			return
		,
		# Bind some DOM events to functions
		events: {
			'click button#add': 'addItem',
			'keypress': 'updateItem'
		}
	}

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

