require.config({
    paths: {
        jquery: 'libs/jquery-2.0.3.min',
        underscore: 'libs/underscore-1.5.2.min',
        d3: 'libs/d3.v3.min.js'
    },

    shim: {
        underscore: {
            exports: '_'
        }
    }
});

require([
        './heatChartApp'
    ],

    function(HeatChartApp) {

        var heatChartApp = new HeatChartApp("year");

    });