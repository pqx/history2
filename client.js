(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var assign = require('object-assign');
require('./lib/starts-with');
var PubSub = require('./lib/pub-sub');

var _change = true; // hashchange event handler lock
window._HISTORY_POPPED = false;
var initialURL = location.href;
var pushStateSupport = window.history && window.history.pushState;

function init(options) {
  var mode = this.mode = options.mode || (pushStateSupport ? 'pushstate' : 'hashbang');
  var basePath = this.basePath = options.basePath || '/';

  var path = null;
  var pathname = window.location.pathname;
  var hash = window.location.hash;
  var start = hash.startsWith('#!');

  if(start) {
    path = hash.substring(2);
    if(mode === 'pushstate') return window.location.replace(path);
  } else if(hash) {
    if(mode === 'pushstate') {
      path = '/' + hash.substring(1).replace(/-/g, '/');
      // return window.location.replace(url);
    } else if(mode === 'hashbang') {
      path = '/#!' + hash.substring(1).replace(/-/g, '/');
      return window.location.replace(url);
    }
  } else {
    path = pathname + window.location.search;
    if(pathname !== '/' && mode === 'hashbang') {
      return window.location.replace('/#!/'+pathname.substring(1));
    }
  }

  this.start();

  return path;
}

function change(url) {
  window._HISTORY_POPPED = true;

  if(this.mode === 'pushstate') {
    window.history.pushState({url: url}, url, url);
  } else if(this.mode === 'hashbang') {
    window.location.hash = '#!' + url;
    _change = false; // disable hashchange event handler
  }
};

// not working
function replace(url) {
  if(this.mode === 'pushstate') {
    window.history.replaceState({url: url}, url, url);
  } else if(this.mode === 'hashbang') {
    window.location.replace(url);
    _change = false;
  }
}

function start() {
  var self = this;

  if(this.mode === 'pushstate') {
    window.onpopstate = function(event) {
      var initialPop = location.href === initialURL && !window._HISTORY_POPPED;

      window._HISTORY_POPPED = true;
      if(initialPop) return;

      self.pub('change', location.pathname+location.search);
    };
  } else if(this.mode === 'hashbang') {
    function onChange(e) {
      if(_change) self.pub('change', location.hash.substr(2));
      else _change = true; // disable once
    };

    if(window.addEventListener) window.addEventListener('hashchange', onChange, false);
    else if(window.attachEvent) window.attachEvent('onhashchange', onChange);
  }
}

module.exports = assign({
  init: init,
  change: change,
  replace: replace,
  start: start
}, PubSub);

},{"./lib/pub-sub":2,"./lib/starts-with":3,"object-assign":4}],2:[function(require,module,exports){
var PubSub = {
  sub: function(ev, callback) {
    var calls = this._callbacks || (this._callbacks = {});

    (this._callbacks[ev] || (this._callbacks[ev] = [])).push(callback);
    return this;
  },

  pub: function() {
    var args = Array.prototype.slice.call(arguments, 0);
    var ev = args.shift();
    var list, calls;

    if(!(calls = this._callbacks)) return this;
    if(!(list = this._callbacks[ev])) return this;

    for(var i = 0, l = list.length; i < l; i++) {
      var res = list[i].apply(this, args);
      if(res === false) return;
    }

    return this;
  }
};

// simple alias
PubSub.on = PubSub.sub;

module.exports = PubSub;

},{}],3:[function(require,module,exports){
if(!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position) {
    position = position || 0;
    return this.indexOf(searchString, position) === position;
  };
}

},{}],4:[function(require,module,exports){
'use strict';
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function ToObject(val) {
	if (val == null) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function ownEnumerableKeys(obj) {
	var keys = Object.getOwnPropertyNames(obj);

	if (Object.getOwnPropertySymbols) {
		keys = keys.concat(Object.getOwnPropertySymbols(obj));
	}

	return keys.filter(function (key) {
		return propIsEnumerable.call(obj, key);
	});
}

module.exports = Object.assign || function (target, source) {
	var from;
	var keys;
	var to = ToObject(target);

	for (var s = 1; s < arguments.length; s++) {
		from = arguments[s];
		keys = ownEnumerableKeys(Object(from));

		for (var i = 0; i < keys.length; i++) {
			to[keys[i]] = from[keys[i]];
		}
	}

	return to;
};

},{}]},{},[1]);
