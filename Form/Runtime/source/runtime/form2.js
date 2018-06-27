define([ 'require', 'spaform', 'knockout','text!./../Runtime/source/runtime/form2.html', 'text!./../Runtime/source/runtime/knockout.validation.min.css', 'validation'], function( require, SPAFORM, ko, htmlString, cssValidationString) {
//debugger;
	/*,'moment','./../Runtime/ko.types.debug'*/

	/**
	 * COMPONENT VIEWMODEL CONSTRUCTOR
	 */
	function runtime(params) {
		var self = this;

		var spaform = SPAFORM();//params.parentContext().spaform;	
		var f = spaform.form;
		//var l = spaform.list;

		this.contentTypeTitle = ko.observable("");
		this.showMainForm = ko.observable(true);
		// ini finite state machine
		

		this._formColumns = {}; 		// collection of references on SharePoint column components; added by each component;

								
		// Private properties

		//this._formVersion = "v1.0.0.0";



		//this._formModerationStatus = ko.observable(3);
		//this._formModerationComments = ko.observable("");
				
		this.designMode = ko.observable(false);
		this.designMode.subscribe( function( mode) {

			if(SPAFORM() && SPAFORM().buffer) SPAFORM().buffer.grid = mode;

			self.designMode(mode);
			self._formEnsureToolbar();
		});
		
		this._formEnsureToolbar = function() {
//debugger;	
			var self = this;
			if( self.$isSandbox	) { var d = $.Deferred(); return d.resolve(); };
			return self.$formEnsureToolbar(self);
		};
		this.$formEnsureToolbar = function(callback) {
			var d = $.Deferred();
console.log('form2.js:47 WARNING -  MOVE this.$formEnsureToolbar to DESIGNER !!!');			
			var self = this;
//debugger;			
			if( self.Toolbar === undefined) {	
//debugger;			
				require( ["toolbar"], function(tb) {
						var params = {};
						self.Toolbar = new tb.viewModel(params);
//debugger;						
						if(SPAFORM().form && SPAFORM().form.runtime()) SPAFORM().form.runtime().Toolbar = self.Toolbar;

						SPAFORM()['_'].designer.Toolbar = self.Toolbar;
//debugger;					
						self.Toolbar.Init(self);
						if(self.$ribbon) {
//debugger;							
							self.$ribbon.Toolbar = self.Toolbar;
							RefreshCommandUI();
						}
						d.resolve(self.Toolbar);
						if( typeof callback === 'function')  callback();
					//}
				});
				return d.promise();
			}
			else
				SPAFORM().form.runtime().Toolbar = self.Toolbar;
			if( typeof callback === 'function')  callback();	
			return d.resolve(self.Toolbar);
		};
		
		
		this._formGetGuid = function () {
			function s4() {
			  return Math.floor((1 + Math.random()) * 0x10000)
				.toString(16)
				.substring(1);
			}
			return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
			s4() + '-' + s4() + s4() + s4();
		}

		window.frm = this;	

		// called from listener defined in form-loader2
		this.formListener = function( eventName, formData, ID) {
			var r = SPAFORM().runtime;
			switch( eventName) {
				//case 'formInitialized': 		r._formInitialized(formData, ID); break;
				case 'formLoaded':				r._formLoaded(formData, ID); break;
				case 'formAttachmentUploaded':	r._formAttachmentUploaded(formData, ID); break;
				case 'formSaved':				r._formSaved(formData, ID); break;
				case 'formDeleted':				r._formDeleted(formData, ID); break;
				case 'formEmailSendDone':		r._formEmailSended(formData, eventName); break;
				case 'formPeopleQueryDone':		r._formPeopleQueryDone(formData, ID); break;
				case 'formLookupQueryDone':		r._formLookupQueryDone(formData, ID); break;
				case 'formFieldsQueryDone':		r._formFieldsQueryDone(formData); break;
				default:			return false;
			}
		};
		
		
		var form = this;
				// used only for _formDeleted method above
				form["_formInitFormData"] = function() {
//debugger;					
					//
//					if( this.callback_InitFormData != undefined ) this.callback_InitFormData();
				};
				
				// SharePoint List Item Type
				// https://abstractspaces.wordpress.com/2008/05/07/sharepoint-column-names-internal-name-mappings-for-non-alphabet/
/*				
				form["_hexify"] = function( inp) {
					var name = inp.split(' ').join('_x0020_');
					name = name.split('~').join('_x007e_');
					name = name.split('!').join('_x0021_');
					name = name.split('@').join('_x0040_');
					name = name.split('#').join('_x0023_');
					name = name.split('$').join('_x0024_');
					name = name.split('%').join('_x0025_');
					name = name.split('^').join('_x005e_');
					name = name.split('&').join('_x0026_');
					name = name.split('*').join('_x002a_');
					name = name.split('(').join('_x0028_');
					name = name.split(')').join('_x0029_');
					name = name.split('+').join('_x002b_');
					name = name.split('-').join('_x002d_');
					name = name.split('=').join('_x003d_');
					name = name.split('{').join('_x007b_');
					name = name.split('}').join('_x002d_');
					name = name.split(':').join('_x003a_');
					name = name.split('"').join('_x0022_');
					name = name.split('|').join('_x007c_');
					name = name.split(';').join('_x003b_');
					name = name.split("'").join('_x0027_');
					name = name.split("<").join('_x003c_');
					name = name.split('>').join('_x003e_');
					name = name.split('?').join('_x003f_');
					name = name.split(',').join('_x002c_');
					name = name.split('.').join('_x002e_');
					return name;
				};
*/				
/*				
				// Proxy method:  initialize list item
				form["_formInitialize"] = function () {
					var l = SPAFORM().list;
					l.proxy.postMessage(JSON.stringify(["formInitialize", "", l.name, l.item.id]), "*"); 
				};
*/				
				/**
				 * LOAD STYLESHEET FOR THIS COMPONENT CLASS
				 */
				form["$validationCSS"] = "";
				form["$loadCSS"] = function(css) {
					var node = document.createElement('style');
					document.body.appendChild(node);
					node.innerHTML = css;
				};	
/*
				// Proxy callback
				form["_formInitialized"] = function(formData) {

					var self = this;
					var f = SPAFORM().form;
					var l = SPAFORM().list;

					// l.enableModeration = formData.EnableModeration;

					// if (!l.enableModeration) f.moderationMode(f.moderationModeLevel.DISABLED);
					
					// useless ?
					// this._formInitButtons();


					self.$loadCSS(cssValidationString);
//debugger;
//-------------------------------------------------------------------------------------------------
// not use, bacause data already loaded at form-loader2.js
					// if(!f.new()) {
					// 	if( !l.item['_'].data()) {
					// 		self._formLoad().done(function (formData, ID) {
					// 			return $.Deferred().resolve(formData, ID);
					// 		}).done(function (formData, ID) {
					// 			f.ready(true);
					// 		});	
					// 	} else
					// 		//self._formLoadModelData(l.item['_'].data());
					// 		f.ready(true);		
					// } else
					// 	f.ready(true);
//-------------------------------------------------------------------------------------------------


				};
*/				
				self.$loadCSS(cssValidationString);
				SPAFORM().form.ready(true); // use for what ?


				// Form buttons: visibility & click event handlers
				// form["_formInitButtons"] = function () {
				// 	var self = this;
				// 	// self._formModerationState = ko.computed(function () {
				// 	// 	if (!SPAFORM().list.enableModeration) return "Approved";
				// 	// 	switch (self._formModerationStatus()) {
				// 	// 		case 0: return "Approved";
				// 	// 		case 1: return "Rejected";
				// 	// 		case 2: return "Pending";
				// 	// 		case 3: return "Draft";
				// 	// 		case 4: return "Scheduled";
				// 	// 	}
				// 	// });
				// };   
	}
	
	/**
	 * COMPONENT VIEWMODEL METHODS
	 */
	(function(){

		// var self = this; ---> too early "this"

		//http://stackoverflow.com/questions/11182924/how-to-check-if-javascript-object-is-json
		this._checkType = function( object) {
			var stringConstructor = "test".constructor;
			var arrayConstructor = [].constructor;
			var objectConstructor = {}.constructor;
			if (object === null) { 									return "null";
			} else if (object === undefined) {						return "undefined";
			} else if (object.constructor === stringConstructor) {	return "String";
			} else if (object.constructor === arrayConstructor) {	return "Array";
			} else if (object.constructor === objectConstructor) {	return "Object";
			} else {												return "don't know";
			};
		};
		
		this._formInit = function (formConfig) {

			var self = this;
			require(["form2-ko", "form2-components", "form2-list", "form2-listitem", "jsm-states"], function(f2ko) { 

				self.ko = f2ko;
//debugger;				
				

				self.$initializeIList(SPAFORM());
				self.$initializeIListItem(SPAFORM());



				if(SPAFORM().list.item['_'].data()) {
					var formData = SPAFORM().list.item['_'].data();

					this.__formDataResults = formData; // JSON
					SPAFORM().list.item['_'].load(formData);	
				}

				var f = SPAFORM().form;
				//initialize finine state machine
				f['_'].initfsm();
								
						

				console.log("offset: +" + (Date.now() - top.startTime)+'****************** _formInit ****************** '); 
					
							self.__formDataResults = undefined; // avoid caching in search context
				//debugger;
				self.$isSandbox = (formConfig.isSandbox) ? true : false;
				self.$sandboxReady = (formConfig.sandboxReady) ? true : false;
				//debugger;
				if(self.$isSandbox) { 
					f.$runtime = self;
					f.$design.$sandboxReady = true;
				}
				else {
					f.$design = self;
					if( !self.$sandboxReady) f.$runtime = self;

					var displayMode = (!f.crossdomain) ? JSRequest.QueryString["DisplayMode"] : "Runtime";
					self.$sandboxReady = (displayMode !== "Design") ? false : true;
				}

				if(ko.validation) {
					ko.validation.init({
						messagesOnModified: false,
						//parseInputAttributes: true,  //use html5 validation attributes
						decorateInputElement: true,		// assign error class to <input> tag when property is invalid
						decorateElementOnModified: false,
						errorsAsTitle: true,		// show error messages as tooltips in title field
						insertMessages: true		// insert span with error message
					}, true);							
				};
				
				//if( ko.types) {
					//debugger;
				//}
//debugger; //_formVersion ???
console.log('#### form2.js:309 VERSION UNDEFINED !!!');
				self._formVersion = formConfig.version;
			
				
				if( window.f_toolbar) self.Toolbar = window.f_toolbar;
	//debugger;			
							
				if( f.crossdomain) {
					f.editMode(!( SPAFORM().params.mode == "dispform"));
				}
				else {
					JSRequest.EnsureSetup();
					var pageName = JSRequest.FileName; // Only EditForm or NewForm enabled for editing
					var editPage = (pageName == "EditForm.aspx") || (pageName == "NewForm.aspx" || (pageName == "model.sandbox.aspx"));
					f.editMode(editPage);						
				}

				
				self.$formConfig = formConfig;
//debugger;
console.log('#### form2.js:352 MOVE INSTALLER CODE TO DESIGNER');
if( SPAFORM().params.mode == 'installer') {

	SPAFORM().params.design = true;
	self.$isSandbox = false;
}
				if( SPAFORM().params.design && !self.$isSandbox) {
					require(["form2-project"], function() { 
						self.openDesignProject(formConfig);
					});
				}
				else 
					self.openRuntimeProject(formConfig);
			});
		};
		
		this.checkConfig = function(p_config) {
			var f = SPAFORM().form;
			var l = SPAFORM().list;
			var isConfigValid = (p_config.components && (p_config.components.length > 0) ) ? true : false;
			if( isConfigValid) {
				var isFormComponentValid = false;
				if(l.contentTypeId) {
					var defaultComponent = null;
					for( var i = 0; i < p_config.components.length; i++) {
						var o = p_config.components[i];
						if( o.hasOwnProperty('ContentTypeId')) {
							if( o['ContentTypeId'] == null) defaultComponent = o;
							if( o['ContentTypeId'] == l.contentTypeId) {
								isFormComponentValid = true;
								p_config.startupComponent = o;
								f.startupComponentSchema =  o;
							}
						}
						// --
						var key = (o.Id) ? o.Id : o.Title;
						f.projectComponents[key] = o;
					};
					if( !isFormComponentValid && defaultComponent) {
						isFormComponentValid = true;
						p_config.startupComponent = defaultComponent;
						f.startupComponentSchema =  defaultComponent;
					}
				}
				else { //use first component in project with existing property ContentTypeId
					for( var i = 0; i < p_config.components.length; i++) {
						var o = p_config.components[i];
						if(o && o.hasOwnProperty('ContentTypeId')) {
							if( !isFormComponentValid) {
								isFormComponentValid = true;
								p_config.startupComponent = o;
								f.startupComponentSchema =  o;
							}
						}
						// --
						var key = (o.Id) ? o.Id : o.Title;
						f.projectComponents[key] = o;
					};
				}
			};
			this.contentTypeTitle((f.startupComponentSchema) ? f.startupComponentSchema.Title.toUpperCase() : "");
			return ( !isConfigValid || !isFormComponentValid) ? null : p_config;
		};
		
		this.openRuntimeProject = function(formConfig) {
			var self = this;
			
						
			var el = document.getElementById('projectError');
			if( el) el.innerHTML = '';
			/**
			 * 
			 * project.js requested from SharePoint Design folder to check timestamp and compare with stored in localStorage
			 * that should allow re-initialize cache if SharePoint folder has been updated outside.
			 */	
						
			var project = (self.$isSandbox)	? 'cache!project' : 'project';

			require([project/*, "jsm-states"*/], function(cfg) { //'form2-components',
							
				if(!cfg) {	// IE returns cfg == undefined; but Chrome calls error callback.			
					self._loadRibbonsOnError(formConfig);
					return;
				}

				try {
					/**
					 * project.js file extracted.
					 */
					var p_config = JSON.parse(cfg);
					/**
					 * validate project.js
					 */
					
					if(( p_config = self.checkConfig(p_config )) == null) { // if no viewmodel in project

						formConfig.noviewmodel = true;
						self._loadRibbonsOnError(formConfig);
						return;					
					}

					var f = SPAFORM().form;
					//f.version.server = p_config.listProductVersion;					
					f.columns = p_config.columns;
//debugger;
					p_config.requireConfig = {};
					p_config.requireConfig.paths = {};
//debugger;
					//var design = (top.getUrlParameter("DisplayMode") == "Design") ? true : false;
					if( self.$isSandbox || (!self.$isSandbox && !SPAFORM().params.design)) {
//debugger;						
						// no custom components from proxy expected - will build it shortly from project.js
						formConfig.customComponents = [];
// ? - that sycle can be precompiled for prod ?
						p_config.components.forEach( function( comp) {
							// -- need improve: 
							p_config.requireConfig.paths[comp.Require.name] = comp.Require.path;
							var cmp = JSON.parse( JSON.stringify(comp));
							formConfig.registeredComponents.push(cmp);
							formConfig.customComponents.push(cmp);
						});
						// ---> done in _formInit4 later... top.SPAFORM.components.custom(formConfig.customComponents);
					}
//debugger;
					if( SPAFORM().params.contextId) p_config.requireConfig.context = SPAFORM().params.contextId;
					
					requirejs.config( p_config.requireConfig);

					if( !self.$isSandbox) {
						/**
						 * PURE RUNTIME
						 */												
						//self._loadRibbons(formConfig, p_config).done(function() {
						self._loadRuntimeRibbons(formConfig, p_config).done(function() {
							self._formInit4(formConfig,  function() {self._formInit2();});	
						});
						// delay to don't compete for CPU during main form load
					}
					else { 
						/**
						 * SAND BOX - don't need ribbon
						 */												
						require(["form2-design"], function() {
							self._formInit4(formConfig, function() {self._formInit2();});
						});
					}
				}
				catch(e) {
//debugger;					
					self._projectError(formConfig, e);
					self._loadRibbons(formConfig);
				}
			
			}, function(err){
				// error - project was not loaded
//debugger;				
				self._loadRibbonsOnError(formConfig);
			});

		};
		
		this._loadRibbonsOnError = function(formConfig) {
			var self = this;
			this._projectError(formConfig);
			formConfig.error = true;
			var f_callback = function() {
							//self.Toolbar.actionFormsCommandGrid( dm);


					// setTimeout(function(){
					// 	self.openBlankProject();
					// },2000);
					//debugger;
					var callback = (formConfig.design_no_project) ? function() { SPAFORM()['_'].designer.openBlankProject(); 
					debugger;							
												var p = SPAFORM().params;							
												if( p.mode == 'installer') {
													debugger;								
													if(typeof p.onCloseCallback === 'function') p.onCloseCallback(SPAFORM().list, formConfig);
													return;
												}																
											} : null;
											//openAllColumnsProject();
											delete formConfig.design_no_project;
					
					
											self._formInit4(formConfig, callback); //null);
											RefreshCommandUI();  
					
			}
			this._loadRibbons(formConfig).done(function(){
				delete formConfig.error;
				setTimeout(function () { 
					//self._formEnsureToolbar().done(function(tb) {
					if(SPAFORM()['_'].designer) {
						SPAFORM()['_'].designer._formEnsureToolbar().done(function(tb) {
							f_callback();
						});
					}
				}, 100);					
			});
		};
		
		this._projectError = function(formConfig, e) {
			var self = this;
			var f = SPAFORM().form;
			var image365x160x160 = 'data:image/png;base64,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';
			var design = (top.getUrlParameter("DisplayMode") == "Design") ? true : false;

			if(e) {
				f.errorPanel( true, 'Form/Design/project.js - ' + e);				
			}
			//f.isProjectValid = true;
			else if(formConfig && formConfig.noviewmodel && design) {
				top.openComponents = function() {
					//self.Toolbar.panelOpenGITPanel();
					self.Toolbar.actionFormsCommandComponents();
				};				
				f.errorPanel( true, "\
				<div style='padding-left:50px; width:99%; margin: 0 auto;'>\
					<br>\
					<br>\
					<h1>Project has no layout for this content type,</h1>\
					<h1><a href='javascript:void(0);' onclick='top.openComponents();'>add layout component for content type</a></h1>\
					<br>\
				</div>");
			}
			else if(formConfig && formConfig.noviewmodel && !design) {
				var addr = window.location.href + "&DisplayMode=Design";
//					<img id='spaform160' src='Form/Runtime/365x160x160.png' height='160' width='160'>\				
				f.errorPanel( true, "\
				<div style='padding-left:50px; width:99%; margin: 0 auto;'>\
					<img id='spaform160' height='160' width='160'>\
					<br>\
					<br>\
					<h1>OOPS! - no form available for this content type.</h1>\
					<br>\
					<h1>Use <a href='"+addr+"'><b>SPA Form Designer</b></a> to update your project.</h1>\
				</div>\
				");
			}
			else if(formConfig && !SPAFORM().params.design) { 
				var addr = window.location.href + "&DisplayMode=Design";
				var designerLink = 	(SPAFORM().params.debug === true) ? "" : "<br><h1>Use <a href='"+addr+"'><b>SPA Form Designer</b></a> to publish your project.</h1>";
				f.errorPanel( true, "\
				<div style='padding-left:50px; width:99%; margin: 0 auto;'>\
					<img id='spaform160' height='160' width='160'>\
					<br>\
					<br>\
					<h1>OOPS! - no published form project.</h1>"+ designerLink +"\
				</div>\
				");
			} 
			else {				
				top.openProject = function() {
					self.Toolbar.panelOpenGITPanel();
				};
//debugger;			
				f.projectfile = false;
				f.errorPanel( true, "\
				<div style='padding-left:50px; width:99%; margin: 0 auto;'>\
					<br>\
					<br>\
					<h1>... please wait to setup new SPA Form Project</h1>\
					<br>\
				</div>");
			}
			// <h1>SPA Form project was not setup yet,</h1>\
			// <h1><a href='javascript:void(0);' onclick='top.openProject();'>create new project or import from GitHub.</a></h1>\
	
			//set 365x160x160 image on error panels
			var img = document.getElementById('spaform160');
			if( img) img.setAttribute(
				'src', 'data:image/png;base64,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'
			);	
			//--> moved to form-loader.proxy.js		
// debugger;	// that will load designer.min.js !!					
// 			require(["form2-storage"], function() {
// 				self.readListInfo().done(function() { // --> will set l.contentTypeId to default content type on list
// //debugger;						
// 				});
// 			});	
		};
		
		this._loadRuntimeRibbons = function(formConfig, p_config) {			
			var d = $.Deferred();
			var self = this;
			if( !SPAFORM().form.crossdomain) {			
				require( ["ribbon-formedit"], function(ribbon) { 	
					var r1 = new ribbon();
					// r1.onSelected(function(r){
					// 	console.log('onSelected ' + r.getTabCommandId());
					// });
					
					// var r2 = new ribbon( {
					// 	Title: 'TEST',
					// 	Require: {
					// 		name: 'test'
					// 	}
					// });
					// r2.onSelected(function(r){
					// 	console.log('onSelected ' + r.getTabCommandId());
					// });
			
					d.resolve();
				});
			}
			else {
				return d.resolve();
			}
			return d.promise();
		};	

		this._loadRibbons = function(formConfig, p_config) {
			var d = $.Deferred();
			var self = this;
			// loading form ribbon tab (also need buttons control)
			if( !SPAFORM().form.crossdomain) {
				if( !SPAFORM().params.design) {
					require( ["ribbon-formedit"], function(ribbon) { 
						var r1 = new ribbon();
						// r1.onSelected(function(r){
						// 	console.log('onSelected ' + r.getTabCommandId());
						// });
						
						// var r2 = new ribbon( {
						// 	Title: 'TEST',
						// 	Require: {
						// 		name: 'test'
						// 	}
						// });
						// r2.onSelected(function(r){
						// 	console.log('onSelected ' + r.getTabCommandId());
						// });
									
						d.resolve();
					});
				}
				else {
					require(['ribbon','form2-design'], function(ribbon) {
						self.$getCookie();
						self.$ribbon = ribbon;
						ribbon.$form = self;

						if( !formConfig.error) {
							if(!self.$isSandbox ) {
								self.getProjectFiles().done(function(){
									console.log("offset: +" + (Date.now() - top.startTime) + ' - form2.js - project files loaded');
									SPAFORM()['_'].designer._formEnsureToolbar().done(function(tb) {
										
									});
								});
							};	
						}
						else {
							SPAFORM().form.errorPanel();
						};							
						d.resolve();
					}, function(err) { return d.resolve();});
				}
				
			}
			else {
				d.resolve();
			}
			return d.promise();
		};

		this.fnGitRepoName = function() {
			return SPAFORM().list.name.replace('%','-');
		};

		this._formInit4 = function(formConfig, callback) {
			var _this = this;
			this.sourceControl = {
				'gitUserName': "",
				'gitUserPassword': "",
				'gitOrganization': "",
				'gitRepoName': this.fnGitRepoName(),//"FF",
				'gitConnected': false,
				'selectedDeviceNumber': 0,
				'selectedDeviceDisplayName':'Desktop'
			};			
			if( formConfig.sourceControl) { 
				this.sourceControl = formConfig.sourceControl;
				this.sourceControl.gitRepoName = this.fnGitRepoName();
			}


			// check actual user permissions and modify form operational settings as permitted
			if (SPAFORM().params.itemId) {
				SPAFORM().list.item.id = SPAFORM().params.itemId;
				SPAFORM().list.item['_'].id(SPAFORM().params.itemId);
			}	
			
//debugger;		
			// $designComponents are allowed on PLACEHOLDER for placements on the Form.
	//debugger;		
			ko.components.unregister('component-form');
			//-- already do by unregister ... ko.components.clearCachedDefinition('component-form');
console.log("offset: +" + (Date.now() - top.startTime)+'****************** _formInit4 $registerComponents ****************** '); 			
			// $customComponents are allowed for Components Toolbar
console.log('WARNING !! - form2.js:697 MOVE (OVERRIDE) TO DESIGNER:  designercache');				
			var r = SPAFORM()['_'].designercache;
			if(r) r.setEnableWrite(false);
//debugger;
			//var customcomps = JSON.parse(JSON.stringify(formConfig.customComponents)); // no object reference			
			//SPAFORM().components.custom( customcomps );
debugger;
			//-->fill out designercache w/comps
			this.$registerComponents(formConfig.registeredComponents/*, formConfig.customComponents*/).done( function() {

//var c = SPAFORM().components;
//debugger;
//c.custom(customcomps);

				if(_this.$isSandbox) {
console.log('TO DO: MOVE ensureTransitions to DESIGNER');	
//debugger;				
					_this.ensureTransitions().done(function(){
						if( callback) callback();
					})
				}
				else {
//debugger;					
					if( callback) callback();
				}
				//self._formInit2();
			});
		};
		
		this._formInit2 = function() {

			var _this = this;
//debugger;			
	//		$('component-form').empty();
			ko.components.clearCachedDefinition('component-form');
			ko.options.deferUpdates = true;
//			this._formLoaded(true);

//--> not needed			this._formInitialize(); // ---> call to proxy

			try {	
//debugger;	
console.log("offset: +" + (Date.now() - top.startTime)+'****************** _formInit2 applyBindings ****************** '); 
console.log('WARNING !! - form2.js:738 MOVE (OVERRIDE) TO DESIGNER:  designercache');	
				var r = SPAFORM()['_'].designercache;				
				if(r) r.setEnableWrite(true);
				//------------------------
				// 1) insert all states below
				// <div id='fsm-states' style='display-none'></div>
//debugger;
				var loadStateMachine = function() {
					var f = SPAFORM().form;
//debugger;
					f.workflow.load(f.state());

					var schema = f.startupComponentSchema;
					var statesPool = {};
					// if( schema.WorkflowStates) {
					// 	for( i = 0; i < schema.WorkflowStates.length; i++)
					// 	{
					// 		var state = schema.WorkflowStates[i];
					// 		var stateSchema = f.projectComponents[state];
					// 		if(stateSchema) statesPool[state] = stateSchema;
					// 	};
								
					// }
					
					if( schema.Process && schema.Process.States) {
						for( var stateId in schema.Process.States) {
							var stateInfo = schema.Process.States[stateId];
							var stateSchema = f.projectComponents[stateInfo.componentId];
							if(stateSchema && (stateSchema.Id != schema.Id)) statesPool[stateId] = stateSchema;
//debugger;							
							f.workflow.fsm.addState(stateId, stateInfo);
//debugger;							
						}
					}
					var configuration = {
						'statesPool': statesPool,
						'viewModel': this
					}
//debugger;
					// if designer environment & not main form --> f.state() returns fixed value of - f.codePanel.$schema.LayoutId
					// if runtime OR designer environment & main form --> f.state() returns value of - f['_'].state()
console.log('loadStateMachine f.workflow.fsm.goto('+f.state()+')');
					f.workflow.fsm.goto(f.state()); //.load(f.state());
					return configuration;
				}				
//debugger;
//console.log('_formInit2: '+this.state());						
				this.statesPoolViewModel = new ko.statesPool.viewModel(loadStateMachine());
				// 2) current state shuld be here:
				// <div><component-fsm params=""></component-fsm></div>

	// 			this.resizeFrame = function() {
	// 				//if( SPAFORM().params.design && _this.$isSandbox) {
	// 					var b = SPAFORM().buffer;

	// 					if(b && b.resizeFrameIntervalId) { 
	// 						clearInterval(b.resizeFrameIntervalId);
	// 						b.resizeFrameIntervalId = null;
	// 					}
	// 					var element = document.getElementById('form-container');	
	// 					var frame = b.getActiveFrame();
	// 					var iframeId = (frame) ? frame.iframeId : 'model-sandbox';

	// 					var iFrame = top.document.getElementById( iframeId  );
	// 					if(iFrame) {
	// 						iFrame.style.height = (element.clientHeight+1)+'px';
	// 					}

	// 					b.resizeFrameIntervalId = setInterval(function() {
							
	// console.log('Changed to ' + element.clientWidth + ' : ' + element.clientHeight+' iFrame='+iFrame);
	// 						if(iFrame) {
	// 							iFrame.style.height = element.clientHeight+'px';
	// 						}
	// 					}, 1000);						
	// 				//}
	// 			}

				if(_this.$isSandbox) {
//debugger;					
					var codepanel = SPAFORM().form.codePanel; //this.Toolbar.getViewModelCodePanel();	
					var gridTitle = codepanel.$panelTitle.toUpperCase();
					this.showMainForm = ko.observable(this.contentTypeTitle() == gridTitle);
// not needed: 	if designer environment & not main form --> f.state() returns fixed value of - f.codePanel.$schema.LayoutId													
// 					if( codepanel.$schema.hasOwnProperty('LayoutId')) {
// debugger;						
// 						SPAFORM().form['_'].state(codepanel.$schema.LayoutId);
// 					}
//					this.resizeFrame();	
				}

// 				var sandboxResizer = function() {
// 					if(top.ResizeSensor) {
// 						// applyBindings should be fully completed before apply ResizeSensor - wait 1.5 sec
// 						//setTimeout(function(){
// //debugger;							
// 							var element = document.getElementById('form-container');
	
// 							var frame = SPAFORM().buffer.getActiveFrame();
// 							var iframeId = (frame) ? frame.iframeId : 'model-sandbox';
							
// 							new top.ResizeSensor(element, function() {
// 								var iFrame = top.document.getElementById( iframeId  );
// 		console.log('Changed to ' + element.clientWidth + ' : ' + element.clientHeight+' iFrame='+iFrame);
// 								if(iFrame) {
// 									iFrame.style.height = element.clientHeight+'px';
// 								}
// 							});	
// 						//},1500);
// 					};	
// 				};
//debugger;				
				//debugger;
// 				if(top.ResizeSensor) {
// 					var element = document.getElementById('form-container');	
// 					var frame = SPAFORM().buffer.getActiveFrame();
// 					var iframeId = (frame) ? frame.iframeId : 'model-sandbox';
						
// 					setInterval(function() {
// 						var iFrame = top.document.getElementById( iframeId  );
// //console.log('Changed to ' + element.clientWidth + ' : ' + element.clientHeight+' iFrame='+iFrame);
// 						if(iFrame) {
// 							iFrame.style.height = element.clientHeight+'px';
// 						}
// 					}, 1000);
// 				}
				//sandboxResizer();
//debugger;				
				ko.applyBindings(this, document.getElementById('form-container'));
				//sandboxResizer();


				
			} catch(e) { 
				console.log('error on applyBindings: ' + e);
			};
			
		};		
/**
 * 
 * 
 * REMOVE TO DESIGNER
 * 
 * 
 * 
 * **/		
		this.$formGridEditor = ko.observable(false);
		this.$gridEditor2 = function( showGrid) {
//debugger;		
			var self = this;
			var d = $.Deferred();
//debugger;			
			var codepanel = SPAFORM().form.codePanel; //this.Toolbar.getViewModelCodePanel();
			if( !codepanel) return d.resolve();

			var gridTitle = codepanel.$panelTitle.toUpperCase();
			var grid = "div[title='"+gridTitle+"'] div.ms-Grid";

			//var grid = "div[title='"+gridTitle+"'] div.ms-Grid";
			if( self.$formGridEditor()) {
				//$('component-form div.ms-Grid').first().gridEditor('editGrid', showGrid);
				$(grid).first().gridEditor('editGrid', showGrid);
				SPAFORM().runtime.resizeFrame();
				return d.resolve();
			}
			else {
			
				requirejs( [
							'grideditor',
							//'beautifyhtml',
							"json5",
							//'css!bootstrapcss',
							//'css!summernotecss',
							'css!grideditorcss',
							//'css!grideditorformscss',
							//'bootstrap',
							'jqueryui'//,
							//'summernote',
							//'css!jsoneditorcss' // from jquery.grideditor.uifabric.js, line 635
							//'tinymce',
							//'jquerytinymce',
							
				], 
				function(grideditor) {//beautify) {
					//self.html_beautify = beautify.html_beautify;
//debugger;					
					grideditor();
					// Initialize grid editor

					var sc = self.sourceControl;
					var layoutDevNumber = 0;
					if(sc) layoutDevNumber = (sc['selectedDeviceNumber']) ? parseInt(sc['selectedDeviceNumber']) : 0;
					if( self.$formGridEditor() == false) {
//debugger;						
//						$('component-form div.ms-Grid').first().gridEditor({
						$(grid).first().gridEditor({
								//new_row_layouts: [[12], [6,6], [9,3],[4,4,4]],
							content_types: ['summernote'],
							showGrid: showGrid,
							editText: false, //editText,
							'layout_devNumber': layoutDevNumber,
							form: self
							//content_types: ['tinymce']
						});
						RefreshCommandUI();  
					}
					else {					
//						$('component-form div.ms-Grid').first().gridEditor('editGrid', showGrid);
						$(grid).first().gridEditor('editGrid', showGrid);
					}
					self.$formGridEditor(true);
					SPAFORM().runtime.resizeFrame();
					d.resolve();
				},
				function(e) {
					// error
					//debugger;
					d.resolve();
				});								
			}
			return d.promise();
		};
		this.$getTemplateHTML = function() {

			var codepanel = SPAFORM().form.codePanel; //this.Toolbar.getViewModelCodePanel();
			if( !codepanel) return d.resolve();

			var gridTitle = codepanel.$panelTitle.toUpperCase();
			var grid = "div[title='"+gridTitle+"'] div.ms-Grid";

//debugger;			
			var g = $(grid).first().clone();
			var attributes = g.prop("attributes");
			//g.empty();
			//var gs = g.html();

			var gridhtml = $(grid).first().gridEditor('getHtml');
			//var gridhtml = $('.ms-Grid').first().parent().gridEditor('getHtml');
			g.html(gridhtml);


			var r = $("component-form").clone();
			r.find('.ge-mainControls').remove();
			r.find('.ge-html-output').remove();
			r.find('.ms-Grid').removeClass('ge-canvas ge-layout-desktop ge-editing ui-sortable');
			//			r.find('.ms-Grid').replaceWith("<div id='ms-Grid'></div>");
			


			var m = g;// $("component-form").clone();
			//			m.html("<div class='ms-Grid'>" + gridhtml + "</div>");

			var components = $(m).find("*").filter(function(){
				return /^component\-/i.test(this.nodeName);
			});
			for( var i=0; i < components.length; i++) {
				$(components[i]).empty();
			}
			var input = m.html();
//debugger;
			//			r.find('#ms-Grid').replaceWith(input);
			var g2 = r.find('.ms-Grid').first();
			$.each(attributes, function() {
				g2.attr(this.name, this.value);
			});	
			g2.removeClass('ge-canvas ge-layout-desktop ge-editing ui-sortable');		
			g2.html(input);

			var input2 = r.html();
			var input3 = this.html_beautify(input2, {'preserve_newlines': false});
			//debugger;			
			//var templateHTML = this.html_beautify(input, {'preserve_newlines': false});
			return input3;//templateHTML;
		};
		this.placeComponents2 = function() {

			var codepanel = SPAFORM().form.codePanel; //this.Toolbar.getViewModelCodePanel();

			var gridTitle = codepanel.$panelTitle.toUpperCase();
			var grid = "div[title='"+gridTitle+"'] div.ms-Grid";
		//debugger;
//alert('designer - incorrect form.js:1080');
//debugger;
							
			$(grid).first().gridEditor('createCompControls');
			if( SPAFORM()['_'].designer.Toolbar.PickerPanel != undefined) { 
				$(SPAFORM()['_'].designer.Toolbar.PickerCell).removeClass('ui-state-hover');
				SPAFORM()['_'].designer.Toolbar.PickerPanel.dismiss();
			}
			SPAFORM()['_'].designer.Toolbar.$updateViewModelCodePanel("placeComponents2! ");
		};

		// called from pickup panel
		// params:
		// - cell - is target <div> to host placed component
		// - field  == null for non-field controls (like buttons or state)
		// - schema - version taken from compsPanel (Title, Require, Params, Markup + panel buttons controls)
		this.placeComponent = function( cell, field, schema2) {

			debugger;

			var schema = JSON.parse(JSON.stringify(schema2));			
			var params = schema.Params;	
			
			// var set_namespace = function( cell, params) {
			// 	if( cell) {

			// 		var p = cell[0];// get dom element from jquery wrapper //document.getElementById("target");
			// 		//var els = [];
			// 		while (p) {
			// 			var prms = p.getAttribute('params');
			// 			if(prms) {							
			// 				var jsonprms = "{" + prms + "}";
			// 				jsonprms = jsonprms.replace(/'/g, '"');
			// 				var p = JSON.parse(jsonprms);
			// 				if( p.namespace) {
			// 					schema.Params.namespace = p.namespace;
			// 					break;
			// 				}
			// 			}
			// 			if( p.classList.contains('ms-Grid')) break;
			// 			p = p.parentNode;
			// 		}
			// 	}
			// };
			var set_namespace = function( cell, params) {
				var f = SPAFORM().form;
				// do not use namespace from state, because form can be in multiply states during placement
				//var stateId = f.state();
				//var state = f.startupComponentSchema.Process.States[stateId];
				//schema.Params.namespace = state.namespace;

				// use instead 'component' namespace
				
				schema.Params.namespace = f.codePanel.$schema.Params.namespace;
			};

			if( field) {
				for( var key in params) {
					if( field.hasOwnProperty(key)) params[key] =  (field[key]) ? ((field[key].results) ? field[key].results : field[key]) : field[key];
					if( key == 'Percentage') params[key] = this.isPercentage(field);
				} 
				set_namespace( cell, params);
			} else {
				set_namespace( cell, params);
				schema.Params.InternalName = 'spaf_' + (new Date()).getTime();				
				if( schema.Params.hasOwnProperty('promoted')) schema.Params.promoted = false;
			};

			this.handlePromotedColumn( schema).done(function() {
				var codepanel = SPAFORM().form.codePanel; //this.Toolbar.getViewModelCodePanel();
	
				var gridTitle = codepanel.$panelTitle.toUpperCase();
				var grid = "div[title='"+gridTitle+"'] div.ms-Grid";
					
				$(grid).first().gridEditor('placeComponent', cell, schema);
			});
		};












	}).call(runtime.prototype);
	
	return { viewModel: runtime, template: htmlString};
});

