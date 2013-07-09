var month_heatChart_widget = {};

month_heatChart_widget.execute = function() {
    var data = [];
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
        'August', 'September', 'October', 'November', 'December'];

    var chart = circularHeatChart()
        .range(["white", "red"])
        .segmentLabels(months)
        .segmentHeight(9)
        .numSegments(12)
        .innerRadius(10);

    for(var i = 0; i < 372; i++){

        var month = i % 12;
        var day = Math.floor((i / 12) % 31);

        data[i] = {title: day + 1 + " of " + months[month], value: Math.random()};
    }

    chart.accessor(function(d) {return d.value});

    d3.select('#monthChart')
        .selectAll('svg')
        .data([data])
        .enter()
        .append('svg')
        .call(chart);

    d3.selectAll("#monthChart path").on('mouseover', function(){
            var d = d3.select(this).data()[0];
            d3.select("#monthInfo").text(d.title + ' has value ' + d.value);
            });

    d3.selectAll("#monthChart svg").on('mouseout', function(){
            var d = d3.select(this).data()[0];
            d3.select("#monthInfo").text('');
            });
}
