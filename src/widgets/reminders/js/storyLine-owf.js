if(OWF.Util.isRunningInOWF()) {

    OWF.ready(function() {
        OWF.Eventing.subscribe('com.nextcentury.everest.reminders.sendPatient', function (sender, msg, channel) {
            app.plotReminders(msg.reminders);
        });

        OWF.Eventing.subscribe('com.nextcentury.everest.storyline.events', function (sender, msg, channel) {
        	console.log(msg);
            app.addReminder(msg.events);
        });

        OWF.notifyWidgetReady();
    });
}