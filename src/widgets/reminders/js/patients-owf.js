if(OWF.Util.isRunningInOWF()) {

    app.router.route('patient/:id', 'sendPatient', function(patientId) {
		var patient = app.patients.get(patientId);
		OWF.ready(function () {
			OWF.Eventing.publish('com.nextcentury.everest.reminders.sendPatient', patient.toJSON());
			var configs = { eraseData: true, setDeduceLayout: false };
            if (patient.get('name') === 'Bob Smith') {
				data.configs = configs;
				OWF.Eventing.publish('com.nextcentury.everest.storyLine.events', JSON.stringify(data));
			} else {
				OWF.Eventing.publish('com.nextcentury.everest.storyLine.events', JSON.stringify({ configs: configs }));
            }
		});
    });
}
