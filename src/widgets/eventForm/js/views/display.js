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

        submit: function(){
            var me = this;
            var event_ = JSON.parse(me.model.attributes.event_);
            async.each(event_.assertions, function(assert, callback){

                var tempAssert = {
                    name: assert.entity1 + ' ' + assert.relationship + ' ' + assert.entity2,
                    entity1: [{value: assert.entity1}],
                    relationship: [{value: assert.relationship}],
                    entity2: [{value: assert.entity2}]
                };

                $.ajax({
                    url: 'http://everest-build:8081/target-assertion',
                    type: 'POST',
                    dataType: 'json',
                    data: tempAssert,
                    success: function(data) {
                        assert._id = data._id;
                        me.model.attributes.event_ = JSON.stringify(event_, undefined, 2);
                        me.render();
                        callback();
                    },
                    error: function(err) {
                        console.log(err);
                        callback(err);
                    }
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

                    $.ajax({
                        url: 'http://everest-build:8081/event',
                        type: 'POST',
                        dataType: 'json',
                        data: tempEvent,
                        success: function(data){
                            event_.id = data._id;
                            me.model.attributes.event_ = JSON.stringify(event_, undefined, 2);
                            me.render();
                        },
                        error: function(err) {
                            console.log(err);
                        }
                    });
                }
            });
        }
    });
}());