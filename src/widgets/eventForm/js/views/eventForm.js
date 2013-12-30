var app = app || {};

(function() {
    app.FormView = Backbone.View.extend({
        tagName: 'div',
        className: 'panel panel-default fixed',

        events: {
            'change :input': 'updateEvent'
        },

        initialize: function(options) {
            this.rawTemplate = options.rawTemplate ? options.rawTemplate : '';
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        remove: function() {
            Backbone.View.prototype.remove.call(this);
        },

        template: function(context) {
            var compiled = Handlebars.compile(this.rawTemplate);
            return compiled(context);
        },

        updateEvent: function(event) {
            $('div').removeClass('has-error');
            var input = $(event.currentTarget);
            if (input.attr('id') === 'name' || input.attr('id') === 'description') {
                app.eventData.set(input.attr('id'), input.val(), {validate: true});
            }
        }
    });
}());