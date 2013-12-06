if(OWF.Util.isRunningInOWF()) {

    OWF.ready(function() {
        OWF.Eventing.subscribe('com.nextcentury.everest.reminders.sendPatient', function (sender, msg, channel) {
            app.plotReminders();
        });

        OWF.Eventing.subscribe('com.nextcentury.everest.storyLine.events', function (sender, msg, channel) {
        	console.log(msg);
            app.addReminders(msg);
        });

        OWF.notifyWidgetReady();
    });
}
