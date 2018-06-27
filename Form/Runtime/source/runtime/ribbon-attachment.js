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
			
			//Close
			this.createGroup( ribbon, tab, name, Id, 'CloseGroup', 'Attachment', function(row, groupName) {
				_this.createControl( 'Close', ribbon, row, name, Id, groupName, function(Id, command) { 
					return {
						TemplateAlias: 'o1',
						ToolTipDescription: 'Close attachment preview',
						Image32by32: formatmap32x32,
						Image32by32Left: '-273',
						Image32by32Top: '-510',
						ToolTipTitle: 'Close Tab',
						LabelText: 'Close'
					};
				}); 			
			});			
			//Actions 		
			this.createGroup( ribbon, tab, name, Id, 'ActionsGroup', 'Actions', function(row, groupName){			
				_this.createControl( 'Download', ribbon, row, name, Id, groupName, function(Id, command) { 
					return {
						TemplateAlias: 'o1',
						ToolTipDescription: 'Download Attachment',
						Image32by32: formatmap32x32,
						Image32by32Left: '-509',
						Image32by32Top: '-68',
						ToolTipTitle: 'Download Attachment',
						LabelText: 'Download'
					};
				});
				SPAFORM().form.ribbon.addSubmitButton = function() {
					_this.createControl( 'CopyLink', ribbon, row, name, Id, groupName, function(Id, command) { 
						return {
							TemplateAlias: 'o1',
							ToolTipDescription: 'Copy Link',
							Image32by32: formatmap32x32,
							Image32by32Left: '-272',
							Image32by32Top: '-68',
							ToolTipTitle: 'Copy Link',
							LabelText: 'Copy Link'
						};
					});						
				}; 
			});

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
						
						Id + '.Command.CloseGroup.' + name,
						Id + '.Command.Close.' + name,

						Id + '.Command.ActionsGroup.' + name,
						Id + '.Command.Dowload.' + name,
						Id + '.Command.CopyLink.' + name
					];
			},
			canHandleCommand: function (commandId) {

				switch( commandId) {
					case Id + '.Command.Tab.' + name:	 				return true;
									
					case Id + '.Command.CloseGroup.' + name: 			return true;
					case Id + '.Command.Close.' + name: 				return true;

					case Id + '.Command.ActionsGroup.' + name:			return true;
					case Id + '.Command.Download.' + name:	 			return true;
					case Id + '.Command.CopyLink.' + name:	 			return true; 

					default: 											return false;
				}
				return false;
			},			
			handleCommand: function (commandId, properties, sequence) {

				var a = SPAFORM().form.attachments.get(name);

				switch( commandId) {
					case Id + '.Command.Close.' + name: 			a.close(); 
																	RefreshCommandUI();  
																	break;
					case Id + '.Command.Dowload.' + name: 			a.download(); 
																	break;
					case Id + '.Command.CopyLink.' + name:			a.copylink();
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
			Title: (f.startupComponentSchema) ? f.startupComponentSchema.Title : 'attachment',
			Require: {
				name: (f.startupComponentSchema) ? f.startupComponentSchema.Require.name.toLowerCase() : 'attachment'
			}
		};
		var ribbonId = 'FormAttachment';

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
