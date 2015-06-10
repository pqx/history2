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
