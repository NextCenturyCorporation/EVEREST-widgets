var HOURS_PER_WEEK = 168;
var DAYS_PER_WEEK = 7;

var week_heatChart_widget = {};

week_heatChart_widget.execute = function() {

	var day_labels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',
		'Saturday'];
	var hour_labels = [];
	var raw_data = [HOURS_PER_WEEK];
	var week_chunks = [];

	for (var i = 0; i < HOURS_PER_DAY; i++) {
		i % 4 === 0 ? minute_labels.push(i) : minute_labels.push('');
	}

	for (var i = 0; i < HOURS_PER_WEEK; i++) {
		raw_data[i] = 0;
	}

	owfdojo.addOnLoad(function() {
		OWF.ready(function() {
			OWF.Eventing.subscribe("com.nextcentury.everest.data_table_announcing.raw_data", function(sender, msg) {
				// Get an array of all date objects
				var fields_start = msg.split("[");
				var fields_end = fields_start[1].split("]");
				var fields = fields_end[0];
				var date_list = fields.split(",");

				week_heatChart_widget.createChart(date_list, raw_data, week_chunks, day_labels);

			});
		});
	});
};

week_heatChart_widget.createChart = function(date_list, raw_data, week_chunks, day_labels) {

	for (var j = 0; j < date_list.length; j++) {
		var time = new Date(parseInt(date_list[j]));

		// This will map the number of raw feeds for a specific date to the correct heat chart "chunk"
		raw_data[time.getDay() + (DAYS_PER_WEEK * time.getHours())] += 1;
	}


	for(var i = 0; i < 168; i++){

		var day = i % 7;
		var hour = Math.floor((i / 7) % 24);
		var meridiem = "am";

		week_chunks[i] = {title: day_labels[day] + ", " + hour + " " + meridiem,
			value: raw_data[i]};
	}

	week_heatChart_widget.drawChart(day_labels, week_chunks);
};

week_heatChart_widget.drawChart = function(day_labels, week_chunks) {

	var chart = circularHeatChart()
		.range(["white", "green"])
		.segmentLabels(day_labels)
		.radialLabels(hour_labels)
		.segmentHeight(12)
		.innerRadius(10)
		.numSegments(7);

	chart.accessor(function(d) {return d.value});

	d3.select('#weekChart')
		.selectAll('svg')
		.data([week_chunks])
		.enter()
		.append('svg')
		.call(chart);

	d3.selectAll("#weekChart path").on('mouseover', function(){
			var d = d3.select(this).data()[0];
			d3.select("#weekInfo").text(d.value + ' raw feed(s) added on ' + d.title);
			});

	d3.selectAll("#weekChart svg").on('mouseout', function(){
			var d = d3.select(this).data()[0];
			d3.select("#weekInfo").text('');
			});
};
