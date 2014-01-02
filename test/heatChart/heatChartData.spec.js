describe("Testing the HeatChartData object", function() {

	it('figures appropriate URL to make AJAX call', function() {

		chartData = new HeatChartData();
		expect(chartData).toBeTruthy();

		// Mock the part where we get data via an ajax call.
		chartData._GET = jasmine.createSpy("_GET spy").andCallFake(function(url, successCallback, failureCallback) {
            data = [{startTime: 1374261832200, count: 3}, 1374261832400, 1374261833000, 1374261842000, 
                    1374261932000, 1374261932000, 1374261934000, 1374262832000, 1374262833000, 1376940232200];
            setTimeout(function(){
            	if (typeof successCallback == 'function') {
                	successCallback(data);
            	}
            }, 0);
        });

		// Test the fetch calls through to the GET with the right parameters.
		chartData.fetch({
			feedType: 'rawfeed',
		});
		expect(chartData._GET.mostRecentCall.args[0]).toEqual('http://everest-build:8081/rawfeed/dates');

		// Test the fetch correctly filters the time range
		chartData.fetch({
			feedType: 'rawfeed',
			startTime: 1374260000000, 
			endTime:   1374262000000,
			successCallback: function(data) {
				expect(data.length).toEqual(7);
			}
		});
	});

});