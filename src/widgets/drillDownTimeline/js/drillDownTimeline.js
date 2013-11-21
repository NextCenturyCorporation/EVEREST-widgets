var DrillDownTimeline = function() {
	var self = this;
	var contextDate = Date.now();
	var baseURL = "http://localhost:8081";

	var monthNames = [ "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December" ];
    var months = {January: 0, February: 1, March: 2, April: 3, May: 4, June: 5, July: 6, August: 7, 
    	September: 8, October: 9, November: 10, December: 11};
	var monthAbbrev = {January: "Jan", February: "Feb", March: "Mar", April: "Apr", May: "May", June: "June", July: "July", 
		August: "Aug", September: "Sept", October: "Oct", November: "Nov", December: "Dec"};
	var daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	var lowerYearRange = 2011;
	var uppperYearRange = 2015;
	var contextMode = {0: '5year', 1: 'year', 2: 'month', 3: 'day', 4: 'hour', 5: 'minute', 6:'second'};
	var currentContextMode = 0;

	$("#baseDate").text("Context Date:" + new Date(contextDate).toISOString());


	self.getDatesAndFrequency = function(mode, multiple) {
		multiple = true;
		$.get(baseURL + "/rawfeed/dates/" + mode + "/" + contextDate, function(data) {
			var interpolated = multiple ? data : self.interpolateZeros(data,mode, lowerYearRange, uppperYearRange);
			if(mode == 'year') {
				self.repaint(interpolated);
			} else if(mode == 'month') {
				self.repaint(convertToMonthNameFromInt(interpolated));
			} else if(mode == 'day') {
				var contextDateMonth = new Date(contextDate).getMonth();
				self.repaint(convertDaysSyntax(interpolated,monthAbbrev[monthNames[contextDateMonth]]));
			} else if(mode == 'hour') {
				self.repaint(convertHoursSyntax(interpolated));	
			} else {
				self.repaint(convertMinutesSyntax(interpolated));

			}
		});
	};

	

	function getRandomInt (min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	var updateAndSetBaseDate = function(date) {
		$("#baseDate").text("Context Date:" + new Date(date).toISOString());
	};

	var convertToMonthNameFromInt = function(data) {
		return data.map(function(element) {
			return { date: element.baseYear + '-' + (element.date + 1), frequency:element.frequency ,baseYear: element.baseYear,
				baseMonth: element.baseMonth, baseDay: element.baseDay, baseHour: element.baseHour, baseMinute: 
				element.baseMinute};
		});
	};

	var convertDaysSyntax = function(data, contextDateMonth) {
		return data.map(function(element) {
			return { date:  element.baseYear + '-' + (element.baseMonth + 1) + '-' + element.date, frequency:element.frequency ,baseYear: element.baseYear,
				baseMonth: element.baseMonth, baseDay: element.baseDay, baseHour: element.baseHour, baseMinute: 
				element.baseMinute};
		});
	};

	var convertHoursSyntax= function(data) {
		return data.map(function(element) {
			return { date: element.baseYear + '-' + (element.baseMonth + 1) + '-' + element.baseDay + " " + convertToMilTime(element.date), frequency:element.frequency ,baseYear: element.baseYear,
				baseMonth: element.baseMonth, baseDay: element.baseDay, baseHour: element.baseHour, baseMinute: 
				element.baseMinute};
		});
	};

	var convertMinutesSyntax= function(data) {
		return data.map(function(element) {
			return { date: element.baseYear + '-' + (element.baseMonth + 1) + '-' + element.baseDay + " " + element.baseHour + ":" + element.date, frequency:element.frequency ,baseYear: element.baseYear,
				baseMonth: element.baseMonth, baseDay: element.baseDay, baseHour: element.baseHour, baseMinute: 
				element.baseMinute};
		});
	};

	var convertToMilTime = function(num) {
		if(num < 10) {
			return "0" + num + ":00";
		} else {
			return num + ":00";
		}
	};

	self.interpolateZeros = function(array, mode, start, end) {
		var newArray = array;
		if(mode === 'year') {
			var max = _.max(array,function(last){return last.date}).date;
			if(end) {
				max = (end >= max) ? end: max;
			}
			var min = _.min(array,function(last){return last.date}).date;
			if(start) {
				min = (start <= max) ? start: max;
			}
			for(var i = min; i <= max; i++) {
				newArray.push({date: i, frequency:0});
			}
			newArray.sort(function(a,b){return a.date-b.date});
			return newArray;
		} else if(mode === 'month') {
			for(var i = 0; i <= 11; i++) {
				newArray.push({date: i, frequency:0});
			}
			newArray.sort(function(a,b){return a.date-b.date});
			return newArray;
		} else if(mode === 'day') {
			var contextDateMonth = new Date(contextDate).getMonth();
			for(var i = 1; i <= daysInMonth[contextDateMonth]; i++) {
				newArray.push({date: i, frequency:0});
			}
			newArray.sort(function(a,b){return a.date-b.date});
			return newArray;
		} else if(mode === 'hour') {
			var contextDateMonth = new Date(contextDate).getUTCDate();
			for(var i = 0; i <= 23; i++) {
				newArray.push({date: i, frequency:0});
			}
			newArray.sort(function(a,b){return a.date-b.date});
			return newArray;
		} else if(mode == 'minute') {

			var contextDateMonth = new Date(contextDate).getHours();
			for(var i = 0; i <= 59; i++) {
				newArray.push({date: i, frequency:0});
			}
			newArray.sort(function(a,b){return a.date-b.date});

			return newArray;
		}
	};


self.init = function() {
	
	self.getDatesAndFrequency('year');
	setUpBreadCrumbHandlers();
	var margin = {top: 20, right: 20, bottom: 80, left: 40},
		width = 960 - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom;

	var formatPercent = d3.format(".0");

	var x = d3.scale.ordinal()
		.rangeRoundBands([0, width], .1);

	var y = d3.scale.linear()
		.range([height, 0]);

	var getXAxis = function() {
		return d3.svg.axis().scale(x).orient("bottom");
	}

	var getYAxis = function() {
		return d3.svg.axis().scale(y).orient("left").tickFormat(formatPercent);
	}

	var xAxis = getXAxis();

	var yAxis = getYAxis();

	var svg = d3.select("body").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	d3.select("svg").call(d3.behavior.zoom()
		.on("zoom", function() {
			if(isPos(d3.event.sourceEvent.wheelDelta)) {//in
				var selected = filterFreqGreaterThan1(d3.selectAll("rect.selected"));
				var data = d3.select(selected[0][0]).data()[0];
				if(typeof data != 'undefined') {
					setBreadCrumbValues(data.date);
					handleClickEvents(data.date.toString());
				}
			} else {//out
				var backup = currentContextMode -1;
				if(backup >= 0) {
					self.getDatesAndFrequency(contextMode[currentContextMode]);
					buttonClicked(contextMode[backup])
					currentContextMode--;
				}
			}
		}));

	var isPos = function(num){ return num > 0 ? true: false; }

	var filterFreqGreaterThan1 = function(array) {
		return array.filter(function(element) {
			return element.frequency > 0;
		});
	};

	var tip = d3.tip()
		.attr('class', 'd3-tip')
		.offset([-10, 0])
		.html(function(d) {
			return "<strong>Frequency:</strong> <span style='color:red'>" + d.frequency + "</span>";
		});

	var createLabels = function() {
		svg.append("g")
			.attr("class", "xaxis axis")
			.attr("id","barchart")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);

		svg.selectAll(".xaxis text")  // select all the text elements for the xaxis
			.attr("transform", function(d) {
			return "translate(" + this.getBBox().height*-2 + "," + (this.getBBox().height + 20) + ")rotate(-45)";
		});

		svg.append("g")
			.attr("class", "y axis")
			.call(yAxis)
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("Frequency");

		svg.call(tip);

	};

	self.repaint = function(data, noOutTransition) {
		x.domain(data.map(function(d) { return d.date; }));
		y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

		var xAxis = getXAxis();
		var yAxis = getYAxis();

		svg.selectAll("g").remove();//remove all old labels.
		createLabels();

		var rectsNew = svg.selectAll(".bar")
			.data(data);

		rectsNew
			.enter().append("rect")
			.attr("class", "bar")
			.on("click", clickEvent);
			

		var outDelay = 800;

		if(!noOutTransition) {
			var rect = svg.selectAll("rect")
			.transition()
			.style("fill", "steelblue")
			.attr({
				y: height,
				height: 0
			}).duration(outDelay)
			.remove();
		} else {
			outDelay = 0;
		}

		rectsNew
			.transition()
			.delay(outDelay)
			.attr("x", function(d) { return x(d.date); })
			.attr("width", x.rangeBand())
			.attr("y", function(d) { return y(d.frequency); })
			.attr("height", function(d) { return height - y(d.frequency); })
			.duration(800);


		rectsNew
			.on('mouseover', tip.show)
      		.on('mouseout', tip.hide);
  		
  		rectsNew
  			.attr("baseYear",function(d) {return d.baseYear;})
			.attr("baseMonth",function(d) {return d.baseMonth;})
			.attr("baseDay",function(d) {return d.baseDay;})
			.attr("baseHour",function(d) {return d.baseHour;})
			.attr("baseMinute",function(d) {return d.baseMinute;});

  		svg.append("g")
			.attr("class", "brush")
			.call(d3.svg.brush().y(y)
			.on("brushstart", brushstart)
			.on("brush", brushmoveY)
			.on("brushend", brushend))
			.selectAll("rect")
			.attr("x",  -(margin.left))
			.attr("width", margin.left);

  		svg.append("g")
			.attr("class", "brush")
			.call(d3.svg.brush().x(x)
			.on("brushstart", brushstart)
			.on("brush", brushmoveX)
			.on("brushend", brushend))
			.selectAll("rect")
			.attr("y", height)
			.attr("height", (height/2))
			


  		function brushstart() {
			svg.classed("selecting", true);
		}

		function brushmoveY() {
			var s = d3.event.target.extent();
			rectsNew.classed("selected", function(d) { 
				var upperFreq = s[0] <= d.frequency
				return upperFreq; 
			});
		}

		function brushmoveX() {
			var s = d3.event.target.extent();
			rectsNew.classed("selected", function(d) { 
				s[0] = s[0] > 0 ? s[0] : 1;
				var lowerband = s[0] && s[1] >= x(d.date);
				var upperband = (x(d.date) + x.rangeBand()) >= s[0] && s[1];
			   return lowerband && upperband; 
			});
		}

		function brushend() {
			svg.classed("selecting", !d3.event.target.empty());
		}
	
	};

};

function clickEvent() {
	setBreadCrumbValues(d3.select(this).data()[0].date);
	var selected = d3.selectAll(".selected")[0];
	if(selected.length <= 1) {
		handleClickEvents(d3.select(this).data()[0].date.toString());
	} else {
		var date = d3.selectAll(".selected").data()[0].date;
		var year = /^\d{4}/gi;
		var month = /^\d{4}-\d{1,2}/i;
		var day = /^\d{4}-\d{1,2}-\d{1,2}/i;
		var hour = /^\d{4}-\d{1,2}-\d{1,2}\s*\d{2}:\d{2}/i;
		contextDate = new Date(contextDate);
		 if(hour.test(date)){
		 	console.log("minute");
		 	self.multipleAjaxCalls('minute', function(data){
		 		console.log(data);
				self.repaint(convertMinutesSyntax(data));
			});
		 } else if(day.test(date)) {
		 	self.multipleAjaxCalls('hour', function(data){
				self.repaint(convertHoursSyntax(data));
			});
		 } else if(month.test(date)) {
		 	self.multipleAjaxCalls('day', function(data){
				self.repaint(convertHoursSyntax(data));
			});
		 }  else if(year.test(date)) {
		 	self.multipleAjaxCalls('month', function(data){
				self.repaint(convertHoursSyntax(data));
			});
		 }  else {
		 	contextDate = contextDate.getTime();
		 }
	}
	

}


self.multipleAjaxCalls = function(mode, callback) {
		var dataArr = [];
		var ajaxCalls = [];
		var selected = d3.selectAll(".selected").data();
		for(var i = 0; i < selected.length; i++) {
			var newDate = new Date(selected[i].date);
			var dateWithOffset = newDate.getTime() + (newDate.getTimezoneOffset() * 60000);
			var call = $.get(baseURL + "/rawfeed/dates/" + mode + "/" + dateWithOffset, function(data) {
				dataArr = dataArr.concat(data);
			});
			ajaxCalls.push(call);
		}
		$.when.apply($, ajaxCalls).done(function() {
			dataArr.sort(sortDate);
			callback(dataArr);

		});
};

var sortDate = function(a,b) {
	var tempA = new Date(a.baseYear, a.baseMonth, a.baseDay, a.baseHour, a.baseMinute, a.baseSecond);
	var tempB = new Date(b.baseYear, b.baseMonth, b.baseDay, b.baseHour, b.baseMinute, b.baseSecond);
	return tempA - tempB;
}

var handleClickEvents = function(date) {
		var year = /^\d{4}/gi;
		var month = /^\d{4}-\d{1,2}/i;
		var day = /^\d{4}-\d{1,2}-\d{1,2}/i;
		var hour = /^\d{4}-\d{1,2}-\d{1,2}\s*\d{2}:\d{2}/i;

		contextDate = new Date(contextDate);
		 if(hour.test(date)){
		 	console.log('hour')
		 	console.log(date);
		 	date = date.substring(date.lastIndexOf(' ') + 1, date.length);
		 	contextDate.setUTCHours(milToHours(date));
		 	contextDate = contextDate.getTime();
		 	currentContextMode = 4;
		 	self.getDatesAndFrequency('minute');
		 	setBreadCrumbValues(contextDate, 'hour');
		 } else if(day.test(date)) {
		 	date = date.substring(date.lastIndexOf('-') + 1, date.length);
		 	console.log(date);
		 	contextDate.setDate(parseInt(date));
		 	contextDate = contextDate.getTime();
		 	currentContextMode = 3;
		 	self.getDatesAndFrequency('hour');
		 	console.log("day");
		 	setBreadCrumbValues(contextDate, 'day');
		 } else if(month.test(date)) {
		 	console.log('month');
		 	date = date.substring(date.indexOf('-') + 1, date.length);
		 	date = parseInt(date) - 1;
		 	contextDate.setMonth(date);
		 	contextDate = contextDate.getTime();
		 	currentContextMode = 2;
		 	self.getDatesAndFrequency('day');
		 	setBreadCrumbValues(contextDate, 'month');
		 	console.log(contextDate);
		 }  else if(year.test(date)) {
		 	contextDate.setFullYear(date);
		 	contextDate = contextDate.getTime();
		 	currentContextMode = 1;
		 	self.getDatesAndFrequency('month');
		 	setBreadCrumbValues(contextDate, 'year');
		 }  else {
		 	contextDate = contextDate.getTime();
		 }
		 updateAndSetBaseDate(contextDate);
};

var milToHours = function(time) {
	return parseInt(time.substring(0, time.indexOf(':'))).toString();

};

var setBreadCrumbValues = function(baseDate, mode) {
	var tempDate = new Date(baseDate);
	if(mode == 'year') {
		$("#yearButton").text(tempDate.getFullYear());
		$("#yearButton").css("visibility", "visible");
	} else if(mode == 'month') {
		$("#monthButton").text(monthNames[tempDate.getMonth()]);
		$("#monthButton").css("visibility", "visible");
	} else if(mode == 'day') {
		$("#dayButton").text(tempDate.getUTCDate());
		$("#dayButton").css("visibility", "visible");
	} else if(mode == 'hour') {
		$("#hourButton").text(tempDate.getUTCHours() + ":00");
		$("#hourButton").css("visibility", "visible");
	}
	
	

};

var setUpBreadCrumbHandlers = function() {
	$("#year5Button").on("click", function() {
		year5ButtonClicked();
	});
	$("#yearButton").on("click", function() {
		yearButtonClicked();
	});
	$("#monthButton").on("click", function() {
		monthButtonClicked();
	});
	$("#dayButton").on("click", function() {
		dayButtonClicked();
	});
};

var year5ButtonClicked = function() {
	$("#yearButton").css("visibility", "hidden");
	$("#monthButton").css("visibility", "hidden");
	$("#dayButton").css("visibility", "hidden");
	$("#hourButton").css("visibility", "hidden");
	currentContextMode =1;
	self.getDatesAndFrequency('year');
};

var yearButtonClicked = function() {
	$("#monthButton").css("visibility", "hidden");
	$("#dayButton").css("visibility", "hidden");
	$("#hourButton").css("visibility", "hidden");
	currentContextMode =2;
	self.getDatesAndFrequency('month');
}

var monthButtonClicked = function() {
	$("#dayButton").css("visibility", "hidden");
	$("#hourButton").css("visibility", "hidden");
	currentContextMode =3;
	self.getDatesAndFrequency('day');
}


var dayButtonClicked = function() {
	$("#hourButton").css("visibility", "hidden");
	currentContextMode =4;
	self.getDatesAndFrequency('hour');
}

var buttonClicked = function(mode) {
	switch(mode) {
		case '5year':year5ButtonClicked();break;
		case 'year':yearButtonClicked();break;
		case 'month':monthButtonClicked();break;
		case 'day':dayButtonClicked();break;
	}
}

};

