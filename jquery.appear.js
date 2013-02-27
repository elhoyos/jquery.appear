/*
 * jQuery appear plugin
 *
 * Copyright (c) 2012 Andrey Sidorov
 * licensed under MIT license.
 *
 * https://github.com/morr/jquery.appear/
 *
 * Version: 0.3.1
 */
(function($) {
  var selectors = [];

  var check_binded = false;
  var check_lock = false;
  var settings = {
    interval: 250,
    force_appear: false,
    viewport: window
  }
  var $window = $(window);
  var $viewport = $(settings.viewport);

  var $prior_appeared;

  function process() {
    check_lock = false;
    for (var index in selectors) {
      var $appeared = $(selectors[index]).filter(function() {
        return $(this).is(':appeared');
      });

      if ($appeared.length > 0)
        $appeared.trigger('appear', [$appeared]);

      if ($prior_appeared) {
        var $disappeared = $prior_appeared.not($appeared);
        if ($disappeared.length > 0)
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

    var window_left = $viewport.scrollLeft();
    var window_top = $viewport.scrollTop();
    var offset = $element.offset();
    var left = offset.left;
    var top = offset.top;

    if (top + $element.height() >= window_top &&
        top - ($element.data('appear-top-offset') || 0) <= window_top + $viewport.height() &&
        left + $element.width() >= window_left &&
        left - ($element.data('appear-left-offset') || 0) <= window_left + $viewport.width()) {
      return true;
    } else {
      return false;
    }
  }

  $.fn.extend({
    // watching for element's appearance in browser viewport
    appear: function(options) {
      $.extend(settings, options || {});
      var selector = this.selector || this;
      if (!check_binded) {
        var on_check = function() {
          if (check_lock) {
            return;
          }
          check_lock = true;

          setTimeout(process, settings.interval);
        };

        $viewport = $(settings.viewport);
        $viewport.scroll(on_check);
        $window.resize(on_check);
        check_binded = true;
      }

      if (settings.force_process) {
        setTimeout(process, settings.interval);
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
