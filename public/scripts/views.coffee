root = exports ? this
# Backbone view for displaying Items
root.ItemView = Backbone.View.extend {
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

# Backbone view for drawing the collection
root.ListView = Backbone.View.extend {
	# attach the view to the main div
	el: $('#main'),
	# Only called once per page load
	initialize: ->
		# Ensure "this" means what it should mean in the following functions
		_.bindAll this,'render', 'addItem', 'appendItem', 'prependItem', 'updateItem'
		# create a holder for the list of items
		this.collection = new List()
		# give it a name visible "globally"
		#listCollection = this.collection
		# whenever an item is added to the collection, call prependItem
		this.collection.bind 'add', this.prependItem
		# whenever the list of items receives the draw event, go ahead and draw the items
		this.collection.bind 'draw',this.render
		# When the page has loaded, fetch the initial set of Items
		this.collection.url='/activities?limit=25'
		this.collection.fetch {
			success: =>
				this.collection.url = this.collection.baseURL
				this.render()
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
		$('#action-in').blur(=>
			this.doubleMatcher.match $('#action-in'), $('#category-in')
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