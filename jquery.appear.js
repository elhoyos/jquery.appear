/*
 * jQuery appear plugin
 *
 * Copyright (c) 2012 Andrey Sidorov
 * licensed under MIT license.
 *
 * https://github.com/morr/jquery.appear/
 *
 * Version: 0.3.3
 */
(function($) {
  var selectors = [];

  var check_binded = false;
  var check_lock = false;
  var defaults = {
    interval: 250,
    force_process: false,
    viewport: window
  }
  var $window = $(window);
  var $document = $(document);
  var $viewport = $(defaults.viewport);

  var $prior_appeared;

  function process() {
    check_lock = false;
    for (var index = 0; index < selectors.length; index++) {
      var $appeared = $(selectors[index]).filter(function() {
        return $(this).is(':appeared');
      });

      $appeared.trigger('appear', [$appeared]);

      if ($prior_appeared) {
        var $disappeared = $prior_appeared.not($appeared);
        $disappeared.trigger('disappear', [$disappeared]);
      }
      $prior_appeared = $appeared;
    }
  }

  // "appeared" custom filter
  $.expr[':']['appeared'] = function(element) {
    var $element = $(element);
    if (!$element.is(':visible')) {
      return false;
    }

    var is_win = $viewport[0] === window;

    var scroll_top = $viewport.scrollTop();
    var scroll_left = $viewport.scrollLeft();

    var viewport_offset = $viewport.offset();
    var viewport_offset_top = is_win ? 0 : viewport_offset.top;
    var viewport_offset_left = is_win ? 0 : viewport_offset.left;

    var offset = $element.offset();
    var top = is_win ? offset.top : Math.abs(viewport_offset_top - offset.top - scroll_top);
    var left = is_win ? offset.left : Math.abs(viewport_offset_left - offset.left - scroll_left);

    var extra_offset_top = $element.data('appear-top-offset') || 0;
    var extra_offset_left = $element.data('appear-top-offset') || 0;

    if (top + $element.height() >= scroll_top &&
        top - extra_offset_top <= scroll_top + $viewport.height() &&
        left + $element.width()  >= scroll_left &&
        left - extra_offset_left <= scroll_left + $viewport.width()) {
      return true;
    } else {
      return false;
    }
  }

  $.fn.extend({
    // watching for element's appearance in browser viewport
    appear: function(options) {
      var opts = $.extend({}, defaults, options || {});
      var selector = this.selector || this;
      if (!check_binded) {
        var on_check = function() {
          if (check_lock) {
            return;
          }
          check_lock = true;

          setTimeout(process, opts.interval);
        };

        $viewport = $(opts.viewport);
        $viewport.scroll(on_check);
        $window.resize(on_check);
        check_binded = true;
      }

      if (opts.force_process) {
        setTimeout(process, opts.interval);
      }
      selectors.push(selector);
      return $(selector);
    }
  });

  $.extend({
    // force elements's appearance check
    force_appear: function() {
      if (check_binded) {
        process();
        return true;
      };
      return false;
    }
  });
})(jQuery);
