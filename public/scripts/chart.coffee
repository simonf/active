fetchAndPlotSelectedCategory = ->
	el = $('#cat-list option:selected')[0]
	fetchDataForCategory el.text if el
	return

fetchDistinctCategories = ->
	jQuery.get '../categories', (data) ->
		$.each data,(i,v) ->
			$('#cat-list').append('<option>'+v.key+'</option>') if(v.key.length>0)
			return
		fetchAndPlotSelectedCategory()
		return
	return

initCap = (str) ->
	str?.substring(0,1).toUpperCase() + str?.substring(1,str.length).toLowerCase()
	
cleanAndSortByAction = (couchRows) ->
	actionHash = {}
	$.each couchRows, (i,row) ->
		v = row.value
		k = initCap jQuery.trim v.action
		arr = actionHash[k]
		if arr
			arr.push [v.date, v.qty]
			actionHash[k] = arr
		else
			actionHash[k] = [[v.date,v.qty]]
		return
	return actionHash

fetchDataForCategory = (cat) ->
	jQuery.get '../category?key='+cat, (data) ->
		actionHash = cleanAndSortByAction(data)
		plotdata = []
		series_labels =[]
		$.each actionHash,(k,v) ->
			if k.length > 0
				series_labels.push { label: k, neighborThreshold: -1 }
				plotdata.push v
			return
		plotData plotdata, series_labels
		return

plotData = (data, labels) ->
	console.log data.toString()
	console.log labels
	$.jqplot 'plot1', data,{
		series: labels, 
		axes: { 
			xaxis: { 
				renderer: $.jqplot.DateAxisRenderer,
				min: 1326700000000,
				tickInterval: '1 day',
				tickOptions:{formatString:'%#m/%#d'}
			}, 
			yaxis: { 
				tickOptions:{formatString:'%2d'} 
			} 
		}
	}
	return

jQuery ->
	fetchDistinctCategories()
	$('#cat-list').change ->
		fetchAndPlotSelectedCategory()
		return
	return