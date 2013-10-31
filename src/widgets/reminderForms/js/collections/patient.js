define([
    'jquery',
    'underscore',
    'backbone',
    'models/patient'
],

function($, _, Backbone, PatientModel) {
    return Backbone.Collection.extend({
        url: 'http://localhost:8081/patient',
        model: PatientModel,

        parse: function(response) {
            return response.docs;
        }
    });
});