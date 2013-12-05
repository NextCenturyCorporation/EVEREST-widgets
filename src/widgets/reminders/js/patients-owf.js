if(OWF.Util.isRunningInOWF()) {

    app.router.route('patient/:id', 'sendPatient', function(patientId) {
        var patient = app.patients.get(patientId);
        var reminderEvents = [];
        var message = {};
        _.each(patient.get('reminders'), function(reminder) {
            console.log(reminder);
            var rem = app.reminders.get(reminder.reminder_id);
            console.log(rem);
            var description = 'Performed by: ' + reminder.performedBy;
            _.each(reminder.components, function(comp){
                description += '<br />Who: ' + comp.who + '<br />What: ' + comp.what + '<br />When: ' + comp.when;
            });

        	reminderEvents.push({
        		title: reminder.title,
        		start: reminder.completed ? reminder.dateCompleted : reminder.dueDate,
                description: description
        	});
        });
        message.events = reminderEvents;

        OWF.ready(function () {
            OWF.Eventing.publish('com.nextcentury.everest.reminders.sendPatient', patient.toJSON());
            OWF.Eventing.publish('com.nextcentury.everest.storyLine.events', message);
        });
    });
}