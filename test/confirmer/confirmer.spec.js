describe('test the confirmer.js file', function(){
	
	var app = d3.select('body').append('div').attr('class', 'app');
	var confirm = app.append('div').attr('id', 'confirm');
	var alpha = app.append('div').attr('class', 'alpha');
	var alpha_report = alpha.append('div').attr('id', 'alpha_report');
	alpha_report.append('select').attr('id', 'panel-one-select');
	alpha_report.append('div').attr('id', 'panel-one-info');
	alpha.append('div').attr('id', 'asserts');
	

	var matcher = app.append('div').attr('class', 'matcher');
	var confirm = matcher.append('div').attr('id', 'confirmer');
	confirm.append('select').attr('id', 'panel-two-select');
	confirm.append('div').attr('id', 'panel-two-info');
	matcher.append('div').attr('id', 'target-pattern');
	
	var test_confirm = new comparer();
	
	it('test that comparer works', function(){
		spyOn(test_confirm, 'getTitanPaneOne').andCallThrough();
		spyOn(d3, 'select').andCallThrough();
		
		test_confirm.createListeners();
		test_confirm.display();
		
		expect(test_confirm).not.toEqual(null);
		expect(test_confirm.getTitanPaneOne).toHaveBeenCalled();
		expect(d3.select).toHaveBeenCalledWith('#get_pane1');
		expect(d3.select).toHaveBeenCalledWith('#confirm');
		expect(d3.select).toHaveBeenCalledWith('#panel-two-select');
		expect(d3.select).toHaveBeenCalledWith('#panel-one-select');
		
		console.log(test_confirm.pane_one_items);
	});
	
	it('test getTitanPaneOne function', function(){
		spyOn(d3, 'selectAll').andCallThrough();
		spyOn($, 'get').andCallThrough();
		
		test_confirm.getTitanPaneOne();
		
		expect(d3.selectAll).toHaveBeenCalledWith('#panel-one-select option');
		expect($.get).toHaveBeenCalled();
	});
	
	it('test getTitanPaneTwo function', function(){
		spyOn(d3, 'selectAll').andCallThrough();
		
		test_confirm.curr_pane_one_item = {
			name: 'one',
			comparedTo: []
		};
		
		test_confirm.getTitanPaneTwo();
		
		expect(d3.selectAll).toHaveBeenCalledWith('#panel-two-select option');
		expect(d3.selectAll).toHaveBeenCalledWith('#information li');
	});
	
	it('test getTitanItem function', function(){
		spyOn($, 'get').andCallThrough();
		
		test_confirm.getTitanItem(1, test_confirm.net2);
		
		expect($.get).toHaveBeenCalled();
	});
});