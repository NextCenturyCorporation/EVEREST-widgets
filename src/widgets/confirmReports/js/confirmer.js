var confirmer = function(){
	var me = this;
	var url = 'http://everest-build:8081/';
	
	//holder	
	me.createCanvas = function(){
		d3.select('.target-pattern').append('svg');
	};

	me.createListeners = function(){
		d3.select('.confirm').on('click', function(){
		
		});
		
		d3.select('.patterns').on('change', function(){
			var elem = $(this)[0];
			
			console.log(elem.options[elem.selectedIndex].text);
		});
	};
	
	me.display = function(){
		$.getJSON(url + 'alpha_report/?callback=?', function(data){
			//grab an alpha report
			var ar = data[0];
			
			//display alpha report
			console.log(JSON.stringify(ar));
			d3.select('.alpha-info').append('text')
				.text(JSON.stringify(ar));
			
			//grab corr. assertions
			$.getJSON(url +'assertion/?callback=?', function(asserts){
				var assertions = [];
				for (var i = 0; i < asserts.length; i++){
					console.log(asserts[i].alpha_report_id);
					if (asserts[i].alpha_report_id === ar._id){
						assertions.push(asserts[i]);
					}
				}
				
				var svg = d3.select('.asserts').append('svg')
					.attr('width', 500)
					.attr('height', 500);
					
				svg.append('defs').append('marker')
					.attr('id', 'Triangle')
					.attr('refX', 0).attr('refY', 3)
					.attr('markerUnits', 'strokeWidth')
					.attr('markerWidth', 100)
					.attr('markerHeight', 100)
					.attr('orient', 'auto')
					.append('svg:path')
						.attr('d', 'M 0 0 L 6 3 L 0 6 z');
						
				//display assertions
				var net = new network(svg, assertions, 'disjoint');
				net.draw();

				//grab all target events
				
				//display target event options in drop down menu
				
				//display 1st target event in list
				
				//percentage alert
			});
		});
	};
};