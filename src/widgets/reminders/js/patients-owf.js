if(OWF.Util.isRunningInOWF()) {

    app.router.route('patient/:id', 'sendPatient', function(patientId) {
        app.reminders.fetch({
    		success: function(){
    			var patient = app.patients.get(patientId);
        		OWF.ready(function () {
        			OWF.Eventing.publish('com.nextcentury.everest.reminders.sendPatient', patient.toJSON());
        			//OWF.Eventing.publish('com.nextcentury.everest.storyLine.events', message);
        		});
    		}
    	});
    });
}
