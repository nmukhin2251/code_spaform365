// Recommended AMD module pattern for a Knockout component that:
//  - Can be referenced with just a single 'require' declaration
//  - Can be included in a bundle using the r.js optimizer
define(['text!notebox.xml'], function( htmlString) {
	function notebox( params) { 
		var self = this;
		
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
		 * MAXLENGTH	
		 */
		this.maxlength = ko.observable((params) ? ((params.MaxLength) ? params.MaxLength : 10000) : 10000);
		/**
		 * DEFAULTVALUE	
		 */
		this.defaultvalue = ko.observable((params) ? ((params.DefaultValue) ? params.DefaultValue : "" ) : "");
		/**
		 * VALUE	
		 * observable bound to UI html template to show sharepoint column's 'Value' 
		 */
		
		this.numlines = ko.observable(params.NumLines);
		this.value = ko.observable().extend({ namespace: params });
		/**
		 * COMPONENT VALIDATION	
		 */
//		if( ko.validation) {
			//var group = 'listItem';
			this.value.extend({ required: this.required() })
					  .extend({ maxLength: params.MaxLength });
					  //.extend({ validationGroup: group });
//		};
		// -- ENABLE VALUE EDIT MODE
		// observable bound to UI html template to enable sharepoint column's 'Value'editing
		this.enableValue = ko.pureComputed( function() { return this.$enabled(); }, this);
		this.enableDescription = ko.pureComputed( function() { 
			return (this.value() && (this.value().length === 0 )) ? 'block' : 'none'; 
		}, this);
		this.enableRequired = ko.pureComputed( function() { return (this.required()) ? "is-required" : ""; }, this);
		this.showTitle = ko.pureComputed(function() {
			return (this.title() && this.title().length > 0) ? true : false;
		}, this);

	}
	/**
	 * COMPONENT MODEL HELPER METHODS
	 */
	(function(){
		this.$enabled = function() {
			return (this.readonly() || this.readonlyfield() ) ? false : true;
		};
		//called by $init binding handler on html template
		this.$init = function(element) {
			var elms = element.querySelectorAll(".ms-TextField");
			for(var i = 0; i < elms.length; i++) {
				this.fabricObject = new fabric['TextField'](elms[i]);
			}						
		};
	}).call(notebox.prototype);
    // Use prototype to declare any public methods
    //componentButtons.prototype.doSomething = function() { ... };
	notebox.prototype.schema = {
		"Params": {
			"name": "",
			"namespace": "listItem",
			"promoted": true,
			"InternalName": "",
			"Title": "",
			"Description": "",
			"MaxLength": 10000,
			"RichText": false,
			"NumLines": 6,
			"DefaultValue": "",
			"FieldTypeKind": 3,
			"ReadOnlyField": false,
			"Required": false
		},
		"Permalink": "https://spaforms365.com/docs/syslib-notebox/",
		"Connections" : {
			"ListItem" : ['Note'],
			"PromotedColumnXml": '<Field Type="Note" Name="#params.InternalName#" Required="#params.Required#"  DisplayName="#params.Title#" Description="#params.Description#" Group="SPA FORMS 365" RichText="#params.RichText#" NumLines="#params.NumLines#"  StaticName="#params.InternalName#" AllowDeletion="TRUE"></Field>'
		}
	};
	 
    // Return component definition
    return { viewModel: notebox, template: htmlString };
});

