var app = app || {};

var getRadians = function(val){
	return val * Math.PI / 180;
};

var getDistance = function(lat1, lng1, lat2, lng2){
	var R = 6371000;  //meters

	var dLat = getRadians(lat2 - lat1);
	var dLng = getRadians(lng2 - lng1);
	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + 
		Math.cos(getRadians(lat1)) * Math.cos(getRadians(lat2)) *
		Math.sin(dLng / 2) * Math.sin(dLng / 2);

	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	return R * c;
};

(function() {
    app.MapModel = Backbone.Model.extend({
        defaults: {
        	lat: 39.255743,
        	lng: -76.711126,
        	mapOptions: {
	        	zoom: 16,
	        	center: new google.maps.LatLng(39.255743, -76.711126),
	        	mapTypeId: google.maps.MapTypeId.ROADMAP
	        },
	        RED: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
	        BLUE: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
			GREEN: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
        },

        initialize: function(options) {
        	this.center = this.attributes.mapOptions.center;
        	$(options.latID).val(this.get('lat'));
			$(options.lngID).val(this.get('lng'));
			$(options.radID).val('0');
        },

        setup: function(){
        	var me = this;

        	_.each(me.places, function(p) {
        		var marker = me.addMarker(p.get('latitude'), p.get('longitude'), p.get('name'), me.get('GREEN'));
        		marker.setMap(null);
        		p.set('marker', marker);
			});

            _.each(me.eventPlaces, function(m){
            	me.addMarker(m.get('latitude'), m.get('longitude'), m.get('name'), me.get('BLUE'));

            	if (m.get('radius') > 0){
            		me.addCircle(m.get('latitude'), m.get('longitude'), m.get('radius'), '#0000ff');
            	}
            });

			me.centerMarker = me.addMarker(me.get('lat'), me.get('lng'), 'center', me.get('RED'));

            var lat = me.get('latID'),
            	lng = me.get('lngID'),
            	rad = me.get('radID');

            $(lat + "," + lng).change(function() {
				me.setCenter(new google.maps.LatLng($(lat).val(), $(lng).val()));
			});

			$(me.get('radID')).change(function(){
				if ( !me.centerCircle ) {
					me.centerCircle = me.addCircle($(lat).val(), $(lng).val(), $(rad).val(), '#ff0000');
					me.centerCircle.bindTo('center', me.centerMarker, 'position');
				} else {
					me.centerCircle.setRadius(parseFloat($(rad).val()));
				}
			});
        },

        setCenter: function(latlng){
        	this.center = latlng;
			this.map.setCenter(this.center);
			this.centerMarker.setPosition(this.center);
			this.addNearbyPlaces(this.center.lat(), this.center.lng());
        },

        addMarker: function(lat, lng, title, color) {
        	var me = this;
			
			var latlng = new google.maps.LatLng(lat, lng);
			var marker = new google.maps.Marker({
				position: latlng,
				map: me.map,
				draggable: color === me.attributes.RED,
				title: title,
				icon: color
			});

			google.maps.event.addListener(marker, 'dragend', function() {
				me.setCenter(marker.getPosition());
            	$(me.get('latID')).val(me.map.getCenter().lat());
            	$(me.get('lngID')).val(me.map.getCenter().lng());
			});

			return marker;
        },

        addCircle: function(lat, lng, rad, color) {
        	var me = this;
			var latlng = new google.maps.LatLng(lat, lng);
			var circle = new google.maps.Circle({
				strokeColor: color,
				strokeOpacity: 0.5,
				strokeWeight: 1,
				fillColor: color,
				fillOpacity: 0.1,
				map: me.map,
				center: latlng,
				radius: rad
			});

			return circle;
		},

		addNearbyPlaces: function(lat, lng) {
			var me = this;
			_.each(me.places, function(p) {
				if ( getDistance( p.get('latitude'), p.get('longitude'), lat, lng) < 100 ) {
					p.get('marker').setMap(me.map);
				} else {
					p.get('marker').setMap(null);
				}
			});
		},

        resize: function(){
        	google.maps.event.trigger(this.map, 'resize');
        	this.setCenter(this.center);
        }
    });
}());