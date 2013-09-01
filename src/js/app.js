'use strict';

var writedown,
    shortcuts;

// prevent a to open
$(window.document).on('click', 'a', function(e) {
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

writedown = require('./js/writedown.js');
shortcuts = require('./js/shortcuts.js');

shortcuts.init(writedown);

$('#split').click();
