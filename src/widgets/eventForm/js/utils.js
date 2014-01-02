// from Backbone.js Wine Cellar Tutorial -- Christope Coenraets
// coenraets.org/blog/2011/12/backbone-js-wine-cellar-tutorial-part1-getting-started/
var app = app || {};

(function() {
	app.tpl = {
		// Hash of preloaded templates for the app
		templates: {},

		// Recursively pre-load all the templates for the app.
		// This implementation should be changed in a production environment. All the
		// template files shouldbe concatenated in a single file.
		loadTemplates: function(names, callback) {
			var me = this;
			var loadTemplate = function(index) {
				var name = names[index];
				$.get('templates/' + name + '.html', function(data) {
					me.templates[name] = data;
					index++;
					index < names.length ? loadTemplate(index) : callback();
				});
			}

			loadTemplate(0);
		},

		// Get template by name from hash of preloaded templates
		get: function(name) {
			return this.templates[name];
		}

	}
}());