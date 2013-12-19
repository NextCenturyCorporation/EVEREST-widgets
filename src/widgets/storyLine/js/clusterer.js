/*            *\
| clusterer.js |
\*            */
//--------------------
// DEPENDS ON:
// - "./constants.js"
//--------------------

var clusterer = clusterer || {};

(function() {

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
    * number of classes to use based upon the following simple heuristic.
    * It increases the number of classes until the the improvement of
    * the variance between classes is less than 10%.
    * To avoid warping the time scale unnecessarily, this function
    * does two things.
    * First, it merges all neighboring clusters with
    * an average distance between points within 66.6666% of each other
    * into a single cluster.
    * Second, it rounds all scaling factors less than 2 down to 1 and
    * merges together all neighboring clusters with a scaling factor of 1.
    * @param dataPoints an array of numbers
    * @param maxClasses (optional) the maxium number of classes to use.
    *                   Defaults to 10.
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

        /*         *\
        | Constants |
        \*         */

        // the default maximum number of classes to use
        var DEFAULT_MAX_CLASSES = constants.clusterer.DEFAULT_MAX_CLASSES;
        // the minimum percent decrease in variance
        // between each number of classes
        // (This is used to find the best number of classes.)
        var MIN_PERCENT_DECREASE_IN_VARIANCE = constants.clusterer.MIN_PERCENT_DECREASE_IN_VARIANCE;
        // the scaling factor threshold
        // (When scaling the clusters, all scaling factors below this threshold
        //  are rounded down to 1.)
        var SCALING_FACTOR_THRESHOLD = constants.clusterer.SCALING_FACTOR_THRESHOLD;
        // the minimum percent difference in the average distance between points
        // between neighboring clusters
        // (This is used to merge clusters.)
        var MIN_PERCENT_DIFFERENCE_IN_AVERAGE_DISTANCE_BETWEEN_POINTS = 
            2 / (SCALING_FACTOR_THRESHOLD + 1);

        /*             *\
        | End Constants |
        \*             */

        /*      *\
        | Locals |
        \*      */

        // the universal cluster
        // (This is the default return value if the data cannot be clustered.
        //  The universal cluster simply puts all of the data points
        //  into a single cluster of scale 1.)
        var universalCluster;
        // the same as dataPoints but... sorted!
        var sortedDataPoints;
        // the number of data points
        var numDataPoints;
        // the number of unique data points
        var numUniqueDataPoints;
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
        // the result of merging clusters
        var mergeClustersResult;
        // the maximum average distance between points
        var maxAverageDistanceBetweenPoints;
        // the clusters
        // (This is the return value if the data can be clustered.)
        var clusters;
        // a function which returns...
        // - the number of unique data points
        var countUniqueDataPoints;
        // a function which returns...
        // (1) a matrix (2D array) representing
        //     the optimal lower class limits
        // (2) a matrix (2D array) representing
        //     the optimal variance combinations for all classes
        var calculateJenksMatrices;
        // a function which takes...
        // - a matrix (2D array) representing
        //   the optimal variance combinations for all classes
        // and returns...
        // - the best number of classes
        //   (Looks at the rate of change of the variance with respect to
        //    the number of classes.
        //    Stops when the improvement (i.e. decrease) in variance is
        //    less than MIN_PERCENT_DECREASE_IN_VARIANCE.)
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
        var findJenksBreaks;
        // a function which takes...
        // - an array containing the start and end values for all the classes
        //   (For example, if the class intervals were [0, 50] and [50, 100],
        //    the array would be [0, 50, 100].)
        // and returns...
        // - an array of clusters
        var convertJenksBreaksIntoClusters;
        // a function which takes...
        // - an array of clusters (kept constant)
        // and returns...
        // (1) an array of merged clusters
        //     (All neighboring clusters with an average distance between points
        //      within MIN_PERCENT_DIFFERENCE_IN_AVERAGE_DISTANCE_BETWEEN_POINTS
        //      of each other are merged into a single cluster.)
        // (2) the maximum average difference between points among
        //     the merged clusters
        var mergeClusters;
        // a function which takes...
        // (1) a first value
        // (2) a second value
        // and returns...
        // - the percent difference between the first and second values
        var calculatePercentDifference;
        // a function which takes...
        // (1) a first cluster (i.e. first in sorted order)
        // (2) a second cluster (i.e. second in sorted order)
        // (2) (optional) whether the caller wants to simply
        //                average the scales together rather than re-calculating
        //                the average distance between points
        // and returns...
        // - a merged cluster representing the merging of
        //   the first cluster with the second cluster
        var mergeTwoClusters;
        // a function which takes...
        // (1) an array of clusters (kept constant)
        // (2) the maximum average difference between points among
        //     the merged clusters
        // and returns...
        // - an array of scaled clusters
        //   (All clusters with a scaling factor less than
        //    the SCALING_FACTOR_THRESHOLD are rounded down to 1 and
        //    merged with neighboring clusters with a scaling factor of 1.)
        var scaleClusters;

        /*          *\
        | End Locals |
        \*          */

        /*        *\
        | Closures |
        \*        */

        // Define the count unique data points function.
        //----------------------
        // CLOSURE VARIABLES:
        // (1) numDataPoints
        // (2) sortedDataPoints
        //----------------------
        countUniqueDataPoints = function() {
            /*      *\
            | Locals |
            \*      */
            // loop counter
            var i;
            // the number of unique data points
            var numUniqueDataPoints;
            // the current data point
            var currentDataPoint;
            // the previous data point
            var previousDataPoint;
            /*          *\
            | End Locals |
            \*          */
            // Assume that all the data points are unique.
            numUniqueDataPoints = numDataPoints;
            // Loop through the sorted data points.
            // Skip the first data point so that we can always compare
            // the current data point with the previous data point.
            for (i = 1; i < numDataPoints; i++) {
                // Grab the current and previous data point.
                currentDataPoint = sortedDataPoints[i];
                previousDataPoint = sortedDataPoints[i - 1];
                // Found a duplicate?
                if (currentDataPoint === previousDataPoint) {
                    // Update the number of unique data points.
                    numUniqueDataPoints--;
                }
            }

            return numUniqueDataPoints;
        };
        // Define the calculate jenks matrices function.
        //----------------------
        // CLOSURE VARIABLES:
        // (1) numDataPoints
        // (2) sortedDataPoints
        //----------------------
        calculateJenksMatrices = function() {
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
            // the current index into the sorted data points
            var index;
            // the current value from the sorted data points
            var value;
            // the variance as computed at each step in the calculation
            var variance;
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
        //--------------------
        // CLOSURE VARIABLES:
        // - none
        //--------------------
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
            // the current variance
            var currentVariance;
            // the previous variance
            var previousVariance;
            // the percent decrease in variance
            var percentDecreaseInVariance;
            // the best number of classes
            var bestNumberOfClasses;
            /*          *\
            | End Locals |
            \*          */
            // Grab...
            // (1) the number of rows in the variances matrix
            // (2) the last row of said matrix
            numRows = variances.length;
            lastRow = variances[numRows - 1];
            // Loop through the last row of the variances matrix.
            // The last row contains the final computed effective variance
            // for each number of classes up to the maximum number of classes.
            // The lower the variance, the better
            // the goodness of variance fit (GVF).
            // As the number of classes increases,
            // the variance will always go down.
            // However, at some point, the decrease in variance will
            // slow down to a crawl.
            // Therefore, we will stop when the decrease in variance is
            // less than MIN_PERCENT_DECREASE_IN_VARIANCE.
            for (i = 0; i < maxClasses; i++) {
                // Grab the current variance.
                currentVariance = lastRow[i];
                // There's a previous variance?
                if (previousVariance) {
                    // Calculate the percent decrease in variance.
                    // (We will keep this value positive for convenience.)
                    percentDecreaseInVariance =
                        (previousVariance - currentVariance) / previousVariance;
                    // The percent decrease in variance does not represent
                    // at least a MIN_PERCENT_DECREASE_IN_VARIANCE improvement?
                    if (percentDecreaseInVariance < MIN_PERCENT_DECREASE_IN_VARIANCE) {
                        // Grab the best number of classes.
                        // (i.e. the previous number of classes)
                        bestNumberOfClasses = i;
                        // Stop!
                        break;
                    }
                }
                // Update the previous variance.
                previousVariance = currentVariance;
            }
            // We did not find a best number of classes?
            if (!bestNumberOfClasses) {
                // The best number of classes is the maximum number of classes.
                bestNumberOfClasses = i;
            }

            return bestNumberOfClasses;
        };
        // Define the find jenks breaks function.
        //----------------------
        // CLOSURE VARIABLES:
        // (1) numDataPoints
        // (2) sortedDataPoints
        //----------------------
        findJenksBreaks = function(lowerClassLimits, numClasses) {
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
        // Define the convert jenks breaks into clusters function.
        //----------------------
        // CLOSURE VARIABLES:
        // (1) numDataPoints
        // (2) sortedDataPoints
        //----------------------
        convertJenksBreaksIntoClusters = function(breaks) {
            /*      *\
            | Locals |
            \*      */
            // loop counter
            var i;
            // the clusters
            var clusters;
            // the number of breaks
            var numBreaks;
            // the number of classes
            var numClasses;
            // the current index into the sorted data points array
            var index;
            // the start value of the current class
            var startValue;
            // the end value of the current class
            var endValue;
            // the distance between the start and end of the current class
            var range;
            // the number of entries in the current class
            var numEntries;
            // the number of duplicate end values visited
            var numDuplicateEndValuesVisited;
            // the current value from the sorted data points array
            var value;
            // the average distance between points for the current class
            var averageDistanceBetweenPoints;
            // the current cluster
            var cluster;
            /*          *\
            | End Locals |
            \*          */
            // Create the clusters array.
            clusters = [];
            // Grab the number of breaks and the number of classes.
            numBreaks = breaks.length;
            numClasses = numBreaks - 1;
            // Start the index.
            index = 0;
            // Loop through the classes to create the clusters.
            for (i = 0; i < numClasses; i++) {
                // Grab the start and end values and calculate the range.
                startValue = breaks[i];
                endValue = breaks[i + 1];
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
                    // Visiting an end value?
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
                    // Update the number of entries and the index.
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
                    scale: averageDistanceBetweenPoints
                };
                clusters.push(cluster);
            }

            return clusters;
        };
        // Define the merge clusters function.
        //----------------------
        // CLOSURE VARIABLES:
        // (1) numDataPoints
        // (2) sortedDataPoints
        //----------------------
        mergeClusters = function(clusters) {
            /*      *\
            | Locals |
            \*      */
            // loop variable
            var i;
            // the number of clusters
            var numClusters;
            // the merged clusters
            var mergedClusters;
            // the number of merged clusters
            var numMergedClusters;
            // the maximum average distance between points
            // among the merged clusters
            var maxAverageDistanceBetweenPoints;
            // the current cluster
            var currentCluster;
            // the average distance between points for the current cluster
            var currentAverageDistanceBetweenPoints;
            // the previous cluster
            // (i.e. the cluster which was just merged)
            var previousCluster;
            // the average distance between points for the previous cluster
            var previousAverageDistanceBetweenPoints;
            // the percent difference in the average distance between points
            // between the current and previous clusters
            var percentDifferenceInAverageDistanceBetweenPoints;
            // the current merged cluster
            var mergedCluster;
            // the final cluster
            var finalCluster;
            // the average distance between points for the final cluster
            var finalAverageDistanceBetweenPoints;
            /*          *\
            | End Locals |
            \*          */
            // Grab the number of clusters.
            numClusters = clusters.length;
            // Create the merged clusters array.
            mergedClusters = [];
            // Start...
            // (1) the number of merged clusters
            // (2) the maximum average distance between points
            numMergedClusters = 0;
            maxAverageDistanceBetweenPoints = 0;
            // Loop through the clusters in order to merge them.
            // Merge all neighboring clusters with an
            // average distance between points within
            // MIN_PERCENT_DIFFERENCE_IN_AVERAGE_DISTANCE_BETWEEN_POINTS
            // of each other into a single cluster.
            // For efficiency reasons, calculate
            // the maximum average distance between points on the fly
            // as soon as each group of clusters has been completely merged.
            for (i = 0; i < numClusters; i++) {
                // Grab...
                // (1) the current cluster
                // (2) the average distance between points
                //     for the current cluster
                currentCluster = clusters[i];
                currentAverageDistanceBetweenPoints = currentCluster.scale;
                // There's a previously merged cluster to compare
                // the current cluster against?
                if (numMergedClusters > 0) {
                    // Grab...
                    // (1) the previous cluster
                    // (2) the average distance between points
                    //     for the previous cluster
                    previousCluster = mergedClusters[numMergedClusters - 1];
                    previousAverageDistanceBetweenPoints =
                        previousCluster.scale;
                    // Calculate the percent difference in the average distance
                    // between points.
                    percentDifferenceInAverageDistanceBetweenPoints =
                        calculatePercentDifference(
                            currentAverageDistanceBetweenPoints,
                            previousAverageDistanceBetweenPoints
                        );
                    // The percent difference in the average distance
                    // between points is within
                    // MIN_PERCENT_DIFFERENCE_IN_AVERAGE_DIFFERENCE_BETWEEN_POINTS?
                    if (percentDifferenceInAverageDistanceBetweenPoints <= MIN_PERCENT_DIFFERENCE_IN_AVERAGE_DISTANCE_BETWEEN_POINTS) {
                        // Merge the previous and current clusters.
                        // Then, save the merged cluster to
                        // the merged clusters array.
                        mergedCluster = mergeTwoClusters(
                            previousCluster,
                            currentCluster
                        );
                        mergedClusters[numMergedClusters - 1] = mergedCluster;
                    }
                    // Else?
                    else {
                        // The previous cluster has been completely merged.
                        // Now is the perfect time to update
                        // the maximum average distance between points.
                        if (previousAverageDistanceBetweenPoints > maxAverageDistanceBetweenPoints) {
                            maxAverageDistanceBetweenPoints =
                                previousAverageDistanceBetweenPoints;
                        }
                        // The current cluster does not need to be merged
                        // with the previous cluster, so simply add it to
                        // the merged clusters array.
                        mergedClusters.push(currentCluster);
                        numMergedClusters++;
                    }
                }
                // Else?
                else {
                    // You cannot merge one cluster with itself, so
                    // simply add it to the merged clusters array.
                    mergedClusters.push(currentCluster);
                    numMergedClusters++;
                }
            }
            // The clever way we calculated
            // the maximum average distance between points on the fly
            // will always miss checking the final cluster for a new maximum.
            // Grab the final cluster and its average distance between points.
            finalCluster = mergedClusters[numMergedClusters - 1];
            finalAverageDistanceBetweenPoints = finalCluster.scale;
            // Update the maximum average distance between points.
            if (previousAverageDistanceBetweenPoints > maxAverageDistanceBetweenPoints) {
                maxAverageDistanceBetweenPoints =
                    previousAverageDistanceBetweenPoints;
            }

            // Return both the clusters and
            // the maximum average distance between points.
            // Only the clusters are needed, but
            // the maximum average distance between points can be useful
            // to scale the clusters relative to each other.
            return {
                clusters: mergedClusters,
                maxAverageDistanceBetweenPoints: maxAverageDistanceBetweenPoints
            };
        };
        // Define the calculate percent difference function.
        //--------------------
        // CLOSURE VARIABLES:
        // - none
        //--------------------
        calculatePercentDifference = function(firstValue, secondValue) {
            /*      *\
            | Locals |
            \*      */
            // the difference
            var difference;
            // the average
            var average;
            // the percent difference
            var percentDifference;
            /*          *\
            | End Locals |
            \*          */
            // Calculate...
            // (1) the difference
            // (2) the average
            // (3) the percent difference
            difference = firstValue - secondValue;
            average = (firstValue + secondValue) / 2;
            percentDifference = Math.abs(difference / average);

            return percentDifference;
        };
        // Define the merge two clusters function.
        //----------------------
        // CLOSURE VARIABLES:
        // (1) numDataPoints
        // (2) sortedDataPoints
        //----------------------
        mergeTwoClusters = function(firstCluster, secondCluster, averageScalesTogether) {
            /*      *\
            | Locals |
            \*      */
            // start value for the merged cluster
            var startValue;
            // the end value for the merged cluster
            var endValue;
            // the range for the merged cluster
            var range;
            // the current index into the sorted data points array
            var index;
            // the number of duplicate end value visited
            var numDuplicateEndValuesVisited;
            // the number entries in the merged cluster
            var numEntries;
            // the current value from the sorted data points array
            var value;
            // the scale for the first cluster
            var firstScale;
            // the scale for the second cluster
            var secondScale;
            // the scale for the merged cluster
            var scale;
            // the merged cluster
            var mergedCluster;
            /*          *\
            | End Locals |
            \*          */
            // Grab the start and end value and calculate the range.
            startValue = firstCluster.start;
            endValue = secondCluster.end;
            range = endValue - startValue;
            // Start the index at the start value.
            index = sortedDataPoints.indexOf(startValue);
            // Reset...
            // (1) the number of duplicate end value visitied
            // (2) the number of entries for the merged cluster
            numDuplicateEndValuesVisited = 0;
            numEntries = 0;
            // Loop through the sorted data points array.
            while (index < numDataPoints) {
                // Grab the current value.
                value = sortedDataPoints[index];
                // Visiting an end value?
                if (value === endValue) {
                    // Update the number of duplicate end values
                    // visited.
                    numDuplicateEndValuesVisited++;
                }
                // Else, the number of duplicate end values visited
                // is greater than 0?
                else if (numDuplicateEndValuesVisited > 0) {
                    // Stop!
                    break;
                }
                // Update the new number of entries for
                // the merged cluster and the index.
                numEntries++;
                index++;
            }
            // The caller simply wants to average the scales together?
            if (averageScalesTogether) {
                // Grab the first and second scale and calculate the average.
                firstScale = firstCluster.scale;
                secondScale = secondCluster.scale;
                scale = (firstScale + secondScale) / 2;
            }
            // Else, the caller wants to re-calculate
            // the average distance between points?
            else {
                // Calculate the average distance between points.
                scale = range / (numEntries - 1);
            }
            // Create the merged cluster.
            mergedCluster = {
                start: startValue,
                end: endValue,
                entries: numEntries,
                scale: scale
            };

            return mergedCluster;
        };
        // Define the scale clusters function.
        //--------------------
        // CLOSURE VARIABLES:
        // - none
        //--------------------
        scaleClusters = function(clusters, maxAverageDistanceBetweenPoints) {
            /*      *\
            | Locals |
            \*      */
            // loop variable
            var i;
            // the number of clusters
            var numClusters;
            // the scaled clusters
            var scaledClusters;
            // the number of scaled clusters
            var numScaledClusters;
            // the current cluster
            var currentCluster;
            // the average distance between points for the current cluster
            var currentAverageDistanceBetweenPoints;
            // the scaling factor for the current cluster
            var currentScalingFactor;
            // the previous cluster
            // (i.e. the cluster which was just scaled)
            var previousCluster;
            // the scaling factor for the previous cluster
            var previousScalingFactor;
            // the merged cluster
            var mergedCluster;
            /*          *\
            | End Locals |
            \*          */
            // Grab the number of clusters.
            numClusters = clusters.length;
            // Create the scaled clusters array.
            scaledClusters = [];
            // Start the number of scaled clusters.
            numScaledClusters = 0;
            // Loop through the merged clusters in order to scale them.
            for (i = 0; i < numClusters; i++) {
                // Grab...
                // (1) the current cluster
                // (2) the average distance between points for said cluster
                currentCluster = clusters[i];
                currentAverageDistanceBetweenPoints = currentCluster.scale;
                // Calculate the scaling factor for the current cluster.
                currentScalingFactor =
                    maxAverageDistanceBetweenPoints / currentAverageDistanceBetweenPoints;
                // The scaling factor does not clear
                // the SCALING_FACTOR_THRESHOLD?
                if (currentScalingFactor < SCALING_FACTOR_THRESHOLD) {
                    // Round the scaling factor down to 1.
                    currentScalingFactor = 1;
                }
                // Save the scaling factor.
                currentCluster.scale = currentScalingFactor;
                // There's a previously scaled cluster to compare
                // the current cluster against?
                if (numScaledClusters > 0) {
                    // Grab...
                    // (1) the previous cluster
                    // (2) the scaling factor for said cluster
                    previousCluster = scaledClusters[numScaledClusters - 1];
                    previousScalingFactor = previousCluster.scale;
                    // The scaling factors for the current and previous clusters
                    // both equal 1?
                    if (
                        currentScalingFactor === 1 &&
                        currentScalingFactor === previousScalingFactor
                    ) {
                        // Merge the previous and current clusters.
                        // Then, save the merged cluster to
                        // the scaled clusters array.
                        mergedCluster = mergeTwoClusters(
                            previousCluster,
                            currentCluster,
                            true // averageScalesTogether
                        );
                        scaledClusters[numScaledClusters - 1] = mergedCluster;
                    }
                    // Else?
                    else {
                        // The current cluster does not need to be merged
                        // with the previous cluster, so simply add it to
                        // the scaled clusters array.
                        scaledClusters.push(currentCluster);
                        numScaledClusters++;
                    }
                }
                // Else?
                else {
                    // You cannot merge one cluster with itself, so
                    // simply add it to the scaled clusters array.
                    scaledClusters.push(currentCluster);
                    numScaledClusters++;
                }
            }

            return scaledClusters;
        };

        /*            *\
        | End Closures |
        \*            */

        /*          *\
        | Safeguards |
        \*          */

        // There are 0 data points?
        // (i.e. The array dataPoints does not exist or has a length of 0.)
        if (!dataPoints || dataPoints.length === 0) {
            // Return 0 clusters.
            return [];
        }
        // Grab the number of data points.
        numDataPoints = dataPoints.length;
        // Before we mess around with the data points...
        // (1) create a safe copy of the data points
        // (2) sort the data points
        sortedDataPoints = dataPoints.slice().sort(function(a, b) {
            return a - b;
        });
        // Create the universal cluster in case we need it later on.
        universalCluster = [{
            start: sortedDataPoints[0],
            end: sortedDataPoints[numDataPoints - 1],
            entries: numDataPoints,
            scale: 1
        }];
        // Grab the number of unique data points.
        numUniqueDataPoints = countUniqueDataPoints();
        // The maxium number of classes is 0 or does not exist?
        if (!maxClasses) {
            // Use the default maximum number of classes.
            maxClasses = DEFAULT_MAX_CLASSES;
        }
        // The maximum number of classes is greater than or equal to
        // the number of unique data points?
        if (maxClasses >= numUniqueDataPoints) {
            // Adjust the maximum number classes.
            maxClasses = numUniqueDataPoints - 1;
        }
        // The maximum number of classes is less than 2?
        if (maxClasses < 2) {
            // It makes no sense to cluster the data points.
            // Instead, return the universal cluster.
            return universalCluster;
        }

        /*              *\
        | End Safeguards |
        \*              */

        // Calculate the Jenks matrices.
        matrices = calculateJenksMatrices();
        lowerClassLimits = matrices.lowerClassLimits;
        variances = matrices.variances;
        // Find the best number of classes.
        bestNumberOfClasses = findBestNumberOfClasses(variances);
        // Find the jenks breaks for the best number of classes.
        breaks = findJenksBreaks(lowerClassLimits, bestNumberOfClasses);
        // Convert the jenks breaks into clusters.
        clusters = convertJenksBreaksIntoClusters(breaks);
        // Merge the clusters.
        mergeClustersResult = mergeClusters(clusters);
        clusters = mergeClustersResult.clusters;
        maxAverageDistanceBetweenPoints =
            mergeClustersResult.maxAverageDistanceBetweenPoints;
        // Scale the clusters.
        clusters = scaleClusters(
            clusters,
            maxAverageDistanceBetweenPoints
        );

        return clusters;
    };

}());
