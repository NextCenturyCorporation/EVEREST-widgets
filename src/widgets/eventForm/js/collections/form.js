var app = app || {};

(function() {
    app.FormCollection = Backbone.Collection.extend({
        model: app.FormModel
    });

    app.hiddenForms = new app.FormCollection([
        {
        	id: 'placeDiv',
            button: "submitPlace",
            input: [
                { id: "placeName", label: "Name" }, 
                { id: "latitude", label: "Latitude" },
                { id: "longitude", label: "Longitude" },
                { id: "radius", label: "Radius" }
            ]
        },
        {
        	id: 'tagDiv',
            button: "submitTag",
            input: [
                { id: "tag", label: "Tag" }
            ]
        },
        {
        	id: 'assertDiv',
            button: "submitAssert",
            input: [
                { id: "entity1", label: "Entity 1" }, 
                { id: "relationship", label: "Relationship" },
                { id: "entity2", label: "Entity 2" }
            ]
        },
        {
            id: 'dateDiv',
            button: 'submitDate',
            input: [
                { id: "start_date", label: "Start" },
                { id: "end_date", label: "End" },
                { id: "latestStart", label: "Latest Start" },
                { id: "earliestEnd", label: "Earliest End" }
            ]
        }
    ]);
}());