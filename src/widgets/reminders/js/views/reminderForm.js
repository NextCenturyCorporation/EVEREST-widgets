define([
    'jquery',
    'underscore',
    'backbone',
    'Templates'
],

function($, _, Backbone, Templates) {
    return Backbone.View.extend({
        tagName: 'div',
        className: 'panel panel-default',

        template: Templates.reminderForm(),

        events: {
            'click #submitReminderBtn': 'markResolved'
        },

        initialize: function(options) {
            this.patient = options.patient;
            this.patientReminder = options.patientReminder;
        },

        render: function() {
            var attributes = this.model.attributes;
            this.$el.html(this.template(attributes));
            this.renderReminderControl();
            return this;
        },

        renderReminderControl: function() {
            switch(this.model.get('title')) {
                case "IHD Aspirin Therapy Use":
                    this.$('#resolution-controls').append(Templates.aspirinReminderForm());
                    break;
                case "Colorectal Cancer Screen":
                    this.$('#resolution-controls').append(Templates.colorectalReminderForm());
                    break;
                case "Hypertension Screen/BP Check":
                    this.$('#resolution-controls').append(Templates.hypertensionReminderForm());
                    break;
            }
        },

        markResolved: function() {
            this.patientReminder.completed = true;
            this.patientReminder.dateCompleted = new Date();
            this.patient.save();
            Backbone.View.prototype.remove.call(this);
        }
    });
});