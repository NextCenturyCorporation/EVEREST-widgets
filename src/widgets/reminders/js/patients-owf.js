if(OWF.Util.isRunningInOWF()) {

    app.router.route('patient/:id', 'sendPatient', function(patientId) {
        app.reminders.fetch({
    		success: function(){
    			var patient = app.patients.get(patientId);
        		var message = { events: []};
        		_.each(patient.get('reminders'), function(reminder) {
        			var rem = app.reminders.get(reminder.reminder_id);
        			var description = 'Performed by: ' + reminder.performedBy;
        			_.each(rem.get('components'), function(comp){
            			description += '<br />Who: ' + comp.who + '<br />What: ' + comp.what + '<br />When: ' + comp.when + '<hr />';
        			});

        			message.events.push({
        				title: reminder.title,
    					dateCompleted: reminder.dateCompleted,
    					completed: reminder.completed,
    					dueDate: reminder.dueDate,
            			description: description
        			});
        		});

        		OWF.ready(function () {
        			OWF.Eventing.publish('com.nextcentury.everest.reminders.sendPatient', patient.toJSON());
        			OWF.Eventing.publish('com.nextcentury.everest.storyLine.events', message);
        		});
    		}
    	});
    });
}
