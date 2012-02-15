var cradle = require('cradle');
var fs = require('fs');
var server = fs.readFileSync('db.ini','utf8');
var conn = new(cradle.Connection)(server,5984,{ cache: true, raw: false});
var db = conn.database('activities');

var checkOrCreateDB = function(){
	db.exists(function (err, exists) {
	    if (err) {
	      console.log('error', err);
	      return false;
	    } else if (exists) {
	      console.log('database already exists.');
	      return true;
	    } else {
	      console.log('database does not exist');
	      return false;
	    }
	});
}

var getPagedActivities = function(numRows,startkey) {
	var options = {descending: true};
	if(numRows && numRows>0) options.limit=numRows;
	else options.limit=25;
	if(startkey) options.startkey=startkey;
	db.view('activity/by_date', options, function (err, dat) {
		if(err) {
			console.log(JSON.stringify(err));
		} else {
			console.log(options);
			console.log(dat);
			console.log("------------");
	    }
	});
}


checkOrCreateDB();
getPagedActivities(5);
var sk = "1326841761070";
getPagedActivities(2,sk);

// db.view('activity/by_date', {limit: 2, startkey: sk}, function (err, dat) {
// 		if(err) {
// 			console.log(JSON.stringify(err));
// 		} else {
// 			console.log(dat);
// 			console.log("------------");
// 	    }
// 	});

