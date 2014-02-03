var cellView = Backbone.View.extend({
	tagName: 'td',
	initialize: function() {
		//console.log(this);
	},

	render: function() {
		var attributes = this.model ? this.model.attributes : {};
		this.$el.append(function(){
			var d = attributes.text;
			var str = typeof(d) === 'object' ? JSON.stringify(d) : d.toString();
			return str.length > 75 ? str.substring(0, 75) + '...' : str;
		});

		if (this.model.attributes.isID){
			this.$el.attr('id', 1);
		}

		return this;
	},

	events: {
		click: 'onClick'
	},

	onClick: function() {
		var elem = this;
		var attributes = this.model ? this.model.attributes : {};
		var text = attributes.text;
		$('.data_table_text').text(function(){
			try {
				return JSON.stringify(JSON.parse(text), undefined, 2);
			} catch (e) {
				return text;
			}
		});
			
		$('td').css('font-weight', 'normal');
		elem.$el.css('font-weight', 'bold');
		
		var id = null;
		elem.$el.parent('tr').children().each(function(){
			if ($(this).get(0).id === '1'){
				id = $(this).text();
			}
		});

		console.log(JSON.stringify({_id: id, field_value: text}));		
	}
});

var rowView = Backbone.View.extend({
	tagName: 'tr',
	className: 'unlit',
	initialize: function() {
		this.keys = this.options.keys ? this.options.keys : [];
	},

	render: function() {
		var elem = this;
		var attributes = elem.model ? elem.model.attributes : {};
		elem.keys.forEach(function(k){
			if (!attributes.hasOwnProperty(k)) {
				attributes[k] = 'N/A';
			}

			var isID = k === '_id';

			var cellEx = new cell({text: attributes[k], isID: isID});
			var cellViewEx = new cellView({model:cellEx}).render();
			elem.$el.append(cellViewEx.el);
			
		});
		return elem;
	},

	events: {
		click: 'onClick',
		mouseover: 'onMouseover',
		mouseout: 'onMouseout'
	},

	onClick: function(){
		//console.log('the row was clicked');
		//console.log(this);
		//me.announce(JSON.stringify({_id: id, field_value: text}));
	},

	onMouseover: function() {
		this.$el.addClass('lit').removeClass('unlit');
	},

	onMouseout: function() {
		this.$el.removeClass('lit').addClass('unlit');
	}
});