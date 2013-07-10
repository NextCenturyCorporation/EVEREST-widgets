var HOURS_PER_WEEK = 168;
var DAYS_PER_WEEK = 7;

var week_heatChart_widget = {};

week_heatChart_widget.execute = function() {
	var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',
		'Saturday'];
	var raw_data = [HOURS_PER_WEEK];
	var week_chunks = []

		for (var i = 0; i < HOURS_PER_WEEK; i++) {
			raw_data[i] = 0;
		}

	owfdojo.addOnLoad(function() {
		OWF.ready(function() {
			OWF.Eventing.subscribe("testChannel1", function(sender, msg) {
				// Get an array of all date objects
				var fields_start = msg.split("[");
				var fields_end = fields_start[1].split("]");
				var fields = fields_end[0];
				var data = fields.split(",");

				for (var j = 0; j < data.length; j++) {
					var time = new Date(parseInt(data[j]));

					// This will map the number of raw feeds for a specific date to the correct heat chart "chunk"
					raw_data[time.getDay() + (DAYS_PER_WEEK * time.getHours())] += 1;
				}

				var chart = circularHeatChart()
				.range(["white", "green"])
				.segmentLabels(days)
				.segmentHeight(12)
				.innerRadius(10)
				.numSegments(7);

				for(var i = 0; i < 168; i++){

					var day = i % 7;
					var hour = Math.floor((i / 7) % 24);
					var meridiem = "am";

					if(hour === 0) {
						hour = 12;
					}
					else if(hour === 12) {
						meridiem = "pm";
					}
					else if(hour > 12) {
						hour = hour - 12;
						meridiem = "pm";
					}

					week_chunks[i] = {title: days[day] + ", " + hour + " " + meridiem,
						value: raw_data[i]};
				}

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

			});
		});
	});
}
