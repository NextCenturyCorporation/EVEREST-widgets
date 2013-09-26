describe('To test src/components/data_table/data_table.js', function(){
	var datas_to_use = [{
		"createdDate": "2012-08-04T02:37:47-07:00",
		"ent1": "the ongoing reports of fraud",
		"rel": "establish",
		"ent2": "contacts"
	},
	{
		"createdDate": "2012-09-04T16:41:56-08:00",
		"ent1": "# co-conspirators",
		"rel": "conspire to defraud",
		"ent2": "the united states government"
	},
	{
		"createdDate": "2012-10-04T17:41:56-08:00",
		"ent1": "the defendant",
		"rel": "convict of",
		"ent2": "the conspiracy charge"
	},
	{
		"createdDate": "2012-11-04T17:42:56-08:00",
		"ent1": "his co-conspirators",
		"rel": "devise",
		"ent2": "a scheme"
	}];	
	
	d3.select('body').attr('class', 'data_table_data');

	var test_data_table = new data_table(datas_to_use, function(msg) {
		console.log(msg);
	});	
	
	beforeEach(function() {
		test_data_table = new data_table(datas_to_use, function(msg) {
			console.log(msg);
		});

	});	

	describe('base parameters', function() {
		it('verify data_table existence', function() {
			expect(test_data_table).toBeDefined();
			expect(test_data_table).not.toBeNull();
		});
		
		it('verify base parameter values', function() {
			expect(test_data_table.MIN).toBe(0);
			expect(test_data_table.MAX).toBe(Number.MAX_VALUE);
		});
	});

	describe('functions', function() {

		it('verify sentence', function() {
			expect(test_data_table.sentence).toBeDefined();
			expect(test_data_table.sentence).not.toBeNull();
			expect(typeof(test_data_table.sentence)).toBe('function');

			var test_sentence = new test_data_table.sentence();
			
			expect(test_sentence).toBeDefined();
			expect(test_sentence).not.toBeNull();
			expect(typeof(test_sentence)).toBe('object');
		});

		it('verify table creation', function() {
			expect(test_data_table.table).toBeDefined();
			expect(test_data_table.table).not.toBeNull();
			expect(typeof(test_data_table.table)).toBe('function');

			var s = Date.parse('01/01/2012'); 
			var e = Date.parse('01/01/2013');
			var extracted_data = test_data_table.extractData(s, e);

			for (var i = 0; i < extracted_data.length; i++){
				extracted_data[i].createdDate = new Date(extracted_data[i].createdDate);
			}			

			var test_table = new test_data_table.table(extracted_data);
			
			expect(test_table).toBeDefined();
			expect(test_table).not.toBeNull();
			expect(typeof(test_table)).toBe('object');

			expect(test_table.model).toBe(test_data_table.sentence);
			expect(test_table.length).toBe(4);
		});

		it('verify tableView', function() {
			expect(test_data_table.tableView).toBeDefined();
			expect(test_data_table.tableView).not.toBeNull();
			expect(typeof(test_data_table.tableView)).toBe('function');			

			var s = Date.parse('01/01/2012'); 
			var e = Date.parse('01/01/2013');
			var extracted_data = test_data_table.extractData(s, e);

			for (var i = 0; i < extracted_data.length; i++){
				extracted_data[i].createdDate = new Date(extracted_data[i].createdDate);
			}

			var test_table_view = new test_data_table.tableView(extracted_data);

			expect(test_table_view).toBeDefined();
			expect(test_table_view).not.toBeNull();
			expect(typeof(test_table_view)).toBe('object');
		});

		it('verify sentenceView', function() {
			expect(test_data_table.sentenceView).toBeDefined();
			expect(test_data_table.sentenceView).not.toBeNull();
			expect(typeof(test_data_table.sentenceView)).toBe('function');
			
			var s = Date.parse('01/01/2012'); 
			var e = Date.parse('01/01/2013');
			var extracted_data = test_data_table.extractData(s, e);
			var test_table = new test_data_table.table(extracted_data);
			var test_sentence_view = new test_data_table.sentenceView({model: test_table.models[0]});

			expect(test_sentence_view).toBeDefined();
			expect(test_sentence_view).not.toBeNull();
			
		});		
	});

	describe('Tests extractData function', function(){
		beforeEach(function(){
			var arr = ['createdDate', 'ent1', 'rel', 'ent2'];
			test_data_table.createHeaders(arr);
		});
		
		it('for correct lower limiting', function() {
			var startDate = Date.parse('2012-09-04T01:00:00-08:00'); //before second event
			var endDate = new Date();
	
			var result = test_data_table.extractData(startDate, endDate);
			
			expect(result.length).toBe(3)
		});
	
		it('for correct upper limiting', function() {
			var startDate = new Date(0);
			var endDate = Date.parse('2012-09-05T01:00:00-08:00'); //after second event;
	
			var result = test_data_table.extractData(startDate, endDate);
			expect(result.length).toBe(2);
		});
	
		it('for correct upper and lower limiting', function() {
			var startDate = Date.parse('2012-09-04T01:00:00-08:00'); //before second event;
			var endDate = Date.parse('2012-09-05T01:00:00-08:00'); //after second event;
	
			var result = test_data_table.extractData(startDate, endDate);
			
			expect(result.length).toBe(1);
		});
	
		it('for reaction to non-date inputs', function(){
			var result = test_data_table.extractData("a", "b");
			
			expect(result.length).toBe(0);
		});
		
		it('for invalid backwards inputs', function(){
			var startDate = Date.parse('2012-09-04T01:00:00-08:00'); //before second event;
			var endDate = Date.parse('2012-09-05T01:00:00-08:00'); //after second event;
			
			var result = test_data_table.extractData(endDate, startDate);
			
			expect(result.length).toBe(0);
		});
	});

	describe('Tests the resetAndSend function', function(){
		//create spies for the following functions
		beforeEach(function(){
			
			//TableView is a Backbone instance and errors when called, skip it
			//create an object with a single method getTimes that returns an empty array
			spyOn(test_data_table, 'tableView').andCallFake(function(x) {
				return {getTimes:function(){ return []; }};
			});			
			
			var startDate = Date.parse('2012-09-04T01:00:00-08:00'); //before second event;
			var endDate = Date.parse('2012-09-05T01:00:00-08:00'); //after second event;
			
			//create a table based on valid dates
			var result = test_data_table.createTable(startDate, endDate);
			
			//d3.select('body').attr('class', 'data_table_headers');	used when headers are put into their own table
			
			d3.selectAll('th').remove();
			var arr = ['createdDate', 'ent1', 'rel', 'ent2'];
			test_data_table.createHeaders(arr);
		});
		
		it('for proper method call logic', function(){
			spyOn(d3, 'selectAll').andCallThrough();
			spyOn(JSON, 'stringify').andCallThrough();
			spyOn(Date, 'parse').andCallThrough();
						
			//test only to see if the methods are called with proper params
			test_data_table.resetAndSend();
			
			expect(d3.selectAll).toHaveBeenCalledWith('th');
			expect(Date.parse).toHaveBeenCalled();
			expect(test_data_table.tableView).toHaveBeenCalled();
		});
		
		it('for proper sorting', function(){	
									
			//grab each of the headers
			var ex0 = document.getElementById('0');
			var ex1 = document.getElementById('1');
			var ex2 = document.getElementById('2');
			var ex3 = document.getElementById('3');
			
			//sort ex0 to up
			
			test_data_table.sorter(ex0, 'createdDate');
			expect(ex0.className).toBe('up');
			
			//sort ex2 to up
			test_data_table.sorter(ex2, 'rel');
			expect(ex2.className).toBe('up');
			
			//sort ex1 to down
			test_data_table.sorter(ex1, 'ent1');
			test_data_table.sorter(ex1, 'ent1');
			expect(ex1.className).toBe('down');
			
			//leave ex3 as unsorted
			expect(ex3.className).toBe('unsorted');
			
			test_data_table.resetAndSend();
			
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
			spyOn(test_data_table, 'extractData').andCallFake(function(start, end) {
				return [{
					"createdDate": "2000-11-04T17:42:56-08:00",
					"ent1": "his co-conspirators",
					"rel": "devise",
					"ent2": "a scheme"
				}];
			});
			
			var result = {hi:"there"};
			spyOn(test_data_table, 'tableView').andCallFake(function(x) {
				return result;
			});
			
			call_result = test_data_table.createTable(startDate, endDate);
	
			//function that should have been called
			expect(result).toBeDefined();
			expect(test_data_table.tableView).toHaveBeenCalled();
			expect(test_data_table.extractData).toHaveBeenCalled();
			
			//result should just be an empty object, per spy fake above
			expect(call_result).toEqual(result);
		});
	});
	
	describe('Tests the getPageNumbers function', function(){
		
		it('for proper method call logic with more than the max number of pages', function(){
			spyOn(Math, 'min').andCallThrough();
			spyOn(Math, 'max').andCallThrough();
			
			test_data_table.getPageNumbers(0, 100);
			
			expect(Math.min).toHaveBeenCalledWith(100, 10);
			expect(Math.max).toHaveBeenCalledWith(1, -5);
		});
		
		it('for proper method call logic with less than the max number of pages', function(){
			spyOn(Math, 'min').andCallThrough();
			spyOn(Math, 'max').andCallThrough();
			
			test_data_table.getPageNumbers(0, 1);
			
			expect(Math.min).not.toHaveBeenCalled();
			expect(Math.max).not.toHaveBeenCalled();
		});
		
		it('to return an array of proper length', function(){
			var ns = test_data_table.getPageNumbers(10, 100);
			expect(ns.length).toBeLessThan(15);
			
			ns = test_data_table.getPageNumbers(0, 1);
			expect(ns.length).toEqual(1);
		});
		
		it('to contain ellipses when on a page too far from beginning and end', function(){
			var ns = test_data_table.getPageNumbers(4, 10);
			expect(ns.indexOf("...")).toEqual(-1);
			
			//too far from beginning
			ns = test_data_table.getPageNumbers(7, 11);
			expect(ns.indexOf("...")).toEqual(1);
			
			//too far from end
			ns = test_data_table.getPageNumbers(2, 20);
			expect(ns.indexOf("...")).toEqual(10);
			
			//too far from both
			ns = test_data_table.getPageNumbers(10, 100);
			expect(ns.indexOf("...")).toEqual(1);
			expect(ns.lastIndexOf("...")).toEqual(12);
		});
	});
	
	describe('Tests the showPageNumbers function ', function(){
		
		it('for proper method call logic ', function(){
			spyOn(d3, 'selectAll').andCallThrough();
			spyOn(d3, 'select').andCallThrough();
			spyOn(test_data_table, 'getPageNumbers').andCallThrough();
			
			test_data_table.page = 0;
			test_data_table.max_pages = 15;
			
			test_data_table.showPageNumbers();
			
			expect(d3.selectAll).toHaveBeenCalledWith('a');
			expect(d3.select).toHaveBeenCalledWith('.data_table_pages');
			expect(test_data_table.getPageNumbers).toHaveBeenCalledWith(1, 16);
		
		});
	});
	
	describe('Tests the getSortedColumn function', function(){
		
		it('for proper method call logic', function(){
			spyOn(d3, 'selectAll').andCallThrough();
			
			test_data_table.getSortedColumn();
			
			expect(d3.selectAll).toHaveBeenCalledWith('th');
		});
		
		it('for correct object return when no columns are sorted', function(){
			var arr = ['createdDate', 'ent1', 'rel', 'ent2'];
			test_data_table.createHeaders(arr);
			
			var f = test_data_table.getSortedColumn();
			
			expect(f.id).toEqual('-1');
			expect(f.class).toEqual('unsorted');
		});
		
		it('for correct object return when one column is sorted', function(){
			var arr = ['createdDate', 'ent1', 'rel', 'ent2'];
			test_data_table.createHeaders(arr);
			
			var ex0 = document.getElementById('0');
			var ex1 = document.getElementById('1');
			
			test_data_table.sorter(ex0, 'createdDate');
			var f = test_data_table.getSortedColumn();
			
			expect(f.id).toEqual('0');
			expect(f.class).toEqual('up');
			
			test_data_table.sorter(ex1, 'ent1');
			test_data_table.sorter(ex1, 'ent1');
			f = test_data_table.getSortedColumn();
			
			expect(f.id).toEqual('1');
			expect(f.class).toEqual('down');
		});
	});
	
	describe('Tests the adjustDataWidths function ', function(){
		
		it('for proper method call logic ', function(){
			spyOn(d3, 'selectAll').andCallThrough();
			spyOn(d3, 'select').andCallThrough();
			
			test_data_table.adjustDataWidths();
			
			expect(d3.select).toHaveBeenCalledWith('tr');
			expect(d3.selectAll).toHaveBeenCalledWith('th');
		});
		
	});
	
	describe('Tests the setLocations function ', function(){
		
		it('for proper method call logic ', function(){
			d3.select('.data_table_data')
				.append('div').attr('class', 'data_table_hold')
				.append('div').attr('class', 'data_table_text')
				.append('div').attr('class', 'data_table_inputs');
				
			spyOn(test_data_table, 'getCenter').andCallThrough();
			spyOn(d3, 'select').andCallThrough();
			
			test_data_table.setLocations();
			
			expect(test_data_table.getCenter).toHaveBeenCalledWith('.data_table_hold');
			expect(test_data_table.getCenter).toHaveBeenCalledWith('.data_table_text');
			expect(test_data_table.getCenter).toHaveBeenCalledWith('.data_table_inputs');
			
			expect(d3.select).toHaveBeenCalledWith('.data_table_text');
			expect(d3.select).toHaveBeenCalledWith('.data_table_inputs');
			expect(d3.select).toHaveBeenCalledWith('.data_table_container');
			expect(d3.select).toHaveBeenCalledWith('.data_table_data');
		});
	});
	
	describe('Tests the setMaxRows function ', function(){
	
		it('for proper method call logic ',  function(){
			d3.select('body').attr('class', 'data_table_data');
		
			spyOn(test_data_table.datas, 'slice').andCallThrough();
			spyOn(Math, 'floor').andCallThrough();
			
			test_data_table.setMaxRows(10);
			
			expect(test_data_table.datas.slice).toHaveBeenCalledWith(0, 10);
			expect(Math.floor).toHaveBeenCalled();
		});
		
		it('for proper input validation ', function(){
			spyOn(test_data_table.datas, 'slice').andCallThrough();
			
			test_data_table.setMaxRows(-10);
			expect(test_data_table.datas.slice).not.toHaveBeenCalledWith(0, -10);	
			
			test_data_table.setMaxRows(0);
			expect(test_data_table.datas.slice).not.toHaveBeenCalledWith(0, 0);	
			
			test_data_table.setMaxRows(10000);
			expect(test_data_table.datas.slice).not.toHaveBeenCalledWith(0, 10000);	
			
			test_data_table.setMaxRows(100);
			expect(test_data_table.datas.slice).toHaveBeenCalledWith(0, 100);	
		});
	});
	
	describe('Tests the addRow function ', function(){
		
		it('for proper method call logic when isIn is false', function(){
			spyOn(test_data_table.shown_datas, 'indexOf').andCallThrough();
			spyOn(test_data_table.datas, 'indexOf').andCallThrough();
			
			var that = {
				render: function(){  },
				renderSentence: function(){  }
			};
			
			var a = {
				monkey: "see"
			};
			
			test_data_table.addRow(a, that);
			
			expect(test_data_table.shown_datas.indexOf).toHaveBeenCalledWith(a);
			expect(test_data_table.datas.indexOf).toHaveBeenCalledWith(a);
		});
		
		it('for proper method call logic when isIn is true', function(){
			spyOn(d3, 'selectAll').andCallThrough();
			spyOn(d3, 'select').andCallThrough();
		
			var that = {
				render: function(){ },
				renderSentence: function(){  }
			};
		
			var a = {
				monkey: "see"
			};
		
			test_data_table.shown_datas = [a];
			test_data_table.addRow(a, that);
			
			expect(d3.selectAll).toHaveBeenCalledWith('tr');
		});
		
	});
});
