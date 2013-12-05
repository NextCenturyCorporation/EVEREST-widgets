if(OWF.Util.isRunningInOWF()) {

    app.router.route('patient/:id', 'sendPatient', function(patientId) {
		var patient = app.patients.get(patientId);
		OWF.ready(function () {
			OWF.Eventing.publish('com.nextcentury.everest.reminders.sendPatient', patient.toJSON());
			//OWF.Eventing.publish('com.nextcentury.everest.storyLine.events', message);
		console.log(patient.get('name') === "Bob Smith");
            if (patient.get('name') === 'Bob Smith') {
		console.log(data);
                OWF.Eventing.publish('com.nextcentury.everest.storyLine.events', data);
            }
		});
    });
}
