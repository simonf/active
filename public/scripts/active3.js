
  (function($) {
    var Item, ItemView, List, ListView, listview;
    Item = Backbone.Model.extend({
      defaults: {
        action: 'Something',
        category: 'General',
        quantity: 0,
        units: 'hours',
        updatedAt: new Date().getTime().toString()
      },
      dateAsString: function() {
        var d, dd, dm, dy, r1, t1, t2, th, tm, ua;
        ua = this.get('updatedAt');
        if (ua.indexOf('1') === 0) {
          r1 = new Date(parseInt(ua)).toString('d_MMM-yy HH:mm');
          if (r1 && r1 !== void 0) return r1;
        }
        if (ua.indexOf('2') === 0) {
          dd = ua.split('T');
          if (dd.length === 2) {
            t1 = dd[0].split('-');
            dy = t1[0].substring(2);
            dm = t1[1];
            d = t1[2];
            t2 = dd[1].split(':');
            th = t2[0];
            tm = t2[1];
            return d + '-' + dm + '-' + dy + ' ' + th + ':' + tm;
          }
        }
        if ((typeof ua) === 'string') return ua;
        return ua.toString();
      }
    });
    ItemView = Backbone.View.extend({
      tagName: 'div',
      className: 'inner-row',
      initialize: function() {
        _.bindAll(this, 'render', 'editMe', 'deleteMe');
        this.model.bind('change', this.render, this);
        this.model.bind('destroy', this.remove, this);
      },
      render: function() {
        var item_html;
        item_html = _.template($('#item-templ').html());
        $(this.el).html(item_html({
          model: this.model
        }));
        return this;
      },
      events: {
        'click .item-delete': 'deleteMe',
        'dblclick': 'editMe'
      },
      remove: function() {
        $(this.el).remove();
      },
      deleteMe: function() {
        this.model.destroy({
          error: function(model, response) {
            console.log("Failed to destroy " + model.id);
          }
        });
      },
      editMe: function() {
        var edit_html;
        edit_html = _.template($('#item-edit').html());
        $(this.el).html(edit_html({
          item: this.model
        }));
      }
    });
    List = Backbone.Model.extend({
      model: Item,
      url: '/activities',
      parse: function(response) {
        var retval;
        retval = _(response).map(function(row) {
          return {
            id: row.id,
            action: row.value.action,
            category: row.value.quantity,
            units: row.value.units,
            updatedAt: row.value.updatedAt
          };
        });
        return retval;
      }
    });
    ListView = Backbone.Collection.extend({
      el: $('#main'),
      appendItem: function(item) {
        var itemView;
        itemView = new ItemView({
          model: item
        });
        $('#table-body', this.el).append(itemView.render().el);
      },
      render: function() {
        _(this.collection.models).each(function(item) {
          return this.appendItem(item);
        }, this);
      },
      initialize: function() {
        _.bindAll(this, 'render', 'addItem', 'appendItem', 'updateItem');
        this.collection = new List();
        this.collection.bind('add', this.appendItem);
        this.collection.fetch({
          success: function() {
            listview.render();
          }
        });
      },
      clearInput: function() {
        $('#action-in').val('');
        $('#category-in').val('');
        $('#quantity-in').val(' ');
      },
      addItem: function() {
        var item, qu;
        item = new Item();
        qu = SFUtils.splitNumbersAndUnits($('#quantity-in').val());
        item.set({
          action: $('#action-in').val(),
          category: $('#category-in').val(),
          quantity: qu.num,
          units: qu.units
        });
      },
      updateItem: function(e) {
        var act, cat, mod, qty, qu, tid;
        if (!e || e.keyCode !== 13) return;
        tid = $('#id-edit').html();
        mod = this.collection.get(tid);
        qty = $('#quantity-edit').val();
        qu = SFUtils.splitNumbersAndUnits(qty);
        act = $('#action-edit').val();
        cat = $('#category-edit').val();
        mod.set({
          action: act,
          category: cat,
          quantity: qu.num,
          units: qu.units
        }, {
          silent: true
        });
        mod.save({
          action: act,
          category: cat,
          quantity: qu.num,
          units: qu.units
        });
        mod.change();
      },
      events: {
        'click button#add': 'addItem',
        'keypress': 'updateItem'
      }
    });
    listview = new ListView();
    $('.submit-on-enter').on('keypress', function(e) {
      if (!((e.which && e.which === 13) || (e.keyCode && e.keyCode === 13))) {
        return true;
      }
      $('button.default-button').click();
      $('#action-in').focus();
      return false;
    });
    $('#action-in').focus();
  })(jQuery);
