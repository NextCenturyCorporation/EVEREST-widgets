/**
 *  use spyOn(window, apple).andCallThrough()
   when the function is called like this : apple(s1,s2)
   you want the function to still call as normal and you
   just want to see if it was called, maybe with what 
   params it was called
   
   use spyOn(object, apple).andCallThrough()
   when the function is called like this : object.apple(s1,s2)
   
   use spyOn(object, apple).andCallFake() 
   when you want to bypass what object.apple actually does and
   make it return or perform something else 
**/
   
	
	var datas = [{
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
	
	describe('Tests the functionality of sorter', function(){
		
		it('for switching to descending sort with simple element', function(){
			temp = datas;
			spyOn(d3, 'selectAll').andCallThrough();
			
			//example element with the only necessary element for sorter
			var elem = {"className":"up"};
			
			//sort datas by column 'ent1' providing example element above
			sorter(elem, 'ent1');
			//sorter(elem, 'ent1', datas);
			
			expect(d3.selectAll).toHaveBeenCalledWith('th');
			expect(temp).toBeDefined();
			
			//check the order of datas for correct descending sort
			expect(temp[0].ent1).toEqual("the ongoing reports of fraud");
			expect(temp[1].ent1).toEqual("the defendant");
			expect(temp[2].ent1).toEqual("his co-conspirators");
			expect(temp[3].ent1).toEqual("# co-conspirators");
		});
		
		it('for switching to ascending sort with simple element', function(){
			temp = datas;
			//example element with the only necessary element for sorter
			var elem = {"className":"down"};
			
			//sort datas by column 'rel' providing example element above
			sorter(elem, 'rel');
			//sorter(elem, 'rel', datas);
			
			//length of datas must still be 4, no gains or losses to array
			expect(datas.length).toEqual(4);
			
			//check the order of datas for correct ascending sort
			expect(datas[3].rel).toEqual("establish");
			expect(datas[2].rel).toEqual("devise");
			expect(datas[1].rel).toEqual("convict of");
			expect(datas[0].rel).toEqual("conspire to defraud");
		});
		
		//to see if sorter functions correctly if there is only one element
		it('for sorting a single item', function(){
			var temp = [{
				"time": "2012-08-04T02:37:47-07:00",
				"ent1": "the ongoing reports of fraud",
				"rel": "establish",
				"ent2": "contacts"
			}];
			
			//example element with the only necessary element for sorter
			var elem = {"className":"unsorted"};
			
			//sort datas by column 'ent2' providing example element above
			sorter(elem, 'ent2');
			
			//check to see if the element's class name is initially sorted to up
			expect(elem.className).toBe('up');
			
			//resorting and checking if the class name is now down
			sorter(elem, 'ent2');
			expect(elem.className).toBe('down');
			
			//length of datas must still be 1, no gains or losses to array
			expect(temp.length).toEqual(1);
		});
		
		//to see if sorter functions correctly if there are no elements
		it('for sorting an empty array', function(){
			temp = [];
			
			//example element with the only necessary element for sorter
			var elem = {"className":"unsorted"};
			
			//sorting and checking if the class name is still unsorted
			sorter(elem, 'time');
			expect(elem.className).toBe('unsorted');
			
			//datas stil empty
			expect(temp.length).toBe(0);
		});
		
		//using the createHeaders function to provide actual element classes
		it('for sorting with header elements already created', function(){
			temp = datas;
			//set up body to include appropriate id for createHeader
			d3.selectAll('th').remove();
			d3.select('body').attr('id', 'raw_data');
			var arr = ['time', 'ent1', 'rel', 'ent2'];
			var h = createHeaders(arr);
			
			//grab each of the headers
			var ex0 = document.getElementById('0');
			var ex1 = document.getElementById('1');
			var ex2 = document.getElementById('2');
			var ex3 = document.getElementById('3');
			
			//sort datas by time col, ex0's class should now be up
			sorter(ex0, 'time');
			expect(ex0.className).toBe('up');
			
			//sort datas again by time, ex0's class should now be down
			sorter(ex0, 'time');
			expect(ex0.className).toBe('down');
			
			//after this sort, all other ex's should be of class unsorted
			expect(ex1.className).toBe('unsorted');
			expect(ex2.className).toBe('unsorted');
			expect(ex3.className).toBe('unsorted');
		});
	});
	
	describe('Tests the getCenter function', function(){
		beforeEach(function(){
			//remove all divs from body so new ones may be appended for each it
			d3.selectAll('div').remove();
			var holder = d3.select('body').attr('id', '#raw_data');
			
			//example divs to be used to test getCenter
			holder.append('div').attr('id', 'hold').style('width', '10000px')
				  .append('div').attr('id', 'title').style('width', '200px')
				  .append('div').attr('id', 'inputs').style('width', '50px');
		});
	
		it('for proper method call logic', function(){
			spyOn(d3, 'select').andCallThrough();
			spyOn(window, 'parseInt').andCallThrough();
			
			//just to see if the spied upon functions are ran
			getCenter('#hold');
			
			expect(d3.select).toHaveBeenCalled();
			expect(parseInt).toHaveBeenCalled();
		});
		
		it('for correct return centers', function(){
			//if getCenter returns halved values of above examples
			expect(getCenter('#hold')).toEqual(5000);
			expect(getCenter('#title')).toEqual(100);
			expect(getCenter('#inputs')).toEqual(25);
		});
	});
	
	describe('Tests the setLocations function', function(){
	
		beforeEach(function(){
			//remove all divs from body so new ones may be appended for each it
			d3.selectAll('div').remove();
			
			//set up body to hold divs with example widths for getCenter
			var holder = d3.select('body').attr('id', '#raw_data');
			holder.append('div').attr('id', 'hold').style('width', '10000px')
				  .append('div').attr('id', 'title').style('width', '200px')
				  .append('div').attr('id', 'inputs').style('width', '50px');
		});
	
		it('for proper method call logic', function(){
			spyOn(d3, 'select').andCallThrough();
			spyOn(window, 'getCenter').andCallThrough();
			
			setLocations();
			
			//call to check to see if functions are called with correct inputs
			expect(d3.select).toHaveBeenCalledWith('#title');
			expect(d3.select).toHaveBeenCalledWith('#inputs');
			expect(d3.select).toHaveBeenCalledWith('#raw_data');
			
			expect(getCenter).toHaveBeenCalledWith('#hold');
			expect(getCenter).toHaveBeenCalledWith('#title');
			expect(getCenter).toHaveBeenCalledWith('#inputs');
		});
		
		it('for addition/change of element attributes', function(){
			setLocations();
			
			var a = d3.select('#title').style('margin-left');
			var b = d3.select('#inputs').style('margin-left');
			//var c = d3.select('#raw_data').style('width');
			
			expect(a).toEqual('4900px');
			expect(b).toEqual('4975px');
			//expect(c).toEqual('10000px');
		});
	});
		
	describe('Tests the createHeaders function', function(){
		//remove headers so createHeaders can add more later
		beforeEach(function(){
			d3.selectAll('th').remove();
			d3.select('body').attr('id', 'raw_data');
		});
		
		it('for proper method call logic', function(){
			
			spyOn(d3, 'select').andCallThrough();
			
			var arr = ['a', 'b', 'c'];
			var h = createHeaders(arr);
			
			//check to see if function is called with id raw_data
			expect(d3.select).toHaveBeenCalledWith('#raw_data');
		});
		
		it('for addition of actual html elements', function(){
			var arr = ['a', 'b', 'c'];
			var h = createHeaders(arr);
			
			//count up the number of headers added to the body
			var n = 0;
			h.selectAll('th').each(function(){ ++n; });
			
			//there should have been 3 elements added during createHeaders
			expect(n).toEqual(arr.length);
			
			//check attributes of an element to see if they match input
			var exElem = h.select('th');
			expect(exElem.text()).toEqual('a');
			expect(exElem.attr('id')).toEqual('0');
			expect(exElem.attr('class')).toEqual('unsorted');
		});	
	});
	
	describe('Tests extractData function', function(){
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
	
	describe('Tests the resetAndSend function', function(){
		//create spies for the following functions
		beforeEach(function(){
			
			//TableView is a Backbone instance and errors when called, skip it
			//create an object with a single method getTimes that returns an empty array
			spyOn(window, 'TableView').andCallFake(function(x) {
				return {getTimes:function(){ return []; }};
			});			
			
			//would only work in the OWF instance anyway, skip and return a string
			OWF.Eventing.publish = jasmine.createSpy('OWF.Eventing.publish').andCallFake(function(str1, str2){
				return str2;
			});
			
			var startDate = Date.parse('2012-09-04T01:00:00-08:00'); //before second event;
			var endDate = Date.parse('2012-09-05T01:00:00-08:00'); //after second event;
			
			//create a table based on valid dates
			var result = createTable(startDate, endDate);
		});
		
		it('for proper method call logic', function(){
			
			spyOn(d3, 'selectAll').andCallThrough();
			spyOn(JSON, 'stringify').andCallThrough();
			spyOn(Date, 'parse').andCallThrough();
			
			//test only to see if the methods are called with proper params
			resetAndSend();
			
			expect(d3.selectAll).toHaveBeenCalledWith('th');
			expect(JSON.stringify).toHaveBeenCalledWith([]);
			expect(TableView).toHaveBeenCalled();
			expect(OWF.Eventing.publish).toHaveBeenCalled();
		});
		
		it('for proper resetting of all attributes of each element', function(){
		
			//set up body to include appropriate id for createHeader
			d3.selectAll('th').remove();
			d3.select('body').attr('id', 'raw_data');
			var arr = ['time', 'ent1', 'rel', 'ent2'];
			var h = createHeaders(arr);
			
			//grab each of the headers
			var ex0 = document.getElementById('0');
			var ex1 = document.getElementById('1');
			var ex2 = document.getElementById('2');
			var ex3 = document.getElementById('3');
			
			//sort ex0 to up
			sorter(ex0, 'time');
			expect(ex0.className).toBe('up');
			
			//sort ex2 to up
			sorter(ex2, 'rel');
			expect(ex2.className).toBe('up');
			
			//sort ex1 to down
			sorter(ex1, 'ent1');
			sorter(ex1, 'ent1');
			expect(ex1.className).toBe('down');
			
			//leave ex3 as unsorted
			expect(ex3.className).toBe('unsorted');
			
			resetAndSend();
			
			//after reset, all elements' classes should be unsorted
			expect(ex0.className).toBe('unsorted');
			expect(ex1.className).toBe('unsorted');
			expect(ex2.className).toBe('unsorted');
			expect(ex3.className).toBe('unsorted');
		});
	});
		
});
