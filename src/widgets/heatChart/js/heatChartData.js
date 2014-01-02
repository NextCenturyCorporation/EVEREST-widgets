
var HeatChartData = (function () {

	var _config = {};

	var _time;

	/**
	 * Constructs a data source for which data can be retrieved
	 * 
	 */
	var data = function(config, time) {

		_config = config || HeatChartConfig.get();

		_time = time;

		/**
		 * We've got a sorted set of data from the server.  Restrict it to a specific range.
		 * Note, for data points that have a start time and and end time, this restricts based on 
		 * start time.
		 * @param data a set containing both straight numbers (milliseconds) and objects of the form:
		 *	{
				startTime: {integer} millisecond timestamp of the earliest data point in the aggregation
				endTime: {integer} millisecond timestamp of the latest data point in the aggregation
				count: {integer} the number of data points in the aggregation
		 *	}
		 * @param startTime optional time before which all data points should be dropped
		 * @param endTime optional time after which all data points should be dropped
		 */
		var restrictRange = function(data, startTime, endTime) {

			// Find the part of the dataset that is after the desired start time
			var startIndex = -1;
			if (typeof startTime == 'number') {
				// Note: A binary search may be quicker
				var index = 0;
				while ((startIndex < 0) && (index < data.length)) {
					var nextTime = typeof data[index] == 'number' ? data[index] : data[index].startTime;
					if (nextTime >= startTime) {
						startIndex = index;
					}
					else {
						++index;
					}
				} 
				if (index == data.length) {
					// All the data occurs before the start time.
					startIndex = data.length;
				}
			}
			else {
				startIndex = 0;
			}

			// Find the part of the desired data set that is before the desired end time
			var endIndex = -1;
			if (typeof endTime == 'number') {
				// Note: A binary search may be quicker
				var index = data.length-1;
				while ((endIndex < 0) && (index >= startIndex)) {
					var nextTime = typeof data[index] == 'number' ? data[index] : data[index].startTime;
					if (nextTime <= endTime) {
						endIndex = index;
					}
					else {
						--index;
					}
				} 
				if (index < startIndex) {
					// All the data occurs after the end time.
					endIndex = startIndex-1;
				}
			}
			else {
				endIndex = data.length;
			}

			// Now truncate the array to just be the desired range.
			if ((startIndex > 0) || (endIndex < data.length-1)) {
				if (endIndex < startIndex) {
					data = [];
				}
				else {
					data = data.slice(startIndex, endIndex+1);
				}
			}

			return data;
		}

		return {

			/**
			 * Retrieve the desired data set from the server.
			 * @param options {map} set of modifiers to affect this fetch.  Possible options are:
			 *	feedType - (e.g. alpha-report, assertion, or rawfeed)
			 *	successCallback - the callback to use to pass data from a succesful fetch back to the caller.  The first argument
			 * 		is the data passed as an array which may contain a mix of integers (which are millisecond timestamps) or an aggregation of multiple points
			 * 		represented as objects of the form:
			 *   	{
			 *			startTime: {integer} millisecond timestamp of the earliest data point in the aggregation
			 *			endTime: {integer} millisecond timestamp of the latest data point in the aggregation
			 *			count: {integer} the number of data points in the aggregation
			 *   	}
			 *	errorCallback - the callback to use to indicate an unsuccesful fetch.  The first argument is a string describing the error encountered.
			 *	startTime - for limiting the range of the data set, if specified, no data occurring before this time should be returned.
			 *		specified as milliseconds.
			 *	endTime - for limiting the range of the data set, if specified, no data occurring after this time should be returned.
			 *		specified as milliseconds.
			 */
			fetch: function(options) {

				var url = _config.baseUrl;

				if (options.feedType.toLowerCase() === 'alpha-report') {
					url += '/alpha-report/dates';

				} else if (options.feedType.toLowerCase() === 'assertion') {
					url += '/assertion/dates';

				} else {
					url += '/rawfeed/dates';
				}

				// Once we get the data back, we want to restrict it to the desired range
				// var processData = function(data) {
				// 		data = restrictRange(data, options.startTime, options.endTime);
				// 		if (typeof options.successCallback == 'function') {
				// 			options.successCallback(data);					
				// 		}
				// }
				this._GET(url, options.successCallback, options.errorCallback);

			},

			/**
			 * Makes the AJAX call to the server to retrieve the data.  In the Everest implementation, all data is retrieved in one
			 * lump call.
			 * @param url {string} the ajax URL to hit
			 * @param successCallback {function(object[])} the callback to use to pass data back to the caller asyncrhonously.  the first argument
			 * is the data passed as an array which may contain a mix of integers (which are millisecond timestamps) or an aggregation of multiple points
			 * represented as objects of the form:
			 *   {
			 *		startTime: {integer} millisecond timestamp of the earliest data point in the aggregation
			 *		endTime: {integer} millisecond timestamp of the latest data point in the aggregation
			 *		count: {integer} the number of data points in the aggregation
			 *   }
			 * @param errorCallback {function} the callback to use to report an error.  The first argument is the error message.  
			 */
			_GET: function(url, successCallback, errorCallback) {

				$.ajax({
					type: 'GET',
					url: url,
					dataType: _config.dataType,
					jsonpCallback: _config.jsonpCallback,
					success: successCallback,
					error: errorCallback
				});
			}

		}

	};

	return data;

}());