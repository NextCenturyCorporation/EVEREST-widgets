var app = app || {};

(function() {
    app.ReminderCollection = Backbone.Collection.extend({
        url: function() {
        	return EverestConfig.endpoint.base + '/reminder';
        },
        model: app.ReminderModel,

        parse: function(response) {
            return response.docs;
        }
    });

    app.reminders = new app.ReminderCollection();
}());