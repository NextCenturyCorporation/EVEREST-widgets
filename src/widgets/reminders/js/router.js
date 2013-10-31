define([
    'jquery',
    'underscore',
    'backbone',
    'Templates',
    'Views',
    'collections/patient',
    'collections/reminder'
],

function($, _, Backbone, Templates, Views, PatientCollection, ReminderCollection) {
    return Backbone.Router.extend({
        routes: {
            'patientReminders/:id': 'showReminderList',
            'reminderForm/:id': 'showReminderForm'
        },

        initialize: function(options) {
            this.reminders = new ReminderCollection();
            this.patients = new PatientCollection();

            var me = this;
            this.reminders.fetch().complete(function() {
                me.showPatientList();
                me.patients.fetch();
            });
        },

        showReminderList: function(name) {
            this.reminderFormView && this.reminderFormView.remove();
            this.reminderListView && this.reminderListView.remove();

            this.patient = this.patients.get(name);
            this.reminderListView = Views.reminderList({ model: this.patient }).render();
            $('div#reminderListColumn').append(this.reminderListView.el);
            this.reminderListView.populateSelectors();
        },

        showPatientList: function() {
            this.patientListView && this.patientListView.remove();

            this.patientListView = Views.patientList({ collection: this.patients }).render();
            $('div#patientListColumn').append(this.patientListView.el);
        },

        showReminderForm: function(name) {
            this.reminderFormView && this.reminderFormView.remove();

            var patientReminder = this.patient.patientReminder(name);
            var reminder = this.reminders.get(patientReminder.reminder_id);
            this.reminderFormView = Views.reminderForm({ model: reminder, patient: this.patient, patientReminder: patientReminder }).render();
            $('div#reminderFormColumn').append(this.reminderFormView.el);
        }
    });
});