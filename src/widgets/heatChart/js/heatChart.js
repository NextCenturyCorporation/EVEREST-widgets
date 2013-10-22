
/**
 * heatChart.js
 */
var baseURL = "http://everest-build:8081";
var heatChartChannel = "com.nextcentury.everest.heatchart";
var color = "";
var mode = "";
var numCols = 1;
var numRows = 1;
var samplePoints = 500000;
var fullTimeData = [];
var timeData = [];
var baseDate = new Date(Date.now());

var heatChart_widget = {};

heatChart_widget.execute = function(modeChoice) {
	mode = modeChoice;
	getAllFeeds();
	
	switch (mode) {

	case "hour":
		color = 'cyan';
		numCols = 60;  // 
		numRows = 60;  // 
		break;

	case "day":
		color = 'blue';
		numCols = 24;  // 
		numRows = 60;  // 
		break;

	case "week":
		color = 'lime';
		numCols = 7;  // 
		numRows = 24;  // 
		break;
		
	case "month":
		color = 'red';
		numCols = 31;  // 
		numRows = 24;  // 
		break;

	case "year":
		color = 'orange';
		numCols = 12;  // 
		numRows = 31;  // 
		break;
		
	case "year5":
		color = 'magenta';
		numCols = 5;  // 
		numRows = 12;  // 
		break;
		
	default :
		mode = "month";
		color = "red";
		numCols = 31;  // 
		numRows = 24;  // 

	}

	init();
	this.update();
	handleModeButtons(modeChoice);
};

heatChart_widget.update = function() {

	timeData = getTimeData();
	
	var updated_time_chunks = getTimeChunks(mode,timeData);
	updateChart(updated_time_chunks);
	
};

heatChart_widget.updateNow = function() {

	baseDate = new Date(Date.now());
	this.update();
	handleModeButtons(mode);
	
};

/**
 * 
 */
var getTimeData = function() {
	if (0 === timeData.length ) {
		//Uncomment the portion below to get randomize sample data.
		//timeData = getSampleTimes(samplePoints);
		timeData = [];
	}
	return timeData;
};

var getOWFDateEvents = function() {
	console.log("now getting events");
	var workflow = 'com.nextcentury.everest.data_table_announce.raw_data';
	OWF.ready(function(){
		OWF.Eventing.subscribe(workflow, function(sender, msg){
			var data = JSON.parse(msg);
			if(data && data.times) {
				if(timeData.toString() != data.times.toString()) {
					timeData = data.times;
					heatChart_widget.update();
					//console.log("00000000000000000000000000000000000000000");
					console.log(data.times);
					//console.log("00000000000000000000000000000000000000000");
				}
			}
			
			//obj.handleReceiveAlphaReportData(data._id);
		});
	});
};

var filterDownDates = function(start, end) {
	fullTimeData.filter(function(element) {
		return element >= Date.parse(start) && element <=Date.parse(end);
	});
};


var getAllFeeds = function() {
	$.ajax({
		type: "GET",
		url: baseURL + '/rawfeed/dates',
		dataType: 'jsonp',
		jsonpCallback: 'callback',
		success: function(data){
			timeData = data;
			heatChart_widget.update();
			fullTimeData = data;
		},
		error: function(error){
			console.log("An Error Occurred Trying to retrieve all feeds: " + error);
		}
	});
};



/**
 * getMonthLabel is a utility function to return the three character
 * string month name for a JavaScript monthValue.
 */
var getMonthLabel = function(monthValue){
	var monthLabel = '';
	switch (monthValue) {
	case 0: monthLabel = 'JAN'; break;
	case 1: monthLabel = 'FEB'; break;
	case 2: monthLabel = 'MAR'; break;
	case 3: monthLabel = 'APR'; break;
	case 4: monthLabel = 'MAY'; break;
	case 5: monthLabel = 'JUN'; break;
	case 6: monthLabel = 'JUL'; break;
	case 7: monthLabel = 'AUG'; break;
	case 8: monthLabel = 'SEP'; break;
	case 9: monthLabel = 'OCT'; break;
	case 10: monthLabel = 'NOV'; break;
	case 11: monthLabel = 'DEC'; break;
	}
	return monthLabel;
};

/**
 * getDayOfWeekLabel is a utility function to return the three character
 * string day name for a JavaScript dayOfWeekValue.
 */
var getDayOfWeekLabel = function(dayOfWeekValue){
	var dayOfWeekLabel = '';
	switch (dayOfWeekValue) {
	case 0: dayOfWeekLabel = 'SUN'; break;
	case 1: dayOfWeekLabel = 'MON'; break;
	case 2: dayOfWeekLabel = 'TUE'; break;
	case 3: dayOfWeekLabel = 'WED'; break;
	case 4: dayOfWeekLabel = 'THU'; break;
	case 5: dayOfWeekLabel = 'FRI'; break;
	case 6: dayOfWeekLabel = 'SAT'; break;
	}
	return dayOfWeekLabel;
};


var handleModeButtons = function(modeChoice){
	
	var baseYear = baseDate.getFullYear();
	var baseMonth = baseDate.getMonth();
	var baseDay = baseDate.getDate();
	var baseDayOfWeek = baseDate.getDay();
	var baseHour = baseDate.getHours();

	d3.select("#hourButton").text('Hour');
	d3.select("#dayButton").text('Day');
	d3.select("#weekButton").text('Week');
	d3.select("#monthButton").text('Month');
	d3.select("#yearButton").text('Year');
	d3.select("#year5Button").text('5-Year');
	
	var monthLabel = getMonthLabel(baseMonth);
	
	var dayOfWeekLabel = getDayOfWeekLabel(baseDayOfWeek);
	
	var dayLabel = baseDay;
	if (dayLabel < 10) { dayLabel = '0' + dayLabel;}
	
	var hourLabel = baseHour;
	if (hourLabel < 10) { hourLabel = '0' + hourLabel + '00';}
	else { hourLabel = hourLabel + '00';}

	switch (modeChoice) {

	case "hour":
		d3.select("#yearButton").text(baseYear);
		d3.select("#monthButton").text(monthLabel);
		d3.select("#weekButton").text(dayOfWeekLabel);
		d3.select("#dayButton").text(dayLabel);
		d3.select("#hourButton").text(hourLabel);
		break;

	case "day":
		d3.select("#yearButton").text(baseYear);
		d3.select("#monthButton").text(monthLabel);
		d3.select("#weekButton").text(dayOfWeekLabel);
		d3.select("#dayButton").text(dayLabel);
		break;

	case "week":
		d3.select("#yearButton").text(baseYear);
		d3.select("#monthButton").text(monthLabel);
		d3.select("#weekButton").text(dayOfWeekLabel);
		break;
		
	case "month":
		d3.select("#yearButton").text(baseYear);
		d3.select("#monthButton").text(monthLabel);
		break;

	case "year":
		d3.select("#yearButton").text(baseYear);
		break;
		
	case "year5":
		d3.select("#yearButton").text(baseYear);
		break;
		
	};

	d3.select("#baseDate").text("Context Date: " + baseDate.toString());

	
};

/***
 * getSampleTimes is a utility function to generate numSamplePoints time values
 */
var getSampleTimes = function(numSamplePoints){
	var sample_list = [];
	var thirties = [3,5,8,10];   // Jan = 0, Dec = 11

	var curYear = new Date(Date.now()).getFullYear();
	
	for (var sl = 0; sl < numSamplePoints; sl++) {
		var month = Math.floor((Math.random()*12));  // 0 - 11 for months in Date
		var day;
		if (1 === month) {													// month 1 = February
			day = Math.floor((Math.random()*28) +1);
		} else if (_.contains(thirties,month) ) {
			day = Math.floor((Math.random()*30)) +1;
		} else {
			day = Math.floor((Math.random()*31)) +1;
		}
		var hour = Math.floor((Math.random()*24));    // 0 - 23
		var minute = Math.floor((Math.random()*60));  // 0 - 59
		var second = Math.floor((Math.random()*60));  // 0 - 59
		var year = (curYear - 2) + Math.floor((Math.random()*5));
		
		var d = new Date(year, month, day, hour, minute, second, 0);
		sample_list[sl] = d.getTime(); //d.toISOString();
	}

	return sample_list;
};


var updateChart = function(updated_day_chunks) {

	d3.select("#chart").selectAll("svg").data([]).exit().remove();
	
	createHeatchart(updated_day_chunks);
//  d3.select("#hourChart").selectAll("svg").data([updated_day_chunks]).enter().append('svg');
  
};

/***
 * getEmptyTimeChunks sets up the "cells" in the circular chart and creates
 * a cell for all of the possible cells based on the number of columns (wedges)
 * and number of rows (rings).
 */
var getEmptyTimeChunks = function() {
	var numPoints = numCols * numRows;
	var time_chunks = [];
	for(var k = 0; k < numPoints; k++){
		var col = k % numCols;
		var row = (Math.floor(k / numCols)) % numRows;
		if (col < 10) { col = "0" + col; }
		if (row < 10) { row = "0" + row; }
		time_chunks[k] = {title: col + ":" + row, value: 0};
	}
	return time_chunks;
};

/***
 * getTimeChunks takes in a list of date/time values and places them into the
 * corresponding cell depending upon the coarseness (mode) selected.
 */
var getTimeChunks = function(mode, time_list){
	
	var numPoints = numCols * numRows;
	var time_chunks = [];
	var raw_data = [numPoints];
	var title = [numPoints];
	
	for (var i = 0; i < numPoints; i++){
		raw_data[i] = 0;
		title[i] = "";
	}

	// This will map the number of raw feeds for a specific date to the correct heat chart "chunk"
	
	if (time_list !== null) {
		
		var time, year, month, day, dayofweek, hour, minutes, seconds;
		
		// baseDate is a global date used as a benchmark for focusing the display
		var baseYear = baseDate.getFullYear();
		var baseMonth = baseDate.getMonth();
		var baseDay = baseDate.getDate();
		var baseDayofweek = baseDate.getDay();
		var baseHour = baseDate.getHours();
		var wsd = baseDay - baseDayofweek;
		var weekStartDate = new Date(baseDate);
		weekStartDate.setDate(wsd);
		weekStartDate.setHours(0);
		weekStartDate.setMinutes(0);
		weekStartDate.setSeconds(0);
		weekStartDate.setMilliseconds(0);
		
		var wend = baseDay + (6 - baseDayofweek);
		var weekEndDate = new Date(baseYear, baseMonth, wend, 23, 59, 59, 999);
		
		var year5StartDate = new Date((baseYear - 2), 0, 1, 0, 0, 0, 0);
		var year5EndDate = new Date((baseYear + 2), 11, 31, 23, 59, 59, 999);
		var year5StartYear = year5StartDate.getFullYear();
		
		
		for (var j = 0; j < time_list.length; j++) {
			time = new Date(parseInt(time_list[j]));
			year = time.getFullYear();
			month = time.getMonth();
			day = time.getDate();
			dayofweek = time.getDay();
			hour = time.getUTCHours();
			minutes = time.getMinutes();
			seconds = time.getSeconds();
			
			switch (mode) {
			
			case "hour":
				if ( (baseYear === year) & (baseMonth === month) & (baseDay === day) & (baseHour === hour) ) {
					var ndx = minutes + (numCols * seconds);
					raw_data[ndx] += 1;
					title[ndx] = time.toString();
				}
				break;
				
			case "day":
				if ( (baseYear === year) & (baseMonth === month) & (baseDay === day) ) {
					var ndx = hour + (numCols * minutes); 
					raw_data[ndx] += 1;
					title[ndx] = (new Date(year, month, day, hour, minutes, 0, 0)).toString();
				}
				break;
				
			case "week":
				if ((time > weekStartDate) & (time <= weekEndDate)) {
					var ndx = dayofweek + (numCols * hour); 
					raw_data[ndx] += 1;
					title[ndx] =  (new Date(year, month, day, hour, 0, 0, 0)).toString();
				}
				break;
	
			case "month":
				if ( (baseYear === year) & (baseMonth === month) ) {
					var ndx = (day -1) + (numCols * hour); 
					raw_data[ndx] += 1;
					title[ndx] =  (new Date(year, month, day, hour, 0, 0, 0)).toString();
				}
				break;

			case "year":
				if ( (baseYear === year) ) {
					var ndx = month + (numCols * (day-1) ); 
					raw_data[ndx] += 1;
					title[ndx] =  (new Date(year, month, day, 0, 0, 0, 0)).toString();
				}
				break;
				
			case "year5":
				if ((time >= year5StartDate) & (time <= year5EndDate)) {
					var ndx = (year - year5StartYear) + (numCols * month ); 
					raw_data[ndx] += 1;
					title[ndx] =  (new Date(year, month, 1, 0, 0, 0, 0)).toString();
				}
				break;

			}
		}
	}

	for(var k = 0; k < numPoints; k++){
		time_chunks[k] = {title: title[k], value: raw_data[k]};
	}
	
	return time_chunks;
};

/***
 * createHeatchart
 */
var createHeatchart = function(time_chunks) {
	
	var row_labels = [];

/*
	for (var rl = 0; rl < numRows; rl++){
		if (rl < 10) {
			row_labels.push('0'+rl);
		} else {
			row_labels.push(rl);			
		}
	}
*/
	var col_labels = [];

/*
 * 
	for (var i = 0; i < numCols; i++) {
		i % 10 === 0 && (i != 0 && i != 10) ? col_labels.push(i) : col_labels.push('');
	};
*/
	switch (mode) {
	
		case "week":
			col_labels.push('Sunday');
			col_labels.push('Monday');
			col_labels.push('Tuesday');
			col_labels.push('Wednesday');
			col_labels.push('Thursday');
			col_labels.push('Friday');
			col_labels.push('Saturday');
			break;
			
		case "day": // begin with '0'
			for (var cl = 0; cl < numCols; cl++) {
				if (cl < 10) {
					col_labels.push('0'+cl+'00');
				} else {
					col_labels.push(cl+'00');			
				}
			}
			break;
			
		case "month": // begin with '1'
			for (var cl = 1; cl <= numCols; cl++) {
				if (cl < 10) {
					col_labels.push('0'+cl);
				} else {
					col_labels.push(cl);			
				}
			}
			break;

		case "year":
			col_labels.push('January');
			col_labels.push('February');
			col_labels.push('March');
			col_labels.push('April');
			col_labels.push('May');
			col_labels.push('June');
			col_labels.push('July');
			col_labels.push('August');
			col_labels.push('September');
			col_labels.push('October');
			col_labels.push('November');
			col_labels.push('December');

			for (var rl = 1; rl <= numRows; rl++) {
				if ((rl%7) === 0) {
					row_labels.push(rl);
				} else {
					row_labels.push('');			
				}
			}
			
			break;
			
		case "year5":
			var baseYear = baseDate.getFullYear();
			col_labels.push(baseYear-2);
			col_labels.push(baseYear-1);
			col_labels.push(baseYear);
			col_labels.push(baseYear+1);
			col_labels.push(baseYear+2);
			
			row_labels.push('JAN');
			row_labels.push('FEB');
			row_labels.push('MAR');
			row_labels.push('APR');
			row_labels.push('MAY');
			row_labels.push('JUN');
			row_labels.push('JUL');
			row_labels.push('AUG');
			row_labels.push('SEP');
			row_labels.push('OCT');
			row_labels.push('NOV');
			row_labels.push('DEC');
			break;
			
		default :
			for (var cl = 0; cl < numCols; cl++) {
				if (cl < 10) {
					col_labels.push('0'+cl);
				} else {
					col_labels.push(cl);			
				}
			}
	};
	

	var chartWidth = 300;
	try {
		var cw = d3.select("#chart").style('width');
		chartWidth = cw.split('px')[0];
	} catch (err) {
		console.log(err);
	}
	
	// numRows + 1 due to the size of the innerRadius
	var segHeight = chartWidth / (numRows +1);
	var innerRadius = segHeight;
	if (innerRadius < 10) { innerRadius = 10;}
	
	this.chart = circularHeatChart()
	.range(["white", color])
	.radialLabels(row_labels)
	.segmentLabels(col_labels)
	.segmentHeight(segHeight)
	.numSegments(numCols)
	.innerRadius(innerRadius);

	chart.accessor(function(d) {return d.value;});
	
	d3.select("#chart")
		.selectAll('svg')
		.data([time_chunks])
		.enter()
		.append('svg')
		.call(chart);

	var tooltip = d3.select("body")
		.append("div")
		.style("position", "absolute")
		.style("z-index", "10")
		.style("visibility", "hidden")
		.text("a simple tooltip");

	d3.selectAll("#chart path")
	.on('mouseover', function(){
		var d = d3.select(this).data()[0];
		if (0 !== d.value) {
			return tooltip.style("visibility", "visible").text(d.value + ' added at  ' + d.title);
		}
	})
	.on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
	.on("mouseout", function(){return tooltip.style("visibility", "hidden");});
	
	d3.selectAll("#chart svg").on('mouseout', function(){
		//var d = d3.select(this).data()[0];
		d3.select("#info").text('');
		});

	d3.selectAll("#chart path").on('click', function(){

		var d = d3.select(this).data()[0];
		if (0 !== d.value) {
			handleDrillDown(d.title);
		}
	});
	
};

var handleDrillDown = function(cellDate){
	var checkOWF;
	if(OWF.Eventing.publish) {
		checkOWF = OWF.Eventing.publish;
	} else {
		checkOWF = function() {
			console.log("OWF Eventing API is not accessible");
		}
	}
	
	switch (mode) {
		//Announce Channel: com.nextcentury.everest.heatchart
		//Each time the heat chart is drilled down, announce the new date range
		//that appears in the chart.
	case "hour":
		baseDate = new Date(cellDate);
		break;

	case "day":
		baseDate = new Date(cellDate);
		checkOWF(heatChartChannel,JSON.stringify(
			{startTime: toLocaleHours(baseDate), endTime: toLocaleHours(addHours(baseDate, 1))}));
		
		heatChart_widget.execute("hour");
		break;

	case "week":
		 baseDate = new Date(cellDate);
		 heatChart_widget.execute("day");
		break;
		
	case "month":
		baseDate = new Date(cellDate);
		checkOWF(heatChartChannel,JSON.stringify(
			{startTime: setDateHourZero(baseDate), endTime: setDateHour24(baseDate)}));
		heatChart_widget.execute("day");
		break;

	case "year":
		baseDate = new Date(cellDate);
		checkOWF(heatChartChannel,JSON.stringify(
			{startTime: getFirstDateOfMonth(baseDate), endTime: getLastDateOfMonth(baseDate)}));
		heatChart_widget.execute("month");
		break;
		
	case "year5":
		checkOWF(heatChartChannel,JSON.stringify(
			{startTime: getFirstDateOfYear(baseDate), endTime: getLastDateOfYear(baseDate)}));
		baseDate = new Date(cellDate);
		heatChart_widget.execute("year");
		break;
	
	};
};
//The Following functions are helper functions designed to get date ranges to send for 
//OWF eventing.
var setDateHourZero = function(time) {
	var tempTime = new Date(time);
	tempTime.setUTCHours(0);
	return tempTime;
};

var setDateHour24 = function(time) {
	var tempTime = new Date(time);
	tempTime.setUTCHours(24);
	return tempTime;
};

var addHours = function(time, h) {
	var tempTime = new Date(time);
	tempTime.setTime(tempTime.getTime() + (h*60*60*1000));
	return tempTime;
};

var toLocaleHours = function(time) {
	var tempDate = new Date(time + " UTC");
	tempDate .setUTCMinutes(0);
	return tempDate;
};

var getFirstDateOfYear = function(date) {
	var tempDate = date;
	tempDate = new Date(tempDate.getFullYear(), 0, 1);
	tempDate.setUTCHours(0);
	return tempDate;
};


var getLastDateOfYear = function(date) {
	var tempDate = date;
	tempDate = new Date(tempDate.getFullYear(), 11, 31, 24);
	tempDate.setUTCHours(0);
	return tempDate;
};

var getFirstDateOfMonth = function(date) {
	var tempDate = date;
	tempDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), 1);
	tempDate.setUTCHours(0);
	return tempDate;
};

var getLastDateOfMonth = function(date) {
	var tempDate = date;
	tempDate = new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 0, 24);
	tempDate.setUTCHours(0);
	return tempDate;
};

//End Date Helper Functions

var init = function() {

	d3.select("#chart").selectAll("svg").data([]).exit().remove();

	var cells = getEmptyTimeChunks();
  createHeatchart(cells);
};

