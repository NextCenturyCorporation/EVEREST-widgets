// Constants
var MINUTES_PER_HOUR = 60;
var MINUTES_PER_DAY = 1440;
var HOURS_PER_DAY = 24;

var day_heatChart_widget = {};

day_heatChart_widget.execute = function() {
    var raw_data = [MINUTES_PER_DAY];
    
    for (var i = 0; i < MINUTES_PER_DAY; i++){
    	raw_data[i] = 0;
    }
    
    owfdojo.addOnLoad(function(){
    	OWF.ready(function(){
    		OWF.Eventing.subscribe("testChannel1", function(sender, msg){
    			var fields_start = msg.split("[");
    			var fields_end = fields_start[1].split("]");
    			var fields = fields_end[0];
    			var data = fields.split(",");

    			for (var j = 0; j < data.length; j++){
    				var time = new Date(parseInt(data[i]));

    				raw_data[(MINUTES_PER_HOUR * time.getHours()) + time.getMinutes()] += 1;
    			}
    		});
    	});
    });

    var heatChart_chunks = [];
    var hours = ['12am', '1am', '2am', '3am', '4am', '5am', '6am', '7am', '8am',
        '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm',
        '7pm', '8pm', '9pm', '10pm', '11pm'];

    var chart = circularHeatChart()
        .range(["white", "blue"])
        .segmentLabels(hours)
        .segmentHeight(4.7)
        .innerRadius(10);

    for(var k = 0; k < MINUTES_PER_DAY; k++){

        var hour = k % HOURS_PER_DAY;
        var minutes = Math.floor((k / HOURS_PER_DAY) % MINUTES_PER_HOUR);
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

        if(minutes < 10) {
            minutes = "0" + minutes;
        }

        heatChart_chunks[k] = {title: hour + ":" + minutes + " " + meridiem,
            value: raw_data[k]};
    }


    chart.accessor(function(d) {return d.value});

    d3.select('#dayChart')
        .selectAll('svg')
        .data([heatChart_chunks])
        .enter()
        .append('svg')
        .call(chart);

    d3.selectAll("#dayChart path").on('mouseover', function(){
            var d = d3.select(this).data()[0];
            d3.select("#dayInfo").text(d.value + ' raw feed(s) added at  ' + d.title);
            });

    d3.selectAll("#dayChart svg").on('mouseout', function(){
            //var d = d3.select(this).data()[0];
            d3.select("#dayInfo").text('');
            });
};
