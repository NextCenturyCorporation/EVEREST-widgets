define([

	'underscore'

], function(_) {

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
				color: 'cyan',
				rows: 60,
				columns: 60,
				rowLabels: [],
				columnLabels: []
			},
			day: {
				color: 'blue',
				rows: 60,
				columns: 24,
				rowLabels: [],
				columnLabels: (_HOUR_LABELS)
			},
			week: {
				color: 'lime',
				rows: 24,
				columns: 7,
				rowLabels: [],
				columnLabels: (_DAYS_LONG)
			},
			month: {
				color: 'red',
				rows: 24,
				columns: 31,
				rowLabels: [],
				columnLabels: (_DAY_LABELS)
			},
			year: {
				color: 'orange',
				rows: 31,
				columns: 12,
				rowLabels: (_SEVEN_DAY_LABELS),
				columnLabels: (_MONTHS_LONG)
			},
			year5: {
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

				// This will map the number of raw feeds for a specific date to the correct heat chart "chunk"

				if (timeList !== null) {

					var time, year, month, day, dayofweek, hour, minutes, seconds;

					// baseDate is a global date used as a benchmark for focusing the display
					var baseYear = baseDate.getFullYear();
					var baseMonth = baseDate.getMonth();
					var baseDay = baseDate.getDate();
					var baseDayofweek = baseDate.getDay();
					var baseHour = baseDate.getHours();
					var wsd = baseDay - baseDayofweek;
					var weekStartDate = new Date(baseDate);
					weekStartDate.setDate(wsd);
					weekStartDate.setHours(0);
					weekStartDate.setMinutes(0);
					weekStartDate.setSeconds(0);
					weekStartDate.setMilliseconds(0);

					var wend = baseDay + (6 - baseDayofweek);
					var weekEndDate = new Date(baseYear, baseMonth, wend, 23, 59, 59, 999);

					var year5StartDate = new Date((baseYear - 2), 0, 1, 0, 0, 0, 0);
					var year5EndDate = new Date((baseYear + 2), 11, 31, 23, 59, 59, 999);
					var year5StartYear = year5StartDate.getFullYear();


					for (var j = 0; j < timeList.length; j++) {
						time = new Date(parseInt(timeList[j]));
						year = time.getFullYear();
						month = time.getMonth();
						day = time.getDate();
						dayofweek = time.getDay();
						hour = time.getUTCHours();
						minutes = time.getMinutes();
						seconds = time.getSeconds();

						switch (mode) {

							case "hour":
								if ((baseYear === year) & (baseMonth === month) & (baseDay === day) & (baseHour === hour)) {
									var ndx = minutes + (_mode.columns * seconds);
									rawData[ndx] += 1;
									title[ndx] = time.toString();
								}
								break;

							case "day":
								if ((baseYear === year) & (baseMonth === month) & (baseDay === day)) {
									var ndx = hour + (_mode.columns * minutes);
									rawData[ndx] += 1;
									title[ndx] = (new Date(year, month, day, hour, minutes, 0, 0)).toString();
								}
								break;

							case "week":
								if ((time > weekStartDate) & (time <= weekEndDate)) {
									var ndx = dayofweek + (_mode.columns * hour);
									rawData[ndx] += 1;
									title[ndx] = (new Date(year, month, day, hour, 0, 0, 0)).toString();
								}
								break;

							case "month":
								if ((baseYear === year) & (baseMonth === month)) {
									var ndx = (day - 1) + (_mode.columns * hour);
									rawData[ndx] += 1;
									title[ndx] = (new Date(year, month, day, hour, 0, 0, 0)).toString();
								}
								break;

							case "year":
								if ((baseYear === year)) {
									var ndx = month + (_mode.columns * (day - 1));
									rawData[ndx] += 1;
									title[ndx] = (new Date(year, month, day, 0, 0, 0, 0)).toString();
								}
								break;

							case "year5":
								if ((time >= year5StartDate) & (time <= year5EndDate)) {
									var ndx = (year - year5StartYear) + (_mode.columns * month);
									rawData[ndx] += 1;
									title[ndx] = (new Date(year, month, 1, 0, 0, 0, 0)).toString();
								}
								break;

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
});