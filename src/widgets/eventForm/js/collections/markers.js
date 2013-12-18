var app = app || {};

(function() {
    app.MarkerCollection = Backbone.Collection.extend({
        model: app.PlaceModel
    });
}());