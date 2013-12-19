if(OWF.Util.isRunningInOWF()) {

    app.router.route('patient/:id', 'sendPatient', function(patientId) {
		var patient = app.patients.get(patientId);
		OWF.ready(function () {
			OWF.Eventing.publish('com.nextcentury.everest.reminders.sendPatient', patient.toJSON());
            if (patient.get('name') === 'Bob Smith') {
				data.eraseData = true;
				OWF.Eventing.publish('com.nextcentury.everest.storyLine.events', JSON.stringify(data));
			} else {
				OWF.Eventing.publish('com.nextcentury.everest.storyLine.events', JSON.stringify({eraseData: true}));
            }
		});
    });
}
