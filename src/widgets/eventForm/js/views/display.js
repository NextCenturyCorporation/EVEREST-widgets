var app = app || {};

(function() {
    app.DisplayView = Backbone.View.extend({
        tagName: 'div',
        className: 'panel panel-default',

        events: {
            'click #saveEvent' : 'submit'
        },

        initialize: function(options) {
            this.rawTemplate = options.rawTemplate ? options.rawTemplate : '';
        },

        render: function() {
            var context = this.model ? this.model.attributes : {};
            this.$el.html(this.template({ event_: JSON.stringify(context, undefined, 2)}));
            return this;
        },

        remove: function() {
            Backbone.View.prototype.remove.call(this);
            Backbone.View.prototype.unbind.call(this);
        },

        template: function(context) {
            var compiled = Handlebars.compile(this.rawTemplate);
            return compiled(context);
        },

        submit: function(){
            var me = this;
            var event_ = me.model.attributes;
            console.log(event_);

            if (event_.name === '') {
                $('#name').parent().addClass('has-error');
                return; 
            } 

            event_.place.forEach(function(p){
                var newPlace = app.places.create(p);
            });

            async.each(event_.assertions, function(assert, callback) {
                var tempAssert = {
                    name: assert.entity1 + ' ' + assert.relationship + ' ' + assert.entity2,
                    entity1: [{value: assert.entity1}],
                    relationship: [{value: assert.relationship}],
                    entity2: [{value: assert.entity2}]
                };

                var newAssert = app.assertions.create(tempAssert, { wait: true });
                newAssert.on('sync', function(model){
                    assert._id = newAssert.id;
                    me.render();
                    callback();
                });
            }, function(err) {
                if (!err) {
                    var tempEvent = {
                        name: event_.name,
                        description: event_.description,
                        place: event_.place,
                        tags: event_.tags,
                        event_horizon: event_.event_horizon,
                        assertions: []
                    };

                    event_.assertions.forEach(function(assert){
                        tempEvent.assertions.push(assert._id);
                    });

                    var newEvent = app.events.create(tempEvent, { wait: true });
                    newEvent.on('sync', function(model){
                        app.eventData.set('id', newEvent.id);
                        me.render();
                    });
                }
            });
        }
    });
}());