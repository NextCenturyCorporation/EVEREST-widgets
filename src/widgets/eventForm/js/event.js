var app = app || {};

(function() {
    app.loadEventView = function(){
        app.eventView && app.eventView.remove();
        app.mapView && app.mapView.remove();

        app.eventView = new app.DisplayView({
            model: app.eventData,
            rawTemplate: app.tpl.get('event')
        }).render();

        $('div#eventView').html(app.eventView.el);
    };

    app.loadMapView = function(){
        app.eventView && app.eventView.remove();
        app.mapView && app.mapView.remove();

        app.eventView = new app.DisplayView({
            rawTemplate: app.tpl.get('map')
        }).render();

        $('div#eventView').html(app.eventView.el);

        app.map = new app.MapModel({
            titleID: '#placeName',
            latID: '#latitude',
            lngID: '#longitude',
            radID: '#radius'
        });

        app.mapView = new app.MapView({
            model: app.map,
            collection: new app.MarkerCollection(app.eventPlaces),
            places: app.places,
            rawTemplate: app.tpl.get('map')
        }).render();

        $('div#map-holder').html(app.mapView.el);
        app.map.resize();
    };

    app.loadHiddenFormView = function(formId) {
        app.hiddenView && app.hiddenView.remove();
        app.hiddenView = new app.HiddenFormView({
            model: app.hiddenForms.get(formId),
            id: formId,
            rawTemplate: app.tpl.get('hiddenForm')
        }).render();


        $('form').append(app.hiddenView.el);

        formId === 'placeDiv' ? app.loadMapView() : app.loadEventView();

        if (formId === 'dateDiv') {
            $('#start').datetimepicker();
            $('#end').datetimepicker();
            $('#latest').datetimepicker();
            $('#earliest').datetimepicker();
        } 
    };

    app.place = new app.PlaceModel();
    app.eventPlaces = [];

    app.eventData = new app.FormModel({
        name: "",
        description: "",
        place: [],
        tags : [],
        assertions: [],
        event_horizon: []
    });

    app.router = new Backbone.Router();
    app.router.route('hiddenForm/:div', 'loadHidden', app.loadHiddenFormView);

    app.tpl.loadTemplates(['event','eventForm','hiddenForm','map'], function() {
        app.eventFormView = new app.FormView({
            model: app.eventModelData,
            rawTemplate: app.tpl.get('eventForm')
        }).render();

        $('div#eventForm').append(app.eventFormView.el);
        app.loadEventView();
    });
}());

$(document).ready(function(){
    app.places.fetch();
    app.assertions.fetch();
    app.events.fetch();

    Backbone.history.start();
});
