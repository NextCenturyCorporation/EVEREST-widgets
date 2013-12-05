var app = app || {};

(function() {
    var rawPatientReminderListTemplate     = "<div class='panel-heading'><h4>Reminders for {{ name }}</h4></div><div class='panel-body'><ul class='nav nav-pills nav-stacked'></ul></div>"
      , rawPatientReminderSelectorTemplate = "<a href='#/reminderForm/{{ _id }}'><h5>{{performedBy}} - {{title}}</h5>{{#completed}}Completed: {{dateCompleted}}{{/completed}}{{^completed}}Due: {{dueDate}}{{/completed}}</a>"
      , rawReminderFormTemplate            = "<div class='panel-heading'><h4>Reminder Resolution</h4><h5>{{ performedBy }} - {{ title }}</h5></div><div class='panel-body'><div class='well well-sm'><table class='table table-condensed'><thead><th>Who</th><th>What</th><th>When</th></thead><tbody>{{#each components}}<tr><td>{{ who }}</td><td>{{ what }}</td><td>{{ when }}</td></tr>{{/each}}</tbody></table></div><form role='form'><div class='well well-sm'><h4>Resolution:</h4><div id='resolution-controls'></div></div><div class='well well-sm'><h4>Exceptions:</h4>{{#each exceptions}}<div class='radio'><label><input type='radio' name='optionsRadios' id='optionsRadios{{ @index }}' value='option{{ @index }}'>{{ . }}</label></div>{{/each}}</div></form><button id='submitReminderBtn' class='btn btn-default'>Submit</button></div>";

    app.patient = new app.PatientModel();
    app.patient.urlRoot = app.patients.url
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

}());

$(document).ready(function() {
    app.reminders.fetch({ success: app.showReminderList });
    Backbone.history.start();
});