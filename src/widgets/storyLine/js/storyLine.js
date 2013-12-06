var app = app || {};

(function() {

    Timeline.urlPrefix = "js/libs/jquery-timeline/";
    var eventSource = new Timeline.DefaultEventSource(0);
    var d = Timeline.DateTime.parseGregorianDateTime("2013");
    var theme = Timeline.ClassicTheme.create();

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
    }

    app.clearEvents = function(incomingEvents) {
        datapoints = [];
        eventSource.clear();
    };

    app.changeLayout = function(newBandInfos) {
        // This widget is built for a single timeline.
        var timeline = Timeline.getTimelineFromID(0);

        // Assign existing event sources and date to new layouts.
        // Also assign a default theme if one is not provided.
        for (var ctr=0;(ctr<newBandInfos.length) && (ctr<timeline.getBandCount());++ctr)
        {
          newBandInfos[ctr].eventSource = timeline.getBand(ctr).getEventSource();
          newBandInfos[ctr].date = timeline.getBand(ctr).getCenterVisibleDate();
          if (!theme in newBandInfos[ctr]) {
            newBandInfos[ctr].theme = Timeline.ClassicTheme.create();
          }
        }
        // TODO: Really if things like theme, width, and interval info are not provided, we should 
        // pull those values from the band we are replacing, but it is not completely clear how
        // to get that info out of the existing bands.

        // Rerender the timeline.
        $("#tline").removeData();
        Timeline.create(document.getElementById("tline"), bandInfo, Timeline.Horizontal);        
    }

    /*
    *  Looks at the data points currently being displayed and the visible width of the timeline and determines
    *  the best layout.  Will determine the scale, the units, and any hot zones.
    */
    app.deduceLayout = function() {
        // First thing we do is see if we will have a single uniform timeline or if we will have hot zones
        // where datapoints are shown at a higher resolution.
        var areas = clusterer.cluster(datapoints);

        var newZones = [];
        for(var i=0; i<areas.length; ++i) {
          if (areas[i].scale > 1) {
            newZones.push({
              start:    new Date(areas[i].start).toUTCString(),
              end:      new Date(areas[i].end).toUTCString(),
              magnify:  areas[i].scale,
              // TODO: Figure out units
              unit:     Timeline.DateTime.DAY
            });
          }
        }

        // TODO: Relayout the timeline with the calculated hotzones.
        zones.length = 0;
        zones.push.apply(zones, newZones);

        // TODO: Figure total scale and units.
        app.scaleTimeline();

        $("#tline").removeData();
        Timeline.create(document.getElementById("tline"), bandInfo, Timeline.Horizontal);        
    }

    app.scaleTimeline = function() {
      // Ideally we want all the events displayed on the visible area, so we look at the total time range and the total
      // available pixels.

      var range = datapoints[datapoints.length-1]-datapoints[0];
      // Adjust that range with any hot zones
      for(var i=0; i<zones.length; ++i) {
        var zoneRange = Date.parse(zones[i].end)-Date.parse(zones[i].start);
        range += zoneRange * (zones[i].magnify - 1);
      }
      var visibleLength = Timeline.getTimelineFromID(0).getBand(0).getViewLength();
      var idealScale = (visibleLength*0.8)/range;  // Ideal number of pixels per millisecond.

      // TODO: Too many data points will make this unreadable.  We should have some limit after which we scale it off
      // the screen and make people scroll just because we have too many points.

      // Now figure out how to get that ideal scale.  Figure out what the best interval to use is (days, months, years) and
      // how many pixels each interval should get.
      // Let's say we don't want intervals less than 100 pixels.
      var unit = 0; // Start at milliseconds
      var pixelsPerUnit = idealScale;
      while (pixelsPerUnit < 100) {
        unit += 1;
        pixelsPerUnit = idealScale * SimileAjax.DateTime.gregorianUnitLengths[unit];
      }

      // Finally, need to point the timeline at the right point.
      // TODO: Adjust for hot zones throwing off centering.
      var center = (datapoints[datapoints.length-1]+datapoints[0])/2;
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

}());

$(function() {
    app.initialize();
});