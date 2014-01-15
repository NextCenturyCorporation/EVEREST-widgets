String.prototype.capitalize = function(){
       return this.replace( /(^|\s)([a-z])/g , function(m,p1,p2){ return p1+p2.toUpperCase(); } );
};

var DrillDownTimeline = function() {
	var self = this;
	var contextDate = Date.now();
	var baseURL = "http://everest-build:8081";
	var monthNames = [ "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December" ];
	var contextMode = {0: '5year', 1: 'year', 2: 'month', 3: 'day', 4: 'hour', 5: 'minute', 6:'second'};
	var currentContextMode = 0;
	var feedSource = 'rawfeed';
	$("#baseDate").text("Context Date:" + new Date(contextDate).toISOString());
	$('.dropdown-toggle').dropdown();
	$('#rawfeed, #alpha-report, #assertion').on('click', function(e){
		feedSource = e.toElement.id;
		var feedSourceText = $('#dropdown-menu').text();
		$('#dropdown-menu').text(feedSourceText.slice(0, feedSourceText.indexOf(':') + 2) + feedSource.replace('-', ' ').capitalize());
		self.getDatesAndFrequency('year', buildYearRequest());
	});
	var chartWidget = new TimeRangeWidgetComponent();

	self.getDatesAndFrequency = function(mode, dateArr, filter) {
		var buildData = [];
		for(var i= 0; i < dateArr.length; i++) {
			buildData.push({mode: mode, bucketDate: dateArr[i]});
		}
		$.ajax({
		    url: baseURL + "/"+ feedSource + "/dates",
		    data: JSON.stringify({dates: buildData}),
		    type: 'POST',
		    contentType: "application/json; charset=utf-8",
		}).done(function(data) {
			if(filter) {
				data = data.filter(function(date) {
					return date.frequency > 0;
				});
			}
			self.repaint(data);
		});
	};


	var updateAndSetBaseDate = function(date) {
		$("#baseDate").text("Context Date:" + new Date(date).toISOString());
	};



self.init = function() {
	self.getDatesAndFrequency('year', buildYearRequest());

	$("#year5Button").on("click", year5ButtonClicked);
	$("#yearButton").on("click", yearButtonClicked);
	$("#monthButton").on("click", monthButtonClicked);
	$("#dayButton").on("click", dayButtonClicked);

	var margin = {top: 20, right: 20, bottom: 80, left: 40},
		width = 960 - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom;

	var formatPercent = d3.format(".0");

	var x = d3.scale.ordinal().rangeRoundBands([0, width], 0.1);

	var y = d3.scale.linear().range([height, 0]);

	var xAxis = d3.svg.axis().scale(x).orient("bottom");

	var yAxis =  d3.svg.axis().scale(y).orient("left").tickFormat(formatPercent);

	var svg = d3.select("body").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	d3.select("svg").call(d3.behavior.zoom()
		.on("zoom", function() {
			if(isPos(d3.event.sourceEvent.wheelDelta) && d3.event.sourceEvent.wheelDelta > 110) {//in
				var selected = filterFreqGreaterThan1(d3.selectAll("rect.selected"));
				var data = d3.select(selected[0][0]).data()[0];
				if(typeof data !== 'undefined') {
					setBreadCrumbValues(data.date);
					handleClickEvents(data.date.toString());
				}
			} else if(d3.event.sourceEvent.wheelDelta < 110) {//out
				var backup = currentContextMode -1;
				if(backup >= 0) {
					self.getDatesAndFrequency(contextMode[currentContextMode], new Date(contextDate));
					buttonClicked(contextMode[backup]);
					currentContextMode--;
				}
			}
		}));

	var isPos = function(num){ return num > 0; };

	var filterFreqGreaterThan1 = function(array) {
		return array.filter(function(element) {
			return element.frequency > 0;
		});
	};

	var tip = d3.tip()
		.attr('class', 'd3-tip')
		.offset([-10, 0])
		.html(function(d) {
			return "<strong>Frequency:</strong> <span style='color:red'> " + d.frequency + "</span></br></br>" +
			" <strong>Date:</strong> <span style='color:red'> " + d.date + "</span>";
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

	self.repaint = function(data) {
		x.domain(data.map(function(d) { return d.date; }));
		y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

		svg.selectAll("g").remove();//remove all old labels.
		createLabels();

		var rectsNew = svg.selectAll(".bar")
			.data(data);

		rectsNew
			.enter().append("rect")
			.attr("class", "bar")
			.on("click", handleClickEvents);


		var outDelay = 800;
		var rect = svg.selectAll("rect")
			.transition()
			.style("fill", "steelblue")
			.attr({
				y: height,
				height: 0
			}).duration(outDelay)
			.remove();

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
			.attr("height", (height/2));



  		function brushstart() {
			svg.classed("selecting", true);
		}

		function brushmoveY() {
			var s = d3.event.target.extent();
			rectsNew.classed("selected", function(d) {
				return s[0] <= d.frequency;
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

var handleClickEvents = function() {
	var dateArr = [];
	var filter = false;

	if(d3.selectAll(".selected").data().length > 0) {
		var date =d3.selectAll(".selected").data()[0].date;
		var data = d3.selectAll(".selected").data();
		for(var i =0; i < data.length; i++) {
			dateArr.push(data[i].date);
		}
		filter = true;
	} else {
		var date = d3.select(this).data()[0].date.toString();
		setBreadCrumbValues(d3.select(this).data()[0].date);
		dateArr.push(d3.select(this).data()[0].date.toString());
	}
		var selected = d3.selectAll(".selected").data();
		var year = /^\d{4}/gi;
		var month = /^\d{4}-\d{1,2}/i;
		var day = /^\d{4}-\d{1,2}-\d{1,2}/i;
		var hour = /^\d{4}-\d{1,2}-\d{1,2}\s*\d{2}:\d{2}/i;

		contextDate = new Date(contextDate);
		 if(hour.test(date)){
		 	date = date.substring(date.lastIndexOf(' ') + 1, date.length);
		 	contextDate.setUTCHours(milToHours(date));
		 	contextDate = contextDate.getTime();
		 	currentContextMode = 4;
		 	self.getDatesAndFrequency('minute', buildMinuteRequest(dateArr), filter);
		 	setBreadCrumbValues(contextDate, 'hour');
		 	chartWidget.publishDateRange('hour', new Date(contextDate));
		 } else if(day.test(date)) {
		 	date = date.substring(date.lastIndexOf('-') + 1, date.length);
		 	contextDate.setDate(parseInt(date));
		 	contextDate = contextDate.getTime();
		 	currentContextMode = 3;
		 	self.getDatesAndFrequency('hour', buildHourRequest(dateArr), filter);
		 	setBreadCrumbValues(contextDate, 'day');
		 	chartWidget.publishDateRange('day', new Date(contextDate));
		 } else if(month.test(date)) {
		 	date = date.substring(date.indexOf('-') + 1, date.length);
		 	date = parseInt(date) - 1;
		 	contextDate.setMonth(date);
		 	contextDate = contextDate.getTime();
		 	currentContextMode = 2;
		 	self.getDatesAndFrequency('day', buildDayRequest(dateArr), filter);
		 	setBreadCrumbValues(contextDate, 'month');
		 	chartWidget.publishDateRange('month', new Date(contextDate));
		 }  else if(year.test(date)) {
		 	contextDate.setFullYear(date);
		 	contextDate = contextDate.getTime();
		 	currentContextMode = 1;
		 	self.getDatesAndFrequency('month', buildMonthRequest(dateArr), filter);
		 	setBreadCrumbValues(contextDate, 'year');
		 	chartWidget.publishDateRange('year', new Date(contextDate));
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
	if(mode === 'year') {
		$("#yearButton").text(tempDate.getFullYear());
		$("#yearButton").css("visibility", "visible");
	} else if(mode === 'month') {
		$("#monthButton").text(monthNames[tempDate.getMonth()]);
		$("#monthButton").css("visibility", "visible");
	} else if(mode === 'day') {
		$("#dayButton").text(tempDate.getUTCDate());
		$("#dayButton").css("visibility", "visible");
	} else if(mode === 'hour') {
		$("#hourButton").text(tempDate.getUTCHours() + ":00");
		$("#hourButton").css("visibility", "visible");
	}
};

var year5ButtonClicked = function() {
	$("#yearButton, #monthButton, #dayButton, #hourButton").css("visibility", "hidden");
	currentContextMode = 1;
	self.getDatesAndFrequency('year', buildYearRequest([new Date(contextDate)]));
};

var yearButtonClicked = function() {
	$("#monthButton, #dayButton, #hourButton").css("visibility", "hidden");
	currentContextMode = 2;
	self.getDatesAndFrequency('month',  buildMonthRequest([new Date(contextDate)]));
};

var monthButtonClicked = function() {
	$("#dayButton, #hourButton").css("visibility", "hidden");
	currentContextMode = 3;
	self.getDatesAndFrequency('day',  buildDayRequest([new Date(contextDate)]));
};

var dayButtonClicked = function() {
	$("#hourButton").css("visibility", "hidden");
	currentContextMode = 4;
	self.getDatesAndFrequency('hour', buildHourRequest([new Date(contextDate)]));
};

var buttonClicked = function(mode) {
	switch(mode) {
		case '5year':year5ButtonClicked();break;
		case 'year':yearButtonClicked();break;
		case 'month':monthButtonClicked();break;
		case 'day':dayButtonClicked();break;
	}
};

var buildYearRequest = function() {
	return ['2011', '2012', '2013', '2014', '2015'];
};

var buildMonthRequest = function(dateArr) {
	var resultArr = [];
	for(var i =0; i < dateArr.length; i++) {
		var date = moment(dateArr[i]).utc();
		for(var j = 1; j <= 12; j++) {
			resultArr.push(date.format('YYYY-' + precedeWithZero(j)));
		}
	}
	return resultArr;
};

var buildDayRequest = function(dateArr) {
	var resultArr = [];
	for(var i =0; i < dateArr.length; i++) {
		var date = moment(dateArr[i]).utc();
		for(var j = 1; j <= date.daysInMonth(); j++) {
			resultArr.push(date.format('YYYY-MM-' + precedeWithZero(j)));
		}
	}
	return resultArr;
};

var buildHourRequest = function(dateArr) {
	var resultArr = [];
	for(var i =0; i < dateArr.length; i++) {
		var date = moment(dateArr[i]);
		for(var j = 0; j <= 23; j++) {
			resultArr.push(date.format('YYYY-MM-DD ' + precedeWithZero(j) + ":00"));
		}
	}
	return resultArr;
};

var buildMinuteRequest = function(dateArr) {
	var resultArr = [];
	for(var i =0; i < dateArr.length; i++) {
		var date = moment(dateArr[i]).subtract('hours', 4);
		for(var j = 0; j <= 59; j++) {
			resultArr.push(date.format('YYYY-MM-DD HH:' + precedeWithZero(j)));
		}
	}
	return resultArr;
};

var precedeWithZero = function(num) {
	return num < 10 ? ('0' + num) : num;
};

};

