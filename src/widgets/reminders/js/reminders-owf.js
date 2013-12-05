if(OWF.Util.isRunningInOWF()) {

    OWF.ready(function() {
        OWF.Eventing.subscribe('com.nextcentury.everest.reminders.sendPatient', function (sender, msg, channel) {
            app.patient.set(msg);
            app.showReminderList();
	    
	    var message = { events: [] };
		_.each(app.patient.get('reminders'), function(reminder){
			var rem = app.reminders.get(reminder.reminder_id);
			var description = 'Performed bye: ' + reminder.performedBy;

			_.each(rem.get('components'), function(comp) {
				description += '<hr />Who: ' + comp.who + '<br />What: ' + comp.what + '<br />When: ' + comp.when;
			});
			
			message.events.push({
				title: reminder.title,
				dateCompleted: reminder.dateCompleted,
				completed: reminder.completed,
				dueDate: reminder.dueDate,
				description: description
			});
		});

	    OWF.Eventing.publish('com.nextcentury.everest.storyLine.events', message);
        });

        OWF.notifyWidgetReady();
    });
}
