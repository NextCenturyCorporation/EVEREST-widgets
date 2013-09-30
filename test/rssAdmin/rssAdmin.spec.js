describe("To test the RSS Feed Admin widget", function() {
	var admin_widget;
	beforeEach(function() {
		$("body").append('<div id="feed-rows"></div>');
	});

	afterEach(function() {
		$("#feed-rows").remove();
	});

	describe('with no feeds defined', function() {
		beforeEach(function() {
			spyOn($, 'ajax').andCallFake(function (req) {
			    var d = $.Deferred();
			    d.resolve({});
			    return d.promise();
			});
			rssAdmin = new rssAtomAdmin();
		});

		it('check that you can add and remove rows correctly', function() {
			spyOn(rssAdmin, 'addFieldHandler').andCallThrough();
			
			expect($("#feed-rows").length).toBe(1);
			rssAdmin.execute();
			expect($(".row").length).toBe(1);
			rssAdmin.addFieldHandler();
			expect($(".row").length).toBe(2);
			rssAdmin.addFieldHandler();
			expect($(".row").length).toBe(3);
			rssAdmin.addFieldHandler();
			expect($(".row").length).toBe(4);
			rssAdmin.addFieldHandler("http://www.reddit.com/new.rss", 500, true, 8675309);
			expect($(".row").length).toBe(5);
			$(":contains('Action'):last").click();
			$(":contains('Remove'):last").click();
			expect($(".row").length).toBe(4);
			//This is performed twice to verify that the final row cannot be removed.
			$(":contains('Action'):last").click();
			$(":contains('Remove'):last").click();
			expect($(".row").length).toBe(4);
			expect(rssAdmin.addFieldHandler).toHaveBeenCalled();
		});			

		it('check that you can create and Remove RSS feeds correctly', function() {
			spyOn(rssAdmin, 'addFieldHandler').andCallThrough();
			spyOn(rssAdmin, 'changeCSSGreen').andCallThrough();
			spyOn(rssAdmin, 'toggleStartStop').andCallThrough();
			spyOn(rssAdmin, 'changeCSSWhite').andCallThrough();

			expect($("#feed-rows").length).toBe(1);
			rssAdmin.execute();
			expect($(".row").length).toBe(1);
			rssAdmin.addFieldHandler("http://feeds.reuters.com/news/artsculture", 1000, true, 8675309);
			$(":contains('Action'):last").click();
			$(":contains('Create and Start Feed'):last").click();
			expect($(".row").length).toBe(2);
			$(":contains('Action'):last").click();
			$(":contains('Start Feed'):last").click();
			$(":contains('Stop Feed'):last").click();
			$(":contains('Action'):last").click();
			$(":contains('Remove'):last").click();
			expect($(".row").length).toBe(2);
			rssAdmin.addFieldHandler("reddit.com/new.rss", 1000, true, 8675309);
			expect($(".row").length).toBe(3);
			$(":contains('Action'):last").click();
			$(":contains('Create and Start Feed'):last").click();
			$(":contains('Action'):last").click();
			$(":contains('Remove'):last").click();
			expect(rssAdmin.changeCSSWhite).toHaveBeenCalled();
			expect(rssAdmin.changeCSSGreen).toHaveBeenCalled();
			expect(rssAdmin.addFieldHandler).toHaveBeenCalled();
			expect(rssAdmin.toggleStartStop).toHaveBeenCalled();
		});			
	});
});