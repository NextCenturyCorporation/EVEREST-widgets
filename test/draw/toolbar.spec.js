describe('the toolbar set up functions', function(){
	var test_tool = new toolbar();
	d3.select('body').append('div').attr('class', 'toolbar')
		.append('svg').style('width', '500px').style('height', '500px');
	
	it('the createSelection function', function(){					
		expect(test_tool.num_tools).toEqual(0);
		d3.selectAll('svg').remove();
		var svg = d3.select('.toolbar').append('svg').attr('class', 'svg');
		
		var sel = test_tool.createSelection(svg, 'test_hold');
		var rect = sel.select('rect');
		expect(test_tool.num_tools).toEqual(1);
		expect(sel.attr('class')).toEqual('test_hold');
		//expect(parseInt(rect.attr('x'))).toEqual(test_tool.center.x - test_tool.radius - 3);
		//expect(parseInt(rect.attr('y'))).toEqual(25 - test_tool.radius - 3);
		//expect(parseInt(rect.attr('width'))).toEqual(2*(test_tool.radius + 3));
		//expect(parseInt(rect.attr('height'))).toEqual(2*(test_tool.radius + 3));
		
		test_tool.createSelection(svg, 'test_hold1');
		test_tool.createSelection(svg, 'test_hold2');
		
		var gs = d3.selectAll('g')[0];
		expect(gs.length).toEqual(3);
	});
	
	it('the createToolbar function ', function(){
		d3.selectAll('svg').remove();
		var svg = d3.select('.toolbar').append('svg').attr('class', 'svg');
		spyOn(d3, 'select').andCallThrough();
		spyOn(test_tool, 'createSelection').andCallThrough();
					
		test_tool.createToolbar();
		
		expect(d3.select).toHaveBeenCalledWith('.toolbar');
		expect(test_tool.createSelection).toHaveBeenCalled();
		expect(test_tool.createSelection.callCount).toEqual(5);
		
		var gs = d3.selectAll('g')[0];
		expect(gs.length).toEqual(5);
	});
});