/**
 * Copyright spaforms365.com
 */
;
console.log("offset: +" + (Date.now() - top.startTime) +" - startup-runtime.js: " + "--> loaded");				
window.getUrlParameter = function (name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
};
/*
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(factory);
    } else if (typeof exports === "object") {
        module.exports = factory();
    } else {
        root.startupConfig = factory();
    }
}(this, function () {
*/
define(['require', 'spaform', 'knockout'/*,  'jsm-statemachine', 'jsm-states'*/], function( require, SPAFORM, ko) {
	
	var getUrlParameter = function (name) {
		name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
		var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
		var results = regex.exec(location.search);
		return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
	};

	var sandbox = getUrlParameter("Sandbox");
	
	var p = SPAFORM().params;
	var design = p.design; //(getUrlParameter("DisplayMode") == "Design") ? true : false;
//debugger;	
	//var c = (!(p.debug || p.design)) ? "../Runtime/syscomponents.min" : false;

	//var c =  "../Runtime/syscomponents.min";
debugger;	
	var c = (!(p.debug || p.design)) ? "../Runtime/syscomponents.min" : false;
	if( p.mode == 'installer') c = "../Runtime/syscomponents.min";
	//if( p.design) c = false;
		
    /**
     * runtime syslibrary
     */
    var sysLibraryComponents = [
		
		{ 	Title: "layout",
			"Require": { 
				"name": "layout", 
				"sys": true,
				"proto": true,
				"path": (c) ? c : "../Runtime/source/syscomponents/layout"
			},
			"Markup": { 
				"tag": "component-layout", 
			}
		},
		
		{ 	Title: "blank",
			"Require": { 
				"name": "blank", 
				"sys": true,
				"proto": true,
				"path": (c) ? c :  "../Runtime/source/syscomponents/blank" 
			},
			"Markup": { 
				"tag": "component-blank", 
			}
		},

		{ 	Title: "textbox",
			"Require": { 
				"name": "textbox", 
				"sys": true,
				"proto": true,
				"path": (c) ? c :  "../Runtime/source/syscomponents/textbox" 
			},
			"Markup": { 
				"tag": "component-textbox", 
			}
		},
		{ 	Title: "radiogroup",
			"Require": { 
				"name": "radiogroup", 
				"sys": true,
				"proto": true,
				"path": (c) ? c :  "../Runtime/source/syscomponents/radiogroup"
			},
			"Markup": { 
				"tag": "component-radiogroup", 
			}
		},		
		{ 	Title: "dropdown",
			"Require": { 
				"name": "dropdown", 
				"sys": true,
				"proto": true,
				"path": (c) ? c :  "../Runtime/source/syscomponents/dropdown"
			},
			"Markup": { 
				"tag": "component-dropdown", 
			}
		},		
		{ 	Title: "checkboxgroup",
			"Require": { 
				"name": "checkboxgroup", 
				"sys": true,
				"proto": true,
				"path": (c) ? c :  "../Runtime/source/syscomponents/checkboxgroup" 
			},
			"Markup": { 
				"tag": "component-checkboxgroup", 
			}
		},		
		{ 	Title: "personabox",
			"Require": { 
				"name": "personabox", 
				"sys": true,
				"proto": true,
				"path": (c) ? c :  "../Runtime/source/syscomponents/personabox" 
			},
			"Markup": { 
				"tag": "component-personabox", 
			}
		},		
		{ 	Title: "lookupbox",
			"Require": { 
				"name": "lookupbox", 
				"sys": true,
				"proto": true,
				"path": (c) ? c :  "../Runtime/source/syscomponents/lookupbox" 
			},
			"Markup": { 
				"tag": "component-lookupbox", 
			}
		},		
		{ 	Title: "datetimebox",
			"Require": { 
				"name": "datetimebox", 
				"sys": true,
				"proto": true,
				"path": (c) ? c :  "../Runtime/source/syscomponents/datetimebox"
			},
			"Markup": { 
				"tag": "component-datetimebox", 
			}
		},		
		{ 	Title: "numberbox",
			"Require": { 
				"name": "numberbox", 
				"sys": true,
				"proto": true,
				"path": (c) ? c :  "../Runtime/source/syscomponents/numberbox"
			},
			"Markup": { 
				"tag": "component-numberbox", 
			}
		},		
		{ 	Title: "currencybox",
			"Require": { 
				"name": "currencybox", 
				"sys": true,
				"proto": true,
				"path": (c) ? c :  "../Runtime/source/syscomponents/currencybox"
			},
			"Markup": { 
				"tag": "component-currencybox", 
			}
		},		
		{ 	Title: "checkbox",
			"Require": { 
				"name": "checkbox", 
				"sys": true,
				"proto": true,
				"path": (c) ? c :  "../Runtime/source/syscomponents/checkbox"
			},
			"Markup": { 
				"tag": "component-checkbox", 
			}
		},		
		{ 	Title: "notebox",
			"Require": { 
				"name": "notebox", 
				"sys": true,
				"proto": true,
				"path": (c) ? c :  "../Runtime/source/syscomponents/notebox" 
			},
			"Markup": { 
				"tag": "component-notebox", 
			}
		},
		{ 	Title: "observable2",
			"Require": { 
				"name": "observable2", 
				"sys": true,
				"proto": true,
				"path": (c) ? c :  "../Runtime/source/syscomponents/observable2"
			},
			"Markup": { 
				"tag": "component-observable2", 
			}
		},
		// { 	Title: "buttons",
		// 	"Require": { 
		// 		"name": "buttons", 
		// 		"sys": true,
		// 		"proto": true,
		// 		"path": (c) ? c :  "../Runtime/source/syscomponents/buttons" 
		// 	},
		// 	"Markup": { 
		// 		"tag": "component-buttons", 
		// 	}
		// },
		{ 	Title: "transition",
			"Require": { 
				"name": "transition", 
				"sys": true,
				"proto": true,
				"path": (c) ? c :  "../Runtime/source/syscomponents/transition" 
			},
			"Markup": { 
				"tag": "component-transition", 
			}
		},
		{ 	Title: "filebox",
			"Require": { 
				"name": "filebox", 
				"sys": true,
				"proto": true,
				"path": (c) ? c :  "../Runtime/source/syscomponents/filebox" 
			},
			"Markup": { 
				"tag": "component-filebox", 
			}
		},
		{ 	Title: "messagebox",
			"Require": { 
				"name": "messagebox", 
				"sys": true,
				"proto": true,
				"path": (c) ? c :  "../Runtime/source/syscomponents/messagebox" 
			},
			"Markup": { 
				"tag": "component-messagebox", 
			}
		},
		{ 	Title: "state",
			"Require": { 
				"name": "state", 
				"sys": true,
				"proto": true,
				"path": (c) ? c :  "../Runtime/source/syscomponents/state"
			},
			"Markup": { 
				"tag": "component-state", 
			}
		}
	];

		
	var createMarkup = function() {
		var formMarkup =  '\
			<div id="spaform365-markup">\n\
				<div id="spaform365-attachments"></div>\n\
				<input id = "fileSelector" style="display:none;" type="file" onchange="openFile(event)" ></input>\n\
				<div id="formpanel">\n\
					<div id="projectError"></div>\n\
					<div id="formSandbox" style="display:none;"></div>\n\
					<div id="formHeader"  style="display:none;" class="ms-font-xxl ms-fontColor-themePrimary">\n\
						<b><span id="headerFormId" ></span><span>&nbsp;&nbsp;</span></b>\n\
						<b><span id="headerFormTitle"></span></b>\n\
						<b><span id="headerFormStatus" style="float:right;"></span></b>\n\
					</div>\n\
					<div id="formContainer"></div>\n\
				</div>\n\
				<div id="designertemplates"></div>\n\
				<div id="codepanel" style="display:none;"></div>\n\
				<div id="ppanel"></div>\n\
				<div id="epanel"></div>\n\
				<div id="wpanel"></div>\n\
				<div id="rpanel"></div>\n\
				<div id="spanel"></div>\n\
			</div>\n\
		';

		var formMarkup2 =  '\
		<div id="projectError"></div>\n\
		<div id="formSandbox" style="display:none;"></div>\n\
		<div id="formHeader"  style="display:none;" class="ms-font-xxl ms-fontColor-themePrimary">\n\
			<b><span id="headerFormId" ></span><span>&nbsp;&nbsp;</span></b>\n\
			<b><span id="headerFormTitle"></span></b>\n\
			<b><span id="headerFormStatus" style="float:right;"></span></b>\n\
		</div>\n\
		<div id="formContainer"></div>\n\
		';
		
		var formpanel = document.getElementById("formpanel");	

		if( !formpanel)	{
			var thisScript = document.getElementById(p.parentId); //"spaform365");
			if( thisScript) {
				thisScript.insertAdjacentHTML('beforebegin', formMarkup);
			}
			
		}
		else {
			formpanel.insertAdjacentHTML('afterbegin', formMarkup2);						
		}
	}
		
	var resetSpaformhost = function() {
		// remove listeners
		if(SPAFORM()['_'].listeners)
			for (var i = 0; i < SPAFORM()['_'].listeners.length; i++) {
				top.removeEventListener('message', SPAFORM()['_'].listeners[i], false);
			}
		SPAFORM()['_'].listeners = [];
		// remove model-proxy
		var modelproxy = top.document.getElementById("model-proxy");
		if( modelproxy) modelproxy.parentNode.removeChild(modelproxy);
		// remove form markup
		var markup = top.document.getElementById("spaform365-markup");
		if( markup) markup.parentNode.removeChild(markup);
		//
		if(SPAFORM().params.contextId) { 
			console.log('Global context ' + SPAFORM().params.contextId + ' deleted');
			delete top[SPAFORM().params.contextId];
		}
	}

	var createSpaform = function() {

		SPAFORM().remote = {
			connected: false,
			username: "",
			password: "",
			organization: ""
		};

		SPAFORM().list = {
			webAbsoluteUrl: p.listUrl.substring(0, p.listUrl.indexOf('/Lists/')),
			isO365: (p.listUrl.indexOf("sharepoint.com") > 0) ? true : false,
			name: p.listUrl.substring(p.listUrl.indexOf('/Lists/')+7),
			listItemType: function () {
				var name = p.listUrl.substring(p.listUrl.indexOf('/Lists/')+7);
				return "SP.Data." + name.charAt(0).toUpperCase() + name.slice(1) + "ListItem";
			},		
			title: top.listtitle, //null,//
			defaultViewUrl: top.listdefaultviewurl,
			relativeFolderPath: top.listrelativefolderpath,
			id: null, 
			contentTypeId: getUrlParameter("ContentTypeId"),
			contentTypeName: function() {				
				var t = 'item';
				var contentTypeId = this.contentTypeId;
				this.contentTypes.forEach(function(ctype, i) {
					if(ctype.id == contentTypeId) t = ctype.name;
				});
				return t;
			},
			// security  expectation: No process = 0 / Process = 2
			draftVersionVisibility: 0, // Any reader can view drafts = 0;  Any contributor can view document draft = 1;  Approver & Author can view draft = 2
			// process security expectation: read items that were created by the user = 2
			readSecurity: 1, //Read all items = 1. Read items that were created by the user = 2
			// process security expectation: create items and edit items that were created by the user = 2
			writeSecurity: 1, //Create and edit all items = 1. Create items and edit items that were created by the user = 2  .None = 4
			// moderation
			enableModeration: false,
			// attachments
			enableAttachments: false,
			// versioning
			enableVersioning: false,
			enableMinorVersions: false,
			// -- not avail via REST
			//majorVersionLimit: 1,
			//majorWithMinorVersionsLimit: 1, // #No of drafts in Lists

			// content types
			allowContentTypes: false,
			enbledContentTypes: false,
			contentTypes: [],

			fields: null,
			// get_fields: function () {
			// 	return (this._formGetFields) ? this._formGetFields() : null;
			// },
			typeAsTextByTypeKind: function( int) {
				var key = "" + int;
				var typeEnum = {
					'29': 'allDayEvent',
					'19': 'attachments',
					'8' : 'boolean',
					'17': 'calculated',
					'6' : 'choice',
					'12': 'computed',
					'25': 'contentTypeId',
					'5' : 'counter',
					'22': 'crossProjectLink',
					'10': 'currency',
					'4' : 'dateTime',
					'24': 'error',
					'18': 'file',
					'31': 'geolocation',
					'16': 'gridChoice',
					'14': 'guid',
					'1' : 'integer',
					'0' : 'invalid',
					'7' : 'lookup',
					'31': 'maxItems',
					'23': 'modStat',
					'15': 'multiChoice',
					'3' : 'note',
					'9' : 'number',
					// outcomeChoice
					'26': 'pageSeparator',
					'21': 'recurrence',
					'2' : 'Text',				//'text',
					'27': 'threadIndex',
					'13': 'threading',
					'11': 'URL',
					'20': 'user',
					'30': 'workflowEventType',
					'28': 'workflowStatus'
					// registerEnum
				};
				var result = typeEnum[key];
				return (result) ? result : 'invalid';
			},
			ODataRequestCached: null,
			item: {
				id: SPAFORM().params.itemId,				
				'_': {
					id: ko.observable(SPAFORM().params.itemId),
					data: ko.observable(undefined)
				}
			}
		};

		var l = SPAFORM().list;
		// l.get_fields = function () {
		// 	return (SPAFORM()['_'].designer._formGetFields) ? SPAFORM()['_'].designer._formGetFields() : null;
		// },

		SPAFORM().user = {
			'_': {
//				userPermissions: new SP.BasePermissions(),
				jsonPermissions: ko.observable(''),
				hasPermission: function( permissions, permissionKind) {
					var userPerms = new SP.BasePermissions();
					userPerms.fromJson(permissions);
					return userPerms.has(permissionKind);
				}					
			},
			canManageLists: ko.observable(false),
			canModerateItems: ko.observable(false),
			userGroups: {}
// 				hasPermission: function( permissionKind) {
// debugger;		
// 					if( this.jsonPermissions.length == 0) return false;
// 					var userPerms = new SP.BasePermissions();
// 					userPerms.fromJson(this.jsonPermissions);
// 					return userPerms.has(permissionKind);
// 				}						
		};

		var u = SPAFORM().user;
		u.canEdit = ko.computed(function() { 
//debugger;		
			//return this.userPermissions.has( SP.PermissionKind.editListItems); 

			if(this['_'].jsonPermissions().length == 0) return false;
			return this['_'].hasPermission(  JSON.parse(this['_'].jsonPermissions()), SP.PermissionKind.editListItems); 
			//return this['_'].hasPermission(SP.PermissionKind.editListItems); 
		}, u);
		u.canDesign = ko.computed(function() { 
			//return this.userPermissions.has( SP.PermissionKind.manageLists); 
			if(this['_'].jsonPermissions().length == 0) return false;
			return this['_'].hasPermission(  JSON.parse(this['_'].jsonPermissions()), SP.PermissionKind.manageLists); 
			//return this['_'].hasPermission(SP.PermissionKind.manageLists); 
		}, u);
		u.canCreateStateGroup = ko.computed(function() { 
//debugger;
// if(this['_'].jsonPermissions().length == 0) {
// 	console.log('u.canCreateStateGroup - no permissions yet');
// }			
			if(this['_'].jsonPermissions().length == 0) return false;
			var prm = JSON.parse(this['_'].jsonPermissions());
			var p1 = this['_'].hasPermission(  prm, SP.PermissionKind.managePermissions); 
console.log('u.canCreateStateGroup - p1='+p1);			
			var p2 = true;//this['_'].hasPermission(  prm, SP.PermissionKind.createGroups); // ?????
console.log('u.canCreateStateGroup - p2='+p2);	
console.log('u.canCreateStateGroup = '+(p1 && p2));		
			return (p1 && p2);
		}, u);
					


		SPAFORM().form = {

				version: {
					server: undefined
				},
				formType: "Form Type",
				uniqueIDMethod: "Counter", //{ PROPERTYBAG: "PropertyBag", COUNTER: "Counter" };
				moderationMode: ko.observable('Disabled'),
				moderationModeLevel: { DISABLED: "Disabled", SUBMIT: "Submit", DRAFT: "Draft" },

				projectfile: false,
				crossdomain: (!top.listtitle) ? true : false,
				closeOnClick: false,

				projectComponents: {}, //customComponents found in project.js: { key == schema.Id, schema = schema } 
				registeredSchemas: {}, // all components extended scemas: { key == schema.Require.name.toLowerCase(), schema = extendedSchema }

				editMode: ko.observable(false),
				ready: ko.observable(false),
//				designMode: ko.observable(false),
				designMode: function(mode) {
					var spaform = SPAFORM();
					if( spaform && spaform.runtime) {
						if(mode != undefined) {
							spaform.runtime.designMode(mode);
						}
						return spaform.runtime.designMode();
					} 
					else return false;					
				},
								
				'new': ko.computed(function() {
					var result = (SPAFORM().list.item['_'].id() != undefined) ? false : true;
console.log('startup-runtimejs - form.new: ' + result);					
					return result
				}),


				valid: function() {
					var spaform = SPAFORM();
					var groupName = 'listItem';

					if( spaform && spaform.runtime ) {

						var ctx = spaform.runtime.dataContext(groupName);
						return ctx.vGroup.isValid();
				
						// var ctx2 = spaform.runtime;
						// return ctx2.ko.validationGroup(groupName).isValid();

						// return ctx.validationGroup.isValid();	
					};
					return false;		
				},
				
				columns: {}, // sharepoint columns in project file
				codePanels: {},
				codePanel: null,
				errorPanelState: false,
				errorPanel: function(on, html) {

					var f = SPAFORM().form;

					var setpanels = function(sandbox) {
						var errorPanel = top.document.getElementById("projectError");
						var formContainer = top.document.getElementById("formContainer");
						var sandboxContainer = top.document.getElementById("formSandbox");

						if(formContainer) formContainer.style.display = (f.errorPanelState) ? "none" : (sandbox) ? "none" : "block";
						if(sandboxContainer) sandboxContainer.style.display = (f.errorPanelState) ? "none" : (sandbox) ? "block" : "none";
						if(errorPanel) errorPanel.style.display = (f.errorPanelState) ? "block" : "none";

						return f.errorPanelState;
					}

					if(on == "sandbox") return setpanels(true);
					if(on == undefined) return setpanels();

					if(on == true) {
						var perror = document.getElementById("projectError");
						if(perror) perror.innerHTML = html;												
					}
					f.errorPanelState = (on) ? true : false;

					return setpanels();
				},
				message: { 
					red: {
						title: "Designer is not fully configured yet...",
						html: "please wait a minute and try again",
						color: "red",
						delay: false
					},
					enabled: false
				},
				isProjectValid: false,
				startupComponentSchema: null,
				$runtime: null,
				$design: null,
				runtime: function() { return (SPAFORM().form.$runtime) ? SPAFORM().form.$runtime : SPAFORM().form.$design; },
				design: function() {  return (SPAFORM().form.$design) ? SPAFORM().form.$design : SPAFORM().form.$runtime; },
				'_': {
					readonly: ko.observable(false)//,
//					state: ko.observable(undefined)
				}
		};

		// computed form members
		var f = SPAFORM().form;

		f.readonly = ko.computed({
			read: function() {
				var spaform = SPAFORM();
				var can_edit = u.canEdit() && f.editMode() && !f['_'].readonly();
console.log('startup-runtimejs - form.readonly: ' + !can_edit);				
				return !can_edit;
			},
			write: function(value) {
				f['_'].readonly(value);
			},
			owner: this
		});

		//-----------------

		SPAFORM().closeOnDesignSave = true;
		SPAFORM().productVersion = top.productversion;
		SPAFORM().productStartup = top.productstartup;
		
		SPAFORM()['_'].listeners = [];
		//SPAFORM()['_'].designer = null;
		
		SPAFORM().runtime = this;
		SPAFORM().destroy = resetSpaformhost;
			
	}

    var createSpaformRibbon = function() {
		if (typeof SPAFORM().form.ribbon === "undefined") {
			SPAFORM().form.ribbon =  {

				enableEdit:    function() { return true; },
				queryEdit:     function() { return SPAFORM().form.editMode(); },
				actionEdit:    function(enable) { 
					SPAFORM().form.editMode(enable);
					RefreshCommandUI();  
				},

				enableClose:   function() { return true; },
				actionClose:   function() { window.location = _spPageContextInfo.webAbsoluteUrl + "/Lists/" + SPAFORM().list.name; },

				enableDesign:  function() { return (SPAFORM().user.canDesign() && (SPAFORM().params.debug != true)) ? true : false; },
				actionDesigh:  function() { window.location = window.location.href + "&DisplayMode=Design"; },

				enableSave:    function() { 
					var f = SPAFORM().form; 
//console.log('valid: '+ f.valid());
//console.log('readonly: '+ f.readonly());
					return f.valid() && !f.readonly(); 
				},
				actionSave:	   function() { SPAFORM().list.item.save(); },

				enableDelete:  function() { 
					var f = SPAFORM().form; 					
					return !(f.readonly()) && !(f.new()); 
				},
				actionDelete:  function() { SPAFORM().list.item.delete(); },

				enableExplore: function() {
					var isIE = function () { return navigator.appVersion.indexOf("MSIE") > 0; };
					return isIE();	
				},	
				actionExplore: function(enable) {
					var explorerViewUrl = _spPageContextInfo.webAbsoluteUrl + "/Lists/" + SPAFORM().list.name + "/Form/Design"; //encodeURIComponent(
					NavigateHttpFolder( explorerViewUrl, "blank");
				}								
			};		
		};
	};

	var startupProxy = function(_require) {
		if( !SPAFORM().list.title) {
					
			function create( htmlStr) {
				var frag = document.createDocumentFragment(),
					temp = document.createElement('div');
				temp.innerHTML = htmlStr; 
				while( temp.firstChild) {
					frag.appendChild( temp.firstChild);
				}
				return frag;
			};
			var s_debug = (p.debug) ? "&Debug=true" : "";
			var s_runtime = (!p.design) ? "&Runtime=true" : "";
			var s_design = (p.design) ? "&DisplayMode=Design" : "";					
			var s_formID = (p.itemId) ? "&ID=" + p.itemId : "";
			//
			// proxy iframe
			var proxySrc = p.listUrl + '/Form/Runtime/model.proxy.aspx?List=' + SPAFORM().list.name + s_formID + s_runtime + s_design + s_debug;
			var proxyData = "<iframe id='model-proxy' src='"+proxySrc+"' style='width:10;height:10;border:0; border:none; display:none;' />";					
			var fragment = create(proxyData);
			
			//document.body.insertBefore( fragment, document.body.childNodes[0]);
			var root = document.getElementById('spaform365');
			root.appendChild( fragment);			
				
console.log("offset: +" + (Date.now() - top.startTime) +" - startup-runtime.js: " + "--> created model-proxy iframe");	
				
		}
		else {
			_require(["form-loader-proxy", "jquery"], function(proxy) {
				
				if(proxy) proxy();
			});	
		}
	};

    /**
     *
     * @param {Element|Element[]|Elements|jQuery} element
     * @param {Function} callback
     *
     * @constructor
     */
    var startupConfig = function() {

		initConfig();
		
        sysLibraryComponents.forEach( function( comp) {
			SPAFORM()['_'].requireConfig.paths[comp.Require.name] = comp.Require.path;
		});
		
		var _require = requirejs.config(SPAFORM()['_'].requireConfig);

		// /**
		//  * Launch designer
		//  */
		// if( p.design) {
		// 	/*
		// 	_require(["startup-designer"], function(init_design) {
		// 		//debugger;
		// 		if( typeof init_design === 'function') init_design(true);
		// 	});
		// 	*/
		// }

		if( sandbox) {
			_require(["form-loader-sandbox"], function(fl) {
				
console.log("offset: +" + (Date.now() - top.startTime) +" - startup-runtime.js: " + "loaded Runtime/source/form-loader-sandbox.js");

			});
		}
		else {
			var formloader = (p.design) ? "form-loader-designer" : "form-loader2";

			var ptst = _require.toUrl(formloader);
			console.log("offset: +" + (Date.now() - top.startTime) +" - startup-runtime.js: loading --> " + ptst);

			_require([formloader], function(loader) {
debugger;				
				console.log("offset: +" + (Date.now() - top.startTime) +" - startup-runtime.js: " + "loaded Runtime/source/form-loader2.js");
			
				if(loader) loader();				
				startupProxy(_require);
			});							
		}

		var jsonConfig = {};
		jsonConfig.requireConfig = SPAFORM()['_'].requireConfig;
		SPAFORM()['_'].registeredComponents = sysLibraryComponents;
		SPAFORM()['_'].sysLibraryComponents = sysLibraryComponents;
		
		jsonConfig.registeredComponents = sysLibraryComponents;
		jsonConfig.listName = SPAFORM().list.name;
		jsonConfig.runtime = false; // used to set path on "../Runtime/model.min"
		jsonConfig.version = top.productversion;
		
		SPAFORM().jsonConfig = jsonConfig;
		
		
        return jsonConfig;
    };
//debugger;
	var initConfig = function() {
//		resetSpaformhost();
		createMarkup();
		createSpaform();
		createSpaformRibbon();

		//---> moved to form2-project.js
		//if( p.design || p.mode == 'installer') createSpaformCacheProject();
		
		//createSpaformDesignerComponents();		
		//setCachingStrategy();
					
	};
	//return startupConfig;
//debugger;
	var spaform = function(context) { 	
		if(context) startupConfig(context); 
		return SPAFORM(); 
	};
	return spaform;
});