require.config({
    paths: {
        jquery: '../../../../lib/jquery-2.0.2.min',
        underscore: '../../../../lib/underscore-min',
        d3: '../../../../lib/d3.v3.min'
    },

    shim: {
        underscore: {
            exports: '_'
        },
        d3: {
            exports: 'd3'
        }
    }
});

require([
    './heatChartApp'
], function(HeatChartApp) {
    var heatChartApp = new HeatChartApp("year");
});