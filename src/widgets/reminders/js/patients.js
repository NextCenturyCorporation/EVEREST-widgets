var app = app || {};

app.router = new Backbone.Router();

$(document).ready(function() {

    var rawPatientListTemplate     = "<div class='panel-heading'><h4>Patients</h4></div><div class='panel-body'><ul class='nav nav-pills nav-stacked'></ul></div>"
      , rawPatientSelectorTemplate = "<a href='#/patient/{{ _id }}'>{{ name }}</a>";

    app.patients.fetch({
        success: function() {
            app.patientListView = new app.NavListView({
                collection: app.patients,
                selectorClassName: 'navSelector',
                rawTemplate: rawPatientListTemplate,
                rawSelectorTemplate: rawPatientSelectorTemplate
            }).render();
            $('div#patientListColumn').append(app.patientListView.el);
            app.patientListView.populateSelectors();
        }
    });

    Backbone.history.start();
});