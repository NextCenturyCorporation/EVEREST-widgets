var app = app || {};

(function() {
    app.ReminderFormView = Backbone.View.extend({
        tagName: 'div',
        className: 'panel panel-default',

        template: function(context) {
            var compiled = Handlebars.compile(this.rawTemplate);
            return compiled(context);
        },

        events: {
            'click #submitReminderBtn': 'markResolved'
        },

        initialize: function(options) {
            this.rawTemplate = options.rawTemplate ? options.rawTemplate : '';
            this.patient = options.patient;
            this.patientReminder = options.patientReminder;
        },

        render: function() {
            var attributes = this.model ? this.model.attributes : {};
            this.$el.html(this.template(attributes));
            return this;
        },

        markResolved: function() {
            this.patientReminder.completed = true;
            this.patientReminder.dateCompleted = new Date();
            this.patient.save();
            Backbone.View.prototype.remove.call(this);
        }
    });
}());