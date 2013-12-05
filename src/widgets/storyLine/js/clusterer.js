var clusterer = clusterer || {};

(function() {

	clusterer.cluster1 = function(dataPoints) {
		// A hard coded case for testing.  Assumes three points in April at start, and as more points are
		// added they are added to January.  So recommends zooming out April if there are less than three
		// points or zooming out January if there are more than 6 points.
		return (dataPoints.length <7 ?
			[{
				start: Date.parse("Apr 10 2013 00:00:00 GMT"),
				end: Date.parse("Apr 16 2013 00:00:00 GMT"),
				entries: 3,
				scale: 40
			}] :
			[{
				start: Date.parse("Jan 1 2013 00:00:00 GMT"),
				end: Date.parse("Feb 1 2013 00:00:00 GMT"),
				entries: dataPoints.length-3,
				scale: 40
			}]);
	}

	/**
	* Analyzes a set of data points and finds inherent clusters of data.  Then 
	* calculates how to scale those clusters so that the whole distribution appears
	* more even
	* @param dataPoints an array of numbers
	* @return an array of areas describing how to scale the range each range.  The areas cover
	*	the entire range of data points, so if the data is completely uniform this will return an array
	*	with a single area going from the first data point to the last with scale=1.  If the data is mostly
	*	uniform with a bunch in the middle that is very tightly packed, this will return three areas: one for the 
	*	tightly packed group in the middle - it will have a high scale, and two for the areas on either side and they
	*	will have scale=1.
	*	Is of the form:
	*	[{
	*		start: starting point of the range
	*		end: ending point of the range
	*		entries: number of data points that fall in that range
	*		scale: how much to scale this section to make the whole thing look uniform
	*	}, ...]
	*/
	clusterer.cluster = function(dataPoints) {
		// This is a VERY crude clusterer.  It can only find one section of points packed more
		// closely than the rest and is very inflexible in choosing the borders of that set and 
		// very susceptible to noise.  Really this should use a real segmentation algorithm (clustering in 1D is
		// called segmentation or natural break analysis) that iteratively adjusts the boundaries of the segments
		// until a best case is found.

		// Basically, this algorithm computes the average distance between points, finds the largest group of consecutive
		// points that are all closer than average, and marks that as a segment.  It can only find one segment.
		var sortedData = dataPoints.sort(function(a,b){return a-b});

		// Doesn't make sense to cluster 3 or fewer points.
		if (sortedData.length <= 3) {
			return [{
				start: sortedData[0],
				end: sortedData[sortedData.length-1],
				entries: sortedData.length,
				scale: 1
			}];
		}
		// Determine the average distance between the numbers.
		var meanDist = (sortedData[sortedData.length-1]-sortedData[0])/(sortedData.length-1);

		// Run through the numbers again finding the biggest stretch of numbers packed more closely than the average distance.
		var bigStretchStart = -1;
		var bigStretchEnd = -1;
		var bigStretchLength = 0;
		var currentStretchStart = -1;
		for(i=1; i<sortedData.length; ++i) {
			if ((sortedData[i]-sortedData[i-1]) < meanDist) {
				if (currentStretchStart == -1) {
					// Start a new stretch.
					currentStretchStart = i-1;
				}
			}
			else {
				if (currentStretchStart != -1) {
					// End of a stretch.  See if it is bigger than the biggest stretch
					if ((i-1-currentStretchStart) > bigStretchLength) {
						bigStretchStart = currentStretchStart;
						bigStretchEnd = i-1;
						bigStretchLength = bigStretchEnd-bigStretchStart+1;
						currentStretchStart = -1;
					}
				}
			}
		}
		// See if the list ended in the biggest stretch.		
		if ((currentStretchStart != -1) && ((sortedData.length-1-currentStretchStart) > bigStretchLength)) {
			bigStretchStart = currentStretchStart;
			bigStretchEnd = sortedData.length-1;
			bigStretchLength = bigStretchEnd-bigStretchStart+1;
		}

		// We can't do anything if the data is perfectly distributed.  If no stretch was found abort.
		if (bigStretchStart == -1) {
				return [{
				start: sortedData[0],
				end: sortedData[sortedData.length-1],
				entries: sortedData.length,
				scale: 1
			}];
		}

		// Now we have a candidate stretch.  Compute how much we would scale the stretch by.  To do that, we need the average distance between numbers within
		// the stretch.
		var meanDistInStretch = (sortedData[bigStretchEnd]-sortedData[bigStretchStart])/(bigStretchLength-1);
		var meanDistOutOfStretch = (meanDist*(sortedData.length-1) - meanDistInStretch*(bigStretchLength-1))/(sortedData.length-bigStretchLength);
		var scale = meanDistOutOfStretch/meanDistInStretch;

		var areas = [];
		if (bigStretchStart > 0) {
			areas.push({
				start: sortedData[0],
				end: sortedData[bigStretchStart-1],
				entries: bigStretchStart,
				scale: 1
			});
		}
		areas.push({
			start: sortedData[bigStretchStart],
			end: sortedData[bigStretchEnd],
			entries: bigStretchLength,
			scale: scale
		});
		if (bigStretchEnd < sortedData.length-1) {
			areas.push({
				start: sortedData[bigStretchEnd+1],
				end: sortedData[sortedData.length-1],
				entries: sortedData.length-1-bigStretchEnd,
				scale: 1
			});		
		}

		// See if expanding this section would improve the distribution by 30% or more - otherwise it's not worth it.
		// To do this we compare the ratio of variance to range of the two distributions.
		var range1 = sortedData[sortedData.length-1]-sortedData[0];
		var range2 = range1 + scale*(sortedData[bigStretchEnd]-sortedData[bigStretchStart]);
		var variance1 = 0;
		var variance2 = 0;
		for (i=1; i<sortedData.length; ++i) {
			var dist = sortedData[i]-sortedData[i-1];
			variance1 += Math.pow(dist-meanDist, 2);
			if ((i > bigStretchStart) && (i <= bigStretchEnd)) {
				variance2 += Math.pow(scale*dist - meanDist,2);
			}
			else {
				variance2 += Math.pow(dist-meanDist, 2);
			}
		}
		variance1 = Math.sqrt(variance1/(sortedData.length-1));
		variance2 = Math.sqrt(variance2/(sortedData.length-1));
	
		var improvement = (variance2/range2)/(variance1/range1);
		if (improvement > 0.7) {
			// Not good enough improvement.  Don't bother.
			areas=[{
				start: sortedData[0],
				end: sortedData[sortedData.length-1],
				entries: sortedData.length,
				scale: 1
			}];
		}

		return areas;
	}
}());