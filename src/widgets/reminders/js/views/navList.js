var app = app || {};

(function() {
    app.NavListView = Backbone.View.extend({
        tagName: 'div',
        className: 'panel panel-default fixed',

        initialize: function(options) {
            this.selectors = [];
            this.rawTemplate = options.rawTemplate ? options.rawTemplate : '';
            this.rawSelectorTemplate = options.rawSelectorTemplate ? options.rawSelectorTemplate : '';
            this.selectorClassName = options.selectorClassName ? options.selectorClassName : null;
        },

        render: function() {
            var context = this.model ? this.model.attributes : {};
            this.$el.html(this.template(context));
            return this;
        },

        addSelector: function(selectorModel) {
            var selectorOptions = {
                model: selectorModel,
                rawTemplate: this.rawSelectorTemplate
            };

            if(this.selectorClassName) {
                selectorOptions.className = this.selectorClassName;
            }

            var selector = this.createSelector(selectorOptions).render();
            this.$('.nav').append(selector.el);
            this.selectors.push(selector);
        },

        populateSelectors: function() {
            if(!this.collection) {
                return
            }

            this.clearList();
            var me = this;

            this.collection.each(function(m) {
                me.addSelector(m);
            });
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
            return new app.NavSelectorView(options);
        },

        template: function(context) {
            var compiled = Handlebars.compile(this.rawTemplate);
            return compiled(context);
        }
    });
}());