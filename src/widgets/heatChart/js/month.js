var data = [];
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
	'August', 'September', 'October', 'November', 'December'];

var chart = circularHeatChart()
	.range(["white", "red"])
	.segmentLabels(months)
	.segmentHeight(11)
	.numSegments(12)
	.innerRadius(10);

for(var i = 0; i < 372; i++) data[i] = Math.random();

d3.select('#monthChart')
	.selectAll('svg')
	.data([data])
	.enter()
	.append('svg')
	.call(chart);
