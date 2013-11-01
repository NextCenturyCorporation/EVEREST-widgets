var app = app || {};

(function() {
    app.PatientModel = Backbone.Model.extend({
        idAttribute: "_id",

        patientReminder: function(name) {
            return _.find(this.get('reminders'), function(pr) {
                return pr._id === name;
            });
        }
    });
}());