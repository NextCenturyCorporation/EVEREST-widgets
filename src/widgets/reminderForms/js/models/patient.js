define([
    'jquery',
    'underscore',
    'backbone'
],

function($, _, Backbone) {
    return Backbone.Model.extend({
        idAttribute: "_id",

        patientReminder: function(name) {
            return _.find(this.get('reminders'), function(pr) {
                return pr._id === name;
            });
        }
    });
});