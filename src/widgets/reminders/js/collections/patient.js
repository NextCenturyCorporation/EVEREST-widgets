var app = app || {};

(function() {
    app.PatientCollection = Backbone.Collection.extend({
        url: function() {
        	return EverestConfig.endpoint.base + '/patient';
        },
        model: app.PatientModel,

        parse: function(response) {
            return response.docs;
        }
    });

    app.patients = new app.PatientCollection();
}());