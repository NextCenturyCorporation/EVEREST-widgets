var toolbar = function(div_class){
	var me = this;
	me.hold = d3.select(div_class);
	me.shift = 25;
	me.radius = 8;
	me.center = {
		x: me.hold.style('width').split('p')[0] / 2,
		y: me.hold.style('height').split('p')[0] / 2
	};
	
	me.svg = me.hold.append('svg').attr('class', 'tsvg')
		.attr('width', me.center.x * 2)
		.attr('height', me.center.y * 2);
	
	me.num_tools = 0;
	me.mode = "";
	
	me.createSelection = function(class_name, image, callback){
		var clickFunction;
		if ( callback !== undefined ){
			clickFunction = callback;
		} else {
			clickFunction = me.toggleSelection;
		}
		
		me.num_tools++;
		
		//add a new space for the new tool, with an onclick event
		var selection = me.svg.append('g')
			.attr('class', class_name)
			.on('click', clickFunction);
			
		selection.append('svg:image')
			//.attr('class', 'unselect')
			.attr('xlink:href', image)
			.attr('x', me.center.x - 12.5)
			.attr('y', me.num_tools * me.shift)
			.attr('width', 25 )
			.attr('height', 25 );
			
		//add the background svg element to show tool usage
		selection.append('rect')
			.attr('class', 'unselect')
			.attr('x', me.center.x - 12.5)
			.attr('y', me.num_tools * me.shift)
			.attr('rx', 3)
			.attr('ry', 3)
			.attr('width', 25 )
			.attr('height', 25 );
			
		return selection;
	};

	me.toggleSelection = function(){
		var item = d3.select(this);
		
		//if the item being toggled is already off, turn it on
		if(item.select('rect').classed('unselect')){
			me.svg.selectAll('rect').classed('select', false);
			me.svg.selectAll('rect').classed('unselect', true);
			item.select('rect').classed('unselect', false)
				.classed('select', true);
			
			me.mode = item.attr('class');
			
		//if the item being toggled is currently on, just turn it off
		} else {
			item.select('rect').classed('select', false)
				.classed('unselect', true);
				
			//clear mode and remove any labels
			me.mode = '';
		}	
	};
	
	me.getMode = function(){
		return me.mode;
	};
	
	me.setMode = function(m){
		me.mode = m;
	};
};