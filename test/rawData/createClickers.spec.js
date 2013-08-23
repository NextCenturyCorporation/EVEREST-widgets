/**
 * createClickers
 */

console.log('createClickers.spec.js');

this.datas = [{
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
	
	describe('by testing the createClickers function', function(){
	
		beforeEach(function(){
			//needed in order for resetAndSend to work correctly
			spyOn(window, 'TableView').andCallFake(function(x) {
				return {getTimes:function(){ return []; }};
			});			
			OWF.Eventing.publish = jasmine.createSpy('OWF.Eventing.publish').andCallFake(function(str1, str2){
				return str2;
			});
			
		});
	
		it('for method call logic', function(){
			spyOn(d3, 'selectAll').andCallThrough();
			spyOn(d3, 'select').andCallThrough();
	
			createClickers();
	
			//if select and selectAll were called with correct params
			expect(d3.selectAll).toHaveBeenCalledWith('th');
			expect(d3.select).toHaveBeenCalledWith('#submit');
			expect(d3.select).toHaveBeenCalledWith('#reset');
		});
		
		describe('for overall header clicker functionality', function(){
			beforeEach(function(){
			
				//needed in order to get createHeaders to work correctly
				d3.selectAll('th').remove();
				d3.selectAll('div').remove();
				d3.select('body').attr('id', 'raw_data');
				var arr = ['time', 'ent1', 'rel', 'ent2'];
				var h = createHeaders(arr);
				
				createClickers();
			});
		
			it('specifically for method call logic', function(){
				temp = datas;
				spyOn(window, 'parseInt').andCallThrough();
				spyOn(Object, 'keys').andCallThrough();
				spyOn(window, 'sorter').andCallThrough();
				
				//simulate a click event on the first header ('time') and select it as a
				$('#0').trigger('click');
				var a = document.getElementById('0');
				
				//functions that should be called with expected parameters
				expect(parseInt).toHaveBeenCalledWith('0', 10);
				expect(Object.keys).toHaveBeenCalledWith({
					"time": "2012-08-04T02:37:47-07:00",
					"ent1": "the ongoing reports of fraud",
					"rel": "establish",
					"ent2": "contacts"
				});
				expect(sorter).toHaveBeenCalledWith(a, 'time');
				expect(TableView).toHaveBeenCalledWith(temp);
			});
			
			it('specifically for proper resulting values', function(){
				//elements to compare classNames against
				var a = document.getElementById('0');
				var b = document.getElementById('3');
				
				//before click, the headers should be of class unsorted
				expect(a.className).toBe('unsorted');
				expect(b.className).toBe('unsorted');
				
				$('#0').trigger('click');
				
				//after click, clicked should be up and everything else unsorted
				expect(a.className).toBe('up');
				expect(b.className).toBe('unsorted');
			});
		});
		
		describe('for overall submit clicker functionality', function(){
			beforeEach(function(){
				
				d3.select('body').append('div').attr('id', 'submit')
								 .append('div').attr('id', 'start')
								 .append('div').attr('id', 'end')
								 .append('div').attr('id', 'reset');
								 
				createClickers();
				spyOn(window, 'createTable').andCallThrough();
				temp = datas;
			});
			
			it('specifically the call logic', function(){
				var s = Date.parse('01/01/2012'); 
				var e = Date.parse('01/01/2013'); 
			
				spyOn(window, 'resetAndSend').andCallThrough();
					
				$('#start').val('01/01/2012');
				$('#end').val('01/01/2013');
				
				//simulate a click event on submit button
				$('#submit').trigger('click');
				
				//make sure these functions are called
				expect(createTable).toHaveBeenCalledWith(s,e);
				expect(resetAndSend).toHaveBeenCalled(); 
			});
			
			it('specifically the result values with proper input', function(){
							
				var s = Date.parse('01/01/2012'); 		//before first 
				var e = Date.parse('09/01/2012'); 		//after first
			
				//pretend the start and end divs hold these dates
				$('#start').val('01/01/2012');
				$('#end').val('09/01/2012');
				
				$('#submit').trigger('click');
				
				//the divs must now be empty
				expect($('#start').val()).toEqual('');
				expect($('#end').val()).toEqual('');
				
				//only one element in datas matched so the table reflects this
				expect(temp.length).toEqual(1);
			})
			
			it('specifically the result values with bad input', function(){
				var s = Date.parse('01/01/2012'); 
				var e = Date.parse('01/01/2013');
			
				$('#start').val('01/01/2013');
				$('#end').val('01/01/2012');
				$('#submit').trigger('click');
				
				//the inputs are invalid so createTable should've been called with MIN, MAX
				expect(createTable).toHaveBeenCalledWith(0, Number.MAX_VALUE);
				
				//all four elements should still be shown
				expect(temp.length).toEqual(4);
			});
		});
		
		describe('for overall reset clicker functionality', function(){
		
			it('specifically for method call logic', function(){
				spyOn(window, 'createTable').andCallThrough();
				spyOn(window, 'resetAndSend').andCallThrough();
				
				//simulate click event on reset button
				$('#reset').trigger('click');
				
				//reset the table, populating with all data
				expect(createTable).toHaveBeenCalledWith(0, Number.MAX_VALUE);
				expect(resetAndSend).toHaveBeenCalled();
			});
			
			it('specifically for proper resulting values', function(){
				//pretend temp is initially just 1 element long
				temp = [{
					"time": "2012-08-04T02:37:47-07:00",
					"ent1": "the ongoing reports of fraud",
					"rel": "establish",
					"ent2": "contacts"
				}];
				
				$('#reset').trigger('click');
				
				//temp should now contain all elements of data, was 1 before
				expect(temp.length).toEqual(4);
			});
		});
	});
});
