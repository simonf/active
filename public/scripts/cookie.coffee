root = exports ? this

root.CookieChecker = {
	isLoggedIn: ->
		if $.cookie('user')
			return true
		return false

	getUserName: ->
		return $.cookie('user')

	clearUserName: ->
		$.cookie('user',null, {path: '/'})
		return
}