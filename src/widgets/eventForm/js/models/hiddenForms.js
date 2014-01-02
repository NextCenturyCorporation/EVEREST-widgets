var app = app || {};

(function() {
    app.PlaceModel = Backbone.Model.extend({
    	defaults: {
    		radius: 0
    	},
        idAttribute: "_id",
        validate: function(attrs) {
            this.set('latitude', parseFloat(this.get('latitude')));
            this.set('longitude', parseFloat(this.get('longitude')));
            this.set('radius', parseFloat(this.get('radius')));

        	if (!this.get('name') || this.get('name') === '') {
        		return "placeName"
        	} else if ( isNaN(this.get('latitude')) ) {
		    	return "latitude"
		    } else if ( isNaN(this.get('longitude')) ) {
		    	return "longitude"
		    } else if ( isNaN(this.get('radius')) || this.get('radius') < 0 ) {
		    	return "radius";
		    }
        }
    });

    app.TagModel = Backbone.Model.extend({
        validate: function() {
            if (!this.get('tag') || this.get('tag') === '') {
                return "tag"
            }
        }
    });

    app.DateModel = Backbone.Model.extend({
        validate: function(){
            var start = Date.parse(this.get('start_date'));
            var end = Date.parse(this.get('end_date'));
            var latestStart = Date.parse(this.get('latestStart'));
            var earliestEnd = Date.parse(this.get('earliestEnd'));
            if ( !this.get('start_date') || isNaN(start) ) {
                return 'start';
            } else if ( start > end ) {
                return 'end';
            } else if ( this.get('latestStart') && isNaN(latestStart) ) {
                return 'latestStart';
            } else if ( this.get('earliestEnd') && isNaN(earliestEnd) ) {
                return 'earliestEnd';
            }
        }
    });

    app.AssertionModel = Backbone.Model.extend({
        idAttribute: "_id",
        validate: function() {
            if ( !this.get('entity1') || this.get('entity1') === '' ) {
                return 'entity1'
            }
        }
    });
}());