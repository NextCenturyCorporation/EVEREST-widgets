describe("To test the StoryLine widget", function() {
	var admin_widget;

	beforeEach(function() {
		$("body").append('<div id="tline"></div>');
		app.initialize();
	});

	afterEach(function() {
		$("#tline").remove();
	});

	it('displays a storyline', function() {
		// To test if a storyline is displayed we look in the DOM for the dates that appear in the timeline labels.
		// Should have instances of different years and months.
		expect($(".timeline-date-label:contains('2013')").length).toBeGreaterThan(0);
		expect($(".timeline-date-label:contains('Mar')").length).toBeGreaterThan(0);
	});

	it('displays data points in the storyline', function() {
		// Pass in an array of data points and verify they are displayed.  
		// We verify they are displayed by looking for their label in the DOM.
		expect($(".timeline-event-label:contains('Second Event')").length).toBe(0);
		app.addEvents([
	        {
	          start: "Apr 14 2013 00:00:00 GMT",
	          title: "First Event"
	        },     
	        {
	          start: "Apr 12 2013 00:00:00 GMT",
	          title: "Second Event"
	        },
	        {
	          start: "Apr 13 2013 00:00:00 GMT",
	          title: "Third Event"
	        }
	    ]);
		expect($(".timeline-event-label:contains('Second Event')").length).toBe(1);		

		// Do the same thing but passing in one data point at a time.
		// When we check make sure that not only are the new data points displayed, but the
		// existing data points are still displayed.
		app.addEvents({
	        start: "Apr 1 2013 00:00:00 GMT",
	        title: "Fourth Event"
	    });
		app.addEvents({
	        start: "Apr 24 2013 00:00:00 GMT",
	        title: "Fifth Event"
	    });
		expect($(".timeline-event-label:contains('Fourth Event')").length).toBe(1);
		// And verify old events were not wiped out.
		expect($(".timeline-event-label:contains('Second Event')").length).toBe(1);		
	});

	it('can clear out past data points', function() {
		// Pass in some data point and then clear the timeline.
		// Verify that the data points are no longer displayed.
		// Verify that new data points do get displayed.
		app.addEvents({
          start: "Apr 14 2013 00:00:00 GMT",
          title: "Old First Event"
	    });
		app.addEvents({
          start: "Apr 13 2013 00:00:00 GMT",
          title: "Old Second Event"
	    });
	    app.clearEvents();
		app.addEvents({
          start: "Apr 12 2013 00:00:00 GMT",
          title: "New First Event"
	    });
		expect($(".timeline-event-label:contains('Old First Event')").length).toBe(0);
		expect($(".timeline-event-label:contains('Old Second Event')").length).toBe(0);
		expect($(".timeline-event-label:contains('New First Event')").length).toBe(1);		
	});

	it('can change layout', function() {
		// Change the bottom of the timeline so it displays decades not years, and 
		// verify the labels on the timeline have changed.
	    expect($(".timeline-date-label:contains('2013')").length).toBe(2);
		expect($(".timeline-date-label:contains('2050')").length).toBe(0);
	    var bandInfo = [{
		      width: "50%",
		      intervalUnit: Timeline.DateTime.MONTH,
		      intervalPixels: 75,
		    },
		    {
		      width: "50%",
		      intervalUnit: Timeline.DateTime.DECADE,
		      intervalPixels: 200,
		      highlight: true,
		      overview: true
	    }];
	    app.changeLayout(bandInfo);
	    expect($(".timeline-date-label:contains('2013')").length).toBe(1); // 1 because 2013 still appears in the top month scale
		expect($(".timeline-date-label:contains('2050')").length).toBeGreaterThan(0);
	});
});