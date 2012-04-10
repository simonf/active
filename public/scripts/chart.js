(function() {
  var cleanAndSortByAction, fetchAndPlotSelectedCategory, fetchDataForCategory, fetchDistinctCategories, findMinMax, infillMissingDays, initCap, makeQuantityNumeric, makeTime, plotAsBarChart, plotAsSeries, plotData, plotOneSeries, sortFunction;

  fetchAndPlotSelectedCategory = function() {
    var el;
    el = $('#cat-list option:selected')[0];
    if (el) fetchDataForCategory(el.text);
  };

  fetchDistinctCategories = function() {
    jQuery.get('../categories', function(data) {
      $.each(data, function(i, v) {
        if (v.key[1].length > 0) {
          $('#cat-list').append('<option>' + v.key[1] + '</option>');
        }
      });
      fetchAndPlotSelectedCategory();
    });
  };

  initCap = function(str) {
    return (str != null ? str.substring(0, 1).toUpperCase() : void 0) + (str != null ? str.substring(1, str.length).toLowerCase() : void 0);
  };

  makeTime = function(strWithColons) {
    var arr, retval;
    arr = strWithColons.split(':');
    retval = parseInt(arr[0]);
    if (arr.length > 1) retval += parseInt(arr[1]) / 60.0;
    if (arr.length > 2) retval += parseInt(arr[2]) / 3600.0;
    return retval;
  };

  makeQuantityNumeric = function(qty) {
    var qf, qs;
    qs = qty.toString();
    qf = parseFloat(qty);
    if (qf.toString() === qs) {
      return qf;
    } else {
      if (qs.indexOf(':') > 0) {
        return makeTime(qs);
      } else {
        return 0;
      }
    }
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
      qty = makeQuantityNumeric(v.qty);
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

  sortFunction = function(a, b) {
    return a[0] - b[0];
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
    divhtml = '<div style="height: 300px; width: 100%" id="' + divid + '"></div>';
    $('#plots').append(divhtml);
    mm = findMinMax(data, 1);
    if (mm[0] === mm[1] && mm[0] === 0) {
      normalisedData = data.map(function(i) {
        return [i[0], 1];
      });
      infilledData = infillMissingDays(normalisedData, 0, 1, 0);
      plotAsBarChart(divid, label, infilledData.sort(sortFunction), earliest, latest);
    } else {
      plotAsBarChart(divid, label, data.sort(sortFunction), earliest, latest);
    }
  };

  plotAsBarChart = function(divid, label, data, earliest, latest) {
    $.plot($('#' + divid), [
      {
        color: 'rgb(0,0,255)',
        label: label,
        bars: {
          show: true,
          fill: true,
          barWidth: 24 * 60 * 60 * 1000,
          lineWidth: 0
        },
        data: data
      }
    ], {
      xaxis: {
        show: true,
        position: "bottom",
        mode: "time"
      }
    });
    $('#' + divid).hide();
  };

  plotAsSeries = function(divid, label, data, earliest, latest, mm) {
    $.plot($('#' + divid), [
      {
        color: 'rgb(255,0,0)',
        label: label,
        lines: {
          show: true,
          fill: true,
          lineWidth: 1
        },
        points: {
          show: false
        },
        data: data
      }
    ], {
      xaxis: {
        show: true,
        position: "bottom",
        mode: "time",
        min: earliest,
        max: latest
      },
      yaxis: {
        show: true,
        min: 0,
        max: mm[1] + 1 + Math.round(mm[1] / 10)
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
