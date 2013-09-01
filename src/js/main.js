'use strict';

var App,
    mode,
    $body,
    $code,
    $textarea,
    $previewWrap,
    $preview,
    $toolbar,
    $tips,
    editor,
    writedown;

$body = $('body');
$code = $('#editor');
$textarea = $('textarea', $code);
$previewWrap = $('#preview');
$preview = $('#js-preview');
$toolbar = $('#toolbar');
$tips = $('#tips');

// prevent a to open
$(document).on('click', 'a', function(e) {
  if ($(this).data('action') !== 'go') {
    e.preventDefault();
  }
});

// embed settings
(function() {

  var fontsize,
      lineheight,
      settings;

  fontsize = localStorage.getItem('wdfont-size') || 16;
  lineheight = localStorage.getItem('wdline-height') &&
    (localStorage.getItem('wdline-height')/100 || 1.8) ;

  settings = '<style>.CodeMirror, #preview {' +
    'font-size:' + fontsize + 'px;' +
    'line-height:' + lineheight + ';' +
    '}</style>';

  $('head').append(settings);

}());

writedown = {
  mode: '',
  timer: null,
  
  init: function() {
    var fs = require('fs'),
        gui = require('nw.gui'),
        that = this,
        name,
        data;

    // save data to local disk before close
    function quit() {
      localStorage.setItem('writedown', that.md());
    };

    // keep focus
    $(document).on('click', function() {
      editor.focus();
    });

    $(window).on('beforeunload', quit);

    //TODO: keep on focus

    // highlight markdown
    editor = CodeMirror.fromTextArea($textarea.get(0), {
      mode: 'gfm',
      theme: "default",
      lineWrapping: true,

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

    name = gui.App.argv[0];

    if (name && fs.existsSync(name)) {
      this.path = name;
      data = fs.readFileSync(name).toString();
    } else {
      data = localStorage.getItem('writedown');
    }

    editor.setValue(data.toString());

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

      // action
      action = $(this).data('action');
      writedown[action]();

      // mode
      writedown.mode = action;

      // highlight code
      if (/splitView|preview|viewHTML/.test(action)) {
        prettyPrint();
      }
    });
  },

  // translate md to html
  html: function() {
    return marked(this.md());
  },

  // get the md source
  md: function() {
    return editor.getValue();
  },

  origin: function() {
    $previewWrap.hide('fast');
    $code.hide().show('fast');
  },

  // preview markdown
  preview: function() {
    $code.hide('fast');
    $previewWrap.hide();
    $preview.html(this.html());
    $previewWrap.show('fast');
  },

  // export to html
  viewHTML: function() {
    $code.hide();
    $previewWrap.hide();
    $preview.html('');
    $('<pre class="prettyprint lang-html" />').appendTo().text(this.html());
    $previewWrap.show('fast');
  },

  splitView: function() {
    $body.addClass('split');
    $code.addClass('split-item').show('fast');
    $previewWrap.addClass('split-item')
    $preview.html(this.html());
    $previewWrap.show('fast');
  },

  splitViewOff: function() {
    $body.removeClass('split');
    $code.removeClass('split-item');
    $previewWrap.removeClass('split-item');
  },

  copy: function() {
    Clipboard.set(this.html(), 'text');
    $tips.html('<span>HTML is copied!</span>').show('fast');
    setTimeout(function(){
      $tips.fadeOut();
    }, 1000);
  },

  chooseFile: function(fn, type) {
    var $opener;

    if (type === 'r') {
      $opener = $('#open');
    } else {
      $opener = $('#saveas');
    }

    $opener
      .off('change')
      .one('change', function(e) {
        if ($.isFunction(fn)) {
          fn($(this).val());
        }
      })
      .trigger('click');
  },

  saveFile: function(path) {
    var fs = require('fs'),
        data = this.md();

    if (path) {
      fs.writeFileSync(path, data);
    }
  },

  openFile: function(path) {
    var fs = require('fs'),
        data;

    if (path) {
      data = fs.readFileSync(path).toString();
      editor.setValue(data);
    }
  },

  save: function() {
    if (!this.path) {
      this.saveas();
    } else {
      this.saveFile(this.path);
    }
  },

  // save as a md document
  saveas: function() {
    this.chooseFile(function(path) {
      this.path = path;
      this.saveFile(path);
    }.bind(this));
  },

  open: function() {
    this.chooseFile(function(path) {
      this.path = path;
      this.openFile(path);
    }.bind(this), 'r');
  }

};

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
  writedown.open();
});

Mousetrap.bindGlobal(['command+s'], function() {
  writedown.save();
});

Mousetrap.bindGlobal(['command+shift+s'], function() {
  writedown.saveas();
});

writedown.init();

$('#split').click();
