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
		var heatChartWidget = new HeatChartWidget();
		var chartData = new HeatChartData();

		var _MODE_ = {};

		var baseDate = chartTime.currentUTCTime();

		var chart = {};

		execute(startingMode);

		function execute(mode) {
			
			updateMode(mode)
			updateModeButtons(mode);
			fetch();

		}

		function fetch() {
			chartData.getAllFeeds(
				'rawfeed',
				function(data) {
					update(data);
				},
				function(error) {
					console.log("An error occurred trying to retrieve the data: " + error);
				});
		}

		function update(data) {
			updateChart(
				chartTime.getTimeChunks(
					baseDate, _MODE_.name, data));
		}

		function updateNow() {
			baseDate = chartTime.currentUTCTime();
			update();
			updateModeButtons(_MODE_.name);
		}

		function updateChart(chunks) {
			d3.select("#chart").selectAll("svg").data([]).exit().remove();
			createHeatChart(chunks);
		}

		function updateMode(newMode) {
			_MODE_ = chartTime.getMode(newMode);
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

			switch (_MODE_.name) {

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
			heatChartWidget.publishDateRange(_MODE_.name, baseDate);

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

			// _MODE_.rows + 1 due to the size of the innerRadius
			var segHeight = chartWidth / (_MODE_.rows + 1);

			var innerRadius;
			segHeight < 10 ? innerRadius = 10 : innerRadius = segHeight;

			chart = new circularHeatChart()
				.range(["white", _MODE_.color])
				.radialLabels(_MODE_.rowLabels)
				.segmentLabels(_MODE_.columnLabels)
				.segmentHeight(segHeight)
				.numSegments(_MODE_.columns)
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

			switch (_MODE_.name) {
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

			heatChartWidget.publishDateRange(_MODE_.name, baseDate);
		};

	};

	return app;

});