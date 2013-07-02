//an attempt to create a backbone testing file

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

describe('Test src/widgets/rawData/js/table.js backbone MVC implementation', function(){
	it("should expose and attribute", function(){
		var body = d3.select('body').attr('id', 'raw_data');
		createHeaders(Object.keys(datas[0]));
		
		spyOn(d3, 'selectAll').andCallThrough();
		//spyOn(window, 'Table').andCallThrough();
		spyOn(_, 'each').andCallThrough();
		
		var table = new TableView(datas);
		
		var apple = table.getTimes();
		
		//if collection is holding the correct number of elements
		expect(apple.length).toEqual(4);
		
		var n = 0;
		
		d3.selectAll("th").each(function(){ ++n; });
		
		//expect(n).toEqual(4);
		
		expect(d3.selectAll).toHaveBeenCalledWith('tr');
		expect(_.each).toHaveBeenCalled();
		
	});
	
	it('should create a Sentence', function(){
		var s = new Sentence();
		expect(s).toBeDefined();
	});
	
	it('should create a Table', function(){
		var t = new Table(datas);
		expect(t.model).toBe(Sentence);
		expect(t.length).toBe(4);
		
	});
});