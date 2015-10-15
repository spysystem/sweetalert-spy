;(function(window, document, undefined) {
  "use strict";
  
  (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// SweetAlert
// 2014-2015 (c) - Tristan Edwards
// github.com/t4t5/sweetalert

/*
 * jQuery-like functions for manipulating the DOM
 */
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _modulesHandleDom = require('./modules/handle-dom');

/*
 * Handy utilities
 */

var _modulesUtils = require('./modules/utils');

/*
 *  Handle sweetAlert's DOM elements
 */

var _modulesHandleSwalDom = require('./modules/handle-swal-dom');

// Handle button events and keyboard events

var _modulesHandleClick = require('./modules/handle-click');

var _modulesHandleKey = require('./modules/handle-key');

var _modulesHandleKey2 = _interopRequireDefault(_modulesHandleKey);

// Default values

var _modulesDefaultParams = require('./modules/default-params');

var _modulesDefaultParams2 = _interopRequireDefault(_modulesDefaultParams);

var _modulesSetParams = require('./modules/set-params');

var _modulesSetParams2 = _interopRequireDefault(_modulesSetParams);

/*
 * Remember state in cases where opening and handling a modal will fiddle with it.
 * (We also use window.previousActiveElement as a global variable)
 */
var previousWindowKeyDown;
var lastFocusedButton;

/*
 * Global sweetAlert function
 * (this is what the user calls)
 */
var sweetAlert, swal;

sweetAlert = swal = function () {
  var customizations = arguments[0];

  (0, _modulesHandleDom.addClass)(document.body, 'stop-scrolling');
  (0, _modulesHandleSwalDom.resetInput)();

  /*
   * Use argument if defined or default value from params object otherwise.
   * Supports the case where a default value is boolean true and should be
   * overridden by a corresponding explicit argument which is boolean false.
   */
  function argumentOrDefault(key) {
    var args = customizations;
    return args[key] === undefined ? _modulesDefaultParams2['default'][key] : args[key];
  }

  if (customizations === undefined) {
    (0, _modulesUtils.logStr)('SweetAlert expects at least 1 attribute!');
    return false;
  }

  var params = (0, _modulesUtils.extend)({}, _modulesDefaultParams2['default']);

  switch (typeof customizations) {

    // Ex: swal("Hello", "Just testing", "info");
    case 'string':
      params.title = customizations;
      params.text = arguments[1] || '';
      params.type = arguments[2] || '';
      break;

    // Ex: swal({ title:"Hello", text: "Just testing", type: "info" });
    case 'object':
      if (customizations.title === undefined) {
        (0, _modulesUtils.logStr)('Missing "title" argument!');
        return false;
      }

      params.title = customizations.title;

      for (var customName in _modulesDefaultParams2['default']) {
        params[customName] = argumentOrDefault(customName);
      }

      // Show "Confirm" instead of "OK" if cancel button is visible
      params.confirmButtonText = params.showCancelButton ? 'Confirm' : _modulesDefaultParams2['default'].confirmButtonText;
      params.confirmButtonText = argumentOrDefault('confirmButtonText');

      // Callback function when clicking on "OK"/"Cancel"
      params.doneFunction = arguments[1] || null;

      break;

    default:
      (0, _modulesUtils.logStr)('Unexpected type of argument! Expected "string" or "object", got ' + typeof customizations);
      return false;

  }

  (0, _modulesSetParams2['default'])(params);
  (0, _modulesHandleSwalDom.fixVerticalPosition)();
  (0, _modulesHandleSwalDom.openModal)(arguments[1]);

  // Modal interactions
  var modal = (0, _modulesHandleSwalDom.getModal)();

  /*
   * Make sure all modal buttons respond to all events
   */
  var $buttons = modal.querySelectorAll('button');
  var buttonEvents = ['onclick', 'onmouseover', 'onmouseout', 'onmousedown', 'onmouseup', 'onfocus'];
  var onButtonEvent = function onButtonEvent(e) {
    return (0, _modulesHandleClick.handleButton)(e, params, modal);
  };

  for (var btnIndex = 0; btnIndex < $buttons.length; btnIndex++) {
    for (var evtIndex = 0; evtIndex < buttonEvents.length; evtIndex++) {
      var btnEvt = buttonEvents[evtIndex];
      $buttons[btnIndex][btnEvt] = onButtonEvent;
    }
  }

  // Clicking outside the modal dismisses it (if allowed by user)
  (0, _modulesHandleSwalDom.getOverlay)().onclick = onButtonEvent;

  previousWindowKeyDown = window.onkeydown;

  var onKeyEvent = function onKeyEvent(e) {
    return (0, _modulesHandleKey2['default'])(e, params, modal);
  };
  window.onkeydown = onKeyEvent;

  window.onfocus = function () {
    // When the user has focused away and focused back from the whole window.
    setTimeout(function () {
      // Put in a timeout to jump out of the event sequence.
      // Calling focus() in the event sequence confuses things.
      if (lastFocusedButton !== undefined) {
        lastFocusedButton.focus();
        lastFocusedButton = undefined;
      }
    }, 0);
  };

  // Show alert with enabled buttons always
  swal.enableButtons();
};

/*
 * Set default params for each popup
 * @param {Object} userParams
 */
sweetAlert.setDefaults = swal.setDefaults = function (userParams) {
  if (!userParams) {
    throw new Error('userParams is required');
  }
  if (typeof userParams !== 'object') {
    throw new Error('userParams has to be a object');
  }

  (0, _modulesUtils.extend)(_modulesDefaultParams2['default'], userParams);
};

/*
 * Animation when closing modal
 */
sweetAlert.close = swal.close = function () {
  var modal = (0, _modulesHandleSwalDom.getModal)();

  (0, _modulesHandleDom.fadeOut)((0, _modulesHandleSwalDom.getOverlay)(), 5);
  (0, _modulesHandleDom.fadeOut)(modal, 5);
  (0, _modulesHandleDom.removeClass)(modal, 'showSweetAlert');
  (0, _modulesHandleDom.addClass)(modal, 'hideSweetAlert');
  (0, _modulesHandleDom.removeClass)(modal, 'visible');

  /*
   * Reset icon animations
   */
  var $successIcon = modal.querySelector('.sa-icon.sa-success');
  (0, _modulesHandleDom.removeClass)($successIcon, 'animate');
  (0, _modulesHandleDom.removeClass)($successIcon.querySelector('.sa-tip'), 'animateSuccessTip');
  (0, _modulesHandleDom.removeClass)($successIcon.querySelector('.sa-long'), 'animateSuccessLong');

  var $errorIcon = modal.querySelector('.sa-icon.sa-error');
  (0, _modulesHandleDom.removeClass)($errorIcon, 'animateErrorIcon');
  (0, _modulesHandleDom.removeClass)($errorIcon.querySelector('.sa-x-mark'), 'animateXMark');

  var $warningIcon = modal.querySelector('.sa-icon.sa-warning');
  (0, _modulesHandleDom.removeClass)($warningIcon, 'pulseWarning');
  (0, _modulesHandleDom.removeClass)($warningIcon.querySelector('.sa-body'), 'pulseWarningIns');
  (0, _modulesHandleDom.removeClass)($warningIcon.querySelector('.sa-dot'), 'pulseWarningIns');

  // Reset custom class (delay so that UI changes aren't visible)
  setTimeout(function () {
    var customClass = modal.getAttribute('data-custom-class');
    (0, _modulesHandleDom.removeClass)(modal, customClass);
  }, 300);

  // Make page scrollable again
  (0, _modulesHandleDom.removeClass)(document.body, 'stop-scrolling');

  // Reset the page to its previous state
  window.onkeydown = previousWindowKeyDown;
  if (window.previousActiveElement) {
    window.previousActiveElement.focus();
  }
  lastFocusedButton = undefined;
  clearTimeout(modal.timeout);

  return true;
};

/*
 * Validation of the input field is done by user
 * If something is wrong => call showInputError with errorMessage
 */
sweetAlert.showInputError = swal.showInputError = function (errorMessage) {
  var modal = (0, _modulesHandleSwalDom.getModal)();

  var $errorIcon = modal.querySelector('.sa-input-error');
  (0, _modulesHandleDom.addClass)($errorIcon, 'show');

  var $errorContainer = modal.querySelector('.sa-error-container');
  (0, _modulesHandleDom.addClass)($errorContainer, 'show');

  $errorContainer.querySelector('p').innerHTML = errorMessage;

  setTimeout(function () {
    sweetAlert.enableButtons();
  }, 1);

  modal.querySelector('input').focus();
};

/*
 * Reset input error DOM elements
 */
sweetAlert.resetInputError = swal.resetInputError = function (event) {
  // If press enter => ignore
  if (event && event.keyCode === 13) {
    return false;
  }

  var $modal = (0, _modulesHandleSwalDom.getModal)();

  var $errorIcon = $modal.querySelector('.sa-input-error');
  (0, _modulesHandleDom.removeClass)($errorIcon, 'show');

  var $errorContainer = $modal.querySelector('.sa-error-container');
  (0, _modulesHandleDom.removeClass)($errorContainer, 'show');
};

/*
 * Disable confirm and cancel buttons
 */
sweetAlert.disableButtons = swal.disableButtons = function (event) {
  var modal = (0, _modulesHandleSwalDom.getModal)();
  var $confirmButton = modal.querySelector('button.confirm');
  var $cancelButton = modal.querySelector('button.cancel');
  $confirmButton.disabled = true;
  $cancelButton.disabled = true;
};

/*
 * Enable confirm and cancel buttons
 */
sweetAlert.enableButtons = swal.enableButtons = function (event) {
  var modal = (0, _modulesHandleSwalDom.getModal)();
  var $confirmButton = modal.querySelector('button.confirm');
  var $cancelButton = modal.querySelector('button.cancel');
  $confirmButton.disabled = false;
  $cancelButton.disabled = false;
};

if (typeof window !== 'undefined') {
  // The 'handle-click' module requires
  // that 'sweetAlert' was set as global.
  window.sweetAlert = window.swal = sweetAlert;
} else {
  (0, _modulesUtils.logStr)('SweetAlert is a frontend module!');
}

},{"./modules/default-params":2,"./modules/handle-click":3,"./modules/handle-dom":4,"./modules/handle-key":5,"./modules/handle-swal-dom":6,"./modules/set-params":8,"./modules/utils":9}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var defaultParams = {
  title: '',
  text: '',
  type: null,
  allowOutsideClick: false,
  showConfirmButton: true,
  showCancelButton: false,
  closeOnConfirm: true,
  closeOnCancel: true,
  confirmButtonText: 'OK',
  confirmButtonColor: '#8CD4F5',
  cancelButtonText: 'Cancel',
  imageUrl: null,
  imageSize: null,
  timer: null,
  customClass: '',
  html: false,
  animation: true,
  allowEscapeKey: true,
  inputType: 'text',
  inputPlaceholder: '',
  inputValue: '',
  showLoaderOnConfirm: false,
  allowEnterConfirm: true,
  floatButtons: false
};

exports['default'] = defaultParams;
module.exports = exports['default'];

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _utils = require('./utils');

var _handleSwalDom = require('./handle-swal-dom');

var _handleDom = require('./handle-dom');

/*
 * User clicked on "Confirm"/"OK" or "Cancel"
 */
var handleButton = function handleButton(event, params, modal) {
  var e = event || window.event;
  var target = e.target || e.srcElement;

  var targetedConfirm = target.className.indexOf('confirm') !== -1;
  var targetedOverlay = target.className.indexOf('sweet-overlay') !== -1;
  var modalIsVisible = (0, _handleDom.hasClass)(modal, 'visible');
  var doneFunctionExists = params.doneFunction && modal.getAttribute('data-has-done-function') === 'true';

  // Since the user can change the background-color of the confirm button programmatically,
  // we must calculate what the color should be on hover/active
  var normalColor, hoverColor, activeColor;
  if (targetedConfirm && params.confirmButtonColor) {
    normalColor = params.confirmButtonColor;
    hoverColor = (0, _utils.colorLuminance)(normalColor, -0.04);
    activeColor = (0, _utils.colorLuminance)(normalColor, -0.14);
  }

  function shouldSetConfirmButtonColor(color) {
    if (targetedConfirm && params.confirmButtonColor) {
      target.style.backgroundColor = color;
    }
  }

  switch (e.type) {
    case 'mouseover':
      shouldSetConfirmButtonColor(hoverColor);
      break;

    case 'mouseout':
      shouldSetConfirmButtonColor(normalColor);
      break;

    case 'mousedown':
      shouldSetConfirmButtonColor(activeColor);
      break;

    case 'mouseup':
      shouldSetConfirmButtonColor(hoverColor);
      break;

    case 'focus':
      var $confirmButton = modal.querySelector('button.confirm');
      var $cancelButton = modal.querySelector('button.cancel');

      if (targetedConfirm) {
        $cancelButton.style.boxShadow = 'none';
      } else {
        $confirmButton.style.boxShadow = 'none';
      }
      break;

    case 'click':
      var clickedOnModal = modal === target;
      var clickedOnModalChild = (0, _handleDom.isDescendant)(modal, target);

      // Ignore click outside if allowOutsideClick is false
      if (!clickedOnModal && !clickedOnModalChild && modalIsVisible && !params.allowOutsideClick) {
        break;
      }

      if (targetedConfirm && doneFunctionExists && modalIsVisible) {
        handleConfirm(modal, params);
      } else if (doneFunctionExists && modalIsVisible || targetedOverlay) {
        handleCancel(modal, params);
      } else if ((0, _handleDom.isDescendant)(modal, target) && target.tagName === 'BUTTON') {
        sweetAlert.close();
      }
      break;
  }
};

/*
 *  User clicked on "Confirm"/"OK"
 */
var handleConfirm = function handleConfirm(modal, params) {
  var callbackValue = true;

  if ((0, _handleDom.hasClass)(modal, 'show-input')) {
    callbackValue = modal.querySelector('input').value;

    if (!callbackValue) {
      callbackValue = '';
    }
  }

  params.doneFunction(callbackValue);

  if (params.closeOnConfirm) {
    sweetAlert.close();
  }
  // Disable cancel and confirm button if the parameter is true
  if (params.showLoaderOnConfirm) {
    sweetAlert.disableButtons();
  }
};

/*
 *  User clicked on "Cancel"
 */
var handleCancel = function handleCancel(modal, params) {
  // Check if callback function expects a parameter (to track cancel actions)
  var functionAsStr = String(params.doneFunction).replace(/\s/g, '');
  var functionHandlesCancel = functionAsStr.substring(0, 9) === 'function(' && functionAsStr.substring(9, 10) !== ')';

  if (functionHandlesCancel) {
    params.doneFunction(false);
  }

  if (params.closeOnCancel) {
    sweetAlert.close();
  }
};

exports['default'] = {
  handleButton: handleButton,
  handleConfirm: handleConfirm,
  handleCancel: handleCancel
};
module.exports = exports['default'];

},{"./handle-dom":4,"./handle-swal-dom":6,"./utils":9}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var hasClass = function hasClass(elem, className) {
  return new RegExp(' ' + className + ' ').test(' ' + elem.className + ' ');
};

var addClass = function addClass(elem, className) {
  if (!hasClass(elem, className)) {
    elem.className += ' ' + className;
  }
};

var removeClass = function removeClass(elem, className) {
  var newClass = ' ' + elem.className.replace(/[\t\r\n]/g, ' ') + ' ';
  if (hasClass(elem, className)) {
    while (newClass.indexOf(' ' + className + ' ') >= 0) {
      newClass = newClass.replace(' ' + className + ' ', ' ');
    }
    elem.className = newClass.replace(/^\s+|\s+$/g, '');
  }
};

var escapeHtml = function escapeHtml(str) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
};

var _show = function _show(elem) {
  elem.style.opacity = '';
  elem.style.display = 'block';
};

var show = function show(elems) {
  if (elems && !elems.length) {
    return _show(elems);
  }
  for (var i = 0; i < elems.length; ++i) {
    _show(elems[i]);
  }
};

var _hide = function _hide(elem) {
  elem.style.opacity = '';
  elem.style.display = 'none';
};

var hide = function hide(elems) {
  if (elems && !elems.length) {
    return _hide(elems);
  }
  for (var i = 0; i < elems.length; ++i) {
    _hide(elems[i]);
  }
};

var isDescendant = function isDescendant(parent, child) {
  var node = child.parentNode;
  while (node !== null) {
    if (node === parent) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
};

var getTopMargin = function getTopMargin(elem) {
  elem.style.left = '-9999px';
  elem.style.display = 'block';

  var height = elem.clientHeight,
      padding;
  if (typeof getComputedStyle !== "undefined") {
    // IE 8
    padding = parseInt(getComputedStyle(elem).getPropertyValue('padding-top'), 10);
  } else {
    padding = parseInt(elem.currentStyle.padding);
  }

  elem.style.left = '';
  elem.style.display = 'none';
  return '-' + parseInt((height + padding) / 2) + 'px';
};

var fadeIn = function fadeIn(elem, interval) {
  if (+elem.style.opacity < 1) {
    interval = interval || 16;
    elem.style.opacity = 0;
    elem.style.display = 'block';
    var last = +new Date();
    var tick = function tick() {
      elem.style.opacity = +elem.style.opacity + (new Date() - last) / 100;
      last = +new Date();

      if (+elem.style.opacity < 1) {
        setTimeout(tick, interval);
      }
    };
    tick();
  }
  elem.style.display = 'block'; //fallback IE8
};

var fadeOut = function fadeOut(elem, interval) {
  interval = interval || 16;
  elem.style.opacity = 1;
  var last = +new Date();
  var tick = function tick() {
    elem.style.opacity = +elem.style.opacity - (new Date() - last) / 100;
    last = +new Date();

    if (+elem.style.opacity > 0) {
      setTimeout(tick, interval);
    } else {
      elem.style.display = 'none';
    }
  };
  tick();
};

var fireClick = function fireClick(node) {
  // Taken from http://www.nonobtrusive.com/2011/11/29/programatically-fire-crossbrowser-click-event-with-javascript/
  // Then fixed for today's Chrome browser.
  if (typeof MouseEvent === 'function') {
    // Up-to-date approach
    var mevt = new MouseEvent('click', {
      view: window,
      bubbles: false,
      cancelable: true
    });
    node.dispatchEvent(mevt);
  } else if (document.createEvent) {
    // Fallback
    var evt = document.createEvent('MouseEvents');
    evt.initEvent('click', false, false);
    node.dispatchEvent(evt);
  } else if (document.createEventObject) {
    node.fireEvent('onclick');
  } else if (typeof node.onclick === 'function') {
    node.onclick();
  }
};

var stopEventPropagation = function stopEventPropagation(e) {
  // In particular, make sure the space bar doesn't scroll the main window.
  if (typeof e.stopPropagation === 'function') {
    e.stopPropagation();
    e.preventDefault();
  } else if (window.event && window.event.hasOwnProperty('cancelBubble')) {
    window.event.cancelBubble = true;
  }
};

exports.hasClass = hasClass;
exports.addClass = addClass;
exports.removeClass = removeClass;
exports.escapeHtml = escapeHtml;
exports._show = _show;
exports.show = show;
exports._hide = _hide;
exports.hide = hide;
exports.isDescendant = isDescendant;
exports.getTopMargin = getTopMargin;
exports.fadeIn = fadeIn;
exports.fadeOut = fadeOut;
exports.fireClick = fireClick;
exports.stopEventPropagation = stopEventPropagation;

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _handleDom = require('./handle-dom');

var _handleSwalDom = require('./handle-swal-dom');

var handleKeyDown = function handleKeyDown(event, params, modal) {
  var e = event || window.event;
  var keyCode = e.keyCode || e.which;

  var $okButton = modal.querySelector('button.confirm');
  var $cancelButton = modal.querySelector('button.cancel');
  var $modalButtons = modal.querySelectorAll('button[tabindex]');

  if ([9, 13, 32, 27].indexOf(keyCode) === -1) {
    // Don't do work on keys we don't care about.
    return;
  }

  var $targetElement = e.target || e.srcElement;

  var btnIndex = -1; // Find the button - note, this is a nodelist, not an array.
  for (var i = 0; i < $modalButtons.length; i++) {
    if ($targetElement === $modalButtons[i]) {
      btnIndex = i;
      break;
    }
  }

  if (keyCode === 9) {
    // TAB
    if (btnIndex === -1) {
      // No button focused. Jump to the confirm button.
      $targetElement = $okButton;
    } else {
      // Cycle to the next button
      if (btnIndex === $modalButtons.length - 1) {
        $targetElement = $modalButtons[0];
      } else {
        $targetElement = $modalButtons[btnIndex + 1];
      }
    }

    (0, _handleDom.stopEventPropagation)(e);
    $targetElement.focus();

    if (params.confirmButtonColor) {
      (0, _handleSwalDom.setFocusStyle)($targetElement, params.confirmButtonColor);
    }
  } else {
    if (keyCode === 13) {
      if ($targetElement.tagName === 'INPUT') {
        $targetElement = $okButton;
        $okButton.focus();
      }

      if (btnIndex === -1) {
        // ENTER/SPACE clicked outside of a button.
        if (params.allowEnterConfirm) {
          $targetElement = $okButton;
          (0, _handleDom.fireClick)($targetElement, e);
        } else {
          $targetElement = $okButton;
        }
      } else {
        // Do nothing - let the browser handle it.
        $targetElement = undefined;
      }
    } else if (keyCode === 27 && params.allowEscapeKey === true) {
      $targetElement = $cancelButton;
      (0, _handleDom.fireClick)($targetElement, e);
    } else {
      // Fallback - let the browser handle it.
      $targetElement = undefined;
    }
  }
};

exports['default'] = handleKeyDown;
module.exports = exports['default'];

},{"./handle-dom":4,"./handle-swal-dom":6}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utils = require('./utils');

var _handleDom = require('./handle-dom');

var _defaultParams = require('./default-params');

var _defaultParams2 = _interopRequireDefault(_defaultParams);

/*
 * Add modal + overlay to DOM
 */

var _injectedHtml = require('./injected-html');

var _injectedHtml2 = _interopRequireDefault(_injectedHtml);

var modalClass = '.sweet-alert';
var overlayClass = '.sweet-overlay';

var sweetAlertInitialize = function sweetAlertInitialize() {
  var sweetWrap = document.createElement('div');
  sweetWrap.innerHTML = _injectedHtml2['default'];

  // Append elements to body
  while (sweetWrap.firstChild) {
    document.body.appendChild(sweetWrap.firstChild);
  }
};

/*
 * Get DOM element of modal
 */
var getModal = function getModal() {
  var $modal = document.querySelector(modalClass);

  if (!$modal) {
    sweetAlertInitialize();
    $modal = getModal();
  }

  return $modal;
};

/*
 * Get DOM element of input (in modal)
 */
var getInput = function getInput() {
  var $modal = getModal();
  if ($modal) {
    return $modal.querySelector('input');
  }
};

/*
 * Get DOM element of overlay
 */
var getOverlay = function getOverlay() {
  return document.querySelector(overlayClass);
};

/*
 * Add box-shadow style to button (depending on its chosen bg-color)
 */
var setFocusStyle = function setFocusStyle($button, bgColor) {
  var rgbColor = (0, _utils.hexToRgb)(bgColor);
  $button.style.boxShadow = '0 0 2px rgba(' + rgbColor + ', 0.8), inset 0 0 0 1px rgba(0, 0, 0, 0.05)';
};

/*
 * Animation when opening modal
 */
var openModal = function openModal(callback) {
  var $modal = getModal();
  (0, _handleDom.fadeIn)(getOverlay(), 10);
  (0, _handleDom.show)($modal);
  (0, _handleDom.addClass)($modal, 'showSweetAlert');
  (0, _handleDom.removeClass)($modal, 'hideSweetAlert');

  window.previousActiveElement = document.activeElement;
  var $okButton = $modal.querySelector('button.confirm');
  $okButton.focus();

  setTimeout(function () {
    (0, _handleDom.addClass)($modal, 'visible');
  }, 500);

  var timer = $modal.getAttribute('data-timer');

  if (timer !== 'null' && timer !== '') {
    var timerCallback = callback;
    $modal.timeout = setTimeout(function () {
      var doneFunctionExists = (timerCallback || null) && $modal.getAttribute('data-has-done-function') === 'true';
      if (doneFunctionExists) {
        timerCallback(null);
      } else {
        sweetAlert.close();
      }
    }, timer);
  }
};

/*
 * Reset the styling of the input
 * (for example if errors have been shown)
 */
var resetInput = function resetInput() {
  var $modal = getModal();
  var $input = getInput();

  (0, _handleDom.removeClass)($modal, 'show-input');
  $input.value = _defaultParams2['default'].inputValue;
  $input.setAttribute('type', _defaultParams2['default'].inputType);
  $input.setAttribute('placeholder', _defaultParams2['default'].inputPlaceholder);

  resetInputError();
};

var resetInputError = function resetInputError(event) {
  // If press enter => ignore
  if (event && event.keyCode === 13) {
    return false;
  }

  var $modal = getModal();

  var $errorIcon = $modal.querySelector('.sa-input-error');
  (0, _handleDom.removeClass)($errorIcon, 'show');

  var $errorContainer = $modal.querySelector('.sa-error-container');
  (0, _handleDom.removeClass)($errorContainer, 'show');
};

/*
 * Set "margin-top"-property on modal based on its computed height
 */
var fixVerticalPosition = function fixVerticalPosition() {
  var $modal = getModal();
  $modal.style.marginTop = (0, _handleDom.getTopMargin)(getModal());
};

exports.sweetAlertInitialize = sweetAlertInitialize;
exports.getModal = getModal;
exports.getOverlay = getOverlay;
exports.getInput = getInput;
exports.setFocusStyle = setFocusStyle;
exports.openModal = openModal;
exports.resetInput = resetInput;
exports.resetInputError = resetInputError;
exports.fixVerticalPosition = fixVerticalPosition;

},{"./default-params":2,"./handle-dom":4,"./injected-html":7,"./utils":9}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var injectedHTML =

// Dark overlay
"<div class=\"sweet-overlay\" tabIndex=\"-1\"></div>" +

// Modal
"<div class=\"sweet-alert\">" +

// Error icon
"<div class=\"sa-icon sa-error\">\n      <span class=\"sa-x-mark\">\n        <span class=\"sa-line sa-left\"></span>\n        <span class=\"sa-line sa-right\"></span>\n      </span>\n    </div>" +

// Warning icon
"<div class=\"sa-icon sa-warning\">\n      <span class=\"sa-body\"></span>\n      <span class=\"sa-dot\"></span>\n    </div>" +

// Info icon
"<div class=\"sa-icon sa-info\"></div>" +

// Success icon
"<div class=\"sa-icon sa-success\">\n      <span class=\"sa-line sa-tip\"></span>\n      <span class=\"sa-line sa-long\"></span>\n\n      <div class=\"sa-placeholder\"></div>\n      <div class=\"sa-fix\"></div>\n    </div>" + "<div class=\"sa-icon sa-custom\"></div>" +

// Title, text and input
"<h2>Title</h2>\n    <p>Text</p>\n    <fieldset>\n      <input type=\"text\" tabIndex=\"3\" />\n      <div class=\"sa-input-error\"></div>\n    </fieldset>" +

// Input errors
"<div class=\"sa-error-container\">\n      <div class=\"icon\">!</div>\n      <p>Not valid!</p>\n    </div>" +

// Cancel and confirm buttons
"<div class=\"sa-button-container\">\n      <button class=\"cancel\" tabIndex=\"2\">Cancel</button>\n      <div class=\"sa-confirm-button-container\">\n        <button class=\"confirm\" tabIndex=\"1\">OK</button>" +

// Loading animation
"<div class=\"la-ball-fall\">\n          <div></div>\n          <div></div>\n          <div></div>\n        </div>\n      </div>\n    </div>" +

// End of modal
"</div>";

exports["default"] = injectedHTML;
module.exports = exports["default"];

},{}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _utils = require('./utils');

var _handleSwalDom = require('./handle-swal-dom');

var _handleDom = require('./handle-dom');

/*
 * Set type, text and actions on modal
 */
var alertTypes = ['error', 'warning', 'info', 'success', 'input', 'prompt'];

var setParameters = function setParameters(params) {
  var modal = (0, _handleSwalDom.getModal)();

  var $title = modal.querySelector('h2');
  var $text = modal.querySelector('p');
  var $cancelBtn = modal.querySelector('button.cancel');
  var $confirmBtn = modal.querySelector('button.confirm');

  /*
   * Title
   */
  $title.innerHTML = params.html ? params.title : (0, _handleDom.escapeHtml)(params.title).split('\n').join('<br>');

  /*
   * Text
   */
  $text.innerHTML = params.html ? params.text : (0, _handleDom.escapeHtml)(params.text || '').split('\n').join('<br>');
  if (params.text) (0, _handleDom.show)($text);

  /*
   * Custom class
   */
  if (params.customClass) {
    (0, _handleDom.addClass)(modal, params.customClass);
    modal.setAttribute('data-custom-class', params.customClass);
  } else {
    // Find previously set classes and remove them
    var customClass = modal.getAttribute('data-custom-class');
    (0, _handleDom.removeClass)(modal, customClass);
    modal.setAttribute('data-custom-class', '');
  }

  /*
   * Icon
   */
  (0, _handleDom.hide)(modal.querySelectorAll('.sa-icon'));

  if (params.type && !(0, _utils.isIE8)()) {
    var _ret = (function () {

      var validType = false;

      for (var i = 0; i < alertTypes.length; i++) {
        if (params.type === alertTypes[i]) {
          validType = true;
          break;
        }
      }

      if (!validType) {
        logStr('Unknown alert type: ' + params.type);
        return {
          v: false
        };
      }

      var typesWithIcons = ['success', 'error', 'warning', 'info'];
      var $icon = undefined;

      if (typesWithIcons.indexOf(params.type) !== -1) {
        $icon = modal.querySelector('.sa-icon.' + 'sa-' + params.type);
        (0, _handleDom.show)($icon);
      }

      var $input = (0, _handleSwalDom.getInput)();

      // Animate icon
      switch (params.type) {

        case 'success':
          (0, _handleDom.addClass)($icon, 'animate');
          (0, _handleDom.addClass)($icon.querySelector('.sa-tip'), 'animateSuccessTip');
          (0, _handleDom.addClass)($icon.querySelector('.sa-long'), 'animateSuccessLong');
          break;

        case 'error':
          (0, _handleDom.addClass)($icon, 'animateErrorIcon');
          (0, _handleDom.addClass)($icon.querySelector('.sa-x-mark'), 'animateXMark');
          break;

        case 'warning':
          (0, _handleDom.addClass)($icon, 'pulseWarning');
          (0, _handleDom.addClass)($icon.querySelector('.sa-body'), 'pulseWarningIns');
          (0, _handleDom.addClass)($icon.querySelector('.sa-dot'), 'pulseWarningIns');
          break;

        case 'input':
        case 'prompt':
          $input.setAttribute('type', params.inputType);
          $input.value = params.inputValue;
          $input.setAttribute('placeholder', params.inputPlaceholder);
          (0, _handleDom.addClass)(modal, 'show-input');
          setTimeout(function () {
            $input.focus();
            $input.addEventListener('keyup', swal.resetInputError);
          }, 400);
          break;
      }
    })();

    if (typeof _ret === 'object') return _ret.v;
  }

  /*
   * Custom image
   */
  if (params.imageUrl) {
    var $customIcon = modal.querySelector('.sa-icon.sa-custom');

    $customIcon.style.backgroundImage = 'url(' + params.imageUrl + ')';
    (0, _handleDom.show)($customIcon);

    var _imgWidth = 80;
    var _imgHeight = 80;

    if (params.imageSize) {
      var dimensions = params.imageSize.toString().split('x');
      var imgWidth = dimensions[0];
      var imgHeight = dimensions[1];

      if (!imgWidth || !imgHeight) {
        logStr('Parameter imageSize expects value with format WIDTHxHEIGHT, got ' + params.imageSize);
      } else {
        _imgWidth = imgWidth;
        _imgHeight = imgHeight;
      }
    }

    $customIcon.setAttribute('style', $customIcon.getAttribute('style') + 'width:' + _imgWidth + 'px; height:' + _imgHeight + 'px');
  }

  if (params.floatButtons) {
    (0, _handleDom.addClass)(modal.querySelector('.sa-button-container'), 'floatButtons');
  } else {
    (0, _handleDom.removeClass)(modal.querySelector('.sa-button-container'), 'floatButtons');
  }

  /*
   * Show cancel button?
   */
  modal.setAttribute('data-has-cancel-button', params.showCancelButton);
  if (params.showCancelButton) {
    $cancelBtn.style.display = 'inline-block';
  } else {
    (0, _handleDom.hide)($cancelBtn);
  }

  /*
   * Show confirm button?
   */
  modal.setAttribute('data-has-confirm-button', params.showConfirmButton);
  if (params.showConfirmButton) {
    $confirmBtn.style.display = 'inline-block';
  } else {
    (0, _handleDom.hide)($confirmBtn);
  }

  /*
   * Custom text on cancel/confirm buttons
   */
  if (params.cancelButtonText) {
    $cancelBtn.innerHTML = (0, _handleDom.escapeHtml)(params.cancelButtonText);
  }
  if (params.confirmButtonText) {
    $confirmBtn.innerHTML = (0, _handleDom.escapeHtml)(params.confirmButtonText);
  }

  /*
   * Custom color on confirm button
   */
  if (params.confirmButtonColor) {
    // Set confirm button to selected background color
    $confirmBtn.style.backgroundColor = params.confirmButtonColor;

    // Set the confirm button color to the loading ring
    $confirmBtn.style.borderLeftColor = params.confirmLoadingButtonColor;
    $confirmBtn.style.borderRightColor = params.confirmLoadingButtonColor;

    // Set box-shadow to default focused button
    (0, _handleSwalDom.setFocusStyle)($confirmBtn, params.confirmButtonColor);
  }

  /*
   * Allow outside click
   */
  modal.setAttribute('data-allow-outside-click', params.allowOutsideClick);

  /*
   * Callback function
   */
  var hasDoneFunction = params.doneFunction ? true : false;
  modal.setAttribute('data-has-done-function', hasDoneFunction);

  /*
   * Animation
   */
  if (!params.animation) {
    modal.setAttribute('data-animation', 'none');
  } else if (typeof params.animation === 'string') {
    modal.setAttribute('data-animation', params.animation); // Custom animation
  } else {
      modal.setAttribute('data-animation', 'pop');
    }

  /*
   * Timer
   */
  modal.setAttribute('data-timer', params.timer);
};

exports['default'] = setParameters;
module.exports = exports['default'];

},{"./handle-dom":4,"./handle-swal-dom":6,"./utils":9}],9:[function(require,module,exports){
/*
 * Allow user to pass their own params
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var extend = function extend(a, b) {
  for (var key in b) {
    if (b.hasOwnProperty(key)) {
      a[key] = b[key];
    }
  }
  return a;
};

/*
 * Convert HEX codes to RGB values (#000000 -> rgb(0,0,0))
 */
var hexToRgb = function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? parseInt(result[1], 16) + ', ' + parseInt(result[2], 16) + ', ' + parseInt(result[3], 16) : null;
};

/*
 * Check if the user is using Internet Explorer 8 (for fallbacks)
 */
var isIE8 = function isIE8() {
  return window.attachEvent && !window.addEventListener;
};

/*
 * IE compatible logging for developers
 */
var logStr = function logStr(string) {
  if (window.console) {
    // IE...
    window.console.log('SweetAlert: ' + string);
  }
};

/*
 * Set hover, active and focus-states for buttons 
 * (source: http://www.sitepoint.com/javascript-generate-lighter-darker-color)
 */
var colorLuminance = function colorLuminance(hex, lum) {
  // Validate hex string
  hex = String(hex).replace(/[^0-9a-f]/gi, '');
  if (hex.length < 6) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  lum = lum || 0;

  // Convert to decimal and change luminosity
  var rgb = '#';
  var c;
  var i;

  for (i = 0; i < 3; i++) {
    c = parseInt(hex.substr(i * 2, 2), 16);
    c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16);
    rgb += ('00' + c).substr(c.length);
  }

  return rgb;
};

exports.extend = extend;
exports.hexToRgb = hexToRgb;
exports.isIE8 = isIE8;
exports.logStr = logStr;
exports.colorLuminance = colorLuminance;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDOi9Qcm9qZWN0cy9zd2VldGFsZXJ0LXNweS9kZXYvc3dlZXRhbGVydC5lczYuanMiLCJDOi9Qcm9qZWN0cy9zd2VldGFsZXJ0LXNweS9kZXYvbW9kdWxlcy9kZWZhdWx0LXBhcmFtcy5qcyIsIkM6L1Byb2plY3RzL3N3ZWV0YWxlcnQtc3B5L2Rldi9tb2R1bGVzL2hhbmRsZS1jbGljay5qcyIsIkM6L1Byb2plY3RzL3N3ZWV0YWxlcnQtc3B5L2Rldi9tb2R1bGVzL2hhbmRsZS1kb20uanMiLCJDOi9Qcm9qZWN0cy9zd2VldGFsZXJ0LXNweS9kZXYvbW9kdWxlcy9oYW5kbGUta2V5LmpzIiwiQzovUHJvamVjdHMvc3dlZXRhbGVydC1zcHkvZGV2L21vZHVsZXMvaGFuZGxlLXN3YWwtZG9tLmpzIiwiQzovUHJvamVjdHMvc3dlZXRhbGVydC1zcHkvZGV2L21vZHVsZXMvaW5qZWN0ZWQtaHRtbC5qcyIsIkM6L1Byb2plY3RzL3N3ZWV0YWxlcnQtc3B5L2Rldi9tb2R1bGVzL3NldC1wYXJhbXMuanMiLCJDOi9Qcm9qZWN0cy9zd2VldGFsZXJ0LXNweS9kZXYvbW9kdWxlcy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7O2dDQ2dCTyxzQkFBc0I7Ozs7Ozs0QkFXdEIsaUJBQWlCOzs7Ozs7b0NBY2pCLDJCQUEyQjs7OztrQ0FJd0Isd0JBQXdCOztnQ0FDeEQsc0JBQXNCOzs7Ozs7b0NBSXRCLDBCQUEwQjs7OztnQ0FDMUIsc0JBQXNCOzs7Ozs7OztBQU1oRCxJQUFJLHFCQUFxQixDQUFDO0FBQzFCLElBQUksaUJBQWlCLENBQUM7Ozs7OztBQU90QixJQUFJLFVBQVUsRUFBRSxJQUFJLENBQUM7O0FBRXJCLFVBQVUsR0FBRyxJQUFJLEdBQUcsWUFBVztBQUM3QixNQUFJLGNBQWMsR0FBRyxTQUFTLENBQUMs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QUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDM0Q7QUFDRCxLQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQzs7O0FBR2YsTUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQ2QsTUFBSSxDQUFDLENBQUM7QUFDTixNQUFJLENBQUMsQ0FBQzs7QUFFTixPQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUN0QixLQUFDLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUN2QyxLQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDckUsT0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQSxDQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7R0FDcEM7O0FBRUQsU0FBTyxHQUFHLENBQUM7Q0FDWixDQUFDOztRQUlBLE1BQU0sR0FBTixNQUFNO1FBQ04sUUFBUSxHQUFSLFFBQVE7UUFDUixLQUFLLEdBQUwsS0FBSztRQUNMLE1BQU0sR0FBTixNQUFNO1FBQ04sY0FBYyxHQUFkLGNBQWMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gU3dlZXRBbGVydFxyXG4vLyAyMDE0LTIwMTUgKGMpIC0gVHJpc3RhbiBFZHdhcmRzXHJcbi8vIGdpdGh1Yi5jb20vdDR0NS9zd2VldGFsZXJ0XHJcblxyXG4vKlxyXG4gKiBqUXVlcnktbGlrZSBmdW5jdGlvbnMgZm9yIG1hbmlwdWxhdGluZyB0aGUgRE9NXHJcbiAqL1xyXG5pbXBvcnQge1xyXG4gIGhhc0NsYXNzLCBhZGRDbGFzcywgcmVtb3ZlQ2xhc3MsXHJcbiAgZXNjYXBlSHRtbCxcclxuICBfc2hvdywgc2hvdywgX2hpZGUsIGhpZGUsXHJcbiAgaXNEZXNjZW5kYW50LFxyXG4gIGdldFRvcE1hcmdpbixcclxuICBmYWRlSW4sIGZhZGVPdXQsXHJcbiAgZmlyZUNsaWNrLFxyXG4gIHN0b3BFdmVudFByb3BhZ2F0aW9uXHJcbn0gZnJvbSAnLi9tb2R1bGVzL2hhbmRsZS1kb20nO1xyXG5cclxuLypcclxuICogSGFuZHkgdXRpbGl0aWVzXHJcbiAqL1xyXG5pbXBvcnQge1xyXG4gIGV4dGVuZCxcclxuICBoZXhUb1JnYixcclxuICBpc0lFOCxcclxuICBsb2dTdHIsXHJcbiAgY29sb3JMdW1pbmFuY2VcclxufSBmcm9tICcuL21vZHVsZXMvdXRpbHMnO1xyXG5cclxuLypcclxuICogIEhhbmRsZSBzd2VldEFsZXJ0J3MgRE9NIGVsZW1lbnRzXHJcbiAqL1xyXG5pbXBvcnQge1xyXG4gIHN3ZWV0QWxlcnRJbml0aWFsaXplLFxyXG4gIGdldE1vZGFsLFxyXG4gIGdldE92ZXJsYXksXHJcbiAgZ2V0SW5wdXQsXHJcbiAgc2V0Rm9jdXNTdHlsZSxcclxuICBvcGVuTW9kYWwsXHJcbiAgcmVzZXRJbnB1dCxcclxuICBmaXhWZXJ0aWNhbFBvc2l0aW9uXHJcbn0gZnJvbSAnLi9tb2R1bGVzL2hhbmRsZS1zd2FsLWRvbSc7XHJcblxyXG5cclxuLy8gSGFuZGxlIGJ1dHRvbiBldmVudHMgYW5kIGtleWJvYXJkIGV2ZW50c1xyXG5pbXBvcnQgeyBoYW5kbGVCdXR0b24sIGhhbmRsZUNvbmZpcm0sIGhhbmRsZUNhbmNlbCB9IGZyb20gJy4vbW9kdWxlcy9oYW5kbGUtY2xpY2snO1xyXG5pbXBvcnQgaGFuZGxlS2V5RG93biBmcm9tICcuL21vZHVsZXMvaGFuZGxlLWtleSc7XHJcblxyXG5cclxuLy8gRGVmYXVsdCB2YWx1ZXNcclxuaW1wb3J0IGRlZmF1bHRQYXJhbXMgZnJvbSAnLi9tb2R1bGVzL2RlZmF1bHQtcGFyYW1zJztcclxuaW1wb3J0IHNldFBhcmFtZXRlcnMgZnJvbSAnLi9tb2R1bGVzL3NldC1wYXJhbXMnO1xyXG5cclxuLypcclxuICogUmVtZW1iZXIgc3RhdGUgaW4gY2FzZXMgd2hlcmUgb3BlbmluZyBhbmQgaGFuZGxpbmcgYSBtb2RhbCB3aWxsIGZpZGRsZSB3aXRoIGl0LlxyXG4gKiAoV2UgYWxzbyB1c2Ugd2luZG93LnByZXZpb3VzQWN0aXZlRWxlbWVudCBhcyBhIGdsb2JhbCB2YXJpYWJsZSlcclxuICovXHJcbnZhciBwcmV2aW91c1dpbmRvd0tleURvd247XHJcbnZhciBsYXN0Rm9jdXNlZEJ1dHRvbjtcclxuXHJcblxyXG4vKlxyXG4gKiBHbG9iYWwgc3dlZXRBbGVydCBmdW5jdGlvblxyXG4gKiAodGhpcyBpcyB3aGF0IHRoZSB1c2VyIGNhbGxzKVxyXG4gKi9cclxudmFyIHN3ZWV0QWxlcnQsIHN3YWw7XHJcblxyXG5zd2VldEFsZXJ0ID0gc3dhbCA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciBjdXN0b21pemF0aW9ucyA9IGFyZ3VtZW50c1swXTtcclxuXHJcbiAgYWRkQ2xhc3MoZG9jdW1lbnQuYm9keSwgJ3N0b3Atc2Nyb2xsaW5nJyk7XHJcbiAgcmVzZXRJbnB1dCgpO1xyXG5cclxuICAvKlxyXG4gICAqIFVzZSBhcmd1bWVudCBpZiBkZWZpbmVkIG9yIGRlZmF1bHQgdmFsdWUgZnJvbSBwYXJhbXMgb2JqZWN0IG90aGVyd2lzZS5cclxuICAgKiBTdXBwb3J0cyB0aGUgY2FzZSB3aGVyZSBhIGRlZmF1bHQgdmFsdWUgaXMgYm9vbGVhbiB0cnVlIGFuZCBzaG91bGQgYmVcclxuICAgKiBvdmVycmlkZGVuIGJ5IGEgY29ycmVzcG9uZGluZyBleHBsaWNpdCBhcmd1bWVudCB3aGljaCBpcyBib29sZWFuIGZhbHNlLlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGFyZ3VtZW50T3JEZWZhdWx0KGtleSkge1xyXG4gICAgdmFyIGFyZ3MgPSBjdXN0b21pemF0aW9ucztcclxuICAgIHJldHVybiAoYXJnc1trZXldID09PSB1bmRlZmluZWQpID8gIGRlZmF1bHRQYXJhbXNba2V5XSA6IGFyZ3Nba2V5XTtcclxuICB9XHJcblxyXG4gIGlmIChjdXN0b21pemF0aW9ucyA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICBsb2dTdHIoJ1N3ZWV0QWxlcnQgZXhwZWN0cyBhdCBsZWFzdCAxIGF0dHJpYnV0ZSEnKTtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIHZhciBwYXJhbXMgPSBleHRlbmQoe30sIGRlZmF1bHRQYXJhbXMpO1xyXG5cclxuICBzd2l0Y2ggKHR5cGVvZiBjdXN0b21pemF0aW9ucykge1xyXG5cclxuICAgIC8vIEV4OiBzd2FsKFwiSGVsbG9cIiwgXCJKdXN0IHRlc3RpbmdcIiwgXCJpbmZvXCIpO1xyXG4gICAgY2FzZSAnc3RyaW5nJzpcclxuICAgICAgcGFyYW1zLnRpdGxlID0gY3VzdG9taXphdGlvbnM7XHJcbiAgICAgIHBhcmFtcy50ZXh0ICA9IGFyZ3VtZW50c1sxXSB8fCAnJztcclxuICAgICAgcGFyYW1zLnR5cGUgID0gYXJndW1lbnRzWzJdIHx8ICcnO1xyXG4gICAgICBicmVhaztcclxuXHJcbiAgICAvLyBFeDogc3dhbCh7IHRpdGxlOlwiSGVsbG9cIiwgdGV4dDogXCJKdXN0IHRlc3RpbmdcIiwgdHlwZTogXCJpbmZvXCIgfSk7XHJcbiAgICBjYXNlICdvYmplY3QnOlxyXG4gICAgICBpZiAoY3VzdG9taXphdGlvbnMudGl0bGUgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIGxvZ1N0cignTWlzc2luZyBcInRpdGxlXCIgYXJndW1lbnQhJyk7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBwYXJhbXMudGl0bGUgPSBjdXN0b21pemF0aW9ucy50aXRsZTtcclxuXHJcbiAgICAgIGZvciAobGV0IGN1c3RvbU5hbWUgaW4gZGVmYXVsdFBhcmFtcykge1xyXG4gICAgICAgIHBhcmFtc1tjdXN0b21OYW1lXSA9IGFyZ3VtZW50T3JEZWZhdWx0KGN1c3RvbU5hbWUpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBTaG93IFwiQ29uZmlybVwiIGluc3RlYWQgb2YgXCJPS1wiIGlmIGNhbmNlbCBidXR0b24gaXMgdmlzaWJsZVxyXG4gICAgICBwYXJhbXMuY29uZmlybUJ1dHRvblRleHQgPSBwYXJhbXMuc2hvd0NhbmNlbEJ1dHRvbiA/ICdDb25maXJtJyA6IGRlZmF1bHRQYXJhbXMuY29uZmlybUJ1dHRvblRleHQ7XHJcbiAgICAgIHBhcmFtcy5jb25maXJtQnV0dG9uVGV4dCA9IGFyZ3VtZW50T3JEZWZhdWx0KCdjb25maXJtQnV0dG9uVGV4dCcpO1xyXG5cclxuICAgICAgLy8gQ2FsbGJhY2sgZnVuY3Rpb24gd2hlbiBjbGlja2luZyBvbiBcIk9LXCIvXCJDYW5jZWxcIlxyXG4gICAgICBwYXJhbXMuZG9uZUZ1bmN0aW9uID0gYXJndW1lbnRzWzFdIHx8IG51bGw7XHJcblxyXG4gICAgICBicmVhaztcclxuXHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICBsb2dTdHIoJ1VuZXhwZWN0ZWQgdHlwZSBvZiBhcmd1bWVudCEgRXhwZWN0ZWQgXCJzdHJpbmdcIiBvciBcIm9iamVjdFwiLCBnb3QgJyArIHR5cGVvZiBjdXN0b21pemF0aW9ucyk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgfVxyXG5cclxuICBzZXRQYXJhbWV0ZXJzKHBhcmFtcyk7XHJcbiAgZml4VmVydGljYWxQb3NpdGlvbigpO1xyXG4gIG9wZW5Nb2RhbChhcmd1bWVudHNbMV0pO1xyXG5cclxuICAvLyBNb2RhbCBpbnRlcmFjdGlvbnNcclxuICB2YXIgbW9kYWwgPSBnZXRNb2RhbCgpO1xyXG5cclxuXHJcbiAgLypcclxuICAgKiBNYWtlIHN1cmUgYWxsIG1vZGFsIGJ1dHRvbnMgcmVzcG9uZCB0byBhbGwgZXZlbnRzXHJcbiAgICovXHJcbiAgdmFyICRidXR0b25zID0gbW9kYWwucXVlcnlTZWxlY3RvckFsbCgnYnV0dG9uJyk7XHJcbiAgdmFyIGJ1dHRvbkV2ZW50cyA9IFsnb25jbGljaycsICdvbm1vdXNlb3ZlcicsICdvbm1vdXNlb3V0JywgJ29ubW91c2Vkb3duJywgJ29ubW91c2V1cCcsICdvbmZvY3VzJ107XHJcbiAgdmFyIG9uQnV0dG9uRXZlbnQgPSAoZSkgPT4gaGFuZGxlQnV0dG9uKGUsIHBhcmFtcywgbW9kYWwpO1xyXG5cclxuICBmb3IgKGxldCBidG5JbmRleCA9IDA7IGJ0bkluZGV4IDwgJGJ1dHRvbnMubGVuZ3RoOyBidG5JbmRleCsrKSB7XHJcbiAgICBmb3IgKGxldCBldnRJbmRleCA9IDA7IGV2dEluZGV4IDwgYnV0dG9uRXZlbnRzLmxlbmd0aDsgZXZ0SW5kZXgrKykge1xyXG4gICAgICBsZXQgYnRuRXZ0ID0gYnV0dG9uRXZlbnRzW2V2dEluZGV4XTtcclxuICAgICAgJGJ1dHRvbnNbYnRuSW5kZXhdW2J0bkV2dF0gPSBvbkJ1dHRvbkV2ZW50O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gQ2xpY2tpbmcgb3V0c2lkZSB0aGUgbW9kYWwgZGlzbWlzc2VzIGl0IChpZiBhbGxvd2VkIGJ5IHVzZXIpXHJcbiAgZ2V0T3ZlcmxheSgpLm9uY2xpY2sgPSBvbkJ1dHRvbkV2ZW50O1xyXG5cclxuICBwcmV2aW91c1dpbmRvd0tleURvd24gPSB3aW5kb3cub25rZXlkb3duO1xyXG5cclxuICB2YXIgb25LZXlFdmVudCA9IChlKSA9PiBoYW5kbGVLZXlEb3duKGUsIHBhcmFtcywgbW9kYWwpO1xyXG4gIHdpbmRvdy5vbmtleWRvd24gPSBvbktleUV2ZW50O1xyXG5cclxuICB3aW5kb3cub25mb2N1cyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIC8vIFdoZW4gdGhlIHVzZXIgaGFzIGZvY3VzZWQgYXdheSBhbmQgZm9jdXNlZCBiYWNrIGZyb20gdGhlIHdob2xlIHdpbmRvdy5cclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAvLyBQdXQgaW4gYSB0aW1lb3V0IHRvIGp1bXAgb3V0IG9mIHRoZSBldmVudCBzZXF1ZW5jZS5cclxuICAgICAgLy8gQ2FsbGluZyBmb2N1cygpIGluIHRoZSBldmVudCBzZXF1ZW5jZSBjb25mdXNlcyB0aGluZ3MuXHJcbiAgICAgIGlmIChsYXN0Rm9jdXNlZEJ1dHRvbiAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgbGFzdEZvY3VzZWRCdXR0b24uZm9jdXMoKTtcclxuICAgICAgICBsYXN0Rm9jdXNlZEJ1dHRvbiA9IHVuZGVmaW5lZDtcclxuICAgICAgfVxyXG4gICAgfSwgMCk7XHJcbiAgfTtcclxuICBcclxuICAvLyBTaG93IGFsZXJ0IHdpdGggZW5hYmxlZCBidXR0b25zIGFsd2F5c1xyXG4gIHN3YWwuZW5hYmxlQnV0dG9ucygpO1xyXG59O1xyXG5cclxuXHJcblxyXG4vKlxyXG4gKiBTZXQgZGVmYXVsdCBwYXJhbXMgZm9yIGVhY2ggcG9wdXBcclxuICogQHBhcmFtIHtPYmplY3R9IHVzZXJQYXJhbXNcclxuICovXHJcbnN3ZWV0QWxlcnQuc2V0RGVmYXVsdHMgPSBzd2FsLnNldERlZmF1bHRzID0gZnVuY3Rpb24odXNlclBhcmFtcykge1xyXG4gIGlmICghdXNlclBhcmFtcykge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCd1c2VyUGFyYW1zIGlzIHJlcXVpcmVkJyk7XHJcbiAgfVxyXG4gIGlmICh0eXBlb2YgdXNlclBhcmFtcyAhPT0gJ29iamVjdCcpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcigndXNlclBhcmFtcyBoYXMgdG8gYmUgYSBvYmplY3QnKTtcclxuICB9XHJcblxyXG4gIGV4dGVuZChkZWZhdWx0UGFyYW1zLCB1c2VyUGFyYW1zKTtcclxufTtcclxuXHJcblxyXG4vKlxyXG4gKiBBbmltYXRpb24gd2hlbiBjbG9zaW5nIG1vZGFsXHJcbiAqL1xyXG5zd2VldEFsZXJ0LmNsb3NlID0gc3dhbC5jbG9zZSA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciBtb2RhbCA9IGdldE1vZGFsKCk7XHJcblxyXG4gIGZhZGVPdXQoZ2V0T3ZlcmxheSgpLCA1KTtcclxuICBmYWRlT3V0KG1vZGFsLCA1KTtcclxuICByZW1vdmVDbGFzcyhtb2RhbCwgJ3Nob3dTd2VldEFsZXJ0Jyk7XHJcbiAgYWRkQ2xhc3MobW9kYWwsICdoaWRlU3dlZXRBbGVydCcpO1xyXG4gIHJlbW92ZUNsYXNzKG1vZGFsLCAndmlzaWJsZScpO1xyXG5cclxuICAvKlxyXG4gICAqIFJlc2V0IGljb24gYW5pbWF0aW9uc1xyXG4gICAqL1xyXG4gIHZhciAkc3VjY2Vzc0ljb24gPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCcuc2EtaWNvbi5zYS1zdWNjZXNzJyk7XHJcbiAgcmVtb3ZlQ2xhc3MoJHN1Y2Nlc3NJY29uLCAnYW5pbWF0ZScpO1xyXG4gIHJlbW92ZUNsYXNzKCRzdWNjZXNzSWNvbi5xdWVyeVNlbGVjdG9yKCcuc2EtdGlwJyksICdhbmltYXRlU3VjY2Vzc1RpcCcpO1xyXG4gIHJlbW92ZUNsYXNzKCRzdWNjZXNzSWNvbi5xdWVyeVNlbGVjdG9yKCcuc2EtbG9uZycpLCAnYW5pbWF0ZVN1Y2Nlc3NMb25nJyk7XHJcblxyXG4gIHZhciAkZXJyb3JJY29uID0gbW9kYWwucXVlcnlTZWxlY3RvcignLnNhLWljb24uc2EtZXJyb3InKTtcclxuICByZW1vdmVDbGFzcygkZXJyb3JJY29uLCAnYW5pbWF0ZUVycm9ySWNvbicpO1xyXG4gIHJlbW92ZUNsYXNzKCRlcnJvckljb24ucXVlcnlTZWxlY3RvcignLnNhLXgtbWFyaycpLCAnYW5pbWF0ZVhNYXJrJyk7XHJcblxyXG4gIHZhciAkd2FybmluZ0ljb24gPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCcuc2EtaWNvbi5zYS13YXJuaW5nJyk7XHJcbiAgcmVtb3ZlQ2xhc3MoJHdhcm5pbmdJY29uLCAncHVsc2VXYXJuaW5nJyk7XHJcbiAgcmVtb3ZlQ2xhc3MoJHdhcm5pbmdJY29uLnF1ZXJ5U2VsZWN0b3IoJy5zYS1ib2R5JyksICdwdWxzZVdhcm5pbmdJbnMnKTtcclxuICByZW1vdmVDbGFzcygkd2FybmluZ0ljb24ucXVlcnlTZWxlY3RvcignLnNhLWRvdCcpLCAncHVsc2VXYXJuaW5nSW5zJyk7XHJcblxyXG4gIC8vIFJlc2V0IGN1c3RvbSBjbGFzcyAoZGVsYXkgc28gdGhhdCBVSSBjaGFuZ2VzIGFyZW4ndCB2aXNpYmxlKVxyXG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgY3VzdG9tQ2xhc3MgPSBtb2RhbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtY3VzdG9tLWNsYXNzJyk7XHJcbiAgICByZW1vdmVDbGFzcyhtb2RhbCwgY3VzdG9tQ2xhc3MpO1xyXG4gIH0sIDMwMCk7XHJcblxyXG4gIC8vIE1ha2UgcGFnZSBzY3JvbGxhYmxlIGFnYWluXHJcbiAgcmVtb3ZlQ2xhc3MoZG9jdW1lbnQuYm9keSwgJ3N0b3Atc2Nyb2xsaW5nJyk7XHJcblxyXG4gIC8vIFJlc2V0IHRoZSBwYWdlIHRvIGl0cyBwcmV2aW91cyBzdGF0ZVxyXG4gIHdpbmRvdy5vbmtleWRvd24gPSBwcmV2aW91c1dpbmRvd0tleURvd247XHJcbiAgaWYgKHdpbmRvdy5wcmV2aW91c0FjdGl2ZUVsZW1lbnQpIHtcclxuICAgIHdpbmRvdy5wcmV2aW91c0FjdGl2ZUVsZW1lbnQuZm9jdXMoKTtcclxuICB9XHJcbiAgbGFzdEZvY3VzZWRCdXR0b24gPSB1bmRlZmluZWQ7XHJcbiAgY2xlYXJUaW1lb3V0KG1vZGFsLnRpbWVvdXQpO1xyXG5cclxuICByZXR1cm4gdHJ1ZTtcclxufTtcclxuXHJcblxyXG4vKlxyXG4gKiBWYWxpZGF0aW9uIG9mIHRoZSBpbnB1dCBmaWVsZCBpcyBkb25lIGJ5IHVzZXJcclxuICogSWYgc29tZXRoaW5nIGlzIHdyb25nID0+IGNhbGwgc2hvd0lucHV0RXJyb3Igd2l0aCBlcnJvck1lc3NhZ2VcclxuICovXHJcbnN3ZWV0QWxlcnQuc2hvd0lucHV0RXJyb3IgPSBzd2FsLnNob3dJbnB1dEVycm9yID0gZnVuY3Rpb24oZXJyb3JNZXNzYWdlKSB7XHJcbiAgdmFyIG1vZGFsID0gZ2V0TW9kYWwoKTtcclxuXHJcbiAgdmFyICRlcnJvckljb24gPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCcuc2EtaW5wdXQtZXJyb3InKTtcclxuICBhZGRDbGFzcygkZXJyb3JJY29uLCAnc2hvdycpO1xyXG5cclxuICB2YXIgJGVycm9yQ29udGFpbmVyID0gbW9kYWwucXVlcnlTZWxlY3RvcignLnNhLWVycm9yLWNvbnRhaW5lcicpO1xyXG4gIGFkZENsYXNzKCRlcnJvckNvbnRhaW5lciwgJ3Nob3cnKTtcclxuXHJcbiAgJGVycm9yQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ3AnKS5pbm5lckhUTUwgPSBlcnJvck1lc3NhZ2U7XHJcblxyXG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICBzd2VldEFsZXJ0LmVuYWJsZUJ1dHRvbnMoKTtcclxuICB9LCAxKTtcclxuXHJcbiAgbW9kYWwucXVlcnlTZWxlY3RvcignaW5wdXQnKS5mb2N1cygpO1xyXG59O1xyXG5cclxuXHJcbi8qXHJcbiAqIFJlc2V0IGlucHV0IGVycm9yIERPTSBlbGVtZW50c1xyXG4gKi9cclxuc3dlZXRBbGVydC5yZXNldElucHV0RXJyb3IgPSBzd2FsLnJlc2V0SW5wdXRFcnJvciA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgLy8gSWYgcHJlc3MgZW50ZXIgPT4gaWdub3JlXHJcbiAgaWYgKGV2ZW50ICYmIGV2ZW50LmtleUNvZGUgPT09IDEzKSB7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICB2YXIgJG1vZGFsID0gZ2V0TW9kYWwoKTtcclxuXHJcbiAgdmFyICRlcnJvckljb24gPSAkbW9kYWwucXVlcnlTZWxlY3RvcignLnNhLWlucHV0LWVycm9yJyk7XHJcbiAgcmVtb3ZlQ2xhc3MoJGVycm9ySWNvbiwgJ3Nob3cnKTtcclxuXHJcbiAgdmFyICRlcnJvckNvbnRhaW5lciA9ICRtb2RhbC5xdWVyeVNlbGVjdG9yKCcuc2EtZXJyb3ItY29udGFpbmVyJyk7XHJcbiAgcmVtb3ZlQ2xhc3MoJGVycm9yQ29udGFpbmVyLCAnc2hvdycpO1xyXG59O1xyXG5cclxuLypcclxuICogRGlzYWJsZSBjb25maXJtIGFuZCBjYW5jZWwgYnV0dG9uc1xyXG4gKi9cclxuc3dlZXRBbGVydC5kaXNhYmxlQnV0dG9ucyA9IHN3YWwuZGlzYWJsZUJ1dHRvbnMgPSBmdW5jdGlvbihldmVudCkge1xyXG4gIHZhciBtb2RhbCA9IGdldE1vZGFsKCk7XHJcbiAgdmFyICRjb25maXJtQnV0dG9uID0gbW9kYWwucXVlcnlTZWxlY3RvcignYnV0dG9uLmNvbmZpcm0nKTtcclxuICB2YXIgJGNhbmNlbEJ1dHRvbiA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbi5jYW5jZWwnKTtcclxuICAkY29uZmlybUJ1dHRvbi5kaXNhYmxlZCA9IHRydWU7XHJcbiAgJGNhbmNlbEJ1dHRvbi5kaXNhYmxlZCA9IHRydWU7XHJcbn07XHJcblxyXG4vKlxyXG4gKiBFbmFibGUgY29uZmlybSBhbmQgY2FuY2VsIGJ1dHRvbnNcclxuICovXHJcbnN3ZWV0QWxlcnQuZW5hYmxlQnV0dG9ucyA9IHN3YWwuZW5hYmxlQnV0dG9ucyA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgdmFyIG1vZGFsID0gZ2V0TW9kYWwoKTtcclxuICB2YXIgJGNvbmZpcm1CdXR0b24gPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCdidXR0b24uY29uZmlybScpO1xyXG4gIHZhciAkY2FuY2VsQnV0dG9uID0gbW9kYWwucXVlcnlTZWxlY3RvcignYnV0dG9uLmNhbmNlbCcpO1xyXG4gICRjb25maXJtQnV0dG9uLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgJGNhbmNlbEJ1dHRvbi5kaXNhYmxlZCA9IGZhbHNlO1xyXG59O1xyXG5cclxuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgLy8gVGhlICdoYW5kbGUtY2xpY2snIG1vZHVsZSByZXF1aXJlc1xyXG4gIC8vIHRoYXQgJ3N3ZWV0QWxlcnQnIHdhcyBzZXQgYXMgZ2xvYmFsLlxyXG4gIHdpbmRvdy5zd2VldEFsZXJ0ID0gd2luZG93LnN3YWwgPSBzd2VldEFsZXJ0O1xyXG59IGVsc2Uge1xyXG4gIGxvZ1N0cignU3dlZXRBbGVydCBpcyBhIGZyb250ZW5kIG1vZHVsZSEnKTtcclxufVxyXG4iLCJ2YXIgZGVmYXVsdFBhcmFtcyA9IHtcclxuICB0aXRsZTogJycsXHJcbiAgdGV4dDogJycsXHJcbiAgdHlwZTogbnVsbCxcclxuICBhbGxvd091dHNpZGVDbGljazogZmFsc2UsXHJcbiAgc2hvd0NvbmZpcm1CdXR0b246IHRydWUsXHJcbiAgc2hvd0NhbmNlbEJ1dHRvbjogZmFsc2UsXHJcbiAgY2xvc2VPbkNvbmZpcm06IHRydWUsXHJcbiAgY2xvc2VPbkNhbmNlbDogdHJ1ZSxcclxuICBjb25maXJtQnV0dG9uVGV4dDogJ09LJyxcclxuICBjb25maXJtQnV0dG9uQ29sb3I6ICcjOENENEY1JyxcclxuICBjYW5jZWxCdXR0b25UZXh0OiAnQ2FuY2VsJyxcclxuICBpbWFnZVVybDogbnVsbCxcclxuICBpbWFnZVNpemU6IG51bGwsXHJcbiAgdGltZXI6IG51bGwsXHJcbiAgY3VzdG9tQ2xhc3M6ICcnLFxyXG4gIGh0bWw6IGZhbHNlLFxyXG4gIGFuaW1hdGlvbjogdHJ1ZSxcclxuICBhbGxvd0VzY2FwZUtleTogdHJ1ZSxcclxuICBpbnB1dFR5cGU6ICd0ZXh0JyxcclxuICBpbnB1dFBsYWNlaG9sZGVyOiAnJyxcclxuICBpbnB1dFZhbHVlOiAnJyxcclxuICBzaG93TG9hZGVyT25Db25maXJtOiBmYWxzZSxcclxuICBhbGxvd0VudGVyQ29uZmlybTogdHJ1ZSxcclxuICBmbG9hdEJ1dHRvbnM6IGZhbHNlXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZhdWx0UGFyYW1zO1xyXG4iLCJpbXBvcnQgeyBjb2xvckx1bWluYW5jZSB9IGZyb20gJy4vdXRpbHMnO1xyXG5pbXBvcnQgeyBnZXRNb2RhbCB9IGZyb20gJy4vaGFuZGxlLXN3YWwtZG9tJztcclxuaW1wb3J0IHsgaGFzQ2xhc3MsIGlzRGVzY2VuZGFudCB9IGZyb20gJy4vaGFuZGxlLWRvbSc7XHJcblxyXG5cclxuLypcclxuICogVXNlciBjbGlja2VkIG9uIFwiQ29uZmlybVwiL1wiT0tcIiBvciBcIkNhbmNlbFwiXHJcbiAqL1xyXG52YXIgaGFuZGxlQnV0dG9uID0gZnVuY3Rpb24oZXZlbnQsIHBhcmFtcywgbW9kYWwpIHtcclxuICB2YXIgZSA9IGV2ZW50IHx8IHdpbmRvdy5ldmVudDtcclxuICB2YXIgdGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xyXG5cclxuICB2YXIgdGFyZ2V0ZWRDb25maXJtID0gdGFyZ2V0LmNsYXNzTmFtZS5pbmRleE9mKCdjb25maXJtJykgIT09IC0xO1xyXG4gIHZhciB0YXJnZXRlZE92ZXJsYXkgPSB0YXJnZXQuY2xhc3NOYW1lLmluZGV4T2YoJ3N3ZWV0LW92ZXJsYXknKSAhPT0gLTE7XHJcbiAgdmFyIG1vZGFsSXNWaXNpYmxlICA9IGhhc0NsYXNzKG1vZGFsLCAndmlzaWJsZScpO1xyXG4gIHZhciBkb25lRnVuY3Rpb25FeGlzdHMgPSAocGFyYW1zLmRvbmVGdW5jdGlvbiAmJiBtb2RhbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaGFzLWRvbmUtZnVuY3Rpb24nKSA9PT0gJ3RydWUnKTtcclxuXHJcbiAgLy8gU2luY2UgdGhlIHVzZXIgY2FuIGNoYW5nZSB0aGUgYmFja2dyb3VuZC1jb2xvciBvZiB0aGUgY29uZmlybSBidXR0b24gcHJvZ3JhbW1hdGljYWxseSxcclxuICAvLyB3ZSBtdXN0IGNhbGN1bGF0ZSB3aGF0IHRoZSBjb2xvciBzaG91bGQgYmUgb24gaG92ZXIvYWN0aXZlXHJcbiAgdmFyIG5vcm1hbENvbG9yLCBob3ZlckNvbG9yLCBhY3RpdmVDb2xvcjtcclxuICBpZiAodGFyZ2V0ZWRDb25maXJtICYmIHBhcmFtcy5jb25maXJtQnV0dG9uQ29sb3IpIHtcclxuICAgIG5vcm1hbENvbG9yICA9IHBhcmFtcy5jb25maXJtQnV0dG9uQ29sb3I7XHJcbiAgICBob3ZlckNvbG9yICAgPSBjb2xvckx1bWluYW5jZShub3JtYWxDb2xvciwgLTAuMDQpO1xyXG4gICAgYWN0aXZlQ29sb3IgID0gY29sb3JMdW1pbmFuY2Uobm9ybWFsQ29sb3IsIC0wLjE0KTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHNob3VsZFNldENvbmZpcm1CdXR0b25Db2xvcihjb2xvcikge1xyXG4gICAgaWYgKHRhcmdldGVkQ29uZmlybSAmJiBwYXJhbXMuY29uZmlybUJ1dHRvbkNvbG9yKSB7XHJcbiAgICAgIHRhcmdldC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBjb2xvcjtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHN3aXRjaCAoZS50eXBlKSB7XHJcbiAgICBjYXNlICdtb3VzZW92ZXInOlxyXG4gICAgICBzaG91bGRTZXRDb25maXJtQnV0dG9uQ29sb3IoaG92ZXJDb2xvcik7XHJcbiAgICAgIGJyZWFrO1xyXG5cclxuICAgIGNhc2UgJ21vdXNlb3V0JzpcclxuICAgICAgc2hvdWxkU2V0Q29uZmlybUJ1dHRvbkNvbG9yKG5vcm1hbENvbG9yKTtcclxuICAgICAgYnJlYWs7XHJcblxyXG4gICAgY2FzZSAnbW91c2Vkb3duJzpcclxuICAgICAgc2hvdWxkU2V0Q29uZmlybUJ1dHRvbkNvbG9yKGFjdGl2ZUNvbG9yKTtcclxuICAgICAgYnJlYWs7XHJcblxyXG4gICAgY2FzZSAnbW91c2V1cCc6XHJcbiAgICAgIHNob3VsZFNldENvbmZpcm1CdXR0b25Db2xvcihob3ZlckNvbG9yKTtcclxuICAgICAgYnJlYWs7XHJcblxyXG4gICAgY2FzZSAnZm9jdXMnOlxyXG4gICAgICBsZXQgJGNvbmZpcm1CdXR0b24gPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCdidXR0b24uY29uZmlybScpO1xyXG4gICAgICBsZXQgJGNhbmNlbEJ1dHRvbiAgPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCdidXR0b24uY2FuY2VsJyk7XHJcblxyXG4gICAgICBpZiAodGFyZ2V0ZWRDb25maXJtKSB7XHJcbiAgICAgICAgJGNhbmNlbEJ1dHRvbi5zdHlsZS5ib3hTaGFkb3cgPSAnbm9uZSc7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgJGNvbmZpcm1CdXR0b24uc3R5bGUuYm94U2hhZG93ID0gJ25vbmUnO1xyXG4gICAgICB9XHJcbiAgICAgIGJyZWFrO1xyXG5cclxuICAgIGNhc2UgJ2NsaWNrJzpcclxuICAgICAgbGV0IGNsaWNrZWRPbk1vZGFsID0gKG1vZGFsID09PSB0YXJnZXQpO1xyXG4gICAgICBsZXQgY2xpY2tlZE9uTW9kYWxDaGlsZCA9IGlzRGVzY2VuZGFudChtb2RhbCwgdGFyZ2V0KTtcclxuXHJcbiAgICAgIC8vIElnbm9yZSBjbGljayBvdXRzaWRlIGlmIGFsbG93T3V0c2lkZUNsaWNrIGlzIGZhbHNlXHJcbiAgICAgIGlmICghY2xpY2tlZE9uTW9kYWwgJiYgIWNsaWNrZWRPbk1vZGFsQ2hpbGQgJiYgbW9kYWxJc1Zpc2libGUgJiYgIXBhcmFtcy5hbGxvd091dHNpZGVDbGljaykge1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAodGFyZ2V0ZWRDb25maXJtICYmIGRvbmVGdW5jdGlvbkV4aXN0cyAmJiBtb2RhbElzVmlzaWJsZSkge1xyXG4gICAgICAgIGhhbmRsZUNvbmZpcm0obW9kYWwsIHBhcmFtcyk7XHJcbiAgICAgIH0gZWxzZSBpZiAoZG9uZUZ1bmN0aW9uRXhpc3RzICYmIG1vZGFsSXNWaXNpYmxlIHx8IHRhcmdldGVkT3ZlcmxheSkge1xyXG4gICAgICAgIGhhbmRsZUNhbmNlbChtb2RhbCwgcGFyYW1zKTtcclxuICAgICAgfSBlbHNlIGlmIChpc0Rlc2NlbmRhbnQobW9kYWwsIHRhcmdldCkgJiYgdGFyZ2V0LnRhZ05hbWUgPT09ICdCVVRUT04nKSB7XHJcbiAgICAgICAgc3dlZXRBbGVydC5jbG9zZSgpO1xyXG4gICAgICB9XHJcbiAgICAgIGJyZWFrO1xyXG4gIH1cclxufTtcclxuXHJcbi8qXHJcbiAqICBVc2VyIGNsaWNrZWQgb24gXCJDb25maXJtXCIvXCJPS1wiXHJcbiAqL1xyXG52YXIgaGFuZGxlQ29uZmlybSA9IGZ1bmN0aW9uKG1vZGFsLCBwYXJhbXMpIHtcclxuICB2YXIgY2FsbGJhY2tWYWx1ZSA9IHRydWU7XHJcblxyXG4gIGlmIChoYXNDbGFzcyhtb2RhbCwgJ3Nob3ctaW5wdXQnKSkge1xyXG4gICAgY2FsbGJhY2tWYWx1ZSA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0JykudmFsdWU7XHJcblxyXG4gICAgaWYgKCFjYWxsYmFja1ZhbHVlKSB7XHJcbiAgICAgIGNhbGxiYWNrVmFsdWUgPSAnJztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHBhcmFtcy5kb25lRnVuY3Rpb24oY2FsbGJhY2tWYWx1ZSk7XHJcblxyXG4gIGlmIChwYXJhbXMuY2xvc2VPbkNvbmZpcm0pIHtcclxuICAgIHN3ZWV0QWxlcnQuY2xvc2UoKTtcclxuICB9XHJcbiAgLy8gRGlzYWJsZSBjYW5jZWwgYW5kIGNvbmZpcm0gYnV0dG9uIGlmIHRoZSBwYXJhbWV0ZXIgaXMgdHJ1ZVxyXG4gIGlmIChwYXJhbXMuc2hvd0xvYWRlck9uQ29uZmlybSkge1xyXG4gICAgc3dlZXRBbGVydC5kaXNhYmxlQnV0dG9ucygpO1xyXG4gIH1cclxufTtcclxuXHJcbi8qXHJcbiAqICBVc2VyIGNsaWNrZWQgb24gXCJDYW5jZWxcIlxyXG4gKi9cclxudmFyIGhhbmRsZUNhbmNlbCA9IGZ1bmN0aW9uKG1vZGFsLCBwYXJhbXMpIHtcclxuICAvLyBDaGVjayBpZiBjYWxsYmFjayBmdW5jdGlvbiBleHBlY3RzIGEgcGFyYW1ldGVyICh0byB0cmFjayBjYW5jZWwgYWN0aW9ucylcclxuICB2YXIgZnVuY3Rpb25Bc1N0ciA9IFN0cmluZyhwYXJhbXMuZG9uZUZ1bmN0aW9uKS5yZXBsYWNlKC9cXHMvZywgJycpO1xyXG4gIHZhciBmdW5jdGlvbkhhbmRsZXNDYW5jZWwgPSBmdW5jdGlvbkFzU3RyLnN1YnN0cmluZygwLCA5KSA9PT0gJ2Z1bmN0aW9uKCcgJiYgZnVuY3Rpb25Bc1N0ci5zdWJzdHJpbmcoOSwgMTApICE9PSAnKSc7XHJcblxyXG4gIGlmIChmdW5jdGlvbkhhbmRsZXNDYW5jZWwpIHtcclxuICAgIHBhcmFtcy5kb25lRnVuY3Rpb24oZmFsc2UpO1xyXG4gIH1cclxuXHJcbiAgaWYgKHBhcmFtcy5jbG9zZU9uQ2FuY2VsKSB7XHJcbiAgICBzd2VldEFsZXJ0LmNsb3NlKCk7XHJcbiAgfVxyXG59O1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICBoYW5kbGVCdXR0b24sXHJcbiAgaGFuZGxlQ29uZmlybSxcclxuICBoYW5kbGVDYW5jZWxcclxufTtcclxuIiwidmFyIGhhc0NsYXNzID0gZnVuY3Rpb24oZWxlbSwgY2xhc3NOYW1lKSB7XHJcbiAgcmV0dXJuIG5ldyBSZWdFeHAoJyAnICsgY2xhc3NOYW1lICsgJyAnKS50ZXN0KCcgJyArIGVsZW0uY2xhc3NOYW1lICsgJyAnKTtcclxufTtcclxuXHJcbnZhciBhZGRDbGFzcyA9IGZ1bmN0aW9uKGVsZW0sIGNsYXNzTmFtZSkge1xyXG4gIGlmICghaGFzQ2xhc3MoZWxlbSwgY2xhc3NOYW1lKSkge1xyXG4gICAgZWxlbS5jbGFzc05hbWUgKz0gJyAnICsgY2xhc3NOYW1lO1xyXG4gIH1cclxufTtcclxuXHJcbnZhciByZW1vdmVDbGFzcyA9IGZ1bmN0aW9uKGVsZW0sIGNsYXNzTmFtZSkge1xyXG4gIHZhciBuZXdDbGFzcyA9ICcgJyArIGVsZW0uY2xhc3NOYW1lLnJlcGxhY2UoL1tcXHRcXHJcXG5dL2csICcgJykgKyAnICc7XHJcbiAgaWYgKGhhc0NsYXNzKGVsZW0sIGNsYXNzTmFtZSkpIHtcclxuICAgIHdoaWxlIChuZXdDbGFzcy5pbmRleE9mKCcgJyArIGNsYXNzTmFtZSArICcgJykgPj0gMCkge1xyXG4gICAgICBuZXdDbGFzcyA9IG5ld0NsYXNzLnJlcGxhY2UoJyAnICsgY2xhc3NOYW1lICsgJyAnLCAnICcpO1xyXG4gICAgfVxyXG4gICAgZWxlbS5jbGFzc05hbWUgPSBuZXdDbGFzcy5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XHJcbiAgfVxyXG59O1xyXG5cclxudmFyIGVzY2FwZUh0bWwgPSBmdW5jdGlvbihzdHIpIHtcclxuICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgZGl2LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHN0cikpO1xyXG4gIHJldHVybiBkaXYuaW5uZXJIVE1MO1xyXG59O1xyXG5cclxudmFyIF9zaG93ID0gZnVuY3Rpb24oZWxlbSkge1xyXG4gIGVsZW0uc3R5bGUub3BhY2l0eSA9ICcnO1xyXG4gIGVsZW0uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbn07XHJcblxyXG52YXIgc2hvdyA9IGZ1bmN0aW9uKGVsZW1zKSB7XHJcbiAgaWYgKGVsZW1zICYmICFlbGVtcy5sZW5ndGgpIHtcclxuICAgIHJldHVybiBfc2hvdyhlbGVtcyk7XHJcbiAgfVxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbXMubGVuZ3RoOyArK2kpIHtcclxuICAgIF9zaG93KGVsZW1zW2ldKTtcclxuICB9XHJcbn07XHJcblxyXG52YXIgX2hpZGUgPSBmdW5jdGlvbihlbGVtKSB7XHJcbiAgZWxlbS5zdHlsZS5vcGFjaXR5ID0gJyc7XHJcbiAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG59O1xyXG5cclxudmFyIGhpZGUgPSBmdW5jdGlvbihlbGVtcykge1xyXG4gIGlmIChlbGVtcyAmJiAhZWxlbXMubGVuZ3RoKSB7XHJcbiAgICByZXR1cm4gX2hpZGUoZWxlbXMpO1xyXG4gIH1cclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1zLmxlbmd0aDsgKytpKSB7XHJcbiAgICBfaGlkZShlbGVtc1tpXSk7XHJcbiAgfVxyXG59O1xyXG5cclxudmFyIGlzRGVzY2VuZGFudCA9IGZ1bmN0aW9uKHBhcmVudCwgY2hpbGQpIHtcclxuICB2YXIgbm9kZSA9IGNoaWxkLnBhcmVudE5vZGU7XHJcbiAgd2hpbGUgKG5vZGUgIT09IG51bGwpIHtcclxuICAgIGlmIChub2RlID09PSBwYXJlbnQpIHtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBub2RlID0gbm9kZS5wYXJlbnROb2RlO1xyXG4gIH1cclxuICByZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG52YXIgZ2V0VG9wTWFyZ2luID0gZnVuY3Rpb24oZWxlbSkge1xyXG4gIGVsZW0uc3R5bGUubGVmdCA9ICctOTk5OXB4JztcclxuICBlbGVtLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG5cclxuICB2YXIgaGVpZ2h0ID0gZWxlbS5jbGllbnRIZWlnaHQsXHJcbiAgICAgIHBhZGRpbmc7XHJcbiAgaWYgKHR5cGVvZiBnZXRDb21wdXRlZFN0eWxlICE9PSBcInVuZGVmaW5lZFwiKSB7IC8vIElFIDhcclxuICAgIHBhZGRpbmcgPSBwYXJzZUludChnZXRDb21wdXRlZFN0eWxlKGVsZW0pLmdldFByb3BlcnR5VmFsdWUoJ3BhZGRpbmctdG9wJyksIDEwKTtcclxuICB9IGVsc2Uge1xyXG4gICAgcGFkZGluZyA9IHBhcnNlSW50KGVsZW0uY3VycmVudFN0eWxlLnBhZGRpbmcpO1xyXG4gIH1cclxuXHJcbiAgZWxlbS5zdHlsZS5sZWZ0ID0gJyc7XHJcbiAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gIHJldHVybiAoJy0nICsgcGFyc2VJbnQoKGhlaWdodCArIHBhZGRpbmcpIC8gMikgKyAncHgnKTtcclxufTtcclxuXHJcbnZhciBmYWRlSW4gPSBmdW5jdGlvbihlbGVtLCBpbnRlcnZhbCkge1xyXG4gIGlmICgrZWxlbS5zdHlsZS5vcGFjaXR5IDwgMSkge1xyXG4gICAgaW50ZXJ2YWwgPSBpbnRlcnZhbCB8fCAxNjtcclxuICAgIGVsZW0uc3R5bGUub3BhY2l0eSA9IDA7XHJcbiAgICBlbGVtLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgdmFyIGxhc3QgPSArbmV3IERhdGUoKTtcclxuICAgIHZhciB0aWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIGVsZW0uc3R5bGUub3BhY2l0eSA9ICtlbGVtLnN0eWxlLm9wYWNpdHkgKyAobmV3IERhdGUoKSAtIGxhc3QpIC8gMTAwO1xyXG4gICAgICBsYXN0ID0gK25ldyBEYXRlKCk7XHJcblxyXG4gICAgICBpZiAoK2VsZW0uc3R5bGUub3BhY2l0eSA8IDEpIHtcclxuICAgICAgICBzZXRUaW1lb3V0KHRpY2ssIGludGVydmFsKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIHRpY2soKTtcclxuICB9XHJcbiAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJzsgLy9mYWxsYmFjayBJRThcclxufTtcclxuXHJcbnZhciBmYWRlT3V0ID0gZnVuY3Rpb24oZWxlbSwgaW50ZXJ2YWwpIHtcclxuICBpbnRlcnZhbCA9IGludGVydmFsIHx8IDE2O1xyXG4gIGVsZW0uc3R5bGUub3BhY2l0eSA9IDE7XHJcbiAgdmFyIGxhc3QgPSArbmV3IERhdGUoKTtcclxuICB2YXIgdGljayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgZWxlbS5zdHlsZS5vcGFjaXR5ID0gK2VsZW0uc3R5bGUub3BhY2l0eSAtIChuZXcgRGF0ZSgpIC0gbGFzdCkgLyAxMDA7XHJcbiAgICBsYXN0ID0gK25ldyBEYXRlKCk7XHJcblxyXG4gICAgaWYgKCtlbGVtLnN0eWxlLm9wYWNpdHkgPiAwKSB7XHJcbiAgICAgIHNldFRpbWVvdXQodGljaywgaW50ZXJ2YWwpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgdGljaygpO1xyXG59O1xyXG5cclxudmFyIGZpcmVDbGljayA9IGZ1bmN0aW9uKG5vZGUpIHtcclxuICAvLyBUYWtlbiBmcm9tIGh0dHA6Ly93d3cubm9ub2J0cnVzaXZlLmNvbS8yMDExLzExLzI5L3Byb2dyYW1hdGljYWxseS1maXJlLWNyb3NzYnJvd3Nlci1jbGljay1ldmVudC13aXRoLWphdmFzY3JpcHQvXHJcbiAgLy8gVGhlbiBmaXhlZCBmb3IgdG9kYXkncyBDaHJvbWUgYnJvd3Nlci5cclxuICBpZiAodHlwZW9mIE1vdXNlRXZlbnQgPT09ICdmdW5jdGlvbicpIHtcclxuICAgIC8vIFVwLXRvLWRhdGUgYXBwcm9hY2hcclxuICAgIHZhciBtZXZ0ID0gbmV3IE1vdXNlRXZlbnQoJ2NsaWNrJywge1xyXG4gICAgICB2aWV3OiB3aW5kb3csXHJcbiAgICAgIGJ1YmJsZXM6IGZhbHNlLFxyXG4gICAgICBjYW5jZWxhYmxlOiB0cnVlXHJcbiAgICB9KTtcclxuICAgIG5vZGUuZGlzcGF0Y2hFdmVudChtZXZ0KTtcclxuICB9IGVsc2UgaWYgKCBkb2N1bWVudC5jcmVhdGVFdmVudCApIHtcclxuICAgIC8vIEZhbGxiYWNrXHJcbiAgICB2YXIgZXZ0ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ01vdXNlRXZlbnRzJyk7XHJcbiAgICBldnQuaW5pdEV2ZW50KCdjbGljaycsIGZhbHNlLCBmYWxzZSk7XHJcbiAgICBub2RlLmRpc3BhdGNoRXZlbnQoZXZ0KTtcclxuICB9IGVsc2UgaWYgKGRvY3VtZW50LmNyZWF0ZUV2ZW50T2JqZWN0KSB7XHJcbiAgICBub2RlLmZpcmVFdmVudCgnb25jbGljaycpIDtcclxuICB9IGVsc2UgaWYgKHR5cGVvZiBub2RlLm9uY2xpY2sgPT09ICdmdW5jdGlvbicgKSB7XHJcbiAgICBub2RlLm9uY2xpY2soKTtcclxuICB9XHJcbn07XHJcblxyXG52YXIgc3RvcEV2ZW50UHJvcGFnYXRpb24gPSBmdW5jdGlvbihlKSB7XHJcbiAgLy8gSW4gcGFydGljdWxhciwgbWFrZSBzdXJlIHRoZSBzcGFjZSBiYXIgZG9lc24ndCBzY3JvbGwgdGhlIG1haW4gd2luZG93LlxyXG4gIGlmICh0eXBlb2YgZS5zdG9wUHJvcGFnYXRpb24gPT09ICdmdW5jdGlvbicpIHtcclxuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgfSBlbHNlIGlmICh3aW5kb3cuZXZlbnQgJiYgd2luZG93LmV2ZW50Lmhhc093blByb3BlcnR5KCdjYW5jZWxCdWJibGUnKSkge1xyXG4gICAgd2luZG93LmV2ZW50LmNhbmNlbEJ1YmJsZSA9IHRydWU7XHJcbiAgfVxyXG59O1xyXG5cclxuZXhwb3J0IHsgXHJcbiAgaGFzQ2xhc3MsIGFkZENsYXNzLCByZW1vdmVDbGFzcywgXHJcbiAgZXNjYXBlSHRtbCwgXHJcbiAgX3Nob3csIHNob3csIF9oaWRlLCBoaWRlLCBcclxuICBpc0Rlc2NlbmRhbnQsIFxyXG4gIGdldFRvcE1hcmdpbixcclxuICBmYWRlSW4sIGZhZGVPdXQsXHJcbiAgZmlyZUNsaWNrLFxyXG4gIHN0b3BFdmVudFByb3BhZ2F0aW9uXHJcbn07XHJcbiIsImltcG9ydCB7IHN0b3BFdmVudFByb3BhZ2F0aW9uLCBmaXJlQ2xpY2sgfSBmcm9tICcuL2hhbmRsZS1kb20nO1xyXG5pbXBvcnQgeyBzZXRGb2N1c1N0eWxlIH0gZnJvbSAnLi9oYW5kbGUtc3dhbC1kb20nO1xyXG5cclxuXHJcbnZhciBoYW5kbGVLZXlEb3duID0gZnVuY3Rpb24oZXZlbnQsIHBhcmFtcywgbW9kYWwpIHtcclxuICB2YXIgZSA9IGV2ZW50IHx8IHdpbmRvdy5ldmVudDtcclxuICB2YXIga2V5Q29kZSA9IGUua2V5Q29kZSB8fCBlLndoaWNoO1xyXG5cclxuICB2YXIgJG9rQnV0dG9uICAgICA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbi5jb25maXJtJyk7XHJcbiAgdmFyICRjYW5jZWxCdXR0b24gPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCdidXR0b24uY2FuY2VsJyk7XHJcbiAgdmFyICRtb2RhbEJ1dHRvbnMgPSBtb2RhbC5xdWVyeVNlbGVjdG9yQWxsKCdidXR0b25bdGFiaW5kZXhdJyk7XHJcblxyXG5cclxuICBpZiAoWzksIDEzLCAzMiwgMjddLmluZGV4T2Yoa2V5Q29kZSkgPT09IC0xKSB7XHJcbiAgICAvLyBEb24ndCBkbyB3b3JrIG9uIGtleXMgd2UgZG9uJ3QgY2FyZSBhYm91dC5cclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIHZhciAkdGFyZ2V0RWxlbWVudCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcclxuXHJcbiAgdmFyIGJ0bkluZGV4ID0gLTE7IC8vIEZpbmQgdGhlIGJ1dHRvbiAtIG5vdGUsIHRoaXMgaXMgYSBub2RlbGlzdCwgbm90IGFuIGFycmF5LlxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgJG1vZGFsQnV0dG9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgaWYgKCR0YXJnZXRFbGVtZW50ID09PSAkbW9kYWxCdXR0b25zW2ldKSB7XHJcbiAgICAgIGJ0bkluZGV4ID0gaTtcclxuICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpZiAoa2V5Q29kZSA9PT0gOSkge1xyXG4gICAgLy8gVEFCXHJcbiAgICBpZiAoYnRuSW5kZXggPT09IC0xKSB7XHJcbiAgICAgIC8vIE5vIGJ1dHRvbiBmb2N1c2VkLiBKdW1wIHRvIHRoZSBjb25maXJtIGJ1dHRvbi5cclxuICAgICAgJHRhcmdldEVsZW1lbnQgPSAkb2tCdXR0b247XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBDeWNsZSB0byB0aGUgbmV4dCBidXR0b25cclxuICAgICAgaWYgKGJ0bkluZGV4ID09PSAkbW9kYWxCdXR0b25zLmxlbmd0aCAtIDEpIHtcclxuICAgICAgICAkdGFyZ2V0RWxlbWVudCA9ICRtb2RhbEJ1dHRvbnNbMF07XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgJHRhcmdldEVsZW1lbnQgPSAkbW9kYWxCdXR0b25zW2J0bkluZGV4ICsgMV07XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdG9wRXZlbnRQcm9wYWdhdGlvbihlKTtcclxuICAgICR0YXJnZXRFbGVtZW50LmZvY3VzKCk7XHJcblxyXG4gICAgaWYgKHBhcmFtcy5jb25maXJtQnV0dG9uQ29sb3IpIHtcclxuICAgICAgc2V0Rm9jdXNTdHlsZSgkdGFyZ2V0RWxlbWVudCwgcGFyYW1zLmNvbmZpcm1CdXR0b25Db2xvcik7XHJcbiAgICB9XHJcbiAgfSBlbHNlIHtcclxuICAgIGlmIChrZXlDb2RlID09PSAxMykge1xyXG4gICAgICBpZiAoJHRhcmdldEVsZW1lbnQudGFnTmFtZSA9PT0gJ0lOUFVUJykge1xyXG4gICAgICAgICR0YXJnZXRFbGVtZW50ID0gJG9rQnV0dG9uO1xyXG4gICAgICAgICRva0J1dHRvbi5mb2N1cygpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoYnRuSW5kZXggPT09IC0xKSB7XHJcbiAgICAgICAgLy8gRU5URVIvU1BBQ0UgY2xpY2tlZCBvdXRzaWRlIG9mIGEgYnV0dG9uLlxyXG5cdCAgICBpZiAocGFyYW1zLmFsbG93RW50ZXJDb25maXJtKSB7XHJcblx0XHQgICR0YXJnZXRFbGVtZW50ID0gJG9rQnV0dG9uO1xyXG5cdFx0ICBmaXJlQ2xpY2soJHRhcmdldEVsZW1lbnQsIGUpO1xyXG5cdFx0fSBlbHNlIHtcclxuICAgICAgICAgICR0YXJnZXRFbGVtZW50ID0gJG9rQnV0dG9uO1xyXG5cdFx0fVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIERvIG5vdGhpbmcgLSBsZXQgdGhlIGJyb3dzZXIgaGFuZGxlIGl0LlxyXG4gICAgICAgICR0YXJnZXRFbGVtZW50ID0gdW5kZWZpbmVkO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKGtleUNvZGUgPT09IDI3ICYmIHBhcmFtcy5hbGxvd0VzY2FwZUtleSA9PT0gdHJ1ZSkge1xyXG4gICAgICAkdGFyZ2V0RWxlbWVudCA9ICRjYW5jZWxCdXR0b247XHJcbiAgICAgIGZpcmVDbGljaygkdGFyZ2V0RWxlbWVudCwgZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBGYWxsYmFjayAtIGxldCB0aGUgYnJvd3NlciBoYW5kbGUgaXQuXHJcbiAgICAgICR0YXJnZXRFbGVtZW50ID0gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG4gIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGhhbmRsZUtleURvd247XHJcbiIsImltcG9ydCB7IGhleFRvUmdiIH0gZnJvbSAnLi91dGlscyc7XHJcbmltcG9ydCB7IHJlbW92ZUNsYXNzLCBnZXRUb3BNYXJnaW4sIGZhZGVJbiwgc2hvdywgYWRkQ2xhc3MgfSBmcm9tICcuL2hhbmRsZS1kb20nO1xyXG5pbXBvcnQgZGVmYXVsdFBhcmFtcyBmcm9tICcuL2RlZmF1bHQtcGFyYW1zJztcclxuXHJcbnZhciBtb2RhbENsYXNzICAgPSAnLnN3ZWV0LWFsZXJ0JztcclxudmFyIG92ZXJsYXlDbGFzcyA9ICcuc3dlZXQtb3ZlcmxheSc7XHJcblxyXG4vKlxyXG4gKiBBZGQgbW9kYWwgKyBvdmVybGF5IHRvIERPTVxyXG4gKi9cclxuaW1wb3J0IGluamVjdGVkSFRNTCBmcm9tICcuL2luamVjdGVkLWh0bWwnO1xyXG5cclxudmFyIHN3ZWV0QWxlcnRJbml0aWFsaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgdmFyIHN3ZWV0V3JhcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gIHN3ZWV0V3JhcC5pbm5lckhUTUwgPSBpbmplY3RlZEhUTUw7XHJcblxyXG4gIC8vIEFwcGVuZCBlbGVtZW50cyB0byBib2R5XHJcbiAgd2hpbGUgKHN3ZWV0V3JhcC5maXJzdENoaWxkKSB7XHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHN3ZWV0V3JhcC5maXJzdENoaWxkKTtcclxuICB9XHJcbn07XHJcblxyXG4vKlxyXG4gKiBHZXQgRE9NIGVsZW1lbnQgb2YgbW9kYWxcclxuICovXHJcbnZhciBnZXRNb2RhbCA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciAkbW9kYWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKG1vZGFsQ2xhc3MpO1xyXG5cclxuICBpZiAoISRtb2RhbCkge1xyXG4gICAgc3dlZXRBbGVydEluaXRpYWxpemUoKTtcclxuICAgICRtb2RhbCA9IGdldE1vZGFsKCk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gJG1vZGFsO1xyXG59O1xyXG5cclxuLypcclxuICogR2V0IERPTSBlbGVtZW50IG9mIGlucHV0IChpbiBtb2RhbClcclxuICovXHJcbnZhciBnZXRJbnB1dCA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciAkbW9kYWwgPSBnZXRNb2RhbCgpO1xyXG4gIGlmICgkbW9kYWwpIHtcclxuICAgIHJldHVybiAkbW9kYWwucXVlcnlTZWxlY3RvcignaW5wdXQnKTtcclxuICB9XHJcbn07XHJcblxyXG4vKlxyXG4gKiBHZXQgRE9NIGVsZW1lbnQgb2Ygb3ZlcmxheVxyXG4gKi9cclxudmFyIGdldE92ZXJsYXkgPSBmdW5jdGlvbigpIHtcclxuICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihvdmVybGF5Q2xhc3MpO1xyXG59O1xyXG5cclxuLypcclxuICogQWRkIGJveC1zaGFkb3cgc3R5bGUgdG8gYnV0dG9uIChkZXBlbmRpbmcgb24gaXRzIGNob3NlbiBiZy1jb2xvcilcclxuICovXHJcbnZhciBzZXRGb2N1c1N0eWxlID0gZnVuY3Rpb24oJGJ1dHRvbiwgYmdDb2xvcikge1xyXG4gIHZhciByZ2JDb2xvciA9IGhleFRvUmdiKGJnQ29sb3IpO1xyXG4gICRidXR0b24uc3R5bGUuYm94U2hhZG93ID0gJzAgMCAycHggcmdiYSgnICsgcmdiQ29sb3IgKyAnLCAwLjgpLCBpbnNldCAwIDAgMCAxcHggcmdiYSgwLCAwLCAwLCAwLjA1KSc7XHJcbn07XHJcblxyXG4vKlxyXG4gKiBBbmltYXRpb24gd2hlbiBvcGVuaW5nIG1vZGFsXHJcbiAqL1xyXG52YXIgb3Blbk1vZGFsID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcclxuICB2YXIgJG1vZGFsID0gZ2V0TW9kYWwoKTtcclxuICBmYWRlSW4oZ2V0T3ZlcmxheSgpLCAxMCk7XHJcbiAgc2hvdygkbW9kYWwpO1xyXG4gIGFkZENsYXNzKCRtb2RhbCwgJ3Nob3dTd2VldEFsZXJ0Jyk7XHJcbiAgcmVtb3ZlQ2xhc3MoJG1vZGFsLCAnaGlkZVN3ZWV0QWxlcnQnKTtcclxuXHJcbiAgd2luZG93LnByZXZpb3VzQWN0aXZlRWxlbWVudCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XHJcbiAgdmFyICRva0J1dHRvbiA9ICRtb2RhbC5xdWVyeVNlbGVjdG9yKCdidXR0b24uY29uZmlybScpO1xyXG4gICRva0J1dHRvbi5mb2N1cygpO1xyXG5cclxuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgIGFkZENsYXNzKCRtb2RhbCwgJ3Zpc2libGUnKTtcclxuICB9LCA1MDApO1xyXG5cclxuICB2YXIgdGltZXIgPSAkbW9kYWwuZ2V0QXR0cmlidXRlKCdkYXRhLXRpbWVyJyk7XHJcblxyXG4gIGlmICh0aW1lciAhPT0gJ251bGwnICYmIHRpbWVyICE9PSAnJykge1xyXG4gICAgdmFyIHRpbWVyQ2FsbGJhY2sgPSBjYWxsYmFjaztcclxuICAgICRtb2RhbC50aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgdmFyIGRvbmVGdW5jdGlvbkV4aXN0cyA9ICgodGltZXJDYWxsYmFjayB8fCBudWxsKSAmJiAkbW9kYWwuZ2V0QXR0cmlidXRlKCdkYXRhLWhhcy1kb25lLWZ1bmN0aW9uJykgPT09ICd0cnVlJyk7XHJcbiAgICAgIGlmIChkb25lRnVuY3Rpb25FeGlzdHMpIHsgXHJcbiAgICAgICAgdGltZXJDYWxsYmFjayhudWxsKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBzd2VldEFsZXJ0LmNsb3NlKCk7XHJcbiAgICAgIH1cclxuICAgIH0sIHRpbWVyKTtcclxuICB9XHJcbn07XHJcblxyXG4vKlxyXG4gKiBSZXNldCB0aGUgc3R5bGluZyBvZiB0aGUgaW5wdXRcclxuICogKGZvciBleGFtcGxlIGlmIGVycm9ycyBoYXZlIGJlZW4gc2hvd24pXHJcbiAqL1xyXG52YXIgcmVzZXRJbnB1dCA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciAkbW9kYWwgPSBnZXRNb2RhbCgpO1xyXG4gIHZhciAkaW5wdXQgPSBnZXRJbnB1dCgpO1xyXG5cclxuICByZW1vdmVDbGFzcygkbW9kYWwsICdzaG93LWlucHV0Jyk7XHJcbiAgJGlucHV0LnZhbHVlID0gZGVmYXVsdFBhcmFtcy5pbnB1dFZhbHVlO1xyXG4gICRpbnB1dC5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCBkZWZhdWx0UGFyYW1zLmlucHV0VHlwZSk7XHJcbiAgJGlucHV0LnNldEF0dHJpYnV0ZSgncGxhY2Vob2xkZXInLCBkZWZhdWx0UGFyYW1zLmlucHV0UGxhY2Vob2xkZXIpO1xyXG5cclxuICByZXNldElucHV0RXJyb3IoKTtcclxufTtcclxuXHJcblxyXG52YXIgcmVzZXRJbnB1dEVycm9yID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAvLyBJZiBwcmVzcyBlbnRlciA9PiBpZ25vcmVcclxuICBpZiAoZXZlbnQgJiYgZXZlbnQua2V5Q29kZSA9PT0gMTMpIHtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIHZhciAkbW9kYWwgPSBnZXRNb2RhbCgpO1xyXG5cclxuICB2YXIgJGVycm9ySWNvbiA9ICRtb2RhbC5xdWVyeVNlbGVjdG9yKCcuc2EtaW5wdXQtZXJyb3InKTtcclxuICByZW1vdmVDbGFzcygkZXJyb3JJY29uLCAnc2hvdycpO1xyXG5cclxuICB2YXIgJGVycm9yQ29udGFpbmVyID0gJG1vZGFsLnF1ZXJ5U2VsZWN0b3IoJy5zYS1lcnJvci1jb250YWluZXInKTtcclxuICByZW1vdmVDbGFzcygkZXJyb3JDb250YWluZXIsICdzaG93Jyk7XHJcbn07XHJcblxyXG5cclxuLypcclxuICogU2V0IFwibWFyZ2luLXRvcFwiLXByb3BlcnR5IG9uIG1vZGFsIGJhc2VkIG9uIGl0cyBjb21wdXRlZCBoZWlnaHRcclxuICovXHJcbnZhciBmaXhWZXJ0aWNhbFBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgdmFyICRtb2RhbCA9IGdldE1vZGFsKCk7XHJcbiAgJG1vZGFsLnN0eWxlLm1hcmdpblRvcCA9IGdldFRvcE1hcmdpbihnZXRNb2RhbCgpKTtcclxufTtcclxuXHJcblxyXG5leHBvcnQgeyBcclxuICBzd2VldEFsZXJ0SW5pdGlhbGl6ZSxcclxuICBnZXRNb2RhbCxcclxuICBnZXRPdmVybGF5LFxyXG4gIGdldElucHV0LFxyXG4gIHNldEZvY3VzU3R5bGUsXHJcbiAgb3Blbk1vZGFsLFxyXG4gIHJlc2V0SW5wdXQsXHJcbiAgcmVzZXRJbnB1dEVycm9yLFxyXG4gIGZpeFZlcnRpY2FsUG9zaXRpb25cclxufTtcclxuIiwidmFyIGluamVjdGVkSFRNTCA9IFxyXG5cclxuICAvLyBEYXJrIG92ZXJsYXlcclxuICBgPGRpdiBjbGFzcz1cInN3ZWV0LW92ZXJsYXlcIiB0YWJJbmRleD1cIi0xXCI+PC9kaXY+YCArXHJcblxyXG4gIC8vIE1vZGFsXHJcbiAgYDxkaXYgY2xhc3M9XCJzd2VldC1hbGVydFwiPmAgK1xyXG5cclxuICAgIC8vIEVycm9yIGljb25cclxuICAgIGA8ZGl2IGNsYXNzPVwic2EtaWNvbiBzYS1lcnJvclwiPlxyXG4gICAgICA8c3BhbiBjbGFzcz1cInNhLXgtbWFya1wiPlxyXG4gICAgICAgIDxzcGFuIGNsYXNzPVwic2EtbGluZSBzYS1sZWZ0XCI+PC9zcGFuPlxyXG4gICAgICAgIDxzcGFuIGNsYXNzPVwic2EtbGluZSBzYS1yaWdodFwiPjwvc3Bhbj5cclxuICAgICAgPC9zcGFuPlxyXG4gICAgPC9kaXY+YCArXHJcblxyXG4gICAgLy8gV2FybmluZyBpY29uXHJcbiAgICBgPGRpdiBjbGFzcz1cInNhLWljb24gc2Etd2FybmluZ1wiPlxyXG4gICAgICA8c3BhbiBjbGFzcz1cInNhLWJvZHlcIj48L3NwYW4+XHJcbiAgICAgIDxzcGFuIGNsYXNzPVwic2EtZG90XCI+PC9zcGFuPlxyXG4gICAgPC9kaXY+YCArXHJcblxyXG4gICAgLy8gSW5mbyBpY29uXHJcbiAgICBgPGRpdiBjbGFzcz1cInNhLWljb24gc2EtaW5mb1wiPjwvZGl2PmAgK1xyXG5cclxuICAgIC8vIFN1Y2Nlc3MgaWNvblxyXG4gICAgYDxkaXYgY2xhc3M9XCJzYS1pY29uIHNhLXN1Y2Nlc3NcIj5cclxuICAgICAgPHNwYW4gY2xhc3M9XCJzYS1saW5lIHNhLXRpcFwiPjwvc3Bhbj5cclxuICAgICAgPHNwYW4gY2xhc3M9XCJzYS1saW5lIHNhLWxvbmdcIj48L3NwYW4+XHJcblxyXG4gICAgICA8ZGl2IGNsYXNzPVwic2EtcGxhY2Vob2xkZXJcIj48L2Rpdj5cclxuICAgICAgPGRpdiBjbGFzcz1cInNhLWZpeFwiPjwvZGl2PlxyXG4gICAgPC9kaXY+YCArXHJcblxyXG4gICAgYDxkaXYgY2xhc3M9XCJzYS1pY29uIHNhLWN1c3RvbVwiPjwvZGl2PmAgK1xyXG5cclxuICAgIC8vIFRpdGxlLCB0ZXh0IGFuZCBpbnB1dFxyXG4gICAgYDxoMj5UaXRsZTwvaDI+XHJcbiAgICA8cD5UZXh0PC9wPlxyXG4gICAgPGZpZWxkc2V0PlxyXG4gICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiB0YWJJbmRleD1cIjNcIiAvPlxyXG4gICAgICA8ZGl2IGNsYXNzPVwic2EtaW5wdXQtZXJyb3JcIj48L2Rpdj5cclxuICAgIDwvZmllbGRzZXQ+YCArXHJcblxyXG4gICAgLy8gSW5wdXQgZXJyb3JzXHJcbiAgICBgPGRpdiBjbGFzcz1cInNhLWVycm9yLWNvbnRhaW5lclwiPlxyXG4gICAgICA8ZGl2IGNsYXNzPVwiaWNvblwiPiE8L2Rpdj5cclxuICAgICAgPHA+Tm90IHZhbGlkITwvcD5cclxuICAgIDwvZGl2PmAgK1xyXG5cclxuICAgIC8vIENhbmNlbCBhbmQgY29uZmlybSBidXR0b25zXHJcbiAgICBgPGRpdiBjbGFzcz1cInNhLWJ1dHRvbi1jb250YWluZXJcIj5cclxuICAgICAgPGJ1dHRvbiBjbGFzcz1cImNhbmNlbFwiIHRhYkluZGV4PVwiMlwiPkNhbmNlbDwvYnV0dG9uPlxyXG4gICAgICA8ZGl2IGNsYXNzPVwic2EtY29uZmlybS1idXR0b24tY29udGFpbmVyXCI+XHJcbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImNvbmZpcm1cIiB0YWJJbmRleD1cIjFcIj5PSzwvYnV0dG9uPmAgKyBcclxuXHJcbiAgICAgICAgLy8gTG9hZGluZyBhbmltYXRpb25cclxuICAgICAgICBgPGRpdiBjbGFzcz1cImxhLWJhbGwtZmFsbFwiPlxyXG4gICAgICAgICAgPGRpdj48L2Rpdj5cclxuICAgICAgICAgIDxkaXY+PC9kaXY+XHJcbiAgICAgICAgICA8ZGl2PjwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgIDwvZGl2PmAgK1xyXG5cclxuICAvLyBFbmQgb2YgbW9kYWxcclxuICBgPC9kaXY+YDtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGluamVjdGVkSFRNTDtcclxuIiwidmFyIGFsZXJ0VHlwZXMgPSBbJ2Vycm9yJywgJ3dhcm5pbmcnLCAnaW5mbycsICdzdWNjZXNzJywgJ2lucHV0JywgJ3Byb21wdCddO1xyXG5cclxuaW1wb3J0IHtcclxuICBpc0lFOFxyXG59IGZyb20gJy4vdXRpbHMnO1xyXG5cclxuaW1wb3J0IHtcclxuICBnZXRNb2RhbCxcclxuICBnZXRJbnB1dCxcclxuICBzZXRGb2N1c1N0eWxlXHJcbn0gZnJvbSAnLi9oYW5kbGUtc3dhbC1kb20nO1xyXG5cclxuaW1wb3J0IHtcclxuICBoYXNDbGFzcywgYWRkQ2xhc3MsIHJlbW92ZUNsYXNzLFxyXG4gIGVzY2FwZUh0bWwsXHJcbiAgX3Nob3csIHNob3csIF9oaWRlLCBoaWRlXHJcbn0gZnJvbSAnLi9oYW5kbGUtZG9tJztcclxuXHJcblxyXG4vKlxyXG4gKiBTZXQgdHlwZSwgdGV4dCBhbmQgYWN0aW9ucyBvbiBtb2RhbFxyXG4gKi9cclxudmFyIHNldFBhcmFtZXRlcnMgPSBmdW5jdGlvbihwYXJhbXMpIHtcclxuICB2YXIgbW9kYWwgPSBnZXRNb2RhbCgpO1xyXG5cclxuICB2YXIgJHRpdGxlID0gbW9kYWwucXVlcnlTZWxlY3RvcignaDInKTtcclxuICB2YXIgJHRleHQgPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCdwJyk7XHJcbiAgdmFyICRjYW5jZWxCdG4gPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCdidXR0b24uY2FuY2VsJyk7XHJcbiAgdmFyICRjb25maXJtQnRuID0gbW9kYWwucXVlcnlTZWxlY3RvcignYnV0dG9uLmNvbmZpcm0nKTtcclxuXHJcbiAgLypcclxuICAgKiBUaXRsZVxyXG4gICAqL1xyXG4gICR0aXRsZS5pbm5lckhUTUwgPSBwYXJhbXMuaHRtbCA/IHBhcmFtcy50aXRsZSA6IGVzY2FwZUh0bWwocGFyYW1zLnRpdGxlKS5zcGxpdCgnXFxuJykuam9pbignPGJyPicpO1xyXG5cclxuICAvKlxyXG4gICAqIFRleHRcclxuICAgKi9cclxuICAkdGV4dC5pbm5lckhUTUwgPSBwYXJhbXMuaHRtbCA/IHBhcmFtcy50ZXh0IDogZXNjYXBlSHRtbChwYXJhbXMudGV4dCB8fCAnJykuc3BsaXQoJ1xcbicpLmpvaW4oJzxicj4nKTtcclxuICBpZiAocGFyYW1zLnRleHQpIHNob3coJHRleHQpO1xyXG5cclxuICAvKlxyXG4gICAqIEN1c3RvbSBjbGFzc1xyXG4gICAqL1xyXG4gIGlmIChwYXJhbXMuY3VzdG9tQ2xhc3MpIHtcclxuICAgIGFkZENsYXNzKG1vZGFsLCBwYXJhbXMuY3VzdG9tQ2xhc3MpO1xyXG4gICAgbW9kYWwuc2V0QXR0cmlidXRlKCdkYXRhLWN1c3RvbS1jbGFzcycsIHBhcmFtcy5jdXN0b21DbGFzcyk7XHJcbiAgfSBlbHNlIHtcclxuICAgIC8vIEZpbmQgcHJldmlvdXNseSBzZXQgY2xhc3NlcyBhbmQgcmVtb3ZlIHRoZW1cclxuICAgIGxldCBjdXN0b21DbGFzcyA9IG1vZGFsLmdldEF0dHJpYnV0ZSgnZGF0YS1jdXN0b20tY2xhc3MnKTtcclxuICAgIHJlbW92ZUNsYXNzKG1vZGFsLCBjdXN0b21DbGFzcyk7XHJcbiAgICBtb2RhbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtY3VzdG9tLWNsYXNzJywgJycpO1xyXG4gIH1cclxuXHJcbiAgLypcclxuICAgKiBJY29uXHJcbiAgICovXHJcbiAgaGlkZShtb2RhbC5xdWVyeVNlbGVjdG9yQWxsKCcuc2EtaWNvbicpKTtcclxuXHJcbiAgaWYgKHBhcmFtcy50eXBlICYmICFpc0lFOCgpKSB7XHJcblxyXG4gICAgbGV0IHZhbGlkVHlwZSA9IGZhbHNlO1xyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWxlcnRUeXBlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAocGFyYW1zLnR5cGUgPT09IGFsZXJ0VHlwZXNbaV0pIHtcclxuICAgICAgICB2YWxpZFR5cGUgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCF2YWxpZFR5cGUpIHtcclxuICAgICAgbG9nU3RyKCdVbmtub3duIGFsZXJ0IHR5cGU6ICcgKyBwYXJhbXMudHlwZSk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgdHlwZXNXaXRoSWNvbnMgPSBbJ3N1Y2Nlc3MnLCAnZXJyb3InLCAnd2FybmluZycsICdpbmZvJ107XHJcbiAgICBsZXQgJGljb247XHJcblxyXG4gICAgaWYgKHR5cGVzV2l0aEljb25zLmluZGV4T2YocGFyYW1zLnR5cGUpICE9PSAtMSkge1xyXG4gICAgICAkaWNvbiA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3IoJy5zYS1pY29uLicgKyAnc2EtJyArIHBhcmFtcy50eXBlKTtcclxuICAgICAgc2hvdygkaWNvbik7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0ICRpbnB1dCA9IGdldElucHV0KCk7XHJcblxyXG4gICAgLy8gQW5pbWF0ZSBpY29uXHJcbiAgICBzd2l0Y2ggKHBhcmFtcy50eXBlKSB7XHJcblxyXG4gICAgICBjYXNlICdzdWNjZXNzJzpcclxuICAgICAgICBhZGRDbGFzcygkaWNvbiwgJ2FuaW1hdGUnKTtcclxuICAgICAgICBhZGRDbGFzcygkaWNvbi5xdWVyeVNlbGVjdG9yKCcuc2EtdGlwJyksICdhbmltYXRlU3VjY2Vzc1RpcCcpO1xyXG4gICAgICAgIGFkZENsYXNzKCRpY29uLnF1ZXJ5U2VsZWN0b3IoJy5zYS1sb25nJyksICdhbmltYXRlU3VjY2Vzc0xvbmcnKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGNhc2UgJ2Vycm9yJzpcclxuICAgICAgICBhZGRDbGFzcygkaWNvbiwgJ2FuaW1hdGVFcnJvckljb24nKTtcclxuICAgICAgICBhZGRDbGFzcygkaWNvbi5xdWVyeVNlbGVjdG9yKCcuc2EteC1tYXJrJyksICdhbmltYXRlWE1hcmsnKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGNhc2UgJ3dhcm5pbmcnOlxyXG4gICAgICAgIGFkZENsYXNzKCRpY29uLCAncHVsc2VXYXJuaW5nJyk7XHJcbiAgICAgICAgYWRkQ2xhc3MoJGljb24ucXVlcnlTZWxlY3RvcignLnNhLWJvZHknKSwgJ3B1bHNlV2FybmluZ0lucycpO1xyXG4gICAgICAgIGFkZENsYXNzKCRpY29uLnF1ZXJ5U2VsZWN0b3IoJy5zYS1kb3QnKSwgJ3B1bHNlV2FybmluZ0lucycpO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSAnaW5wdXQnOlxyXG4gICAgICBjYXNlICdwcm9tcHQnOlxyXG4gICAgICAgICRpbnB1dC5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCBwYXJhbXMuaW5wdXRUeXBlKTtcclxuICAgICAgICAkaW5wdXQudmFsdWUgPSBwYXJhbXMuaW5wdXRWYWx1ZTtcclxuICAgICAgICAkaW5wdXQuc2V0QXR0cmlidXRlKCdwbGFjZWhvbGRlcicsIHBhcmFtcy5pbnB1dFBsYWNlaG9sZGVyKTtcclxuICAgICAgICBhZGRDbGFzcyhtb2RhbCwgJ3Nob3ctaW5wdXQnKTtcclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICRpbnB1dC5mb2N1cygpO1xyXG4gICAgICAgICAgJGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgc3dhbC5yZXNldElucHV0RXJyb3IpO1xyXG4gICAgICAgIH0sIDQwMCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKlxyXG4gICAqIEN1c3RvbSBpbWFnZVxyXG4gICAqL1xyXG4gIGlmIChwYXJhbXMuaW1hZ2VVcmwpIHtcclxuICAgIGxldCAkY3VzdG9tSWNvbiA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3IoJy5zYS1pY29uLnNhLWN1c3RvbScpO1xyXG5cclxuICAgICRjdXN0b21JY29uLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9ICd1cmwoJyArIHBhcmFtcy5pbWFnZVVybCArICcpJztcclxuICAgIHNob3coJGN1c3RvbUljb24pO1xyXG5cclxuICAgIGxldCBfaW1nV2lkdGggPSA4MDtcclxuICAgIGxldCBfaW1nSGVpZ2h0ID0gODA7XHJcblxyXG4gICAgaWYgKHBhcmFtcy5pbWFnZVNpemUpIHtcclxuICAgICAgbGV0IGRpbWVuc2lvbnMgPSBwYXJhbXMuaW1hZ2VTaXplLnRvU3RyaW5nKCkuc3BsaXQoJ3gnKTtcclxuICAgICAgbGV0IGltZ1dpZHRoID0gZGltZW5zaW9uc1swXTtcclxuICAgICAgbGV0IGltZ0hlaWdodCA9IGRpbWVuc2lvbnNbMV07XHJcblxyXG4gICAgICBpZiAoIWltZ1dpZHRoIHx8ICFpbWdIZWlnaHQpIHtcclxuICAgICAgICBsb2dTdHIoJ1BhcmFtZXRlciBpbWFnZVNpemUgZXhwZWN0cyB2YWx1ZSB3aXRoIGZvcm1hdCBXSURUSHhIRUlHSFQsIGdvdCAnICsgcGFyYW1zLmltYWdlU2l6ZSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgX2ltZ1dpZHRoID0gaW1nV2lkdGg7XHJcbiAgICAgICAgX2ltZ0hlaWdodCA9IGltZ0hlaWdodDtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgICRjdXN0b21JY29uLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAkY3VzdG9tSWNvbi5nZXRBdHRyaWJ1dGUoJ3N0eWxlJykgKyAnd2lkdGg6JyArIF9pbWdXaWR0aCArICdweDsgaGVpZ2h0OicgKyBfaW1nSGVpZ2h0ICsgJ3B4Jyk7XHJcbiAgfVxyXG5cclxuICBpZiAocGFyYW1zLmZsb2F0QnV0dG9ucykge1xyXG5cdGFkZENsYXNzKG1vZGFsLnF1ZXJ5U2VsZWN0b3IoJy5zYS1idXR0b24tY29udGFpbmVyJyksICdmbG9hdEJ1dHRvbnMnKTtcclxuICB9IGVsc2Uge1xyXG5cdHJlbW92ZUNsYXNzKG1vZGFsLnF1ZXJ5U2VsZWN0b3IoJy5zYS1idXR0b24tY29udGFpbmVyJyksICdmbG9hdEJ1dHRvbnMnKTtcclxuICB9XHJcblxyXG4gIC8qXHJcbiAgICogU2hvdyBjYW5jZWwgYnV0dG9uP1xyXG4gICAqL1xyXG4gIG1vZGFsLnNldEF0dHJpYnV0ZSgnZGF0YS1oYXMtY2FuY2VsLWJ1dHRvbicsIHBhcmFtcy5zaG93Q2FuY2VsQnV0dG9uKTtcclxuICBpZiAocGFyYW1zLnNob3dDYW5jZWxCdXR0b24pIHtcclxuICAgICRjYW5jZWxCdG4uc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBoaWRlKCRjYW5jZWxCdG4pO1xyXG4gIH1cclxuXHJcbiAgLypcclxuICAgKiBTaG93IGNvbmZpcm0gYnV0dG9uP1xyXG4gICAqL1xyXG4gIG1vZGFsLnNldEF0dHJpYnV0ZSgnZGF0YS1oYXMtY29uZmlybS1idXR0b24nLCBwYXJhbXMuc2hvd0NvbmZpcm1CdXR0b24pO1xyXG4gIGlmIChwYXJhbXMuc2hvd0NvbmZpcm1CdXR0b24pIHtcclxuICAgICRjb25maXJtQnRuLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJztcclxuICB9IGVsc2Uge1xyXG4gICAgaGlkZSgkY29uZmlybUJ0bik7XHJcbiAgfVxyXG5cclxuICAvKlxyXG4gICAqIEN1c3RvbSB0ZXh0IG9uIGNhbmNlbC9jb25maXJtIGJ1dHRvbnNcclxuICAgKi9cclxuICBpZiAocGFyYW1zLmNhbmNlbEJ1dHRvblRleHQpIHtcclxuICAgICRjYW5jZWxCdG4uaW5uZXJIVE1MID0gZXNjYXBlSHRtbChwYXJhbXMuY2FuY2VsQnV0dG9uVGV4dCk7XHJcbiAgfVxyXG4gIGlmIChwYXJhbXMuY29uZmlybUJ1dHRvblRleHQpIHtcclxuICAgICRjb25maXJtQnRuLmlubmVySFRNTCA9IGVzY2FwZUh0bWwocGFyYW1zLmNvbmZpcm1CdXR0b25UZXh0KTtcclxuICB9XHJcblxyXG4gIC8qXHJcbiAgICogQ3VzdG9tIGNvbG9yIG9uIGNvbmZpcm0gYnV0dG9uXHJcbiAgICovXHJcbiAgaWYgKHBhcmFtcy5jb25maXJtQnV0dG9uQ29sb3IpIHtcclxuICAgIC8vIFNldCBjb25maXJtIGJ1dHRvbiB0byBzZWxlY3RlZCBiYWNrZ3JvdW5kIGNvbG9yXHJcbiAgICAkY29uZmlybUJ0bi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBwYXJhbXMuY29uZmlybUJ1dHRvbkNvbG9yO1xyXG5cclxuICAgIC8vIFNldCB0aGUgY29uZmlybSBidXR0b24gY29sb3IgdG8gdGhlIGxvYWRpbmcgcmluZ1xyXG4gICAgJGNvbmZpcm1CdG4uc3R5bGUuYm9yZGVyTGVmdENvbG9yID0gcGFyYW1zLmNvbmZpcm1Mb2FkaW5nQnV0dG9uQ29sb3I7XHJcbiAgICAkY29uZmlybUJ0bi5zdHlsZS5ib3JkZXJSaWdodENvbG9yID0gcGFyYW1zLmNvbmZpcm1Mb2FkaW5nQnV0dG9uQ29sb3I7XHJcblxyXG4gICAgLy8gU2V0IGJveC1zaGFkb3cgdG8gZGVmYXVsdCBmb2N1c2VkIGJ1dHRvblxyXG4gICAgc2V0Rm9jdXNTdHlsZSgkY29uZmlybUJ0biwgcGFyYW1zLmNvbmZpcm1CdXR0b25Db2xvcik7XHJcbiAgfVxyXG5cclxuICAvKlxyXG4gICAqIEFsbG93IG91dHNpZGUgY2xpY2tcclxuICAgKi9cclxuICBtb2RhbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtYWxsb3ctb3V0c2lkZS1jbGljaycsIHBhcmFtcy5hbGxvd091dHNpZGVDbGljayk7XHJcblxyXG4gIC8qXHJcbiAgICogQ2FsbGJhY2sgZnVuY3Rpb25cclxuICAgKi9cclxuICB2YXIgaGFzRG9uZUZ1bmN0aW9uID0gcGFyYW1zLmRvbmVGdW5jdGlvbiA/IHRydWUgOiBmYWxzZTtcclxuICBtb2RhbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtaGFzLWRvbmUtZnVuY3Rpb24nLCBoYXNEb25lRnVuY3Rpb24pO1xyXG5cclxuICAvKlxyXG4gICAqIEFuaW1hdGlvblxyXG4gICAqL1xyXG4gIGlmICghcGFyYW1zLmFuaW1hdGlvbikge1xyXG4gICAgbW9kYWwuc2V0QXR0cmlidXRlKCdkYXRhLWFuaW1hdGlvbicsICdub25lJyk7XHJcbiAgfSBlbHNlIGlmICh0eXBlb2YgcGFyYW1zLmFuaW1hdGlvbiA9PT0gJ3N0cmluZycpIHtcclxuICAgIG1vZGFsLnNldEF0dHJpYnV0ZSgnZGF0YS1hbmltYXRpb24nLCBwYXJhbXMuYW5pbWF0aW9uKTsgLy8gQ3VzdG9tIGFuaW1hdGlvblxyXG4gIH0gZWxzZSB7XHJcbiAgICBtb2RhbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtYW5pbWF0aW9uJywgJ3BvcCcpO1xyXG4gIH1cclxuXHJcbiAgLypcclxuICAgKiBUaW1lclxyXG4gICAqL1xyXG4gIG1vZGFsLnNldEF0dHJpYnV0ZSgnZGF0YS10aW1lcicsIHBhcmFtcy50aW1lcik7XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBzZXRQYXJhbWV0ZXJzO1xyXG4iLCIvKlxyXG4gKiBBbGxvdyB1c2VyIHRvIHBhc3MgdGhlaXIgb3duIHBhcmFtc1xyXG4gKi9cclxudmFyIGV4dGVuZCA9IGZ1bmN0aW9uKGEsIGIpIHtcclxuICBmb3IgKHZhciBrZXkgaW4gYikge1xyXG4gICAgaWYgKGIuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICBhW2tleV0gPSBiW2tleV07XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBhO1xyXG59O1xyXG5cclxuLypcclxuICogQ29udmVydCBIRVggY29kZXMgdG8gUkdCIHZhbHVlcyAoIzAwMDAwMCAtPiByZ2IoMCwwLDApKVxyXG4gKi9cclxudmFyIGhleFRvUmdiID0gZnVuY3Rpb24oaGV4KSB7XHJcbiAgdmFyIHJlc3VsdCA9IC9eIz8oW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KShbYS1mXFxkXXsyfSkkL2kuZXhlYyhoZXgpO1xyXG4gIHJldHVybiByZXN1bHQgPyBwYXJzZUludChyZXN1bHRbMV0sIDE2KSArICcsICcgKyBwYXJzZUludChyZXN1bHRbMl0sIDE2KSArICcsICcgKyBwYXJzZUludChyZXN1bHRbM10sIDE2KSA6IG51bGw7XHJcbn07XHJcblxyXG4vKlxyXG4gKiBDaGVjayBpZiB0aGUgdXNlciBpcyB1c2luZyBJbnRlcm5ldCBFeHBsb3JlciA4IChmb3IgZmFsbGJhY2tzKVxyXG4gKi9cclxudmFyIGlzSUU4ID0gZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuICh3aW5kb3cuYXR0YWNoRXZlbnQgJiYgIXdpbmRvdy5hZGRFdmVudExpc3RlbmVyKTtcclxufTtcclxuXHJcbi8qXHJcbiAqIElFIGNvbXBhdGlibGUgbG9nZ2luZyBmb3IgZGV2ZWxvcGVyc1xyXG4gKi9cclxudmFyIGxvZ1N0ciA9IGZ1bmN0aW9uKHN0cmluZykge1xyXG4gIGlmICh3aW5kb3cuY29uc29sZSkge1xyXG4gICAgLy8gSUUuLi5cclxuICAgIHdpbmRvdy5jb25zb2xlLmxvZygnU3dlZXRBbGVydDogJyArIHN0cmluZyk7XHJcbiAgfVxyXG59O1xyXG5cclxuLypcclxuICogU2V0IGhvdmVyLCBhY3RpdmUgYW5kIGZvY3VzLXN0YXRlcyBmb3IgYnV0dG9ucyBcclxuICogKHNvdXJjZTogaHR0cDovL3d3dy5zaXRlcG9pbnQuY29tL2phdmFzY3JpcHQtZ2VuZXJhdGUtbGlnaHRlci1kYXJrZXItY29sb3IpXHJcbiAqL1xyXG52YXIgY29sb3JMdW1pbmFuY2UgPSBmdW5jdGlvbihoZXgsIGx1bSkge1xyXG4gIC8vIFZhbGlkYXRlIGhleCBzdHJpbmdcclxuICBoZXggPSBTdHJpbmcoaGV4KS5yZXBsYWNlKC9bXjAtOWEtZl0vZ2ksICcnKTtcclxuICBpZiAoaGV4Lmxlbmd0aCA8IDYpIHtcclxuICAgIGhleCA9IGhleFswXSArIGhleFswXSArIGhleFsxXSArIGhleFsxXSArIGhleFsyXSArIGhleFsyXTtcclxuICB9XHJcbiAgbHVtID0gbHVtIHx8IDA7XHJcblxyXG4gIC8vIENvbnZlcnQgdG8gZGVjaW1hbCBhbmQgY2hhbmdlIGx1bWlub3NpdHlcclxuICB2YXIgcmdiID0gJyMnO1xyXG4gIHZhciBjO1xyXG4gIHZhciBpO1xyXG5cclxuICBmb3IgKGkgPSAwOyBpIDwgMzsgaSsrKSB7XHJcbiAgICBjID0gcGFyc2VJbnQoaGV4LnN1YnN0cihpICogMiwgMiksIDE2KTtcclxuICAgIGMgPSBNYXRoLnJvdW5kKE1hdGgubWluKE1hdGgubWF4KDAsIGMgKyBjICogbHVtKSwgMjU1KSkudG9TdHJpbmcoMTYpO1xyXG4gICAgcmdiICs9ICgnMDAnICsgYykuc3Vic3RyKGMubGVuZ3RoKTtcclxuICB9XHJcblxyXG4gIHJldHVybiByZ2I7XHJcbn07XHJcblxyXG5cclxuZXhwb3J0IHtcclxuICBleHRlbmQsXHJcbiAgaGV4VG9SZ2IsXHJcbiAgaXNJRTgsXHJcbiAgbG9nU3RyLFxyXG4gIGNvbG9yTHVtaW5hbmNlXHJcbn07XHJcbiJdfQ==

  
  /*
   * Use SweetAlert with RequireJS
   */
  
  if (typeof define === 'function' && define.amd) {
    define(function () {
      return sweetAlert;
    });
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = sweetAlert;
  }

})(window, document);