// Constants
var DAYS_PER_YEAR = 372;
var MONTHS_PER_YEAR = 12;
var DAYS_PER_MONTH = 31;

var month_heatChart_widget = {};

month_heatChart_widget.execute = function() {
	var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
		'August', 'September', 'October', 'November', 'December'];
	var month_chunks = [];
	var raw_data = [DAYS_PER_YEAR];

	for (var i = 0; i < DAYS_PER_YEAR; i++) {
		raw_data[i] = 0;
	}

	owfdojo.addOnLoad(function(){
		OWF.ready(function(){
			OWF.Eventing.subscribe("testChannel1", function(sender, msg){

				// Get an array of all date objects
				var fields_start = msg.split("[");
				var fields_end = fields_start[1].split("]");
				var fields = fields_end[0];
				var data = fields.split(",");

				for (var j = 0; j < data.length; j++) {
					var time = new Date(parseInt(data[j]));

					// This will map the number of raw feeds for a specific date to the correct heat chart "chunk"
					raw_data[time.getMonth() + (MONTHS_PER_YEAR * (time.getDate() - 1))] += 1;
				}

				var chart = circularHeatChart()
				.range(["white", "red"])
				.segmentLabels(months)
				.segmentHeight(9)
				.numSegments(12)
				.innerRadius(10);

				for(var i = 0; i < 372; i++){

					var month = i % 12;
					var day = Math.floor((i / 12) % 31);

					month_chunks[i] = {title: day + 1 + " of " + months[month], value: raw_data[i]};
				}

				chart.accessor(function(d) {return d.value});

				d3.select('#monthChart')
					.selectAll('svg')
					.data([month_chunks])
					.enter()
					.append('svg')
					.call(chart);

				d3.selectAll("#monthChart path").on('mouseover', function(){
					var d = d3.select(this).data()[0];
					d3.select("#monthInfo").text(d.value + ' raw feed(s) added on ' + d.title);
				});

				d3.selectAll("#monthChart svg").on('mouseout', function(){
					var d = d3.select(this).data()[0];
					d3.select("#monthInfo").text('');
				});
			});
		});
	});
};
