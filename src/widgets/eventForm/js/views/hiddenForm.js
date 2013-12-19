var app = app || {};

(function() {
    app.HiddenFormView = Backbone.View.extend({
        tagName: 'div',
        className: 'form-group',

        events: {
            'click .btn-default' : 'clear',
            'click .btn-primary' : 'submit'
        },

        initialize: function(options) {
            this.rawTemplate = options.rawTemplate ? options.rawTemplate : '';
            $(this.el).attr('id', this.id);
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

        clear: function(){ 
            this.remove();
            app.router.navigate('/');
        },

        submit: function(event) {
            $('div').removeClass('has-error');
            var id = $(event.currentTarget).attr('id');
            switch (id) {
                case "submitPlace":
                    var p = {
                        name: $('#placeNameInput').val(),
                        latitude: parseFloat($('#latInput').val()),
                        longitude: parseFloat($('#longInput').val()),
                        radius: parseFloat($('#radInput').val()) || 0
                    };

                    app.eventPlaces.push(new app.PlaceModel(p));
                    app.event_.place.push(p);

                    break;

                case "submitTag":
                    if ($('#tagInput').val() === '') {
                        $('#tagInput').parent().addClass('has-error');
                        return;
                    }

                    app.event_.tags.push($('#tagInput').val());
                    app.loadEventView();

                    break;

                case "submitDate":
                    break;

                case "submitAssert":
                    if ($('#ent1Input').val() === '') {
                        $('#ent1Input').parent().addClass('has-error');
                        return;
                    }

                    var assertion = {
                        entity1: $('#ent1Input').val(),
                        relationship: $('#relInput').val(),
                        entity2: $('#ent2Input').val(),
                    };

                    app.event_.assertions.push(assertion);
                    app.loadEventView();
                    
                    break;
            }

            this.clear();
        }
    });
}());