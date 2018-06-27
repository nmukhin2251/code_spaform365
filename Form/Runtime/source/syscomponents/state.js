// Recommended AMD module pattern for a Knockout component that:
//  - Can be referenced with just a single 'require' declaration
//  - Can be included in a bundle using the r.js optimizer
define(['text!./state.xml'], function( htmlString) {

	function state( params) { 

		var _this = this;
		var spaform = params.parentContext().spaform;	
		_this.params = params;

		this.stName = ko.computed(function(){
			var st = spaform.form['st'+'ate']();
			return spaform.form['stat'+'eObject'](st).label;
		});
	}
    // Use prototype to declare any public methods
    //componentButtons.prototype.doSomething = function() { ... };
	state.prototype.schema = {
		"Params": {
			"name": "state",
			"namespace": "state",
			"promoted": false
		},
		"Permalink": "https://spaforms365.com/docs/syslib-state/",
		"ListColumns" : {
			"mwp_FormState": '<Field ID="{2223b379-4a56-25b5-bc14-8f3c5360e526}" Type="Text" Name="mwp_FormState" Required="FALSE" DisplayName="Form State" Description="Form State" Group="Medline Web Portal" SourceID="{cbfbae2b-8362-4201-ac65-6a64a7d1d411}" StaticName="mwp_FormState" AllowDeletion="TRUE" Version="1" Customization="" ColName="nvarchar5" RowOrdinal="0"><Default>Draft</Default></Field>'
		}
	};
    // Return component definition
    return { viewModel: state, template: htmlString };
});

