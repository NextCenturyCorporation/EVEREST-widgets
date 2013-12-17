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

var google_map = function() {
	
	var LAT = 39.255743;
	var LNG = -76.711126;

	var me = this;
	var map = null;
	me.center = new google.maps.LatLng(LAT, LNG);
	me.centerMarker = null;

	me.BLUE = 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
	me.RED = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
	me.GREEN = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';

	me.places = [];

	var mapOptions = {
		center: me.center,
		zoom: 16,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	var markers = [];
	var circles = [];

	me.initialize = function(id, latID, lngID, radID) {
		map = new google.maps.Map(document.getElementById(id), mapOptions);
		google.maps.event.addListener(map, 'center_changed', function() {
			me.center = map.getCenter();
			$(latID).val(me.center.lat());
			$(lngID).val(me.center.lng());
		});

		me.centerMarker = me.addMarker(LAT, LNG, 'center', me.RED);

		$(latID).val(LAT);
		$(lngID).val(LNG);
		$(radID).val('0');

		$(latID + "," + lngID).change(function() {
			me.setCenter(new google.maps.LatLng($(latID).val(), $(lngID).val()));
		});
	};

	me.setCenter = function(latlng) {
		me.center = latlng;
		map.setCenter(me.center);
		me.centerMarker.setPosition(me.center);
		me.addNearbyPlaces(me.center.lat(), me.center.lng());
	};

	me.getCenter = function(){
		return map.getCenter();
	}

	me.addMarker = function(lat, lng, title, color) {
		var draggable = color === me.RED;
	
		var latlng = new google.maps.LatLng(lat, lng);
		var marker = new google.maps.Marker({
			position: latlng,
			map: map,
			draggable: draggable,
			title: title,
			icon: color
		});

		google.maps.event.addListener(marker, 'dragend', function(){
			me.setCenter(marker.getPosition());
		});

		markers.push(marker);
		return marker;
	};

	me.addCircle = function(lat, lng, rad, color) {
		var latlng = new google.maps.LatLng(lat, lng);
		circles.push(new google.maps.Circle({
			strokeColor: color,
			strokeOpacity: 0.5,
			strokeWeight: 1,
			fillColor: color,
			fillOpacity: 0.1,
			map: map,
			center: latlng,
			radius: rad
		}));
	};

	me.setPlaces = function(places){
		me.places = places;
	};

	me.addNearbyPlaces = function(lat, lng) {
		//remove any previously added green markers
		markers.forEach(function(m){
			if (m.icon === me.GREEN){
				m.setMap(null);
			}
		});

		//add in nearby markers
		me.places.forEach(function(p){
			if ( getDistance( p.latitude, p.longitude, lat, lng) < 100 ) {
				me.addMarker(p.latitude, p.longitude, p.name, me.GREEN);
			}
		});
	};
}