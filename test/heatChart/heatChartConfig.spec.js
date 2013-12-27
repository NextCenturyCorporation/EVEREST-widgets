describe("Testing the HeatChartConfig object", function() {

	it('returns config info', function() {

		config = HeatChartConfig.get();
		expect(config.dataType).toEqual('jsonp');
		expect(config.baseUrl).toEqual('http://everest-build:8081');
		expect(config.jsonpCallback).toEqual('callback');
	});

});