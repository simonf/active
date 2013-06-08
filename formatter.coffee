
root = exports ? this

root.parseAndFixActivity = (input) ->
	if input.updatedAt == undefined
		if input.other_date == undefined
			input.updatedAt = new Date().getTime().toString()
		else
			input.updatedAt = convertToTimestamp input.other_date
			delete input.other_date
	if input.units == undefined
		if input.quantity != undefined
			qa = input.quantity.split " "
			if qa.length > 1 and parseInt(qa[0]) > 0
				input.quantity = qa[0]
				input.units = qa[1]
	input.type = 'activity'
	return input


convertToTimestamp = (strdt) ->
	d = new Date strdt
	d.setHours 12
	if d == 'Invalid Date'
		d = new Date()
	return d.getTime().toString()