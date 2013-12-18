var app = app || {};

(function() {
    app.FormView = Backbone.View.extend({
        tagName: 'div',
        className: 'panel panel-default fixed',

        events: {
            'click .btn-info'             : 'showHiddenForm',
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

        showHiddenForm: function(event){
            var targetDiv = $(event.currentTarget).attr('data-target');
            app.hiddenForms.forEach(function(form){
                if (form.id === targetDiv){
                    form.view.show();
                } else {
                    form.view.hide();
                }
            });

            if (targetDiv === 'placeDiv'){
                app.loadMapView();
            } else {
                app.loadEventView();
            }
        },

        updateEvent: function(event) {
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