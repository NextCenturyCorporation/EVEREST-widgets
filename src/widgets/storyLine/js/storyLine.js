var app = app || {};

(function() {

    /*         *\
    | Constants |
    \*         */
    // the minimum number of pixels per unit
    // (This prevents the timeline from displaying tick marks which are
    //  way too close together.)
    var MIN_PIXELS_PER_UNIT = 75;
    // the percent of the timeline's width devoted to the margins
    // (You can obtain the percent of the timeline's width that is usable for
    //  rendering events by calculating (1 - TIMELINE_MARGINS).)
    var TIMELINE_MARGINS = 0.2;

    var DEDUCE_LAYOUT = true;

    var MAX_CLASSES;

    var UNIT_DICTIONARY = {
        "millisecond": Timeline.DateTime.MILLISECOND,
        "second": Timeline.DateTime.SECOND,
        "minute": Timeline.DateTime.MINUTE,
        "hour": Timeline.DateTime.HOUR,
        "day" : Timeline.DateTime.DAY,
        "week" : Timeline.DateTime.WEEK,
        "month" : Timeline.DateTime.MONTH,
        "year" : Timeline.DateTime.YEAR,
        "decade" : Timeline.DateTime.DECADE,
        "century" : Timeline.DateTime.CENTURY,
        "millennium" : Timeline.DateTime.millennium};
    /*             *\
    | End Constants |
    \*             */

    Timeline.urlPrefix = "js/libs/jquery-timeline/";
    var eventSource = new Timeline.DefaultEventSource(0);
    var d = Timeline.DateTime.parseGregorianDateTime("2013");
    var theme = Timeline.ClassicTheme.create();
    var resize = true;

    // The timeline internally stores all the datapoints to plot, but we also
    // keep a copy of all datapoints to make decisions about best way to
    // layout the timeline.
    var datapoints = [];

    var zones = [];

    var bandInfo = [
      Timeline.createHotZoneBandInfo({
                      width: "80%",
                      intervalUnit: Timeline.DateTime.MONTH,
                      intervalPixels: 75,
                      eventSource: eventSource,
                      date: d,
                      zones: zones,
                      theme: theme
                    }),
      Timeline.createBandInfo({
                      width: "20%",
                      intervalUnit: Timeline.DateTime.YEAR,
                      intervalPixels: 200,
                      eventSource: eventSource,
                      date: d,
                      theme: theme,
                      highlight: true,
                      overview: true
                    })];
    bandInfo[1].highlight = true;
    bandInfo[1].syncWith =0;

    app.initialize = function() {
        //$("#tline").syrinxTimeline({ bands: bandInfo });
        Timeline.create(document.getElementById("tline"), bandInfo, Timeline.Horizontal);
    };

    /**
    * Add datapoints to the timeline.
    * @param incomingEvents the datapoints to add.  Can either be an array of objects each representing
    * a datapoint, or a single object representing a single datapoint
    * The datapoint is of the form
    *    {
    *      start: date of the event, or start date if the event is a long event.  Of the form "Apr 14 2013 00:00:00 GMT"
    *      end: end date of a long event.  Omit if this event is a single point in time.  Same format as above
    *      title: short text (couple words) to describe this event
    *      <<whole bunch of other options offered by syrinx>>
    *    }
    */
    app.addEvents = function(incomingEvents) {
        var eventData = {};
        if (incomingEvents instanceof Array) {
          // An array of data points - that's the desired format
          eventData.events = incomingEvents;
        } else {
          // A single data point.  Put it in an array
          eventData.events = [incomingEvents];
        }

        // We need to both give these points to the timeline and save them in our own
        // internal list.
        for(var i=0; i<eventData.events.length; ++i) {
          var date = Date.parse(eventData.events[i].start);
          datapoints.push(date);
          // TODO: Be more efficient.  Use a binary search to find the right place to  insert it.
          datapoints = datapoints.sort();
        }
        eventSource.loadJSON(eventData, "");

        app.deduceLayout();
    }

    app.clearEvents = function(incomingEvents) {
        datapoints = [];
        eventSource.clear();
        Timeline._Band.prototype.closeBubble();
    };

    app.changeResize = function(){
      resize = resize ? false : true;
    }

    app.changeLayout = function(newBandInfos) {
        // This widget is built for a single timeline.
        var timeline = Timeline.getTimelineFromID(0);
        var newBands = [];

        // Assign existing event sources and date to new layouts.
        // Also assign a default theme if one is not provided.
        for (var ctr=0;(ctr<newBandInfos.length) && (ctr<timeline.getBandCount());++ctr) {
            newBandInfos[ctr].intervalUnit = UNIT_DICTIONARY[newBandInfos[ctr].intervalUnit];
            newBandInfos[ctr].eventSource = timeline.getBand(ctr).getEventSource();
            if (!newBandInfos[ctr].theme) {
                newBandInfos[ctr].theme = Timeline.ClassicTheme.create();
            }
            if (newBandInfos[ctr].zones){
                var zones = newBandInfos[ctr].zones;
                for (var i = zones.length - 1; i >= 0; i--) {
                    zones[i].unit = UNIT_DICTIONARY[zones[i].unit];
                }
                newBands.push(Timeline.createHotZoneBandInfo(newBandInfos[ctr]));
            } else {
                newBands.push(Timeline.createBandInfo(newBandInfos[ctr]));
            }
        }

        newBands[1].highlight = true;
        newBands[1].syncWith =0;
        // TODO: Really if things like theme, width, and interval info are not provided, we should 
        // pull those values from the band we are replacing, but it is not completely clear how
        // to get that info out of the existing bands.

        // Rerender the timeline.
        $("#tline").removeData();
        Timeline.create(document.getElementById("tline"), newBands, Timeline.Horizontal);     
    }

    /*
    *  Looks at the data points currently being displayed and the visible width of the timeline and determines
    *  the best layout.  Will determine the scale, the units, and any hot zones.
    */
    app.deduceLayout = function() {

        if(DEDUCE_LAYOUT){
            // First thing we do is see if we will have a single uniform timeline or if we will have hot zones
            // where datapoints are shown at a higher resolution.
            var areas = clusterer.jenks(datapoints, MAX_CLASSES);

            var newZones = [];
            for(var i=0; i<areas.length; ++i) {
                if (areas[i].scale > 1) {
                    newZones.push({
                        start:    new Date(areas[i].start).toUTCString(),
                        end:      new Date(areas[i].end).toUTCString(),
                        magnify:  areas[i].scale,
                        unit:     null // temporary value
                    });
                }
            }

            // Grab the number of new zones.
            var numNewZones = newZones.length;
            // There is at least one new zone?
            if (numNewZones > 0) {
                // Grab...
                // (1) the number of datapoints
                // (2) the start and end datapoint
                var numDatapoints = datapoints.length;
                var startDatapoint = datapoints[0];
                var endDatapoint = datapoints[numDatapoints - 1];
                // Calculate the range.
                var magnifiedRange = endDatapoint - startDatapoint;
                // Loop through the new zones to magnify the ranges.
                for (i = 0; i < numNewZones; i++) {
                    // Grab...
                    // (1) the new zone
                    // (2) the start and end date
                    // (3) the magnification
                    var newZone = newZones[i];
                    var newZoneStartDate = Date.parse(newZone.start);
                    var newZoneEndDate = Date.parse(newZone.end);
                    var newZoneMagnification = newZone.magnify;
                    // Calculate the range and magnified range.
                    var newZoneRange = newZoneEndDate - newZoneStartDate;
                    var newZoneMagnifiedRange =
                        newZoneRange * (newZoneMagnification - 1);
                    // Temporarily, save the range and magnified range
                    // into the unit property.
                    // (This may seem be odd, but it saves us from allocating an
                    //  unnecessary parallel array or adding an awkward property
                    //  to the new zone which must be removed later.)
                    newZone.unit = {
                        range: newZoneRange,
                        magnifiedRange: newZoneMagnifiedRange
                    }
                    // Magnify the range.
                    magnifiedRange += newZoneMagnifiedRange;
                }
                // Grab the width of the timeline in pixels.
                var widthOfTimelineInPixels =
                    Timeline.getTimelineFromID(0).getBand(0).getViewLength();
                // Calculate the usable width of the timeline in pixels.
                var usableWidthOfTimelineInPixels =
                    widthOfTimelineInPixels * (1 - TIMELINE_MARGINS);
                // Grab the Gregorian unit lengths
                var gregorianUnitLengths = SimileAjax.DateTime.gregorianUnitLengths;
                // Loop through the new zones to translate the magnified ranges
                // into units.
                for (i = 0; i < numNewZones; i++) {
                    // Grab...
                    // (1) the new zone
                    // (2) the range and magnified range
                    var newZone = newZones[i];
                    var newZoneRange = newZone.unit.range;
                    var newZoneMagnifiedRange = newZone.unit.magnifiedRange;
                    // Calculate how much of the usable width of the timeline the
                    // new zone takes up in pixels.
                    var newZoneWidthInPixels =
                        (newZoneMagnifiedRange / magnifiedRange) * usableWidthOfTimelineInPixels;
                    // Start the unit at 0 (milliseconds).
                    var unit = 0;
                    // Calculate the number of pixels per unit for unit 0
                    // (milliseconds).
                    var pixelsPerUnit = newZoneWidthInPixels / newZoneRange;
                    // Iterate until we have unit intervals of at least
                    // MIN_PIXELS_PER_UNIT pixels.
                    while (pixelsPerUnit < MIN_PIXELS_PER_UNIT) {
                        // Next unit!
                        unit++;
                        // Calculate the number of pixels per unit for
                        // the current unit.
                        pixelsPerUnit =
                            newZoneWidthInPixels / (newZoneRange / gregorianUnitLengths[unit]);
                    }
                    // Save the unit.
                    // (This will overwrite the range and the magnified range
                    //  from before.)
                    newZone.unit = unit;
                }
            }

            // Relayout the timeline with the calculated hotzones.
            zones.length = 0;
            zones.push.apply(zones, newZones);

            // Figure total scale and units.
            app.scaleTimeline();

            $("#tline").removeData();
            Timeline.create(document.getElementById("tline"), bandInfo, Timeline.Horizontal); 
        }       
    }

    app.scaleTimeline = function() {
        // Grab the number of data points.
        var numDatapoints = datapoints.length;
        // There are less than 2 data points?
        if (numDatapoints < 2) {
            // Stop!
            return;
        }
        // Grab the range.
        var range = datapoints[numDatapoints - 1] - datapoints[0];
        // The range is 0?
        if (range === 0) {
            // Stop!
            return;
        }

        // Ideally we want all the events displayed on the visible area, so we look at the total time range and the total
        // available pixels.

        // Adjust that range with any hot zones
        for(var i=0; i<zones.length; ++i) {
          var zoneRange = Date.parse(zones[i].end)-Date.parse(zones[i].start);
          range += zoneRange * (zones[i].magnify - 1);
        }
        var visibleLength = Timeline.getTimelineFromID(0).getBand(0).getViewLength();
        var idealScale = (visibleLength*(1-TIMELINE_MARGINS))/range;  // Ideal number of pixels per millisecond.

        // TODO: Too many data points will make this unreadable.  We should have some limit after which we scale it off
        // the screen and make people scroll just because we have too many points.

        // Now figure out how to get that ideal scale.  Figure out what the best interval to use is (days, months, years) and
        // how many pixels each interval should get.
        // Let's say we don't want intervals less than MIN_PIXELS_PER_UNIT pixels.
        var unit = 0; // Start at milliseconds
        var pixelsPerUnit = idealScale;
        while (pixelsPerUnit < MIN_PIXELS_PER_UNIT) {
          unit += 1;
          pixelsPerUnit = idealScale * SimileAjax.DateTime.gregorianUnitLengths[unit];
        }

        // Finally, need to point the timeline at the right point.
        // TODO: Adjust for hot zones throwing off centering.
        var center = (datapoints[numDatapoints-1]+datapoints[0])/2;
        var centerDate = new Date(center);

        bandInfo[0] = Timeline.createHotZoneBandInfo({
                        width: "80%",
                        intervalUnit: unit,
                        intervalPixels: pixelsPerUnit,
                        eventSource: eventSource,
                        date: centerDate,
                        zones: zones,
                        theme: theme
                      });
    }

    app.calculateZones = function(eventData) {
      zoneData = {};
      months = [];
      for (var i = eventData.events.length - 1; i >= 0; i--) {
        var d = new Date(eventData.events[i].start);
        if(months[d.getMonth()] == null) {
          months[d.getMonth()] = 1;
        } else {

          months[d.getMonth()]++;
        }
      };
      console.log(months);

      for (var i = months.length - 1; i >= 0; i--) {
        if(months[i] != null && months[i] > 1){
          var start = new Date();
          start.setYear("2013");
          start.setMonth(i);
          start.setDate("1");
          var end = new Date();
          end.setYear("2013");
          end.setMonth(i+1);
          end.setDate("1");

          zones.push({
            start:    Timeline.DateTime.parseGregorianDateTime(start),
            end:      Timeline.DateTime.parseGregorianDateTime(end),
            magnify:  10,
            unit:     Timeline.DateTime.DAY
          })
        }
      };
    }

    app.setDeduceLayout = function(bool){
        DEDUCE_LAYOUT = bool;
    }

    app.setMaxClasses = function(maxclasses){
        MAX_CLASSES = maxclasses;
    }

}());

$(function() {
    app.initialize();
});