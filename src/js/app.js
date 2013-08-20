/**
 * @author: Sofish Lin
 * @site: http://sofish.de
 * @license: MIT
 */

var App, mode, $body, $preview, $toolbar, editor, $code, writedown;

$body = $('body');
$code = $('#editor');
$textarea = $('textarea', $code);
$preview = $('#js-preview');
$toolbar = $('#toolbar');
$tips = $('#tips');

// prevent a to open
$(document).on('click', 'a', function(e) {
  if($(this).data('action') !== 'go') e.preventDefault();
})

// embed settings
~function() {

  var fontsize, lineheight, settings;

  fontsize= localStorage.getItem('wdfont-size') || 16;
  lineheight = localStorage.getItem('wdline-height') &&
    (localStorage.getItem('wdline-height')/100 || 1.8) ;

  settings = '<style>.CodeMirror, #preview {' +
    'font-size:' + fontsize + 'px;' +
    'line-height:' + lineheight + ';' +
    '}</style>';

  $('head').append(settings);

}();


console.log($textarea)

// set history from localstory
$textarea.val(localStorage.getItem('writedown'));


App = function(){
  this.mode = '';
  this.timer = null;
  this.init();
};

// translate md to html
App.prototype.html = function() {
  return marked(this.md());
};

// get the md source
App.prototype.md = function() {
  return editor.getValue();
}

App.prototype.origin = function() {
  $preview.hide();
  $code.show('fast');
}

// save as a md document
App.prototype.save = function() {
  var fs = require('fs');
};

// preview markdown
App.prototype.preview = function() {
  $code.hide();
  $preview.html(this.html()).show('fast');
};

// export to html
App.prototype.viewHTML = function() {
  $code.hide();
  $preview.hide().html('');
  $('<pre class="prettyprint lang-html" />').appendTo($preview).text(this.html());
  $preview.show('fast');
};

App.prototype.splitView = function() {
  $body.addClass('split');
  $code.addClass('split-item').show('fast');
  $preview.addClass('split-item').html(this.html()).show('fast');
};

App.prototype.splitViewOff = function() {
  $body.removeClass('split');
  $code.removeClass('split-item');
  $preview.removeClass('split-item');
};

App.prototype.copy = function() {
  Clipboard.set(this.html(), 'text');
  $tips.html('<span>HTML is copied!</span>').show('fast');
  setTimeout(function(){
    $tips.fadeOut();
  }, 1000);
};

App.prototype.init = function() {
  var quit,
      that = this;

  // save data to local disk before close
  quit = function() {
    localStorage.setItem('writedown', that.md());
  };

  // keep focus
  $(document).on('click', function() {
    editor.focus();
  })

  $(window).on('beforeunload', quit);

  //TODO: keep on focus

  // highlight markdown
  editor = CodeMirror.fromTextArea($textarea.get(0), {
    mode: 'gfm',
    lineWrapping: true,
    //lineNumbers: true,
    theme: "default",

    onKeyEvent: function(editor, event) {
      if (that.mode === 'splitView') {
        window.clearTimeout(that.timer);
        that.timer = window.setTimeout(function() {
          $preview.html(that.html()).show('fast');
          prettyPrint();
        }, 300);
      }
    }
  });
}

writedown = new App();


// button status
$toolbar.on('click', '.btn', function() {
  var action,
      previousAction = $('.on').data('action');

  $('.btn').removeClass('on');

  if (/splitView|origin|preview|viewHTML/.test($(this).data('action'))) {
    $(this).addClass('on');
  }

  // previousAction
  if (typeof writedown[previousAction + 'Off'] !== 'undefined') {
    writedown[previousAction + 'Off']();
  }

  action = $(this).data('action');
  // action
  writedown[action]();

  // mode
  writedown.mode = action;

  // highlight code
  if(/splitView|preview|viewHTML/.test(action)) prettyPrint();
});

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

Mousetrap.bindGlobal('command+shift+p', function() {
  $('#covert').click();
});

Mousetrap.bindGlobal('command+shift+c', function() {
  $('#copy').click();
});

Mousetrap.bindGlobal('command+shift+h', function() {
  $('#viewHTML').click();
});

Mousetrap.bindGlobal(['command+shift+b', 'esc'], function() {
  $('#markdown').click();
});

Mousetrap.bindGlobal(['command+,'], function() {
  window.location.href = './settings.html';
});

$('#split').click();
