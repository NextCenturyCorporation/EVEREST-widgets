/**
 * heatChart.js
 */

var chartTime = new everest.heatChart.time();
var OWFheatChartWidget = new heatChartWidget();

var baseURL = "http://everest-build:8081";
var color = "";
var mode = "";
var numCols = 1;
var numRows = 1;
var samplePoints = 500000;
var fullTimeData = [];
var timeData = [];
var baseDate = chartTime.currentUTCTime();
var heatChart = {};

heatChart.init = function() {
	d3.select("#chart").selectAll("svg").data([]).exit().remove();

	var cells = chartTime.getEmptyTimeChunks(numRows, numCols);
	this.createHeatChart(cells);
};

heatChart.execute = function(modeChoice, feedType) {
	mode = modeChoice;
	this.getAllFeeds('rawfeed');
	
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

	this.init();
	this.update();
	this.handleModeButtons(modeChoice);
};

heatChart.update = function() {

	timeData = this.getTimeData();
	
	var updated_time_chunks = chartTime.getTimeChunks(baseDate, mode,timeData);
	this.updateChart(updated_time_chunks);
	
};

heatChart.updateNow = function() {

	baseDate = chartTime.currentUTCTime();
	this.update();
	this.handleModeButtons(mode);
	
};

heatChart.updateChart = function(updated_day_chunks) {

	d3.select("#chart").selectAll("svg").data([]).exit().remove();
	
	this.createHeatChart(updated_day_chunks);
//  d3.select("#hourChart").selectAll("svg").data([updated_day_chunks]).enter().append('svg');
  
};

heatChart.getTimeData = function() {
	if (0 === timeData.length ) {
		//Uncomment the portion below to get randomize sample data.
		//timeData = chartTime.getSampleTimes(samplePoints);
		timeData = [];
	}
	return timeData;
};

heatChart.getAllFeeds = function(feedType) {
	var feedURL = '';
	feedType = feedType.toLowerCase();
	if(feedType == 'alpha-report') {
		feedURL = '/alpha-report/dates';
	} else if(feedType == 'assertion') {
		feedURL = '/assertion/dates';
	} else {
		feedURL = '/rawfeed/dates';
	}

	$.ajax({
		type: "GET",
		url: baseURL + feedURL,
		dataType: 'jsonp',
		jsonpCallback: 'callback',
		success: function(data){
			timeData = data;
			heatChart.update();
			fullTimeData = data;
		},
		error: function(error){
			console.log("An Error Occurred Trying to retrieve all feeds: " + error);
		}
	});
};

heatChart.handleModeButtons = function(modeChoice){
	
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
	
	var monthLabel = chartTime.getMonthLabel(baseMonth);
	
	var dayOfWeekLabel = chartTime.getDayOfWeekLabel(baseDayOfWeek);
	
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
	OWFheatChartWidget.publishDateRange(mode, baseDate);
	
};

heatChart.createHeatChart = function(time_chunks) {
	var me = this;

	var rowLabels = chartTime.getMode(mode).rowLabels,
		columnLabels = chartTime.getMode(mode).columnLabels;	

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
	
	this.chart = new everest.circularHeatChart()
	.range(["white", color])
	.radialLabels(rowLabels)
	.segmentLabels(columnLabels)
	.segmentHeight(segHeight)
	.numSegments(numCols)
	.innerRadius(innerRadius);

	this.chart.accessor(function(d) {return d.value;});
	
	d3.select("#chart")
		.selectAll('svg')
		.data([time_chunks])
		.enter()
		.append('svg')
		.call(this.chart);

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
			me.handleDrillDown(d.title);
		}
	});
	
};

heatChart.handleDrillDown = function(cellDate){
	baseDate = new Date(cellDate);

	switch (mode) {
		//Announce Channel: com.nextcentury.everest.heatchart
		//Each time the heat chart is drilled down, announce the new date range
		//that appears in the chart.
	case "hour":
		break;

	case "day":
		heatChart.execute("hour");
		break;

	case "week":
		 heatChart.execute("day");
		break;
		
	case "month":
		heatChart.execute("day");
		break;

	case "year":
		heatChart.execute("month");
		break;
		
	case "year5":
		heatChart.execute("year");
		break;
	};

	OWFheatChartWidget.publishDateRange(mode, baseDate);

};

