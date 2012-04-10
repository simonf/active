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

makeQuantityNumeric = (qty) ->
	qs=qty.toString()
	qf=parseFloat(qty)
	if qf.toString()==qs
		qf
	else
		if qs.indexOf(':') > 0
			makeTime(qs)
		else
			0

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
		# qty = if parseInt(v.qty) then v.qty else 0
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

sortFunction = (a,b) ->
	a[0]-b[0]

plotOneSeries = (seriesNumber, label, data, earliest, latest) ->
	#Create a target div
	divnm = 'plotcat'+seriesNumber
	divhtml = '<h3 class="chartTitle" id="' + divnm + '"><a href="#">'+label+'</a></h3>'
	divid = 'plot' + seriesNumber
	$('#plots').append divhtml
	$('#'+divnm).click ->
		$('#'+divid).toggle()
	divhtml = '<div style="height: 300px; width: 100%" id="' + divid + '"></div>'
	$('#plots').append divhtml
	#Get Y axis min and max
	mm = findMinMax(data,1)
	if(mm[0] == mm[1] && mm[0] == 0)
		normalisedData = data.map (i) -> [i[0],1]
		infilledData = infillMissingDays(normalisedData,0,1,0)
		plotAsBarChart(divid, label, infilledData.sort(sortFunction), earliest, latest)
#		plotAsSeries(divid, label, infilledData, earliest, latest,[0,1])
	else
		# plotAsSeries(divid, label, data.sort(sortFunction), earliest, latest, mm)
		plotAsBarChart(divid, label, data.sort(sortFunction), earliest, latest)
	return

plotAsBarChart = (divid, label, data, earliest, latest) ->
	$.plot($('#'+divid),[
		{
			color: 'rgb(0,0,255)',
			label: label,
			bars: {show: true, fill: true, barWidth: 24 * 60 * 60 * 1000, lineWidth:0},
			# lines: specific bars options
			# points: specific points options
			# xaxis: number
			# yaxis: number
			# clickable: boolean
			# hoverable: boolean
			# shadowSize: number
			data: data
		}],
		{
			xaxis: {
			    show: true,
			    position: "bottom",
			    mode: "time"
			    # min: null or number
			    # max: null or number
			    # autoscaleMargin: null or number
			  }
		})
	$('#'+divid).hide();
	return

plotAsSeries = (divid, label, data, earliest, latest,mm) ->
	$.plot($('#'+divid),[
		{
			color: 'rgb(255,0,0)',
			label: label,
			lines: {show: true, fill: true, lineWidth: 1},
			# bars: specific bars options
			points: {show: false},
			# xaxis: number
			# yaxis: number
			# clickable: boolean
			# hoverable: boolean
			# shadowSize: number
			data: data
		}],
		{
			xaxis: {
				show: true,
				position: "bottom",
				mode: "time"
				min: earliest,
				max: latest
				# autoscaleMargin: null or number
			},
			yaxis: {
				show: true,
				# min: mm[0],
				min: 0,
				max: mm[1]+1+Math.round(mm[1]/10)
			}
		}
	)
	
	$('#'+divid).hide();
	return

jQuery ->
	fetchDistinctCategories()
	$('#cat-list').change ->
		fetchAndPlotSelectedCategory()
		return
	return