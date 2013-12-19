var app = app || {};

(function() {
    app.HiddenFormView = Backbone.View.extend({
        tagName: 'div',
        className: 'form-group hid',

        events: {
            'click .btn-default' : 'hide',
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

        getValue: function(identifier) {
            var value = $(identifier).val();
            $(identifier).val('');
            return value;
        },

        show: function() {
            this.$el.removeClass('hid');
        },

        hide: function() {
            this.$el.addClass('hid');
        },

        submit: function(event) {
            var id = $(event.currentTarget).attr('id');
            switch (id) {
                case "submitPlace":
                    $('div').removeClass('has-error');
                    var p = {
                        name: this.getValue('#placeNameInput'),
                        latitude: parseFloat(this.getValue('#latInput')),
                        longitude: parseFloat(this.getValue('#longInput')),
                        radius: parseFloat(this.getValue('#radInput')) || 0
                    };

                    app.eventPlaces.push(new app.PlaceModel(p));
                    app.event_.place.push(p);
                    this.hide();
                    app.loadEventView();

                    break;
                case "submitTag":
                    $('div').removeClass('has-error');

                    if ($('#tagInput').val() !== '') {
                        app.event_.tags.push(this.getValue('#tagInput'));
                        this.hide();
                        app.loadEventView();
                    } else {
                        $('#tagInput').parent().addClass('has-error');
                    }

                    break;
                case "submitDate":
                    break;
                case "submitAssert":
                    $('div').removeClass('has-error');
                    if ($('#ent1Input').val() !== '') {
                        var assertion = {
                            entity1: this.getValue('#ent1Input'),
                            relationship: this.getValue('#relInput'),
                            entity2: this.getValue('#ent2Input'),
                        };

                        app.event_.assertions.push(assertion);
                        this.hide();
                        app.loadEventView();
                    } else {
                        $('#ent1Input').parent().addClass('has-error');
                    }
                    
                    break;
            }
        }
    });
}());