var app = app || {};

(function(){ 
    app.event_ = {
        name: "",
        description: "",
        place: [],
        tags : [],
        assertions: [],
        event_horizon: []
    };

    app.FormModel = Backbone.Model.extend();
    app.eventModelData = new app.FormModel({
        title: "Create an Event",
        helpTarget: "formHelp",
        input: [
            { id: "nameInput", label: "Name" },
            { id: "descInput", label: "Description"}
        ],
        buttons: [
            { id: "placeButton", label: "Add a Place", target: "placeDiv" },
            { id: "tagButton", label: "Add a Tag", target: "tagDiv" },
            { id: "dateButton", label: "Add a Date", target: "dateDiv" },
            { id: "assertButton", label: "Add an Assertion", target: "assertDiv" }
        ]
    });

    app.hiddenForms = [{
            id: 'placeDiv',
            model: new app.FormModel({
                button: "submitPlace",
                input: [
                    { id: "placeNameInput", label: "Name" }, 
                    { id: "latInput", label: "Latitude" },
                    { id: "longInput", label: "Longitude" },
                    { id: "radInput", label: "Radius" }
                ]
            })
        },{
            id: 'tagDiv',
            model: new app.FormModel({
                button: "submitTag",
                input: [
                    { id: "tagInput", label: "Tag" }
                ]
            })
        },{
            id: 'assertDiv',
            model: new app.FormModel({
                button: "submitAssert",
                input: [
                    { id: "ent1Input", label: "Entity 1" }, 
                    { id: "relInput", label: "Relationship" },
                    { id: "ent2Input", label: "Entity 2" }
                ]
            })
        }

    ];
}());