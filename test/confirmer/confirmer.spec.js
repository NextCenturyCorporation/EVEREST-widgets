describe('test the confirmer.js file', function() {

	var alphareports = [
		{
		    comparedTo: [
		      {item_id:4,score:100},
		      {item_id:400004,score:50},
		      {item_id:400016,score:25}
		    ],
		    name: "alpha report",
		    _id: 4
	  	}, {
		    comparedTo: [
		      {item_id:400004,score:100},
		      {item_id:4,score:50},
		      {item_id:400016,score:25}
		    ],
		    name: "alpha report",
		    _id: 400004
	  	}, {
		    comparedTo: [
		      {item_id:400016,score:100},
		      {item_id:400004,score:25},
		      {item_id:4,score:25}
		    ],
		    name: "alpha report",
		    _id: 400016
	  	}
	];
  	
  	var path = [
	 	{
		 	comparedTo: [
			 	{item_id:4,score:100},
			 	{item_id:400004,score:50},
			 	{item_id:400016,score:25}
		 	],
		 	name: "alpha report",
			_id: 4
	 	}, {
		 	_id: "25-c-2F0LaTPQCq",
		 	_type: "edge",
		 	_outV: 12,
		 	_inV: 4,
		 	_label: "metadata of"
	    }, {
		 	name: "tree",
		 	type: "entity2",
		 	_id: 12,
		 	_type: "vertex"
	    }, {
		 	_id: "2d-8-2F0LaTPQCy",
		 	_type: "edge",
		 	_outV: 8,
		 	_inV: 12,
		 	_label: "went up"
	    }, {
		 	name: "squirrel",
		 	type: "entity1",
		 	_id: 8,
		 	_type: "vertex"
	    }
	];

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
	
	it('test populateLeftGraphs function', function() {
		spyOn(d3, 'selectAll').andCallThrough();
		spyOn(test_confirm, 'getTitanItem').andCallFake(function(){
			console.log('fake1');
		});
		spyOn(test_confirm, 'getTitanPaneTwo').andCallFake(function(){
			console.log('fake2');
		});
		
		test_confirm.populateLeftGraphs(alphareports);
		
		expect(d3.selectAll).toHaveBeenCalledWith('#information li');
		expect(test_confirm.getTitanItem).toHaveBeenCalled();
		expect(test_confirm.getTitanPaneTwo).toHaveBeenCalled();
		
		expect(d3.selectAll('#panel-one-select option')[0].length).toEqual(3);
		expect(test_confirm.curr_pane_one_item).toEqual(alphareports[0]);
	});
	
	it('test populateRightGraphs function', function() {
		spyOn(d3, 'select').andCallThrough();
		spyOn(test_confirm, 'getTitanItem').andCallFake(function(){
			console.log('fake3');
		});
		
		test_confirm.populateRightGraphs(alphareports[0].comparedTo);
		
		expect(d3.select).toHaveBeenCalledWith('#panel-two-select');
		expect(test_confirm.getTitanItem).toHaveBeenCalled();
		
		expect(d3.selectAll('#panel-two-select option')[0].length).toEqual(3);
	});
	
	it('test the buildLinksNodes function from espace', function() {
		var nodes = [];
		var edges = [];
		
		buildLinksNodes(path, nodes, edges, [], []);
		
		expect(nodes.length).toEqual(2);
		expect(edges.length).toEqual(1);
	});
});