var app = app || {};

(function() {
    app.AssertionCollection = Backbone.Collection.extend({
        url: 'http://everest-build:8081/event-assertion',
        model: app.AssertionModel,

        parse: function(response) {
            return response.docs;
        }
    });

    app.assertions = new app.AssertionCollection();
}());