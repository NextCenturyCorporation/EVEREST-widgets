require.config({
    paths: {
        jquery: 'libs/jquery-2.0.3.min',
        underscore: 'libs/underscore-1.5.2.min',
        backbone: 'libs/backbone-1.1.0.min',
        handlebars: 'libs/handlebars-1.0.0',
        bootstrap: 'libs/bootstrap-3.0.0.min',
        moment: 'libs/moment-2.3.1.min',
        text: 'libs/text',
        Templates: 'templates/templates',
        Views: 'views/views'
    },

    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: ['jquery', 'underscore'],
            exports: 'Backbone'
        },
        bootstrap: {
            deps: ['jquery'],
            exports: 'bootstrap'
        },
        handlebars: {
            exports: 'Handlebars'
        }
    }
});

require([
    'router'
],

function(Router) {
    new Router();
    Backbone.history.start();
});