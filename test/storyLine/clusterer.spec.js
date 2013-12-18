describe("Testing whether the StoryLine widget", function() {

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
		var areas = clusterer.jenks([10, 20, 30, 40, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 70, 80, 90, 100]);
		expect(areas).toEqual([
			{start: 10,	end: 50, entries: 5, scale: 1},
			{start: 50, end: 60, entries: 11, scale: 10},
			{start: 60, end: 100, entries: 5, scale: 1}
		]);

		// Tightly packed points AT THE START of an otherwise completely uniform distribution.
		var areas = clusterer.jenks([50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 70, 80, 90, 100]);
		expect(areas).toEqual([
			{start: 50, end: 60, entries: 11, scale: 10},
			{start: 60, end: 100, entries: 5, scale: 1}
		]);

		// Tightly packed points AT THE END of an otherwise completely uniform distribution.
		var areas = clusterer.jenks([10, 20, 30, 40, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60]);
		expect(areas).toEqual([
			{start: 10,	end: 50, entries: 5, scale: 1},
			{start: 50, end: 60, entries: 11, scale: 10},
		]);

		// WITH NOISE.  Tightly packed points in the middle of a MOSTLY uniform distribution.
		var areas = clusterer.jenks([10, 21, 30, 42, 50, 51.1, 52, 53.2, 54.1, 55.3, 56.1, 57, 58.2, 59.1, 60, 72, 81, 90, 100]);
		expect(areas).toEqual([
			{start: 10,	end: 50, entries: 5, scale: 1},
			{start: 50, end: 60, entries: 11, scale: 10},
			{start: 60, end: 100, entries: 5, scale: 1}
		]);

		// BIG DATA SET.  Tightly packed points in the middle of an otherwise completely uniform distribution.
		// 10, 20, 30, ... 100, 100.1, 100.2, 100.3, ... 109.9, 110, 120, 130, ... 990, 1000
		var dataPoints = [];
		var i;
		for (i = 10; i <= 1000; i += 10) {
			dataPoints.push(i);
		}
		for (i = 100.1; i < 110; i += 0.1) {
			dataPoints.push(i);
		}
		var areas = clusterer.jenks(dataPoints);
		expect(areas).toEqual([
			{start: 10,	end: 70, entries: 7, scale: 1},
			{start: 70, end: 160, entries: 110, scale: 12.11111111111111},
			{start: 160, end: 1000, entries: 85, scale: 1}
		]);
	});

	it('discards a cluster as not valuable enough', function() {
		// Mostly uniform distribution.  Not worth clustering.
		var areas = clusterer.jenks([10, 21, 30, 42, 50, 51, 60, 72, 81, 90, 100]);
		expect(areas).toEqual([
			{start: 10,	end: 100, entries: 11, scale: 1}
		]);

		// Completely uniform distribution.  Don't cluster.  Don't choke.
		var areas = clusterer.jenks([10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
		expect(areas).toEqual([
			{start: 10, end: 100, entries: 10, scale: 1}
		]);
	});

	it('finds the best cluster of multiple possibilities', function() {
		// With one far outlier, could cluster around tightly coupled grpoup or couple around everything but the outlier.
		// Should choose everything but the outlier
		var areas = clusterer.jenks([10, 20, 30, 40, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 70, 80, 90, 100, 250]);
		expect(areas).toEqual([
			{start: 10, end: 40, entries: 4, scale: 1},
			{start: 40, end: 70, entries: 13, scale: 4},
			{start: 70, end: 250, entries: 5, scale: 1}
		]);
	});

	it('handles small number of points', function() {
		// barely enough points to cluster
		var areas = clusterer.jenks([1, 2, 3, 100]);
		expect(areas).toEqual([
			{start: 1, end: 100, entries: 4, scale: 1}
		]);

		// too few points
		var areas = clusterer.jenks([1, 2, 100]);
		expect(areas).toEqual([
			{start: 1, end: 100, entries: 3, scale: 1}
		]);

	});

});