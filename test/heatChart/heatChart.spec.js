// jasmine tests for the heat chart widget

// Test for the day heat chart
describe('Test src/widget/heatChart/js/day.js', function() {

	describe('Test day_heatChart_widget methods', function() {
		it('Test execute', function() {

			var date_list = ['2012-09-04T01:00:00-08:00'];
			var hour_labels = ['12am', '1am', '2am', '3am', '4am', '5am', '6am', '7am', '8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm','7pm', '8pm', '9pm', '10pm', '11pm'];
			var raw_data = [MINUTES_PER_DAY];
			var day_chunks= [];

			spyOn(day_heatChart_widget, 'drawChart').andCallFake(function() {
				
				var chart = circularHeatChart()
				.range(["white", "blue"])
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
					d3.select("#dayInfo").text('');
				});
			});

			spyOn(day_heatChart_widget, 'createChart').andCallFake(function() {
				day_heatChart_widget.drawChart();
			});

			day_heatChart_widget.execute = jasmine.createSpy('day_heatChart_widget.execute()').andCallFake(function() {

				day_heatChart_widget.createChart(date_list, raw_data, day_chunks, hour_labels);

				return 1;

			});

			var result = day_heatChart_widget.execute();

			expect(result).toBeDefined();
			expect(day_heatChart_widget.createChart).toHaveBeenCalled();
			expect(result).toEqual(1);
		});
	});
});

// Test for the week heat chart
describe('Test src/widget/heatChart/js/week.js', function() {

	describe('Test week_heatChart_widget methods', function() {
		it('Test execute', function() {

			var date_list = ['2012-09-04T01:00:00-08:00'];
			var day_labels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
			var raw_data = [HOURS_PER_WEEK];
			var week_chunks= [];

			spyOn(week_heatChart_widget, 'drawChart').andCallFake(function() {
				
				var chart = circularHeatChart()
				.range(["white", "blue"])
				.segmentLabels(day_labels)
				.segmentHeight(4.7)
				.innerRadius(10);
			
				chart.accessor(function(d) {return d.value});

				d3.select('#dayChart')
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
					d3.select("#weekInfo").text('');
				});
			});

			spyOn(week_heatChart_widget, 'createChart').andCallFake(function() {
				return 1;
			});

			week_heatChart_widget.execute = jasmine.createSpy('week_heatChart_widget.execute()').andCallFake(function() {

				return week_heatChart_widget.createChart(date_list, raw_data, week_chunks, day_labels);


			});

			var result = week_heatChart_widget.execute();

			expect(result).toBeDefined();
			expect(week_heatChart_widget.createChart).toHaveBeenCalled();
			expect(result).toEqual(1);
		});
	});
});

// Test for the month heat chart
describe('Test src/widget/heatChart/js/month.js', function() {

	describe('Test month_heatChart_widget methods', function() {
		it('Test to see if month_heatChart_widget is defined', function() {

			var date_list = ['2012-09-04T01:00:00-08:00'];
			var month_labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July','August', 'September', 'October', 'November', 'December'];
			var raw_data = [DAYS_PER_YEAR];
			var month_chunks= [];

			spyOn(day_heatChart_widget, 'drawChart').andCallFake(function() {
				
				var chart = circularHeatChart()
				.range(["white", "blue"])
				.segmentLabels(month_labels)
				.segmentHeight(4.7)
				.innerRadius(10);
			
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
					d3.select("#monthInfo").text('');
				});
			});

			spyOn(month_heatChart_widget, 'createChart').andCallFake(function() {
				return 1;
			});

			month_heatChart_widget.execute = jasmine.createSpy('month_heatChart_widget.execute()').andCallFake(function() {

				return month_heatChart_widget.createChart(date_list, raw_data, month_chunks, month_labels);


			});

			var result = month_heatChart_widget.execute();

			expect(result).toBeDefined();
			expect(month_heatChart_widget.createChart).toHaveBeenCalled();
			expect(result).toEqual(1);
		});
	});
});
