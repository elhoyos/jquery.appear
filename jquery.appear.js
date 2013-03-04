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
  var defaults = {
    interval: 250,
    force_process: false,
    viewport: window
  }
  var $window = $(window);
  var $viewport = $(defaults.viewport);

  var $prior_appeared;

  // a simple queue to ensure destroy and process are not called
  // simultaneously
  var queue = (function () {
    var def;

    function init() {
      def = $.Deferred();
      def.resolve(); // don't need to wait to execute processing

      return def.promise();
    }

    return init();

  })();

  function process() {
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

  function destroy(selector, opts) {
    // remove the selector/element
    var index = selectors.indexOf(selector);
    if (index >= 0)
      selectors.splice(index, 1);

    // unbind events
    if (selectors.length == 0) {
      $viewport.unbind('scroll', on_check);
      $window.unbind('resize', on_check);
      check_binded = false;
    }
  }

  // event hanlder for processing
  var on_check = function(e) {
    var interval = e.data

    setTimeout(function () {
      queue.done(function () {
        process()
      })
    }, interval);
  };

  // "appeared" custom filter
  $.expr[':']['appeared'] = function(element) {
    var $element = $(element);
    if (!$element.is(':visible')) {
      return false;
    }

    var viewport_scroll_left = $viewport.scrollLeft();
    var viewport_scroll_top = $viewport.scrollTop();
    var offset = $element.offset();
    var viewport_offset = $viewport.offset();
    var viewport_offset_left = viewport_offset.left || 0;
    var viewport_offset_top = viewport_offset.top || 0;
    var left = offset.left;
    var top = offset.top;

    if (top + $element.height() >= viewport_scroll_top &&
        top - viewport_offset_top - ($element.data('appear-top-offset') || 0) <= viewport_scroll_top + $viewport.height() &&
        left + $element.width() >= viewport_scroll_left &&
        left - viewport_offset_left - ($element.data('appear-left-offset') || 0) <= viewport_scroll_left + $viewport.width()) {
      return true;
    } else {
      return false;
    }
  }

  $.fn.extend({
    // watching for element's appearance in browser viewport
    appear: function(options) {
      var selector = this.selector || this;
      var opts = $.extend({}, defaults, options || {});

      if (options === "destroy") {
        queue.done(function () {
          destroy(selector, opts);
        });

      } else {

        if (!check_binded) {
          $viewport = $(opts.viewport);
          $viewport.scroll(opts.interval, on_check);
          $window.resize(opts.interval, on_check);
          check_binded = true;
        }

        if (opts.force_process) {
          setTimeout(function () {
            queue.done(function () {
              process()
            })
          }, opts.interval);
        }

        selectors.push(selector);
      }

      return $(selector);
    }
  });

  $.extend({
    // force elements's appearance check
    force_appear: function() {
      if (check_binded) {
        queue.done(function () {
          process();
        });
        return true;
      };
      return false;
    }
  });
})(jQuery);
