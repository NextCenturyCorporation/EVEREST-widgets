var app = app || {};

(function() {

  Timeline.urlPrefix = "js/libs/jquery-timeline/";
  var eventSource = new Timeline.DefaultEventSource(0);
  var d = Timeline.DateTime.parseGregorianDateTime("2013");
  var theme = Timeline.ClassicTheme.create();
  var eventData = {};
  var zones = [];
  var bandInfo = [];

  app.addEvents = function(incomingEvents){
    if (incomingEvents instanceof Array) {
      // An array of JSON strings - that's the desired format
      eventData.events = incomingEvents;
    } else {
      // A JSON string representing a single JSON event.  Put it in
      // and array
      eventData.events = [incomingEvents];
    }
    eventSource.loadJSON(eventData, "");

    app.calculateZones();
  }

  app.calculateZones = function() {
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
        var start = new Date("2013", i, "1");
        var end = new Date("2013", i + 1, "1");

        zones.push({
          start:    Timeline.DateTime.parseGregorianDateTime(start),
          end:      Timeline.DateTime.parseGregorianDateTime(end),
          magnify:  40,
          unit:     Timeline.DateTime.DAY
        })
      }
    }

    app.createTimeline();
  }

  app.createTimeline = function(){
    bandInfo.push(Timeline.createHotZoneBandInfo({
      width: "80%",
      intervalUnit: Timeline.DateTime.MONTH,
      intervalPixels: 75,
      eventSource: eventSource,
      date: d,
      zones: zones,
      theme: theme
    }));
    bandInfo.push(Timeline.createBandInfo({
      width: "20%",
      intervalUnit: Timeline.DateTime.YEAR,
      intervalPixels: 200,
      eventSource: eventSource,
      date: d,
      theme: theme,
      highlight: true,
      overview: true
    }));
    bandInfo[1].highlight = true;
    bandInfo[1].syncWith =0;

    Timeline.create(document.getElementById("tline"), bandInfo, Timeline.Horizontal);
  }

  app.initialize = function() {
    app.addEvents([]);
  };

    
}());

$(function() {
    app.initialize();
});