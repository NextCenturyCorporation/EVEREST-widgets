// Code based on http://bl.ocks.org/mbostock/2706022
// and http://stackoverflow.com/questions/8663844/add-text-label-onto-links-in-d3-force-directed-graph
var url = 'http://everest-build:8081/';
var color = d3.scale.category10();
var width = 600,
    height = 600;

var linktext;
var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);

owfdojo.addOnLoad(function() {
	OWF.ready(function() {
		OWF.Eventing.subscribe("com.nextcentury.everest.assertion_announcing.assertions", update);
	});
});

var nodes = [];
var links = [];

var force = d3.layout.force()
	.size([width, height])
	.linkDistance(100)
	.charge(-1000)
	.on("tick", tick);
		
var link = svg.selectAll('.link');
var node = svg.selectAll('.node');

var update = function(sender, msg) {
	//$.getJSON(url + 'assertion/?callback=?', function(data){
	//d3.json('./js/raw_data.json', function(data){
	//var arrays = createArrays(nodes, links, msg, 'disjoint');
	//var arrays = createArrays(nodes, links, msg);
	var arrays = addElement(nodes, links, msg, 'disjoint');
	nodes = arrays[0];
	links = arrays[1];
	console.log(nodes);
	console.log(links);

	force
		.nodes(nodes)
		.links(links)
		.start();
		
	console.log(nodes);
	console.log(links);

	link = link.data(links, function(d) { return d.target.id; });
	link.exit().remove();
	
	link.enter().insert('line', '.node')
		.attr('class', 'link');
		
	node = node.data(nodes, function(d) { return d.id; });
	node.exit().remove();
	
	var nodeEnter = node.enter().append('g')
		.attr('class', 'node')
		.on("mouseover", mouseover)
		.on("mouseout", mouseout)
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

	nodeEnter.append("circle")
		.attr("r", 8);

	nodeEnter.append("text")
		.attr("x", 12)
		.attr("dy", ".35em")
		.text(function(d) { return d.value; });
};

function tick() {
	link
		.attr("x1", function(d) { return d.source.x; })
		.attr("y1", function(d) { return d.source.y; })
		.attr("x2", function(d) { return d.target.x; })
		.attr("y2", function(d) { return d.target.y; });

	node
		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

	linktext.attr("transform", function(d) {
			return "translate(" + (d.source.x + d.target.x) / 2 + "," 
			+ (d.source.y + d.target.y) / 2 + ")"; });
}

function mouseover() {
	d3.select(this).select("circle").transition()
		.duration(750)
		.attr("r", 16);
}

function mouseout() {
	d3.select(this).select("circle").transition()
		.duration(750)
		.attr("r", 8);
}
