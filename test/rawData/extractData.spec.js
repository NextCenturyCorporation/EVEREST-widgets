/**
 * extractData
 */

console.log('extractData.spec.js');

this.extractDataSet =
	[{
		"time": "2012-08-04T02:37:47-07:00",
		"ent1": "the ongoing reports of fraud",
		"rel": "establish",
		"ent2": "contacts"
	},
	{
		"time": "2012-09-04T16:41:56-08:00",
		"ent1": "# co-conspirators",
		"rel": "conspire to defraud",
		"ent2": "the united states government"
	},
	{
		"time": "2012-10-04T17:41:56-08:00",
		"ent1": "the defendant",
		"rel": "convict of",
		"ent2": "the conspiracy charge"
	},
	{
		"time": "2012-11-04T17:42:56-08:00",
		"ent1": "his co-conspirators",
		"rel": "devise",
		"ent2": "a scheme"
	}];	


describe('Test src/widgets/rawData/js/table.js base functions', function(){

	describe('Tests extractData function', function(){
		
		result = TableView(extractDataSet);
		
		it('for correct lower limiting', function() {
			var startDate = Date.parse('2012-09-04T01:00:00-08:00'); //before second event
			var endDate = new Date();
	
			var result = extractData(startDate, endDate);
			
			//three elements should match and be returned
			expect(result.length).toBe(3)
		});
	
		it('for correct upper limiting', function() {
			var startDate = new Date(0);
			var endDate = Date.parse('2012-09-05T01:00:00-08:00'); //after second event;
	
			var result = extractData(startDate, endDate);
			
			//two elements should match and be returned
			expect(result.length).toBe(2);
		});
	
		it('for correct upper and lower limiting', function() {
			var startDate = Date.parse('2012-09-04T01:00:00-08:00'); //before second event;
			var endDate = Date.parse('2012-09-05T01:00:00-08:00'); //after second event;
	
			var result = extractData(startDate, endDate);
			
			//only one element should match and be returned
			expect(result.length).toBe(1);
		});
	
		it('for reaction to non-date inputs', function(){
			var result = extractData("a", "b");
			
			//should return no elements
			expect(result.length).toBe(0);
		});
		
		it('for invalid backwards inputs', function(){
			var startDate = Date.parse('2012-09-04T01:00:00-08:00'); //before second event;
			var endDate = Date.parse('2012-09-05T01:00:00-08:00'); //after second event;
			
			var result = extractData(endDate, startDate);
			
			//should return no elements
			expect(result.length).toBe(0);
		});
	});
});