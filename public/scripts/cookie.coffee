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
	
	setTargetCookie: ->
		$.cookie('tgt',unescape(window.location.pathname),{path: '/'})
		return
	
	getTargetCookie: ->
		return $.cookie('tgt')
	
	checkLogin: ->
		if !this.isLoggedIn()
			this.setTargetCookie()
			window.location.pathname = '/public/login.html'
		return
}