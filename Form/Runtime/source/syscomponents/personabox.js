// Recommended AMD module pattern for a Knockout component that:
//  - Can be referenced with just a single 'require' declaration
//  - Can be included in a bundle using the r.js optimizer
define(['text!personabox.xml'], function( htmlString) { 
	/**
	 * COMPONENT MODEL CONSTRUCTOR
	 */

	function personabox( params) { 
		var self = this;
		
		this.internalName = (params) ? params.InternalName : '';
		
		var spaform = params.parentContext().spaform;
		
		var runtime = spaform.runtime;
		this.runtime = ko.observable(runtime);
		this.readonly = runtime.dataContext(params.namespace).readonly;//spaform.form.readonly;
		this.designmode = runtime.designMode; 
		
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
		 * COLOR	
		 */
		this.color = ko.observable((params && params.Color) ? params.Color : "ms-Persona-initials--green");
		/**
		 * MULTIPLY VALUES	
		 */
		this.allowmultiplevalues = ko.observable((params && params.AllowMultipleValues) ? params.AllowMultipleValues : false);
		/**
		 * VALUE	
		 * observable bound to UI html template to show sharepoint column's 'Value' 
		 */
		this.results = ko.observableArray([]);
		this.value = ko.observable({results:[]}).extend({ namespace: params });
		this.appendvalue = false;
//debugger;
//		var vv = this.value();
//debugger;
//this.appendvalue = true;
		//---> 5 lines below moved to $init      processValue(this.value());
this.appendvalue = false;

		// this.value.subscribe( function( val) {
		// 	this.processValue(val);
		// },this);
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
		
		this.showTitle = ko.pureComputed(function() {
			return (this.title() && this.title().length > 0) ? true : false;
		}, this);
		
		/**
		 * PEOPLE SEARCH BOX	
		 */
		this.query = ko.observable("");

		this.onfocus = ko.observable(false);
		this.querycache = ko.observable("");
		
		this.onfocus.subscribe( function( val) {
			
			console.log("subscribe onfocus: "+val);
						var self = this;

			//			if( val) this.query( this.querycache()); else setTimeout( function() { self.query(""); }, 500);
			//if( val) this.query( this.querycache());			
			if( !val) { 
				setTimeout(function() {
							if(self.fabricObject._contextualHostView) { 
							//debugger;
							if(self.fabricObject._contextualHostView._container.parentNode) self.fabricObject._contextualHostView.disposeModal();
							//delete this.fabricObject._contextualHostView;
							self.fabricObject._contextualHostView = undefined;
							/*
								if(self.fabricObject._selectedResult) {
									self.fabricObject._selectedResult = false;
									self.query("");
								*/
							}				
				}, 500);
			}
			
		}, this);
		
		this.options = {
			"minQueryLength" : 1,
			"maxResultsetLength" : 5
		};
		this.query.subscribe( function( squery) {
//debugger;
			console.log("subscribe squery: "+squery);

			if(this.onfocus()) { 
				this.querycache(squery);
			//				console.log("querycache: "+squery);
			}
			var self = this;
			if( squery.length <= this.options.minQueryLength) {
				this.results(this.$results([]));
				$(".ms-ContextualHost-main").hide();
				//if(this.fabricObject_contextualHostView) this.fabricObject_contextualHostView.disposeModal();
				//this.fabricObject_contextualHostView = null;
			}
			else { 

				console.log("request squery: "+squery);

				this.runtime()._formPeopleQuery( squery).done( function(resultset) {

					console.log("respond length: "+resultset.length);	

					if( resultset.length == 0) {
						$(".ms-ContextualHost-main").hide();
						//if(this.fabricObject_contextualHostView) this.fabricObject_contextualHostView.disposeModal();
						//this.fabricObject_contextualHostView = null;
					}
					else 	 				   $(".ms-ContextualHost-main").show();
					var newset = self.$results(resultset);

					console.log("newset length: "+newset.length);	

					self.results(newset);
				 });
			};
			//setTimeout( function() { self.modalHost();}, 200);
		}, this);
				
	};
	/**
	 * FABRIC UI PEOPLE PICKER COMPONENT OVERRIDES AND EXTENSIONS
	 */
	fabric.PeoplePicker.prototype._loadField = function() {

//		debugger;

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
		//return;		
		console.log("fabric.PeoplePicker.prototype._clickHandler");
		this._peoplePickerResults = this._peoplePickerMenu.querySelectorAll(".ms-PeoplePicker-result");
		console.log("results to show: " + this._peoplePickerResults.length + "modal host: " + this._contextualHostView);
		if( this._peoplePickerResults.length > 0 /*&& !this._contextualHostView*/) this._createModalHost(e);
	};
    fabric.PeoplePicker.prototype._removeToken = function (e) {
		var currentToken = this._findElement(e.target, "ms-Persona");
		var id = currentToken.querySelector(".ms-Persona-primaryText");
		//console.log('delete id: ' + id.innerText);
		if( this._removeCallback) this._removeCallback(id.innerText);
		currentToken.remove();
	};
    fabric.PeoplePicker.prototype._removeFirstToken = function () {
		var searchBox = this._container.querySelector(".ms-PeoplePicker-searchBox");
		var currentToken = searchBox.querySelector(".ms-Persona");
		if( currentToken) {
			var id = currentToken.querySelector(".ms-Persona-primaryText");
			//console.log('delete id: ' + id.innerText);
			//if( this._removeCallback) this._removeCallback(id.innerText);
			currentToken.remove();
		}
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
    fabric.PeoplePicker.prototype._selectResult = function (e) {
            e.stopPropagation();
			//debugger;
            var currentResult = this._findElement(e.target, "ms-Persona");
            var clonedResult = currentResult.cloneNode(true);
            // if facePile - add to members list / else tokenize
            if (this._container.classList.contains("ms-PeoplePicker--facePile")) {
                this._addResultToMembers(clonedResult);
            }
            else {
                this._tokenizeResult(clonedResult);
            }
            this._updateCount();
            // Close the open contextual host
if(this._contextualHostView)			
            this._contextualHostView.disposeModal();
this._contextualHostView = undefined;
this._selectedResult = true;

		var searchField = this._container.querySelector(".ms-TextField-field");
		searchField.value = '';


//delete this._contextualHostView;
    };
    fabric.PeoplePicker.prototype._contextHostCallBack = function () {

		//debugger;		
		console.log("fabric.PeoplePicker.prototype._contextHostCallBack");

		this._peoplePickerSearchBox.classList.remove("is-active");
		this._isContextualMenuOpen = false;
		
		//		var queryBox = this._container.querySelector(".ms-TextField-field");		
		//		if(!(queryBox === document.activeElement)) queryBox.value="";
	};
	
	/**
	 * COMPONENT MODEL HELPER METHODS
	 */
	(function(){
		this.$enabled = function() {
			return (this.readonly() || this.readonlyfield() ) ? false : true;
		};
		this.$processValue = function(val, test) {
			var self = this;

			var clr = function() {
				var node = self.fabricObject._peoplePickerMenu.querySelector(".ms-PeoplePicker-resultGroup"); 
				while (node.firstChild) {
					node.removeChild(node.firstChild);
				}							
			}
			//debugger;			
			if( !val) val = {};

			if( val.intname) {
				// 
				// {
				// 		intname: "AssignedToId",
				// 		keys[
				// 			"i:0#.w|domain\userlogin"
				// 		],
				// 		value: {
				// 			results: [
				// 				1
				// 			],
				// 			__metedata: { type: "Collection(Edm.Int32)"},
				// 		},
				// 		__metadata: {filedtype: "UserMulti"}
				// }
				if( val.intname != params.InternalName) {
					self.appendvalue = false;
					return;
				};
			}
			if( val.__metadata && val.__metadata.type == "SP.Data.UserInfoItem") {
//debugger;				
				val.results = (val.Id == -1) ? [] : [{"Title":val.Title, "Id":val.Id}]
				delete val.__metadata;
				delete val.Title;
				delete val.Id;
			}
			else 
			if( val.__metadata && val.__metadata.type == "Collection(Edm.Int32)") {
//debugger;				
			}		
			else {
				// ---> here picker selection returns array 'results'
				// array elements format:
				// {
				//   __metadata: { id: '', type: 'SP.Data.UserInfoItem' },
				//   Id: 1
				//   Key: 'i:0#.w|domain\userlogin'
				//   Title: 'LastName, FirstName'
				// }
				// 
				if( val && !val.results) val.results = [];
			}
			if( !self.appendvalue) {

				if(!test) {
//debugger;					
					// will bind results observable array to produce html markup
					self.query("");
					clr();
										
					var r = self.$fieldresults(val.results);				
					self.results(r);	
					setTimeout(function(){
//						debugger;				
						self.fabricObject._loadField();
						self.results([]);
						clr();
					}, 100);
				}
				else {
//				setTimeout( function() {
//debugger; 
					// capture html markup created by bound results observable array and copy into field
					self.fabricObject._loadField(); 
					// clear markup
					//self.results(self.$results([])); 
				}
//				}, 500); 
			}
			self.appendvalue = false;
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

//debugger;

				// on delete from list of selections				
				self.appendvalue = true;
				self.value(o);
				//self.appendvalue = false;
			};
//ebugger;
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

//debugger;
			var vl = this.value();
			this.$processValue(vl, false);

			this.value.subscribe( function( val) {
				this.$processValue(val,false);
console.log('#--> personabox value=' + this.value());				
			},this);

		
		};
		this.$initials = function( fullname) {
//debugger;			
			var a = fullname.split(",");
			var fc = (a[1]) ? a[1].trim().charAt(0) : "?";
			var sc = (a[0]) ? a[0].trim().charAt(0): "?";				
			var initials = fc + sc;
			return initials;
		};
		this.$results = function( resultset) {
			var self = this;
			var resultobjects = [];
			resultset.forEach( function( item, index) {
				resultobjects.push( 
				{
					'Color': this.color(),
					'Initials': this.$initials(item.DisplayText),
					'PrimaryText': item.DisplayText,
					'SecondaryText': item.EntityData.Department,
					'parent': this,
					'jsonObject': item,
					'onselect': function(data, event) { 
										var key = this.jsonObject.Key;
										this.parent.runtime()._formPeopleQuery( {userName: key}).done( function(user) {
//debugger;											
											var o = self.value();
											if( !self.allowmultiplevalues()) o.results = [];
											o.results.push({
												__metadata: { Id: "", "type":"SP.Data.UserInfoItem"},
												Title: user.Title,
												Id: user.Id,
												Key: key
											});
											if( !self.allowmultiplevalues()) self.fabricObject._removeFirstToken();
											self.fabricObject._selectResult(event); 
//ebugger;											
											self.appendvalue = true;
											self.value(o);
											// self.appendvalue = false; --> will cause multiply entries
										});
									}
				});
			}, this);
			return resultobjects;
		};
		this.$fieldresults = function( resultset) {
			var self = this;
			var resultobjects = [];
			resultset.forEach( function( item, index) {
				resultobjects.push( 
				{
					'Color': this.color(),
					'Initials': this.$initials(item.Title),
					'PrimaryText': item.Title,
					'SecondaryText': item.Id,	
					'jsonObject': item,
					'onselect': function(data, event) { self.fabricObject._selectResult(event); }
				});
			}, this);
			return resultobjects;
		};
		
	}).call(personabox.prototype);
	/**
	 * COMPONENT METADATA DECLARATIONS ENABLING VISUAL DESIGN MODE SUPPORT
	 * parameter names matching SharePoint field metadata used for dynamic component params linking 
	 */
	personabox.prototype.schema = {
		"Params": {
			"name": "",
			"namespace": "listItem",
			"promoted": true,
			"InternalName": "",
			"Title": "",
			"AllowMultipleValues": true,
			"Description": "",
			"DefaultValue": false,
			"LookupField": false,
			"LookupList": false,
			"LookupWebId": false,
			"Presence": false,
			"SelectionGroup": 0,
			"SelectionMode": 1,
			"ReadOnlyField": false,
			"FieldTypeKind": 20,
			"Color": "ms-Persona-initials--green", //"ms-Persona-initials--blue" "ms-Persona-initials--purple" "ms-Persona-initials--black"
			"ReadOnlyField": false,
			"Required": false
		},
		"Permalink": "https://spaforms365.com/docs/syslib-personabox/",
		"Connections" : {
			"ListItem" : ['UserMulti','User'],
			"PromotedColumnXml": '<Field Type="UserMulti" List="UserInfo" ShowField="ImnName"  UserSelectionMode="PeopleAndGroups" UserSelectionScope="0" Mult="#params.AllowMultipleValues#" Name="#params.InternalName#" Required="#params.Required#"  DisplayName="#params.Title#" Description="#params.Description#" Group="SPA FORMS 365" StaticName="#params.InternalName#" AllowDeletion="TRUE"></Field>'

//<Field Type="UserMulti" List="UserInfo" Name="AssignedTo" Mult="TRUE" ShowField="ImnName" DisplayName="Assigned To"  StaticName="AssignedTo" Required="FALSE" EnforceUniqueValues="FALSE" Group="" UserSelectionMode="PeopleAndGroups" UserSelectionScope="0" Version="2" RowOrdinal="0" Sortable="FALSE" />
			
		}
	};
    // Return component definition
    return { viewModel: personabox, template: htmlString };
});

