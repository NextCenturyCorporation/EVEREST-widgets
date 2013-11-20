/**
 * This function builds the links and nodes arrays from a Titan query
 * ALTERED FROM ESPACE LINKS AND NODES WIDGET
 */
var buildLinksNodes = function(input, nodes, edges, nodesById, edgesById){
    if($.isArray(input)){
        /*
         * We need to loop twice. The first time is to make sure we know all of the nodes,
         * the 2nd time is to check for all of the vertices.
         * If all of the elements are arrays, the 2nd loop just wastes cycles.
         */
        input.forEach(function(d){
            //Nested arrays, do this again
            if($.isArray(d)){
                d.forEach(function(e){
                    buildLinksNodes(e, nodes, edges, nodesById, edgesById);
                });
            } else {
                //Check if its a known vertex or not
                if(d._type == 'vertex' && !nodesById[d._id]){
                	if ( d.name !== 'alpha report' && d.name !== 'target event'){
	                    nodesById[d._id] = d;
	                    nodes.push(d);
                		console.log(nodesById);
                		console.log(nodes);
	                }
                }
            }
        });
        //Loop to check for vertices
        input.forEach(function(d){
            //Skip this loop for arrays
            if(!$.isArray(d)){
                if(d._type == 'edge' && !edgesById[d._id] && d._label !== 'metadata of'){
                    edgesById[d._id] = true;
                    //The source and target elements need to be references to the full vertices
                    d.source = nodesById[d._outV];
                    d.target = nodesById[d._inV];
                    edges.push(d);
                }
            }
        });
    } else {
        //A single element Check if its a new link or node
        if(input._type == 'vertex' && !nodesById[input._id]){
            nodesById[input._id] = input;
            nodes.push(input);
        } else if(input._type == 'edge' && !edgesById[input._id] && input._label !== 'metadata of'){
            edgesById[input._id] = true;
            //The source and target elements need to be references to the full vertices
            input.source = nodesById[input._outV];
            input.target = nodesById[input._inV];
            edges.push(input);
        }
    }
}; 

var getObj = function(array, value, attribute){
	for (var i = 0; i < array.length; i++){
		if ( value === array[i][attribute] ){
			return array[i];
		}
	}
};

var comparer = function(){
	var me = this;
	var url = 'http://everest-build:8081/confirmed-report';
	var titan = 'http://everest-build:8081/titan-graph/';
	me.pane_one_items = [];
	me.pane_two_items = [];

	me.width = d3.select('#asserts').style('width').split('p')[0];
	me.height = d3.select('#asserts').style('height').split('p')[0];

	me.curr_pane_one_item = null;
	me.curr_pane_two_item = null;
	
	me.svg_target = d3.select('#target-pattern')
		.append('svg')
		.attr('width', me.width)
		.attr('height', me.height);
	
	me.svg_asserts = d3.select('#asserts')
		.append('svg')
		.attr('width', me.width)
		.attr('height', me.height);
		
	me.net1 = {
		network : null,
		id: '#panel-one-svg',
		svg: me.svg_asserts,
		name: 'alpha report'
	};
	
	me.net2 = {
		network : null,
		id: '#panel-two-svg',
		svg: me.svg_target,
		name: 'target event'
	};
	
	me.populateLeftGraphs = function(data) {
		d3.selectAll('#information li').remove();
		me.pane_one_items = data;
		if ( me.pane_one_items.length > 0 ){
			me.pane_one_items.forEach(function(item){
				var str = '';
				if (item.name === 'target event') {
					str += 'Target Event';
				} else if (item.name === 'alpha report') {
					str += 'Alpha Report';
				}
				
				str += ' ' + item._id;
				d3.select('#panel-one-select').append('option').text(str);
			});
			
			me.curr_pane_one_item = me.pane_one_items[0];
			me.getTitanItem(me.curr_pane_one_item._id, me.net1);
			//$('#panel-one-info').text('Displaying ' + me.pane_one_items.length + ' items');
			me.getTitanPaneTwo();
		} 
	};
	
	me.populateRightGraphs = function(data) {
		data.forEach(function(item){
			if (typeof(item) === 'string'){
				item = JSON.parse(item);
			}
			
			me.pane_two_items.push(item);
			console.log(item);
			var str = '';
			if (item.name === 'target event') {
				str += 'Target Event';
			} else if (item.name === 'alpha report') {
				str += 'Alpha Report';
			}
			
			str += ' ' + item.item_id + ' | ' + item.score.toFixed(2) + '%';
			d3.select('#panel-two-select').append('option').text(str);
		});	
		
		if (me.pane_two_items.length > 0){
			me.getTitanItem(me.pane_two_items[0].item_id, me.net2);
		}
	};
			
	me.getTitanPaneOne = function(){
		d3.selectAll('#panel-one-select option').remove();
		me.net1.svg.select('.node-link-container').remove();
	
		var name = $('#name-one').val();
		
		$('#title-one').text(name);
		me.net1.name = name;
		$.get( titan + 'vertices?name=' + name, me.populateLeftGraphs);
	};
	
	me.getTitanPaneTwo = function(){
		d3.selectAll('#information li').remove();
		d3.selectAll('#panel-two-select option').remove();
		$('#panel-two-info').text('');
		me.pane_two_items = [];
		me.net2.svg.select('.node-link-container').remove();
		
		$.get( titan + 'compare/' + me.curr_pane_one_item._id, me.populateRightGraphs);
	};
	
	me.getTitanItem = function(id, net){
		var nodesById = [];
		var nodes = [];
		var edges = [];
		var edgesById = [];
		
		$.get( titan + id, function(data) {
			data.forEach(function(first){
				buildLinksNodes(first, nodes, edges, nodesById, edgesById);
			});
	
			nodesById = null;
			edgesById = null;
			net.svg.select('.node-link-container').remove();
					
			net.network = new network(net.svg, [], false);
			net.network.setNodes(nodes);
			net.network.setLinks(edges);
			net.network.draw();
		});
	};
	
	me.createListeners = function(){  
		d3.select('#get_pane1').on('click', function(){
			d3.selectAll('#panel-one-select option').remove();
			d3.selectAll('#panel-two-select option').remove();
			me.getTitanPaneOne();
		});

		d3.select('#confirm').on('click', function(){
			var paneOnes = d3.select('#panel-one-select')[0][0];
			var paneTwos = d3.select('#panel-two-select')[0][0];
			var options1 = paneOnes.options[paneOnes.selectedIndex].text;
			var options2 = paneTwos.options[paneTwos.selectedIndex].text.split(' | ');
			var obj1 = getObj(me.pane_one_items, parseInt(options1, 10), '_id');
			var obj2 = getObj(me.pane_two_items, parseInt(options2[0], 10), '_id');

			var percent = options2[1].split('%')[0];
			var send = {
				alpha_report_id: obj1.mongo_ar_id,
				target_event_percentage: percent
				//target_event_id: obj2.mongo_te_id
			};
			
			$.post( url, send, function(r){
				d3.select('.confirm-info')
					.style('opacity', 1)
					.text("Alpha report confirmed with id of " + r._id)
					.transition()
					.duration(5000)
					.style('opacity', 0);
			});
		});
		
		d3.select('#panel-two-select').on('change', function(){
			var elem = $(this)[0];
			var elem_id = elem.options[elem.selectedIndex].text.split(' | ')[0].split(' ')[2];
			me.getTitanItem(elem_id, me.net2);
			
			$('.true').parent().hide();
			$('#' +elem_id).show();
		});
		
		d3.select('#panel-one-select').on('change', function(){
			var elem = $(this)[0];
			var elem_id = elem.options[elem.selectedIndex].text.split(' ')[2];
			me.getTitanItem(elem_id, me.net1);

			me.curr_pane_one_item = getObj(me.pane_one_items, parseInt(elem_id, 10), '_id');
			me.getTitanPaneTwo();
		});
	};
	
	me.display = function(){
		me.getTitanPaneOne();
	};
};
