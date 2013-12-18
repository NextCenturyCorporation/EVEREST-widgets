var app = app || {};

(function() {
    app.MapView = Backbone.View.extend({
        tagName: 'div',
        id: 'map-canvas',

        initialize: function(options) {
            this.rawTemplate = options.rawTemplate ? options.rawTemplate : '';
        },

        render: function() {
            var context = this.model ? this.model.attributes : {};
            this.model.map = new google.maps.Map(this.el, context.mapOptions);
            this.model.markers = this.collection.models;
            //this.model.places = this.places.models;
            this.model.setup();
            return this;
        },

        remove: function() {
            Backbone.View.prototype.remove.call(this);
        },

        template: function(context) {
            var compiled = Handlebars.compile(this.rawTemplate);
            return compiled(context);
        }

    });
}());