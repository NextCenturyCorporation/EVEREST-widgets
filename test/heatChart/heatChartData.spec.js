describe("Testing the HeatChartData object", function() {

	it('returns config info', function() {

		data = new HeatChartData();
		expect(data).toBeTruthy();
		expect(data.fetch).toBeTruthy();  // Replace with a real unit test of fetch with a mocked ajax call.

	});

});