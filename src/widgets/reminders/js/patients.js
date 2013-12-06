var app = app || {};

app.router = new Backbone.Router();

$(document).ready(function() {

    var rawPatientListTemplate     = "<div class='panel-heading'><h4>Patients<button class='pull-right' data-toggle='modal' data-target='#patModal' id='help'>?</button></h4></div><div class='panel-body'><ul class='nav nav-pills nav-stacked'></ul></div>"
      , rawPatientSelectorTemplate = "<a href='#/patient/{{ _id }}'>{{ name }}</a>"
      , rawPatientHelpTemplate = "<div class='modal fade' id='patModal' tabIndex='-1' role='dialog' aria-labelledby='patModalLabel' aria-hidden='true'><div class='modal-dialog'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-dismiss='modal' aria-hidden='true'>&times;</button><h4 class='modal-title' id='patModalLabel'>{{title}}</h4></div><div class='modal-body'>{{body}}</div></div></div></div>";

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

    var compiled = Handlebars.compile(rawPatientHelpTemplate);
    $('div#patientHelp').append(compiled({
        title: 'Patient Help',
        body: 'Select one of the following patients in order to view their medical history and any of their future reminders.'
    }));

    Backbone.history.start();
});