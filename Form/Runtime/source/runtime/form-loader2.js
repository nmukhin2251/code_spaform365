;
/*
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(factory);
    } else if (typeof exports === "object") {
        module.exports = factory();
    } else {
        root.formLoader = factory();
    }
}(this, function () {
*/
define(['require', 'spaform'], function( require, SPAFORM) {
	JSRequest.EnsureSetup();

	//console.log( SPAFORM());
    var formLoader = function() {

		console.log("offset: +" + (Date.now() - top.startTime) +" - form-loader2.js: " + "starting listener...");

		window.$designready = false; // will be set upon first resize of codepanel.js and used to delay messages at form2-design.js

		//var displayMode = JSRequest.QueryString["DisplayMode"];

		var _formListener = (function() {	
			var runtime = {};
			var f_config = null;

			// Form events listener
			return function (e) {
	//console.log("offset: +" + (Date.now() - top.startTime)+" - form-loader2: " + "_formListener message: " + e.data);
				try {
					var data = JSON.parse(e.data);
					var eventName = data[0];
					var formData = data[1];
					var listName = data[2];
					var ID = data[3];
//debugger;					
					switch( eventName) {
// 						case 'sandboxLoaded':
// //debugger;
// //var c = SPAFORM().components;						
// 											console.log("offset: +" + (Date.now() - top.startTime)+" - form-loader2: " + "SANDBOX-Frame Loaded: "+ID+" e.data: " + e.data);
// 											if( (ID != "0") && (ID != "1") ) {
// 	debugger;											
// 												console.log("offset: +" + (Date.now() - top.startTime)+" - form-loader2: " + "ERROR CONDITION - IGNORE ");	
// 												return;										
// 											}
// 	//debugger;										
// 											if( f_config) {
// 												var sandbox = null;
// 												var frame = SPAFORM().buffer.sandbox[parseInt(ID)];
// 												var iframe = parent.document.getElementById(frame.iframeId);													
// 												sandbox = (iframe) ? iframe.contentWindow : null;
// 												if(sandbox) sandbox.postMessage(JSON.stringify(['preloadScripts', '', f_config, frame.id]), "*");
// 												else{
// 	//debugger;												
// 												}
// 											}
// 											else {
// 	//debugger;
// 											};
// 											break;
// 						case 'sandboxReady':
// 											console.log("offset: +" + (Date.now() - top.startTime)+" - form-loader2: " + "SANDBOX READY-Frame: "+ID);
// 	//debugger;	
// 	//var c1 = SPAFORM().components;									
// 											if( f_config) {
// 												var sandbox = null;
// 												var frame = SPAFORM().buffer.sandbox[parseInt(ID)];
// 												if( frame.command == "next") {
// 													//top.SPAFORM.buffer.setState(frame.id, "active");
// 													var iframe = parent.document.getElementById(frame.iframeId);													
// 													sandbox = (iframe) ? iframe.contentWindow : null;
// 													if(sandbox) sandbox.postMessage(JSON.stringify(['proxyReady', '', f_config, frame.id]), "*");
// 													else {
// 	//debugger;												
// 													}
// 												}
// 												else {
// 													SPAFORM().buffer.setState(frame.id, "pending");
// 													// building project file after active frame collected columns
// 	console.log("offset: +" + (Date.now() - top.startTime)+" - form2-loader2:80 " + "<-- BUILD PROJECT FILE & ENSURE FORM COLUMNS -->");													
// 													var p = SPAFORM().project;
// //debugger;
// //													p.read();													
// 													//var f = SPAFORM().form;
// 													SPAFORM()['_'].designer.buildProjectFile2(false)
// 													.done( function(content) {
// 														p.setFile('project.js', content);
// 														p.write();
// 	console.log("offset: +" + (Date.now() - top.startTime)+" - form2-loader2: " + "buildProjectFile2 completed");	

// 														SPAFORM()['_'].designer.ensureFormColumns().done(function(){
// 	console.log("offset: +" + (Date.now() - top.startTime)+" - form2-loader2: " + "ensureFormColumns completed");
// //debugger;
// 															SPAFORM().buffer.isRunning = false;
// 															RefreshCommandUI();										
// 														});																											
// 													});
// 												}
// 											}
// 											else {
// 	//debugger;											
// 											}
// 											break;
						case 'proxyReady':
											//console.log('PROXY READY');
											console.log("offset: +" + (Date.now() - top.startTime)+" - form-loader2: " + "PROXY READY");

											SPAFORM().list.proxy = (SPAFORM().list.title) ? top : parent.document.getElementById('model-proxy').contentWindow;
											
//debugger;					
											f_config = listName;

											
													
											if( SPAFORM().jsonConfig) {

												SPAFORM().jsonConfig.requireConfig["waitSeconds"] = 30;

												f_config.registeredComponents = SPAFORM().jsonConfig.registeredComponents;
												f_config.requireConfig = SPAFORM().jsonConfig.requireConfig;
												//f_config.version = SPAFORM().productVersion;
												
											}

											var l = SPAFORM().list;
											var f = SPAFORM().form;
											var u = SPAFORM().user;
											var p = SPAFORM().params;
											
											l.title = f_config.listTitle;
											l.id = f_config.listId;
											l.allowContentTypes = f_config.allowContentTypes;
											l.contentTypesEnabled = f_config.contentTypesEnabled;
											if(l.contentTypeId == null) l.contentTypeId = f_config.defaultContentTypeId;
											l.contentTypes = JSON.parse(JSON.stringify(f_config.contentTypes));

											l.draftVersionVisibility = f_config.draftVersionVisibility;
											l.readSecurity = f_config.readSecurity;
											l.writeSecurity = f_config.writeSecurity;
//debugger;											
											l.enableModeration = f_config.enableModeration;
											l.enableAttachments = f_config.enableAttachments;

											l.enableVersioning = f_config.enableVersioning;
											l.enableMinorVersions = f_config.enableMinorVersions;
																			
//debugger;
											l.fields = f_config.columns.fields;
											l.types = f_config.columns.types;
											//var t = SP.FieldType;
											l.ODataRequestCached = f_config.columns.ODataRequestCached;
debugger;
											if(f_config.itemData) l.item['_'].data(f_config.itemData);

//debugger;
console.log('### WARNING - VERSION UNDEFINED !! NEED MOVE VERSION CONTROL DOWN TO DESIGN MODE !! ###');	

											f.version = f_config.version;
											f.formType = f_config.formType;
											// if( f.version) {
											// 	var dc = SPAFORM()['_'].designercache;	
											// 	dc.setProductVersion(f.version.current);
											// }
																				
											// var userInfo = {
											// 	loginName: accountName,
											// 	userGroups: userGroups,
											//  userPermission: userPermission
											// 	userEffectivePermissions: data.d.GetUserEffectivePermissions
											// }
		

											// u.userPermissions.fromJson(f_config.userPermissions);
											// u.canManageLists(f_config.canManageLists);
											// u.canModerateItems(f_config.canModerateItems);
											// u.canEdit(f_config.permissions.canEdit); // user permission from SharePoint
											// u.canDesign(f_config.permissions.canDesign); // user permission from SharePoint
//debugger;											
											//u['_'].userPermissions.fromJson(f_config.userInfo.userPermissions);
											u['_'].jsonPermissions(f_config.userInfo.userPermissions);

											//var a = u.canEdit();
											//var b = u.canDesign();

											u.canManageLists(f_config.canManageLists);
											u.canModerateItems(f_config.canModerateItems);
											//u.canEdit(f_config.permissions.canEdit); // user permission from SharePoint
											//u.canDesign(f_config.permissions.canDesign); // user permission from SharePoint
											u.loginName = f_config.userInfo.loginName;
											u.email = f_config.userInfo.email;
											u.isSiteAdmin = f_config.userInfo.isSiteAdmin;
											u.userGroups = f_config.userInfo.userGroups;
											u.canCreateGroups = f_config.userInfo.canCreateGroups;
											u.associatedMemberGroupName = f_config.userInfo.associatedMemberGroupName;
															
											
											
											if(p.debug == true )	SPAFORM().project.clear();				
											
											
											// usually top.productdesigncontrol is not ready yet
											if(u.canDesign() &&  top.productdesigncontrol) top.productdesigncontrol();

											// set fsm to new form or draft state
											//f.workflow.clear();


											//window.f_config = f_config;
//debugger;
											// if( p.mode == 'installer') {
											// 	if(typeof p.onCloseCallback === 'function') p.onCloseCallback(l, f_config);
											// 	break;
											// }										

											/**
											 * activate designer shell 
											 */
//debugger;
											if( p.contextId) f_config.requireConfig.context = p.contextId;
											f_config.requireConfig.urlArgs = SPAFORM()['_'].urlArgs;
											var _require = requirejs.config( f_config.requireConfig);
											
											requirejs.onError = function(err) {
	//debugger;
												console.log('form-loader2 - requirejs error: '+err);
											}

											_require( ["jquery", "knockout", 'form2', 'fabriccomp'], function($, ko, frm) {
debugger;											
												window.ko = ko;
												$("#formContainer").html(frm.template);
												runtime = new frm.viewModel();// frm.config);
												SPAFORM().runtime = runtime;
//-->moved to openDesignProject												SPAFORM()['_'].designer = runtime;

//debugger;
// 												if( p.mode == 'installer') {
// 													_require(["form2-project"], function() { 
// debugger;
// 														SPAFORM().params.design = true;
// 														runtime.$registerComponents(registeredComponents).done(function(){
// debugger;															
// 															runtime.openAllColumnsProject();
// 														});													
// 														//self.openDesignProject(formConfig);
// 													});																					
// 													if(typeof p.onCloseCallback === 'function') p.onCloseCallback(l, f_config);
// 													return;
// 												}										
// 												else

												if( SPAFORM().params.mode == 'installer') {
													SPAFORM()['_'].designer = SPAFORM().runtime; 
													_require(["form2-project", "form2-components", "toolbar"], function() { //,"form2-components","toolbar"
		debugger;
											//self.$initializeIList(SPAFORM());
											//self.$initializeIListItem(SPAFORM());
				
												debugger;
														runtime.$initializeProject(SPAFORM());
														SPAFORM()['_'].createSpaformDesignerComponents();
														SPAFORM()['_'].createSpaformCacheRuntime();
														SPAFORM()['_'].setCachingStrategy();

														SPAFORM().params.design = true;

														if(SPAFORM().params.command) {
debugger;															
															//SPAFORM().project.searchConfig = _this.searchConfig;
															if(typeof SPAFORM().params.onCloseCallback === 'function') SPAFORM().params.onCloseCallback(SPAFORM().user, SPAFORM().runtime);
															return;
														}


														SPAFORM()['_'].designer.$registerComponents(SPAFORM()['_'].registeredComponents).done(function(){
													debugger;
															SPAFORM()['_'].designer.$formEnsureToolbar(function(){															
												debugger;								
																SPAFORM()['_'].designer.openAllColumnsProject(function(){
									debugger;								
																	if(typeof SPAFORM().params.onCloseCallback === 'function') SPAFORM().params.onCloseCallback(SPAFORM().list, formConfig);
																});
															});
														});													
														//self.openDesignProject(formConfig);
													}, function (err) {
									debugger;
														//The errback, error callback
														//The error has a list of modules that failed
														var failedId = err.requireModules && err.requireModules[0];
														if (failedId === 'jquery') {
															//undef is function only on the global requirejs object.
															//Use it to clear internal knowledge of jQuery. Any modules
															//that were dependent on jQuery and in the middle of loading
															//will not be loaded yet, they will wait until a valid jQuery
															//does load.
															requirejs.undef(failedId);
													
															//Set the path to jQuery to local path
															requirejs.config({
																paths: {
																	jquery: 'local/jquery'
																}
															});
													
															//Try again. Note that the above require callback
															//with the "Do something with $ here" comment will
															//be called if this new attempt to load jQuery succeeds.
															require(['jquery'], function () {});
														} else {
															//Some other error. Maybe show message to the user.
														}
													});																					
													return;
												}										
												else	
													runtime._formInit( f_config);
											});
											break;
						case 'formHeader':	
											document.getElementById("headerFormId").innerHTML = ID;
											document.getElementById("headerFormTitle").innerHTML = formData;
											document.getElementById("headerFormStatus").innerHTML = listName;
											break;
						case 'formError': 
											document.getElementById("formContainer").innerHTML = "PROXY ERROR: " + formData;
											break;																				
						// case 'builderReady': 
						// 					if(SPAFORM()['_'].publishProxyReady) SPAFORM()['_'].publishProxyReady();
						// 					break;																				
						// case 'builderCompleted': 
						// 					if(SPAFORM()['_'].publishComplete) SPAFORM()['_'].publishComplete(formData, listName);
						// 					break;																				
						// case 'searchConfigReady': 
						// 					if(SPAFORM()['_'].searchConfigProxyReady) SPAFORM()['_'].searchConfigProxyReady();
						// 					break;																				
						// case 'searchConfigCompleted': 
						// 					if(SPAFORM()['_'].searchConfigComplete) SPAFORM()['_'].searchConfigComplete(formData, listName);
						// 					break;																				
						default:			runtime.formListener(eventName, formData, ID);
					}
				
				}
				catch (error) {
					//debugger;
					document.getElementById("formContainer").innerHTML = "ERROR: " + error;
				}
				
				return true;				
			}
		})();

		if (typeof window.addEventListener !== 'undefined') {
			window.addEventListener('message', _formListener, false);
		}
		else if (typeof window.attachEvent !== 'undefined') {
			window.attachEvent('onmessage', _formListener);
		};

		//SPAFORM()._formListener = _formListener;
		SPAFORM()['_'].listeners.push(_formListener);
		
	}

    return formLoader;
/*
}));
*/
});

//(function () {	
//	var self = this;
	/**
	 * 	https://github.com/summernote/summernote
	 *	https://github.com/thingsinjars/jQuery-Scoped-CSS-plugin
	 *	https://github.com/Frontwise/grid-editor
	 *	https://github.com/guillaumepotier/Parsley.js/
	 *	https://github.com/OfficeDev/Office-UI-Fabric
	 *	https://github.com/knockout/knockout
	 *	https://github.com/twbs/bootstrap
	 *	https://github.com/FortAwesome/Font-Awesome
	 *	https://github.com/requirejs/requirejs
	 *	https://github.com/requirejs/text
	 *	https://github.com/guybedford/require-css
	 *  https://github.com/jensarps/AMD-cache 
	 *  http://marcj.github.io/css-element-queries/
	 */


//debugger;
	/*
	function create( htmlStr) {
		var frag = document.createDocumentFragment(),
			temp = document.createElement('div');
		temp.innerHTML = htmlStr; 
		while( temp.firstChild) {
			frag.appendChild( temp.firstChild);
		}
		return frag;
	};
	
	var formPath3 = _spPageContextInfo.webAbsoluteUrl.substring(0, _spPageContextInfo.webAbsoluteUrl.indexOf(_spPageContextInfo.webServerRelativeUrl));
	var formPath2 = formPath3 + JSRequest.PathName;
	var listName = formPath2.substring(formPath2.indexOf('/Lists/')+7, formPath2.lastIndexOf('/'));

	var runtime = (displayMode !== "Design") ? "&Runtime=true" : "";
	var design = (displayMode === "Design") ? "&DisplayMode=Design" : "";
	
	var itemID = JSRequest.QueryString["ID"];
	var formID = (itemID) ? "&ID=" + itemID : "";
	//
	// proxy iframe
	//
	var proxySrc = formPath2.substring(0, formPath2.lastIndexOf('/')) + '/Form/Runtime/model.proxy.aspx?List=' + listName + formID + runtime + design;
	var proxyData = "<iframe id='model-proxy' src='"+proxySrc+"' style='width:10;height:10;border:0; border:none; display:none;' />";
	var fragment = create(proxyData);
	document.body.insertBefore( fragment, document.body.childNodes[0]);
	*/
//})();

