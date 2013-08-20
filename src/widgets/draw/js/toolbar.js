var toolbar = function(){
	var me = this;
	
	me.shift = 25;
	me.radius = 8;
	me.center = {};
	
	me.num_tools = 0;
	me.mode = "";
	
	var selectColor = 'ff0000';

	me.createSelection = function(svg, class_name){
		me.num_tools++;
		
		//add a new space for the new tool, with an onclick event
		var selection = svg.append('g')
			.attr('class', class_name)
			.on('click', me.toggleSelection);
		
		//add the background svg element to show tool usage
		selection.append('rect')
			.attr('class', 'unselect')
			.attr('x', me.center.x - me.radius - 3)
			.attr('y', me.num_tools * me.shift - me.radius - 3)
			.attr('width', 2*(me.radius + 3) )
			.attr('height', 2*(me.radius + 3) );
			
		return selection;
	};

	me.toggleSelection = function(){
		var item = d3.select(this);
		
		//if the item being toggled is already off, turn it on
		if(item.select('rect').classed('unselect')){
			d3.selectAll('rect').classed('select', false);
			d3.selectAll('rect').classed('unselect', true);
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
		
		if (me.mode === 'label_hold'){
			me.addAllLabels();
		}
	};

	me.createToolbar = function(){
		var toolBar = d3.select('.toolbar');
		var svg = toolBar.append('svg')
			.attr('class', 'tsvg');
		
		var w = svg.style('width').split('p')[0];
		var h = svg.style('height').split('p')[0];
		console.log(w,h);
		me.center.x = w / 2;
		me.center.y = h / 2;
		
		var label_hold = me.createSelection(svg, 'label_hold');
		label_hold.append('text')
			.attr('x', me.center.x)
			.attr('y', me.num_tools * me.shift)
			.attr('text-anchor', 'middle')
			.attr('dy', '0.35em')
			.text('abc');
		
		var node_hold = me.createSelection(svg, 'node_hold');
		node_hold.append('circle')
			.attr('class', 'entity')
			.attr('cx', me.center.x)
			.attr('cy', me.num_tools * me.shift)
			.attr('r', me.radius);
		
		var rel_hold = me.createSelection(svg, 'rel_hold');
		rel_hold.append('line')
			.attr('class', 'relationship')
			.attr('x1', me.center.x - me.radius)
			.attr('y1', me.num_tools * me.shift - me.radius)
			.attr('x2', me.center.x + me.radius)
			.attr('y2', me.num_tools * me.shift + me.radius)
			.attr('marker-mid', 'url(#Triangle)');
		
		rel_hold.append('path')
			.attr('class', 'relationship')
			.attr('marker-mid', 'url(#Triangle)')
			.attr('d', function(){
				return 'M'+ (me.center.x - me.radius)+' ' + (me.num_tools * me.shift - me.radius) +
					  ' L'+ me.center.x + ' ' + (me.num_tools * me.shift) +
					  ' L'+ (me.center.x + me.radius)+' ' + (me.num_tools * me.shift + me.radius);
			});
		
		var mover_hold = me.createSelection(svg, 'mover_hold');	
		mover_hold.append('line')
			.attr('x1', me.center.x)
			.attr('y1', me.num_tools * me.shift - me.radius)
			.attr('x2', me.center.x)
			.attr('y2', me.num_tools * me.shift + me.radius);
		
		mover_hold.append('line')
			.attr('x1', me.center.x - me.radius)
			.attr('y1', me.num_tools * me.shift)
			.attr('x2', me.center.x + me.radius)
			.attr('y2', me.num_tools * me.shift);	
			
		var undo_hold = me.createSelection(svg, 'undo_hold');
		undo_hold.append('text')
			.attr('x', me.center.x)
			.attr('y', me.num_tools * me.shift)
			.attr('text-anchor', 'middle')
			.attr('dy', '0.35em')
			.attr('font-size', 12)
			.text('undo');
		
		var delete_hold = me.createSelection(svg, 'delete_hold');
		delete_hold.append('circle')
			.attr('cx', me.center.x)
			.attr('cy', me.num_tools * me.shift)
			.attr('r', me.radius)
			.style('stroke', selectColor);
		
		delete_hold.append('line')
			.attr('x1', me.center.x - me.radius)
			.attr('y1', me.num_tools * me.shift)
			.attr('x2', me.center.x + me.radius)
			.attr('y2', me.num_tools * me.shift)
			.style('stroke', selectColor);
			
		var select_hold = me.createSelection(svg, 'select_hold');
		select_hold.select('rect').style('stroke', 'black');
	};
	
	me.getMode = function(){
		return me.mode;
	};
	
	me.setMode = function(m){
		me.mode = m;
	};
	
	/**
		called from me.toggleSelection when mode is label_hold
		@param - none
		@return - none
		@functionality - shows all labels for any element in the canvas
		@internal functions - none
	*/
	me.addAllLabels = function(){
		var x = 0, y = 0;
		d3.selectAll('.canvas circle').each(function(){
			var circle = d3.select(this);
			x = parseInt(circle.attr('cx'), 10) + 15;
			y = parseInt(circle.attr('cy'), 10) - 15;
			d3.select('.canvas svg').append('text')
				.attr('x', x).attr('y', y)
				.text(circle.attr('d'));
		});
		
		d3.selectAll('.canvas line').each(function(){
			var line = d3.select(this);
			x = ((parseInt(line.attr('x1'), 10) + parseInt(line.attr('x2'), 10)) / 2) + 15;
			y = ((parseInt(line.attr('y1'), 10) + parseInt(line.attr('y2'), 10)) / 2) - 15;
			d3.select('.canvas svg').append('text')
				.attr('x', x).attr('y', y)
				.text(line.attr('d'));
		});
	};
};