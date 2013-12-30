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

        clear: function(){ 
            this.remove();
            app.router.navigate('/');
        },

        submit: function(event) {
            $('div').removeClass('has-error');
            var id = $(event.currentTarget).attr('id');
            var inputs = this.$el.find('input');
            var data = {};
            for (var i = 0; i < inputs.length; i++) {
                var formId = $(inputs[i]).attr('id');
                if ($('#'+formId).val() !== ''){
                    formId === 'placeName' ? data.name = $('#'+formId).val() : data[formId] = $('#'+formId).val()
                }
            }

            var str = '';
            var newModel = null;
            switch (id) {
                case "submitPlace":
                    str = 'place';
                    newModel = new app.PlaceModel(data);
                    app.eventPlaces.push(newModel.attributes);
                    break;

                case "submitTag":
                    str = 'tags';
                    newModel = new app.TagModel(data);
                    break;

                case "submitDate":
                    str = 'event_horizon';
                    newModel = new app.DateModel(data);
                    break;

                case "submitAssert":
                    str = 'assertions';
                    newModel = new app.AssertionModel(data);
                    break;
            }

            if (newModel){
                var error = newModel.validate();
                if (error) {
                    $('#' + error).parent().addClass('has-error');
                    return;
                } 

                var tempArray = _.clone(app.eventData.get(str));
                tempArray.push(newModel.attributes)
                app.eventData.set(str, tempArray, {validate: true});
            }
            
            this.clear();
        }
    });
}());