(function() {
  var cleanAndSortByAction, fetchAndPlotSelectedCategory, fetchDataForCategory, fetchDistinctCategories, findMinMax, infillMissingDays, initCap, plotAsBarChart, plotAsSeries, plotData, plotOneSeries;

  fetchAndPlotSelectedCategory = function() {
    var el;
    el = $('#cat-list option:selected')[0];
    if (el) fetchDataForCategory(el.text);
  };

  fetchDistinctCategories = function() {
    jQuery.get('../categories', function(data) {
      $.each(data, function(i, v) {
        if (v.key.length > 0) {
          $('#cat-list').append('<option>' + v.key + '</option>');
        }
      });
      fetchAndPlotSelectedCategory();
    });
  };

  initCap = function(str) {
    return (str != null ? str.substring(0, 1).toUpperCase() : void 0) + (str != null ? str.substring(1, str.length).toLowerCase() : void 0);
  };

  cleanAndSortByAction = function(couchRows) {
    var actionHash, earliest, latest;
    $('#plots').empty();
    actionHash = {};
    latest = 0;
    earliest = 9326700000000;
    $.each(couchRows, function(i, row) {
      var arr, k, qty, v;
      v = row.value;
      if (v.date > latest) latest = v.date;
      if (v.date < earliest) earliest = v.date;
      qty = parseInt(v.qty) ? v.qty : 0;
      k = initCap(jQuery.trim(v.action));
      arr = actionHash[k];
      if (arr) {
        arr.push([v.date, qty]);
        actionHash[k] = arr;
      } else {
        actionHash[k] = [[v.date, qty]];
      }
    });
    return {
      data: actionHash,
      min: earliest,
      max: latest
    };
  };

  findMinMax = function(dataArray, subArrayIndex) {
    var max, min, point, _i, _len;
    min = 999999;
    max = -999999;
    for (_i = 0, _len = dataArray.length; _i < _len; _i++) {
      point = dataArray[_i];
      if (point[subArrayIndex] < min) min = point[subArrayIndex];
      if (point[subArrayIndex] > max) max = point[subArrayIndex];
    }
    return [min, max];
  };

  infillMissingDays = function(series, dateSubIndex, valSubIndex, infillValue) {
    var dayLength, diff, i, lastDate, newval, nextDate, retval;
    i = 1;
    dayLength = 86400;
    retval = [series[0]];
    while (i < series.length) {
      lastDate = Math.round(series[i - 1][dateSubIndex] / 1000);
      nextDate = Math.round(series[i][dateSubIndex] / 1000);
      diff = nextDate - lastDate;
      while (diff > dayLength * 2) {
        newval = [];
        lastDate += dayLength;
        newval[dateSubIndex] = lastDate * 1000;
        newval[valSubIndex] = infillValue;
        retval.push(newval);
        diff = nextDate - lastDate;
      }
      retval.push(series[i]);
      i++;
      console.log('Length: ' + i);
    }
    return retval;
  };

  fetchDataForCategory = function(cat) {
    return jQuery.get('../category?key=' + cat, function(data) {
      var dataObject;
      dataObject = cleanAndSortByAction(data);
      plotData(dataObject);
    });
  };

  plotData = function(dataObject) {
    var i, label, series, _ref;
    i = 0;
    _ref = dataObject.data;
    for (label in _ref) {
      series = _ref[label];
      plotOneSeries(i, label, series, dataObject.min, dataObject.max);
      i += 1;
    }
  };

  plotOneSeries = function(seriesNumber, label, data, earliest, latest) {
    var divhtml, divid, divnm, infilledData, mm, normalisedData;
    divnm = 'plotcat' + seriesNumber;
    divhtml = '<h3 class="chartTitle" id="' + divnm + '"><a href="#">' + label + '</a></h3>';
    divid = 'plot' + seriesNumber;
    $('#plots').append(divhtml);
    $('#' + divnm).click(function() {
      return $('#' + divid).toggle();
    });
    divhtml = '<div id="' + divid + '"></div>';
    $('#plots').append(divhtml);
    mm = findMinMax(data, 1);
    if (mm[0] === mm[1] && mm[0] === 0) {
      normalisedData = data.map(function(i) {
        return [i[0], 1];
      });
      infilledData = infillMissingDays(normalisedData, 0, 1, 0);
      plotAsSeries(divid, label, infilledData, earliest, latest, [0, 1]);
    } else {
      plotAsSeries(divid, label, data, earliest, latest, mm);
    }
  };

  plotAsBarChart = function(divid, label, data, earliest, latest) {
    $.jqplot(divid, [data], {
      seriesDefaults: {
        renderer: $.jqplot.BarRenderer,
        rendererOptions: {
          fillToZero: true
        }
      },
      title: label,
      axes: {
        xaxis: {
          label: 'Date',
          renderer: $.jqplot.DateAxisRenderer,
          min: earliest,
          max: latest
        },
        yaxis: {
          tickOptions: {
            formatString: '%2d'
          }
        }
      }
    });
    $('#' + divid).hide();
  };

  plotAsSeries = function(divid, label, data, earliest, latest, mm) {
    $.jqplot(divid, [data], {
      title: label,
      axes: {
        xaxis: {
          label: 'Date',
          renderer: $.jqplot.DateAxisRenderer,
          min: earliest,
          max: latest,
          tickInterval: '1 week',
          tickOptions: {
            formatString: '%#m/%#d'
          }
        },
        yaxis: {
          min: mm[0],
          max: mm[1] + 1 + Math.round(mm[1] / 10),
          tickOptions: {
            formatString: '%2d'
          }
        }
      }
    });
    $('#' + divid).hide();
  };

  jQuery(function() {
    fetchDistinctCategories();
    $('#cat-list').change(function() {
      fetchAndPlotSelectedCategory();
    });
  });

}).call(this);
