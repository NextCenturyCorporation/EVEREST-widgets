// Set up area for the legend to be drawn
var svgWidth = 260,
    svgHeight = 40,
    x1 = 200,
    barWidth = 100,
    y1 = 0,
    barHeight = 20,
    numberHues = 35;

var idGradient = "legendGradient";

var svgForLegendStuff = d3.select("#theBar").append("svg")
.attr("width", svgWidth)
.attr("height", svgHeight);

legend = {};

legend.execute = function(hueStart, hueEnd, saturation) {

	//create the empty gradient that we're going to populate later
	svgForLegendStuff.append("g")
		.append("defs")
		.append("linearGradient")
		.attr("id",idGradient)
		.attr("x1","0%")
		.attr("x2","100%")
		.attr("y1","0%")
		.attr("y2","0%"); // x1=0, x2=100%, y1=y2 results in a horizontal gradient
	// it would have been vertical if x1=x2, y1=0, y2=100%
	// See 
	//      http://www.w3.org/TR/SVG/pservers.html#LinearGradients
	// for more details and fancier things you can do
	//create the bar for the legend to go into
	// the "fill" attribute hooks the gradient up to this rect
	svgForLegendStuff.append("rect")
		.attr("fill","url(#" + idGradient + ")")
		.attr("x",x1)
		.attr("y",y1)
		.attr("width",barWidth)
		//.attr("rx",20)  //rounded corners, of course!
		//.attr("ry",20)
		.attr("height",barHeight);

	//add text on either side of the bar

	var textY = y1 + barHeight/2 + 15;
	svgForLegendStuff.append("text")
		.attr("class","legendText")
		.attr("text-anchor", "middle")
		.attr("x",x1 - 25)
		.attr("y",textY)
		.attr("dy",0)
		.text("Min");

	svgForLegendStuff.append("text")
		.attr("class","legendText")
		.attr("text-anchor", "left")
		.attr("x",x1 + barWidth + 15)
		.attr("y",textY)
		.attr("dy",0)
		.text("Max");


	//we go from a somewhat transparent blue/green (hue = 160º, opacity = 0.3) to a fully opaque reddish (hue = 0º, opacity = 1)
	//var hueStart = 125, hueEnd = 125;
	var opacityStart = 0, opacityEnd = 1.0;
	var theHue, rgbString, opacity,p;

	var deltaPercent = 1/(numberHues-1);
	var deltaHue = (hueEnd - hueStart)/(numberHues - 1);
	var deltaOpacity = (opacityEnd - opacityStart)/(numberHues - 1);

	//kind of out of order, but set up the data here 
	var theData = [];
	for (var i=0;i < numberHues;i++) {
		theHue = hueStart + deltaHue*i;
		//the second parameter, set to 1 here, is the saturation
		// the third parameter is "lightness"    
		rgbString = d3.hsl(theHue,saturation,0.5).toString();
		opacity = opacityStart + deltaOpacity*i;
		p = 0 + deltaPercent*i;
		//onsole.log("i, values: " + i + ", " + rgbString + ", " + opacity + ", " + p);
		theData.push({"rgb":rgbString, "opacity":opacity, "percent":p});       
	}

	//now the d3 magic (imo) ...
	var stops = d3.select('#' + idGradient).selectAll('stop')
		.data(theData);

	stops.enter().append('stop');
	stops.attr('offset',function(d) {
			return d.percent;
			})
	.attr('stop-color',function(d) {
			return d.rgb;
			})
	.attr('stop-opacity',function(d) {
			return d.opacity;
			});
};
