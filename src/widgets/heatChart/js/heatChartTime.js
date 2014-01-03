var HeatChartTime = (function () {

	function currentUTCTime() {
		var now = new Date(Date.now());
		return new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
	}

	var time = function() {

		var _MONTHS_SHORT = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],

			_MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],

			_DAYS_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],

			_DAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

			_SEVEN_DAY_LABELS = ["", "", "", "", "", "", "7",
				"", "", "", "", "", "", "14",
				"", "", "", "", "", "", "21",
				"", "", "", "", "", "", "28", "", "", ""
			],

			_HOUR_LABELS = ["0000", "0100", "0200", "0300",
				"0400", "0500", "0600", "0700",
				"0800", "0900", "1000", "1100",
				"1200", "1300", "1400", "1500",
				"1600", "1700", "1800", "1900",
				"2000", "2100", "2200", "2300"
			],

			_DAY_LABELS = ["01", "02", "03", "04", "05", "06",
				"07", "08", "09", "10", "11", "12",
				"13", "14", "15", "16", "17", "18",
				"19", "20", "21", "22", "23", "24",
				"25", "26", "27", "28", "29", "30", "31"
			];

		var _MODES = {
			hour: {
				name: 'hour',
				color: 'cyan',
				rows: 60,
				columns: 60,
				rowLabels: [],
				columnLabels: (function(_) {
					return _.map(_.range(0, 60), function(num) {
						if (num < 10) {
							return '0' + num + 'm';
						} else {
							return '' + num + 'm';
						}
					});
				})(_)
			},
			day: {
				name: 'day',
				color: 'blue',
				rows: 60,
				columns: 24,
				rowLabels: [],
				columnLabels: (_HOUR_LABELS)
			},
			week: {
				name: 'week',
				color: 'lime',
				rows: 24,
				columns: 7,
				rowLabels: [],
				columnLabels: (_DAYS_LONG)
			},
			month: {
				name: 'month',
				color: 'red',
				rows: 24,
				columns: 31,
				rowLabels: [],
				columnLabels: (_DAY_LABELS)
			},
			year: {
				name: 'year',
				color: 'orange',
				rows: 31,
				columns: 12,
				rowLabels: (_SEVEN_DAY_LABELS),
				columnLabels: (_MONTHS_LONG)
			},
			year5: {
				name: 'year5',
				color: 'magenta',
				rows: 12,
				columns: 5,
				rowLabels: _MONTHS_SHORT,
				columnLabels: (function() {
					var baseYear = currentUTCTime().getFullYear(),
						labels = [];

					labels.push(baseYear - 2);
					labels.push(baseYear - 1);
					labels.push(baseYear);
					labels.push(baseYear + 1);
					labels.push(baseYear + 2);

					return labels;

				})()
			}
		};

		return {

			currentUTCTime: currentUTCTime,

			getMonthLabel: function(month) {
				return _MONTHS_SHORT[month];
			},

			getDayOfWeekLabel: function(day) {
				return _DAYS_SHORT[day];
			},

			getMode: function(mode) {
				return _MODES[mode] || _MODES['month'];
			},

			filterDownDates: function(dates, start, end) {
				return dates.filter(function(element) {
					return element >= Date.parse(start) && element <= Date.parse(end);
				});
			},

			getRowAndColumnLabels: function(mode) {
				var modeParams = this.getMode(mode);

				return {
					rowLabels: modeParams.rowLabels,
					columnLabels: modeParams.columnLabels
				};
			},

			getEmptyTimeChunks: function(numRows, numCols) {
				var numPoints = numCols * numRows,
					time_chunks = [];

				for (var k = 0; k < numPoints; k++) {
					var col = k % numCols;
					var row = (Math.floor(k / numCols)) % numRows;
					if (col < 10) {
						col = "0" + col;
					}
					if (row < 10) {
						row = "0" + row;
					}
					time_chunks[k] = {
						title: col + ":" + row,
						value: 0
					};
				}
				return time_chunks;
			},

			/**
			 * Given a chart mode and a date that will appear on the chart, this computes what the first and last dates
			 * will be on the chart.  E.g. If the base date is sometime in Jan 17, 2014 in a chart displaying the month, the
			 * ends of the chart will be Jan 1 and Jan 31, 2014.
			 * @param baseDate {Date} a date that must appear in the chart
			 * @param mode {string} the scope of the chart (e.g. year, month, hour)
			 * @return an array of two Date objects, the start and the end of the chart
			 */
			getChartEnds: function(baseDate, mode) {
				baseDate = new Date(baseDate); // Just in case baseDate was in number format
				var startOfChart = new Date(baseDate);
				var endOfChart = new Date(baseDate);

				switch (mode) {

					case "hour":
						startOfChart.setMinutes(0,0,0);
						endOfChart.setMinutes(59, 59, 999);
						break;
					case "day":
						startOfChart.setHours(0,0,0,0);
						endOfChart.setHours(23, 59, 59, 999);
						break;
					case "week":
						startOfChart.setDate(baseDate.getDate()-baseDate.getDay());
						startOfChart.setHours(0,0,0,0);
						endOfChart.setDate(startOfChart.getDate()+6);
						endOfChart.setHours(23, 59, 59, 999);
						break;
					case "month":
						startOfChart.setDate(1);
						startOfChart.setHours(0,0,0,0);
						endOfChart.setMonth(startOfChart.getMonth()+1,0);
						endOfChart.setMinutes(23, 59, 59, 999);
						break;
					case "year":
						startOfChart.setMonth(0, 1);
						startOfChart.setHours(0,0,0,0);
						endOfChart.setMonth(11,31);
						endOfChart.setMinutes(23, 59, 59, 999);
						break;
					case "year5":
						startOfChart.setYear(baseDate.getFullYear()-2, 0, 1);
						startOfChart.setHours(0,0,0,0);
						endOfChart.setYear(startOfChart.getFullYear()+4, 11,31);
						endOfChart.setMinutes(23, 59, 59, 999);
						break;
				}

				return [startOfChart, endOfChart];
			},

			getTimeChunks: function(baseDate, mode, timeList) {
				var _mode = this.getMode(mode);

				var numPoints = _mode.columns * _mode.rows;
				var timeChunks = [];
				var rawData = [numPoints];
				var title = [numPoints];

				for (var i = 0; i < numPoints; i++) {
					rawData[i] = 0;
					title[i] = "";
				}

				var chartEnds = this.getChartEnds(baseDate, mode);

				// This will map the number of raw feeds for a specific date to the correct heat chart "chunk"

				if (timeList) {


					var time, timeTitle, year, month, day, hour, minutes;

					for (var j = 0; j < timeList.length; j++) {
						// Time may either be a raw number or an object with the time stored in the 'startTime' attribute.
						// Figure out which case, pull out the number, and turn it into a date
						if (isNaN(parseInt(timeList[j])) && (!isNaN(parseInt(timeList[j].startTime)))) {
							time = new Date(parseInt(timeList[j].startTime));
							count = parseInt(timeList[j].count);
						}
						else {
							time = new Date(parseInt(timeList[j]));
							count = 1;
						}

						year = time.getFullYear();
						month = time.getMonth();
						day = time.getDate();
						hour = time.getUTCHours();
						minutes = time.getMinutes();

						if ((time >= chartEnds[0]) && (time <= chartEnds[1])) {

							switch (mode) {

								case "hour":
									var ndx = minutes + (_mode.columns * time.getSeconds());
									timeTitle = time.toString();
									break;
								case "day":
									var ndx = hour + (_mode.columns * minutes);
									timeTitle = (new Date(year, month, day, hour, minutes, 0, 0)).toString();
									break;

								case "week":
									var ndx = time.getDay() + (_mode.columns * hour);
									timeTitle = (new Date(year, month, day, hour, 0, 0, 0)).toString();
									break;

								case "month":
									var ndx = (day - 1) + (_mode.columns * hour);
									timeTitle = (new Date(year, month, day, hour, 0, 0, 0)).toString();
									break;

								case "year":
									var ndx = month + (_mode.columns * (day - 1));
									timeTitle = (new Date(year, month, day, 0, 0, 0, 0)).toString();
									break;

								case "year5":
									var ndx = (year - chartEnds[0].getFullYear()) + (_mode.columns * month);
									timeTitle = (new Date(year, month, 1, 0, 0, 0, 0)).toString();
									break;

							}

							rawData[ndx] += count;
							title[ndx] = timeTitle;

						}
					}
				}

				for (var k = 0; k < numPoints; k++) {
					timeChunks[k] = {
						title: title[k],
						value: rawData[k]
					};
				}

				return timeChunks;
			},

			getRandomSamples: function(numSamplePoints) {
				var sample_list = [];
				var thirties = [3, 5, 8, 10]; // Jan = 0, Dec = 11

				var curYear = new Date(Date.now()).getFullYear();

				for (var sl = 0; sl < numSamplePoints; sl++) {
					var month = Math.floor((Math.random() * 12)); // 0 - 11 for months in Date
					var day;
					if (1 === month) { // month 1 = February
						day = Math.floor((Math.random() * 28) + 1);
					} else if (_.contains(thirties, month)) {
						day = Math.floor((Math.random() * 30)) + 1;
					} else {
						day = Math.floor((Math.random() * 31)) + 1;
					}
					var hour = Math.floor((Math.random() * 24)); // 0 - 23
					var minute = Math.floor((Math.random() * 60)); // 0 - 59
					var second = Math.floor((Math.random() * 60)); // 0 - 59
					var year = (curYear - 2) + Math.floor((Math.random() * 5));

					var d = new Date(year, month, day, hour, minute, second, 0);
					sample_list[sl] = d.getTime(); //d.toISOString();
				}

				return sample_list;
			}

		};
	};

	return time;
}());