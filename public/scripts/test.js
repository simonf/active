(function($){

	ListOfValues = function(){
		var values;
		// numCharsToMatchAfter = 2;
		values = [];
		this.makeMatches = function(coll,va) {
			bbone_model_group=_.groupBy(coll, function(it) { return $.trim(it.get(va));});
			keyvalues = _.keys(bbone_model_group);
			this.values = _.sortBy(keyvalues, function(kv) {return kv});
		};
		this.listAll = function() {
			_.each(this.values, function(n) { console.log(n);});
		};
		// this.match = function(req, respCallback) {
		// 	var partialString = req.term;
		// 	if(partialString.length> this.numCharsToMatchAfter) {
		// 		word = _.find(this.values, function(n){ return n.search(partialString)==0; });
		// 		if(!_.isUndefined(word) && _.isString(word)) respCallback.call(word);
		// 	}
		// 	respCallback.call(null);
		// };
	};
	
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
  
	var List = Backbone.Collection.extend({
		model: Item,
		url: '/activities',
		parse: function(response) {
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
			return retval;
		},
		categoryMatcher: new ListOfValues()
	});


	l = new List();
	$('#category-in').autocomplete({source: l.categoryMatcher.values});
	l.fetch({success:function(){
		l.categoryMatcher.makeMatches(l.models,'category');
		l.categoryMatcher.listAll();
		$('#category-in').autocomplete('option','source',l.categoryMatcher.values)
	}});
})(jQuery);