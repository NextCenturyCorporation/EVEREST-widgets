describe("To test the StoryLine widget", function() {

	beforeEach(function() {
		// We have to have this in here, due to poor design in the timeline.
		// If you include the timeline file and don't instantiate one you get an error.
		$("body").append('<div id="tline"></div>');
		app.initialize();
	});

	afterEach(function() {
	});

	it('finds a cluster', function() {
		// Tightly packed points in the middle of an otherwise completely uniform distribution.
		var areas = clusterer.cluster([10, 20, 30, 40, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 70, 80, 90, 100]);
		expect(areas).toEqual([
			{start: 10,	end: 40, entries: 4, scale: 1},
			{start: 50, end: 60, entries: 11, scale: 10},
			{start: 70, end: 100, entries: 4, scale: 1}
		]);

		// Tightly packed points AT THE START of an otherwise completely uniform distribution.
		var areas = clusterer.cluster([50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 70, 80, 90, 100]);
		expect(areas).toEqual([
			{start: 50, end: 60, entries: 11, scale: 10},
			{start: 70, end: 100, entries: 4, scale: 1}
		]);

		// Tightly packed points AT THE END of an otherwise completely uniform distribution.
		var areas = clusterer.cluster([10, 20, 30, 40, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60]);
		expect(areas).toEqual([
			{start: 10,	end: 40, entries: 4, scale: 1},
			{start: 50, end: 60, entries: 11, scale: 10},
		]);

		// WITH NOISE.  Tightly packed points in the middle of a MOSTLY uniform distribution.
		var areas = clusterer.cluster([10, 21, 30, 42, 50, 51.1, 52, 53.2, 54.1, 55.3, 56.1, 57, 58.2, 59.1, 60, 72, 81, 90, 100]);
		expect(areas).toEqual([
			{start: 10,	end: 42, entries: 4, scale: 1},
			{start: 50, end: 60, entries: 11, scale: 10},
			{start: 72, end: 100, entries: 4, scale: 1}
		]);
	});

	it('discards a cluster as not valuable enough', function() {
		// Mostly uniform distribution.  Not worth clustering.
		var areas = clusterer.cluster([10, 21, 30, 42, 50, 51, 60, 72, 81, 90, 100]);
		expect(areas).toEqual([
			{start: 10,	end: 100, entries: 11, scale: 1}
		]);

		// Completely uniform distribution.  Don't cluster.  Don't choke.
		var areas = clusterer.cluster([10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
		expect(areas).toEqual([
			{start: 10, end: 100, entries: 10, scale: 1}
		]);
	});

	it('finds the best cluster of multiple possibilities', function() {
		// With one far outlier, could cluster around tightly coupled grpoup or couple around everything but the outlier.
		// Should choose everything but the outlier
		var areas = clusterer.cluster([10, 20, 30, 40, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 70, 80, 90, 100, 250]);
		expect(areas).toEqual([
			{start: 10, end: 100, entries: 19, scale: 30},
			{start: 250, end: 250, entries: 1, scale: 1}
		]);
	});

	it('handles small number of points', function() {
		// barely enough points to cluster
		var areas = clusterer.cluster([1, 2, 3, 100]);
		expect(areas).toEqual([
			{start: 1,	end: 3, entries: 3, scale: 97},
			{start: 100, end: 100, entries: 1, scale: 1}

		]);

		// too few points
		var areas = clusterer.cluster([1, 2, 100]);
		expect(areas).toEqual([
			{start: 1,	end: 100, entries: 3, scale: 1}
		]);

	});

});