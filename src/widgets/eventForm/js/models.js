var app = app || {};

(function(){ 
    app.eventModelData = new app.FormModel({
        title: "Create an Event",
        helpTarget: "formHelp",
        input: [
            { id: "name", label: "Name" },
            { id: "description", label: "Description"}
        ],
        buttons: [
            { id: "placeButton", label: "Add a Place", target: "placeDiv" },
            { id: "tagButton", label: "Add a Tag", target: "tagDiv" },
            { id: "dateButton", label: "Add a Date", target: "dateDiv" },
            { id: "assertButton", label: "Add an Assertion", target: "assertDiv" },
            { id: "reportButton", label: "Add a Report", target: "reportDiv" }
        ]
    });
}());