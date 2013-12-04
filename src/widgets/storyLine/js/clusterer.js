var clusterer = clusterer || {};

(function() {

	clusterer.cluster = function(dataPoints) {
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
		alert("old = " + (variance1/range1) + ", new = " + (variance2/range2) + ", ratio=" + improvement*100 + "%");
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