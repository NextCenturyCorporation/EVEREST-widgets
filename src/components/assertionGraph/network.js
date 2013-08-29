// Code based on http://bl.ocks.org/mbostock/2706022
// wimbledon.prcweb.co.uk/davidgoliath.html
// and http://stackoverflow.com/questions/8663844/add-text-label-onto-links-in-d3-force-directed-graph
function midpoint(p1, p2){
	return {
		x: (p1.x + p2.x) / 2,
		y: (p1.y + p2.y) / 2
	};
};

var network = function(svg, data, disjoint){
	var me = this;
	me.svg = svg;
	
	me.nodes = [];
	me.links = [];
	for (var i = 0; i < data.length; i++){
		me.arrays = addNewAssertion(me.nodes, me.links, data[i], disjoint);
		me.nodes = me.arrays[0];
		me.links = me.arrays[1];
	}
	
	me.link = svg.selectAll('.link');
	me.node = svg.selectAll('.node');
	me.color = d3.scale.category10();
	me.linktext;
	
	me.force = d3.layout.force()
		.size([svg.attr('width'), svg.attr('height')])
		.linkDistance(100)
		.charge(-500);
		
	me.draw = function(sender, msg){
		if(msg){
			var arrays = addNewAssertion(me.nodes, me.links, msg, disjoint);
			me.nodes = arrays[0];
			me.links = arrays[1];
		}
		
		me.force
			.nodes(me.nodes)
			.links(me.links)
			.on("tick", me.tick)
			.start();
		
		me.link = me.link.data(me.links);
		me.link.exit().remove();
		
		me.link.enter().insert("path", ":first-child")
			.attr("class", "link")
			.attr('marker-mid', 'url(#Triangle)');
		
		me.node = me.node.data(me.nodes)
		me.node.exit().remove();
		
		var nodeEnter = me.node.enter().append("g")
			.attr("class", "node")
			.on("mouseover", me.mouseover)
			.on("mouseout", me.mouseout)
			.style("fill", function(d){
				return d.color;
			})
			.call(me.force.drag);
				
		me.linktext = me.svg.selectAll(".linklabel").data(me.force.links());
		me.linktext.enter()
			.append("text")
			.attr("class", "linklabel")
			.attr("dx", 1)
			.attr("dy", "1em")
			.attr("text-anchor", "middle")
			.text(function(d) { return d.value; });
		
		nodeEnter.append("circle")
			.attr('class', function(d) { return d.value; })
			.attr("r", 8);
		
		nodeEnter.append("text")
			.attr("x", 12)
			.attr("dy", ".35em")
			.text(function(d) { return d.value; });
		
		//d3.selectAll('circle').each(function(){		changes those in the other graphs too	
		if(!disjoint){
			svg.selectAll('circle').each(function(){
				var c = d3.select(this);
				for (var i = 0; i < me.nodes.length; i++){
					if (c.attr('class') === me.nodes[i].value){
						c.style('fill', function(d){
							return d.color;
						});
					}
				}
			});
		}
	};
	
	me.tick = function(){
		me.link.attr('d', function(d){
			var mid = midpoint(d.source, d.target);
			return 'M'+d.source.x+' '+d.source.y+' L'+mid.x+' '+mid.y+' L'+d.target.x+' '+d.target.y;
		});
		
		me.node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	
		me.linktext.attr("transform", function(d) {
			return "translate(" + (d.source.x + d.target.x) / 2 + "," 
					+ (d.source.y + d.target.y) / 2 + ")"; 
		});
	};
	
	me.mouseover = function(){
		d3.select(this).select("circle").transition()
			.duration(750)
			.attr("r", 16);
	};
	
	me.mouseout = function(){
		d3.select(this).select("circle").transition()
			.duration(750)
			.attr("r", 8);
	};
};