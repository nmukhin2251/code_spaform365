// Recommended AMD module pattern for a Knockout component that:
//  - Can be referenced with just a single 'require' declaration
//  - Can be included in a bundle using the r.js optimizer
//define(['text!datetimebox.html', 'text!./../Runtime/syscomponents/datepicker.min.css','./../Runtime/syscomponents/jquery.datepicker', './../Runtime/syscomponents/pickadate'], function( htmlString, cssString) {
define(['text!datetimebox.xml', 'text!./../Runtime/source/syscomponents/datepicker.min.css', './../Runtime/source/syscomponents/pickadate'], function( htmlString, cssString) {
	/**
	 * LOAD STYLESHEET FOR THIS COMPONENT CLASS
	 */
	 
	(function(css) {
		var node = document.createElement('style');
		document.body.appendChild(node);
		node.innerHTML = css;
	}(cssString));
		
	/**
	 * COMPONENT MODEL CONSTRUCTOR
	 */
	function datetimebox( params) { 
		// initialise validation
		//ko.validation.init(); // <--- initialises the knockout validation object
		var _this = this;
		
		this.internalName = (params) ? params.InternalName : '';
		
		var spaform = params.parentContext().spaform;
		
		var runtime = spaform.runtime;
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
		this.description = ko.observable((params) ? params.Description : '');
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
		var processValue = function(val) {
			// convert ISO string received from SharePoint field
//debugger;						
			if( val && val.indexOf('-') > 0) {
				var d = new Date(val);			
				if(this.fabricObject) this.fabricObject.picker.set('select', [d.getFullYear(), d.getMonth(), d.getDate()]);
			}			
			if( val == null) _this.value('');
		};

				
		this.value = ko.observable().extend({ namespace: params });

		processValue(this.value());
		
		this.value.subscribe(function(val){
			
			processValue(val);
		}, this);
//debugger;
		//this.value.extend({ type: 'moment' });
		/**
		 * COMPONENT VALIDATION	
		 */
		if( ko.validation) {
			//var group = 'listItem';
			this.value.extend({ required: this.required() });
					  //.extend({ dateISO: true })
					  //.extend({ validationGroup: group });
		};
		// -- ENABLE VALUE EDIT MODE
		// observable bound to UI html template to enable sharepoint column's 'Value'editing
		this.enableValue = ko.pureComputed( function() { return this.$enabled(); }, this);
		this.enableRequired = ko.pureComputed( function() { return (this.required()) ? "is-required" : ""; }, this);		
		this.showTitle = ko.pureComputed(function() {
			return (this.title() && this.title().length > 0) ? true : false;
		}, this);

		setTimeout(function(){
			$('.ms-DatePicker-monthPicker').show();
			$('.ms-DatePicker-monthComponents').show();
			$('.ms-DatePicker-dayPicker').show();
		},500);
	};
	/**
	 * COMPONENT MODEL HELPER METHODS
	 */
	(function(){
		this.$enabled = function() {
			return (this.readonly() || this.readonlyfield() ) ? false : true;
		};		
		this.$init = function(element) {
			var _this = this;
			if (typeof fabric !== "undefined") {
				if ('DatePicker' in fabric) {
				  var elements = element.querySelectorAll('.ms-DatePicker');
				  var i = elements.length;
				  var component;
				  while(i--) {
//debugger;					  
					this.fabricObject = new fabric['DatePicker'](elements[i]);
//debugger;					
					/** Respond to built-in picker events. */
					this.fabricObject.picker.on({
						set: function (thingSet) {
							if(typeof thingSet === 'object') {
								_this.value( _this.fabricObject.picker.get('select', 'dd mmmm, yyyy'));
							}
						}
					});

					if(this.value() != '') {
						var d = new Date(this.value());				
						if(d) this.fabricObject.picker.set('select', [d.getFullYear(), d.getMonth(), d.getDate()]);
					}
					
					this.fabricObject["_dropdownIcon"] = elements[i].querySelector(".ms-DatePicker-event");
					//this.fabricObject._newDropdownLabel.innerHTML = this.value();
					if( ko.validation) {
						// added line 654 in knockout.validation.js : if( element.tagName == "SELECT") return init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
						// knockout.validation.min.css overrides fabric.components.css to support dropdown validation
						//var validationMessageElement = ko.validation.insertValidationMessage(this.fabricObject._newDropdownLabel);
						//additional span for validation message
						//ko.applyBindingsToNode(validationMessageElement, { validationMessage: this.value  });
						//enable red border on validation errors
						//ko.applyBindingsToNode(this.fabricObject._newDropdownLabel, { validationElement: this.value });
						//fix icon offset on validation error message display
						ko.applyBindingsToNode(this.fabricObject._dropdownIcon, { validationElement: this.value });
					}
				  }
				}
			};			
		};
	}).call(datetimebox.prototype);
	/**
	 * COMPONENT METADATA DECLARATIONS ENABLING VISUAL DESIGN MODE SUPPORT
	 * parameter names matching SharePoint field metadata used for dynamic component params linking 
	 */
	datetimebox.prototype.schema = {
		"Params": {
			"name": "",
			"namespace": "listItem",
			"promoted": true,
			"InternalName": "",
			"Title": "",
			"Description": "",
			"Format": "DateOnly",
			"FriendlyDisplayFormat": "Relative",
			"DefaultValue": "",
			"ReadOnlyField": false,
			"DisplayFormat": false,
			"FriendlyDisplayFormat": false,
			"FieldTypeKind": 4,
			"Required": false
		},
		"Permalink": "https://spaforms365.com/docs/syslib-datetimebox/",
		"Connections" : {
			"ListItem" : ['DateTime'],
			"PromotedColumnXml": '<Field Type="DateTime"  Name="#params.InternalName#" Required="#params.Required#"  DisplayName="#params.Title#" Description="#params.Description#"  Format="#params.DateOnly#" FriendlyDisplayFormat="#Relative#" Group="SPA FORMS 365" StaticName="#params.InternalName#" AllowDeletion="TRUE"></Field>'
		}
	};
    // Return component definition
    return { viewModel: datetimebox, template: htmlString };
});

