define(["require", "form2", "spaform"], function(require, RUNTIME, SPAFORM ) {

	/**
	 * SPAFORM runtime PRIVATE methods to manage COMPONENTS
	 */	
	(function(){				
		/**
		 * COMPONENTS HELPERS
		 */
		this.$getSchemaData = function (schema) {
			var result = {};
			for( var key in schema) {
				if( key === 'Params') {
					var params = {};
					for( var name in schema.Params) {
						if( this._checkType( schema.Params == 'Object')) {
							params[name] = JSON.parse(JSON.stringify(schema.Params.defaultname));
						}
						else params[name] = JSON.parse(JSON.stringify(schema.Params[name]));
					}
					result[key] = params;
				}
				else result[key] = JSON.parse(JSON.stringify(schema[key]));
			}
			return result;
		};
		this.$getSchemaTemplate = function (schema) {
			var result = {};
			for( var key in schema) {
				if( key === 'Params') {
					var params = {};
					for( var name in schema.Params) {
						if( this._checkType( schema.Params == 'Object')) {
							params[name] = JSON.parse(JSON.stringify(schema.Params.defaultname));
						}
					}
					result[key] = params;
				}
			}
		};
/*		
		this.$getColumnsFromTemplate = function( templateHTML) { 
			var self = this;
			var rs = SPAFORM().form.registeredSchemas;

			var design = (top.getUrlParameter("DisplayMode") == "Design") ? true : false;	
			if(!design)	{ // for runtime use columns from project.js
				console.log("offset: +" + (Date.now() - top.startTime)+" - form2.js $getColumnsFromTemplate - bypass");
				self._modelColumns = SPAFORM().form.columns;
				return; 
			}

			var mk = ko.utils.parseHtmlFragment(templateHTML);
//debugger;			

			var columns = {};
			
			var tagsList = 'component-observable2';
			for( var key in rs) {
				if( rs[key].Connections && rs[key].Connections.ListItem) {
					if( rs[key].Markup.tag != 'component-observable2') tagsList = tagsList + ', ' + rs[key].Markup.tag
				}
			}
			
			var template = $(mk);
			template.find(tagsList).each(function() {
				var params = $(this).attr('params').toString().split(',');
				for( i=0; i < params.length; i++) {
					var param = params[i].split(':');
					if( param[0].trim() == "'InternalName'") { 
						var intName = param[1].trim().split("'").join("").split('"').join("");
						columns[intName] = "";
						console.log("offset: +" + (Date.now() - top.startTime)+" - form2.js $getColumnsFromTemplate column: "  + intName);						
						break;
					}
				}
			});
			for( var key in columns) {
				self._modelColumns[key] = columns[key];
				SPAFORM().form.columns[key] = columns[key];
			};
		};
*/				
		this.$extendComponentSchema = function(schema) {
			var d = $.Deferred();
			var c = SPAFORM().components;		
			
			//var self = this;
//console.log('<---- EXTEND COMPONENT SCHEMA ' + schema.Require.name + ' ---->');
// if( SPAFORM().params.mode == 'installer') {
// 	debugger;
// 	var p = require.toUrl(schema.Require.name);
// }
//console.log('form2-component.js:92 $extendComponentSchema ----> require url = ' + require.toUrl(schema.Require.name) + ' ');
			require([schema.Require.name], function(compname) {
				try {			
					// some legacy just-in-case: if not standard returned object from viewModel constructor
					//var v = ( compname.viewModel) ?	new compname.viewModel({}) : new compname({});
					var v = compname['viewModel'].prototype;
					//var s = o.schema;
					//var v = ( compname.viewModel) ?	compname.viewModel.schema : compname.schema;
					// reading schema params of the component
					var schema2 = (v.schema == undefined) ? {} : v.schema; 
					var params = (schema2.Params == undefined) ? {} : schema2.Params;
					// populate params with metadata from SharePoint
					var datasource  = (schema2.Connections == undefined) ? {} : schema2.Connections;
					if( datasource.ListItem) schema.Connections = datasource;
					schema.Params = params;
					if(schema2.Permalink) schema.Permalink = schema2.Permalink;
					
					var extendedSchema = JSON.parse( JSON.stringify( schema));
					c.registered[schema.Require.name] = extendedSchema;//().push(extendedSchema);
				
					if( (extendedSchema.ContentTypeId == undefined) && (extendedSchema.Require.name != 'toolbar') && (extendedSchema.Require.name != 'blank')  && (extendedSchema.Require.name != 'layout')) {	

						c.design.push( extendedSchema);
						if( (extendedSchema.Connections === undefined) || (extendedSchema.Connections.ListItem === undefined)) {
							//self.$panelComponents().push(extendedSchema);
							c.panel().push(extendedSchema);
						}
					}
					SPAFORM().form.registeredSchemas[schema.Require.name.toLowerCase()] = extendedSchema;
				} catch(e) { 
					console.log(e.message);
				};
				d.resolve();				
			}, function(err) {
				console.log("$extendComponentSchema2 ERROR = " + err);								
			});
			return d.promise();
		};

		// called from _formInit4:
		// - registers all components with ko
		// - if debug --> extends each component's schema		
		this.$registerComponents = function(registeredComponents) {
			var d = $.Deferred();
			var self = this;
//debugger;	
			var c = SPAFORM().components;		
			var f = SPAFORM().form;
			var p = SPAFORM().params;
//debugger;
console.log('WARNING !! - form2-components.js:139 MOVE TO DESIGNER: SPAFORM().components');	
			if(c) {
				c.registered = {};//.removeAll();
				c.panel.removeAll();
				c.design.removeAll();
			}
			
			var requests = [];
debugger;
			registeredComponents.forEach(function(schema, i) {
//console.log("$registerComponents push = " + schema.Require.name);
//console.log("offset: +" + (Date.now() - top.startTime)+" - form2.js $registerComponents: "  + schema.Require.name);	
console.log('WARNING !! - form2-components.js:148 MOVE (OVERRIDE) TO DESIGNER: run $extendComponentSchema and fill out designercache');			
				// if(p.design && p.mode != 'installer') {
				// 	requests.push( self.$extendComponentSchema(schema));
				// }
				if(p.design) requests.push( self.$extendComponentSchema(schema));
// if( p.mode == 'installer' && schema.Require.name == 'textbox')	{
// 	requests.push( self.$extendComponentSchema(schema));
// }
				if( schema.Markup && schema.Markup.tag) {
					if( f.startupComponentSchema && (schema.Markup.tag == f.startupComponentSchema.Markup.tag)) { // layout component
						// register startup-by-content-type component as component-form.
						if(ko.components.isRegistered('component-form')) ko.components.unregister('component-form');
						ko.components.register('component-form', { require: schema.Require.name });
					} 
					else if(ko.components.isRegistered(schema.Markup.tag) == false) { 
							ko.components.register(schema.Markup.tag, { require: schema.Require.name });
					}
				}			
			});

			if(requests.length == 0) return d.resolve();
//debugger;			
			$.when.apply($, requests).done( function() {
//debugger;	
				d.resolve();				
			});			
			return d.promise();
		};
		this.$registerWorkflowStateComponent = function(registeredComponents) {

			if(ko.components.isRegistered('component-fsm')) ko.components.unregister('component-fsm');
			ko.components.register('component-fsm', { require: schema.Require.name });

		}
		/**
		 * COMPONENTS LOADERS
		 */
		var $setComponentContext = function( params) {
			var context = (params.parentContext) ? params.parentContext() : null;
			if( context) {
				context.spaform = SPAFORM();
			}
			/*
			if( params.context) {	
				var id = params.context;//'478d6639-24ac-a181-c6cf-fbaee4692810';
				var node = document.getElementById(id);
				if(node) {
					params.context = ko.contextFor(node);
			debugger;						
					params.context.spaform = SPAFORM();
//					params.context.$children = ko.observableArray();
//					params.context.id = id;
//					ko.storedBindingContextForNode(node, params.context);
					//var data = ko.dataFor(element);		 
					//var p5 = ko.contextFor(node);
					return id;
				}
			}
			return null;
			*/
		}
		this.$formsDefaultLoader = {
			/*
			'getConfig': function( name, callback) {
	//debugger;			
				callback(null);
			},
			'loadComponent': function( name, componentConfig, callback) {
	debugger;
				//callback(null);
				//ko.components.defaultLoader.loadComponent( name, componentConfig, callback);
			},
			*/
			'loadTemplate': function( name, templateConfig, callback) {
//console.log("offset: +" + (Date.now() - top.startTime)+" - form2.js 3. $formsDefaultLoader loadTemplate: "  + name);
				if( name == 'component-form') {
/*					
					// design time only: capture columns to inject into viewMode 					
					window.frm.$getColumnsFromTemplate(templateConfig); // for runtime got columns from project.js
*/					
					ko.components.defaultLoader.loadTemplate( name, templateConfig, callback);
				}
				else {
					callback(null);
				}
			},
			'loadViewModel': function( name, viewModelConfig, callback) {
				
//console.log("offset: +" + (Date.now() - top.startTime)+" - form2.js 3. $formsDefaultLoader loadViewModel: "  + name);		
				if( name == 'component-form') {
//debugger;		
// works !!			
//var element = document.getElementById("myform");
//var context = ko.contextFor(element);
//var data = ko.dataFor(element);
					
					// injecting columns into viewModel
//					window.frm.injectColumns2LayoutViewModelPrototype( viewModelConfig);
					//ko.components.defaultLoader.loadViewModel( name, viewModelConfig, callback);
					if (typeof viewModelConfig === 'function') {
						// Constructor - convert to standard factory function format
						// By design, this does *not* supply componentInfo to the constructor, as the intent is that
						// componentInfo contains non-viewmodel data (e.g., the component's element) that should only
						// be used in factory functions, not viewmodel constructors.
						callback(function (params /*, componentInfo */) {
//debugger;
							$setComponentContext( params);
/*								
if( params.context) {	
debugger;						
	var id = params.context;//'478d6639-24ac-a181-c6cf-fbaee4692810';
	var node = document.getElementById(id);
	if(node) {
		params.context = ko.contextFor(node);
		params.context.spaform = SPAFORM();
		params.context.$children = ko.observableArray();
		params.context.id = id;
		ko.storedBindingContextForNode(node, params.context);
		//var data = ko.dataFor(element);		 
		var p5 = ko.contextFor(node);
	}
}
*/

//viewModelConfig.prototype.context = params.context;
var model = new viewModelConfig(params);
//model.prototype.context = params.context;					
							return model;
						});
					} else {
						ko.components.defaultLoader.loadViewModel( name, viewModelConfig, callback);
					}
					
				}
				else {
//debugger;					
//					window.frm.injectHelpers2CompViewModelPrototype( viewModelConfig);
					
					if( !SPAFORM().form.crossdomain) {
						var displayMode = JSRequest.QueryString["DisplayMode"];
						if( displayMode == "Design") {
							require(["form2-design"], function() {
//debugger;								
								//SPAFORM()['_'].designer.captureComponentColumns( viewModelConfig);
								//SPAFORM()['_'].designer.ensureFormWorkflow( viewModelConfig);
								SPAFORM().runtime.captureComponentColumns( viewModelConfig);
								SPAFORM().runtime.ensureFormWorkflow( viewModelConfig);
							});							
						};
					};
					
					
					//ko.components.defaultLoader.loadViewModel( name, viewModelConfig, callback);
					if (typeof viewModelConfig === 'function') {
						// Constructor - convert to standard factory function format
						// By design, this does *not* supply componentInfo to the constructor, as the intent is that
						// componentInfo contains non-viewmodel data (e.g., the component's element) that should only
						// be used in factory functions, not viewmodel constructors.
						callback(function (params /*, componentInfo */) {
							$setComponentContext( params);
							
/*								
if( params.context) {	
debugger;						
	var id = params.context;//'478d6639-24ac-a181-c6cf-fbaee4692810';
	var element = document.getElementById(id);
	if(element) {
		params.context = ko.contextFor(element);
		params.context.spaform = SPAFORM();
		params.context.$children = ko.observableArray();
		params.context.id = id;
		//var data = ko.dataFor(element);		 
	}
}
*/
//debugger;
var model = new viewModelConfig(params);
//model.context = params.context;	
//if( params.context.$parent.context && params.context.$parent.context.$children) {
//	params.context.$parent.context.$children.push( params.context);				
//};
							return model;
						});
					} else {
						ko.components.defaultLoader.loadViewModel( name, viewModelConfig, callback);
					}
					
				}
			}
		}
		
		ko.components.loaders.unshift(this.$formsDefaultLoader);
		
		
	}).call(RUNTIME.viewModel.prototype);
	
});
