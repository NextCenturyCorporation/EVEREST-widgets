if(OWF.Util.isRunningInOWF()) {

    app.router.route('patient/:id', 'sendPatient', function(patientId) {
        var patient = app.patients.get(patientId);
        var reminderEvents = [];
        var message = {};
        _.each(patient.get('reminders'), function(reminder) {
        	reminderEvents.push({
        		'title': reminder.title,
        		'start': reminder.completed ? reminder.dateCompleted : reminder.dueDate
        	});
        });
        message.events = reminderEvents;

        OWF.ready(function () {
            OWF.Eventing.publish('com.nextcentury.everest.reminders.sendPatient', patient.toJSON());
            OWF.Eventing.publish('com.nextcentury.everest.storyLine.events', message);
        });
    });
}