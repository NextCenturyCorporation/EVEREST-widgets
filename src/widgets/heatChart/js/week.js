var data = [];
var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',
	'Saturday'];

var chart = circularHeatChart()
	.range(["white", "green"])
	.segmentLabels(days)
	.segmentHeight(13)
	.innerRadius(10)
	.numSegments(7);

for(var i = 0; i < 168; i++) data[i] = Math.random();

d3.select('#weekChart')
	.selectAll('svg')
	.data([data])
	.enter()
	.append('svg')
	.call(chart);
