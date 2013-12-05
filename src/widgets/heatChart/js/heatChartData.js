define([

	'jquery',
	'underscore',
	'js/heatChartConfig'

], function($, _, HeatChartConfig) {

	var _config = {};

	var data = function(config) {

		_config = config || HeatChartConfig.get();

		function GET(url, successCallback, errorCallback) {

			$.ajax({
				type: 'GET',
				url: url,
				dataType: _config.dataType,
				jsonpCallback: _config.jsonpCallback,
				success: successCallback,
				error: errorCallback
			});

		}

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

				GET(url, options.successCallback, options.errorCallback);

			}

		};

	};

	return data;

});