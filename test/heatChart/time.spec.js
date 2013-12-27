	describe('everest.heatChart.time', function() {

		var time = new HeatChartTime();

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

		describe('getEmptyTimeChunks(numRows, numCols)', function() {

			it('should return an array of objects', function() {
				var chunks = time.getEmptyTimeChunks(1, 1);

				expect(chunks instanceof Array).toBeTruthy();
				expect(chunks[0] instanceof Object).toBeTruthy();
			});

			it('should return zero time and value for 1 row and 1 column', function() {
				var chunks = time.getEmptyTimeChunks(1, 1);

				expect(chunks).toEqual([{
					title: '00:00',
					value: 0
				}]);
			});

			it('should return the correct time and values for n rows and m columns', function() {
				var chunks = time.getEmptyTimeChunks(4, 4);

				expect(chunks[0]).toEqual({
					title: '00:00',
					value: 0
				});

				expect(chunks[4]).toEqual({
					title: '00:01',
					value: 0
				});

				expect(chunks[8]).toEqual({
					title: '00:02',
					value: 0
				});

				expect(chunks[12]).toEqual({
					title: '00:03',
					value: 0
				});
			});

		});

		describe('getTimeChunks(mode, timeList', function() {

			var baseDate = time.currentUTCTime();

			var date1 = new Date(2011, 0),
				date2 = new Date(2012, 0),
				date3 = new Date(2013, 0);

			var dates = [
				Date.parse(new Date(2010, 0)),
				Date.parse(date1),
				Date.parse(date2),
				Date.parse(date3),
				Date.parse(new Date(2014, 0))
			];

			it('should return an array of objects', function() {
				var chunks = time.getTimeChunks(baseDate, 'year', dates);

				expect(chunks instanceof Array).toBeTruthy();
				expect(chunks[0] instanceof Object).toBeTruthy();
			});

			describe('for each mode', function() {

				it('should return the correct number of objects for "hour" mode', function() {
					var chunks = time.getTimeChunks(baseDate, 'hour', dates);
					expect(chunks.length).toBe(3600);
				});

				it('should return the correct number of objects for "day" mode', function() {
					var chunks = time.getTimeChunks(baseDate, 'day', dates);
					expect(chunks.length).toBe(1440);
				});

				it('should return the correct number of objects for "week" mode', function() {
					var chunks = time.getTimeChunks(baseDate, 'week', dates);
					expect(chunks.length).toBe(168);
				});

				it('should return the correct number of objects for "month" mode', function() {
					var chunks = time.getTimeChunks(baseDate, 'month', dates);
					expect(chunks.length).toBe(744);
				});

				it('should return the correct number of objects for "year" mode', function() {
					var chunks = time.getTimeChunks(baseDate, 'year', dates);
					expect(chunks.length).toBe(372);
				});

				it('should return the correct number of objects for "year" mode', function() {
					var chunks = time.getTimeChunks(baseDate, 'year5', dates);
					expect(chunks.length).toBe(60);
				});

			});

			it('should return the correct first five times and values for "year5"', function() {
				var chunks = time.getTimeChunks(baseDate, 'year5', dates);

				expect(chunks.slice(0, 5)).toEqual([{
					title: 'Sat Jan 01 2011 00:00:00 GMT-0500 (Eastern Standard Time)',
					value: 1
				}, {
					title: 'Sun Jan 01 2012 00:00:00 GMT-0500 (Eastern Standard Time)',
					value: 1
				}, {
					title: 'Tue Jan 01 2013 00:00:00 GMT-0500 (Eastern Standard Time)',
					value: 1
				}, {
					title: 'Wed Jan 01 2014 00:00:00 GMT-0500 (Eastern Standard Time)',
					value: 1
				}, {
					title: '',
					value: 0
				}]);
			});

		});

		describe('getRandomSamples( numSamplePoints )', function() {

			it('should return a list', function() {
				var samples = time.getRandomSamples(1);

				expect(samples instanceof Array).toBeTruthy();
			});

			it('should return a list of length equal to numSamplePoints', function() {
				var samples = time.getRandomSamples(1);

				expect(samples.length).toEqual(1);
			});

			it('should return a list of Dates converted to UNIX epochs', function() {
				var samples = time.getRandomSamples(2);
				var date1 = new Date(samples[0]);
				var date2 = new Date(samples[1]);

				expect(date1 instanceof Date).toBeTruthy();
				expect(date2 instanceof Date).toBeTruthy();
			});

		});

	});
