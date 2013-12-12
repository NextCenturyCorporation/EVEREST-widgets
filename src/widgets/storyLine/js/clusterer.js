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
    };

    /**
    * Analyzes a set of data points and finds inherent clusters of data.  Then 
    * calculates how to scale those clusters so that the whole distribution appears
    * more even
    * @param dataPoints an array of numbers
    * @return an array of areas describing how to scale the range each range.  The areas cover
    *   the entire range of data points, so if the data is completely uniform this will return an array
    *   with a single area going from the first data point to the last with scale=1.  If the data is mostly
    *   uniform with a bunch in the middle that is very tightly packed, this will return three areas: one for the 
    *   tightly packed group in the middle - it will have a high scale, and two for the areas on either side and they
    *   will have scale=1.
    *   Is of the form:
    *   [{
    *       start: starting point of the range
    *       end: ending point of the range
    *       entries: number of data points that fall in that range
    *       scale: how much to scale this section to make the whole thing look uniform
    *   }, ...]
    */
    clusterer.cluster = function(dataPoints) {
        // This is a VERY crude clusterer.  It can only find one section of points packed more
        // closely than the rest and is very inflexible in choosing the borders of that set and 
        // very susceptible to noise.  Really this should use a real segmentation algorithm (clustering in 1D is
        // called segmentation or natural break analysis) that iteratively adjusts the boundaries of the segments
        // until a best case is found.

        // Basically, this algorithm computes the average distance between points, finds the largest group of consecutive
        // points that are all closer than average, and marks that as a segment.  It can only find one segment.
        var sortedData = dataPoints.sort(function(a,b){return a-b;});

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
        for(var i=1; i<sortedData.length; ++i) {
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
    };

    /**
    * This function analyzes a set of data points and finds
    * inherent clusters of data and calculates how to scale those clusters
    * such that the whole distribution appears more even.
    * Under the hood, this function uses
    * the Jenks Natural Breaks Optimization algorithm
    * (http://en.wikipedia.org/wiki/Jenks_natural_breaks_optimization)
    * to achieve its ends.
    * This algorithm partitions the data points into classes such that
    * the variance within classes is minimized and
    * the variance between classes is maximized.
    * In general, the more classes you use, the better the clusters will fit
    * the data points.
    * Since a large number of classes will take a long time to compute,
    * this function requires you to specify a maximum number of classes.
    * To avoid over-fitting the data points, this function finds the best
    * number of classes to use based upon a simple heuristic.
    * It increases the number of classes until the the improvement of
    * the variance between classes is less than 10%.
    * To avoid warping the time scale unnecessarily, this function rounds all
    * scaling factors less than 1.5 down to 1.
    * @param dataPoints an array of numbers
    * @param maxClasses the maxium number of classes to use
    * @return an array of clusters.
    *         Each cluster has a range, a number of entries, and
    *         a scaling factor.
    *         The clusters cover the entire range of the data points,
    *         so if the data is completely uniform, this will return an array
    *         with a single cluster going from the first data point to the last
    *         with a scaling factor of 1.
    *         If the data is mostly uniform with a bunch in the middle that is
    *         very tightly packed, this will return three clusters:
    *         one for the tightly packed group in the middle with
    *         a scaling factor of 1.5 or higher and two for the "clusters"
    *         on either side with a scaling factor of 1.
    *         The array of clusters is of the form:
    *         [
    *             {
    *                 start: starting point of the range,
    *                 end: ending point of the range,
    *                 entries: number of data points that fall in that range,
    *                 scale: how much to scale this section to make the whole distribution look uniform
    *             },
    *             ...
    *         ]
    */
    clusterer.jenks = function(dataPoints, maxClasses) {

        //----------------------------------------------------
        // NOTE: The following code is based upon the work of
        // Tom MacWright (tom@macwright.org).
        // You can find the original code at...
        // https://github.com/tmcw/simple-statistics
        //----------------------------------------------------
        // References:
        //     - Jenks natural breaks optimization (http://en.wikipedia.org/wiki/Jenks_natural_breaks_optimization)
        //     - On Grouping For Maximum Homogeneity (http://www.csiss.org/SPACE/workshops/2004/SAC/files/fisher.pdf)
        //         - by Walter D. Fisher
        //         - It's a dynamic programming approach (or "sub-optimization"
        //           in Fisher's words) that aims to solve for increasing
        //           numbers of classes by first splitting the work into
        //           two classes and then sub-diving until the desired
        //           number of classes is found.
        // Reference Implementations:
        //     - Python (http://danieljlewis.org/files/2010/06/Jenks.pdf)
        //     - Buggy JavaScript (https://github.com/vvoovv/djeo-jenks/blob/master/main.js)
        //     - Working JavaScript (https://github.com/simogeo/geostats/blob/master/lib/geostats.js#L407)

        /*      *\
        | Locals |
        \*      */

        // the same as dataPoints but... sorted!
        var sortedDataPoints;
        // the number of data points
        var numDataPoints;
        // the universal cluster
        // (This is the default return value if the data cannot be clustered.
        //  The universal cluster simply puts all of the data points
        //  into a single cluster of scale 1.)
        var universalCluster;
        // the matrices (2D arrays) returned from the jenk matrices function
        var matrices;
        // a matrix (2D array) representing the optimal lower class limits
        var lowerClassLimits;
        // a matrix (2D array) representing the optimal variance combinations
        // for all classes
        var variances;
        // the best number of classes
        var bestNumberOfClasses;
        // an array containing the start and end values for all the classes
        // (For example, if the class intervals were [0, 50] and [50, 100],
        //  the array would be [0, 50, 100].)
        var breaks;
        // the clusters
        // (This is the return value if the data can be clustered.)
        var clusters;
        // a function which returns...
        // (1) a matrix (2D array) representing
        //     the optimal lower class limits
        // (2) a matrix (2D array) representing
        //     the optimal variance combinations for all classes
        var jenksMatrices;
        // a function which takes...
        // - a matrix (2D array) representing
        //   the optimal variance combinations for all classes
        // and returns...
        // - the best number of classes
        //   (Looks at the rate of change of the variance with respect to
        //    the number of classes.
        //    Stops when the improvement (i.e. decrease) in variance is
        //    less than 10%.)
        var findBestNumberOfClasses;
        // a function which takes...
        // (1) a matrix (2D array) representing
        //     the optimal lower class limits
        // (2) a number of classes which does not exceed
        //     the maximum number of classes
        // and returns...
        // - an array containing the start and end values for all the classes
        //   (For example, if the class intervals were [0, 50] and [50, 100],
        //    the array would be [0, 50, 100].)
        var jenksBreaks;
        // a function which takes...
        // - an array containing the start and end values for all the classes
        //   (For example, if the class intervals were [0, 50] and [50, 100],
        //    the array would be [0, 50, 100].)
        // and returns...
        // - an array of clusters
        var jenksBreaksToClusters;

        /*          *\
        | End Locals |
        \*          */

        // Before we do anything else...
        // (1) create a safe copy of the data points
        // (2) sort the data points
        sortedDataPoints = dataPoints.slice().sort(function(a, b) {
            return a - b;
        });
        // Grab the number of data points.
        numDataPoints = sortedDataPoints.length;
        // Create the universal cluster in case we need it.
        universalCluster = [{
            start: sortedDataPoints[0],
            end: sortedDataPoints[numDataPoints - 1],
            entries: numDataPoints,
            scale: 1
        }];
        // The maximum number of classes is greater than
        // the number of data points?
        //-----------------------------------------------------------
        // TODO: Determine whether it's the number of data points
        // that matters or if it's the number of unique data points.
        //-----------------------------------------------------------
        if (maxClasses > numDataPoints) {
            // Adjust the maximum number classes.
            maxClasses = numDataPoints;
        }
        // The maximum number of classes is less than 2?
        if (maxClasses < 2) {
            // It makes no sense to cluster the data points.
            // Instead, return the universal cluster.
            return universalCluster;
        }

        /*        *\
        | Closures |
        \*        */

        // Define the jenks matrices function.
        jenksMatrices = function() {
            /*      *\
            | Locals |
            \*      */
            // loop counters
            var i, j, k;
            // a matrix (2D array) representing the optimal lower class limits
            var lowerClassLimits;
            // a matrix (2D array) representing the optimal
            // variance combinations for all classes
            var variances;
            // temporary arrays used to create the second dimension of
            // the lower class limits and variances matrices
            var temp1;
            var temp2;
            // the variance as computed at each step in the calculation
            var variance;
            // the current index into the sorted data points
            var index;
            // the current value from the sorted data points
            var value;
            // the number of data points considered so far.
            // (Technically, this is a "weighting factor",
            //  but, in this implementation,
            //  all data points have the same weight: 1.)
            var weightingFactor;
            // the sum of the values seen thus far when calculating the variance
            var sum;
            // the sum of the squares of the values seen thus far
            var sumOfSquares;
            // the variance we would have if we created a new group
            // at this point
            var potentialVariance;
            /*          *\
            | End Locals |
            \*          */
            // Create the first dimension of
            // the lower class limits and variances matrices.
            lowerClassLimits = [];
            variances = [];
            // Create the second dimension of
            // the lower class limits and variances matrices,
            // filling each matrix cell with 0.
            // (Despite these matrices having the same values, we need
            //  to keep them separate so that changing one does not change
            //  the other.)
            for (i = 0; i < numDataPoints; i++) {
                temp1 = [];
                temp2 = [];
                for (j = 0; j < maxClasses; j++) {
                    temp1.push(0);
                    temp2.push(0);
                }
                lowerClassLimits.push(temp1);
                variances.push(temp2);
            }
            // Start the potential variances at infinity, since any
            // candidate for a new variance in the matrix will be better
            // than infinity.
            // In the original FORTRAN implementation, 9999999 was used,
            // but since Javascript has Infinity, we will use that instead.
            for (i = 0; i < maxClasses; i++) {
                for (j = 1; j < numDataPoints; j++) {
                    variances[j][i] = Infinity;
                }
            }
            // Compute the lower class limits and variances.
            // The Fisher paper refers to the dimension of the data as K
            // and number of groups as G.
            // This has three loops:
            //     for (i) // each data point
            //         for (j) // each index from 1 to i
            //             for (k) // each potential class break point
            for (i = 1; i < numDataPoints; i++) {
                // Reset...
                // (1) the weighting factor
                // (2) the sum
                // (3) the sum of squares
                // (4) the potential variance
                weightingFactor = 0;
                sum = 0;
                sumOfSquares = 0;
                potentialVariance = 0;
                // The value of j iterates in the interval [0, i].
                for (j = 0; j < i + 1; j++) {
                    // Grab the index and the value.
                    index = i - j;
                    value = sortedDataPoints[index];
                    // Update...
                    // (1) the weighting factor
                    // (2) the sum
                    // (3) the sum of squares
                    weightingFactor++;
                    sum += value;
                    sumOfSquares += value * value;
                    // Calculate the variance at this point in the sequence.
                    variance = sumOfSquares - ((sum * sum) / weightingFactor);
                    // The index is not zero?
                    if (index !== 0) {
                        // The value of k iterates
                        // in the interval [1, maxClasses).
                        for (k = 1; k < maxClasses; k++) {
                            // Calculate the potential variance we would have
                            // if we created a new group at this point.
                            potentialVariance =
                                variance + variances[index][k - 1];
                            // Is the variance we found in the last grouping
                            // greater than or equal to the potential variance
                            // we would have if we created a new group
                            // at this point?
                            if (potentialVariance <= variances[i][k]) {
                                // Let's break here!
                                // Update the lower class limits matrix
                                // by inserting the current index.
                                lowerClassLimits[i][k] = index;
                                // Update the variances matrix
                                // by inserting the current potential variance.
                                // This is for future groupings to use.
                                variances[i][k] = potentialVariance;
                            }
                        }
                    }
                }
                // Set the first element in row i of
                // the lower class limits matrix to 0.
                lowerClassLimits[i][0] = 0;
                // Set the first element in row i of
                // the variances matrix to the current variance.
                variances[i][0] = variance;
            }

            // Return both matrices.
            // Only the lower class limits matrix is needed,
            // but the variances matrix can be useful to evaluate
            // the goodness of variance fit.
            return {
                lowerClassLimits: lowerClassLimits,
                variances: variances
            };
        };
        // Define the find best number of classes function.
        findBestNumberOfClasses = function(variances) {
            /*      *\
            | Locals |
            \*      */
            // loop variable
            var i;
            // the number of rows in the variances matrix
            var numRows;
            // the last row of the variances matrix
            var lastRow;
            // the previous variance
            var previousVariance;
            // the current variance
            var currentVariance;
            // the percent decrease in variance
            var percentDecreaseInVariance;
            // the best number of classes
            var bestNumberOfClasses;
            /*          *\
            | End Locals |
            \*          */
            // Grab the number of rows in the variances matrix
            numRows = variances.length;
            // Grab the last row of the variances matrix
            lastRow = variances[numRows - 1];
            // Loop through the last row of the variances matrix.
            for (i = 0; i < maxClasses; i++) {
                // Grab the current variance.
                currentVariance = lastRow[i];
                // The previous variance exists?
                if (previousVariance) {
                    // Calculate the percent decrease in variance.
                    // (We will keep this value positive for convenience.)
                    percentDecreaseInVariance =
                        (previousVariance - currentVariance) / previousVariance;
                    // The percent decrease in variance fit does not represent
                    // at least a 10% improvement?
                    if (percentDecreaseInVariance < 0.1) {
                        // Grab the best number of classes.
                        bestNumberOfClasses = i;
                        // Stop!
                        break;
                    }
                }
                // Update the previous variance.
                previousVariance = currentVariance;
            }
            // The best number of classes does not exist?
            // (i.e. We have looped through all of the variances.)
            if (!bestNumberOfClasses) {
                // Grab the best number of classes
                bestNumberOfClasses = i;
            }

            return bestNumberOfClasses;
        };
        // Define the jenks breaks function.
        jenksBreaks = function(lowerClassLimits, numClasses) {
            /*      *\
            | Locals |
            \*      */
            // an array containing the start and end values for all the classes
            // (For example, if the class intervals were [0, 50] and [50, 100],
            //  the array would be [0, 50, 100].)
            var breaks;
            // the current row into the lower class limits matrix
            var row;
            // the current column into the lower class limits matrix
            var column;
            /*          *\
            | End Locals |
            \*          */
            // Create the breaks array.
            breaks = [];
            // The lower class limits matrix will never include
            // the upper and lower bounds, so we need to explicitly set them.
            breaks[0] = sortedDataPoints[0];
            breaks[numClasses] = sortedDataPoints[numDataPoints - 1];
            //------------------------------------------------------------------
            // NOTE: At this point in the computation, breaks is a sparse array
            // with indices 0 and (numDataPoints - 1) filled only.
            // This is fine because we'll be filling it in very shortly.
            //------------------------------------------------------------------
            // Start the row at the last data point.
            row = numDataPoints - 1;
            // Start the column at the last class and iterate down
            // toward the first class.
            for (column = numClasses - 1; column > 0; column--) {
                //-----------------------------------------------------------
                // NOTE: The lower class limits matrix is used as indices
                // into itself.
                // The variable row is updated and reused in each iteration.
                //-----------------------------------------------------------
                // Update the breaks array.
                breaks[column] =
                    sortedDataPoints[lowerClassLimits[row][column]];
                // Update the row.
                row = lowerClassLimits[row][column];
            }

            return breaks;
        };
        // Define the jenks breaks to clusters function.
        jenksBreaksToClusters = function(breaks) {
            /*      *\
            | Locals |
            \*      */
            // loop counter
            var i;
            // the number of breaks
            var numBreaks;
            // the number of classes
            var numClasses;
            // the start value of the current class
            var startValue;
            // the end value of the current class
            var endValue;
            // the distance between the start and end of the current class
            var range;
            // the number of entries in the current class
            var numEntries;
            // the current index into the sorted data points array
            var index;
            // the current value from the sorted data points array
            var value;
            // the number of duplicate end values visited
            var numDuplicateEndValuesVisited;
            // the average distance between points for the current class
            var averageDistanceBetweenPoints;
            // the maximum average distance between points
            var maxAverageDistanceBetweenPoints;
            // the scaling factor
            var scalingFactor;
            // the current cluster
            var cluster;
            // the clusters
            var clusters;
            // the number of clusters
            var numClusters;
            /*          *\
            | End Locals |
            \*          */
            // Create the clusters array.
            clusters = [];
            // Grab...
            // (1) the number of breaks
            // (2) the number of classes
            numBreaks = breaks.length;
            numClasses = numBreaks - 1;
            // Start the index at 0.
            index = 0;
            // Loop through the classes to create the clusters.
            for (i = 0; i < numClasses; i++) {
                // Grab the start and end values.
                startValue = breaks[i];
                endValue = breaks[i + 1];
                // Calculate the range.
                range = endValue - startValue;
                // Reset...
                // (1) the number of entries
                // (2) the number of duplicate end values visited
                numEntries = 0;
                numDuplicateEndValuesVisited = 0;
                // Loop through the sorted data points array.
                while (index < numDataPoints) {
                    // Grab the current value.
                    value = sortedDataPoints[index];
                    // We are visiting an end value?
                    if (value === endValue) {
                        // Update the number of duplicate end values visited.
                        numDuplicateEndValuesVisited++;
                    }
                    // Else, the number of duplicate end values visited is
                    // greater than 0?
                    else if (numDuplicateEndValuesVisited > 0) {
                        // Rewind to the beginning of the end value(s).
                        index -= numDuplicateEndValuesVisited;
                        // Stop!
                        break;
                    }
                    // Update...
                    // (1) the number of entries
                    // (2) the index.
                    numEntries++;
                    index++;
                }
                // Calculate the average distance between points.
                averageDistanceBetweenPoints = range / (numEntries - 1);
                // Create a cluster that represents the class.
                // Then, add it to the clusters array.
                cluster = {
                    start: startValue,
                    end: endValue,
                    entries: numEntries,
                    scale: averageDistanceBetweenPoints // temporary value
                };
                clusters.push(cluster);
            }
            // Grab the number of clusters.
            numClusters = clusters.length;
            // Start the maximum average distance between points at 0.
            maxAverageDistanceBetweenPoints = 0;
            // Loop through the clusters to find
            // the maximum average distance between points.
            for (i = 0; i < numClusters; i++) {
                // Grab...
                // (1) the cluster
                // (2) the average distance between points
                cluster = clusters[i];
                averageDistanceBetweenPoints = cluster.scale;
                // New maximum?
                if (averageDistanceBetweenPoints > maxAverageDistanceBetweenPoints) {
                    // Update the maximum.
                    maxAverageDistanceBetweenPoints =
                        averageDistanceBetweenPoints;
                }
            }
            // Loop through the clusters to calculate the scaling factor.
            for (i = 0; i < numClusters; i++) {
                // Grab...
                // (1) the cluster
                // (2) the average distance between points
                cluster = clusters[i];
                averageDistanceBetweenPoints = cluster.scale;
                // The average distance between points is greater than 0?
                if (averageDistanceBetweenPoints > 0) {
                    // Calculate the scaling factor.
                    scalingFactor =
                        maxAverageDistanceBetweenPoints / averageDistanceBetweenPoints;
                }
                // Else?
                else {
                    // To avoid setting the scaling factor to NaN,
                    // just set the scaling factor to 1.
                    //------------------------------------------
                    // TODO: Is there a better solution to this
                    // division by zero problem?
                    //------------------------------------------
                    scalingFactor = 1;
                }
                // Save the scaling factor.
                cluster.scale = scalingFactor;
            }

            return clusters;
        };

        /*            *\
        | End Closures |
        \*            */

        // Calculate the matrices.
        matrices = jenksMatrices();
        lowerClassLimits = matrices.lowerClassLimits;
        variances = matrices.variances;
        // Grab the best number of classes.
        bestNumberOfClasses = findBestNumberOfClasses(variances);
        // Calculate the jenks breaks for the best number of classes.
        breaks = jenksBreaks(lowerClassLimits, bestNumberOfClasses);
        // Convert the jenks breaks into clusters.
        clusters = jenksBreaksToClusters(breaks);
        // There are 0 clusters?
        if (clusters.length === 0) {
            // The data cannot be clustered.
            // So, return the universal cluster.
            return universalCluster;
        }

        return clusters;
    };

}());
