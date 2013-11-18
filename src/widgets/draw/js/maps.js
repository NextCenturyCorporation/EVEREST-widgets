var validateRadius = function(r) {
	if (r === "" || r <= 0 || parseFloat(r) === null){
		return 0;
	} else {
		return parseFloat(r);
	} 
};

var googlemap = function(){
	var me = this;
	
	me.center = {x: 39.255743, y: -76.711126};
	me.map = {};
	me.marker = null;
	me.circle = null;
	me.state = {
		latitude: me.center.x,
		longitude: me.center.y,
		radius: 0
	};
	
	me.initialize = function(){
		var mapOptions = {
			center: new google.maps.LatLng(me.center.x, me.center.y),
			zoom: 16,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		
		me.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
		
		google.maps.event.addListener(me.map, 'click', function(event) {
			//reset marker and surrounding circle
			if (me.marker) {
				me.marker.setMap(null);
			}
			
			var loc = event.latLng;
			me.marker = new google.maps.Marker({
				map: me.map,
				draggable: false
			});
			
			me.marker.setPosition(loc);
			$('#map-lat').val(loc.lat());
			$('#map-long').val(loc.lng());
			
			me.state.latitude = loc.lat();
			me.state.longitude = loc.lng();
			
			if ($('#map-rad').val() && parseFloat($('#map-rad').val()) > 0) {
				me.updateCircle(loc);
			}
			
			$('#map-rad').keyup(function(){
				me.updateCircle(loc);
			});
		});
	};
	
	me.updateCircle = function(loc){
		if (me.circle) {
			me.circle.setMap(null);
		}
		
		me.circle = new google.maps.Circle({
			strokeColor: '#ff0000',
			strokeOpacity: 0.5,
			strokeWeight: 1,
			fillColor: '#ff0000',
			fillOpacity: 0.1,
			map: me.map,
			center: loc,
			radius: validateRadius($('#map-rad').val())
		});
		
		me.state.radius = validateRadius($('#map-rad').val());
	};
	
	me.resize = function(){
		google.maps.event.trigger(me.map, 'resize');
	};
	
	me.getState = function(){
		return me.state;
	};
};