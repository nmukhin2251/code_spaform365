// Recommended AMD module pattern for a Knockout component that:
//  - Can be referenced with just a single 'require' declaration
//  - Can be included in a bundle using the r.js optimizer
define(['text!taxonomybox.xml'], function( htmlString) { //, cssString
	//, 'text!./../Runtime/syscomponents/peoplepicker.min.css','./../Runtime/syscomponents/jquery.peoplepicker'
	/**
	 * LOAD STYLESHEET FOR THIS COMPONENT CLASS
	 */
	 /*
	(function(css) {
		var node = document.createElement('style');
		document.body.appendChild(node);
		node.innerHTML = css;
	}(cssString));	
	*/

	/**
	 * COMPONENT MODEL CONSTRUCTOR
	 */
	function taxonomybox( params) { 
		var self = this;
		
		this.internalName = (params) ? params.InternalName : '';
		
		this.spaform = params.parentContext().spaform;
		
		this.runtime = ko.observable(this.spaform.runtime);
		this.readonly = this.spaform.form.readonly;
		this.designmode = this.spaform.runtime.designMode; 
		
		/**
		 * TITLE
		 * observable bound to component's html UI template to show Sharepoint column's 'Title'
		 * Title value passed via params of component's html notation on calling form's (viewmodel) html template
		 * Title parameter additionally declared at component's metadata (schema), enabling dynamic param's value update on 
		 * form's (viewmodel) html temlate from Sharepoint source on design mode.
		 */
		this.title = ko.observable((params) ? params.Title : '');
		/**
		 * DESCRIPTION	
		 * observable bound to UI html template to show sharepoint column's 'Description' 
		 * Description value passed via params of component's html notation on calling form's (viewmodel) html template
		 * Description parameter additionally declared at component's metadata (schema), enabling dynamic param's value update on 
		 * form's (viewmodel) html temlate from Sharepoint source on design mode.
		 */
		this.description = ko.observable((params && params.Description && (params.Description.length > 0)) ? params.Description : "type new user name...");
		/**
		 * REQUIRED	
		 */
		this.required = ko.observable((params) ? ((params.Required) ? params.Required : false) : false);
		/**
		 * READONLYFIELD	
		 */
		this.readonlyfield = ko.observable((params) ? ((params.ReadOnlyField) ? params.ReadOnlyField : false ): false);
		/**
		 * DEFAULTVALUE	
		 */
		this.defaultvalue = ko.observable((params) ? ((params.DefaultValue) ? params.DefaultValue : "" ) : "");
		/**
		 * VALUE	
		 * observable bound to UI html template to show sharepoint column's 'Value' 
		 */
		//this.value = ko.observable().extend({ listItem: {"internalName": this.internalName, "typeName": this.schema.Connections.ListItem }});//.extend({ required: true }).extend({ minLength: 3 });
		this.value = ko.observable({results:[]}).inNamespace( params.namespace, params.InternalName);//.extend({ listItem: this.internalName });//.extend({ required: true }).extend({ minLength: 3 });
		this.appendvalue = false;
		this.value.subscribe( function( val) {
			if( !val) val = {};
			if( val && !val.results) val.results = [];
			if( !this.appendvalue) {
				this.results(this.$fieldresults(val.results));
				setTimeout( function() { self.fabricObject._loadField(); self.results(self.$results([])); }, 50); 
			}
		},this);
		/**
		 * COMPONENT VALIDATION	
		 */
		if( ko.validation) {
			//var group = 'listItem';
			this.value.extend({ required: this.required() });
					  //.extend({ validationGroup: group });
		};
		// -- ENABLE VALUE EDIT MODE
		// observable bound to UI html template to enable sharepoint column's 'Value'editing
		this.enableValue = ko.pureComputed( function() { return (this.$enabled()) ? "" : "is-disabled"; }, this);
		this.showValue = ko.pureComputed( function() { return this.$enabled(); }, this);
		this.enableRequired = ko.pureComputed( function() { return (this.required()) ? "is-required" : ""; }, this);
		
		this.query = ko.observable("");
		this.options = {
			"minQueryLength" : 1,
			"maxResultsetLength" : 5
		};
		this.query.subscribe( function( squery) {
			var self = this;
			if( squery.length <= this.options.minQueryLength) {
				this.results(this.$results([]));
				$(".ms-ContextualHost-main").hide();
			}
			else this.runtime()._formPeopleQuery( squery).done( function(resultset) {
					if( resultset.length == 0) $(".ms-ContextualHost-main").hide();
					else 	 				   $(".ms-ContextualHost-main").show();
					self.results(self.$results(resultset));
				 });
		}, this);
		this.results = ko.observableArray([]);//this.results3);
	};
	/**
	 * FABRIC UI PEOPLE PICKER COMPONENT OVERRIDES AND EXTENSIONS
	 */
	fabric.PeoplePicker.prototype._loadField = function() {
		// Get all results
		this._peoplePickerResults = this._peoplePickerMenu.querySelectorAll(".ms-PeoplePicker-result");
		for (var i = 0; i < this._peoplePickerResults.length; i++) {
			var personaResult = this._peoplePickerResults[i].querySelector(".ms-Persona");
			var currentResult = personaResult;
			var clonedResult = currentResult.cloneNode(true);
			// if facePile - add to members list / else tokenize
			if (this._container.classList.contains("ms-PeoplePicker--facePile")) {
				this._addResultToMembers(clonedResult);
			}
			else {
				this._tokenizeResult(clonedResult);
			}
			this._updateCount();
		}
	};
	fabric.PeoplePicker.prototype._clickHandler = function (e) {
		this._peoplePickerResults = this._peoplePickerMenu.querySelectorAll(".ms-PeoplePicker-result");
		if( this._peoplePickerResults.length > 0) this._createModalHost(e);
	};
    fabric.PeoplePicker.prototype._removeToken = function (e) {
		var currentToken = this._findElement(e.target, "ms-Persona");
		var id = currentToken.querySelector(".ms-Persona-primaryText");
		//console.log('delete id: ' + id.innerText);
		if( this._removeCallback) this._removeCallback(id.innerText);
		currentToken.remove();
	};
	fabric.PeoplePicker.prototype._addRemoveBtn = function (persona, token) {
		
		var actionBtn;
		var actionIcon = document.createElement("i");
		if (token) {
			actionBtn = document.createElement("div");
			actionBtn.classList.add("ms-Persona-actionIcon");
			actionBtn.addEventListener("click", this._removeToken.bind(this), true);
		}
		else {
			actionBtn = document.createElement("button");
			actionBtn.classList.add("ms-PeoplePicker-resultAction");
			actionBtn.addEventListener("click", this._removeResult.bind(this), true);
		}
		actionIcon.classList.add("ms-Icon", "ms-Icon--Cancel");
		actionBtn.appendChild(actionIcon);
		persona.appendChild(actionBtn);
		this._isReadOnly(actionBtn);
	};
	
	/**
	 * COMPONENT MODEL HELPER METHODS
	 */
	(function(){
		this.$enabled = function() {
			return (this.readonly() || this.readonlyfield() ) ? false : true;
		};	
		this.$init = function(element) {
			var elm = element.querySelector(".ms-PeoplePicker");
			// override fabric ui
			var self = this;
			this.fabricObject = new fabric['PeoplePicker'](elm);
			this.fabricObject._isReadOnly = function( element) {
				//return (self.readonly() || self.readonlyfield() );
				ko.applyBindingsToNode(element, { visible: self.showValue });
			};
			this.fabricObject._removeCallback = function(id) {
				var o = self.value();
				var index = -1;
				o.results.forEach( function( item, idx) {
					if (item.Title == id) index = idx;
				});
				if( index >= 0) o.results.splice( index,1);
				self.appendvalue = true;
				self.value(o);
			};
			if( ko.validation) {
				// knockout.validation.min.css overrides fabric.components.css to support people picker validation
				var validationMessageElement = ko.validation.insertValidationMessage(this.fabricObject._container);
				//additional span for validation message
				ko.applyBindingsToNode(validationMessageElement, { validationMessage: this.value  });
				//enable red border on validation errors
				ko.applyBindingsToNode(this.fabricObject._container, { validationElement: this.value });
				//fix icon offset on validation error message display
				//ko.applyBindingsToNode(this.fabricObject._dropdownIcon, { validationElement: this.value });
			}
		};
		this.$results = function( resultset) {
			var self = this;
			var resultobjects = [];
			resultset.forEach( function( item, index) {
				// calculate initials
/*debugger;	*/			
				var a = item.DisplayText.split(",");
				var fc = (a[1]) ? a[1].trim().charAt(0) : "?";
				var sc = (a[0]) ? a[0].trim().charAt(0): "?";				
				var initials = fc + sc;
				
				resultobjects.push( 
				{
					'Color': "ms-Persona-initials--green",//item.Color,
					'Initials': initials,//item.Initials,
					'PrimaryText': item.DisplayText,//item.PrimaryText,
					'SecondaryText': item.EntityData.Department,//item.SecondaryText,
					'parent': this,
					'jsonObject': item,
					'onselect': function(data, event) { 
										var key = this.jsonObject.Key;
										this.parent.runtime()._formPeopleQuery( {userName: key}).done( function(user) {
											var o = self.value();
											o.results.push({
												__metadata: { Id: "", "type":"SP.Data.UserInfoItem"},
												Title: user.Title,
												Id: user.Id,
												Key: key
											});
											self.fabricObject._selectResult(event); 
											self.appendvalue = true;
											self.value(o);
										});
									}
				});
			}, this);
			return resultobjects;
		};
		this.$fieldresults = function( resultset) {
			var self = this;
			var resultobjects = [];
//debugger;											
			
			resultset.forEach( function( item, index) {
				var a = item.Title.split(",");
				var fc = (a[1]) ? a[1].trim().charAt(0) : "?";
				var sc = (a[0]) ? a[0].trim().charAt(0): "?";				
				var initials = fc + sc;
				resultobjects.push( 
				{
					'Color': "ms-Persona-initials--green",//item.Color,
					'Initials': initials ,//item.Initials,
					'PrimaryText': item.Title,//item.PrimaryText,
					'SecondaryText': item.Id,//item.SecondaryText,	
					'jsonObject': item,
					'onselect': function(data, event) { self.fabricObject._selectResult(event); }
				});
			}, this);
			return resultobjects;
		};
		
	}).call(taxonomybox.prototype);
	/**
	 * COMPONENT METADATA DECLARATIONS ENABLING VISUAL DESIGN MODE SUPPORT
	 * parameter names matching SharePoint field metadata used for dynamic component params linking 
	 */
	taxonomybox.prototype.schema = {
		"Params": {
			"name": "",
			"namespace": "listItem",
			"promoted": true,
			"InternalName": "",
			"Title": "",
			"AllowMultipleValues": false,
			"Description": "",
			"DefaultValue": false,
			"LookupField": false,
			"LookupList": false,
			"LookupWebId": false,
			"Presence": false,
			"SelectionGroup": 0,
			"SelectionMode": 1,
			"ReadOnlyField": false,
			"FieldTypeKind": 0,
			"Required": false
		},
		"Permalink": "https://spaforms365.com/docs/syslib-taxonomybox/",
		"Connections" : {
			"ListItem" : ['UserMulti']
		}
	};
    // Return component definition
    return { viewModel: taxonomybox, template: htmlString };
});

