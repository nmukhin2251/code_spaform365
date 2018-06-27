// Recommended AMD module pattern for a Knockout component that:
//  - Can be referenced with just a single 'require' declaration
//  - Can be included in a bundle using the r.js optimizer
//define(['text!./transition_close.xml', 'jsm-camelize'], function( htmlString, camelize) {
define(['text!./transition_close.xml'], function( htmlString) {	
	
	/**
	 * COMPONENT VIEWMODEL CONSTRUCTOR
	 */
	function transition_close( params) { 
//debugger;
		var _this = this;

		this.visible = (typeof params.visible === 'function') ? params.visible : ko.observable(params.visible);

		// spaform - object model root
		var spaform = params.parentContext().spaform;	

		var f = spaform.form;

		var namespace = (typeof params.namespace == 'function') ? params.namespace() : params.namespace;
		var component = 'transition_close';
		var id = params.InternalName;

		var from = (typeof params.from == 'function') ? params.from() : params.from;
		var to = (typeof params.to == 'function') ? params.to() : params.to;

		var conditional = (to == '*') ? true : false;

		var close = function(){ return (component == ('transitio'+'n_close'))};
		
		var prms = JSON.parse(JSON.stringify(params));
		delete prms.$raw;
		

		var runtime = spaform.runtime;
		this.readonly = runtime.dataContext(namespace).readonly;//spaform.form.readonly;
		this.designmode = runtime.designMode; 

		this.title = ko.observable(params.Title);

		spaform.form.closeOnClick = params.closeonclick;
		

// 		/**
// 		 * Option 1: asynchronous callback
// 		 * 
// 		 * var d = $.Deferred();
// 		 * return d.promise();
// 		 * 
// 		 * Option 2: synchronous callback to cancel transition_close.
// 		 * 			 all subsequent lifecycle events will be cancelled and the state will remain unchanged.
// 		 * return false;
// 		 * 
// 		 * Option 3: synchronous callback to continue transition_close processing
// 		 * return true;
// 		 */
		var onBeforeClick = function(lifecycle) {

			console.log('onBefore: ' + component );

			return true; // false - to cancel transition_close
		};
		var onAfterClick = function(lifecycle) {

			console.log('onAfter: ' + component );

		};
		var targetState = function(sourceState) {
			// calculate condition and return name of desired state instead of params.to
			// ...
			// default returned state:  params.to
			return sourceState;//params.to;
		};

		f.workflow.fsm.append({
			'name'			: id, 
			'fromId'		: from,   	
			'toId'			: (conditional) ? function(n) { return targetState(n); } : to,
			'info'		   	: { id: id, label: this.title(), component: component, 'stateComponentId': params.stateComponentId, 'params': prms },				 
			'onBeforeClick'	: onBeforeClick,
			'onAfterClick' 	: onAfterClick
		});

		this.fix = ko.observable(0);
		setInterval(function(){ _this.fix(Date.now()); 	},500);

		this.valid = ko.computed( function() {
			if(close()) return "";
			if( spaform.runtime && typeof spaform.runtime.dataContext == 'function' ) {
				var result = (_this.fix()) ? spaform.runtime.dataContext(namespace).vGroup.isValid() : false;
				return (result) ? "" : "is-disabled";
			};
			return "is-disabled";
		}, this);
		
		/**
		 * --> TRANSITION
		 */ 

        this.click = function () {
			f.workflow.fsm[f.workflow.fsm.camelize(id)](f.state()); // trigger transition_close execution;
		};
		
        this.show = ko.computed(function () {

			var inState = ((f.state() == from) || (from == '*'));
			var tick = (_this.fix()) ? true : false;

			if( tick && close() && inState) return true;
			if(!f.workflow.fsm) return false;
	
			return tick && inState && !this.readonly() && f.workflow.fsm.can(id);
		}, this);
		
		window.setTimeout( function() { RefreshCommandUI();   }, 100);

	};
	
    // Use prototype to declare any public methods
    //componenttransition_close.prototype.doSomething = function() { ... };
	transition_close.prototype.schema = {
		"Params": {
			"namespace": "listItem",
			"visible": true,
			"Title": "transition_close",
			"from": "New Form",
			"to": "New Form",
			"closeonclick": false		
		},
		"Permalink": "https://spaforms365.com/docs/syslib-transitio"+"n/"
	};

    // Return component definition
    return { viewModel: transition_close, template: htmlString };
});


 //@ sourceURL=transition_close