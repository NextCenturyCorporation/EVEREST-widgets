// Constants
var MINUTES_PER_HOUR = 60;
var MINUTES_PER_DAY = 1440;
var HOURS_PER_DAY = 24;

var day_heatChart_widget = {};

day_heatChart_widget.execute = function() {

	var hour_labels = ['00', '01', '02', '03', '04', '05', '06', '07', '08',
	    '09', '10', '11', '12', '13', '14', '15', '16', '17', '18',
	    '19', '20', '21', '22', '23'];
	var minute_labels = [];
	var raw_data = [MINUTES_PER_DAY];
	var day_chunks= [];

	for (var i = 0; i < MINUTES_PER_HOUR; i++) {
		i % 10 === 0 ? minute_labels.push(i) : minute_labels.push('');
	}

	for (var i = 0; i < MINUTES_PER_DAY; i++){
		raw_data[i] = 0;
	}

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
};

day_heatChart_widget.createChart = function(date_list, raw_data, day_chunks, hour_labels, minute_labels) {

	for (var j = 0; j < date_list.length; j++){
		var time = new Date(parseInt(date_list[j]));
		var hours = time.getHours();

		// This will map the number of raw feeds for a specific date to the correct heat chart "chunk"
		raw_data[time.getHours() + (HOURS_PER_DAY * time.getMinutes())] += 1;

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

	chart.accessor(function(d) {return d.value});

	d3.select('#dayChart')
		.selectAll('svg')
		.data([day_chunks])
		.enter()
		.append('svg')
		.call(chart);

	d3.selectAll("#dayChart path").on('mouseover', function(){
			var d = d3.select(this).data()[0];
			d3.select("#dayInfo").text(d.value + ' raw feed(s) added at  ' + d.title);
			});

	d3.selectAll("#dayChart svg").on('mouseout', function(){
			//var d = d3.select(this).data()[0];
			d3.select("#dayInfo").text('');
			});
};
