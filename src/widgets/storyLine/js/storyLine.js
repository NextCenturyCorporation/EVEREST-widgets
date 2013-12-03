var app = app || {};

(function() {

    Timeline.urlPrefix = "js/libs/jquery-timeline/";
    var eventSource = new Timeline.DefaultEventSource(0);
    var d = Timeline.DateTime.parseGregorianDateTime("2013");
    var theme = Timeline.ClassicTheme.create();

    var zones = [{   start:    "Mon Apr 1 2013 00:00:00 GMT-0600",
            end:      "Wed May 1 2013 00:00:00 GMT-0600",
            magnify:  40,
            unit:     Timeline.DateTime.DAY
        }];

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

    app.addEvents = function(incomingEvents) {
        var eventData = {};
        if (incomingEvents instanceof Array) {
          eventData.events = incomingEvents;
        } else {
          eventData.events = [incomingEvents];
        }
        eventSource.loadJSON(eventData, "");      
    }

    app.clearEvents = function(incomingEvents) {
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

}());

$(function() {
    app.initialize();
});