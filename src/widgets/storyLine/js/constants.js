/*            *\
| constants.js |
\*            */
//-------------
// DEPENDS ON:
// - nothing
//-------------

var constants = constants || {};

(function() {

    /*                      *\
    | clusterer.js Constants |
    \*                      */

    constants.clusterer = constants.clusterer || {};

    // the default maximum number of classes to use
    constants.clusterer.DEFAULT_MAX_CLASSES = 10;
    // the minimum percent decrease in variance
    // between each number of classes
    // (This is used to find the best number of classes.)
    constants.clusterer.MIN_PERCENT_DECREASE_IN_VARIANCE = 0.1;
    // the scaling factor threshold
    // (When scaling the clusters, all scaling factors below this threshold
    //  are rounded down to 1.)
    constants.clusterer.SCALING_FACTOR_THRESHOLD = 2;

    /*                          *\
    | End clusterer.js Constants |
    \*                          */

}());
