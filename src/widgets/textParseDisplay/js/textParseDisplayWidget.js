var textParseDisplayWidget = {
	execute: function() {
		var alphaReportChannel = "com.nextcentury.everest.data_table_announce.alpha-report";
		var textParseDisplayObject = new textParseDisplay();

		textParseDisplayObject.execute();

		if(typeof(OWF.Eventing.subscribe) !== 'undefined') {
			OWF.Eventing.subscribe(alphaReportChannel, function(sender, msg){
				console.log(msg);
				var data = JSON.parse(msg).data;
				textParseDisplayObject.handleReceiveAlphaReportData(data._id);
			});
		}
	}
};