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
}());