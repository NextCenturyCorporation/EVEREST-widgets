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
                    $scope.buildLinksNodes(e, nodes, edges, nodesById, edgesById);
                });
            } else {
                //Check if its a known vertex or not
                if(d._type == 'vertex' && !nodesById[d._id]){
                    nodesById[d._id] = d;
                    nodes.push(d);
                }
            }
        });
        //Loop to check for vertices
        input.forEach(function(d){
            //Skip this loop for arrays
            if(!$.isArray(d)){
                if(d._type == 'edge' && !edgesById[d._id]){
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
        } else if(input._type == 'edge' && !edgesById[input._id]){
            edgesById[input._id] = true;
            //The source and target elements need to be references to the full vertices
            input.source = nodesById[input._outV];
            input.target = nodesById[input._inV];
            edges.push(input);
        }
    }
}; 
	

var confirmer = function(){
	var me = this;
	me.pane_one_items = [];
	me.pane_two_items = [];

	me.width = d3.select('#asserts').style('width').split('p')[0];
	me.height = d3.select('#asserts').style('height').split('p')[0];
	
	me.confirmed = {};
	me.curr_ar_id = null;
	me.curr_te_id = null;
	me.curr_assert_ids = [];
	
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
		
	me.getTitanItemCount = function(name, pane){
		$.ajax({
			type: 'GET',
			url: buildKeyValueCountQuery('name', name),
			dataType: 'application/json',
			success: function(r){ 
				console.log('success');
			},
			error: function(e){
				var data = JSON.parse(e.responseText).results;
				var options;
				if (pane === 1){
					options = d3.selectAll('#panel-one-select option')[0].length;			
					$('#panel-one-info').text('Displaying ' + options + ' of ' + data + ' items');
				} else {
					options = d3.selectAll('#panel-two-select option')[0].length;		
					$('#panel-two-info').text('Displaying ' + options + ' of ' + data + ' items');
				}
			}
		});
	};
			
	me.getAllTitanPaneOne = function(){
		var name = $('#name-one').val();
		var start = $('#start-one').val();
		var end = $('#end-one').val();
		
		$('#title-one').text(name);
		me.net1.name = name;
		$.ajax({
			type: 'GET',
			url: buildKeyValueQuery('name', name, start, end),
			dataType: 'application/json',
			success: function(r){ 
				console.log('success');
			},
			error: function(e){
				d3.selectAll('#information li').remove();				
				me.pane_one_items = JSON.parse(e.responseText).results;
				me.getTitanItemCount(name, 1);
				if ( me.pane_one_items.length > 0 ){
					me.pane_one_items.forEach(function(ar){
						d3.select('#panel-one-select').append('option').text(ar._id);
					});

					var ar = me.pane_one_items[0];
					me.getTitanItem(ar._id, me.net1);
				} else {
					me.net1.svg.select('.node-link-container').remove();
					d3.selectAll('#panel-one-select option').remove();
				}
			}
		});
	};
	
	me.getAllTitanPaneTwo = function(){
		var name = $('#name-two').val();
		var start = $('#start-two').val();
		var end = $('#end-two').val();
		
		$('#title-two').text(name);
		me.net2.name = name;
		$.ajax({
			type: 'GET',
			url: buildKeyValueQuery('name', name, start, end),
			dataType: 'application/json',
			success: function(r){ 
				console.log('success');
			},
			error: function(e){
				d3.selectAll('#information li').remove();
				me.pane_two_items = JSON.parse(e.responseText).results;
				me.getTitanItemCount(name, 2);
				if ( me.pane_two_items.length > 0 ){
					me.pane_two_items.forEach(function(d){
						d3.select('#panel-two-select').append('option').text(d._id);
					});
					
					var item = me.pane_two_items[0];
					me.getTitanItem(item._id, me.net2);
				} else {
					d3.selectAll('#panel-two-select option').remove();
					me.net2.svg.select('.node-link-container').remove();
				}
			}
		});
	};
	
	me.getTitanItem = function(id, net){
		var nodesById = [];
		var nodes = [];
		var edges = [];
		var edgesById = [];		
		$.ajax({
			type: 'GET',
			url: getGroupPathById(id, net.name),
			dataType: 'application/json',
			success: function(r){ 
				console.log('success');
			},
			error: function(e){
				var data = JSON.parse(e.responseText).results;
				
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
			}
		});
	
	};

	me.createListeners = function(){  
		d3.select('#get_pane1').on('click', function(){
			d3.selectAll('#panel-one-select option').remove();
			me.getAllTitanPaneOne();
		});
		
		d3.select('#get_pane2').on('click', function(){
			d3.selectAll('#panel-two-select option').remove();
			me.getAllTitanPaneTwo();
		});
	
		d3.select('#compare').on('click', function(){
			d3.selectAll('#information li').remove();
		
			var alphas = d3.select('#panel-one-select')[0][0];
			var targets = d3.select('#panel-two-select')[0][0];
			var ar_id = alphas.options[alphas.selectedIndex].text;
			var te_id = targets.options[targets.selectedIndex].text;
			
			$.ajax({
				type: 'GET',
				dataType: 'application/json',
				url: getVertexById(ar_id),
				success: function(r){
					console.log('success');
				},
				error: function(e){
					compareVertexAmount(ar_id, te_id);
					compareEdgeAmount(ar_id, te_id);
					compareVertices(ar_id, te_id);
					compareEdges(ar_id, te_id);
					compareOrientation(ar_id, te_id);					
				}
			});
		});
		
		d3.select('#panel-two-select').on('change', function(){
			var elem = $(this)[0];
			var elem_id = elem.options[elem.selectedIndex].text;
			me.getTitanItem(elem_id, me.net2);
		});
		
		d3.select('#panel-one-select').on('change', function(){
			var elem = $(this)[0];
			var elem_id = elem.options[elem.selectedIndex].text;
			me.getTitanItem(elem_id, me.net1);
		});
	};
	
	me.display = function(){
		me.getAllTitanPaneOne();
		me.getAllTitanPaneTwo();
	};
};