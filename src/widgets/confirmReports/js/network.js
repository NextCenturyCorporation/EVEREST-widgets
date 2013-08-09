// Code based on http://bl.ocks.org/mbostock/2706022
// wimbledon.prcweb.co.uk/davidgoliath.html
// and http://stackoverflow.com/questions/8663844/add-text-label-onto-links-in-d3-force-directed-graph
function midpoint(p1, p2){
	return {
		x: (p1.x + p2.x) / 2,
		y: (p1.y + p2.y) / 2
	};
};

var network = function(svg, data, mode){
	var me = this;
	
	var arrays = createArrays(data, mode);
	var nodes = arrays[0];
	var links = arrays[1];
	
	var link, node;
	var color = d3.scale.category10();
	
	me.draw = function(){
		var force = d3.layout.force()
			.nodes(nodes)
			.links(links)
			.size([svg.attr('width'), svg.attr('height')])
			.linkDistance(100)
			.charge(-1000)
			.on("tick", me.tick)
			.start();
		
		link = svg.selectAll(".link")
			.data(links)
			.enter().append("path")
			.attr("class", "link")
			.attr('marker-mid', 'url(#Triangle)');
		
		node = svg.selectAll(".node")
			.data(nodes)
			.enter().append("g")
			.attr("class", "node")
			.on("mouseover", me.mouseover)
			.on("mouseout", me.mouseout)
			.style("fill", function(d) {
				var c = d.group < 0 ? 0 : 1;
				return color(c); 
			})
		.call(force.drag);
		
		linktext = svg.selectAll("g.linklabelholder").data(force.links());
		linktext.enter().append("g").attr("class", "linklabelholder")
			.append("text")
			.attr("class", "linklabel")
			.attr("dx", 1)
			.attr("dy", "1em")
			.attr("text-anchor", "middle")
			.text(function(d) { return d.value});
		
		node.append("circle")
			.attr("r", 8);
		
		node.append("text")
			.attr("x", 12)
			.attr("dy", ".35em")
			.text(function(d) { return d.name; });
	};
	
	me.tick = function(){
		link.attr('d', function(d){
			var mid = midpoint(d.source, d.target);
			return 'M'+d.source.x+' '+d.source.y+' L'+mid.x+' '+mid.y+' L'+d.target.x+' '+d.target.y;
		});
		
		node
			.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	
		linktext.attr("transform", function(d) {
				return "translate(" + (d.source.x + d.target.x) / 2 + "," 
				+ (d.source.y + d.target.y) / 2 + ")"; });
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