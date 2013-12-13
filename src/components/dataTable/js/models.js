var cell = Backbone.Model.extend( {
	idAttribute: "_id",
	defaults: {
		text: 'N/A'
	},

	initialize: function() {

	}
});

var row = Backbone.Model.extend({
	idAttribute: "_id"
});