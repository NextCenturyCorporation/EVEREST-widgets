define([
    'jquery',
    'underscore',
    'backbone',
    'models/reminder'
],

function($, _, Backbone, ReminderModel) {
    return Backbone.Collection.extend({
        url: 'http://localhost:8081/reminder',
        model: ReminderModel,

        parse: function(response) {
            return response.docs;
        }
    });
});