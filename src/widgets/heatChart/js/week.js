var week_heatChart_widget = {};

week_heatChart_widget.execute = function() {
    var data = [];
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',
        'Saturday'];

    var chart = circularHeatChart()
        .range(["white", "green"])
        .segmentLabels(days)
        .segmentHeight(12)
        .innerRadius(10)
        .numSegments(7);

    for(var i = 0; i < 168; i++){

        var day = i % 7;
        var hour = Math.floor((i / 7) % 24);
        var meridiem = "am";

        if(hour === 0) {
            hour = 12;
        }
        else if(hour === 12) {
            meridiem = "pm";
        }
        else if(hour > 12) {
            hour = hour - 12;
            meridiem = "pm";
        }

        data[i] = {title: days[day] + ", " + hour + " " + meridiem,
            value: Math.random()};
    }

    chart.accessor(function(d) {return d.value});

    d3.select('#weekChart')
        .selectAll('svg')
        .data([data])
        .enter()
        .append('svg')
        .call(chart);

    d3.selectAll("#weekChart path").on('mouseover', function(){
            var d = d3.select(this).data()[0];
            d3.select("#weekInfo").text(d.title + ' has value ' + d.value);
            });

    d3.selectAll("#weekChart svg").on('mouseout', function(){
            var d = d3.select(this).data()[0];
            d3.select("#weekInfo").text('');
            });

}
