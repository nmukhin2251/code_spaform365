// Recommended AMD module pattern for a Knockout component that:
//  - Can be referenced with just a single 'require' declaration
//  - Can be included in a bundle using the r.js optimizer
define(['text!checkbox.xml'], function( htmlString) {
	/**
	 * COMPONENT MODEL CONSTRUCTOR
	 */
	function checkbox( params) { 
		var self = this;
		
		this.internalName = (params) ? params.InternalName : '';
		
		var spaform = params.parentContext().spaform;
		
		var runtime = spaform.runtime;
		this.readonly = runtime.dataContext(params.namespace).readonly;//spaform.form.readonly;
		this.designmode = runtime.designMode; 
		
		this.$readonly = ko.pureComputed( function() { return this.readonly(); }, this);
		
		/**
		 * TITLE
		 * observable bound to component's html UI template to show Sharepoint column's 'Title'
		 * Title value passed via params of component's html notation on calling form's (viewmodel) html template
		 * Title parameter additionally declared at component's metadata (schema), enabling dynamic param's value update on 
		 * form's (viewmodel) html template from Sharepoint source on design mode.
		 */
		this.title = ko.observable((params) ? params.Title : '');
		/**
		 * DESCRIPTION	
		 * observable bound to UI html template to show sharepoint column's 'Description' 
		 * Description value passed via params of component's html notation on calling form's (viewmodel) html template
		 * Description parameter additionally declared at component's metadata (schema), enabling dynamic param's value update on 
		 * form's (viewmodel) html template from Sharepoint source on design mode.
		 */
		this.description = ko.observable((params) ? params.Description : '');
		/**
		 * REQUIRED	
		 */
		this.required = ko.observable((params) ? ((params.Required) ? params.Required : false) : false);
		/**
		 * VALUE	
		 */
		this.value = ko.observable(params.DefaultValue).extend({ namespace: params });
		/**
		 * COMPONENT VALIDATION	
		 */
		//if( ko.validation) {
			//var group = 'listItem';
		this.value.extend({ required: this.required() });
					  //.extend({ validationGroup: group });
		//};
		// -- ENABLE VALUE EDIT MODE
		// observable bound to UI html template to enable sharepoint column's 'Value'editing
		this.enabled = ko.pureComputed( function() {
			return this.$enabled();
		}, this);		
		this.enableValue = ko.pureComputed( function() { return (this.$enabled()) ? "" : "is-disabled"; }, this);
		this.enableRequired = ko.pureComputed( function() { return (this.required()) ? "is-required" : ""; }, this);		
		this.onclick = function(data, event) {
			if( !event.currentTarget.classList.contains('is-disabled')) {
				var checked = (event.currentTarget.classList.contains('is-checked')) ? false: true;
				self.value(checked);
			}
		};
		this.showTitle = ko.pureComputed(function() {
			return (this.title() && this.title().length > 0) ? true : false;
		}, this);
	}
	/**
	 * COMPONENT MODEL HELPER METHODS
	 */
	(function(){
		this.$enabled = function() {
			return (this.readonly()) ? 'is-disabled' : '';
		};	
		this.$init = function(element) {
			var elms = element.querySelectorAll(".validationBox");
			for(var i = 0; i < elms.length; i++) {
				this.fabricObject = {};
				this.fabricObject['validationBox'] = elms[i];
				if( ko.validation) {
					// knockout.validation.min.css overrides fabric.components.css to support dropdown validation
					var validationMessageElement = ko.validation.insertValidationMessage(this.fabricObject.validationBox);
					//additional span for validation message
					ko.applyBindingsToNode(validationMessageElement, { validationMessage: this.value  });
					//enable red border on validation errors
					ko.applyBindingsToNode(this.fabricObject.validationBox, { validationElement: this.value });
				}
			}						
		};
	}).call(checkbox.prototype);
	/**
	 * OPTIONAL COMPONENT METADATA DECLARATIONS ENABLING VISUAL DESIGN MODE SUPPORT
	 */
	checkbox.prototype.schema = {
		"Params": {
			"name": "",
			"namespace": "listItem",
			"promoted": true,
			"InternalName": "",
			"Title": "",
			"DefaultValue": undefined,
			"ReadOnlyField": false,
			"Required": false,
			"FieldTypeKind": 8,
			"Description": "Check Box"
		},
		"Permalink": "https://spaforms365.com/docs/syslib-checkbox/",
		"Connections" : {
			"ListItem" : ['Boolean'],
			"PromotedColumnXml": '<Field Type="Boolean"  Name="#params.InternalName#" Required="#params.Required#"  DisplayName="#params.Title#" Description="#params.Description#" Group="SPA FORMS 365" StaticName="#params.InternalName#" AllowDeletion="TRUE"></Field>'
			//"PromotedColumnXml": '<Field Type="Boolean"  Name="#params.InternalName#" Required="#params.Required#"  DisplayName="#params.Title#" Description="#params.Description#" Group="SPA FORMS 365" StaticName="#params.InternalName#" AllowDeletion="TRUE"><Default>#params.DefaultValue#</Default></Field>'
		}		
	};
	
    // Return component definition
    return { viewModel: checkbox, template: htmlString };
});

