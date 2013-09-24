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
}  
	

var confirmer = function(){
	var me = this;
	var url = 'http://everest-build:8081/';
	me.alpha_reports = [];
	me.target_events = [];
		
	me.width = d3.select('.asserts').style('width').split('p')[0];
	me.height = d3.select('.asserts').style('height').split('p')[0];
	
	me.confirmed = {};
	me.curr_ar_id, me.curr_te_id;
	me.curr_assert_ids = [];
	
	me.svg_target = d3.select('.target-pattern')
		.append('svg')
		.attr('width', me.width)
		.attr('height', me.height);
	
	me.svg_asserts = d3.select('.asserts')
		.append('svg')
		.attr('width', me.width)
		.attr('height', me.height);
			
	me.getAllTitanAlphaReports = function(){
		var start = $('.start-alpha').val();
		var end = $('.end-alpha').val();
		$.ajax({
			type: 'GET',
			url: buildKeyValueQuery('name', 'alpha report', start, end),
			dataType: 'application/json',
			success: function(r){ 
				console.log('success');
			},
			error: function(e){
				console.log('error');
				
				var data = JSON.parse(e.responseText).results;
				if ( data.length > 0 ){
					data.forEach(function(ar){
						d3.select('.alphas').append('option').text(ar._id);
					});
					
					me.alpha_reports = data;

					var ar = me.alpha_reports[0];
					me.getTitanAlphaReport(ar._id);
				}
			}
		});
	};
	
	me.getAllTitanTargetEvents = function(){
		var start = $('.start-target').val();
		var end = $('.end-target').val();
		$.ajax({
			type: 'GET',
			url: buildKeyValueQuery('name', 'target event', start, end),
			dataType: 'application/json',
			success: function(r){ 
				console.log('success');
			},
			error: function(e){
				console.log('error');
				
				var data = JSON.parse(e.responseText).results;
				if ( data.length > 0 ){
					me.target_events = data;
					data.forEach(function(te){
						d3.select('.patterns').append('option').text(te._id);
					});
					
					var te = me.target_events[0];
					me.getTitanTargetEvent(te._id);
				}
			}
		});
	};
	
	me.getTitanAlphaReport = function(ar_id){
		var nodesById = [];
	    var nodes = [];
	    var edges = [];
	    var edgesById = [];
		$.ajax({
			type: 'GET',
			url: getGroupPathById(ar_id),
			dataType: 'application/json',
			success: function(r){ 
				console.log('success');
			},
			error: function(e){
				console.log('error');
				var data = JSON.parse(e.responseText).results;
				
				data.forEach(function(first){
		            buildLinksNodes(first, nodes, edges, nodesById, edgesById);
		        });
		
		        //Try and clean up some
		        nodesById = null;
		        edgesById = null;
				
				me.svg_asserts.remove();
				me.svg_asserts = d3.select('.asserts')
					.append('svg')
					.attr('width', me.width)
					.attr('height', me.height);
				
				me.svg_asserts.append('g')
					.attr('class', 'node-link-container');
						
				var net = new network(me.svg_asserts, [], false);
				net.setNodes(nodes);
				net.setLinks(edges);
				net.draw();		
			}
		});
	
	};
	
	me.getTitanTargetEvent = function(te_id){
		var nodesById = [];
	    var nodes = [];
	    var edges = [];
	    var edgesById = [];
		$.ajax({
			type: 'GET',
			url: getGroupPathById(te_id),
			dataType: 'application/json',
			success: function(r){ 
				console.log('success');
			},
			error: function(e){
				console.log('error');
				var data = JSON.parse(e.responseText).results;
				
				data.forEach(function(first){
		            buildLinksNodes(first, nodes, edges, nodesById, edgesById);
		        });
		
		        //Try and clean up some
		        nodesById = null;
		        edgesById = null;
				
				me.svg_target.remove();
				me.svg_target = d3.select('.target-pattern')
					.append('svg')
					.attr('width', me.width)
					.attr('height', me.height);
				
				me.svg_target.append('g')
					.attr('class', 'node-link-container');
						
				var net = new network(me.svg_target, [], false);
				net.setNodes(nodes);
				net.setLinks(edges);
				net.draw();	
			}
		});
	};

	me.createListeners = function(){
		d3.select('.get_ars').on('click', function(){
			d3.selectAll('.alphas option').remove();
			me.getAllTitanAlphaReports();
		});
		
		d3.select('.get_tes').on('click', function(){
			d3.selectAll('.patterns option').remove();
			me.getAllTitanTargetEvents();
		});
	
		d3.select('.compare').on('click', function(){
			var alphas = d3.select('.alphas')[0][0];
			var targets = d3.select('.patterns')[0][0];
			var ar_id = alphas.options[alphas.selectedIndex].text;
			var te_id = targets.options[targets.selectedIndex].text;
			
			compareVertexAmount(ar_id, te_id);
			compareEdgeAmount(ar_id, te_id);
			compareVertices(ar_id, te_id);
			compareEdges(ar_id, te_id);
			compareOrientation(ar_id, te_id);
		});
		
		d3.select('.patterns').on('change', function(){
			var elem = $(this)[0];
			var elem_id = elem.options[elem.selectedIndex].text;
			me.getTitanTargetEvent(elem_id);
		});
		
		d3.select('.alphas').on('change', function(){
			var elem = $(this)[0];
			var elem_id = elem.options[elem.selectedIndex].text;
			me.getTitanAlphaReport(elem_id);
		});
	};
	
	me.display = function(){
		me.getAllTitanAlphaReports();
		me.getAllTitanTargetEvents();
	};
};