var toolbar = function(){
	var me = this;
	
	me.shift = 25;
	me.radius = 8;
	me.center = {};
	
	me.num_tools = 0;
	me.mode = "";
	
	var selectColor = '#ff0000';

	me.createSelection = function(svg, class_name, image){
		me.num_tools++;
		
		//add a new space for the new tool, with an onclick event
		var selection = svg.append('g')
			.attr('class', class_name)
			.on('click', me.toggleSelection);
			
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
			d3.selectAll('.toolbar rect').classed('select', false);
			d3.selectAll('.toolbar rect').classed('unselect', true);
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
		} else {
			d3.selectAll('.canvas text').remove();
		}
	};

	me.createToolbar = function(){
		var toolBar = d3.select('.toolbar');
		var svg = toolBar.append('svg')
			.attr('class', 'tsvg');
		
		me.center.x = svg.style('width').split('p')[0] / 2;
		me.center.y = svg.style('height').split('p')[0] / 2;
		
		var node_hold = me.createSelection(svg, 'node_hold', 'img/node.png');
		var rel_hold = me.createSelection(svg, 'rel_hold', 'img/link.png');
		var mover_hold = me.createSelection(svg, 'mover_hold', 'img/mover.png');
		var delete_hold = me.createSelection(svg, 'delete_hold', 'img/delete.png');	
		var select_hold = me.createSelection(svg, 'select_hold', 'img/select.png');
	};
	
	me.getMode = function(){
		return me.mode;
	};
	
	me.setMode = function(m){
		me.mode = m;
	};
};