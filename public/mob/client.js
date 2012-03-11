Ext.define('Activity',{
	extend: 'Ext.data.Model',
	config: {
		fields: ['_id','_rev','action','category','quantity','units','updatedAt'],
	}
});

var mystore = Ext.create('Ext.data.Store', {
	model: 'Activity',
	autoLoad: true,
	proxy: {
		type: 'ajax',
		url: '/activities',
		reader: {
			type: 'json',
			rootProperty: '',
			record: 'value'
		}
	}
});

var tpl = new Ext.XTemplate(
	'<div class="action-row">',
	'<span class="show-action">{action}</span>',
	'<span class="show-category">{category}</span>',
	'<span class="show-qty">{quantity} {units}</span>',
	'<span class="show-date">',
	'{[new Date(parseInt(values.updatedAt)).getDate()]}-',
	'{[new Date(parseInt(values.updatedAt)).getMonth()+1]}-',
	'{[new Date(parseInt(values.updatedAt)).getFullYear()]}',
	'</span></div>'
 );

Ext.application({
    name: 'Sencha',
    launch: function() {
		Ext.create('Ext.List', {
			fullscreen: true,
			store: mystore,
		    itemTpl: tpl //'{action} ({category}): {quantity} {units}'
		});
	}
});