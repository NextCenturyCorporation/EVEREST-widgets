var TimeRangeWidgetComponent = (function () {


	var widget = function(timeRangeChannel) {

		var timeRangeChannel = timeRangeChannel || "com.nextcentury.everest.timeRange";

		//The Following functions are helper functions designed to get date ranges to send for
		//OWF eventing.
		var setDateHourZero = function(time) {
			var tempTime = new Date(time);
			tempTime.setUTCHours(0);
			return tempTime;
		};

		var setDateHour24 = function(time) {
			var tempTime = new Date(time);
			tempTime.setUTCHours(24);
			return tempTime;
		};

		var addHours = function(time, h) {
			var tempTime = new Date(time);
			tempTime.setTime(tempTime.getTime() + (h * 60 * 60 * 1000));
			return tempTime;
		};

		var toLocaleHours = function(time) {
			var tempDate = new Date(time + " UTC");
			tempDate.setUTCMinutes(0);
			return tempDate;
		};

		var getFirstDateOfYear = function(date) {
			var tempDate = date;
			tempDate = new Date(tempDate.getFullYear(), 0, 1);
			tempDate.setUTCHours(0);
			return tempDate;
		};


		var getLastDateOfYear = function(date) {
			var tempDate = date;
			tempDate = new Date(tempDate.getFullYear(), 11, 31, 24);
			tempDate.setUTCHours(0);
			return tempDate;
		};

		var getFirstDateOfMonth = function(date) {
			var tempDate = date;
			tempDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), 1);
			tempDate.setUTCHours(0);
			return tempDate;
		};

		var getLastDateOfMonth = function(date) {
			var tempDate = date;
			tempDate = new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 0, 24);
			tempDate.setUTCHours(0);
			return tempDate;
		};

			return {
				publishDateRange: function(mode, baseDate) {
					var checkOWF;
					if (OWF.Eventing.publish) {
						checkOWF = OWF.Eventing.publish;
					} else {
						checkOWF = function(message) {
							console.log("OWF Eventing API is not accessible.  The following was not published: ");
						};
					}
					OWF.ready(function () {
						console.log("**************************************");
						console.log(baseDate);
						console.log("**************************************");

						switch (mode) {
							case "hour":
								checkOWF(timeRangeChannel, JSON.stringify({
									startTime: baseDate,
									endTime: addHours(baseDate, 1)
								}));
								break;
							case "day":
								checkOWF(timeRangeChannel, JSON.stringify({
									startTime: setDateHourZero(baseDate),
									endTime: setDateHour24(baseDate)
								}));
								break;
							case "month":
								checkOWF(timeRangeChannel, JSON.stringify({
									startTime: getFirstDateOfMonth(baseDate),
									endTime: getLastDateOfMonth(baseDate)
								}));
								break;
							case "year":
								checkOWF(timeRangeChannel, JSON.stringify({
									startTime: getFirstDateOfYear(baseDate),
									endTime: getLastDateOfYear(baseDate)
								}));
								break;
						};
					});
				}
			};
	};
	return widget;

}());