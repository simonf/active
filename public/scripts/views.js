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
      var _this = this;
      _.bindAll(this, 'render', 'addItem', 'appendItem', 'prependItem', 'updateItem');
      this.collection = new List();
      this.collection.bind('add', this.prependItem);
      this.collection.bind('draw', this.render);
      this.collection.url = '/activities?limit=25';
      this.collection.fetch({
        success: function() {
          _this.collection.url = _this.collection.baseURL;
          return _this.render();
        }
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
    actionMatcher: new ListOfValues(),
    categoryMatcher: new ListOfValues(),
    doubleMatcher: new DoubleMatcher(),
    render: function() {
      var _this = this;
      $('#table-body', this.el).empty();
      _(this.collection.models).each(function(item) {
        return this.appendItem(item);
      }, this);
      this.doubleMatcher.makeMatches(this.collection.models, 'action', 'category');
      $('#action-in').blur(function() {
        return _this.doubleMatcher.match($('#action-in'), $('#category-in'));
      });
      this.categoryMatcher.makeMatches(this.collection.models, 'category');
      $('#category-in').autocomplete('option', 'source', this.categoryMatcher.values);
      this.actionMatcher.makeMatches(this.collection.models, 'action');
      $('#action-in').autocomplete('option', 'source', this.actionMatcher.values);
    },
    clearInput: function() {
      $('#action-in').val('');
      $('#category-in').val('');
      $('#quantity-in').val(' ');
    },
    addItem: function() {
      var inputaction, item, qu;
      item = new Item();
      qu = SFUtils.splitNumbersAndUnits($('#quantity-in').val());
      inputaction = $('#action-in').val();
      if (inputaction) {
        item.set({
          action: inputaction,
          category: $('#category-in').val(),
          quantity: qu.num,
          units: qu.units,
          user: CookieChecker.getUserName()
        });
        if ($('#yesterday-in').is(':checked')) {
          item.set({
            updatedAt: SFUtils.yesterdayTimestamp()
          });
        }
        this.clearInput();
        this.collection.add(item);
        item.save();
      }
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

}).call(this);
