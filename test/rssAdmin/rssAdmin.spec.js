describe("To test the RSS Feed Admin widget", function() {
	var admin_widget;
	beforeEach(function() {
		$("body").append('<div id="feed-rows"></div>');
	});

	afterEach(function() {
		$("#feed-rows").remove();
	});

	describe('with no key defined', function() {
		beforeEach(function() {
			/*spyOn($, 'ajax').andCallFake(function(data_object) {
				data_object.success({});
			});*/
			spyOn($, 'ajax').andCallFake(function (req) {
			    var d = $.Deferred();
			    d.resolve({});
			    return d.promise();
			});
			rssAdmin = new rssAtomAdmin();
		});

		it('check for correct fields on itialization with no key', function() {
			expect($("#feed-rows").length).toBe(1);
			rssAdmin.execute();
			expect($(".row").length).toBe(1);

			rssAdmin.addFieldHandler();
			expect($(".row").length).toBe(2);

			rssAdmin.addFieldHandler();
			expect($(".row").length).toBe(3);

			rssAdmin.addFieldHandler();
			expect($(".row").length).toBe(4);

			rssAdmin.addFieldHandler();
			expect($(".row").length).toBe(5);
		});			
	});
});