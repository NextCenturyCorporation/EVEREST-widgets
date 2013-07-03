describe('To test src/components/data_table/data_table.js', function(){
	data_table.datas = [{
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
	
	describe('base parameters', function() {
		it('verify data_table existence', function() {
			expect(data_table).toBeDefined();
			expect(data_table).not.toBeNull();
		});
		
		it('verify base parameter values', function() {
			expect(data_table.MIN).toBe(0);
			expect(data_table.MAX).toBe(Number.MAX_VALUE);
		});
	});

	describe('functions', function() {
		beforeEach(function() {
			OWF.Eventing.publish = jasmine.createSpy('OWF.Eventing.publish').andCallFake(function(str1, str2){
				return str2;
			});
		});

		it('verify sentence', function() {
			expect(data_table.sentence).toBeDefined();
			expect(data_table.sentence).not.toBeNull();
			expect(typeof(data_table.sentence)).toBe('function');

			var test_sentence = new data_table.sentence();
			
			expect(test_sentence).toBeDefined();
			expect(test_sentence).not.toBeNull();
			expect(typeof(test_sentence)).toBe('object');
		});

		it('verify table creation', function() {
			expect(data_table.table).toBeDefined();
			expect(data_table.table).not.toBeNull();
			expect(typeof(data_table.table)).toBe('function');

			var s = Date.parse('01/01/2012'); 
			var e = Date.parse('01/01/2013');
			var extracted_data = data_table.extractData(s, e);

			for (var i = 0; i < extracted_data.length; i++){
				extracted_data[i].time = new Date(extracted_data[i].time);
			}			

			var test_table = new data_table.table(extracted_data);
			
			expect(test_table).toBeDefined();
			expect(test_table).not.toBeNull();
			expect(typeof(test_table)).toBe('object');

			expect(test_table.model).toBe(data_table.sentence);
			expect(test_table.length).toBe(4);
		});

		it('verify tableView', function() {
			expect(data_table.tableView).toBeDefined();
			expect(data_table.tableView).not.toBeNull();
			expect(typeof(data_table.tableView)).toBe('function');			

			var s = Date.parse('01/01/2012'); 
			var e = Date.parse('01/01/2013');
			var extracted_data = data_table.extractData(s, e);

			for (var i = 0; i < extracted_data.length; i++){
				extracted_data[i].time = new Date(extracted_data[i].time);
			}

			var test_table_view = new data_table.tableView(extracted_data);

			expect(test_table_view).toBeDefined();
			expect(test_table_view).not.toBeNull();
			expect(typeof(test_table_view)).toBe('object');
		});

		it('verify sentenceView', function() {
			expect(data_table.sentenceView).toBeDefined();
			expect(data_table.sentenceView).not.toBeNull();
			expect(typeof(data_table.sentenceView)).toBe('function');
			
			var s = Date.parse('01/01/2012'); 
			var e = Date.parse('01/01/2013');
			var extracted_data = data_table.extractData(s, e);
			var test_table = new data_table.table(extracted_data);
			var test_sentence_view = new data_table.sentenceView({model: test_table.models[0]});

			expect(test_sentence_view).toBeDefined();
			expect(test_sentence_view).not.toBeNull();
			
		});		
	});

	describe('Tests extractData function', function(){
		it('for correct lower limiting', function() {
			var startDate = Date.parse('2012-09-04T01:00:00-08:00'); //before second event
			var endDate = new Date();
	
			var result = data_table.extractData(startDate, endDate);
			
			expect(result.length).toBe(3)
		});
	
		it('for correct upper limiting', function() {
			var startDate = new Date(0);
			var endDate = Date.parse('2012-09-05T01:00:00-08:00'); //after second event;
	
			var result = data_table.extractData(startDate, endDate);
			
			expect(result.length).toBe(2);
		});
	
		it('for correct upper and lower limiting', function() {
			var startDate = Date.parse('2012-09-04T01:00:00-08:00'); //before second event;
			var endDate = Date.parse('2012-09-05T01:00:00-08:00'); //after second event;
	
			var result = data_table.extractData(startDate, endDate);
			
			expect(result.length).toBe(1);
		});
	
		it('for reaction to non-date inputs', function(){
			var result = data_table.extractData("a", "b");
			
			expect(result.length).toBe(0);
		});
		
		it('for invalid backwards inputs', function(){
			var startDate = Date.parse('2012-09-04T01:00:00-08:00'); //before second event;
			var endDate = Date.parse('2012-09-05T01:00:00-08:00'); //after second event;
			
			var result = data_table.extractData(endDate, startDate);
			
			expect(result.length).toBe(0);
		});
	});

	describe('Tests the resetAndSend function', function(){
		//create spies for the following functions
		beforeEach(function(){
			
			//TableView is a Backbone instance and errors when called, skip it
			//create an object with a single method getTimes that returns an empty array
			spyOn(data_table, 'tableView').andCallFake(function(x) {
				return {getTimes:function(){ return []; }};
			});			
			
			//would only work in the OWF instance anyway, skip and return a string
			OWF.Eventing.publish = jasmine.createSpy('OWF.Eventing.publish').andCallFake(function(str1, str2){
				return str2;
			});
			
			var startDate = Date.parse('2012-09-04T01:00:00-08:00'); //before second event;
			var endDate = Date.parse('2012-09-05T01:00:00-08:00'); //after second event;
			
			//create a table based on valid dates
			var result = data_table.createTable(startDate, endDate);
		});
		
		it('for proper method call logic', function(){
			spyOn(d3, 'selectAll').andCallThrough();
			spyOn(JSON, 'stringify').andCallThrough();
			spyOn(Date, 'parse').andCallThrough();
			
			//test only to see if the methods are called with proper params
			data_table.resetAndSend();
			
			expect(d3.selectAll).toHaveBeenCalledWith('th');
			expect(JSON.stringify).toHaveBeenCalledWith([]);
			expect(data_table.tableView).toHaveBeenCalled();
			expect(OWF.Eventing.publish).toHaveBeenCalled();
		});
		
		it('for proper resetting of all attributes of each element', function(){
			d3.selectAll('th').remove();
			d3.select('body').attr('id', 'raw_data');
			var arr = ['time', 'ent1', 'rel', 'ent2'];
			var h = data_table.createHeaders(arr);
			
			//grab each of the headers
			var ex0 = document.getElementById('0');
			var ex1 = document.getElementById('1');
			var ex2 = document.getElementById('2');
			var ex3 = document.getElementById('3');
			
			//sort ex0 to up
			data_table.sorter(ex0, 'time');
			expect(ex0.className).toBe('up');
			
			//sort ex2 to up
			data_table.sorter(ex2, 'rel');
			expect(ex2.className).toBe('up');
			
			//sort ex1 to down
			data_table.sorter(ex1, 'ent1');
			data_table.sorter(ex1, 'ent1');
			expect(ex1.className).toBe('down');
			
			//leave ex3 as unsorted
			expect(ex3.className).toBe('unsorted');
			
			data_table.resetAndSend();
			
			//after reset, all elements' classes should be unsorted
			expect(ex0.className).toBe('unsorted');
			expect(ex1.className).toBe('unsorted');
			expect(ex2.className).toBe('unsorted');
			expect(ex3.className).toBe('unsorted');
		});
	});
		
	describe('Tests the createTable function', function(){
		it('for proper initialization and method call logic', function() {
			var startDate = Date.parse('2012-09-04T01:00:00-08:00'); //before second event;
			var endDate = Date.parse('2012-09-05T01:00:00-08:00'); //after second event;
	
			//just make extractData return an array of a single element
			spyOn(data_table, 'extractData').andCallFake(function(start, end) {
				return [{
					"time": "2000-11-04T17:42:56-08:00",
					"ent1": "his co-conspirators",
					"rel": "devise",
					"ent2": "a scheme"
				}];
			});
			
			var result = {hi:"there"};
			spyOn(data_table, 'tableView').andCallFake(function(x) {
				return result;
			});
			
			
			call_result = data_table.createTable(startDate, endDate);
	
			//function that should have been called
			expect(result).toBeDefined();
			expect(data_table.tableView).toHaveBeenCalled();
			expect(data_table.extractData).toHaveBeenCalled();
			
			//result should just be an empty object, per spy fake above
			expect(call_result).toEqual(result);
		});
	});
});
