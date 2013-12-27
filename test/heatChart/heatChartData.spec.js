describe("Testing the HeatChartData object", function() {

	it('figures appropriate URL to make AJAX call', function() {

		data = new HeatChartData();
		expect(data).toBeTruthy();

		// Mock the part where we get data via an ajax call.
		data._GET = jasmine.createSpy("_GET spy");
		data.fetch({
			feedType: 'rawfeed',
		});
		expect(data._GET).toHaveBeenCalledWith('http://everest-build:8081/rawfeed/dates', undefined, undefined);
	});

});