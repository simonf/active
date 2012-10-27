$ ->
#	window.location.pathname = window.location.pathname.replace('login','index') if CookieChecker.isLoggedIn()
	$('#un').on 'keyup', ->
		un = $('#un').val()
		un='~' if un.length<1
		$.get('/check_un/'+un, (data)->
			$('#un').addClass('recognised')
			return
		)
		return
		
	$('.submit-on-enter').on 'keypress', (e) ->
		if (e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)
			$('button.default-button').click()
			$('#action-in').focus()
			return false
		else
			return true
		return
	# Set initial focus to the first field in the form
	$('#un').focus()
