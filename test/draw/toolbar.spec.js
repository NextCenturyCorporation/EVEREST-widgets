describe('the toolbar set up functions', function(){
	
	d3.select('body').append('div').attr('class', 'toolbar');
	var test_tool = new toolbar('.toolbar');
	
	it('the createSelection function', function(){					
		expect(test_tool.num_tools).toEqual(0);
		
		var sel = test_tool.createSelection('test_hold', 'img/move.png');
		var rect = sel.select('rect');
		expect(test_tool.num_tools).toEqual(1);
		expect(sel.attr('class')).toEqual('test_hold');
		//expect(parseInt(rect.attr('x'))).toEqual(test_tool.center.x - test_tool.radius - 3);
		//expect(parseInt(rect.attr('y'))).toEqual(25 - test_tool.radius - 3);
		//expect(parseInt(rect.attr('width'))).toEqual(2*(test_tool.radius + 3));
		//expect(parseInt(rect.attr('height'))).toEqual(2*(test_tool.radius + 3));
		
		var sel1 = test_tool.createSelection('test_hold1', 'img/move.png');
		var sel2 = test_tool.createSelection('test_hold2', 'img/move.png');
		
		var gs = test_tool.svg[0][0].childNodes;
		expect(test_tool.num_tools).toEqual(3);
		expect(gs.length).toEqual(3);
	});
});