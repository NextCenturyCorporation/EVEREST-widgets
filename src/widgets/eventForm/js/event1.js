var app = app || {};

(function() {
    var rawEventFormTemplate = "<div class='panel-heading'><h4>{{title}}<button class='pull-right' data-toggle='modal' data-target='{{helpTarget}}' id='help'>?</button></h4></div><div class='panel-body'><form role='form'>{{#each input}}<div class='form-group'><label> {{this.label}} </label><input type='text' class='form-control' placeholder='{{this.label}}' id='{{this.id}}'></div>{{/each}}<div id='buttons'>{{#each buttons}}<div class='col-xs-3 expand'><button class='btn btn-info btn-block' type='button' data-target='{{this.target}}' id='{{this.id}}'>{{this.label}}</button></div>{{/each}}</div><br /><hr /></form></div>";
    var rawHiddenFormTemplate = "<div class='col-xs-1'></div><div class='col-xs-11'>{{#each input}}<div class='form-group'><label class='control-label'>{{this.label}}</label><input type='text' class='form-control' placeholder='{{this.label}}' id='{{this.id}}'></div>{{/each}}<button class='btn btn-primary pull-right btn-sm' type='button' id='{{button}}'>Submit</button><button class='btn btn-default pull-right btn-sm' type='button' id='cancel'>Cancel</button></div>";
    var rawEventTemplate = "<div class='panel-heading'><h4>Event<button class='pull-right' data-toggle='modal' data-target='#eventHelp' id='help'>?</button></h4></div><div class='panel-body'><pre>{{event_}}</pre><button class='btn btn-primary pull-right' type='button' id='saveEvent'>Submit Event</button></div>";
    var mapTemplate = "<div class='panel-heading'><h4>Choose a Place<button class='pull-right' data-toggle='modal' data-target='#mapHelp' id='help'>?</button></h4></div><div class='panel-body' id='map-holder'></div>";
 
    app.loadEventView = function(){
        app.eventView && app.eventView.remove();
        app.mapView && app.mapView.remove();

        app.eventData = new app.FormModel({
            event_: JSON.stringify(app.event_, undefined, 2)
        });

        app.eventView = new app.DisplayView({
            model: app.eventData,
            rawTemplate: rawEventTemplate
        }).render();

        $('div#eventView').html(app.eventView.el);
    };

    app.loadMapView = function(){
        app.eventView && app.eventView.remove();
        app.mapView && app.mapView.remove();

        app.map = new app.MapModel({
            latID: '#latInput',
            lngID: '#longInput',
            radID: '#radInput'
        });

        app.eventView = new app.DisplayView({
            rawTemplate: mapTemplate
        }).render();

        $('div#eventView').html(app.eventView.el);

        app.mapView = new app.MapView({
            model: app.map,
            collection: new app.MarkerCollection(app.eventPlaces),
            places: app.places,
            rawTemplate: mapTemplate
        }).render();

        $('div#map-holder').html(app.mapView.el);
        app.map.resize();
    };

    app.place = new app.PlaceModel();
    app.eventPlaces = [];

    app.eventFormView = new app.FormView({
        model: app.eventModelData,
        rawTemplate: rawEventFormTemplate
    }).render();

    $('div#eventForm').append(app.eventFormView.el);

    app.hiddenForms.forEach(function(f){
        f.rawTemplate = rawHiddenFormTemplate;
        f.view = new app.HiddenFormView(f).render();

        $('form').append(f.view.el);
    });

}());

$(document).ready(function(){
    app.places.fetch();
    app.assertions.fetch();
    app.events.fetch();
    app.loadEventView();
})
