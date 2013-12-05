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

			getAllFeeds: function(feedType, successCallback, errorCallback) {
				var url = _config.baseUrl;
				feedType = feedType.toLowerCase();

				if (feedType == 'alpha-report') {
					url += '/alpha-report/dates';

				} else if (feedType == 'assertion') {
					url += '/assertion/dates';

				} else {
					url += '/rawfeed/dates';
				}

				GET(url, successCallback, errorCallback);

			}

		};

	};

	return data;

});