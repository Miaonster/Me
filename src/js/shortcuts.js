'use strict';

var Mousetrap,
    markdown;

/**
 * adds a bindGlobal method to Mousetrap that allows you to
 * bind specific keyboard shortcuts that will still work
 * inside a text input field
 *
 * usage:
 * Mousetrap.bindGlobal('ctrl+s', _saveChanges);
 */
Mousetrap = (function(Mousetrap) {
  var _global_callbacks = {},
    _original_stop_callback = Mousetrap.stopCallback;

  Mousetrap.stopCallback = function(e, element, combo) {
    if (_global_callbacks[combo]) {
      return false;
    }

    return _original_stop_callback(e, element, combo);
  };

  Mousetrap.bindGlobal = function(keys, callback, action) {
    Mousetrap.bind(keys, callback, action);

    if (keys instanceof Array) {
      for (var i = 0; i < keys.length; i++) {
        _global_callbacks[keys[i]] = true;
      }
      return;
    }
    _global_callbacks[keys] = true;
  };

  return Mousetrap;
}) (Mousetrap);

Mousetrap.bindGlobal(['command+shift+l', 'command+1'], function() {
  $('#split').click();
});

Mousetrap.bindGlobal(['command+shift+b', 'esc', 'command+2'], function() {
  $('#markdown').click();
});

Mousetrap.bindGlobal(['command+shift+p', 'command+3'], function() {
  $('#covert').click();
});

Mousetrap.bindGlobal(['command+shift+h', 'command+4'], function() {
  $('#viewHTML').click();
});

Mousetrap.bindGlobal('command+shift+c', function() {
  $('#copy').click();
});

Mousetrap.bindGlobal(['command+,'], function() {
  window.location.href = './settings.html';
});

Mousetrap.bindGlobal(['command+o'], function() {
  app.open();
});

Mousetrap.bindGlobal(['command+s'], function() {
  app.save();
});

Mousetrap.bindGlobal(['command+shift+s'], function() {
  app.saveas();
});

exports.init = function(application) {
  app = application;
};
