if(OWF.Util.isRunningInOWF()) {

    app.router.route('patient/:id', 'sendPatient', function(patientId) {
		var patient = app.patients.get(patientId);
		OWF.ready(function () {
			OWF.Eventing.publish('com.nextcentury.everest.reminders.sendPatient', patient.toJSON());
			//OWF.Eventing.publish('com.nextcentury.everest.storyLine.events', message);

            if (patient.get('name') === 'Bob Smith') {
                $.getJSON('cubism.js', function(json){
                    console.log(json);
                    OWF.Eventing.publish('com.nextcentury.everest.storyLine.events', json);
                });
            }
		});
    });
}
