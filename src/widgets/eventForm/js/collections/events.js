var app = app || {};

(function() {
    app.EventCollection = Backbone.Collection.extend({
        url: 'http://everest-build:8081/event',
        model: app.EventModel,

        parse: function(response) {
            return response.docs;
        }
    });

    app.events = new app.EventCollection();
}());