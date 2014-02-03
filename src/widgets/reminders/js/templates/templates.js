define(function(require) {

    var Handlebars                = require('handlebars')
      , Moment                    = require('moment')
      , _aspirinReminderForm      = require('text!templates/aspirin.html')
      , _colorectalReminderForm   = require('text!templates/colorectal.html')
      , _hypertensionReminderForm = require('text!templates/hypertension.html')
      , _reminderForm             = require('text!templates/reminderForm.html')
      , _reminderList             = require('text!templates/reminderList.html')
      , _patientList              = require('text!templates/patientList.html')
      , _patientSelector          = require('text!templates/patientSelector.html')
      , _reminderSelector         = require('text!templates/reminderSelector.html')
      , _painScreenReminderForm   = require('text!templates/painScreen.html')
      , _pneumoVaxReminderForm    = require('text!templates/pneumoVax.html')
      , _influenzaVaxReminderForm = require('text!templates/influenzaVax.html')
      , _advDirectiveReminderForm = require('text!templates/advDirective.html');

    /*var formatDate = function() {
      return function(text, render) {
        console.log(text);
        var date = render(text);
        console.log(date);
        return Moment(date).format("MM-DD-YYYY");
      }
    };*/

    var getCompiledTemplate = function(t, context) {
        var compiledTemplate = Handlebars.compile(t);
        return context ? compiledTemplate(context) : compiledTemplate;
    };

    return {
        painScreenReminderForm: function() {
            return getCompiledTemplate(_painScreenReminderForm, arguments[0]);
        },

        advDirectiveReminderForm: function() {
            return getCompiledTemplate(_advDirectiveReminderForm, arguments[0]);
        },

        influenzaVaxReminderForm: function() {
            return getCompiledTemplate(_influenzaVaxReminderForm, arguments[0]);
        },

        pneumoVaxReminderForm: function() {
            return getCompiledTemplate(_pneumoVaxReminderForm, arguments[0]);
        },

        aspirinReminderForm: function() {
            return getCompiledTemplate(_aspirinReminderForm, arguments[0]);
        },

        colorectalReminderForm: function() {
            return getCompiledTemplate(_colorectalReminderForm, arguments[0]);
        },

        hypertensionReminderForm: function() {
            return getCompiledTemplate(_hypertensionReminderForm, arguments[0]);
        },

        reminderForm: function() {
            return getCompiledTemplate(_reminderForm, arguments[0]);
        },

        reminderList: function() {
            return getCompiledTemplate(_reminderList, arguments[0]);
        },

        patientList: function() {
            return getCompiledTemplate(_patientList, arguments[0]);
        },

        patientSelector: function() {
            return getCompiledTemplate(_patientSelector, arguments[0]);
        },

        reminderSelector: function() {
            return getCompiledTemplate(_reminderSelector, arguments[0]);
        }
    };
});