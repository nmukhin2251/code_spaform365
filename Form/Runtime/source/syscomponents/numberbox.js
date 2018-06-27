// Recommended AMD module pattern for a Knockout component that:
//  - Can be referenced with just a single 'require' declaration
//  - Can be included in a bundle using the r.js optimizer
define(['text!numberbox.xml'], function( htmlString) {

	/**
	 * COMPONENT MODEL CONSTRUCTOR
	 */
	function numberbox( params) { 
		// initialise validation
		//ko.validation.init(); // <--- initialises the knockout validation object
		
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
		 * MAX	
		 */
		this.max = ko.observable((params) ? ((params.MaximumValue) ? params.MaximumValue : false) : false);
		/**
		 * MIN	
		 */
		this.min = ko.observable((params) ? ((params.MinimumValue) ? params.MinimumValue : false) : false);
		/**
		 * DEFAULTVALUE	
		 */
		this.defaultvalue = ko.observable((params) ? ((params.DefaultValue) ? params.DefaultValue : "" ) : "");
		/**
		 * PERCENTAGE	
		 */		
		this.percentage = ko.observable((params) ? ((params.Percentage) ? params.Percentage : false) : false);
		/**
		 * VALUE	
		 * observable bound to UI html template to show sharepoint column's 'Value' 
		 */
		//this.value = ko.observable().extend({ listItem: this.internalName });//.extend({ required: true }).extend({ minLength: 3 });
		this.value = ko.observable().extend({ namespace: params });

//debugger; //Math.ceil(o / 100)
		var v = this.value();
		this.value.subscribe(function(val){

		}, this);
		/**
		 * COMPONENT VALIDATION	
		 */
		//if( ko.validation) {
			this.value.extend({ required: this.required() })
					  .extend({ number: true });
					  //.extend({ validationGroup: params.namespace});
			if( this.max()) this.value.extend({ max: (this.percentage()) ? this.max()*100 : this.max() });
			if( this.min()) this.value.extend({ min: (this.percentage()) ? this.min()*100 : this.min() });
		//};
		// -- ENABLE VALUE EDIT MODE
		// observable bound to UI html template to enable sharepoint column's 'Value'editing
		this.enableValue = ko.pureComputed( function() { return this.$enabled(); }, this);
		this.enableDescription = ko.pureComputed( function() { 
			return (this.value().length === 0 ) ? 'block' : 'none'; 
		}, this);
		this.enableRequired = ko.pureComputed( function() { return (this.required()) ? "is-required" : ""; }, this);
		this.showTitle = ko.pureComputed(function() {
			return (this.title() && this.title().length > 0) ? true : false;
		}, this);
		
	};
	/**
	 * COMPONENT MODEL HELPER METHODS
	 */
	(function(){
		this.$enabled = function() {
			return (this.readonly() || this.readonlyfield() ) ? false : true;
		};		
	}).call(numberbox.prototype);
	/**
	 * COMPONENT METADATA DECLARATIONS ENABLING VISUAL DESIGN MODE SUPPORT
	 * parameter names matching SharePoint field metadata used for dynamic component params linking 
	 */
	numberbox.prototype.schema = {
		"Params": {
			"name": "",
			"namespace": "listItem",
			"promoted": true,
			"InternalName": "",
			"Title": "",
			"Description": "",
			"MaximumValue": 100,
			"MinimumValue": 0,
			"DefaultValue": false,
			"ReadOnlyField": false,
			"Percentage": false,
			"FieldTypeKind": 9,
			"Required": false
		},
		"Permalink": "https://spaforms365.com/docs/syslib-numberbox/",
		"Connections" : {
			"ListItem" : ['Number'],
			"PromotedColumnXml": '<Field Type="Number"  Name="#params.InternalName#" DisplayName="#params.Title#" Percentage="#params.Percentage#" Group="SPA FORMS 365" StaticName="#params.InternalName#" AllowDeletion="TRUE"></Field>'
		}
	};
	 
    // Return component definition
    return { viewModel: numberbox, template: htmlString };
});

