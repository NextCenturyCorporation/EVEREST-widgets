datas = [{
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


describe('Test src/widgets/rawFeed/js/table.js base functions', function(){
	
	
	describe('Tests the createClickers function', function(){
	
		it('Tests createClickers method call logic', function(){
			spyOn(d3, 'selectAll').andCallThrough();
			spyOn(d3, 'select').andCallThrough();
	
			createClickers();
	
			expect(d3.selectAll).toHaveBeenCalledWith('th');
			expect(d3.select).toHaveBeenCalledWith('#submit');
			expect(d3.select).toHaveBeenCalledWith('#reset');
		});
	});
	
	describe('Tests the functionality of sorter', function(){
		it('for switching to descending sort', function(){
			spyOn(d3, 'selectAll').andCallThrough();
			
			var elem = {"className":"up"};
			
			var temp = sorter(elem, 'ent1', datas);
			
			expect(d3.selectAll).toHaveBeenCalledWith('th');
			expect(temp).toBeDefined();
			expect(temp[0].ent1).toEqual("the ongoing reports of fraud");
			expect(temp[1].ent1).toEqual("the defendant");
			expect(temp[2].ent1).toEqual("his co-conspirators");
			expect(temp[3].ent1).toEqual("# co-conspirators");
		});
		
		it('for switching to ascending sort', function(){
			var elem = {"className":"down"};
			
			var temp = sorter(elem, 'rel', datas);
			
			expect(temp.length).toEqual(4);
			expect(temp[3].rel).toEqual("establish");
			expect(temp[2].rel).toEqual("devise");
			expect(temp[1].rel).toEqual("convict of");
			expect(temp[0].rel).toEqual("conspire to defraud");
		});
		
		it('for sorting a single item', function(){
			var datas = [{
				"time": "2012-08-04T02:37:47-07:00",
				"ent1": "the ongoing reports of fraud",
				"rel": "establish",
				"ent2": "contacts"
			}];
			var elem = {"className":"unsorted"};
			var temp = sorter(elem, 'ent2', datas);
			expect(elem.className).toBe('up');
			
			temp = sorter(elem, 'ent2', datas);
			expect(elem.className).toBe('down');
			
			expect(datas.length).toEqual(1);
		});
		
		it('for sorting an empty array', function(){
			var datas = [];
			
			var elem = {"className":"unsorted"};
			var temp = sorter(elem, 'time', datas);
			expect(datas.length).toBe(0);
		});
	});
	
	describe('Tests the getCenter function', function(){
		it('for correct return widths', function(){
			var elem = {width:"50px"};
			
			
		});
	});
	
	describe('Tests the setLocations function', function(){
		/**TODO*/
	});
		
	describe('Tests the createHeaders function', function(){
		it('Tests createHeaders method call logic', function(){
			spyOn(d3, 'select').andCallThrough();
			
			var arr = ['a', 'b', 'c'];
			var h = createHeaders(arr);
			
			var n = 0;
			h.selectAll('th').each(function(){ ++n; });
			
			expect(d3.select).toHaveBeenCalledWith('#raw_data');
		});
	});
	
	describe('Tests extractData function', function(){
		it('for correct lower limiting', function() {
			var startDate = Date.parse('2012-09-04T01:00:00-08:00'); //before second event
			var endDate = new Date();
	
			var result = extractData(startDate, endDate);
			
			expect(result.length).toBe(3)
		});
	
		it('for correct upper limiting', function() {
			var startDate = new Date(0);
			var endDate = Date.parse('2012-09-05T01:00:00-08:00'); //after second event;
	
			var result = extractData(startDate, endDate);
			
			expect(result.length).toBe(2);
		});
	
		it('for correct upper and lower limiting', function() {
			var startDate = Date.parse('2012-09-04T01:00:00-08:00'); //before second event;
			var endDate = Date.parse('2012-09-05T01:00:00-08:00'); //after second event;
	
			var result = extractData(startDate, endDate);
			
			expect(result.length).toBe(1);
		});
	
		it('for reaction to non-date inputs', function(){
			var result = extractData("a", "b");
			expect(result.length).toBe(0);
		});
		
		it('for backwards inputs', function(){
			var startDate = Date.parse('2012-09-04T01:00:00-08:00'); //before second event;
			var endDate = Date.parse('2012-09-05T01:00:00-08:00'); //after second event;
			
			var result = extractData(endDate, startDate);
			
			expect(result.length).toBe(0);
		});
	});
	
	describe('Tests the resetAndSend function', function(){
		it('for proper method call logic', function(){
			var startDate = Date.parse('2012-09-04T01:00:00-08:00'); //before second event;
			var endDate = Date.parse('2012-09-05T01:00:00-08:00'); //after second event;
			
			spyOn(d3, 'selectAll').andCallThrough();
			spyOn(JSON, 'stringify').andCallThrough();
			spyOn(Date, 'parse').andCallThrough();
			spyOn(window, 'TableView').andCallFake(function(x) {
				return {getTimes:function(){ return []; }};
			});			
			OWF.Eventing.publish = jasmine.createSpy('OWF.Eventing.publish').andCallFake(function(str1, str2){
				return str2;
			});
			
			var result = createTable(startDate, endDate);
			resetAndSend();
			
			expect(d3.selectAll).toHaveBeenCalledWith('th');
			expect(JSON.stringify).toHaveBeenCalledWith([]);
			expect(Date.parse).toHaveBeenCalled();
			expect(TableView).toHaveBeenCalled();
			expect(OWF.Eventing.publish).toHaveBeenCalled();
		});
	});
		
	describe('Tests the createTable function', function(){
		it('for proper initialization and method call logic', function() {
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
			var result = {hi:"there"};
			expect(result).toEqual({hi:"there"});
	
			spyOn(window, 'TableView').andCallFake(function(x) {
				return {};
			});
			
			result = createTable(startDate, endDate);
	
			expect(result).toBeDefined();
			expect(result).toEqual({});
			expect(TableView).toHaveBeenCalled();
	
			expect(extractData).toHaveBeenCalled();
		});
	});
});
