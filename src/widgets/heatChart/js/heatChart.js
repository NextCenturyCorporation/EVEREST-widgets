/**
 * 24hour.js
 */

var color = "";
var mode = "";
var numCols = 1; 
var numRows = 1; 
var samplePoints = 1000;
var sampleTimes = [];
var baseDate = new Date(Date.now());

var heatChart_widget = {};

heatChart_widget.execute = function(modeChoice) {
	mode = modeChoice;
	
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

	};

	init();
	this.update();
};

heatChart_widget.update = function() {

	if (0 === sampleTimes.length ) {
		sampleTimes = getSampleTimes(samplePoints);
	}
	
	var updated_time_chunks = getTimeChunks(mode,sampleTimes);
	updateChart(updated_time_chunks);
	
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


heatChart_widget.execute2 = function() {
/*
	owfdojo.addOnLoad(function(){
		OWF.ready(function(){
			OWF.Eventing.subscribe("com.nextcentury.everest.data_table_announcing.raw_data", function(sender, msg){
				// Get an array of all date objects
				var fields_start = msg.split("[");
				var fields_end = fields_start[1].split("]");
				var fields = fields_end[0];
				var date_list = fields.split(",");

				day_heatChart_widget.createChart(date_list, raw_data, day_chunks, hour_labels, minute_labels);
			});
		});
	});
*/
}; // end of execute()

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
		d3.select("#baseDate").text(baseDate.toString());

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
			hour = time.getHours();
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
			
		case "month":
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
			break;
			
		case "year5":
			col_labels.push('2011');  // TODO: fix labels to be data driven
			col_labels.push('2012');
			col_labels.push('2013');
			col_labels.push('2014');
			col_labels.push('2015');
			
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
	
	d3.selectAll("#chart path").on('mouseover', function(){
		var d = d3.select(this).data()[0];
		if (0 !== d.value) {
			d3.select("#info").text(d.value + ' added at  ' + d.title);
		}
	});
	
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
	switch (mode) {

	case "hour":
		break;

	case "day":
		baseDate = new Date(cellDate);
		heatChart_widget.execute("hour");
		break;

	case "week":
		baseDate = new Date(cellDate);
		heatChart_widget.execute("day");
		break;
		
	case "month":
		baseDate = new Date(cellDate);
		heatChart_widget.execute("day");
		break;

	case "year":
		baseDate = new Date(cellDate);
		heatChart_widget.execute("month");
		break;
		
	case "year5":
		baseDate = new Date(cellDate);
		heatChart_widget.execute("year");
		break;
		
	};
	
};

var init = function() {

	d3.select("#chart").selectAll("svg").data([]).exit().remove();

	var cells = getEmptyTimeChunks();
  createHeatchart(cells);
};

