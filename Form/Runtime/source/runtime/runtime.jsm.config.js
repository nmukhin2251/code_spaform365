

//-------------------------------------------------------------------------------------------------

// var mixin    = require('./util/mixin'),
//     camelize = require('./util/camelize');

define(["knockout", "form2", "spaform", "jsm-mixin", "jsm-camelize"], function(ko, RUNTIME, SPAFORM, mixin, camelize ) {

//-------------------------------------------------------------------------------------------------

function Config(options, StateMachine) {
  'use strict';
  options = options || {};

  this.options     = options; // preserving original options can be useful (e.g visualize plugin)
  this.defaults    = StateMachine.defaults;
  this.states      = [];
  this.statesinfo  = {};
  this.transitions = [];
  this.transitionsinfo = {};
  this.map         = {};
  this.lifecycle   = this.configureLifecycle();
  this.init        = this.configureInitTransition(options.init);
  this.data        = this.configureData(options.data);
  this.methods     = this.configureMethods(options.methods);

  this.map[this.defaults.wildcard] = {};

  this.configureTransitions(options.transitions || []);

  this.plugins = this.configurePlugins(options.plugins, StateMachine.plugin);

}

//-------------------------------------------------------------------------------------------------

mixin(Config.prototype, {

  addState: function(name, info) {
    // if( name == 'abc') {
    //   debugger;
    // }
//debugger;    
    if (!this.map[name]) {
      this.states.push(name);
      this.statesinfo[name] = (info) ? info : (this.statesinfo[name]) ? this.statesinfo[name] : { label: name };
      this.addStateLifecycleNames(name);
      this.map[name] = {};
    }
    else {
      this.statesinfo[name] = (info) ? info : (this.statesinfo[name]) ? this.statesinfo[name] : { label: name };
    }
//console.log('|--> addState: '+name+' allStates: '+ JSON.stringify(this.states));   
  },

  addStateLifecycleNames: function(name) {
    this.lifecycle.onEnter[name] = camelize.prepended('onEnter', name);
    this.lifecycle.onLeave[name] = camelize.prepended('onLeave', name);
    this.lifecycle.on[name]      = camelize.prepended('on',      name);
  },

  addTransition: function(name, info) {
    if (this.transitions.indexOf(name) < 0) {
      this.transitions.push(name);
//debugger;
      var tran_info = (info) ? info : { 'label': name};
      if(!tran_info.id) tran_info.id = name;

      this.transitionsinfo[name] = tran_info;
      this.addTransitionLifecycleNames(name);
    }
  },

  addTransitionLifecycleNames: function(name) {
    this.lifecycle.onBefore[name] = camelize.prepended('onBefore', name);
    this.lifecycle.onAfter[name]  = camelize.prepended('onAfter',  name);
    this.lifecycle.on[name]       = camelize.prepended('on',       name);
  },

  mapTransition: function(transition) {
    var name = transition.name,
        from = transition.from,
        to   = transition.to;
    this.addState(from, transition.fromInfo);
    if (typeof to !== 'function')
      this.addState(to, transition.toInfo);
    this.addTransition(name, transition.info);
    this.map[from][name] = transition;
    return transition;
  },

  configureLifecycle: function() {
    return {
      onBefore: { transition: 'onBeforeTransition' },
      onAfter:  { transition: 'onAfterTransition'  },
      onEnter:  { state:      'onEnterState'       },
      onLeave:  { state:      'onLeaveState'       },
      on:       { transition: 'onTransition'       }
    };
  },

  configureInitTransition: function(init) {
    if (typeof init === 'string') {
      return this.mapTransition(mixin({}, this.defaults.init, { to: init, active: true }));
    }
    else if (typeof init === 'object') {
      return this.mapTransition(mixin({}, this.defaults.init, init, { active: true }));
    }
    else {
      this.addState(this.defaults.init.from);
      return this.defaults.init;
    }
  },

  configureData: function(data) {
    if (typeof data === 'function')
      return data;
    else if (typeof data === 'object')
      return function() { return data; }
    else
      return function() { return {};  }
  },

  configureMethods: function(methods) {
    return methods || {};
  },

  configurePlugins: function(plugins, builtin) {
    plugins = plugins || [];
    var n, max, plugin;
    for(n = 0, max = plugins.length ; n < max ; n++) {
      plugin = plugins[n];
      if (typeof plugin === 'function')
        plugins[n] = plugin = plugin()
      if (plugin.configure)
        plugin.configure(this);
    }
    return plugins
  },

  configureTransitions: function(transitions) {
    var i, n, transition, from, to, info, fromInfo, toInfo, wildcard = this.defaults.wildcard;
    for(n = 0 ; n < transitions.length ; n++) {
      transition = transitions[n];
      from  = Array.isArray(transition.from) ? transition.from : [transition.from || wildcard]
      to    = transition.to || wildcard;
      info  = transition.info;
      fromInfo  = transition.fromInfo;
      toInfo  = transition.toInfo;
      for(i = 0 ; i < from.length ; i++) {
        this.mapTransition({ name: transition.name, from: from[i], to: to, info: info, fromInfo: fromInfo, toInfo: toInfo });
      }
    }
  },

  transitionFor: function(state, transition) {
    var wildcard = this.defaults.wildcard;
    return this.map[state][transition] ||
           this.map[wildcard][transition];
  },

  transitionsFor: function(state) {
    var wildcard = this.defaults.wildcard;
    return Object.keys(this.map[state]).concat(Object.keys(this.map[wildcard]));
  },

  allStates: function() {
    return this.states;
  },

  stateInfo: function(state) {
    return this.statesinfo[state];
  },

  allTransitions: function() {
    return this.transitions;
  },

  transitionInfo: function(transition) {
    return this.transitionsinfo[transition];
  }
  
});

//-------------------------------------------------------------------------------------------------

//module.exports = Config;
  return Config;
});
//-------------------------------------------------------------------------------------------------
