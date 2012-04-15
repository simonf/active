(function() {
  var cleanAndSortByAction, currentDataset, drawSelectedSeries, fetchAndPlotSelectedCategory, fetchDataForCategory, fetchDistinctCategories, findMinMax, initCap, insertMissingDays, makeFlotDataObject, makeQuantityNumeric, makeTime, normalise, plotData, sortFunction, stripTrailingZeroes;

  currentDataset = {};

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

  stripTrailingZeroes = function(qty) {
    var b, n;
    b = qty.trim();
    if (b.indexOf('.') > -1) {
      n = b.lastIndexOf('0');
      while (b.length - n === 1) {
        b = b.substr(0, b.length - 1);
        n = b.lastIndexOf('0');
      }
    }
    return b;
  };

  makeQuantityNumeric = function(qty) {
    var qf, qs;
    qs = stripTrailingZeroes(qty.toString());
    qf = parseFloat(qs);
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
    $('#series').empty();
    $('#plot-area').empty();
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

  insertMissingDays = function(series, infillValue, earliest, latest) {
    var dayLength, diff, highestDate, i, lastDate, nextDate, retval;
    dayLength = 86400;
    retval = [];
    while (series[0].dateSubIndex < earliest) {
      retval.push([earliest, infillValue]);
      earliest += dayLength * 1000;
    }
    i = 1;
    retval.push(series[0]);
    while (i < series.length) {
      lastDate = Math.round(series[i - 1][0] / 1000);
      nextDate = Math.round(series[i][0] / 1000);
      diff = nextDate - lastDate;
      while (diff > dayLength * 2) {
        lastDate += dayLength;
        retval.push([lastDate * 1000, infillValue]);
        diff = nextDate - lastDate;
      }
      retval.push(series[i]);
      i++;
    }
    highestDate = series[series.length - 1][0] + dayLength * 1000;
    while (highestDate < latest) {
      retval.push([highestDate, infillValue]);
      highestDate += dayLength * 1000;
    }
    return retval;
  };

  fetchDataForCategory = function(cat) {
    jQuery.get('../category?key=' + cat, function(data) {
      var dataObject;
      dataObject = cleanAndSortByAction(data);
      plotData(dataObject);
    });
  };

  normalise = function(series, valueAttributeIndex, normalValue) {
    var mm;
    mm = findMinMax(series, valueAttributeIndex);
    if (mm[0] === mm[1] && mm[0] === 0) {
      return series.map(function(i) {
        return [i[0], normalValue];
      });
    }
    return series;
  };

  makeFlotDataObject = function(dat, lab) {
    var bw, point, v1, _i, _len;
    v1 = dat[0][1];
    bw = 12 * 60 * 60 * 1000;
    for (_i = 0, _len = dat.length; _i < _len; _i++) {
      point = dat[_i];
      if (point[1] !== v1 && point[1] !== 0) {
        bw = 24 * 60 * 60 * 1000;
        break;
      }
    }
    return {
      data: dat,
      label: lab,
      bars: {
        show: true,
        fill: true,
        barWidth: bw,
        lineWidth: 0
      }
    };
  };

  plotData = function(dataObject) {
    var fixedUpData, ignore, label, normalisedData, series, _ref, _ref2;
    $('#series').empty();
    _ref = dataObject.data;
    for (label in _ref) {
      ignore = _ref[label];
      $('#series').append('<li><input type="checkbox" name="series" value="' + label + '" checked="yes">' + label + '</ul>');
    }
    $('input[type=checkbox]').live('click', function() {
      return drawSelectedSeries();
    });
    currentDataset = {};
    _ref2 = dataObject.data;
    for (label in _ref2) {
      series = _ref2[label];
      normalisedData = normalise(series, 1, 10);
      fixedUpData = insertMissingDays(normalisedData, 0, dataObject.min, dataObject.max);
      currentDataset[label] = makeFlotDataObject(fixedUpData.sort(sortFunction), label);
    }
    drawSelectedSeries();
  };

  drawSelectedSeries = function() {
    var checkedArray, label, options, series, toDraw;
    checkedArray = [];
    $("input:checkbox[name=series]:checked").each(function() {
      return checkedArray.push($(this).val());
    });
    toDraw = [];
    for (label in currentDataset) {
      series = currentDataset[label];
      if (checkedArray.indexOf(label) > -1) toDraw.push(series);
    }
    options = {
      xaxis: {
        show: true,
        position: "bottom",
        mode: "time"
      }
    };
    $.plot($('#plot-area'), toDraw, options);
  };

  sortFunction = function(a, b) {
    return a[0] - b[0];
  };

  jQuery(function() {
    fetchDistinctCategories();
    $('#cat-list').change(function() {
      fetchAndPlotSelectedCategory();
    });
  });

}).call(this);
