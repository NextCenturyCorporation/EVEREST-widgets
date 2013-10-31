define([
    'jquery',
    'underscore',
    'backbone',
    'Templates',
    'Views',
    'collections/reminder'
],

function($, _, Backbone, Templates, Views, ReminderCollection) {
    return Backbone.Router.extend({
        routes: {
            'reminderForm/:id': 'showReminderForm'
        },

        initialize: function(options) {
            this.reminders = new ReminderCollection();
            this.showReminderList()
        },

        showReminderList: function(name) {
            this.reminderFormView && this.reminderFormView.remove();
            this.reminderListView && this.reminderListView.remove();
            this.reminderListView = Views.reminderList({ collection: this.reminders }).render();
            $('div#reminderListColumn').append(this.reminderListView.el);
            this.reminderListView.collection.fetch();
        },

        showReminderForm: function(name) {
            this.reminderFormView && this.reminderFormView.remove();

            var reminder = this.reminders.get(name);
            this.reminderFormView = Views.reminderForm({ model: reminder }).render();
            $('div#reminderFormColumn').append(this.reminderFormView.el);
        }
    });
});