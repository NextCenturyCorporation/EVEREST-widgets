var textParseDisplayWidget = {
	execute: function(alphaReportChannel) {
		var textParseDisplayObject = new textParseDisplay();

		textParseDisplayObject.execute();

		if(typeof(OWF.Eventing.subscribe) !== 'undefined') {
			OWF.Eventing.subscribe(alphaReportChannel, function(sender, msg){
				var data = JSON.parse(msg).data;
				textParseDisplayObject.handleReceiveAlphaReportData(data._id);
			});
		}
	}
};