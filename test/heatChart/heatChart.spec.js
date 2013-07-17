// jasmine tests for the heat chart widget

// Test for the day heat chart
describe('Test src/widget/heatChart/js/day.js', function() {

	describe('Test day_heatChart_widget methods', function() {
		it('Test to see if day_heatChart_widget is defined', function() {
			expect(day_heatChart_widget).toBeDefined();

			var date_list = ['2012-09-04T01:00:00-08:00'];

			day_heatChart_widget.execute = jasmine.createSpy('day_heatChart_widget').andCallFake(function() {

				var hour_labels = ['12am', '1am', '2am', '3am', '4am', '5am', '6am', '7am', '8am',
				'9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm',
				'7pm', '8pm', '9pm', '10pm', '11pm'];
			var raw_data = [MINUTES_PER_DAY];
			var day_chunks= [];

			day_heatChart_widget.createChart(date_list, raw_data, day_chunks, hour_labels);

			});

			var result = day_heatChart_widget.execute;

			expect(result).toBeDefined();
		});
	});
});

// Test for the week heat chart
describe('Test src/widget/heatChart/js/week.js', function() {

	describe('Test week_heatChart_widget methods', function() {

		it('Test to see if week_heatChart_widget is defined', function() {
			expect(week_heatChart_widget).toBeDefined();

			var date_list = ['2012-09-04T01:00:00-08:00'];

			week_heatChart_widget.execute = jasmine.createSpy('week_heatChart_widget').andCallFake(function() {

				var day_labels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
				var raw_data = [HOURS_PER_WEEK];
				var week_chunks= [];

				day_heatChart_widget.createChart(date_list, raw_data, week_chunks, day_labels);

			});

			var result = week_heatChart_widget.execute;

			expect(result).toBeDefined();
		});
	});
});

// Test for the month heat chart
describe('Test src/widget/heatChart/js/month.js', function() {

	describe('Test month_heatChart_widget methods', function() {

		it('Test to see if month_heatChart_widget is defined', function() {
			expect(month_heatChart_widget).toBeDefined();

			var date_list = ['2012-09-04T01:00:00-08:00'];

			week_heatChart_widget.execute = jasmine.createSpy('week_heatChart_widget').andCallFake(function() {

				var month_labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
				var raw_data = [HOURS_PER_WEEK];
				var week_chunks= [];

				day_heatChart_widget.createChart(date_list, raw_data, week_chunks, day_labels);

			});

			var result = week_heatChart_widget.execute;

			expect(result).toBeDefined();
		});
	});
});
