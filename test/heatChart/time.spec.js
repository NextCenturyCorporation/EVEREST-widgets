describe('everest.heatChart.time', function() {

	var time = new everest.heatChart.time();

	describe('getMode(mode)', function() {

		it('should return the correct color, rows, and cols for the specified mode', function() {
			var yearMode = time.getMode('year');

			expect(yearMode.color).toEqual('orange');
			expect(yearMode.rows).toEqual(31);
			expect(yearMode.columns).toEqual(12);
		});

		it("should return 'month' color, rows, and cols if passed an undefined mode", function() {
			var fooMode = time.getMode('foo');
			
			expect(fooMode.color).toEqual('red');
			expect(fooMode.rows).toEqual(24);
			expect(fooMode.columns).toEqual(31);
		});

	});

	describe('filterDownDates(start, end)', function() {

		it('should filter out any elements of dates outside of start and end', function() {
			var date1 = new Date(2011, 1),
				date2 = new Date(2012, 1),
				date3 = new Date(2013, 1);

			var dates = [
				new Date(2010, 1),
				date1,
				date2,
				date3,
				new Date(2014, 1)
			];

			expect(time.filterDownDates(dates, date1, date3)).toContain(date1, date2, date3);
		});

	});


	describe('getRowAndColumnLabels(mode)', function() {

		describe('should return the correct row and column labels for', function() {

			it('year when passed "year"', function() {
				var labels = time.getRowAndColumnLabels('year');
				
				expect(labels.columnLabels).toContain('January', 'February', 'March');
				expect(labels.rowLabels).toContain('7', '14', '21', '28');
			});

			it('month when passed "month"', function() {
				var labels = time.getRowAndColumnLabels('month');

				expect(labels.columnLabels).toContain('01', '02', '03', '29', '30', '31');
				expect(labels.rowLabels).toEqual([]);
			})

			it('month mode when passed an undefined mode value', function() {
				var labels = time.getRowAndColumnLabels('foo');

				expect(labels.columnLabels).toContain('01', '02', '03', '29', '30', '31');
				expect(labels.rowLabels).toEqual([]);
			})
		})

	});


});