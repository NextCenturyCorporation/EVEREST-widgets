var data = [];
var hours = ['12am', '1am', '2am', '3am', '4am', '5am', '6am', '7am', '8am',
	'9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm',
	'7pm', '8pm', '9pm', '10pm', '11pm'];

var chart = circularHeatChart()
	.range(["white", "blue"])
	.segmentLabels(hours)
	.segmentHeight(5)
	.innerRadius(10);

for(var i = 0; i < 1440; i++) data[i] = Math.random();

d3.select('#dayChart')
	.selectAll('svg')
	.data([data])
	.enter()
	.append('svg')
	.call(chart);
