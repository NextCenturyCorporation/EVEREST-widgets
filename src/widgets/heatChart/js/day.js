//OWF.relayFile = '/owf/sample/html/js/eventing/rpc_relay.uncompressed.html';
//
//owfdojo.addOnLoad(function(){
//	OWF.ready(init);
//});
//
//function init(){
//	OWF.Eventing.subscribe("testChannel1", this.add);
//}

var data = [];
var hours = ['12am', '1am', '2am', '3am', '4am', '5am', '6am', '7am', '8am',
	'9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm',
	'7pm', '8pm', '9pm', '10pm', '11pm'];

var chart = circularHeatChart()
	.range(["white", "blue"])
	.segmentLabels(hours)
	.segmentHeight(4.7)
	.innerRadius(10);

/* 
 * adds 'width' zeros to the left of the number. Useful for time
 * (ex. 12:1pm vs 12:01pm)
 */
function padZero(number, width) {
	width -= number.toString().length;

	if(width > 0) {
		return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
	}

	return number + "";
}

for(var i = 0; i < 1440; i++){

	var hour = i % 24;
	var minutes = padZero(Math.floor((i / 24) % 60), 2);
	var meridiem = "am";

	if(hour === 0) {
		hour = 12;
	}
	else if(hour === 12){
		meridiem = "pm";
	}
	else if(hour > 12){
		hour = hour - 12;
		meridiem = "pm";
	}

	data[i] = {title: hour + ":" + minutes + " " + meridiem,
		value: Math.random()};
}


chart.accessor(function(d) {return d.value});

d3.select('#dayChart')
	.selectAll('svg')
	.data([data])
	.enter()
	.append('svg')
	.call(chart);

d3.selectAll("#dayChart path").on('mouseover', function(){
	var d = d3.select(this).data()[0];
	d3.select("#dayInfo").text(d.title + ' has value ' + d.value);
});

d3.selectAll("#dayChart svg").on('mouseout', function(){
	var d = d3.select(this).data()[0];
	d3.select("#dayInfo").text('');
});

