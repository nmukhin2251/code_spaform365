// Recommended AMD module pattern for a Knockout component that:
//  - Can be referenced with just a single 'require' declaration
//  - Can be included in a bundle using the r.js optimizer
define(['text!messagebox.xml'], function( htmlString) {
	function messagebox( params) { 
		var self = this;
		
		
		self.form = ko.observable();
		self.params = params;
		self.spaform = params.parentContext().spaform;
		
		this.designmode = self.spaform.runtime.designMode;
		// CLOSE MESSAGE
		self._formButtonCloseMessageClick = function () {
			self.spaform.runtime._formStatusMessageEnabled(false);
		};
		self.enabled = ko.pureComputed( function() {
			//if( self.form()) {
				//return (self.form()._formStatusMessageEnabled() || self.form()._formDesignMode()); params.parentContext().spaform.form.designMode()
				return (self.spaform.runtime._formStatusMessageEnabled() || self.spaform.form.designMode()); 
			//}
			return false;
		});
		self.designing = ko.pureComputed( function() {
			//if( self.form()) {
				return (self.spaform.runtime.designMode());
			//}
			return false;
		});
		self.messageText = ko.pureComputed( function() {
			//if( self.form()) {
				return self.spaform.runtime._formStatusMessageText();
			//}
			return "";
		});
		self.Init = function( params) {
			self.form()["_formStatusMessageText"] = ko.observable(params.message);
			self.form()["_formStatusMessageEnabled"] = ko.observable(false);
			self.form()["_formStatusMessageAllowed"] = ko.observable((params.message == "") ? false : true);
			self.form()["_formStatusMessage"] = function( statusMessageText) {	
				//if (this._formIsSearchContext) {
					if( this._formStatusMessageAllowed()) {
						//this._formStatusMessageText(statusMessageText);
						this._formStatusMessageEnabled(true);
					}
				//}	
			};
		}
		
	}
    // Use prototype to declare any public methods
    //componentButtons.prototype.doSomething = function() { ... };
	messagebox.prototype.schema = {
		"Params": {
			"message": "COMPLETED SUCCESSFULLY. MY FORMS VIEW WILL REFLECT CHANGES WITH 5 MIN DELAY"
		},
		"Permalink": "https://spaforms365.com/docs/syslib-messagebox/"
	};

	
	ko.bindingHandlers.initmessagebox = {
		init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
			viewModel.form(bindingContext.$root);
			viewModel.Init(viewModel.params);
		}
	}; 
 
    // Return component definition
    return { viewModel: messagebox, template: htmlString };
});

