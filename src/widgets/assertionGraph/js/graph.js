// Code based on http://bl.ocks.org/mbostock/2706022
// and http://stackoverflow.com/questions/8663844/add-text-label-onto-links-in-d3-force-directed-graph


// Sample data, in the future, we will handle this with a seperate json file
var links = [
{source: "dog", target: "cat", name: "chased"},
{source: "Sally", target: "Sam", name: "saw"},
{source: "Samsung", target: "Apple", name: "sued"},
{source: "Antartica", target: "snow", name: "has"},
];

var nodes = {};

// Compute the distinct nodes from the links.
links.forEach(function(link) {
	link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
	link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
});

var width = 960
var height = 500;

var force = d3.layout.force()
	.nodes(d3.values(nodes))
	.links(links)
	.size([width, height])
	.linkDistance(200)
	.charge(-1000)
	.on("tick", tick)
	.start();

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);

var link = svg.selectAll(".link")
	.data(force.links())
	.enter().append("line")
	.attr("class", "link");

var node = svg.selectAll(".node")
	.data(force.nodes())
	.enter().append("g")
	.attr("class", "node")
	.on("mouseover", mouseover)
	.on("mouseout", mouseout)
	.call(force.drag);

var linktext = svg.selectAll("g.linklabelholder").data(force.links());
	linktext.enter().append("g").attr("class", "linklabelholder")
	.append("text")
	.attr("class", "linklabel")
	.attr("dx", 1)
	.attr("dy", "1em")
	.attr("text-anchor", "middle")
	.text(function(d) { return d.name });

	node.append("circle")
	.attr("r", 8);

	node.append("text")
	.attr("x", 12)
	.attr("dy", ".35em")
	.text(function(d) { return d.name; });



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

