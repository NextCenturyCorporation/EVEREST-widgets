var assertionFeed = {};
var url = 'http://everest-build:8081/assertions';

assertionFeed.updateFeed = function(ent1, rel, ent2) {
	var data = {
		"entity1": ent1.value,
		"relationship": rel.value,
		"entity2": ent2.value
	};

	OWF.Eventing.publish("com.nextcentury.everest.assertion_announcing.assertions", data);

};
