/**
 * Copyright spaforms365.com
 */
;
define(['require', 'knockout', 'spaform', 'jsm-statemachine', 'form2-ko'], function( require, ko, SPAFORM, StateMachine) {	
	(function () {

		var f = SPAFORM().form;
		var l = SPAFORM().list;
		var r = SPAFORM().runtime;

		var ctx = r.dataContext('listItem');

		f['_'].history = ko.observable([]).extend({ namespace: {
			namespace: 'runtime',
			InternalName: 'mwp_History',
			promoted: false, //true,
			Title: 'History'
		}});

		f['_'].attachmentsmap = ko.observable({results:[]}).extend({ namespace: {
			namespace: 'runtime',
			InternalName: 'mwp_Attachments',
			promoted: false, //true,
			Title: 'Attachments Map'
		}});
debugger;
		f['_'].state = ko.observable('spaf_000010newform').extend({ namespace: {
			namespace: 'runtime',
			InternalName: 'mwp_FormStateId',
			promoted: false, //true,
			Title: 'state'
		}});
		f['_'].stateInfo = ko.observable({"managerLoginName":""}).extend({ namespace: {
			namespace: 'runtime',
			InternalName: 'mwp_FormStateInfo',
			promoted: false, //true,
			Title: 'state'
		}});
		f.stateObject = function(stateId){
			return (f.startupComponentSchema) ? f.startupComponentSchema.Process.States[stateId] : {};
		};		
		f['_'].stateTitle = ko.observable('New Form').extend({ namespace: {
			namespace: 'runtime',
			InternalName: 'mwp_FormState',
			promoted: true, //true,
			Title: 'State'
		}});
		f['_'].state.subscribe(function(stateId){
			//var stateInfo = f.workflow.fsm.stateInfo(stateId);
			var stateInfo = f.stateObject(stateId);
			f['_'].stateTitle(stateInfo.label);
		});

		// f['_'].restoreState = function() {
		// 	var __listItemData = l.item['_'].data();
		// 	// ...
		// };

		f.history = {
			"log": function(message) {
				var timestamp = Date.now().toString();
				var logEntry = timestamp + ": " + message;
				var historyLog = f['_'].history();
				historyLog.push(logEntry);
				f['_'].history(historyLog);
			},
			"cache": ko.computed(function(){
				return f['_'].history();
			}, this)
		};

		f.state = ko.computed({			
			read: function() {

				// used by designer
// 				if( f.codePanel && f.codePanel.$schema.hasOwnProperty('LayoutId')) {
// 					//var st = f.codePanel.$schema.LayoutId;
// 					// if(st == 'abc') {
// 					// 	debugger;
// 					// }
// console.log('runtime.jsm.states.js:78 f.state() read: fixed state == f.codePanel.$schema.LayoutId - '+f.codePanel.$schema.LayoutId);
// 					return f.codePanel.$schema.LayoutId; //st;
// 				}
									
									
				var oob_state = (f.new()) ? 'spaf_000010newform' : 'spaf_00001000draft'; //'New Form' : 'Draft';
console.log('runtime.jsm.states.js:84  - form.state, oob_state: ' + oob_state);	
				var actual_state = (f['_'].state() == undefined) ? oob_state : f['_'].state();
console.log('runtime.jsm.states.js:86  - form.state, f[_].state(): ' + f['_'].state());	
console.log('runtime.jsm.states.js:86  - form.state, actual_state: ' + actual_state);	
				return  actual_state;
			},
			write: function(value) {
// if(value == 'abc') {
// 	debugger;
// }
//console.log('runtime.jsm.states.js:86 f.state() write:' + value);
				f['_'].state(value);
			},
			owner: this
		});


		// Workflow - finite state machine instance
		//debugger;
		f['_'].initfsm = function() {
			//debugger;
			f.workflow = {
				config: {
					default: {
						init: 'spaf_000010newform',//'New Form',
						transitions: [
							//state: *	
							{ name: 'goto', 				from: '*',  	   to: function(s) {return s}}//,
						],
						methods: {
							onEnterState: function(lifecycle) {
//debugger;
								console.log('onEnterState: '+lifecycle.to+' - transition: ' + lifecycle.transition);
// if( lifecycle.to == 'spaf_00001000draft' && lifecycle.transition == 'Init') {
// 	debugger;
// }
								var transitionInfo = lifecycle.fsm.transitionInfo(lifecycle.transition);
								if( transitionInfo && transitionInfo.component == 'transition_close') return; 

								f.state(lifecycle.to); 
							},
							onAfterTransition: function(lifecycle) {
//debugger;
//								console.log('onAfterTransition'); 

								var t = lifecycle.transition;
								if( t == 'Init' || t == 'goto')   return true;

								var transitionInfo = lifecycle.fsm.transitionInfo(lifecycle.transition);

								console.log('onAfterTransition: '+JSON.stringify(transitionInfo));

								if( transitionInfo) { // && transitionInfo.component == 'transition_close') return; 
									if( transitionInfo.component == 'transition_close')  return l.item.close();
									if( transitionInfo.component == 'transition_delete') return l.item.delete();
debugger;
									var moderationStatus = null;
									if(l.enableModeration) {
//debugger;										
										//0 = Approved, 1 = Rejected, 2 = Pending, 3 = Draft
										if(lifecycle.to == 'spaf_00001approved') moderationStatus = 0;
										if(lifecycle.to == 'spaf_00001complete') moderationStatus = 0;
										if(lifecycle.to == 'spaf_00001rejected') moderationStatus = 1;
										// direct overrides
										var stateInfo = lifecycle.fsm.stateInfo(lifecycle.to);
										switch(stateInfo.type) {
											case 'Completed': moderationStatus = 0; break;
											case 'Approved':  moderationStatus = 0; break;
											case 'Rejected':  moderationStatus = 1; break;
											default: ;
										}
									}

									if(transitionInfo.params && transitionInfo.params.logHistory && (transitionInfo.params.logHistory != "")) {
										var message = transitionInfo.params.logHistory;
										f.history.log(message);
									}

									var targetStateInfo = lifecycle.fsm.stateInfo(lifecycle.to);
									var email = f.startupComponentSchema.Process.Settings.emailNotification;
									var formData = {
										"send": false,
										"from": "spaform365@sharepoint.com",//email.sender,
										"manager": targetStateInfo.assignedTo.Manager,
										"to": targetStateInfo.assignedTo.Groups[0],
										"subject": email.subject,
										"body": email.body
									}

									var d = $.Deferred();
									if(transitionInfo.params && transitionInfo.params.emailNotification && (transitionInfo.params.emailNotification == true)) {

										formData["send"] = true;
										
										r.sendEmailNotification(formData).done(function(managerLoginName){
											f['_'].stateInfo({ "managerLoginName": managerLoginName });
											l.item.save(moderationStatus).done(function(){
												d.resolve();
											});
										});
									}
									else {
										if(targetStateInfo.assignedTo.Manager) {
											r.sendEmailNotification(formData).done(function(managerLoginName){
												f['_'].stateInfo({ "managerLoginName": managerLoginName });
												l.item.save(moderationStatus).done(function(){
													d.resolve();
												});
											});
										}
										else
											return l.item.save(moderationStatus);
									}
									return d.promise();
								}
							},
							onInit:     function() { 
//debugger;								
								console.log('onInit');    
							},
							onPendingTransition: function(transition, from, to) {
								//throw new Exception("transition already in progress");
								console.log('onPendingTransition tran: ' + transition + ' from: '+from+' to: '+to);
							}							
						}					
					},
					current: {}
				},
				'clear': function( state) {
//debugger;
// if( state == 'abc') {
// 	debugger;
// }					
					var w = f.workflow;
					//debugger;
					// if( l.enableModeration)	{
					// 	w.config.current = w.config.moderation;
					// 	if( state) w.config.current['init'] = state;
					// 	else       w.config.current['init'] = ( f.new()) ? "New Form" : "Pending";
					// }
					// else {
						w.config.current = w.config.default;
						if( state) w.config.current['init'] = state;
						else       w.config.current['init'] = ( f.new()) ? 'spaf_000010newform' : 'spaf_00001000draft';//"New Form" : "Draft";
					// }
					//debugger;				
					w.fsm = new StateMachine(w.config.current);	
// if( w.config.current['init'] == 'abc') {
// 	debugger;
// }
					f['_'].state(w.config.current['init']);
					//debugger;				
				},
				'load': function( state) {
//debugger;					
					var w = f.workflow;
					w.clear(state);
				},
				fsm: null
			};	
		}

		SPAFORM().list.item['_'].id.subscribe(function(val){
//debugger;	
			if(f.workflow && f.workflow.fsm) {
				var state = f.state();
				f.workflow.fsm.goto(state);
			}
		});

		
	})();
		
	(function () {
		ko.statesPool = {		
			// Defines a view model class you can use to populate a grid
			viewModel: function (configuration) {
//debugger;				
				this.schemas = configuration.statesPool;
				this.runtime = configuration.viewModel;
				// Templates used to render the grid
				this.templateEngine = new ko.nativeTemplateEngine();

//this.state = ko.observable('wrong state');
//debugger;
				//this.state = ko.observable('jsm.states test state').extend({ runtime: 'state' });
				this.stateId = ko.observable().extend({ namespace: {
					namespace: 'runtime',
					InternalName: 'mwp_FormStateId', //'state',
					promoted: false, //true,
					Title: 'state'
				}});
				this.stateInfo = ko.observable().extend({ namespace: {
					namespace: 'runtime',
					InternalName: 'mwp_FormStateInfo', //'state',
					promoted: false, //true,
					Title: 'stateInfo'
				}});

				this.componentId = ko.computed(function(){
					var f = SPAFORM().form;
					var u = SPAFORM().user;
					var state;
					if( f.codePanel && f.codePanel.$schema.hasOwnProperty('LayoutId')) {
						// used by designer 
						state = f.codePanel.$schema.LayoutId;
					}
					else {						
						state = this.stateId();

					}
						
					var st = f.startupComponentSchema.Process.States[state];
					var can_see = false;

					if( !f.codePanel) {
						// runtime mode; check assignedTo
debugger;						
						var j;						
						if( st.assignedTo.Everyone)	can_see = true;					
						//if( st.assignedTo.Manager)	can_see = true;	
						for( j = 0; j < st.assignedTo.Groups.length; j++) { 
							var group = st.assignedTo.Groups[j];											
							var in_group = ( u.userGroups.indexOf(group) > -1) ? true : false;
							if( in_group) can_see = true;
						}	
						if(st.assignedTo.Manager) {
							var stateInfo = this.stateInfo();
							if( stateInfo.managerLoginName && (stateInfo.managerLoginName == SPAFORM().user.loginName)) can_see = true;
						}			
						// for( j = 0; j < st.assignedTo.Users.length; j++) { 
						// 	var user = st.assignedTo.Users[j];											
						// 	var in_user = ( user == u.loginName) ? true : false;
						// 	if( in_user) can_see = true;
						// }				
					}
					else 
						can_see = true;
//console.log('||->STATES POOL state:'+state+' componentId:'+ ((st) ? st.componentId : ""));					
					return (st && can_see) ? st.componentId : "";
				}, this);


				this.templateEngine.addTemplate = function(templateName, templateMarkup) {
					//document.write("<script type='text/html' id='" + templateName + "'>" + templateMarkup + "<" + "/script>");
					var v = $("<script type='text/html' id='" + templateName + "'>" + templateMarkup + "<" + "/script>");
					//$('#templatesblock').append(v);
					$('#designertemplates').append(v);
				};
				this.componentsPoolTemplate = function() {
//debugger;	
					var result = '';
					var bid = (new Date()).getTime() - 1000;
					for( var key in this.schemas) {
						var schema = this.schemas[key];

						var id = "f"+ (bid++).toString().hashCode();

						var sb = new Sys.StringBuilder();
//debugger;						
						sb.append("<div title= \"" + schema.Title.toUpperCase() + "\" data-bind='visible: componentId() == \"" + schema.Id + "\"'>"	);
						//sb.append("<div data-bind='visible: state().length > 0'>"	);
//var t = this.runtime.state();						
						//sb.append("<div><span data-bind='text: state'></span>");
//var v = sb.toString();
						sb.append("<" + schema.Markup.tag);
						sb.append(" id='" + id + "'");
						sb.append(" params= \"");
	
						var params = JSON.stringify(schema.Params);
						params = params.substr(1); //remove first {
						params = params.substr(0, params.length-1); // remove last }
						params = params.replace(/"/g, "'");
						sb.append(params);
						
						sb.append("\">");
						sb.append("</" + schema.Markup.tag + ">\n");

						sb.append("</div>"	);
						result += sb.toString();
					}

					return result;
				};
				
				this.templateEngine.addTemplate("ko_statesPool", this.componentsPoolTemplate());				
			}
		};



		// The "statesPool" binding
		ko.bindingHandlers.statesPool = {
			init: function() {
				return { 'controlsDescendantBindings': true };
			},
			// This method is called to initialize the node, and will also be called again if you change what the grid is bound to
			update: function (element, viewModelAccessor, allBindings) {
//debugger;				
				var viewModel = viewModelAccessor();

				// Empty the element
				while(element.firstChild)
					ko.removeNode(element.firstChild);

				// Allow the default templates to be overridden
				var statesPoolTemplateName      = allBindings.get('statesPoolTemplate') || "ko_statesPool";

				// Render process Form
				var formContainer = element.appendChild(document.createElement("DIV"));
				ko.renderTemplate(statesPoolTemplateName, viewModel, { templateEngine: viewModel.templateEngine }, formContainer, "replaceNode");

			}
		};
	})();
	
	return;
});