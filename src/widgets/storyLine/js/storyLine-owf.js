if(OWF.Util.isRunningInOWF()) {

    OWF.ready(function() {
        OWF.Eventing.subscribe('com.nextcentury.everest.storyLine.events', function (sender, msg, channel) {
        	var message = JSON.parse(msg);
        	if(message.events){
	        	var events = message.events;
	            app.addEvents(events);
        	}

        	if(message.configs){
        		var configs = message.configs;

        		if(configs.bandInfos){
        			app.changeLayout(configs.bandInfos);
        		}
        		//app.changeLayout(configs);
        	}

        });

        OWF.notifyWidgetReady();
    });
}