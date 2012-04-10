var SFUtils = {
	// splitNumbersAndUnits : function(myInput) {
	// 	if (match = /\d+\.?\d*/.exec(myInput)) {
	// 		parsedNumber = parseFloat("0" + match[0]);
	// 		if(parsedNumber == undefined) {
	// 			return  { num: myInput, units: "?"};
	// 		} else {
	// 			dirty_units = myInput.replace(match[0],'');
	// 			units = this.trim(dirty_units);
	// 			return { num: parsedNumber, units: units};
	// 		}
	// 	} else {
	// 		return {num: '', units: ''};
	// 	}
	// },

	splitNumbersAndUnits : function(myInput) {
		var arr;
		if(myInput && myInput.length > 0) {
			arr = myInput.split(' ');
			if (arr.length > 1) {
				arr[0]=this.trim(arr[0]);
				arr[1]=this.trim(arr[1]);
				parsedNumber = parseFloat("0"+arr[0])
				if(parsedNumber && parsedNumber.toString===arr[0]) {
					return {num: parsedNumber, units: arr[1]};
				} else {
					return {num: arr[0], units: arr[1]};
				}
			} else {
				return  { num: myInput, units: ''};
			}
		} else {
			return {num: '', units: ''};
		}
	},
	
	trim : function(charString) {
		frontTrimmed = charString.replace(/^\s*/,'');
		return frontTrimmed.replace(/\s*$/,'');
	},
	
	setCaretPosition: function (ctrl, pos){
		if(ctrl.setSelectionRange)
		{
			ctrl.focus();
			ctrl.setSelectionRange(pos,pos);
		}
		else if (ctrl.createTextRange) {
			var range = ctrl.createTextRange();
			range.collapse(true);
			range.moveEnd('character', pos);
			range.moveStart('character', pos);
			range.select();
		}
	},
	
	yesterdayTimestamp: function() {
		return (new Date().getTime()-86400000).toString();
	}
	
};

ListOfValues = function(){
	var values;
	// numCharsToMatchAfter = 2;
	values = [];
	this.makeMatches = function(coll,va) {
		bbone_model_group=_.groupBy(coll, function(it) { return $.trim(it.get(va));});
		keyvalues = _.keys(bbone_model_group);
		this.values = _.sortBy(keyvalues, function(kv) {return kv});
	};
	this.listAll = function() {
		_.each(this.values, function(n) { console.log(n);});
	};
};

DoubleMatcher = function(){
	this.h = {};
	this.makeMatches = function(coll,va1, va2) {
		var that = this;
		_.each(coll, function(it){
			var v = $.trim(it.get(va2));
			var k = $.trim(it.get(va1));
			if(k && k.length >0) that.h[k]=v;
		});
	};
	this.listAll = function() {
		_.each(this.h, function(n) { console.log(n);});
	};
	this.match = function(srcInputElement, destInputElement){
		var m,k,v;
		k = $(srcInputElement).val();
		if(k && k.length>0) v=this.h[k];
		if(v && v.length>0) $(destInputElement).val(v);
	}
}


// var tests=["    3.4   hours ", "1minute", "50.0secs  ", "    03:00:00","1"];
// for(var i=0;i<tests.length;i++) {
	// console.log(SFUtils.splitNumbersAndUnits(tests[i]));
	// }