var app = app || {};

(function() {

    Timeline.urlPrefix = "js/libs/jquery-timeline/";
    var eventSource = new Timeline.DefaultEventSource(0);
    var d = Timeline.DateTime.parseGregorianDateTime("2013");
    var theme = Timeline.ClassicTheme.create();

    var bandInfo = [{
                      width: "80%",
                      intervalUnit: Timeline.DateTime.MONTH,
                      intervalPixels: 75,
                      eventSource: eventSource,
                      date: d,
                      theme: theme
                    },
                    {
                      width: "20%",
                      intervalUnit: Timeline.DateTime.YEAR,
                      intervalPixels: 200,
                      eventSource: eventSource,
                      date: d,
                      theme: theme,
                      highlight: true,
                      overview: true
                    }];

    app.initialize = function() {
        $("#tline").syrinxTimeline({ bands: bandInfo });
        //eventSource.loadJSON(app.eventData, "");
    };

    app.plotEvents = function(incomingEvents) {
        eventSource.clear();
        var eventData = { 'events': [] };
        _.each(incomingEvents, function(ie) {
            eventData.events.push({
                'title': ie.title,
                'start': ie.start,
            });
        });
        eventSource.loadJSON(eventData, "");
    };

}());

$(function() {
    app.initialize();
});