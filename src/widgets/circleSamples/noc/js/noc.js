
var margin = 20,
    diameter = 960;

var color = d3.scale.linear()
    .domain([-1, 5])
    .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
    .interpolate(d3.interpolateHcl);

var pack = d3.layout.pack()
    .padding(2)
    .size([diameter - margin, diameter - margin])
    .value(function(d) { return d.size; });

var svg = d3.select("body").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
  .append("g")
    .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

d3.json("flare.json", function(error, root) {
  if (error) return console.error(error);

  var focus = root,
      nodes = pack.nodes(root),
      view;

  var circle = svg.selectAll("circle")
      .data(nodes)
    .enter().append("circle")
      .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
      .style("fill", function(d) { return d.children ? color(d.depth) : null; })
      .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });

  var text = svg.selectAll("text")
      .data(nodes)
    .enter().append("text")
      .attr("class", "label")
      .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
      .style("display", function(d) { return d.parent === root ? null : "none"; })
      .text(function(d) { return d.name; });

  var node = svg.selectAll("circle,text");

  d3.select("body")
      .style("background", color(-1))
      .on("click", function() { zoom(root); });

  zoomTo([root.x, root.y, root.r * 2 + margin]);

  function zoom(d) {
    //var focus0 = focus;
    var focus = d;

    var transition = d3.transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .tween("zoom", function(d) {
          var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
          return function(t) { zoomTo(i(t)); };
        });

    transition.selectAll("text")
      .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
        .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
        .each("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
        .each("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
  }

  function zoomTo(v) {
    var k = diameter / v[2]; view = v;
    node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
    circle.attr("r", function(d) { return d.r * k; });
  }
});

d3.select(self.frameElement).style("height", diameter + "px");

/*
 * 
var w = 4000,
    h = 2000;
var nodes= [
            {
                value: "jquery",
                label: "jQuery",
                x: "520px", 
                y:"1000px"
            },
            {
                value: "jquery-ui",
                label: "jQuery UI",
                x:"1500px", 
                y:"500px"
            },
            {
                value: "sizzlejs",
                label: "Sizzle JS",
                x:"2000px", 
                y:"700px"
            }
        ];

var force = d3.layout.force();

var zoomFactor = 4, zoom = d3.behavior.zoom();

var vis = d3.select("#mysvg")
    .append("svg:svg")
    .attr("width", "400px")
    .attr("height", "200px")
    .attr("id","svg")
    .attr("pointer-events", "all")
    .attr("viewBox","0 0 "+w+" "+h)
    .attr("perserveAspectRatio","xMinYMid")
    .append('svg:g')
    .call(zoom.on("zoom", redraw))
    .append('svg:g');
function redraw() {
    trans=d3.event.translate;
    scale=d3.event.scale;
    vis.attr("transform",
        "translate(" + trans + ")"
            + " scale(" + scale + ")");
};
var nodeEnter = vis.selectAll("g.node")
    .data(nodes, function(d){return d.value})
    .enter().append("g");
nodeEnter.append("circle")
        .attr("id", function(d){return "circle-node-"+ d.value})
        .attr("fill","white")
        .attr("cx", function(d){return d.x})
        .attr("cy", function(d){return d.y})
        .attr("r","200px")
        .attr("stroke", "black")
        .attr("stroke-width","2px");           
nodeEnter.append("title")
    .text(function(d){return d.label});
$(function() {
    $( "#tags" ).autocomplete({
        source: nodes,
        select: function( event, ui){
            vis.selectAll("#circle-node-"+ui.item.value)
                .transition()
                .attr("fill", "red");
            var transx = (-parseInt(vis.select("#circle-node-"+ui.item.value).attr("cx"))*zoomFactor + w/2),
                transy = (-parseInt(vis.select("#circle-node-"+ui.item.value).attr("cy"))*zoomFactor + h/2);
            vis.transition().attr("transform", "translate(" + transx + "," + transy + ")scale(" + zoomFactor + ")");
            zoom.scale(zoomFactor);
            zoom.translate([transx, transy]);
        }

    })
}); 
            
force
    .nodes(nodes)
    .start()

 * 
 */
