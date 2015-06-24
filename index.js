var assign = require('object-assign');
require('./lib/starts-with');
var PubSub = require('./lib/pub-sub');
var location = window.location;
var history = window.history;

var _change = true; // hashchange event handler lock
window._HISTORY_POPPED = false;
var initialURL = location.href;
var pushStateSupport = history && history.pushState;

function init(options) {
  var mode = this.mode = options.mode || (pushStateSupport ? 'pushstate' : 'hashbang');
  var basePath = this.basePath = options.basePath || '/';

  var url = null;
  var pathname = location.pathname;
  var originalUrl = pathname + location.search;
  var hash = location.hash;
  var start = hash && hash.startsWith('#!');

  if(mode === 'pushstate') {
    if(start) return location.replace(hash.substring(2));
    url = originalUrl;
  }

  if(mode === 'hashbang') {
    if(!start) return location.replace('/#!' + originalUrl);
    url = hash.substring(2);
  }

  this.start();
  return url;
}

function change(url) {
  window._HISTORY_POPPED = true;

  if(this.mode === 'pushstate') {
    history.pushState({url: url}, url, url);
  } else if(this.mode === 'hashbang') {
    location.hash = '#!' + url;
    _change = false; // disable hashchange event handler
  }
};

// not working
function replace(url) {
  if(this.mode === 'pushstate') {
    history.replaceState({url: url}, url, url);
  } else if(this.mode === 'hashbang') {
    location.replace(url);
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
