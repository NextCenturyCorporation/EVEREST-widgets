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
    * @param incomingEvents the datapoints to add.  Can either be an array of JSON strings each representing
    * a datapoint, or a single JSON string with either a single datapoint or an array of data points.
    * The JSON for the datapoint is of the form
    *    {
    *      start: date of the event, or start date if the event is a long event.  Of the form "Apr 14 2013 00:00:00 GMT"
    *      end: end date of a long event.  Omit if this event is a single point in time.  Same format as above
    *      title: short text (couple words) to describe this event
    *    }
    */
    app.addEvents = function(incomingEvents) {
        var eventData = {};
        if (incomingEvents instanceof Array) {
          // An array of JSON strings - that's the desired format
          eventData.events = incomingEvents;
        } else if (incomingEvents.charAt(0) == '[') {
          // A JSON string representing an array of events.  We want
          // to pull out the events and put them in a real array.

          // TODO: Tokenize into JSON strings for each event
        } else {
          // A JSON string representing a single JSON event.  Put it in
          // and array
          eventData.events = [incomingEvents];
        }

        // We need to both give these points to the timeline and save them in our own
        // internal list.
        for(var i=0; i<eventData.events.length; ++i) {
          var date = Timeline.DateTime.parseGregorianDateTime(eventData.events[i]);
          datapoints.push(date.getTime())
        }
        eventSource.loadJSON(eventData, "");
        app.calculateZones(eventData);
        Timeline.create(document.getElementById("tline"), bandInfo, Timeline.Horizontal);
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
        $("#tline").syrinxTimeline({ bands: newBandInfos });        
    }

    /*
    *  Looks at the data points currently being displayed and the visible width of the timeline and determines
    *  the best layout.  Will determine the scale, the units, and any hot zones.
    */
    app.deduceLayout = function() {
        // First thing we do is see if we will have a single uniform timeline or if we will have hot zones
        // where datapoints are shown at a higher resolution.
        var areas = clusterer.cluster(datapoints);

        var zones = [];
        for(var i=0; i<areas.length; ++i) {
          if (areas[i].scale > 1) {
            zones.push({
              start:    new Date(areas[i].start).toUTCString(),
              end:      new Date(areas[i].start).toUTCString(),
              magnify:  areas[i].scale
              // TODO: Figure out units
            });
          }
        }

        // TODO: Relayout the timeline with the calculated hotzones.

        // TODO: Figure total scale and units.
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