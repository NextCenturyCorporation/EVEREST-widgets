var DrillDownTimeline = function() {
	var self = this;
	var contextDate = Date.now();

	var monthNames = [ "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December" ];
    var months = {January: 0, February: 1, March: 2, April: 3, May: 4, June: 5, July: 6, August: 7, 
    	September: 8, October: 9, November: 10, December: 11};
	var monthAbbrev = {January: "Jan", February: "Feb", March: "Mar", April: "Apr", May: "May", June: "June", July: "July", 
		August: "Aug", September: "Sept", October: "Oct", November: "Nov", December: "Dec"};
	var daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	var lowerYearRange = 2011;
	var uppperYearRange = 2015;

	d3.select("#baseDate").text("Context Date:" + new Date(contextDate).toISOString());


	self.tempCallToBackend = function(mode) {
		$.get( "http://localhost:8081/rawfeed/dates/" + mode + "/" + contextDate, function(data) {
			console.log(data);
			//var data = sudoRandomDateGenerator(mode);
			console.log(data)
			console.log(mode)
			if(mode == 'month') {
				self.repaint(convertToMonthNameFromInt(self.interpolateZeros(data,mode, lowerYearRange, uppperYearRange)));
			} else if(mode == 'day') {
				var contextDateMonth = new Date(contextDate).getMonth();
				self.repaint(convertDaysSyntax(self.interpolateZeros(data,mode, lowerYearRange, uppperYearRange),monthAbbrev[monthNames[contextDateMonth]]));
			} else if(mode == 'hour') {
				self.repaint(convertHoursSyntax(self.interpolateZeros(data,mode, lowerYearRange, uppperYearRange)));	
			} else {
				console.log(self.interpolateZeros(data,mode, lowerYearRange, uppperYearRange));
				self.repaint(self.interpolateZeros(data,mode, lowerYearRange, uppperYearRange));
			}
		});
	};

	var sudoRandomDateGenerator = function(mode) {
		var arr = [];
		if(mode == 'year') {
			for(var i = 0; i< 4; i++) {
				arr.push({date: getRandomInt(2011, 2015), frequency: getRandomInt(100, 50000)});
			}
		} else if(mode =='month') {
			for(var i = 0; i< 11; i++) {
				arr.push({date: getRandomInt(0, 11), frequency: getRandomInt(100, 50000)});
			}
		} else if(mode == 'day') {
			for(var i = 0; i< 30; i++) {
				arr.push({date: getRandomInt(1, 30), frequency: getRandomInt(100, 50000)});
			}
		} else if(mode == 'hour') {
			for(var i = 0; i< 23; i++) {
				arr.push({date: getRandomInt(0, 23), frequency: getRandomInt(100, 50000)});
			}
		} else if (mode == 'minute') {
			for(var i = 0; i< 59; i++) {
				arr.push({date: getRandomInt(0, 59), frequency: getRandomInt(100, 50000)});
			}
		} else {
			for(var i = 0; i< 59; i++) {
				arr.push({date: getRandomInt(0, 59), frequency: getRandomInt(100, 50000)});
			}
		}
		return arr;
	};

	function getRandomInt (min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	var updateAndSetBaseDate = function(date) {
		d3.select("#baseDate").text("Context Date:" + new Date(date).toISOString());
	};

	var convertToMonthNameFromInt = function(data) {
		return data.map(function(element) {
			return { date: monthNames[element.date], frequency:element.frequency };
		});
	};

	var convertDaysSyntax = function(data, contextDateMonth) {
		return data.map(function(element) {
			return { date: contextDateMonth + " " + element.date, frequency:element.frequency };
		});
	};

	var convertHoursSyntax= function(data) {
		return data.map(function(element) {
			return { date: convertToMilTime(element.date), frequency:element.frequency };
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
			var contextDateMonth = new Date(contextDate).getDate();
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
	self.tempCallToBackend('year');
	setUpBreadCrumbHandlers();
	var margin = {top: 20, right: 20, bottom: 60, left: 40},
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
			return "translate(" + this.getBBox().height*-2 + "," + (this.getBBox().height + 5) + ")rotate(-45)";
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
      		.on('mouseout', tip.hide)

  		var brush = d3.svg.brush()
			.x(x)
			.on("brush", brushed);

		var brush1 = d3.svg.brush()
			.x(x)
			.on("brush", brushed1);

		var slider = svg.append("g")
			.attr("class", "slider")
			.call(brush);

		slider.selectAll(".extent,.resize")
			.remove();

		slider.select(".background")
			.attr("transform", "translate("+ 0 +"," + (height -9) + ")")
			.attr("height",18)

		var slider2 = svg.append("g")
			.attr("class", "slider")
			.call(brush1);

		slider2.selectAll(".extent,.resize")
			.remove();

		slider2.select(".background")
			.attr("transform", "translate("+ 0 +"," + 0 + ")")
			.attr("height",height)
			.attr("width",18)

		var handle2 = slider2.append("circle")
			.attr("class", "handle")
			.attr("transform", "translate("+ width +"," + height + ")")
			.attr("r", 9);

		var handle = slider.append("circle")
			.attr("class", "handle")
			.attr("transform", "translate("+ 0 +"," + 0 + ")")
			.attr("r", 9);


		function brushed() {
			var value = d3.mouse(this);
			if(value[0] >= 0 && value[0] <= width) {
				handle2.attr("transform", "translate("+ value[0] +"," + height + ")")
			}
		}
		function brushed1() {
			var value = d3.mouse(this);
			if(value [1] >= 0 && value[1] <= height) {
				handle.attr("transform", "translate("+ 0 +"," + value[1] + ")")
			}
		}
	
	};


};

function clickEvent() {
	setBreadCrumbValues(d3.select(this).data()[0].date);
	handleClickEvents(d3.select(this).data()[0].date.toString());
}

var handleClickEvents = function(date) {
	var year = /^\d{4}/gi;
	var month = /^[a-z]+/i;
	var day = /[a-z]+\s+\d{1,2}/i;
	var hour = /^\d{2}:0{2}/i;
	contextDate = new Date(contextDate);
	 if(year.test(date)) {
	 	contextDate.setFullYear(date);
	 	contextDate = contextDate.getTime();
	 	self.tempCallToBackend('month');
	 	setBreadCrumbValues(contextDate, 'year');
	 } else if(day.test(date)) {
	 	date = date.replace(/\D/g,'');
	 	contextDate.setDate(parseInt(date));
	 	contextDate = contextDate.getTime();
	 	self.tempCallToBackend('hour');
	 	setBreadCrumbValues(contextDate, 'day');
	 } else if(month.test(date)) {
	 	contextDate.setMonth(months[date]);
	 	contextDate = contextDate.getTime();
	 	self.tempCallToBackend('day');
	 	setBreadCrumbValues(contextDate, 'month');
	 } else if(hour.test(date)){
	 	contextDate.setUTCHours(milToHours(date));
	 	contextDate = contextDate.getTime();
	 	self.tempCallToBackend('minute');
	 	setBreadCrumbValues(contextDate, 'hour');
	 } else {
	 	contextDate = contextDate.getTime();
	 }
	 updateAndSetBaseDate(contextDate);
	 
};

var milToHours = function(time) {
	return time.replace(/:/g, '').replace(/0/g, '');

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
		$("#dayButton").text(tempDate.getDate());
		$("#dayButton").css("visibility", "visible");
	} else if(mode == 'hour') {
		$("#hourButton").text(tempDate.getUTCHours() + ":00");
		$("#hourButton").css("visibility", "visible");
	}
	
	

};

var setUpBreadCrumbHandlers = function() {
	$("#year5Button").on("click", function() {
		$("#yearButton").css("visibility", "hidden");
		$("#monthButton").css("visibility", "hidden");
		$("#dayButton").css("visibility", "hidden");
		$("#hourButton").css("visibility", "hidden");
		self.tempCallToBackend('year');
	});
	$("#yearButton").on("click", function() {
		$("#monthButton").css("visibility", "hidden");
		$("#dayButton").css("visibility", "hidden");
		$("#hourButton").css("visibility", "hidden");
		self.tempCallToBackend('month');
	});
	$("#monthButton").on("click", function() {
		$("#dayButton").css("visibility", "hidden");
		$("#hourButton").css("visibility", "hidden");
		self.tempCallToBackend('day');
	});
	$("#dayButton").on("click", function() {
		$("#hourButton").css("visibility", "hidden");
		self.tempCallToBackend('hour');
	});
};



};

