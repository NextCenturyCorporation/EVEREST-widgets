/**
 * New node file
 */

describe('Test src/widgets/rawData/js/table.js base functions', function(){

	describe('Tests the createTable function', function(){
		xit('for proper initialization and method call logic', function() {
			var startDate = Date.parse('2012-09-04T01:00:00-08:00'); //before second event;
			var endDate = Date.parse('2012-09-05T01:00:00-08:00'); //after second event;
	
			//just make extractData return an array of a single element
			extractData = jasmine.createSpy('extractData').andCallFake(function(start, end) {
				return [{
					"time": "2000-11-04T17:42:56-08:00",
					"ent1": "his co-conspirators",
					"rel": "devise",
					"ent2": "a scheme"
				}];
			});
			
			var result = {hi:"there"};
			spyOn(window, 'TableView').andCallFake(function(x) {
				return {};
			});
			
			
			result = createTable(startDate, endDate);
	
			//function that should have been called
			expect(result).toBeDefined();
			expect(TableView).toHaveBeenCalled();
			expect(extractData).toHaveBeenCalled();
			
			//result should just be an empty object, per spy fake above
			expect(result).toEqual({});
		});
	});
});
