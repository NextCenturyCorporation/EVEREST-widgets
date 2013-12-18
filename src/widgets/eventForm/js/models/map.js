var app = app || {};

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

            _.each(me.markers, function(m){
            	me.addMarker(m.get('latitude'), m.get('longitude'), m.get('name'), me.get('BLUE'));

            	if (m.get('radius') > 0){
            		me.addCircle(m.get('latitude'), m.get('longitude'), m.get('radius'), '#0000ff');
            	}
            });

			me.centerMarker = me.addMarker(me.get('lat'), me.get('lng'), 'center', me.get('RED'));
            me.markers.push(me.centerMarker);

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
			//this.addNearbyPlaces(me.center.lat(), me.center.lng());
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
				me.center = me.map.getCenter();
            	$('#latInput').val(me.map.getCenter().lat());
            	$('#longInput').val(me.map.getCenter().lng());
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
				radius: parseFloat(rad)
			});

			return circle;
		},

		addNearbyPlaces: function(lat, lng) {
			//remove any previously added green markers
			this.markers.forEach(function(m) {
				if (m.icon === me.attributes.GREEN) {
					m.setMap(null);
				}
			});

			//add in nearby markers
			me.places.forEach(function(p){
				if ( getDistance( p.latitude, p.longitude, lat, lng) < 100 ) {
					me.addMarker(p.latitude, p.longitude, p.name, me.GREEN);
				}
			});
		},

        resize: function(){
        	google.maps.event.trigger(this.map, 'resize');
        	this.setCenter(this.center);
        }
    });
}());