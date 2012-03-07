(function() {
  var root;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.Item = Backbone.Model.extend({
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
      if (ua.indexOf("1") === 0) {
        r1 = new Date(parseInt(ua)).toString('d-MMM-yy HH:mm');
        if (r1 && r1 !== 'undefined') return r1;
      }
      if (ua.indexOf("2") === 0) {
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

  root.List = Backbone.Collection.extend({
    model: Item,
    baseURL: '/activities',
    url: '/activities',
    initialize: function() {
      _.bindAll(this, 'updatePageNumberInfo', 'getNextPage', 'getPrevPage');
    },
    parse: function(response) {
      var retval;
      retval = _(response).map(function(row) {
        return {
          id: row.id,
          action: row.value.action,
          category: row.value.category,
          quantity: row.value.quantity,
          units: row.value.units,
          updatedAt: row.value.updatedAt
        };
      });
      this.pageInfo.pageStartKeys[this.pageInfo.tgtPage] = response[0].key;
      this.pageInfo.pageStartKeys[this.pageInfo.tgtPage + 1] = response[response.length - 1].key;
      return retval;
    },
    pageInfo: {
      rowsPerPage: 25,
      currentPageNum: 0,
      pageStartKeys: [],
      tgtPage: 0
    },
    updatePageNumberInfo: function() {
      this.url = this.baseURL;
      this.pageInfo.currentPageNum = this.pageInfo.tgtPage;
    },
    getNextPage: function(view) {
      var pn, psk,
        _this = this;
      pn = this.pageInfo.currentPageNum;
      psk = this.pageInfo.pageStartKeys;
      if (psk.length > pn + 1) {
        this.url = '/activities?limit=' + this.pageInfo.rowsPerPage + '&startkey=' + psk[pn + 1];
      } else {
        this.url = '/activities?limit=' + this.pageInfo.rowsPerPage;
      }
      this.pageInfo.tgtPage = pn + 1;
      this.fetch({
        success: function() {
          _this.updatePageNumberInfo();
          return _this.trigger('draw');
        }
      });
    },
    getPrevPage: function(view) {
      var pn, psk,
        _this = this;
      pn = this.pageInfo.currentPageNum;
      psk = this.pageInfo.pageStartKeys;
      if (pn > 0) {
        this.url = '/activities?limit=' + this.pageInfo.rowsPerPage + '&startkey=' + psk[pn - 1];
      } else {
        this.url = '/activities?limit=' + this.pageInfo.rowsPerPage;
      }
      this.pageInfo.tgtPage = pn - 1;
      this.fetch({
        success: function() {
          _this.updatePageNumberInfo();
          return _this.trigger('draw');
        }
      });
    }
  });

}).call(this);
