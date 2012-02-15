(($) ->
	Item = Backbone.Model.extend {
		defaults: {
			action: 'Something',
			category: 'General',
			quantity: 0,
			units: 'hours',
			updatedAt: new Date().getTime().toString()		
		},
		dateAsString: ->
			ua = this.get 'updatedAt'
			if ua.indexOf('1') == 0
				r1 = new Date(parseInt ua).toString('d_MMM-yy HH:mm')
				return r1 if(r1 && r1 != undefined)
			if ua.indexOf('2') == 0
				dd = ua.split 'T'
				if dd.length == 2
					t1 = dd[0].split '-'
					dy = t1[0].substring(2)
					dm = t1[1]
					d = t1[2]
					t2 = dd[1].split ':'
					th = t2[0]
					tm = t2[1]
					return d + '-' + dm + '-' + dy + ' ' + th + ':' + tm
			return ua if(typeof ua) == 'string'
			return ua.toString() 
	}
	
	ItemView = Backbone.View.extend {
		tagName: 'div',
		className: 'inner-row',
		initialize: ->
			_.bindAll(this,'render','editMe','deleteMe')
			this.model.bind('change',this.render,this)
			this.model.bind('destroy',this.remove,this)
			return
		,
		render: ->
			item_html = _.template($('#item-templ').html())
			$(this.el).html(item_html {model: this.model})
			return this
		,
		events: {
			'click .item-delete' : 'deleteMe',
			'dblclick' : 'editMe' 
		},
		remove : ->
			$(this.el).remove()
			return
		,
		deleteMe: ->
			this.model.destroy {
				error: (model,response) ->
					console.log "Failed to destroy " + model.id
					return
			}
			return
		,
		editMe: ->
			edit_html= _.template($('#item-edit').html())
			$(this.el).html(edit_html({item: this.model}))
			return
	}

	List = Backbone.Model.extend {
		model: Item,
		url: '/activities?limit=25',
		parse: (response) ->
			retval = _(response).map((row) ->
				{
					id: row.id,
					action: row.value.action,
					category: row.value.quantity,
					units: row.value.units,
					updatedAt: row.value.updatedAt
				}
			)
			// parse the start key and the last key from the response
			this.pageInfo.pageStartKeys[this.pageInfo.tgtPage] = response[0].key
			this.pageInfo.pageStartKeys[this.pageInfo.tgtPage+1] = response[response.length-1].key
			
			return retval
		,
		pageInfo: {
			rowsPerPage: 25,
			currentPageNum: 0,
			pageStartKeys: [],
			tgtPage: 0
		},
		doRender: ->
			this.pageInfo.currentPageNum = this.pageInfo.tgtPage;
			retur
		,
		getNextPage: (view) ->
			pn = this.pageInfo.currentPageNum
			psk = this.pageInfo.pageStartKeys
			if(psk.length > pn + 1) 
				this.url='/activities?limit='+this.pageInfo.rowsPerPage+'&startkey='+psk[pn+1]
			else 
				this.url='/activities?limit='+this.pageInfo.rowsPerPage
			this.pageInfo.tgtPage = pn+1
			this.fetch({ 
				success: ->
			# 		listCollection.reset()
					listCollection.doRender()
					listCollection.trigger('draw')
				})
		,
		getPrevPage: (view) ->
			pn = this.pageInfo.currentPageNum
			psk = this.pageInfo.pageStartKeys
			if(pn > 0) 
				this.url='/activities?limit='+this.pageInfo.rowsPerPage+'&startkey='+psk[pn-1]
			else 
				this.url='/activities?limit='+this.pageInfo.rowsPerPage
			this.pageInfo.tgtPage = pn -1
			this.fetch({ 
				success: ->
					# listCollection.reset();
					listCollection.doRender();
					listCollection.trigger('draw');
				}
			)

	ListView = Backbone.Collection.extend {
		el: $('#main'),
		appendItem : (item) ->
			itemView = new ItemView {
				model: item
			}
			$('#table-body',this.el).append(itemView.render().el)
			return
		,
		prependItem: (item) ->
			itemView = new ItemView {
				model: item
			}
			// the second (context) parameter in the jQuery selector call has to be a node 
			// (set in the el: assignment, above), NOT just a selector string
			$('#table-body', this.el).prepend(itemView.render().el)
		,
		actionMatcher: new ListOfValues(),
		categoryMatcher: new ListOfValues(),
		doubleMatcher: new DoubleMatcher(),
		
		render: -> 
			_(this.collection.models).each((item) ->
				this.appendItem item
			,this)
			
			this.doubleMatcher.makeMatches(this.collection.models,'action','category')
			$('#action-in').blur( ->
				listView.doubleMatcher.match($('#action-in'), $('#category-in'))
			)

			this.categoryMatcher.makeMatches(this.collection.models,'category')
			$('#category-in').autocomplete('option','source',this.categoryMatcher.values)

			this.actionMatcher.makeMatches(this.collection.models,'action')
			$('#action-in').autocomplete('option','source',this.actionMatcher.values)
			
			return
		,
		
		initialize: ->
			_.bindAll(this,'render', 'addItem', 'appendItem', 'prependItem', 'updateItem')
			this.collection = new List()
			listCollection = this.collection
			this.collection.bind 'add', this.prependItem
			this.collection.bind 'draw', this.render
			this.collection.fetch {
				success: ->
					listview.render()
					return
			}
			return
		,
		clearInput: ->
			$('#action-in').val('')
			$('#category-in').val('')
			$('#quantity-in').val(' ')
			return	
		,
		addItem: ->
			item = new Item()
			qu = SFUtils.splitNumbersAndUnits($('#quantity-in').val())
			item.set {
				action: $('#action-in').val(),
				category: $('#category-in').val(),
				quantity: qu.num,
				units: qu.units
			}
			return
		,
		updateItem: (e)->
			return if (!e || e.keyCode != 13)
			tid = $('#id-edit').html()
			mod = this.collection.get(tid)
			qty = $('#quantity-edit').val()
			qu = SFUtils.splitNumbersAndUnits(qty)
			act = $('#action-edit').val()
			cat = $('#category-edit').val()
			mod.set {
				action: act,
				category: cat,
				quantity: qu.num,
				units: qu.units
			}, { silent: true}
			mod.save {
				action: act,
				category: cat,
				quantity: qu.num,
				units: qu.units				
			}
			mod.change()
			return
		,
		events: {
			'click button#add': 'addItem',
			'keypress': 'updateItem'
		}
	}

	listview = new ListView()

# jQuery on-document-ready stuff
	$('#action-in').autocomplete({source: listView.actionMatcher.values})
	$('#category-in').autocomplete({source: listView.categoryMatcher.values})
# Navigation 
	$('#pre-page').on('click', ->
		listView.collection.getPrevPage()
		return
	)

	$('#nxt-page').on('click', ->
		listView.collection.getNextPage()
		return
	)

	$('.submit-on-enter').on('keypress',(e) ->
		if (!((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13))) 
			return true
		$('button.default-button').click()
		$('#action-in').focus()
		return false
	)

	$('#action-in').focus()

return
)(jQuery)
