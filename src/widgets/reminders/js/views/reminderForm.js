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
            this.renderReminderControl();
            return this;
        },

        renderReminderControl: function() {
            var template = '';
            switch(this.model.get('title')) {
                case "IHD Aspirin Therapy Use":
                    template = '<h5>Start Aspirin Therapy</h5><div class="checkbox"><label><input type="checkbox" value="">Outpatient - Order Aspirin 81mg Q daily</label></div><div class="checkbox"><label><input type="checkbox" value="">Outpatient - Order Aspirin 325mg Q daily</label></div><div class="checkbox"><label><input type="checkbox" value="">Inpatient - Order Aspirin 81mg Q daily</label></div> <div class="checkbox"><label><input type="checkbox" value="">Inpatient - Order Aspirin 81mg Q daily</label></div><h5>Patient on aspirin therapy from some other source:</h5>Date<input type="text" class="form-control" placeholder="Date">Location<input type="text" class="form-control" placeholder="Location">Comment<input type="text" class="form-control" placeholder="Comment">';
                    break;
                case "Colorectal Cancer Screen":
                    template = '<h5>FOBT</h5><div class="checkbox"><label><input type="checkbox" value="">Order occult blood (fecal) lab test</label></div><div class="checkbox"><label><input type="checkbox" value="">FOBT cards x3 given to patient</label></div><div class="checkbox"><label><input type="checkbox" value="">Patient had previous FOBT lab test done</label></div><div class="checkbox"><label><input type="checkbox" value="">Patient declined having FOBT lab test</label></div><h5>Flex Sigmoidoscopy</h5><div class="checkbox"><label><input type="checkbox" value="">Order flex sigmoidoscopy</label></div><div class="checkbox"><label><input type="checkbox" value="">Patient had previous sigmoidoscopy</label></div><div class="checkbox"><label><input type="checkbox" value="">Patient declined to have sigmoidoscopy performed</label></div><h5>Colonoscopy</h5><div class="checkbox"><label><input type="checkbox" value="">Patient had previous sigmoidoscopy</label></div>';
                    break;
                case "Hypertension Screen/BP Check":
                    template = '<h5>Record Patient\'s BP</h5><input type="text" class="form-control" placeholder="Blood Pressure">';
                    break;
                case "Pain Screening":
                    template = '<h5>Enter Pain Scale For this Patient</h5><div class="input-group-btn"><button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">Pain<span class="caret"></span></button><ul class="dropdown-menu"><li><a href="#">None</a></li><li><a href="#">Minor</a></li><li><a href="#">Moderate</a></li><li><a href="#">Severe</a></li></ul></div>';
                    break;
                case "Advance Directive Screening":
                    template = '<div class="checkbox"><label><input type="checkbox" value="">Patient had Advance Directives Screening done</label></div>Level of Understanding:<input type="text" class="form-control">Comment:<input type="text" class="form-control">';
                    break;
                case "Pneumococcal":
                    template = '<div class="checkbox"><label><input type="checkbox" value="">Patient given Pneumococcal vaccine today</label></div>Pneumococcal Lot Number<input type="text" class="form-control">Pneumococcal Injection Site<input type="text" class="form-control">Pneumococcal Expiration Date<input type="text" class="form-control">';
                    break;
                case "Influenza Vaccine 65":
                    template = '<h5>Order Influenza vaccine to be administered</h5><div class="checkbox"><label><input type="checkbox" value="">Patient given Influenza vaccine today</label></div><div class="checkbox"><label><input type="checkbox" value="">Inpatient Influenza vaccine order/administer</label></div>';
                    break;
            }

            var compiled = Handlebars.compile(template);
            this.$('#resolution-controls').append(compiled);
        },

        markResolved: function() {
            var me = this;
            me.patientReminder.completed = true;
            me.patientReminder.dateCompleted = moment(new Date()).format('LLL');
            me.patientReminder.start = me.patientReminder.dateCompleted;
            me.patientReminder.description = '';
            //this.patient.save();

            //may not be the best place to put this
            $('input:checked').each(function(){
                me.patientReminder.description += $(this)[0].nextSibling.textContent + '<br />';
            });

            $('input[type=text]').each(function(){
                if ($(this)[0].value !== ''){
                    me.patientReminder.description += $(this)[0].previousSibling.textContent + ': ' + $(this)[0].value + '<br />';
                }
            });

            this.announceState({events: [me.patientReminder]});
            
            app.showReminderList();

            //this may need to be removed, renavigates to 'home' so this reminder
            //can be clicked again directly after being resolved
            app.router.navigate('//reminderForm/');
            Backbone.View.prototype.remove.call(me);
        },

        announceState: function(state){
            if(OWF.Util.isRunningInOWF()) {
                OWF.ready(function() {
                    OWF.Eventing.publish('com.nextcentury.everest.storyLine.events', JSON.stringify(state));
                });
            }
        }
    });
}());