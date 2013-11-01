var app = app || {};

(function() {
    app.NavSelectorView = Backbone.View.extend({
        tagName: 'li',

        events: {
            'click': 'setActive'
        },

        initialize: function(options) {
            this.rawTemplate = options.rawTemplate ? options.rawTemplate : '';
        },

        render: function() {
            var context = this.model ? this.model.attributes : {};
            this.$el.html(this.template(context));
            return this;
        },

        setActive: function(e) {
            if(!this.$el.hasClass('disabled')) {
                this.$el.siblings('.active').removeClass('active');
                this.$el.addClass('active');
            }
        },

        template: function(context) {
            var compiled = Handlebars.compile(this.rawTemplate);
            return compiled(context);
        }
    });
}());