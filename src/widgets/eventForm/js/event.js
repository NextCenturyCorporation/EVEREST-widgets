(function(){
	/** to get rid of the annoying scroll bar on the right when modals pop up 
	 *  get rid of the overflow-y: scroll style
	 */
	
	var getPlaces = function(){
		$.ajax({
			url: 'http://everest-build:8081/place',
			type: 'GET',
			success: function(data){
				map.setPlaces(data.docs);
			},
			error: function(err) {
				console.log(err);
			}
		})
	};

	var map = new google_map();

	var eventRawTemplate = "<div class='panel-heading'><h4>Event<button class='pull-right' data-toggle='modal' data-target='#eventHelp' id='help'>?</button></h4></div><div class='panel-body'><pre>{{event_}}</pre><button class='btn btn-primary pull-right' type='button' id='saveEvent'>Submit Event</button></div>";
	var mapRawTemplate = "<div class='panel-heading'><h4>Choose a Place<button class='pull-right' data-toggle='modal' data-target='#mapHelp' id='help'>?</button></h4></div><div class='panel-body'><div id='map-canvas'></div></div>";
	var modalRawTemplate = "<div class='modal' id='{{modal_id}}'' tabIndex='-1' role='dialog' aria-labelledby='modalLabel' aria-hidden='true'><div class='modal-dialog'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-dismiss='modal' aria-hidden='true'>&times;</button><h4 class='modal-title' id='modalLabel'>{{title}}</h4></div><div class='modal-body'>{{body}}</div></div></div></div>";

	var eventTemplate = Handlebars.compile(eventRawTemplate);
	var mapTemplate = Handlebars.compile(mapRawTemplate);
	var modalTemplate = Handlebars.compile(modalRawTemplate);
	var loadEventTemplate = function(event_){
		$('#object').html(eventTemplate({
			event_: JSON.stringify(event_, undefined, 2)
		}));

		$('#saveEvent').click(function() {
			async.each(event_.assertions, function(assert, callback){

				var tempAssert = {
					name: assert.entity1 + ' ' + assert.relationship + ' ' + assert.entity2,
					entity1: [{value: assert.entity1}],
					relationship: [{value: assert.relationship}],
					entity2: [{value: assert.entity2}]
				};

				$.ajax({
					url: 'http://everest-build:8081/target-assertion',
					type: 'POST',
					dataType: 'json',
					data: tempAssert,
					success: function(data) {
						assert._id = data._id;
						loadEventTemplate(event_);
						callback();
					},
					error: function(err) {
						console.log(err);
						callback(err);
					}
				});
			}, function(err){
				if (!err){
					var tempEvent = {
						name: event_.name,
						description: event_.description,
						place: event_.place,
						tags: event_.tags,
						event_horizon: event_.event_horizon,
						assertions: []
					};

					event_.assertions.forEach(function(assert){
						tempEvent.assertions.push(assert._id);
					});

					$.ajax({
						url: 'http://everest-build:8081/event',
						type: 'POST',
						dataType: 'json',
						data: tempEvent,
						success: function(data){
							event_.id = data._id;
							loadEventTemplate(event_);
						},
						error: function(err) {
							console.log(err);
						}
					});
				}
			});
		});
	};

	var getValue = function(identifier) {
		var value = $(identifier).val();
		$(identifier).val('');
		return value;
	};

	var event_ = {
		name: "",
		description: "",
		place: [],
		tags : [],
		assertions: [],
		event_horizon: []
	};

	var assertIds = [];

	loadEventTemplate(event_);
	$('body').append(modalTemplate({
		modal_id: 'eventHelp',
		title: 'Event Help',
		body: 'Here are some helpful facts'
	}));

	$('body').append(modalTemplate({
		modal_id: 'mapHelp',
		title: 'Map Help',
		body: 'Here are some helpful facts'
	}));

	$('body').append(modalTemplate({
		modal_id: 'formHelp',
		title: 'Form Help',
		body: 'Here are some helpful facts'
	}));

	$(':button').each(function(){
		if ($(this).attr('data-target')) {
			$(this).click(function() {
				$('div').removeClass('has-error');
				$('.hid').hide();
				$($(this).attr('data-target')).show();


				if ($(this).attr('id') === 'placeButton'){
					$('#object').html(mapTemplate);
					map.initialize('map-canvas', '#latInput', '#longInput', '#radInput');
					getPlaces();
					event_.place.forEach(function(p){
						map.addMarker(p.latitude, p.longitude, p.name, map.BLUE);
						if (p.radius > 0){
							map.addCircle(p.latitude, p.longitude, p.radius, '#0000ff');
						}
					});
				} else {
					loadEventTemplate(event_);
				}
			});
		} 

		if ($(this).attr('id') === 'cancel'){
			$(this).click(function(){
				$('div').removeClass('has-error');
				$('.hid').hide();
				loadEventTemplate(event_);
			});
		}
	});

	$('#submitPlace').click(function(){
		$('div').removeClass('has-error');
		var p = {
			name: getValue('#placeNameInput'),
			latitude: parseFloat(getValue('#latInput')),
			longitude: parseFloat(getValue('#longInput')),
			radius: parseFloat(getValue('#radInput')) || 0
		};

		event_.place.push(p);
		loadEventTemplate(event_);
		$('#placeDiv').hide();
	});

	$('#submitTag').click(function(){
		$('div').removeClass('has-error');

		if ($('#tagInput').val() !== '') {
			event_.tags.push(getValue('#tagInput'));
			loadEventTemplate(event_);
			$('#tagDiv').hide();
		} else {
			$('#tagInput').parent().addClass('has-error');
		}
	});

	$('#submitDate').click(function(){
		$('div').removeClass('has-error');
		$('#dateDiv').hide();
	});

	$('#submitAssert').click(function(){
		$('div').removeClass('has-error');
		if ($('#ent1Input').val() !== '') {
			var assertion = {
				entity1: getValue('#ent1Input'),
				relationship: getValue('#relInput'),
				entity2: getValue('#ent2Input'),
			};

			event_.assertions.push(assertion);
			loadEventTemplate(event_);
			$('#assertDiv').hide();
		} else {
			$('#ent1Input').parent().addClass('has-error');
		}
	});

	$('#nameInput').change(function(){
		event_.name = $('#nameInput').val();
		loadEventTemplate(event_);
	});

	$('#descInput').change(function() {
		event_.description = $('#descInput').val();
		loadEventTemplate(event_);
	});

}());