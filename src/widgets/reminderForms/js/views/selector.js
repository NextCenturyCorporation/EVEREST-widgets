define([
    'jquery',
    'underscore',
    'backbone'
],

function($, _, Backbone) {
    return Backbone.View.extend({
        tagName: 'li',

        events: {
            'click': 'setActive'
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
        }
    });
});