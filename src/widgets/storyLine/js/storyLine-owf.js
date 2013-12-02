if(OWF.Util.isRunningInOWF()) {

    OWF.ready(function() {
        OWF.Eventing.subscribe('com.nextcentury.everest.storyLine.events', function (sender, msg, channel) {
        	app.clearEvents();
            app.addEvents(msg.events);
        });

        OWF.notifyWidgetReady();
    });
}