var app = app || {};

(function() {
    app.FormModel = Backbone.Model.extend({
    	initialize: function(){
    		this.bind("change", app.loadEventView);
    	}
    });
}());