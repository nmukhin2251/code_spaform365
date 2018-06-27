// Recommended AMD module pattern for a Knockout component that:
//  - Can be referenced with just a single 'require' declaration
//  - Can be included in a bundle using the r.js optimizer
define(['text!textbox.xml'], function( htmlString) {

	/**
	 * COMPONENT VIEWMODEL CONSTRUCTOR
	 */
	function textbox( params) { 

		this.params = params;
//debugger;	
		this.internalName = (params) ? params.InternalName : '';

		var spaform = params.parentContext().spaform;
		
		var runtime = spaform.runtime;
		this.readonly = runtime.dataContext(params.namespace).readonly;//spaform.form.readonly;
		this.designmode = runtime.designMode; 

		//this.dataContext = (params.namespace) ? params.dataContext : "listItem";
		
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
		this.maxlength = ko.observable((params) ? ((params.MaxLength) ? params.MaxLength : 100) : 100);
		/**
		 * DEFAULTVALUE	
		 */
		this.defaultvalue = ko.observable((params) ? ((params.DefaultValue) ? params.DefaultValue : "" ) : "");
		/**
		 * VALUE	
		 * observable bound to UI html template to show sharepoint column's 'Value' 
		 */
//debugger;		
		//var toDataContext = function(c, v) { var x = {}; x[c] = v; return x; };
		//this.value = ko.observable().extend(toDataContext( this.dataContext, this.internalName));//.extend({ required: true }).extend({ minLength: 3 });		
		//this.value = ko.observable().extendInContext(this.dataContext, this.internalName);


		this.value = ko.observable(params.DefaultValue).extend({ namespace: params });//.extend({ validationGroup: params.namespace });
		//this.value = ko.observable(params.DefaultValue).inNamespace(params.namespace, params.InternalName);//.extend({ validationGroup: params.namespace });


		// can get data context:
		//var ctx = this.value.dataContext();
		/**
		 * COMPONENT VALIDATION	
		 */
		//if( ko.validation) {
		this.value.extend({ required: this.required() })
				  .extend({ maxLength: this.maxlength() });
					  //.extend({ validationGroup: params.namespace });
		//};
		// -- ENABLE VALUE EDIT MODE
		// observable bound to UI html template to enable sharepoint column's 'Value'editing
		this.enableValue = ko.pureComputed( function() { 
			return this.$enabled(); 
		}, this);
		this.enableDescription = ko.pureComputed( function() { 
			return (this.value() && (this.value().length === 0) ) ? 'block' : 'none'; 
		}, this);
		this.enableRequired = ko.pureComputed( function() { 
			return (this.required()) ? "is-required" : ""; 
		}, this);
		this.showTitle = ko.pureComputed(function() {
			return (this.title() && this.title().length > 0) ? true : false;
		}, this);
		
	};
	/**
	 * COMPONENT VIEWMODEL HELPER METHODS
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
	}).call(textbox.prototype);
	/**
	 * COMPONENT METADATA DECLARATIONS ENABLING VISUAL DESIGN MODE SUPPORT
	 * parameter names matching SharePoint field metadata used for dynamic component params linking 
	 */
	
	textbox.prototype.schema = {
		"Params": {
			"name": "",
			"namespace": "listItem",
			"promoted": true,
			"InternalName": "",
			"Title": "",
			"Description": "",
			"MaxLength": 100,
			"DefaultValue": "",
			"FieldTypeKind": 2,
			"ReadOnlyField": false,
			"Required": false
		},
		"Connections" : {
			"ListItem" : ['Text'],
			"PromotedColumnXml": '<Field Type="Text"  Name="#params.InternalName#" Required="#params.Required#"  DisplayName="#params.Title#" Description="#params.Description#" Group="SPA FORMS 365" MaxLength="#params.MaxLength#"  StaticName="#params.InternalName#" AllowDeletion="TRUE"><Default>#params.DefaultValue#</Default></Field>'
		},
		"Permalink": "https://spaforms365.com/docs/syslib-textbox/"
	};
	 
    // Return component definition
    return { viewModel: textbox, template: htmlString };
});

