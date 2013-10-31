define([
    'jquery',
    'underscore',
    'backbone',
    'views/selector'
],

function($, _, Backbone, SelectorView) {
    return Backbone.View.extend({
        tagName: 'div',
        className: 'panel panel-default',

        render: function() {
            var context = this.model ? this.model.attributes : {};
            this.$el.html(this.template(context));
            return this;
        },

        addSelector: function(selectorModel) {
            var selector = this.createSelector({ model: selectorModel }).render();
            this.$('.nav').append(selector.el);
            this.selectors.push(selector);
        },

        clearList: function() {
            _.invoke(this.selectors, 'remove');
        },

        remove: function() {
            this.clearList();
            delete this.selectors;
            Backbone.View.prototype.remove.call(this);
        },

        createSelector: function(options) {
            return new SelectorView(options);
        }
    });
});