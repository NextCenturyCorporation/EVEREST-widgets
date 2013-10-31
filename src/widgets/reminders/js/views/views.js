define(function(require) {
    var Templates    = require('Templates')
      , Selector     = require('views/selector')
      , List         = require('views/list')
      , ReminderForm = require('views/reminderForm');

    var ReminderSelector = Selector.extend({
        initialize: function() {
            this.template = Templates.reminderSelector();
            this.el.className = this.model.get('completed') ? 'navSelector disabled' : 'navSelector';
        }
    });

    var PatientSelector = Selector.extend({
        initialize: function(options) {
            this.template = Templates.patientSelector();
            this.el.className = 'navSelector';
        }
    });

    var ReminderList = List.extend({
        initialize: function(options) {
            this.selectors = [];
            this.listenTo(this.model, 'sync', this.populateSelectors);
            this.template = Templates.reminderList();
        },

        populateSelectors: function() {
            this.clearList();
            var patientReminders = this.model.get('reminders');
            _.each(patientReminders, function(pr) {
                var patientReminder = new Backbone.Model(pr);
                this.addSelector(patientReminder);
            }, this);
        },

        createSelector: function(options) {
            return new ReminderSelector(options);
        }
    });

    var PatientList = List.extend({
        initialize: function(options) {
            this.selectors = [];
            this.listenTo(this.collection, 'add', this.addSelector);
            this.template = Templates.patientList();
        },

        createSelector: function(options) {
            return new PatientSelector(options);
        }
    });

    return {
        reminderList: function(options) {
            return new ReminderList(options);
        },

        patientList: function(options) {
            return new PatientList(options);
        },

        reminderForm: function(options) {
            return new ReminderForm(options);
        }
    }
});