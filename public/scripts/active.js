
  $(function() {
    var listView;
    listView = new ListView();
    $('#action-in').autocomplete({
      source: listView.actionMatcher.values
    });
    $('#category-in').autocomplete({
      source: listView.categoryMatcher.values
    });
    $('#pre-page').on('click', function() {
      return listView.collection.getPrevPage();
    });
    $('#nxt-page').on('click', function() {
      return listView.collection.getNextPage();
    });
    $('.submit-on-enter').on('keypress', function(e) {
      if ((e.which && e.which === 13) || (e.keyCode && e.keyCode === 13)) {
        $('button.default-button').click();
        $('#action-in').focus();
        return false;
      } else {
        return true;
      }
    });
    return $('#action-in').focus();
  });
