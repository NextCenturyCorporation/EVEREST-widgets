var app = app || {};

(function() {
    app.PlaceCollection = Backbone.Collection.extend({
        url: 'http://everest-build:8081/place',
        model: app.PlaceModel,

        parse: function(response) {
            return response.docs;
        }
    });

    app.places = new app.PlaceCollection();
}());