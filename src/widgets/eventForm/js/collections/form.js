var app = app || {};

(function() {
    app.FormCollection = Backbone.Collection.extend({
        model: app.FormModel
    });

    app.hiddenForms1 = new app.FormCollection([
        new app.FormModel({
        	id: 'placeDiv',
            button: "submitPlace",
            input: [
                { id: "placeNameInput", label: "Name" }, 
                { id: "latInput", label: "Latitude" },
                { id: "longInput", label: "Longitude" },
                { id: "radInput", label: "Radius" }
            ]
        }),
        new app.FormModel({
        	id: 'tagDiv',
            button: "submitTag",
            input: [
                { id: "tagInput", label: "Tag" }
            ]
        }),
        new app.FormModel({
        	id: 'assertDiv',
            button: "submitAssert",
            input: [
                { id: "ent1Input", label: "Entity 1" }, 
                { id: "relInput", label: "Relationship" },
                { id: "ent2Input", label: "Entity 2" }
            ]
        })
    ]);
}());