if(OWF.Util.isRunningInOWF()) {

    OWF.ready(function() {
        OWF.Eventing.subscribe('com.nextcentury.everest.storyLine.events', function (sender, msg, channel) {
        	var events = JSON.parse(msg);
            app.addEvents(events);
        });

        OWF.notifyWidgetReady();
    });
}