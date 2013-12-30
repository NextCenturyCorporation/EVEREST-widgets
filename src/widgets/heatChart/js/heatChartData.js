
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

		return {

			fetch: function(options) {

				var url = _config.baseUrl;

				if (options.feedType.toLowerCase() === 'alpha-report') {
					url += '/alpha-report/dates';

				} else if (options.feedType.toLowerCase() === 'assertion') {
					url += '/assertion/dates';

				} else {
					url += '/rawfeed/dates';
				}

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