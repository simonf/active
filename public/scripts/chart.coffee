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
	#Clean DOM
	$('#plots').empty()
	actionHash = {}
	latest=0
	earliest=9326700000000
	$.each couchRows, (i,row) ->
		v = row.value
		latest = v.date if v.date > latest
		earliest = v.date if v.date < earliest
		qty = if parseInt(v.qty) then v.qty else 0
		k = initCap jQuery.trim v.action
		arr = actionHash[k]
		if arr
			arr.push [v.date, qty]
			actionHash[k] = arr
		else
			actionHash[k] = [[v.date,qty]]
		return
	return {data: actionHash, min: earliest, max: latest}

findMinMax = (dataArray,subArrayIndex) ->
	min = 999999
	max = -999999
	for point in dataArray
		min = point[subArrayIndex] if point[subArrayIndex] < min
		max = point[subArrayIndex] if point[subArrayIndex] > max
	return [min,max]

infillMissingDays = (series, dateSubIndex, valSubIndex, infillValue) ->
	i=1
	dayLength=86400
	retval = [series[0]]
	while i<series.length
		lastDate = Math.round(series[i-1][dateSubIndex]/1000)
		nextDate = Math.round(series[i][dateSubIndex]/1000)
		diff = nextDate-lastDate
		#console.log nextDate+'/'+lastDate+'/'+ diff
		while diff > dayLength*2
			newval=[]
			lastDate +=dayLength
			newval[dateSubIndex]=lastDate*1000
			newval[valSubIndex] = infillValue
			retval.push newval
			diff = nextDate - lastDate
		retval.push series[i]
		i++
		console.log 'Length: '+i
	return retval

fetchDataForCategory = (cat) ->
	jQuery.get '../category?key='+cat, (data) ->
		dataObject = cleanAndSortByAction(data)
		plotData dataObject
		return

plotData = (dataObject) ->
	i=0
	for label, series of dataObject.data
		plotOneSeries i,label, series, dataObject.min, dataObject.max
		i += 1
	return

plotOneSeries = (seriesNumber, label, data, earliest, latest) ->
	#Create a target div
	divnm = 'plotcat'+seriesNumber
	divhtml = '<h3 class="chartTitle" id="' + divnm + '"><a href="#">'+label+'</a></h3>'
	divid = 'plot' + seriesNumber
	$('#plots').append divhtml
	$('#'+divnm).click ->
		$('#'+divid).toggle()
	divhtml = '<div id="' + divid + '"></div>'
	$('#plots').append divhtml
	#Get Y axis min and max
	mm = findMinMax(data,1)
	if(mm[0] == mm[1] && mm[0] == 0)
		normalisedData = data.map (i) -> [i[0],1]
		infilledData = infillMissingDays(normalisedData,0,1,0)
#		plotAsBarChart(divid, label, infilledData, earliest, latest)
		plotAsSeries(divid, label, infilledData, earliest, latest,[0,1])
	else
		plotAsSeries(divid, label, data, earliest, latest, mm)
	return

plotAsBarChart = (divid, label, data, earliest, latest) ->
	$.jqplot divid, [data],{
		seriesDefaults:{
	        renderer:$.jqplot.BarRenderer,
	        rendererOptions: {fillToZero: true}
	    },
		title: label,
		axes: { 
			xaxis: { 
				label: 'Date',
				renderer: $.jqplot.DateAxisRenderer,
				min: earliest,
				max: latest,
#				tickInterval: '1 week',
#				tickOptions:{formatString:'%#m/%#d'}
			}, 
			yaxis: {
#				min: 0,
#				max: 1,
				tickOptions:{formatString:'%2d'} 
			}
		}
	}
	$('#'+divid).hide();
	return

plotAsSeries = (divid, label, data, earliest, latest,mm) ->
	$.jqplot divid, [data],{
		title: label,
		axes: { 
			xaxis: { 
				label: 'Date',
				renderer: $.jqplot.DateAxisRenderer,
				min: earliest,
				max: latest,
				tickInterval: '1 week',
				tickOptions:{formatString:'%#m/%#d'}
			}, 
			yaxis: {
				min: mm[0],
				max: mm[1]+1+Math.round(mm[1]/10),
				tickOptions:{formatString:'%2d'} 
			}
		}
	}
	$('#'+divid).hide();
	return

jQuery ->
	fetchDistinctCategories()
	$('#cat-list').change ->
		fetchAndPlotSelectedCategory()
		return
	return