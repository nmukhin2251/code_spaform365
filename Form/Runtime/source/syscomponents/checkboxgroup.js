// Recommended AMD module pattern for a Knockout component that:
//  - Can be referenced with just a single 'require' declaration
//  - Can be included in a bundle using the r.js optimizer
define(['text!checkboxgroup.xml'], function( htmlString) {
	/**
	 * COMPONENT MODEL CONSTRUCTOR
	 */
	function checkboxgroup( params) { 
	
		var spaform = params.parentContext().spaform;
		
		var runtime = spaform.runtime;
		this.readonly = runtime.dataContext(params.namespace).readonly;//spaform.form.readonly;
		this.designmode = runtime.designMode; 

		this.$readonly = ko.pureComputed( function() { return this.readonly(); }, this);

		
		this.internalName = (params) ? params.InternalName : '';
		//this.availablechoices = (params) ? JSON.parse('["' + params.Choices.split(',').join('","') + '"]') : [];
		this.availablechoices = (params) ? params.Choices : [];
		
		this.choices = ko.observableArray(this.$choices(this.availablechoices));
		
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
		 * READONLYFIELD	
		 */
		this.readonlyfield = ko.observable((params) ? ((params.ReadOnlyField) ? params.ReadOnlyField : false ): false);
		/**
		 * DEFAULTVALUE	
		 */
		this.defaultvalue = ko.observable((params) ? ((params.DefaultValue) ? params.DefaultValue : "" ) : "");
		/**
		 * DEFAULTMESSAGE
		 */
		this.defaultmessage = ko.observable((params) ? ((params.DefaultMessage) ? params.DefaultMessage : "" ) : "");
		/**
		 * VALUE	
		 */
		this.value = ko.observable().extend({ namespace: params });
		/**
		 * COMPONENT VALIDATION	
		 */
		if( ko.validation) {
			//var group = 'listItem';
			this.value.extend({ required: this.required() });
					  //.extend({ validationGroup: group });
		};
		/**
		 * FABRIC UI CHECKBOX CONTROL BINDING	
		 */
		this.value.subscribe( function( val) {
//debugger;			
			if( !this.required()) {
				if( !val || (val == "")) { 
					val = {};
					val.results = [];
					this.value( val);
				}
			}
			var selectedchoices = (val) ? val.results : [];
			this.choices(this.$choices(this.availablechoices, selectedchoices));
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
		this.$update = function( key, add) {
			var val = this.value();
			if( add) {
				if( !val || val == "") { val = {}; this.value( val); }
				if( !val.results) val.results = [];
				val.results.push(key);
			}
			else {
				val.results.splice( val.results.indexOf(key), 1);
				if( this.required() && val.results.length == 0) val = undefined;
			}
			this.value(val);
		};
		this.$choices = function( choices, selectedchoices) {
			var choiceobjects = [];
			choices.forEach( function( key, index) {
				choiceobjects.push( 
				{
					'key' 	 : key, 
					'parent': this,
					'checked': ko.observable(''),
					'onclick': function(data, event) {
									if( !event.currentTarget.classList.contains('is-disabled')) {
										this.checked( (event.currentTarget.classList.contains('is-checked')) ? false : true);
										this.parent.$update( this.key, !event.currentTarget.classList.contains('is-checked'));
									}
								}
				});
			}, this);
			if( selectedchoices) {
				selectedchoices.forEach( function( key, index) {
					var results = $.grep( choiceobjects, function(choiceobject){ return choiceobject.key == key});
					if( results.length == 1) results[0].checked(true);
				}, this);
			};
			return choiceobjects;
		};
	}).call(checkboxgroup.prototype);
	/**
	 * OPTIONAL COMPONENT METADATA DECLARATIONS ENABLING VISUAL DESIGN MODE SUPPORT
	 */
	checkboxgroup.prototype.schema = {
		"Params": {
			"name": "",
			"namespace": "listItem",
			"promoted": true,
			"InternalName": "",
			"Title": "",
			"Description": "",
			"ReadOnlyField": false,
			"Required": false,
			"FieldTypeKind": 15,
			"DefaultValue": undefined,
			"Choices": ['Choice 1', 'Choice 2']
		},
		"Permalink": "https://spaforms365.com/docs/syslib-checkboxgroup/",
		"Connections" : {
			"ListItem" : ['MultiChoice'],
			"PromotedColumnXml": '<Field Type="MultiChoice" Name="#params.InternalName#" Required="#params.Required#"  DisplayName="#params.Title#" Description="#params.Description#" Group="SPA FORMS 365"  StaticName="#params.InternalName#" AllowDeletion="TRUE"></Field>'
		}		
	};
    // Return component definition
    return { viewModel: checkboxgroup, template: htmlString };
});

