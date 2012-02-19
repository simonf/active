(function($){
  var listCollection;

  var Item = Backbone.Model.extend({
	defaults: {
		action: 'Something',
		category: 'General',
		quantity: 0,
		units: 'hours',
		updatedAt: new Date().getTime().toString()
	},	
	dateAsString: function() {
			var ua = this.get('updatedAt');
			if(ua.indexOf("1")==0) {
				r1=	new Date(parseInt(ua)).toString('d-MMM-yy HH:mm');
				if(r1 && r1 != 'undefined') return r1;
			}
			if(ua.indexOf("2")==0) {
			// it's actually a string in iso 8601 format. Parse and munge.
				dd=ua.split('T');
				if(dd.length == 2) {
					t1=dd[0].split('-');
					dy=t1[0].substring(2);
					dm=t1[1];
					d=t1[2];
					t2=dd[1].split(':');
					th=t2[0];
					tm=t2[1];
					return d+'-'+dm+'-'+dy+' '+th+':'+tm;
				}
			}
			if((typeof ua) == 'string')	return ua;
			return ua.toString();
		}
  });

  var ItemView = Backbone.View.extend({
	tagName: 'div', // name of (orphan) root tag in this.el
	
	className: 'inner-row',
	
	initialize: function() {
		_.bindAll(this,'render','editMe','deleteMe'); // see comment on ListView. Make "this" sensible in render()
	    this.model.bind('change', this.render, this);
	    this.model.bind('destroy', this.remove, this);
	},
	
	render: function() {
		var item_html = _.template($('#item-templ').html());
		$(this.el).html(item_html({model: this.model}));
		return this; // to allow chaining - i.e. allow appendItem below to call itemView.render().el
	},
	
	events: {
		"click .item-delete" : "deleteMe",
		"dblclick" : "editMe"
	},
      
    remove: function() {
	  $(this.el).remove();
    },

	deleteMe: function() {
	    this.model.destroy({
			error: function(model,response) {
			    console.log("Failed to destroy "+model.id);
			}
		});
	},
	
	editMe: function() {
		var edit_html= _.template($('#item-edit').html());
		$(this.el).html(edit_html({item: this.model}));
	}
  });
  
  
  var List = Backbone.Collection.extend({
	model: Item,
	url: '/activities?limit=25',
	initialize: function() {
		_.bindAll(this,'doRender','getNextPage','getPrevPage');
	},
	parse: function(response) {
		console.log(response);
		var retval = _(response).map(function(row) { 
			return {
				id: row.id, 
				action: row.value.action, 
				category: row.value.category,
				quantity: row.value.quantity,
				units: row.value.units,
				updatedAt: row.value.updatedAt
			};
		});
		// parse the start key and the last key from the response
		this.pageInfo.pageStartKeys[this.pageInfo.tgtPage] = response[0].key;
		this.pageInfo.pageStartKeys[this.pageInfo.tgtPage+1] = response[response.length-1].key;
		return retval;
	},
	pageInfo: {
		rowsPerPage: 25,
		currentPageNum: 0,
		pageStartKeys: [],
		tgtPage: 0
	},
	doRender: function() {
		this.pageInfo.currentPageNum = this.pageInfo.tgtPage;
	},
	getNextPage: function(view) {
		var pn = this.pageInfo.currentPageNum;
		var psk = this.pageInfo.pageStartKeys;
		if(psk.length > pn + 1) this.url='/activities?limit='+this.pageInfo.rowsPerPage+'&startkey='+psk[pn+1];
		else this.url='/activities?limit='+this.pageInfo.rowsPerPage;	
		this.pageInfo.tgtPage = pn+1;
		this.fetch({ success: function() {
//			listCollection.reset();
			listCollection.doRender();
			listCollection.trigger('draw');
			}
		});		
	},
	getPrevPage: function(view) {
		var pn = this.pageInfo.currentPageNum;
		var psk = this.pageInfo.pageStartKeys;
		if(pn > 0) this.url='/activities?limit='+this.pageInfo.rowsPerPage+'&startkey='+psk[pn-1];
		else this.url='/activities?limit='+this.pageInfo.rowsPerPage;
		this.pageInfo.tgtPage = pn -1;
		this.fetch({ success: function() {
//			listCollection.reset();
			listCollection.doRender();
			listCollection.trigger('draw');
			}
		});	
	}
  });
  
  var ListView = Backbone.View.extend({
	el: $('#main'), // attach the view to the main div
	
	appendItem: function(item) {
		var itemView = new ItemView({
			model: item
		});
		// the second (context) parameter in the jQuery selector call has to be a node 
		// (set in the el: assignment, above), NOT just a selector string
		$('#table-body', this.el).append(itemView.render().el);
	},
	
	prependItem: function(item) {
		var itemView = new ItemView({
			model: item
		});
		// the second (context) parameter in the jQuery selector call has to be a node 
		// (set in the el: assignment, above), NOT just a selector string
		$('#table-body', this.el).prepend(itemView.render().el);
	},
	
	actionMatcher: new ListOfValues(),
	categoryMatcher: new ListOfValues(),
	doubleMatcher: new DoubleMatcher(),
	
	render: function() {
		// for each element in models, call the appendItem function and pass this as the context object 
		// (so the function can refer to the ListView as 'this')
		// Duplicates appendItem calls in response to add event on the collection (see initialize, below),
		// but we do this only once, when render() is called as the page is loaded.
		$('#table-body',this.el).empty();
		_(this.collection.models).each(function(item){ 
			this.appendItem(item);
		}, this);
				
		// also at page load, we extract a list of values for categories and actions
		this.doubleMatcher.makeMatches(this.collection.models,'action','category');
		$('#action-in').blur(function() {
			listView.doubleMatcher.match($('#action-in'), $('#category-in'));
		});

		this.categoryMatcher.makeMatches(this.collection.models,'category');
		$('#category-in').autocomplete('option','source',this.categoryMatcher.values);

		this.actionMatcher.makeMatches(this.collection.models,'action');
		$('#action-in').autocomplete('option','source',this.actionMatcher.values);
		
	},
	
	initialize: function(){
		_.bindAll(this,'render', 'addItem', 'appendItem', 'prependItem', 'updateItem'); // fix loss of context when calling listed methods from outside this object
		
		this.collection = new List();
		listCollection = this.collection;
		// whenever an item is added to the collection, call prependItem
		this.collection.bind('add', this.prependItem);
		this.collection.bind('draw',this.render);
		//this.collection.getNextPage();
		this.collection.fetch({success:function(){listView.render();}});
	},

	clearInput: function() {
		$('#action-in').val('');
		$('#category-in').val('');
		$('#quantity-in').val(' ');
	},
	
	addItem: function() {
		var item = new Item();
		//parse input field for quantity and units
		qu=SFUtils.splitNumbersAndUnits($('#quantity-in').val());
		item.set({
			action: $('#action-in').val(),
			category: $('#category-in').val(),
			quantity: qu.num,
			units: qu.units
		});

		this.clearInput();
		this.collection.add(item); // results in a call to appendItem (bound in initialize, above)
		item.save();
	},

	updateItem: function(e) {
		if (!e || e.keyCode != 13) return;
		var tid = $('#id-edit').html();
		var mod = this.collection.get(tid);
		var qty = $('#quantity-edit').val();
		qu=SFUtils.splitNumbersAndUnits(qty);
		var act = $('#action-edit').val();
		var cat = $('#category-edit').val();
		mod.set({action: act, category: cat, quantity: qu.num, units: qu.units},{silent: true});
		mod.save({action: act, category: cat, quantity: qu.num, units: qu.units});
		mod.change();
	},
	
	events: {
		'click button#add': 'addItem',
		'keypress': 'updateItem'
	}
	
  });
  
 var listView = new ListView();

  // jQuery on-document-ready stuff
	$('#action-in').autocomplete({source: listView.actionMatcher.values});
	$('#category-in').autocomplete({source: listView.categoryMatcher.values});
  // Navigation 
  	$('#pre-page').on('click',function() {
		listView.collection.getPrevPage();
	});
	$('#nxt-page').on('click',function() {
		listView.collection.getNextPage();
	});

   // Treat <Enter> keypress in any form input field the same as clicking on the "Add item" button
  $('.submit-on-enter').on('keypress', function(e) {
  		if ((e.which && e.which === 13) || (e.keyCode && e.keyCode === 13)) {
  			$('button.default-button').click();
  		  	$('#action-in').focus();
  			return false;
  		} else {
  			return true;
  		}
   });
   // Set initial focus to the first field in the form
  $('#action-in').focus();

})(jQuery);