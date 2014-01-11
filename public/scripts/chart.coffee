currentDataset = {}

fetchAndPlotSelectedCategory = ->
	el = $('#cat-list option:selected')[0]
	fetchDataForCategory el.text if el
	return

fetchDistinctCategories = ->
	jQuery.get '../categories', (data) ->
		$.each data,(i,v) ->
			$('#cat-list').append('<option>'+v.key[1]+'</option>') if(v.key[1].length>0)
			return
		fetchAndPlotSelectedCategory()
		return
	return

getMood = (callback) ->
	jQuery.get "/mood", (dat) ->
		callback dat
		return
	return

initCap = (str) ->
	str?.substring(0,1).toUpperCase() + str?.substring(1,str.length).toLowerCase()
	
makeTime = (strWithColons) ->
	arr=strWithColons.split(':')
	retval=parseInt(arr[0])
	if arr.length>1
		retval += parseInt(arr[1])/60.0
	if(arr.length>2)
		retval += parseInt(arr[2])/3600.0
	return retval

stripTrailingZeroes = (qty) ->
	b = qty.trim()
	if b.indexOf('.') > -1
		n = b.lastIndexOf('0');
		while (b.length - n == 1)
			b = b.substr(0,b.length-1)
			n = b.lastIndexOf('0')
	return b

makeQuantityNumeric = (qty) ->
	qs=stripTrailingZeroes(qty.toString())
	qf=parseFloat(qs)
	if qf.toString()==qs
		qf
	else
		if qs.indexOf(':') > 0
			makeTime(qs)
		else
			0

cleanAndSortByAction = (couchRows) ->
	#Clean DOM
	$('#series').empty()
	$('#plot-area').empty()
	actionHash = {}
	latest=0
	earliest=9326700000000
	$.each couchRows, (i,row) ->
		v = row.value
		latest = v.date if v.date > latest
		earliest = v.date if v.date < earliest
		qty = makeQuantityNumeric(v.qty)
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

insertMissingDays = (series, infillValue, earliest, latest) ->
	dayLength=86400
	retval = []
	#Prefix the series with a default-value entry for each day before the series starts
	while(series[0].dateSubIndex < earliest)
		retval.push [earliest,infillValue]
		earliest += dayLength*1000
	# Now start pushing the series values onto the return array
	i=1
	retval.push series[0]
	while i<series.length
		lastDate = Math.round(series[i-1][0]/1000)
		nextDate = Math.round(series[i][0]/1000)
		diff = nextDate-lastDate
		# Fill in any missing days with the default value
		while diff > dayLength*2
			lastDate +=dayLength
			retval.push [lastDate*1000,infillValue]
			diff = nextDate - lastDate
		retval.push series[i]
		i++
	#Suffix the series with the default value too
	highestDate = series[series.length-1][0]+dayLength*1000
	while(highestDate < latest)
		retval.push [highestDate,infillValue]
		highestDate += dayLength*1000
	return retval

fetchDataForCategory = (cat) ->
	jQuery.get '../category?key='+cat, (data) ->
		dataObject = cleanAndSortByAction(data)
		plotData dataObject
		return
	return

normalise = (series, valueAttributeIndex, normalValue) ->
	mm = findMinMax(series,valueAttributeIndex)
	if(mm[0] == mm[1] && mm[0] == 0)
		return series.map (i) -> [i[0],normalValue]
	return series

makeFlotDataObject = (dat,lab) ->
	v1 = dat[0][1]
	bw = 12 * 60 * 60 * 1000
	for point in dat
		if point[1]!=v1 && point[1] != 0
			bw = 24 * 60 * 60 * 1000
			break
	
	return {
		data: dat,
		label: lab,
		bars: {show: true, fill: true, barWidth: bw, lineWidth:0},
	}


plotData = (dataObject) ->
	#Create a checklist of labels to plot
	$('#series').empty()
	for label, ignore of dataObject.data
		$('#series').append('<li><input type="checkbox" name="series" value="'+label+'" checked="yes">'+label+'</ul>');
	$('input[type=checkbox]').live('click', ->
		drawSelectedSeries()
	)
	# This is going to be saved so we can redraw it whenever we like
	currentDataset = {}

	#Copy each series to the currentDataset, transforming and normalising as we go
	for label, series of dataObject.data
		# Set a default value for actions that don't have a quantity recorded (so they show up in a plot)
		normalisedData = normalise(series,1,10)
		# Ensure each series has the same start and end date; insert zero values for missing days
		fixedUpData = insertMissingDays(normalisedData, 0, dataObject.min, dataObject.max)
		currentDataset[label] = makeFlotDataObject(fixedUpData.sort(sortFunction),label)
	drawSelectedSeries()
	return

drawSelectedSeries = ->
	checkedArray = []
	$("input:checkbox[name=series]:checked").each( ->
		checkedArray.push $(this).val()
	)
	toDraw=[]
	for label, series of currentDataset
		toDraw.push(series) if(checkedArray.indexOf(label) > -1)
	options = {
		xaxis: {
			show: true,
			position: "bottom",
			mode: "time"
		}
	}
	$.plot($('#plot-area'),toDraw, options)
	return

sortFunction = (a,b) ->
	a[0]-b[0]

jQuery ->
	fetchDistinctCategories()
	$('#cat-list').change ->
		fetchAndPlotSelectedCategory()
		return
	return