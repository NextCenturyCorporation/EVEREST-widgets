describe("Testing the HeatChartWidget object", function() {

	it('returns config info', function() {

		widget = new HeatChartWidget();
		expect(widget).toBeTruthy();
		expect(widget.publishDateRange).toBeTruthy(); // Replace with a real unit test of method with a mocked OWF call.

	});

});