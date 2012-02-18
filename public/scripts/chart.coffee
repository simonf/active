fetchDistinctCategories = ->
	jQuery.get '../categories', (data) ->
		$.each data,(i,v) ->
			$('#cat-list').append('<option>'+v.key+'</option>') if(v.key.length>0)
			return
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
	console.log(data)
	console.log(labels)
	$.jqplot 'plot1', data,{
		series: labels, 
		axes: { 
			xaxis: { 
				renderer: $.jqplot.DateAxisRenderer,
				min:'January 1, 2012 16:00:00',
				tickInterval: '1 day',
				tickOptions:{formatString:'%Y/%#m/%#d'}
			}, 
			yaxis: { 
				tickOptions:{formatString:'$%2d'} 
			} 
		}
	}
	return

# value":{"action":"Sleep","date":"2012-01-21T15:12:33.800Z","qty":8,"units":"hours"}}
# plotData = (category,data) ->
# 	plot1 = jQuery.jqplot('chart1', data, { 
# 	      title: category, 
# 	      series: [{ 
# 	          label: 'Google, Inc.', 
# 	          neighborThreshold: -1 
# 	      }], 
# 	      axes: { 
# 	          xaxis: { 
# 	              renderer: $.jqplot.DateAxisRenderer,
# 	              min:'August 1, 2007 16:00:00', 
# 	              tickInterval: '4 months', 
# 	              tickOptions:{formatString:'%Y/%#m/%#d'} 
# 	          }, 
# 	          yaxis: { 
# #	              tickOptions:{formatString:'$%.2f'} 
# 	          } 
# 	      }, 
# 	      cursor:{ 
# 	        show: true,
# 	        zoom:true, 
# 	        showTooltip:false
# 	      } 
# 	  });
# 
# 	  $('.button-reset').click(function() { plot1.resetZoom() });
# 	});


jQuery ->
	fetchDistinctCategories()
	console.log fetchDataForCategory 'Sleep'
	return