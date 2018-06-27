define(["require", "form2", "spaform"], function(require, RUNTIME, SPAFORM ) {
	
	/**
	 * SPAFORM runtime PRIVATE methods to manage SharePoint ListItem
	 */
	(function(){

		var f = SPAFORM().form;
		var l = SPAFORM().list;

		this._listItemType = function () {

			var name = l.name;
			return "SP.Data." + name.charAt(0).toUpperCase() + name.slice(1) + "ListItem";
		};		
		/**
		 * ** redirectToList **
		 */
		this._formRedirectToList = function () {
			var self = this;
			var f = SPAFORM().form;
			if (!f.crossdomain) {
				if(!self.$isSandbox) {
//debugger;					
//SPAFORM().destroy();
					window.location = _spPageContextInfo.webAbsoluteUrl + "/Lists/" + SPAFORM().list.name;
					return true;
				}
				else {
					if( f.codePanel) f.codePanel.actionFormsCommandDesigner(false);
					RefreshCommandUI();
				}
			}
			else {
				
//						if(HP2) HP2.Close();
				if( SPAFORM().params.onCloseCallback) SPAFORM().params.onCloseCallback();
				SPAFORM().destroy();
			}
			return false;
		};
		this._formDelete = function () {
			this._d_formDelete = $.Deferred();
			var l = SPAFORM().list;
			var namespace = 'listItem';
			var ctx = SPAFORM().runtime.dataContext(namespace);		

			l.proxy.postMessage(JSON.stringify(["formDelete", JSON.stringify(ctx.save()), l.name, l.item.id]), "*");

			return this._d_formDelete.promise();
		};
		this._formDeleted = function (formData) {
			SPAFORM().list.item.id = undefined;
			SPAFORM().list.item['_'].id(undefined);
			if (SPAFORM().form.crossdomain) {
				this._formInitFormData();
				if( this._formStatusMessage != undefined ) this._formStatusMessage();
			}
			else
				this._formRedirectToList();

			this._d_formDelete.resolve();					
		};		
		/**
		 * 
		 */
		this._formSave = function () {
			var self = this;
			this._formSave2().done( function() {
				if(self._formStatusMessage != undefined) self._formStatusMessage();
				if( SPAFORM().form.closeOnClick) self._formRedirectToList();
			});
		};
		// Proxy method:  create or update list item
		this._formSave2 = function (moderationStatus) {
//debugger;					
			this._d_formSave = $.Deferred();
		
			var namespace = 'listItem';
			var ctx = SPAFORM().runtime.dataContext(namespace);		
			var jsonData = ctx.save();
			//var jsonData = this._formGetFormData();
if( jsonData.Title == "") {
	debugger;
}
//debugger;
console.log('jsonData: '+JSON.stringify(jsonData));			
			var l = SPAFORM().list;
			var f = SPAFORM().form;

			if( (moderationStatus !== undefined) && (moderationStatus !== null)) {
				if (l.enableModeration) {
					jsonData.OData__ModerationStatus = moderationStatus;
					//jsonData.OData__ModerationComments = this._formModerationComments();
				}
			}

			if (f.new()) {
//debugger;	
				jsonData['ContentTypeId'] = l.contentTypeId;					
				l.proxy.postMessage(JSON.stringify(["formCreate", JSON.stringify(jsonData), l.name, f.uniqueIDMethod]), "*");
			}
			else {
				l.proxy.postMessage(JSON.stringify(["formUpdate", JSON.stringify(jsonData), l.name, l.item.id]), "*");
			}
			return this._d_formSave.promise();
		};
		// Proxy callback
		this._formSaved = function(formData, ID) {
			SPAFORM().list.item.id = ID;
			SPAFORM().list.item['_'].id(ID);

			var jsonData = formData;//JSON.parse(formData);
//debugger;
			this._formLoadModelData(formData);
			
			var namespace = 'listItem';
			var ctx = SPAFORM().runtime.dataContext(namespace);		
			if(ctx.values['Attachments']) ctx.values['Attachments'](jsonData['Attachments']);					

			this._d_formSave.resolve();					
		};

		this._formLoadModelData = function( formData) {

			var namespace = 'listItem';
			var ctx = SPAFORM().runtime.dataContext(namespace);		
			ctx.load(formData);

			SPAFORM().list.item['_'].data(formData);
			RefreshCommandUI();
		};
		// Proxy method:  load list item
		this._formLoad = function () {
//debugger;			
			this._d_formLoad = $.Deferred();
			this._formGetFields().done( function( fields) {	
				var l = SPAFORM().list;
				l.proxy.postMessage(JSON.stringify(["formLoad", l.ODataRequestCached, l.name, l.item.id]), "*"); 
			});
			return this._d_formLoad.promise();
		};	
		// Proxy callback
		this._formLoaded = function(formData, ID) {

			//SPAFORM().list.item.id = ID;

			this.__formDataResults = formData; // JSON
//debugger;
			_this._formLoadModelData(formData);
			_this._d_formLoad.resolve(formData, ID);
// var _this = this;
// setTimeout( function() {
// 			_this._formLoadModelData(formData);
// 			//
// 			_this._d_formLoad.resolve(formData, ID);
	
// }, 500);	
		};
		
		
		// Proxy method:  upload list item's file attachment
		this._formAttachmentUpload = function ( fileName) {				
			this._d_formAttachmentUpload = $.Deferred();
			var l = SPAFORM().list;
			var file = JSON.stringify(fileName);
			l.proxy.postMessage(JSON.stringify(["formAttachmentUpload", file, l.name, l.item.id]), "*"); 
			return this._d_formAttachmentUpload.promise();
		};	
		this._formAttachmentUploaded = function ( fileName, ID) {
			this._d_formAttachmentUpload.resolve(fileName, ID);
		};	
						
		this.$initializeIListItem = function(SPAFORM) {
			var item = SPAFORM.list.item;
			var self = this;
			item.load = function() {
				return self._formLoad();
			};
			item.save = function (moderationStatus) {
//debugger;				
				var d = $.Deferred();
				self._formSave2(moderationStatus).done( function() {
					if(self._formStatusMessage != undefined) self._formStatusMessage();
					var f = SPAFORM.form; 
					if( f.closeOnClick || !f.crossdomain) self._formRedirectToList();
					d.resolve()
				});
				return d.promise();
			};			
			item.delete = function () {
				self._formDelete();
			};
			item.close = function () {
//debugger;				
				self._formRedirectToList();;
			};
			item.upload = function( fileName) {
				return self._formAttachmentUpload( fileName);
			};
			item['_'].load = function(formData) {
				return self._formLoadModelData( formData);
			}
		};
		
	}).call(RUNTIME.viewModel.prototype);	

	/**
	 * SPAFORM runtime PUBLIC interface for SharePoint ListItem
	 */	 
	var item = SPAFORM().list.item;
	//var self = SPAFORM().runtime;


	return {
		'load': item.load,
		'save': item.save,
		'delete': item.delete,
		'close': item.close,
		'upload': item.upload
	};
});
