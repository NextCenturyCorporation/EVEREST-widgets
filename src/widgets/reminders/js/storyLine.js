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
        eventSource.loadJSON(app.eventData, "");
    };

    app.plotReminders = function(reminders) {
        eventSource.clear();
        //remove bubbles on load of new patient, one or the other
        Timeline._Band.prototype.closeBubble(); //SimileAjax.WindowManager.cancelPopups();
        app.addReminders(reminders);
    };

    app.addReminders = function(reminders) {
        /*var eventData = { 'events': [] };
        _.each(reminders, function(reminder) {
            eventData.events.push({
                'title': reminder.completed ? reminder.title : "Due: " + reminder.title ,
                'start': reminder.start ? reminder.start : reminder.completed ? reminder.dateCompleted : reminder.dueDate,
                'description': reminder.description,
                'icon': reminder.completed ? 'blue-circle.png' : 'red-circle.png'
            });
        });*/
        eventSource.loadJSON(reminders, "");
    };

}());

$(function() {
    app.initialize();
});