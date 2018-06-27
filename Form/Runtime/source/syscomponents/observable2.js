// Recommended AMD module pattern for a Knockout component that:
//  - Can be referenced with just a single 'require' declaration
//  - Can be included in a bundle using the r.js optimizer
define(['text!observable2.xml'], function( htmlString) {
	function observable2( params) { 
		
		this.internalName = (params) ? params.InternalName : '';
		this.designmode = params.parentContext().spaform.form.designMode;
		/**
		 * VALUE	
		 * observable bound to UI html template to show sharepoint column's 'Value' 
		 */
		this.value = ko.observable().extend({ namespace: params });//ko.observable().inNamespace( params.namespace, params.InternalName);//.extend({ listItem: this.internalName });
		
	}
	/**
	 * OPTIONAL COMPONENT METADATA DECLARATIONS ENABLING VISUAL DESIGN MODE SUPPORT
	 */
	observable2.prototype.schema = {
		"Params": {
			"name": "",
			"namespace": "listItem",
			"promoted": true,
			"InternalName": ""
		},
		"Permalink": "https://spaforms365.com/docs/syslib-observable2/",
		"Connections" : {
			"ListItem" : ['Any','Text','Choice','Note','Boolean','DateTime','Computed']
		}

	};
	
    // Return component definition
    return { viewModel: observable2, template: htmlString };
});

