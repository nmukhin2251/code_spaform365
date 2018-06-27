define(['require', 'spaform'], function( require, SPAFORM) {

	"use strict";
	
	var Ribbon = function(Id, schema) {
		this.loadRibbon(Id, schema);
	};

	(function() {

		this.ribbonTab = function (Id, schema) {

			var pageManager = SP.Ribbon.PageManager.get_instance();
			var ribbon = pageManager.get_ribbon();	
			if (ribbon) {
				var tab = this.createTab(Id, ribbon, schema);
			}
		};
		this.createControlProperties = function(name, params) {		
			var cp = new CUI.ControlProperties();
			cp.Command = params.Command + '.' + name;
			cp.Id = params.Id + '.' + name;
			cp.TemplateAlias = params.TemplateAlias;//'o1';
			if( params.ToolTipDescription) cp.ToolTipDescription = params.ToolTipDescription;//'Save changes for component on tab. Clear history of changes accessible via Undo/Redo commands on this tab';
			if( params.Image32by32) cp.Image32by32 = params.Image32by32;//'_layouts/15/images/placeholder32x32.png';
			if( params.Image32by32Left) cp.Image32by32Left =  params.Image32by32Left;//'-305';
			if( params.Image32by32Top) cp.Image32by32Top =  params.Image32by32Top;//'-475';
			if( params.ToolTipTitle) cp.ToolTipTitle =  params.ToolTipTitle;//'Save Component';
			if( params.LabelText) cp.LabelText =  params.LabelText;//'Save';
			if( params.QueryCommand) cp.QueryCommand = params.QueryCommand + '.' + name;
			if( params.PopulateQueryCommand) cp.PopulateQueryCommand = params.PopulateQueryCommand + '.' + name;
			if( params.PopulateDynamically) cp.PopulateDynamically = params.PopulateDynamically;
			if( params.PopulateOnlyOnce) cp.PopulateOnlyOnce = params.PopulateOnlyOnce;
			return cp;
		};
		this.createControlComponent = function(ribbon, name, group, params) {
			var props = this.createControlProperties( name, params);
			var button;
			if( params.PopulateQueryCommand) {
				button = new CUI.Controls.FlyoutAnchor(ribbon, group + '.' + name, props);
			} else if(params.QueryCommand) {
				button = new CUI.Controls.ToggleButton(ribbon, group + '.' + name, props);
			} else {			
				button = new CUI.Controls.Button(ribbon, group + '.' + name, props);
			}
			var controlComponent = button.createComponentForDisplayMode('Large');
			return controlComponent;
		};
		this.createGroup = function(ribbon, tab, name, Id, groupName, groupTitle, callback) {
			var group = new CUI.Group(ribbon, Id + '.Tab.'+ groupName +'.'+name, groupTitle, 'Group Description', Id + '.Command.' + groupName + '.'+name, null);
			tab.addChild(group);

			var layout = new CUI.Layout(ribbon, Id + '.Tab.' + groupName + '.Layout.'+name, 'The.Layout.'+ groupName);
			group.addChild(layout);

			var section = new CUI.Section(ribbon, Id + '.Tab.' + groupName + '.Section.'+name, 2, 'Top'); //2==OneRow
			layout.addChild(section);

			var row = section.getRow(1);
			callback(row, groupName);

			group.selectLayout('The.Layout.'+ groupName);

		};
		this.createControl = function(command, ribbon, row, name, Id, groupName, callback) {
			
			var options = callback(Id, command);
			options['Command'] = Id + '.Command.' + command;
			options['Id'] = Id + '.' + command + '.ControlProperties';

			row.addChild(this.createControlComponent( ribbon, name, Id + '.Tab.' + groupName + '.' + command, options));
		};

		this.createTab = function (Id, ribbon, schema) {
			
			var _this = this;

			var command = Id + '.Command.Tab.' + schema.Require.name.toLowerCase();
			var tabId = Id + '.Tab.' + schema.Require.name.toLowerCase();
			var name = schema.Require.name.toLowerCase();
			var tabTitle = schema.Title.toUpperCase();					

			var formPath3 = _spPageContextInfo.webAbsoluteUrl.substring(0, _spPageContextInfo.webAbsoluteUrl.indexOf(_spPageContextInfo.webServerRelativeUrl));
			var formPath2 = formPath3 + JSRequest.PathName;
			var listName = formPath2.substring(formPath2.indexOf('/Lists/')+7, formPath2.lastIndexOf('/'));
			var formatmap32x32 = formPath2.substring(0, formPath2.lastIndexOf('/')) + '/Form/Runtime/formatmap32x32.png?rev23';//?List=' + listName;

			var tab = new CUI.Tab(ribbon, tabId, tabTitle, 'Tab description', command, false, '', null, null);
			ribbon.addChild(tab);
			tab.set_selected_old = tab.set_selected;
			tab.set_selected = function( param) {
				tab.set_selected_old(param);
				$(document).trigger('ribbontabselected', [ribbon.get_selectedTabCommand()]);
			};

			var props = [];
			
			//Manage
			this.createGroup( ribbon, tab, name, Id, 'ManageGroup', 'Manage', function(row, groupName) {
				_this.createControl( 'Edit', ribbon, row, name, Id, groupName, function(Id, command) { 
					return {
						QueryCommand: Id + 'Command.Query' + command,
						TemplateAlias: 'o1',
						ToolTipDescription: 'Use this button',
						Image32by32: formatmap32x32,
						Image32by32Left: '-509',
						Image32by32Top: '-100',
						ToolTipTitle: 'A Button',
						LabelText: 'Edit'
					};
				}); 			
			});			
			//Commit	
			this.createGroup( ribbon, tab, name, Id, 'CommitGroup', 'Commit', function(row, groupName){			
				_this.createControl( 'Save', ribbon, row, name, Id, groupName, function(Id, command) { 
					return {
						TemplateAlias: 'o1',
						ToolTipDescription: 'Save form data & return to default list view',
						Image32by32: formatmap32x32,
						Image32by32Left: '-305',
						Image32by32Top: '-475',
						ToolTipTitle: 'Save data & Exit',
						LabelText: 'Save'
					};
				}); 			
				_this.createControl( 'Close', ribbon, row, name, Id, groupName, function(Id, command) { 
					return {
						TemplateAlias: 'o1',
						ToolTipDescription: 'Do not save form data & return to default list view',
						Image32by32: formatmap32x32,
						Image32by32Left: '-273',
						Image32by32Top: '-510',
						ToolTipTitle: 'Dismiss data changes & Exit',
						LabelText: 'Close'				
					};
				});
			});
			//Actions 		
			this.createGroup( ribbon, tab, name, Id, 'ActionsGroup', 'Actions', function(row, groupName){			
				_this.createControl( 'Delete', ribbon, row, name, Id, groupName, function(Id, command) { 
					return {
						TemplateAlias: 'o1',
						ToolTipDescription: 'Delete form list item & return to default list view.',
						Image32by32: formatmap32x32,
						Image32by32Left: '-509',
						Image32by32Top: '-68',
						ToolTipTitle: 'Delete item & Exit',
						LabelText: 'Delete'
					};
				});
				SPAFORM().form.ribbon.addSubmitButton = function() {
					_this.createControl( 'Submit', ribbon, row, name, Id, groupName, function(Id, command) { 
						return {
							TemplateAlias: 'o1',
							ToolTipDescription: 'Save form data, mark form as readonly and Submit for processing. Return to default list view.',
							Image32by32: formatmap32x32,
							Image32by32Left: '-272',
							Image32by32Top: '-68',
							ToolTipTitle: 'Save & Submit for processing',
							LabelText: 'Submit'
						};
					});						
				}; 
				SPAFORM().form.ribbon.addCancelButton = function() {
					_this.createControl( 'Cancel', ribbon, row, name, Id, groupName, function(Id, command) { 
						return {
							TemplateAlias: 'o1',
							ToolTipDescription: 'Use this button.',
							Image32by32: formatmap32x32,
							Image32by32Left: '-272',
							Image32by32Top: '-102',
							ToolTipTitle: 'Cancel form processing and keep form as readonly. return to default list view',
							LabelText: 'Cancel'
						};
					});						
				};
			});
			//Design
			var designControl = function() {
				_this.createGroup( ribbon, tab, name, Id, 'DesignGroup', 'Design', function(row, groupName){			
					_this.createControl( 'Design', ribbon, row, name, Id, groupName, function(Id, command) { 
						return {
							TemplateAlias: 'o1',
							ToolTipDescription: 'Open SPA Form Designer 365',
							Image32by32: formatmap32x32,
							Image32by32Left: '-477',
							Image32by32Top: '-2',
							ToolTipTitle: 'Open SPA Form Designer 365',
							LabelText: 'Designer'
						};
					}); 
				});
				RefreshCommandUI(); 
			};
			var exploreControl = function() {
				_this.createGroup( ribbon, tab, name, Id, 'DesignGroup', 'Design', function(row, groupName){			
					_this.createControl( 'Explore', ribbon, row, name, Id, groupName, function(Id, command) { 
						return {
							TemplateAlias: 'o1',
							ToolTipDescription: 'Access source code files via Windows Explorer. Enabled & supported in Internet Explorer web browser only.',
							Image32by32: formatmap32x32,
							Image32by32Left: '-205',
							Image32by32Top: '-307',
							ToolTipTitle: 'Explore Files',
							LabelText: 'Explore Files'
						};
					}); 
				});
				RefreshCommandUI(); 
			};

			top.productdesigncontrol = (SPAFORM().params.debug == true) ? exploreControl : designControl;
	
			if(SPAFORM().user.canDesign()) {
				if(SPAFORM().params.debug == true) 
					setTimeout(function() { exploreControl(); }, 200);
				else 
					setTimeout(function() { designControl(); }, 200);
			}

			this.showTab = function(Id, name) {
				try { ribbon.removeChild("Ribbon.ListForm.Display"); } catch (e) { };
				try { ribbon.removeChild("Ribbon.ListForm.Edit"); } catch (e) { };
				try { ribbon.removeChild("Ribbon.WebPartPage"); } catch (e) { };
				//try { ribbon.removeChild("FormEdit.Tab._PROJECT_"); } catch (e) { };		
			
				var tabId = Id + '.Tab.' + name;
				SelectRibbonTab(tabId, true);
				document.getElementsByClassName('ms-cui-tabContainer')[0].style.display = "block";	
			};
			this.showTab(Id, name);
			return tab;

		};				

		this.loadRibbon = function (Id, schema) {
			var _this = this;
			SP.SOD.executeOrDelayUntilScriptLoaded(function () {
				try {
					var pm = SP.Ribbon.PageManager.get_instance();
					pm.add_ribbonInited(function () {
						_this.ribbonTab(Id, schema);
					});
					var ribbon = null;
					try {
						ribbon = pm.get_ribbon();
					}
					catch (e) { }
					if (!ribbon) {
						if (typeof (_ribbonStartInit) == "function")
							_ribbonStartInit(_ribbon.initialTabId, false, null);
					}
					else {
						_this.ribbonTab(Id, schema);
					}
				} catch (e)
				{ }
			}, "sp.ribbon.js");
		};			
	}).call(Ribbon.prototype);
	
	var PageComponent = function( Id, schema) {
	
		this.instance = null;

		var name = schema.Require.name;		

		Type.registerNamespace( Id + '.Ribbon.'+ name);
		

		window[Id].Ribbon[name] = function () {
			window[Id].Ribbon[name].initializeBase(this);
		}
			
		// the initialize function needs to be called by some script added to the page elsewhere - in the end, it does the important work 
		// of calling PageManager.addPageComponent()..
		window[Id].Ribbon[name].initialize = function () {
			ExecuteOrDelayUntilScriptLoaded(Function.createDelegate(null, window[Id].Ribbon[name].initializePageComponent), 'SP.Ribbon.js');
		}
		window[Id].Ribbon[name].initializePageComponent = function() {
			
			var ribbonPageManager = SP.Ribbon.PageManager.get_instance();
			if (null !== ribbonPageManager) {
				ribbonPageManager.addPageComponent(window[Id].Ribbon[name].instance);
			}
		}
			
		window[Id].Ribbon[name].prototype = {
			init: function () { },
			receiveFocus: function() {
				return true;
			},
			yieldFocus: function() {
				return true;
			},
			isFocusable: function() {
				return true;
			},
			getFocusedCommands: function () {
				return [Id + '.Command.FieldControl.GroupCommand', 
						Id + '.Command.FieldControl.TabCommand', 
						Id + '.Command.FieldControl.ContextualGroupCommand', 
						Id + '.Command.FieldControl.RibbonCommand'];
			},			
			getGlobalCommands: function () {
				return [
						Id + '.Command.Tab.' + name,
						
						Id + '.Command.ManageGroup.' + name,
						Id + '.Command.Edit.' + name,
						Id + '.Command.QueryEdit.' + name,

						Id + '.Command.CommitGroup.' + name,
						Id + '.Command.Save.' + name,
						Id + '.Command.Close.' + name,

						Id + '.Command.ActionsGroup.' + name,
						Id + '.Command.Delete.' + name,
						Id + '.Command.Submit.' + name,
						Id + '.Command.Cancel.' + name,

						Id + '.Command.DesignGroup.' + name,
						Id + '.Command.Design.' + name,
						Id + '.Command.Explore.' + name
					];
			},
			canHandleCommand: function (commandId) {

				var r = SPAFORM().form.ribbon;

				switch( commandId) {
					case Id + '.Command.Tab.' + name:	 				return true;
				
					case Id + '.Command.DesignGroup.' + name:			var upgradeBox = document.getElementById(Id + '.Tab.DesignGroup.'+name);
																		upgradeBox.style.cssFloat = "right";	
																		return true;
					case Id + '.Command.Explore.' + name:				return r.enableExplore(); 
					case Id + '.Command.Design.' + name:				return r.enableDesign();
	
					case Id + '.Command.ManageGroup.' + name:			return true;
					case Id + '.Command.Edit.' + name: 					return r.enableEdit();
					case Id + '.Command.QueryEdit.' + name:  			return true;
					
					case Id + '.Command.CommitGroup.' + name: 			return true;
					case Id + '.Command.Save.'	+ name: 				return r.enableSave(); 
					case Id + '.Command.Close.' + name: 				return r.enableClose();

					case Id + '.Command.ActionsGroup.' + name:			return true;
					case Id + '.Command.Delete.' + name:	 			return r.enableDelete();
					case Id + '.Command.Cancel.' + name:	 			return r.enableCancel(); 					
					case Id + '.Command.Submit.' + name: 				return r.enableSubmit(); 
					default: 											return false;
				}
				return false;
			},			
			handleCommand: function (commandId, properties, sequence) {

				var f = SPAFORM().form;
				var r = f.ribbon;

				switch( commandId) {
					case Id + '.Command.Edit.' + name:	 			r.actionEdit(properties.On); 
																	break;
					case Id + '.Command.QueryEdit.' + name: 		properties[CUI.Controls.ToggleButtonCommandProperties.On] = r.queryEdit(); 
																	break;				
					case Id + '.Command.Save.' + name:				f.closeOnClick = true;
															 		r.actionSave(); 
																	RefreshCommandUI();  
																	break;
					case Id + '.Command.Delete.' + name:			f.closeOnClick = true;
																	r.actionDelete(); 
																	RefreshCommandUI();  
																	break;
					case Id + '.Command.Cancel.' + name:			f.closeOnClick = true;
																	r.actionCancel(); 
																	RefreshCommandUI();  
																	break;
					case Id + '.Command.Close.' + name: 			r.actionClose(); 
																	RefreshCommandUI();  
																	break;
					case Id + '.Command.Explore.' + name: 			r.actionExplore(); 
																	break;
					case Id + '.Command.Design.' + name: 			window.location = window.location.href + "&DisplayMode=Design"; 
																	RefreshCommandUI();  
																	break;
					case Id + '.Command.Submit.' + name:			f.closeOnClick = true;
																	r.actionSubmit();
																	RefreshCommandUI();  
																	break;
					default: 										return;
				}
				return true;
			}
			
		}
		
		window[Id].Ribbon[name].registerClass(Id + '.Ribbon.'+name, CUI.Page.PageComponent);
		this.instance = new window[Id].Ribbon[name]();
		window[Id].Ribbon[name].instance = this.instance;
		window[Id].Ribbon[name].initialize();
			
		return this;
	};
	
	(function() {
		this.destroy = function () { 
			var ribbonPageManager = SP.Ribbon.PageManager.get_instance();
			if (null !== ribbonPageManager) {
				ribbonPageManager.removePageComponent(this.instance);
			}
		};
	}).call(PageComponent.prototype);
	
	// constructor
	var createRibbon = function( schemaInfo) {

		var f = SPAFORM().form;

		var schema = (schemaInfo) ? schemaInfo : {
			Title: (f.startupComponentSchema) ? f.startupComponentSchema.Title : 'FORM',
			Require: {
				name: (f.startupComponentSchema) ? f.startupComponentSchema.Require.name : 'FORM'
			}
		};
		var ribbonId = 'FormEdit';

		var getTabCommandId = function() {
			return ribbonId + '.Command.Tab.' + schema.Require.name.toLowerCase();
		};

		var getTabId = function() {
			return ribbonId + '.Tab.' + schema.Require.name.toLowerCase();
		};
	
		var ribbonTab = new Ribbon( ribbonId, schema);
		var ribbonPageComponent = new PageComponent( ribbonId, schema, null);
		
		RefreshCommandUI();   // shows tab

		return {
			pageComponent: ribbonPageComponent,
			close: function() {
				var pageManager = SP.Ribbon.PageManager.get_instance();
				var ribbon = pageManager.get_ribbon();	
				if( ribbon) {
					try { 
						ribbon.removeChild(getTabId()); 
					} catch (e) { };
				}
				if( ribbonPageComponent !== null) {
					ribbonPageComponent.destroy();
					ribbonPageComponent = null;
				}
				RefreshCommandUI(); 
				return null;
			},
			select: function() {
				ribbonTab.showTab( ribbonId, schema.Require.name.toLowerCase());
				return this;
			},
			onSelected: function(callback) {
				var _this = this;
				$(document).on('ribbontabselected', function(e, commandId) {
					if( typeof callback === 'function' && (commandId == getTabCommandId())) callback( _this);
				});	
				return this;
			}
		}
	}

	return createRibbon;
	
});	
