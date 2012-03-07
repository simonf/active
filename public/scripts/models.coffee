root = exports ? this

# Backbone model for individual entries
root.Item = Backbone.Model.extend {
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

##Backbone collection for managing a list of items
root.List = Backbone.Collection.extend {
	model: Item,
	baseURL: '/activities',
	# The URL that will be called by default to populate the collection
	url: '/activities',
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
	# note we restore the collection URL so that calls to destroy on member items
	# will use the correct URL (/activities) instead of a polluted one (/activies?limit...)
	updatePageNumberInfo: ->
		this.url = this.baseURL
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
			success: =>
				this.updatePageNumberInfo() # note we refer to listCollection because of visibility issues
				this.trigger 'draw'
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
		this.pageInfo.tgtPage = pn-1 #so we will cache the retrieved startkey in the right place
		this.fetch { 
			success: =>
				this.updatePageNumberInfo()
				this.trigger('draw')
		}
		return
}
