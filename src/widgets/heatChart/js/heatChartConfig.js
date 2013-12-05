define([

	'jquery',
	'underscore'

], function($, _) {

	var config = {
		dataType: 'jsonp',
		baseUrl: 'http://everest-build:8081',
		jsonpCallback: 'callback'
	};

	return {
		
		get: function() {
			return config;
		}

	};

});