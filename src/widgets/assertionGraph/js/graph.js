// Code based on http://bl.ocks.org/mbostock/2706022
// and http://stackoverflow.com/questions/8663844/add-text-label-onto-links-in-d3-force-directed-graph


// Sample data, in the future, we will handle this with a seperate json file
var nodes = [
	{name: "dog", group: 0},
	{name: "cat", group: 1},
	{name: "Sally", group: 0},
	{name: "Sam", group: 1},
	{name: "Samsung", group:0},
	{name: "Apple", group: 1},
	{name: "Antartica", group:0},
	{name: "snow", group: 1}
];

var links = [
	{source: 0, target: 1, value: "chased"},
	{source: 2, target: 3, value: "saw"},
	{source: 4, target: 5, value: "sued"},
	{source: 6, target: 7, value: "has"}
];

var width = 960,
	height = 500;

var color = d3.scale.category10();

var force = d3.layout.force()
	.nodes(nodes)
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
	.data(links)
	.enter().append("line")
	.attr("class", "link");

var node = svg.selectAll(".node")
	.data(nodes)
	.enter().append("g")
	.attr("class", "node")
	.on("mouseover", mouseover)
	.on("mouseout", mouseout)
	.style("fill", function(d) {return color(d.group); })
	.call(force.drag);

var linktext = svg.selectAll("g.linklabelholder").data(force.links());
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
