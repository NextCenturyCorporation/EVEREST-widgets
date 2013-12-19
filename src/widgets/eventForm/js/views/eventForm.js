var app = app || {};

(function() {
    app.FormView = Backbone.View.extend({
        tagName: 'div',
        className: 'panel panel-default fixed',

        events: {
            'change #nameInput,#descInput': 'updateEvent'
        },

        initialize: function(options) {
            this.rawTemplate = options.rawTemplate ? options.rawTemplate : '';
        },

        render: function() {
            var context = this.model ? this.model.attributes : {};
            this.$el.html(this.template(context));
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
            if (input.attr('id') === 'nameInput') {
                app.event_.name = input.val();
            } else if (input.attr('id') === 'descInput') {
                app.event_.description = input.val();
            }

            app.loadEventView();
        }
    });
}());