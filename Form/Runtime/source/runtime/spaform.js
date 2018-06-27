/**
 * Copyright spaforms365.com
 */
;
define(['require'], function( require) {

	String.prototype.hashCode = function() {
	  var hash = 0, i, chr;
	  if (this.length === 0) return hash;
	  for (i = 0; i < this.length; i++) {
		chr   = this.charCodeAt(i);
		hash  = ((hash << 5) - hash) + chr;
		hash |= 0; // Convert to 32bit integer
	  }
	  var h = (hash >= 0) ? hash : hash * (-1);
	  return h;
	};	
	
	var getUrlParameter = function (name) {
		name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
		var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
		var results = regex.exec(location.search);
		return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
	};

	var p = require.toUrl('');
	var listUrl = p.substr(0, p.indexOf('/Form/Design'));
	var ctx = 'ctx-' + listUrl.hashCode().toString();
	var version = '_v#';
	

	//var sandbox = getUrlParameter("Sandbox");
	var design = (getUrlParameter("DisplayMode") == "Design") ? true : false;
	var itemId = getUrlParameter("ID");
	var debug = false;
	
	var initContext = function() {
if(top == null) {
	alert('top=null');
	debugger;
}
		if( !top[ctx]) { 
			
			top[ctx] = {};
			console.log('Global context ' + ctx + ' created');
			top[ctx].SPAFORM = {};
			top[ctx].SPAFORM['_'] = { 
				initialized: false, 
				contextId: ctx,
				version: version,
				urlArgs: function(id, url) {
					var args = "";
					if( debug) args = window.debugVersion;
					//if( url.indexOf('Runtime') !== -1) args = "1.0.7.7";
					else args = ctx + '-' + '_v#';

					if( args == "") return "";
					return (url.indexOf('?') === -1 ? '?' : '&') + args;	
				}
			};
			// form startup calling parameters
			top[ctx].SPAFORM.params = {
				listUrl : listUrl,
				debug: false,
				mode: 'newform', //'DispForm', 'EditForm'
				parentId: 'spaform365',
				design: design
			};
			
			// for runtime use custom context to load AMD code modules & SPAFORM object model
			if(!design) top[ctx].SPAFORM.params.contextId = ctx;
			if(itemId)  top[ctx].SPAFORM.params.itemId = itemId;
			
			top[ctx].SPAFORM.load = loadContext;
		}
		return top[ctx].SPAFORM;
	}
	
	var runtimePaths = function() {
		
		var sandbox = getUrlParameter("Sandbox");
		
		var p = top[ctx].SPAFORM.params;		
		//var d = (p.debug) ? true : false;
		//var z = ( p.debug == 'development') ? true : false;
		var d = (!p.debug) ? '../Runtime/runtime.min' : false;
		var z = (!(p.debug == 'development')) ? '../Runtime/source/designer/designer.min' : false;
		var x = (!(p.debug == 'development')) ? '../Runtime/source/designer/designer2.min' : false;

		var modulePaths = {
			jquery: 						'../Runtime/jquery-1.10.2.min',
			knockout:   					'../Runtime/knockout-3.4.0.min',
			//simplegrid:   					'../Runtime/knockout.simpleGrid.3.0',
			//layout: 						'../Runtime/layout',
			//parsley: 						'../Runtime/parsley.min',
			validation: 					(d) ? d :  '../Runtime/source/runtime/knockout.validation',
			'resize-sensor': 				'../Runtime/source/designer/ResizeSensor', //(z) ? z :  '../Runtime/source/designer/ResizeSensor',
			text: 							'../Runtime/text',
			css: 							'../Runtime/css',
			
			//cache:							(!sandbox) ? '../Runtime/source/designer/cache' : 'cache',
			cache:							(z) ? z :  '../Runtime/source/designer/cache',
			//cachetext:						'../Runtime/source/designer/cachetext',
			cachetext:						(z) ? z :  '../Runtime/source/designer/cachetext',
			designercache:					(z) ? z :  '../Runtime/source/designer/designercache',
			designercachetext:				(z) ? z :  '../Runtime/source/designer/designercachetext',
			
			//cache:				'../Runtime/source/cache',
			//cachetext:			'../Runtime/source/cachetext',
			//designercache:		'../Runtime/source/designercache',
			//designercachetext:	'../Runtime/source/designercachetext',
			
			sha1:							(z) ? z :  '../Runtime/source/designer/sha1',

			moment: 						'../Runtime/moment.min',
			json5: 							(z) ? z :  '../Runtime/source/designer/json5',
			uglify: 						'../Runtime/source/designer/uglify',
			
			'project': 						(sandbox) ? 'cache!project' : (d) ? '../Runtime/model.min' :  'project',

			
			'spaform': 						(d) ? d :  '../Runtime/source/runtime/spaform',
			'startup-runtime': 				(d) ? d :  '../Runtime/source/runtime/startup-runtime',
			'spaform-runtime': 				(d) ? d :  '../Runtime/source/runtime/spaform-runtime',
			'spaform-designer': 			(z) ? z :  '../Runtime/source/designer/spaform-designer',
			//'form2': 				'../Runtime/source/form2',
			//'form2-bundle': 				'../Runtime/source/form2-bundle',
			'form2': 						(d) ? d :  '../Runtime/source/runtime/form2',
			'form2-ko': 					(d) ? d :  '../Runtime/source/runtime/form2-ko',
			'form2-he': 					(d) ? d :  '../Runtime/source/runtime/form2-he',
			'form2-components': 			(d) ? d :  '../Runtime/source/runtime/form2-components',
			'form2-list': 					(d) ? d :  '../Runtime/source/runtime/form2-list',
			'form2-listitem': 				(d) ? d :  '../Runtime/source/runtime/form2-listitem',

			'form-loader2': 				(d) ? d :  '../Runtime/source/runtime/form-loader2',		
			'form-loader-designer': 		(x) ? x :  '../Runtime/source/designer/form-loader-designer',

			'form-loader-sandbox': 			(x) ? x :  '../Runtime/source/designer/form-loader-sandbox',
			'form-loader-proxy': 			(d) ? d :  '../Runtime/source/runtime/form-loader-proxy',
			
			'startup-designer': 			(z) ? z :  '../Runtime/source/designer/startup-designer',
			
			toolbar: 						(z) ? z :  '../Runtime/source/designer/toolbar',
			//'project':				'project',		
			
			ribbon:							(z) ? z :  '../Runtime/source/designer/ribbon',
			cookie:							(z) ? z :  '../Runtime/source/designer/js-cookie',
			
			ribbonedit:						(d) ? d :  '../Runtime/source/runtime/ribbonedit',
			'ribbon-formedit':				(d) ? d :  '../Runtime/source/runtime/ribbon-formedit',
			'ribbon-attachment':			(d) ? d :  '../Runtime/source/runtime/ribbon-attachment',
			'runtime-attachment':			(d) ? d :  '../Runtime/source/runtime/runtime-attachment',
			
			'ace/codepanel': 				(z) ? z :  '../Runtime/source/designer/codepanel',
			'ace/ribbon/codetab2': 			(z) ? z :  '../Runtime/source/designer/codepanel-ribbon',
			'ace/ribbon/codepagecomponent2':(z) ? z :  '../Runtime/source/designer/codepanel-ribbon',
			// UI Fabric css
			//fabriccss:			'../../lib/fabric',
			fabriccss:			'../../Form/Runtime/fabric.min',
			fabriccompcss:		'../../Form/Runtime/fabric.components.min',
			//fabriccomp:			'../../lib/jquery.fabric.min',
			//		fabriccomp:			'../Runtime/fabric',//'../Runtime/fabric.min',
			//		fabriccomp:			'../Runtime/jquery.fabric.min',
			fabriccomp:			'../Runtime/fabric.min',
			
			//provision: 			'provision',
			//scoped:				'../../lib/jquery.scoped',
			//EDITOR
			bootstrap:			'../../lib/grid/bootstrap.min',
			
			//grideditor:			'../../lib/grid/jquery.grideditor.bootstrap',
			grideditor:						(z) ? z :  '../Runtime/source/designer/jquery.grideditor.uifabric',
			'jqueryui':						'../Runtime/source/designer/jquery-ui',
			summernote:			'../../lib/grid/summernote.min',
			
			'beautifyhtml':					(z) ? z :  '../Runtime/source/designer/beautify-html',
			'beautify':						(z) ? z :  '../Runtime/source/designer/beautify',
			'beautify-css':					(z) ? z :  '../Runtime/source/designer/beautify-css',
			
			'jsoneditor':					'../Runtime/source/designer/jsoneditor.min', //'../Runtime/designer.min'
			'jsoneditorcss':				'../Runtime/source/designer/jsoneditor.min', //'../Runtime/designer.min'

			'ace':							'../Runtime/source/designer',
			
			//tinymce:			'../../lib/grid/tinymce.min',
			//jquerytinymce:		'../../lib/grid/jquery.tinymce.min',
			
			//CSS EDITOR
			//bootstrapcss:		'../../lib/grid/bootstrap',
			bootstrapcss:		'../../lib/grid/form.bootstrap',
			fontawesomecss:		'../../Form/Runtime/font-awesome.min',
			//grideditorcss:		'../../lib/grid/grideditor.bootstrap',
			grideditorcss:					'../../Form/Runtime/source/designer/grideditor.uifabric',
			grideditorformscss:				'../../Form/Runtime/grideditor.forms',
			//summernotecss:		'../../lib/grid/summernote.min',
			
			'octokat': 						(z) ? z :  '../Runtime/source/designer/octokat', 
			'toolbar-supportpanel':			(z) ? z :  '../Runtime/source/designer/toolbar-supportpanel',
			'toolbar-workflowpanel':		(z) ? z :  '../Runtime/source/designer/toolbar-workflowpanel',
			'toolbar-gitgrid':				(z) ? z :  '../Runtime/source/designer/toolbar-gitgrid',
			'toolbar-open':					(z) ? z :  '../Runtime/source/designer/toolbar-open',
			'toolbar-gitbuild':				'../Runtime/source/designer/toolbar-gitbuild',
			'form2-online':					(z) ? z :  '../Runtime/source/designer/form2-online',
			'form2-design':					(z) ? z :  '../Runtime/source/designer/form2-design',
			'form2-storage':				(z) ? z :  '../Runtime/source/designer/form2-storage',
			'form2-project':				(z) ? z :  '../Runtime/source/designer/form2-project',
			'form2-git':					(z) ? z :  '../Runtime/source/designer/form2-git',
			//'toolbar-columnsgrid': 		'../Runtime/toolbar-columnsgrid',
			//'toolbar-componentsgrid': 	'../Runtime/toolbar-componentsgrid',
			'toolbar-pickuppanel': 			(z) ? z :  '../Runtime/source/designer/toolbar-pickuppanel',
			'toolbar-componentspanel': 		(z) ? z :  '../Runtime/source/designer/toolbar-componentspanel',
			'toolbar-propertypanel': 		(z) ? z :  '../Runtime/source/designer/toolbar-propertypanel',
			'grid-columns': 				(z) ? z :  '../Runtime/source/designer/grid-columns',
			'grid-components': 				(z) ? z :  '../Runtime/source/designer/grid-components',
			'grid-commits': 				(z) ? z :  '../Runtime/source/designer/grid-commits',

			'processform': 					(z) ? z :  '../Runtime/source/designer/processform',
			// --- handle links
			//'filebox-apppart': 				'../Runtime/source/syscomponents/filebox-apppart',
			//'filebox-utils': 				'../Runtime/source/syscomponents/filebox-utils',
			//'filebox-handlelinks': 			'../Runtime/source/syscomponents/filebox-handlelinks',
			'jsm-states': 					(d) ? d :  '../Runtime/source/runtime/runtime.jsm.states',
			'jsm-merge': 					(d) ? d :  '../Runtime/source/runtime/runtime.jsm.merge',
			

			// --- start state machine
			'jsm': 							(d) ? d :  '../Runtime/source/runtime/runtime.jsm',
			'jsm-config': 					(d) ? d :  '../Runtime/source/runtime/runtime.jsm.config',
			'jsm-mixin': 					(d) ? d :  '../Runtime/source/runtime/runtime.jsm.mixin',
			'jsm-plugin': 					(d) ? d :  '../Runtime/source/runtime/runtime.jsm.plugin',
			'jsm-camelize': 				(d) ? d :  '../Runtime/source/runtime/runtime.jsm.camelize',
			'jsm-exception': 				(d) ? d :  '../Runtime/source/runtime/runtime.jsm.exception',
			'jsm-history': 					(d) ? d :  '../Runtime/source/runtime/runtime.jsm.history',
			'jsm-visualize': 				(d) ? d :  '../Runtime/source/runtime/runtime.jsm.visualize',
			'jsm-statemachine': 			(d) ? d :  '../Runtime/source/runtime/runtime.jsm.app',
			'cytoscape': 					'../Runtime/source/designer/cytoscape.min',
			'cytoscape-cxtmenu': 			'../Runtime/source/designer/cytoscape-cxtmenu',
			'cytoscape-edgehandles': 		'../Runtime/source/designer/cytoscape-edgehandles',
			'cytoscape-context-menus': 		'../Runtime/source/designer/cytoscape-context-menus',
			'cytoscape-panzoom': 			'../Runtime/source/designer/cytoscape-panzoom',
			// --- stop state machine
			'javascript-obfuscator': 		'../Runtime/source/designer/index.browser',

			empty: 				'../Runtime/source/syscomponents/empty'//,   // new component template
		};
		return modulePaths;
	};
	
	var loadContext = function(params) {
		
		if( top[ctx].SPAFORM['_'].initialized) {
			top[ctx].SPAFORM.destroy();
			initContext();
		}
		
		//save startup params
		var p = top[ctx].SPAFORM.params;
		if( params.debug) p.debug = params.debug;
		if( params.design) p.design = (design) ? true : params.design;
		if( params.parentId) p.parentId = params.parentId.toString();
		if( params.itemId) p.itemId = params.itemId.toString();
		if( params.mode) p.mode = params.mode.toString().toLowerCase();
		if( params.onCloseCallback) p.onCloseCallback = params.onCloseCallback;
		if( params.command) p.command = params.command.toString().toLowerCase();
		
		if( p.debug) debug = true;
		// 'fixed' debug label
		if( debug) {
			var label = (typeof(p.debug) === "boolean") ? "DEBUG" : p.debug.toUpperCase();
			document.getElementById(p.parentId).insertAdjacentHTML('beforebegin', '<div style="position:fixed;top:5px;left:12px;color:red;z-index:100000;font-weight:bold;font-size:16px;background-color:white;">'+label+'</div>');
		}
		//run initialization module to setup SPAFORM
		var config = {
			baseUrl: p.listUrl + '/Form/Design',
			paths: runtimePaths(),
			urlArgs: top[ctx].SPAFORM['_'].urlArgs				
		};
		
		if( p.design || p.debug) delete p.contextId;
		if( p.contextId) config.context = p.contextId; //otherwise use default '_' context.
		
		top[ctx].SPAFORM['_'].requireConfig = config;
		
		var _require = requirejs.config(config);

		if(params.mode == 'installer') {
			top.SPAFORM = top[ctx].SPAFORM;
			p.design = true;
		}

		_require(['startup-runtime'], function( startup_runtime) {
			startup_runtime(params);
			top[ctx].SPAFORM['_'].initialized = true;
		});
		
		return 0;
	};
		
	return function() {
		var SPAFORM = initContext();
		if( design) top.SPAFORM = SPAFORM;
		return SPAFORM; 
	};
});