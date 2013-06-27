datas = [''];	


describe('Test src/widgets/rawFeed/js/table.js base functions', function(){

	it('Tests extractData function for correct lower limiting', function() {
		var startDate = Date.parse('2012-09-04T01:00:00-08:00'); //before second event
		var endDate = new Date();

		var result = extractData(startDate, endDate);
		
		expect(result.length).toBe(3)
	});

	it('Tests extractData function for correct upper limiting', function() {
		var startDate = new Date(0);
		var endDate = Date.parse('2012-09-05T01:00:00-08:00'); //after second event;

		var result = extractData(startDate, endDate);
		
		expect(result.length).toBe(2);
	});

	it('Tests extractData function for correct upper and lowe limiting', function() {
		var startDate = Date.parse('2012-09-04T01:00:00-08:00'); //before second event;
		var endDate = Date.parse('2012-09-05T01:00:00-08:00'); //after second event;

		var result = extractData(startDate, endDate);
		
		expect(result.length).toBe(1);
	});

	it('Tests createTable', function() {
		var startDate = Date.parse('2012-09-04T01:00:00-08:00'); //before second event;
		var endDate = Date.parse('2012-09-05T01:00:00-08:00'); //after second event;

		extractData = jasmine.createSpy('extractData').andCallFake(function(start, end) {
			return [{
				"time": "2000-11-04T17:42:56-08:00",
				"ent1": "his co-conspirators",
				"rel": "devise",
				"ent2": "a scheme"
			}];
		});

		spyOn(window, 'TableView').andCallFake(function(x) {
			return {};
		});
		
		var result = createTable(startDate, endDate);

		expect(result).toBeDefined();

		expect(TableView).toHaveBeenCalled();

		expect(extractData).toHaveBeenCalled();
	});

	it('Tests createClickers method call logic', function(){
		spyOn(d3, 'selectAll').andCallThrough();
		spyOn(d3, 'select').andCallThrough();

		createClickers();

		expect(d3.selectAll).toHaveBeenCalledWith('th');
		expect(d3.select).toHaveBeenCalledWith('#submit');
	});
});