var app = app || {};

(function() {
    var rawPatientReminderListTemplate     = "<div class='panel-heading'><h4>Reminders for {{ name }}<button class='pull-right' data-toggle='modal' data-target='#remListModal' id='help'>?</button></h4></div><div class='panel-body'><ul class='nav nav-pills nav-stacked'></ul></div>"
      , rawPatientReminderSelectorTemplate = "<a href='#/reminderForm/{{ _id }}'><h5>{{performedBy}} - {{title}}</h5>{{#completed}}Completed: {{dateCompleted}}{{/completed}}{{^completed}}Due: {{dueDate}}{{/completed}}</a>"
      , rawReminderFormTemplate            = "<div class='panel-heading'><h4>Reminder Resolution<button class='btn btn-xs pull-right' data-toggle='modal' data-target='#remFormModal' id='help'>?</button></h4><h5>{{ performedBy }} - {{ title }}</h5></div><div class='panel-body'><div class='well well-sm'><table class='table table-condensed'><thead><th>Who</th><th>What</th><th>When</th></thead><tbody>{{#each components}}<tr><td>{{ who }}</td><td>{{ what }}</td><td>{{ when }}</td></tr>{{/each}}</tbody></table></div><form role='form'><div class='well well-sm'><h4>Resolution:</h4><div id='resolution-controls'></div></div><div class='well well-sm'><h4>Exceptions:</h4>{{#each exceptions}}<div class='radio'><label><input type='radio' name='optionsRadios' id='optionsRadios{{ @index }}' value='option{{ @index }}'>{{ . }}</label></div>{{/each}}</div></form><button id='submitReminderBtn' class='btn btn-default'>Submit</button></div>"
      , rawReminderHelpTemplate            = "<div class='modal fade' id='{{modal_id}}'' tabIndex='-1' role='dialog' aria-labelledby='remModalLabel' aria-hidden='true'><div class='modal-dialog'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-dismiss='modal' aria-hidden='true'>&times;</button><h4 class='modal-title' id='remModalLabel'>{{title}}</h4></div><div class='modal-body'>{{body}}</div></div></div></div>";

    app.patient = new app.PatientModel();
    app.patient.urlRoot = app.patients.url;
    app.patientReminders = new Backbone.Collection();

    app.showReminderList = function() {
        app.router.navigate('//reminderForm/');
        app.reminderFormView && app.reminderFormView.remove();
        app.reminderListView && app.reminderListView.remove();

        app.patientReminders.reset(app.patient.get('reminders'));

        app.reminderListView = new app.NavListView({
            model: app.patient,
            collection: app.patientReminders,
            selectorClassName: function() {
                return this.model.get('completed') ? 'navSelector disabled' : 'navSelector';
            },
            rawTemplate: rawPatientReminderListTemplate,
            rawSelectorTemplate: rawPatientReminderSelectorTemplate
        }).render();

        app.reminderListView.listenTo(app.patient, 'sync', app.showReminderList);

        $('div#reminderListColumn').append(app.reminderListView.el);
        app.reminderListView.populateSelectors();
    };

    app.showReminderForm = function(formId) {
        app.reminderFormView && app.reminderFormView.remove();

        var patientReminder = app.patient.patientReminder(formId);
        var reminder = app.reminders.get(patientReminder.reminder_id);

        app.reminderFormView = new app.ReminderFormView({
            model: reminder,
            patient: app.patient,
            patientReminder: patientReminder,
            rawTemplate: rawReminderFormTemplate
        }).render();
        $('div#reminderFormColumn').append(app.reminderFormView.el);
    };

    app.router = new Backbone.Router();
    app.router.route('reminderForm/:id', 'showReminderForm', app.showReminderForm);

    var compiled = Handlebars.compile(rawReminderHelpTemplate);
    $('div#reminderListHelp').append(compiled({
        modal_id: 'remListModal',
        title: 'Reminder List Help',
        body: 'Select one of the following reminders to view its details.' 
    }));

    compiled = Handlebars.compile(rawReminderHelpTemplate);
    $('div#reminderFormHelp').append(compiled({
        modal_id: 'remFormModal',
        title: 'Reminder Form Help',
        body: 'Specify the appropriate resolution or, if no resolution exists, an exception.'
    }));
}());

$(document).ready(function() {
    app.reminders.fetch({ success: app.showReminderList });
    Backbone.history.start();
});