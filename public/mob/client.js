Ext.define('Activity',{
	extend: 'Ext.data.Model',
	config: {
		fields: ['action','category','quantity','units','updatedAt'],
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

var listPanel = Ext.create('Ext.dataview.List',{
	title: 'Activities',
	iconCls: 'star',
	store: mystore,
	itemTpl: tpl,
	listeners: {
		itemtap: function(view, index, target, record, e, eOpts) {
			alert(record.action);
		}
	}
});

var fieldSet = Ext.create('Ext.form.FieldSet',{
	title: 'Activity',
    instructions: '(timestamp defaults to today)',
    items: [
        { xtype: 'textfield', name: 'action', label: 'Action' },
        { xtype: 'textfield', name: 'category', label: 'Category' },
        { xtype: 'textfield', name: 'quantity',	label: 'Quantity' },
		{ xtype: 'textfield', name: 'units', label: 'Units'	}
    ]
});


Ext.application({
    name: 'Sencha',
    launch: function() {
        var mainContainer = Ext.create("Ext.tab.Panel", {
            fullscreen: true,
			tabBarPosition: 'bottom',
            items: [
				listPanel, 
                {
                    title: 'Activity',
                    iconCls: 'user',
                    xtype: 'formpanel',
                    layout: 'vbox',
                    items: [ fieldSet,
	                   {
                            xtype: 'button',
                            text: 'Create',
                            ui: 'confirm',
                            handler: function() {
								var a = this.up('formpanel').getValues();
								var b = new Activity();
								b.setData(a);
								b.set('updatedAt',new Date().getTime().toString());
								listPanel.getStore().add(b);
								listPanel.getStore().sync();
								listPanel.refresh();
								this.up('tabpanel').setActiveItem(0);
                            }
                        }
					]
				}
			]
		});
		mainContainer.setActiveItem(1);
	}
});
