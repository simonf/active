validator = require 'validator'

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
	return sanitizeData input

sanitizeData = (activity) ->
	activity.action = validator.escape(activity.action) if activity.action?
	activity.category = validator.escape(activity.category) if activity.category?
	activity.updatedAt = validator.escape(activity.updatedAt) if activity.updatedAt?
	activity.units = validator.escape(activity.units) if activity.units?
	activity.quantity = validator.escape(activity.quantity) if activity.quantity?
	return activity

convertToTimestamp = (strdt) ->
	d = new Date strdt
	d.setHours 12
	if d == 'Invalid Date'
		d = new Date()
	return d.getTime().toString()