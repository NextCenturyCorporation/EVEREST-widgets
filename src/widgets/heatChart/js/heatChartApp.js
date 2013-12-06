define([

	'jquery',
	'underscore',
	'd3',
	'base/js/circularHeatChart',
	'js/heatChartTime',
	'js/heatChartWidget',
	'js/heatChartData'

], function($, _, d3, circularHeatChart, HeatChartTime, HeatChartWidget, HeatChartData) {

	var app = function(startingMode) {

		$('#nowButton').click(function() {
			updateNow();
		});

		$('#hourButton').click(function() {
			execute("hour");
		});
		$('#dayButton').click(function() {
			execute("day");
		});
		$('#weekButton').click(function() {
			execute("week");
		});
		$('#monthButton').click(function() {
			execute("month");
		});
		$('#yearButton').click(function() {
			execute("year");
		});
		$('#year5Button').click(function() {
			execute("year5");
		});

		var chartTime = new HeatChartTime();
		var chartWidget = new HeatChartWidget();
		var chartData = new HeatChartData();

		var CHART_MODE = {};

		var baseDate = chartTime.currentUTCTime();

		var chart = {};

		execute(startingMode);

		function execute(mode) {
			updateMode(mode)
			updateModeButtons(mode);
			fetch();
		}

		function fetch() {
			chartData.fetch({
				feedType: 'rawfeed',
				successCallback: function(data) {
					update(data);
				},
				errorCallback: function(error) {
					console.log("An error occurred trying to retrieve the data: " + error);
				}
			});
		}

		function update(data) {
			var chunks = chartTime.getTimeChunks(baseDate, CHART_MODE.name, data);
			d3.select("#chart").selectAll("svg").data([]).exit().remove();

			createHeatChart(chunks);
		}

		function updateNow() {
			baseDate = chartTime.currentUTCTime();
			update();
			updateModeButtons(CHART_MODE.name);
		}

		function updateMode(newMode) {
			CHART_MODE = chartTime.getMode(newMode);
		}

		function updateModeButtons() {

			var baseYear = baseDate.getFullYear();
			var baseMonth = baseDate.getMonth();
			var baseDay = baseDate.getDate();
			var baseDayOfWeek = baseDate.getDay();
			var baseHour = baseDate.getHours();

			d3.select("#hourButton").text('Hour');
			d3.select("#dayButton").text('Day');
			d3.select("#weekButton").text('Week');
			d3.select("#monthButton").text('Month');
			d3.select("#yearButton").text('Year');
			d3.select("#year5Button").text('5-Year');

			var monthLabel = chartTime.getMonthLabel(baseMonth);

			var dayOfWeekLabel = chartTime.getDayOfWeekLabel(baseDayOfWeek);

			var dayLabel = baseDay;
			if (dayLabel < 10) {
				dayLabel = '0' + dayLabel;
			}

			var hourLabel = baseHour;
			if (hourLabel < 10) {
				hourLabel = '0' + hourLabel + '00';
			} else {
				hourLabel = hourLabel + '00';
			}

			switch (CHART_MODE.name) {

				case "hour":
					d3.select("#yearButton").text(baseYear);
					d3.select("#monthButton").text(monthLabel);
					d3.select("#weekButton").text(dayOfWeekLabel);
					d3.select("#dayButton").text(dayLabel);
					d3.select("#hourButton").text(hourLabel);
					break;

				case "day":
					d3.select("#yearButton").text(baseYear);
					d3.select("#monthButton").text(monthLabel);
					d3.select("#weekButton").text(dayOfWeekLabel);
					d3.select("#dayButton").text(dayLabel);
					break;

				case "week":
					d3.select("#yearButton").text(baseYear);
					d3.select("#monthButton").text(monthLabel);
					d3.select("#weekButton").text(dayOfWeekLabel);
					break;

				case "month":
					d3.select("#yearButton").text(baseYear);
					d3.select("#monthButton").text(monthLabel);
					break;

				case "year":
					d3.select("#yearButton").text(baseYear);
					break;

				case "year5":
					d3.select("#yearButton").text(baseYear);
					break;

			};

			d3.select("#baseDate").text("Context Date: " + baseDate.toString());
			chartWidget.publishDateRange(CHART_MODE.name, baseDate);

		};

		function createHeatChart(time_chunks) {
			var me = this;

			var chartWidth = 300;
			try {
				var cw = d3.select("#chart").style('width');
				chartWidth = cw.split('px')[0];
			} catch (err) {
				console.log(err);
			}

			// CHART_MODE.rows + 1 due to the size of the innerRadius
			var segHeight = chartWidth / (CHART_MODE.rows + 1);

			var innerRadius;
			segHeight < 10 ? innerRadius = 10 : innerRadius = segHeight;

			chart = new circularHeatChart()
				.range(["white", CHART_MODE.color])
				.radialLabels(CHART_MODE.rowLabels)
				.segmentLabels(CHART_MODE.columnLabels)
				.segmentHeight(segHeight)
				.numSegments(CHART_MODE.columns)
				.innerRadius(innerRadius);

			chart.accessor(function(d) {
				return d.value;
			});

			d3.select("#chart")
				.selectAll('svg')
				.data([time_chunks])
				.enter()
				.append('svg')
				.call(chart);

			var tooltip = d3.select("body")
				.append("div")
				.style("position", "absolute")
				.style("z-index", "10")
				.style("visibility", "hidden")
				.text("a simple tooltip");

			d3.selectAll("#chart path")
				.on('mouseover', function() {
					var d = d3.select(this).data()[0];
					if (0 !== d.value) {
						return tooltip.style("visibility", "visible").text(d.value + ' added at  ' + d.title);
					}
				})
				.on("mousemove", function() {
					return tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
				})
				.on("mouseout", function() {
					return tooltip.style("visibility", "hidden");
				});

			d3.selectAll("#chart svg").on('mouseout', function() {
				//var d = d3.select(this).data()[0];
				d3.select("#info").text('');
			});

			d3.selectAll("#chart path").on('click', function() {
				var d = d3.select(this).data()[0];
				if (0 !== d.value) {
					handleDrillDown(d.title);
				}
			});

		};

		function handleDrillDown(cellDate) {
			baseDate = new Date(cellDate);

			switch (CHART_MODE.name) {
				//Announce Channel: com.nextcentury.everest.heatchart
				//Each time the heat chart is drilled down, announce the new date range
				//that appears in the chart.
				case "hour":
					break;

				case "day":
					execute("hour");
					break;

				case "week":
					execute("day");
					break;

				case "month":
					execute("day");
					break;

				case "year":
					execute("month");
					break;

				case "year5":
					execute("year");
					break;
			};

			chartWidget.publishDateRange(CHART_MODE.name, baseDate);
		};

	};

	return app;

});