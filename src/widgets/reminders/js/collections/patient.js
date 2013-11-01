var app = app || {};

(function() {
    app.PatientCollection = Backbone.Collection.extend({
        url: 'http://everest-build:8081/patient',
        model: app.PatientModel,

        parse: function(response) {
            return response.docs;
        }
    });

    app.patients = new app.PatientCollection();
}());