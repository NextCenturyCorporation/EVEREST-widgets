/**
 * 24hour.js
 */

var day_heatChart_widget = {};

day_heatChart_widget.execute = function() {
	init();
};

day_heatChart_widget.update = function() {

	var sample_list = []; 
	var sl = 0;
	for (var q = 0; q < 24; ++q) {
		for (var m = 0; m < 60; m++) {
			if (Math.random() > 0.5) {
				var d = new Date(2013, 0, 30, q, m, 4, 567);
				sample_list[sl] = d.getTime(); //d.toISOString();
			}
			sl++;
		}
	}

	var updated_day_chunks = getDayChunks(sample_list);

	updateChart(updated_day_chunks);
	
};





// Constants
var MINUTES_PER_HOUR = 60;
var MINUTES_PER_DAY = 1440;
var HOURS_PER_DAY = 24;

var raw_data = [MINUTES_PER_DAY];
var day_chunks= [];

var numPoints = 1440,
		numRows = 24,
		numCols = 60,
		data = null,
		cells = null,
		color = d3.interpolateRgb("white", "blue");

for (var i = 0; i < MINUTES_PER_DAY; i++){
	raw_data[i] = 0;
}

var chart;

var sample_list = []; 

var updateChart = function(updated_day_chunks) {

	d3.select("#hourChart").selectAll("svg").data([]).exit().remove();
	
	createHeatchart(updated_day_chunks);
//  d3.select("#hourChart").selectAll("svg").data([updated_day_chunks]).enter().append('svg');
  
};

var getEmptyCells = function() {
  var emptyCells = [];
  for (var rowNum = 0; rowNum < numRows; rowNum++) {
      emptyCells.push([]);
      var row = emptyCells[emptyCells.length - 1];
      for (var colNum = 0; colNum < numCols; colNum++) {
          row.push({
          		title: rowNum + ":" + colNum,
          		value: 0,
              row: rowNum,
              col: colNum,
              density: 0,
              points: []
          });
      }
  }
  return emptyCells;
};

var clearCell = function(row, col) {
	cells[row][col].density = 0;
	cells[row][col].points = [];
};

var clearCells = function() {
    for (var rowNum = 0; rowNum < numRows; rowNum++) {
        for (var colNum = 0; colNum < numCols; colNum++) {
        	clearCell(rowNum, colNum);
        }
    }
};


day_heatChart_widget.execute2 = function() {

		
/*
 * 
	d3.select('#dayChart')
	.selectAll('svg')
	.data([day_chunks])
	.enter()
	.append('svg')
	.call(chart);
*/
	
	var sl = 0;
	for (var q = 0; q < 20; ++q) {
		for (var m = 0; m < 60; m=m+5) {
			var d = new Date(2013, 0, 30, q, m, 4, 567);
			sample_list[sl] = d.getTime(); //d.toISOString();
			sl++;
		}
	}
	
	
	//day_heatChart_widget.createChart(null, raw_data, day_chunks, hour_labels, minute_labels);
	
	day_heatChart_widget.getDayChunks(sample_list, day_chunks);
	
	updateChart(day_chunks);
	
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

var getEmptyDayChunks = function() {
	
	var day_chunks = [];
	
	for(var k = 0; k < MINUTES_PER_DAY; k++){

		var hour = k % HOURS_PER_DAY;
		var minutes = Math.floor((k / HOURS_PER_DAY) % MINUTES_PER_HOUR);

		if(minutes < 10) {
			minutes = "0" + minutes;
		}

		day_chunks[k] = {title: hour + ":" + minutes,
			value: 0};
	}
	
	return day_chunks;
};

var getDayChunks = function(time_list){
	
	var day_chunks = [];
	
	var raw_data = [MINUTES_PER_DAY];

	for (var i = 0; i < MINUTES_PER_DAY; i++){
		raw_data[i] = 0;
	}
	
	if (time_list !== null) {
		for (var j = 0; j < time_list.length; j++){
			var time = new Date(parseInt(time_list[j]));
			//var hours = time.getHours();

			// This will map the number of raw feeds for a specific date to the correct heat chart "chunk"
			raw_data[time.getHours() + (HOURS_PER_DAY * time.getMinutes())] += 1;

		}
	}

	for(var k = 0; k < MINUTES_PER_DAY; k++){

		var hour = k % HOURS_PER_DAY;
		var minutes = Math.floor((k / HOURS_PER_DAY) % MINUTES_PER_HOUR);

		if(minutes < 10) {
			minutes = "0" + minutes;
		}

		day_chunks[k] = {title: hour + ":" + minutes,
			value: raw_data[k]};
	}
	
	return day_chunks;
};

day_heatChart_widget.createChart = function(date_list, raw_data, day_chunks, hour_labels, minute_labels) {

	if (date_list !== null) {
	for (var j = 0; j < date_list.length; j++){
		var time = new Date(parseInt(date_list[j]));
		var hours = time.getHours();

		// This will map the number of raw feeds for a specific date to the correct heat chart "chunk"
		raw_data[time.getHours() + (HOURS_PER_DAY * time.getMinutes())] += 1;

	}
	}

	for(var k = 0; k < MINUTES_PER_DAY; k++){

		var hour = k % HOURS_PER_DAY;
		var minutes = Math.floor((k / HOURS_PER_DAY) % MINUTES_PER_HOUR);

		if(minutes < 10) {
			minutes = "0" + minutes;
		}

		day_chunks[k] = {title: hour + ":" + minutes,
			value: raw_data[k]};
	}

	day_heatChart_widget.drawChart(hours, day_chunks, hour_labels, minute_labels);
};

day_heatChart_widget.drawChart = function(hours, day_chunks, hour_labels, minute_labels) {

	var chart = circularHeatChart()
		.range(["white", "blue"])
		.radialLabels(minute_labels)
		.segmentLabels(hour_labels)
		.segmentHeight(4.7)
		.innerRadius(10);

	chart.accessor(function(d) {return d.value;});

	d3.select('#24hourChart')
		.selectAll('svg')
		.data([day_chunks])
		.enter()
		.append('svg')
		.call(chart);

	d3.selectAll("#24hourChart path").on('mouseover', function(){
			var d = d3.select(this).data()[0];
			d3.select("#24hourInfo").text(d.value + ' raw feed(s) added at  ' + d.title);
			});

	d3.selectAll("#24hourChart svg").on('mouseout', function(){
			//var d = d3.select(this).data()[0];
			d3.select("#24hourInfo").text('');
			});
};

var createHeatchart = function(day_chunks) {
	
	var hour_labels = ['00', '01', '02', '03', '04', '05', '06', '07', '08',
	              	    '09', '10', '11', '12', '13', '14', '15', '16', '17', '18',
	              	    '19', '20', '21', '22', '23'];

	var minute_labels = [];

	for (var i = 0; i < MINUTES_PER_HOUR; i++) {
		i % 10 === 0 && (i != 0 && i != 10) ? minute_labels.push(i) : minute_labels.push('');
	};
  
	this.chart = circularHeatChart()
	.range(["white", "blue"])
	.radialLabels(minute_labels)
	.segmentLabels(hour_labels)
	.segmentHeight(4.7)
	.innerRadius(10);

	chart.accessor(function(d) {return d.value;});
	
	d3.select("#hourChart")
		.selectAll('svg')
		.data([day_chunks])
		.enter()
		.append('svg')
		.call(chart);
	
	d3.selectAll("#hourChart path").on('mouseover', function(){
			var d = d3.select(this).data()[0];
			d3.select("#hourInfo").text(d.value + ' added at  ' + d.title);
			});
	
	d3.selectAll("#hourChart svg").on('mouseout', function(){
		//var d = d3.select(this).data()[0];
		d3.select("#hourInfo").text('');
		});
	
};

var init = function() {

	day_chunks = getEmptyDayChunks();
	
  createHeatchart(day_chunks);
};
