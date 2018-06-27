

//-----------------------------------------------------------------------------------------------

// var mixin    = require('./util/mixin'),
//     camelize = require('./util/camelize'),
//     plugin   = require('./plugin'),
//     Config   = require('./config'),
//     JSM      = require('./jsm');
define(["knockout", "form2", "spaform", "jsm-mixin", "jsm-camelize", "jsm-plugin", "jsm-config", "jsm", "jsm-merge"], function(ko, RUNTIME, SPAFORM, mixin, camelize, plugin, Config, JSM, merge ) {
//-----------------------------------------------------------------------------------------------

var PublicMethods = {
  is:                  function(state)       { return this._fsm.is(state)                                     },
  can:                 function(transition)  { return this._fsm.can(transition)                               },
  cannot:              function(transition)  { return this._fsm.cannot(transition)                            },
  observe:             function()            { return this._fsm.observe(arguments)                            },
  transitions:         function()            { return this._fsm.transitions()                                 },

  elements:            function()            { return this._fsm.elements()                                    },
  load:                function(options)     { return apply(this || {}, options)                              },
  transitionInfo:      function(transition)  { return this._fsm.transitionInfo(transition);                   },
  stateInfo:           function(state)       { return this._fsm.stateInfo(state);                             },
  'camelize':          function(name)        { return camelize(name);                                         },
  append:              function(tranObject)  { 
//    console.log("offset: +" + (Date.now() - top.startTime)+"++ append transition --> " + JSON.stringify(tranObject));	
     
                                               var config = { merge: true, methods: {} }
                                               config.transitions = [{ 
                                                  name: tranObject.name, 
                                                  from: tranObject.fromId,  	
                                                  to: tranObject.toId,
                                                  info: tranObject.info
                                               }];
                                               if(tranObject.onBeforeClick) config.methods[camelize.prepended('onBefore', tranObject.name)] = tranObject.onBeforeClick;
                                               if(tranObject.onAfterClick)  config.methods[camelize.prepended('onAfter',  tranObject.name)] = tranObject.onAfterClick;                                              
                                               return apply(this || {}, config)                              },
  addState:            function(stateId, stateInfo) { 
                                               var config = { merge: true, methods: {} }
                                               config.transitions = [{ 
                                                  name: 'hidden',//'transition_close', 
                                                  from: stateId,  	
                                                  to:   stateId,
                                                  info: {
                                                    label: 'Close',
                                                    component: 'transition_close'
                                                  },
                                                  fromInfo: stateInfo,
                                                  toInfo:   stateInfo
                                             }];
                                               return apply(this || {}, config)                              },
  //clear:               function(options)     { return apply(this || {}, options)                              },

  allTransitions:      function()            { return this._fsm.allTransitions()                              },
  allStates:           function()            { return this._fsm.allStates()                                   },
  onInvalidTransition: function(t, from, to) { return this._fsm.onInvalidTransition(t, from, to)              },
  onPendingTransition: function(t, from, to) { return this._fsm.onPendingTransition(t, from, to)              },
}

var PublicProperties = {
  state: {
    configurable: false,
    enumerable:   true,
    get: function() {
      return this._fsm.state;
    },
    set: function(state) {
      throw Error('use transitions to change state')
    }
  }
}

//-----------------------------------------------------------------------------------------------

function StateMachine(options) {  
  return apply(this || {}, options);
}

function factory() {
  var cstor, options;
  if (typeof arguments[0] === 'function') {
    cstor   = arguments[0];
    options = arguments[1] || {};
  }
  else {
    cstor   = function() { this._fsm.apply(this, arguments) };
    options = arguments[0] || {};
  }
  var config = new Config(options, StateMachine);
  build(cstor.prototype, config);
  cstor.prototype._fsm.config = config; // convenience access to shared config without needing an instance
  return cstor;
}

//-------------------------------------------------------------------------------------------------

function apply(instance, options) {
//debugger; 
  var config
  if( options.merge) {
//debugger;    
    var moptions = merge(instance._fsm.config.options, options);
    config = new Config(moptions, StateMachine);
  }
  else {
    config = new Config(options, StateMachine);
  }
//debugger;  
  build(instance, config);
//debugger;  
  instance._fsm();
  
  SPAFORM().form.workflow.fsm = instance;
  return instance;
}

function build(target, config) {
  if ((typeof target !== 'object') || Array.isArray(target))
    throw Error('StateMachine can only be applied to objects');
  plugin.build(target, config);
  Object.defineProperties(target, PublicProperties);
  mixin(target, PublicMethods);
  mixin(target, config.methods);
  config.allTransitions().forEach(function(transition) {
    target[camelize(transition)] = function() {
      return this._fsm.fire(transition, [].slice.call(arguments))
    }
  });
  target._fsm = function() {
    this._fsm = new JSM(this, config);
    this._fsm.init(arguments);
  }
}

//-----------------------------------------------------------------------------------------------

StateMachine.version  = '3.0.1';
StateMachine.factory  = factory;
StateMachine.apply    = apply;
StateMachine.defaults = {
  wildcard: '*',
  //init: {
  //  name: 'init',
  //  from: 'none'
  //}
  init: {
    name: 'Init',//'transition_close',//'Init',
    from: 'spaf_000010newform'//,
    //to: 'spaf_000010newform'
  }
}

//===============================================================================================

// module.exports = StateMachine;
  return StateMachine;
});