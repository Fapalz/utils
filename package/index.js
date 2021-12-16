/**
 * MyLibrary  1.0.1
 * Base utils
 * https://github.com/Fapalz/utils#readme
 *
 * Copyright 2020-2021 Gladikov Kirill - Fapalz <blacesmot@gmail.com>
 *
 * Released under the MIT License
 *
 * Released on: December 16, 2021
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.MyLibrary = factory());
}(this, (function () { 'use strict';

  var inBrowser = typeof window !== 'undefined';
  var inWeex = // eslint-disable-next-line no-undef
  typeof WXEnvironment !== 'undefined' && !!WXEnvironment.platform; // eslint-disable-next-line no-undef

  var weexPlatform = inWeex && WXEnvironment.platform.toLowerCase();
  var UA = inBrowser && window.navigator.userAgent.toLowerCase();
  var isIE = UA && /msie|trident/.test(UA);
  var isIE9 = UA && UA.indexOf('msie 9.0') > 0;
  var isEdge = UA && UA.indexOf('edge/') > 0;
  var isAndroid = UA && UA.indexOf('android') > 0 || weexPlatform === 'android';
  var isIOS = UA && /iphone|ipad|ipod|ios/.test(UA) || weexPlatform === 'ios';
  var isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;
  var isPhantomJS = UA && /phantomjs/.test(UA);
  var isFF = UA && UA.match(/firefox\/(\d+)/);

  var env = /*#__PURE__*/Object.freeze({
    __proto__: null,
    inBrowser: inBrowser,
    inWeex: inWeex,
    weexPlatform: weexPlatform,
    UA: UA,
    isIE: isIE,
    isIE9: isIE9,
    isEdge: isEdge,
    isAndroid: isAndroid,
    isIOS: isIOS,
    isChrome: isChrome,
    isPhantomJS: isPhantomJS,
    isFF: isFF
  });

  /**
   * Returns a random string of given length
   * @param {number} i Characters
   * @returns {string}
   */
  var randomString = function randomString(i) {
    var rnd = '';

    while (rnd.length < i) {
      rnd += Math.random().toString(36).substring(2);
    }

    return rnd.substring(0, i);
  };

  var throttle = function throttle(fn, threshhold, scope) {
    if (threshhold === void 0) {
      threshhold = 250;
    }

    var last;
    var deferTimer; // eslint-disable-next-line func-names

    return function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var context = scope || this;
      var now = +new Date();

      if (last && now < last + threshhold) {
        // hold on to it
        clearTimeout(deferTimer);
        deferTimer = setTimeout(function () {
          last = now;
          fn.apply(context, args);
        }, threshhold);
      } else {
        last = now;
        fn.apply(context, args);
      }
    };
  };
  /**
   * Return capitalize string
   * @param {string} string
   * @returns {string}
   */


  var capitalize = function capitalize(string) {
    if (typeof string !== 'string') return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  /**
   * Returns the element is HTMLElement or not
   * @param {HTMLElement} el
   * @returns {Boolean}
   */


  var isDomElement = function isDomElement(el) {
    return !!(el && el.nodeType === 1);
  };
  /**
   * Returns the element is visible on the viewport or not
   * @param {HTMLElement} el
   * @returns {Boolean}
   */


  var isElementVisible = function isElementVisible(el) {
    var rect = el.getBoundingClientRect();
    var windowWidth = window.innerWidth || document.documentElement.clientWidth;
    var windowHeight = window.innerHeight || document.documentElement.clientHeight;

    var efp = function efp(x, y) {
      return document.elementFromPoint(x, y);
    }; // Return false if it's not in the viewport


    if (rect.right < 0 || rect.bottom < 0 || rect.left > windowWidth || rect.top > windowHeight) return false; // Return true if any of its four corners are visible

    return el.contains(efp(rect.left, rect.top)) || el.contains(efp(rect.right, rect.top)) || el.contains(efp(rect.right, rect.bottom)) || el.contains(efp(rect.left, rect.bottom));
  };

  var main = /*#__PURE__*/Object.freeze({
    __proto__: null,
    randomString: randomString,
    throttle: throttle,
    capitalize: capitalize,
    isDomElement: isDomElement,
    isElementVisible: isElementVisible
  });

  /* eslint-disable import/no-mutable-exports */
  var hasTransition = inBrowser && !isIE9;
  var TRANSITION = 'transition';
  var ANIMATION = 'animation'; // Transition property/event sniffing

  var transitionProp = 'transition';
  var transitionEndEvent = 'transitionend';
  var animationProp = 'animation';
  var animationEndEvent = 'animationend';

  if (hasTransition) {
    /* istanbul ignore if */
    if (window.ontransitionend === undefined && window.onwebkittransitionend !== undefined) {
      transitionProp = 'WebkitTransition';
      transitionEndEvent = 'webkitTransitionEnd';
    }

    if (window.onanimationend === undefined && window.onwebkitanimationend !== undefined) {
      animationProp = 'WebkitAnimation';
      animationEndEvent = 'webkitAnimationEnd';
    }
  } // binding to window is necessary to make hot reload work in IE in strict mode


  var raf = inBrowser ? window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : setTimeout : function (fn) {
    return fn();
  }; // Old versions of Chromium (below 61.0.3163.100) formats floating pointer numbers
  // in a locale-dependent way, using a comma instead of a dot.
  // If comma is not replaced with a dot, the input will be rounded down (i.e. acting
  // as a floor function) causing unexpected behaviors

  function toMs(s) {
    return Number(s.slice(0, -1).replace(',', '.')) * 1000;
  }

  function getTimeout(delays, durations) {
    while (delays.length < durations.length) {
      // eslint-disable-next-line no-param-reassign
      delays = delays.concat(delays);
    }

    return Math.max.apply(null, durations.map(function (d, i) {
      return toMs(d) + toMs(delays[i]);
    }));
  }

  var transformRE = /\b(transform|all)(,|$)/;
  function getTransitionInfo(el, expectedType) {
    var styles = window.getComputedStyle(el); // JSDOM may return undefined for transition properties

    var transitionDelays = (styles[transitionProp + "Delay"] || '').split(', ');
    var transitionDurations = (styles[transitionProp + "Duration"] || '').split(', ');
    var transitionTimeout = getTimeout(transitionDelays, transitionDurations);
    var animationDelays = (styles[animationProp + "Delay"] || '').split(', ');
    var animationDurations = (styles[animationProp + "Duration"] || '').split(', ');
    var animationTimeout = getTimeout(animationDelays, animationDurations);
    var type;
    var timeout = 0;
    var propCount = 0;
    /* istanbul ignore if */

    if (expectedType === TRANSITION) {
      if (transitionTimeout > 0) {
        type = TRANSITION;
        timeout = transitionTimeout;
        propCount = transitionDurations.length;
      }
    } else if (expectedType === ANIMATION) {
      if (animationTimeout > 0) {
        type = ANIMATION;
        timeout = animationTimeout;
        propCount = animationDurations.length;
      }
    } else {
      timeout = Math.max(transitionTimeout, animationTimeout);
      type = timeout > 0 ? transitionTimeout > animationTimeout ? TRANSITION : ANIMATION : null;
      propCount = type ? type === TRANSITION ? transitionDurations.length : animationDurations.length : 0;
    }

    var hasTransform = type === TRANSITION && transformRE.test(styles[transitionProp + "Property"]);
    return {
      type: type,
      timeout: timeout,
      propCount: propCount,
      hasTransform: hasTransform
    };
  }
  function whenTransitionEnds(el, expectedType, cb) {
    var _getTransitionInfo = getTransitionInfo(el, expectedType),
        type = _getTransitionInfo.type,
        timeout = _getTransitionInfo.timeout,
        propCount = _getTransitionInfo.propCount;

    if (!type) return cb();
    var event = type === TRANSITION ? transitionEndEvent : animationEndEvent;
    var ended = 0;

    var end = function end() {
      // eslint-disable-next-line no-use-before-define
      el.removeEventListener(event, onEnd);
      cb();
    };

    var onEnd = function onEnd(e) {
      if (e.target === el) {
        ended += 1;

        if (ended >= propCount) {
          end();
        }
      }
    };

    setTimeout(function () {
      if (ended < propCount) {
        end();
      }
    }, timeout + 1);
    el.addEventListener(event, onEnd);
    return el;
  }
  function nextFrame(fn) {
    raf(function () {
      raf(fn);
    });
  }

  var transition = /*#__PURE__*/Object.freeze({
    __proto__: null,
    hasTransition: hasTransition,
    get transitionProp () { return transitionProp; },
    get transitionEndEvent () { return transitionEndEvent; },
    get animationProp () { return animationProp; },
    get animationEndEvent () { return animationEndEvent; },
    getTransitionInfo: getTransitionInfo,
    whenTransitionEnds: whenTransitionEnds,
    nextFrame: nextFrame
  });

  var FOCUSABLE_ELEMENTS = ['a[href]', 'area[href]', 'input:not([disabled]):not([type="hidden"]):not([aria-hidden])', 'select:not([disabled]):not([aria-hidden])', 'textarea:not([disabled]):not([aria-hidden])', 'button:not([disabled]):not([aria-hidden])', 'iframe', 'object', 'embed', '[contenteditable]', '[tabindex]:not([tabindex^="-"])'];
  function getFocusableNodes(container) {
    if (!container) return false;
    var nodes = container.querySelectorAll(FOCUSABLE_ELEMENTS);
    return Array.apply(void 0, nodes);
  }
  /**
   * Tries to set focus on a node which is not a close trigger
   * if no other nodes exist then focuses on first close trigger
   */

  function setFocusToFirstNode(container) {
    if (!container) return;
    var focusableNodes = getFocusableNodes(container); // no focusable nodes

    if (focusableNodes.length === 0) return;
    focusableNodes[0].focus();
  }
  function retainFocus(event, container) {
    var focusableNodes = getFocusableNodes(container); // no focusable nodes

    if (focusableNodes.length === 0) return;
    /**
     * Filters nodes which are hidden to prevent
     * focus leak outside modal
     */

    focusableNodes = focusableNodes.filter(function (node) {
      return node.offsetParent !== null;
    }); // if disableFocus is true

    if (!container.contains(document.activeElement)) {
      focusableNodes[0].focus();
      event.preventDefault();
    } else {
      var focusedItemIndex = focusableNodes.indexOf(document.activeElement);

      if (event.shiftKey && focusedItemIndex === 0) {
        focusableNodes[focusableNodes.length - 1].focus();
        event.preventDefault();
      }

      if (!event.shiftKey && focusableNodes.length > 0 && focusedItemIndex === focusableNodes.length - 1) {
        focusableNodes[0].focus();
        event.preventDefault();
      }
    }
  }

  var focusCather = /*#__PURE__*/Object.freeze({
    __proto__: null,
    FOCUSABLE_ELEMENTS: FOCUSABLE_ELEMENTS,
    getFocusableNodes: getFocusableNodes,
    setFocusToFirstNode: setFocusToFirstNode,
    retainFocus: retainFocus
  });

  /* eslint-disable no-unused-vars */
  var index = {
    env: env,
    main: main,
    transition: transition,
    focusCather: focusCather
  };

  return index;

})));
