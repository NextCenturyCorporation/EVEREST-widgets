describe("To test the RSS Feed Admin widget", function() {
	var admin_widget;
	beforeEach(function() {
		$("body").append('<div class="twitter_admin_container"></div>');
	});

	afterEach(function() {
		$(".twitter_admin_container").remove();
	});
	describe('with no key defined', function() {
		beforeEach(function() {
			spyOn($, 'ajax').andCallFake(function(data_object) {
				data_object.success({});
			});
			admin_widget = new twitter_admin();
		});

		it('check for correct fields on itialization with no key', function() {
			expect($(".twitter_admin_container").length).toBe(1);
			admin_widget.execute();
			expect($(".api_key_container_block").length).toBe(0);
		});			
	});
});