describe("Testing the HeatChartData object", function() {

	it('figures appropriate URL to make AJAX call', function() {

		var dataResult;
		runs(function(){
			chartData1 = new HeatChartData();
			expect(chartData1).toBeTruthy();

			// Mock the part where we get data via an ajax call.
			chartData1._GET = jasmine.createSpy("_GET spy").andCallFake(function(url, successCallback, failureCallback) {
	            data = [1374261832200, 1374261832200, 1374261832200, 1374261832400, 1374261833000, 1374261842000, 
	                    1374261932000, 1374261932000, 1374261934000, 1374264832000, 1374264833000, 1376940232200];
	            setTimeout(function(){
	            	if (typeof successCallback == 'function') {
	                	successCallback(data);
	            	}
	            }, 0);
	        });

			// Test the fetch calls through to the GET with the right parameters.
			chartData1.fetch({
				feedType: 'rawfeed',
			});
			expect(chartData1._GET.mostRecentCall.args[0]).toEqual('http://everest-build:8081/rawfeed/dates');

			// Test the fetch correctly filters the time range
			chartData1.fetch({
				date: 1374261832200, 
				mode:   'hour',
				successCallback: function(data) {
					dataResult = data;
				}
			});
		});

		waitsFor(function() {return !!dataResult});

		runs(function() {
			var sum = 0;
			for(var ctr=0; ctr<dataResult.length; ++ctr) {
				sum += dataResult[ctr].value;
			}
			expect(sum).toEqual(9);
		});
	});

	describe('getTimeChunks(mode, timeList', function() {

		var baseDate = new Date(2013, 0); 

		chartData2 = new HeatChartData();
		// Mock the part where we get data via an ajax call.
		chartData2._GET = jasmine.createSpy("_GET spy").andCallFake(function(url, successCallback, failureCallback) {
            data = [new Date(2010, 0).getTime(), new Date(2011, 0).getTime(), new Date(2012, 0).getTime(),
						new Date(2013, 0).getTime(), new Date(2014, 0).getTime()];
            setTimeout(function(){
            	if (typeof successCallback == 'function') {
                	successCallback(data);
            	}
            }, 0);
        });

		it('should return an array of objects', function() {
			var done = false;
			runs(function() {
				chartData2.fetch({
					date: baseDate, 
					mode:   'year',
					successCallback: function(chunks) {
						expect(chunks instanceof Array).toBeTruthy();
						expect(chunks[0] instanceof Object).toBeTruthy();
						done = true;
					}
				});
			});
			waitsFor(function() {return done});
		});

		describe('for each mode', function() {

			it('should return the correct number of objects for "hour" mode', function() {
				var done = false;
				runs(function() {
					chartData2.fetch({
						date: baseDate, 
						mode:   'hour',
						successCallback: function(chunks) {
							expect(chunks.length).toBe(3600);
							done = true;
						}
					});
				});
				waitsFor(function() {return done});
			});


			it('should return the correct number of objects for "day" mode', function() {
				var done = false;
				runs(function() {
					chartData2.fetch({
						date: baseDate, 
						mode:   'day',
						successCallback: function(chunks) {
							expect(chunks.length).toBe(1440);
							done = true;
						}
					});
				});
				waitsFor(function() {return done});
			});

			it('should return the correct number of objects for "week" mode', function() {
				var done = false;
				runs(function() {
					chartData2.fetch({
						date: baseDate, 
						mode:   'week',
						successCallback: function(chunks) {
							expect(chunks.length).toBe(168);
							done = true;
						}
					});
				});
				waitsFor(function() {return done});
			});

			it('should return the correct number of objects for "month" mode', function() {
				var done = false;
				runs(function() {
					chartData2.fetch({
						date: baseDate, 
						mode:   'month',
						successCallback: function(chunks) {
							expect(chunks.length).toBe(744);
							done = true;
						}
					});
				});
				waitsFor(function() {return done});
			});

			it('should return the correct number of objects for "year" mode', function() {
				var done = false;
				runs(function() {
					chartData2.fetch({
						date: baseDate, 
						mode:   'year',
						successCallback: function(chunks) {
							expect(chunks.length).toBe(372);
							done = true;
						}
					});
				});
				waitsFor(function() {return done});
			});

			it('should return the correct number of objects for "year5" mode', function() {
				var done = false;
				runs(function() {
					chartData2.fetch({
						date: baseDate, 
						mode:   'year5',
						successCallback: function(chunks) {
							expect(chunks.length).toBe(60);
							done = true;
						}
					});
				});
				waitsFor(function() {return done});
			});

		});

		it('should return the correct first five times and values for "year5"', function() {
			var done = false;
			runs(function() {
				chartData2.fetch({
					date: baseDate, 
					mode:   'year5',
					successCallback: function(chunks) {
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
						done = true;
					}
				});
			});
			waitsFor(function() {return done});
		});

	});

});