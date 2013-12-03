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

    // process once when scrolling/resizing
    if (check_lock) {
      return;
    }

    check_lock = true;

    setTimeout(function () {
      queue.done(function () {
        process()
      })
    }, interval);
  };

  // determine if the given selector is being watched for
  // appearance
  function isLoaded ( selector ) {
    return 0 < $.map(selectors, function ( el ) {
      return el.is(selector) ? 1 : undefined;
    }).length;
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
    },

    loaded_appear: isLoaded
  });
})(jQuery);
