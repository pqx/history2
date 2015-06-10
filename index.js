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
      return window.location.replace('/#!'+pathname.substring(1));
    }
  }

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
    // todo: ie attach event
    window.onhashchange = function(e) {
      if(_change) self.pub('change', location.hash.substr(2));
      else _change = true; // disable once
    };
  }
}

module.exports = assign({
  init: init,
  change: change,
  replace: replace,
  start: start
}, PubSub);
