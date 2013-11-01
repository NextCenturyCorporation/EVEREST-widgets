var app = app || {};

(function() {
    app.ReminderCollection = Backbone.Collection.extend({
        url: 'http://everest-build:8081/reminder',
        model: app.ReminderModel,

        parse: function(response) {
            return response.docs;
        }
    });

    app.reminders = new app.ReminderCollection();
}());