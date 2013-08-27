describe('the toolbar set up functions', function(){
	var test_tool = new toolbar('toolbar');
	d3.select('body').append('div').attr('class', 'toolbar')
		.append('svg').style('width', '500px').style('height', '500px');
	
	it('the createSelection function', function(){					
		expect(test_tool.num_tools).toEqual(0);
		d3.selectAll('svg').remove();
		var svg = d3.select('.toolbar').append('svg').attr('class', 'svg');
		
		var sel = test_tool.createSelection('test_hold', 'img/move.png');
		var rect = sel.select('rect');
		expect(test_tool.num_tools).toEqual(1);
		expect(sel.attr('class')).toEqual('test_hold');
		//expect(parseInt(rect.attr('x'))).toEqual(test_tool.center.x - test_tool.radius - 3);
		//expect(parseInt(rect.attr('y'))).toEqual(25 - test_tool.radius - 3);
		//expect(parseInt(rect.attr('width'))).toEqual(2*(test_tool.radius + 3));
		//expect(parseInt(rect.attr('height'))).toEqual(2*(test_tool.radius + 3));
		
		test_tool.createSelection('test_hold1', 'img/move.png');
		test_tool.createSelection('test_hold2', 'img/move.png');
		
		var gs = d3.selectAll('g')[0];
		expect(gs.length).toEqual(3);
	});
});