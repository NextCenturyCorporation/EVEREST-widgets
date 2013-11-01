if(OWF.Util.isRunningInOWF()) {

    OWF.ready(function() {
        OWF.Eventing.subscribe('com.nextcentury.everest.reminders.sendPatient', function (sender, msg, channel) {
            app.patient.set(msg);
            app.showReminderList();
        });

        OWF.notifyWidgetReady();
    });
}