define(function(require) {
    var Templates    = require('Templates')
      , Selector     = require('views/selector')
      , List         = require('views/list')
      , ReminderForm = require('views/reminderForm');

    var ReminderSelector = Selector.extend({
        initialize: function() {
            this.template = Templates.reminderSelector();
            this.el.className = 'navSelector';
        }
    });

    var ReminderList = List.extend({
        initialize: function(options) {
            this.selectors = [];
            this.listenTo(this.collection, 'add', this.addSelector);
            this.template = Templates.reminderList();
        },

        createSelector: function(options) {
            return new ReminderSelector(options);
        }
    });

    return {
        reminderList: function(options) {
            return new ReminderList(options);
        },

        reminderForm: function(options) {
            return new ReminderForm(options);
        }
    }
});