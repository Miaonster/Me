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

    name = gui.App.argv[0];

    if (name && fs.existsSync(name)) {
      data = fs.readFileSync(name);
      $textarea.val(data);
    } else {
      $textarea.val(localStorage.getItem('writedown'));
    }

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
      data = fs.readFileSync(path);
      $textarea.val(data);
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
    }, 'r');
  }

};

module.exports = writedown;
