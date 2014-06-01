// Generated by CoffeeScript 1.7.1
(function() {
  var root;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.ItemView = Backbone.View.extend({
    tagName: 'div',
    className: 'inner-row',
    events: {
      "click .item-delete": "deleteMe",
      "dblclick": "editMe"
    },
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
    remove: function() {
      $(this.el).remove();
    },
    deleteMe: function() {
      this.model.destroy({
        error: function(model, response) {
          return console.log("Failed to destroy " + model.id);
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

  root.ListView = Backbone.View.extend({
    el: $('#main'),
    initialize: function() {
      _.bindAll(this, 'render', 'addItem', 'appendItem', 'prependItem', 'updateItem', 'getItemFromForm', 'addClicked');
      this.collection = new List();
      this.collection.bind('add', this.prependItem);
      this.collection.bind('draw', this.render);
      this.collection.url = '/activities?limit=25';
      this.collection.fetch({
        success: (function(_this) {
          return function() {
            _this.collection.url = _this.collection.baseURL;
            return _this.render();
          };
        })(this)
      });
    },
    appendItem: function(item) {
      var itemView;
      itemView = new ItemView({
        model: item
      });
      $('#table-body', this.el).append(itemView.render().el);
    },
    prependItem: function(item) {
      var itemView;
      itemView = new ItemView({
        model: item
      });
      $('#table-body', this.el).prepend(itemView.render().el);
    },
    render: function() {
      $('#table-body', this.el).empty();
      _(this.collection.models).each(function(item) {
        return this.appendItem(item);
      }, this);
    },
    clearInput: function() {
      $('#action-in').val('');
      $('#category-in').val('');
      $('#quantity-in').val(' ');
      $('#ts-in').val('');
    },
    addClicked: function() {
      var item;
      item = this.getItemFromForm();
      this.addItem(item);
    },
    addItem: function(item) {
      if (item !== null) {
        this.collection.add(item);
        item.save();
        $('#action-in').focus();
      }
    },
    getItemFromForm: function() {
      var ds, explicitDate, inputaction, item, qu;
      item = new Item();
      qu = SFUtils.splitNumbersAndUnits($('#quantity-in').val());
      inputaction = SFUtils.escapeHTML($('#action-in').val());
      if (inputaction) {
        item.set({
          action: inputaction,
          category: SFUtils.escapeHTML($('#category-in').val()),
          quantity: qu.num,
          units: qu.units,
          user: CookieChecker.getUserName(),
          updatedAt: new Date().getTime().toString()
        });
        if ($('#yesterday-in').is(':checked')) {
          item.set({
            updatedAt: SFUtils.yesterdayTimestamp()
          });
        } else {
          explicitDate = SFUtils.escapeHTML($('#ts-in').val());
          if (explicitDate) {
            ds = $.datepicker.parseDate("yy-mm-dd", explicitDate);
            item.set({
              updatedAt: ds.getTime().toString()
            });
          }
        }
        this.clearInput();
        item.set({
          location: SFUtils.currentLocation
        });
        return item;
      } else {
        return null;
      }
    },
    updateItem: function(e) {
      var act, cat, mod, qty, qu, tid;
      if (!e || e.keyCode !== 13) {
        return;
      }
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
      'click button#add-button': 'addClicked',
      'keypress': 'updateItem'
    }
  });

}).call(this);
