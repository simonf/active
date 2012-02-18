(function() {
  var cleanAndSortByAction, fetchDataForCategory, fetchDistinctCategories, initCap, plotData;

  fetchDistinctCategories = function() {
    jQuery.get('../categories', function(data) {
      $.each(data, function(i, v) {
        if (v.key.length > 0) {
          $('#cat-list').append('<option>' + v.key + '</option>');
        }
      });
    });
  };

  initCap = function(str) {
    return (str != null ? str.substring(0, 1).toUpperCase() : void 0) + (str != null ? str.substring(1, str.length).toLowerCase() : void 0);
  };

  cleanAndSortByAction = function(couchRows) {
    var actionHash;
    actionHash = {};
    $.each(couchRows, function(i, row) {
      var arr, k, v;
      v = row.value;
      k = initCap(jQuery.trim(v.action));
      arr = actionHash[k];
      if (arr) {
        arr.push([v.date, v.qty]);
        actionHash[k] = arr;
      } else {
        actionHash[k] = [[v.date, v.qty]];
      }
    });
    return actionHash;
  };

  fetchDataForCategory = function(cat) {
    return jQuery.get('../category?key=' + cat, function(data) {
      var actionHash, plotdata, series_labels;
      actionHash = cleanAndSortByAction(data);
      plotdata = [];
      series_labels = [];
      $.each(actionHash, function(k, v) {
        if (k.length > 0) {
          series_labels.push({
            label: k,
            neighborThreshold: -1
          });
          plotdata.push(v);
        }
      });
      plotData(plotdata, series_labels);
    });
  };

  plotData = function(data, labels) {
    console.log(data);
    console.log(labels);
    $.jqplot('plot1', data, {
      series: labels,
      axes: {
        xaxis: {
          renderer: $.jqplot.DateAxisRenderer,
          min: 'January 1, 2012 16:00:00',
          tickInterval: '1 day',
          tickOptions: {
            formatString: '%Y/%#m/%#d'
          }
        },
        yaxis: {
          tickOptions: {
            formatString: '$%2d'
          }
        }
      }
    });
  };

  jQuery(function() {
    fetchDistinctCategories();
    console.log(fetchDataForCategory('Sleep'));
  });

}).call(this);
