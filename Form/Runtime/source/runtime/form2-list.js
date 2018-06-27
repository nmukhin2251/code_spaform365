define(["require", "form2", "spaform"], function(require, RUNTIME, SPAFORM ) {

	/**
	 * SPAFORM runtime PRIVATE methods to manage SharePoint List
	 */	
	(function(){
		
		
		/**
		 * ** _buildODataRequest **
		 */
		 
// 		this.isPercentage = function(field) {
// 			return (field.SchemaXml.indexOf('Percentage="TRUE"') > 0) ? true : false;
// 		};		
// 		this._buildODataRequest = function( fields) {
// 			var self = this;
// 			var l = SPAFORM().list;
// 			l.types = {};

// 			var select = [];
// 			var expand = [];
// 			fields.forEach( function(field) {
// //debugger;	
// 				l.types[field.InternalName] = field.TypeAsString; 
// 				if(self.isPercentage(field)) l.types[field.InternalName] = "Percentage";
// //console.log(field.InternalName + ' oData fieldtypes: '+field.TypeAsString);						
// 				switch( field.TypeAsString) {
// 					case "Lookup":
// 							select.push( field.InternalName + "/" + field.LookupField);
// 							select.push( field.InternalName + "/Id");
// 							expand.push( field.InternalName + "/Id");
// 							break;
// 					case "LookupMulti":
// 							//console.log('oData: LooukMulti');
// 							break;
// 					case "UserMulti":
// 					case "User":
// 							select.push( field.InternalName + "/Title");
// 							select.push( field.InternalName + "/Id");
// 							expand.push( field.InternalName + "/Id");
// 							break;
// 					default:
// 							select.push( field.InternalName);
// 							break;
// 				}
// 			});
// 			var request = "?$select=" + select.join(',') + "&$expand=" + expand.join(',');
// 			//form._ODataRequestCached = request;
// 			//parent._ODataRequestCached = request;
// 			l.ODataRequestCached = request;
// //console.log('form._buildODataRequest: '+request);					
// 			return request;
// 		};
// 		this._formGetFields = function() {
// //debugger;			
// 			var l = SPAFORM().list;
// 			if( !l.fields) {
// //debugger;						
// 				return this._formFieldsQuery();
// 			}
// 			return $.Deferred().resolve(l.fields);
// 		};
		this.sendEmailNotification = function (formData) {

			/**
			 * formData = {
			 * 		send: true,
			 * 		from: '',
			 * 		manager: false,
			 * 		to: 'groupName',
			 * 		subject: '',
			 * 		body: ''
			 * }
			 */

			this._d_formEmailSend = $.Deferred();
			SPAFORM().list.proxy.postMessage(JSON.stringify(["formEmailSend", formData, SPAFORM().list.name, ""]), "*");
			return this._d_formEmailSend.promise();
		};
		this._formEmailSended = function (managerLoginName, status) {			
			if( status == 'formEmailSendDone' ) return this._d_formEmailSend.resolve(managerLoginName);
			else this._d_formEmailSend.reject(managerLoginName);
		};
		this._formPeopleQuery = function (formData) {
			this._d_formPeopleQuery = $.Deferred();
			SPAFORM().list.proxy.postMessage(JSON.stringify(["formPeopleQuery", formData, SPAFORM().list.name, ""]), "*");
			return this._d_formPeopleQuery.promise();
		};
		this._formPeopleQueryDone = function (formData) {
			this._d_formPeopleQuery.resolve(formData);
		};
		this._formLookupQuery = function (formData) {
			this._d_formLookupQuery = $.Deferred();
			SPAFORM().list.proxy.postMessage(JSON.stringify(["formLookupQuery", formData, SPAFORM().list.name, ""]), "*");
			return this._d_formLookupQuery.promise();
		};
		this._formLookupQueryDone = function (formData) {
			this._d_formLookupQuery.resolve(formData);
		};
		// this._formFieldsQuery = function () {
		// 	//this._d_formFieldsQuery = $.Deferred();
		// 	if(!parent._d_formFieldsQuery) { 
		// 		parent._d_formFieldsQuery = $.Deferred();
		// 		SPAFORM().list.proxy.postMessage(JSON.stringify(["formFieldsQuery", "", SPAFORM().list.name, ""]), "*");
		// 	}
		// 	//return this._d_formFieldsQuery.promise();
		// 	if( parent._d_formFieldsQuery.state() != 'resolved')
		// 		return parent._d_formFieldsQuery.promise();
		// 	else {
		// 		return parent._d_formFieldsQuery.resolve(parent._r_formFieldsQuery);
		// 	}
		// };
		// this._formFieldsQueryDone = function (formData) {

		// 	var l = SPAFORM().list;
		// 	l.fields = formData;

		// 	if(l.enableModeration) {
		// 		// extend fields with moderation stuff
		// 		l.fields.push({
		// 			InternalName: 'OData__ModerationStatus',
		// 			Title: 'Moderation Status',
		// 			SchemaXml: '',
		// 			TypeAsString: 'Number'
		// 		});
		// 		l.fields.push({
		// 			InternalName: 'OData__ModerationComments',
		// 			Title: 'Moderation Comments',
		// 			SchemaXml: '',
		// 			TypeAsString: 'Text'
		// 		});
		// 		l.fields.push({
		// 			InternalName: 'OData__UIVersionString',
		// 			Title: 'Version',
		// 			SchemaXml: '',
		// 			TypeAsString: 'Text'
		// 		});

		// 	}
		// 	l.fields.push({
		// 		InternalName: 'mwp_FormDocument',
		// 		StaticName: 'mwp_FormDocument',
		// 		Title: 'SPA Form Document',
		// 		SchemaXml: "<Field Type=\"Note\" DisplayName=\"SPA Form 365 Data\" Hidden=\"TRUE\" Description=\"SPA Form 365 JSON Data\" Required=\"FALSE\" EnforceUniqueValues=\"FALSE\" Indexed=\"FALSE\" NumLines=\"600\" RichText=\"FALSE\" Sortable=\"FALSE\" ID=\"{68ca8ba8-9ed8-43a6-b46f-21afabc441e9}\" StaticName=\"mwp_FormDocument\" Name=\"mwp_FormDocument\" ColName=\"ntext5\" RowOrdinal=\"0\" RestrictedMode=\"TRUE\" RichTextMode=\"Compatible\" IsolateStyles=\"FALSE\" AppendOnly=\"FALSE\" Version=\"1\" />",
		// 		TypeAsString: 'Note'
		// 	});

		// 	this._buildODataRequest(l.fields);

		// 	parent._r_formFieldsQuery = l.fields;
		// 	parent._d_formFieldsQuery.resolve(parent._r_formFieldsQuery);
		// };
		this.$initializeIList = function(SPAFORM) {
			// var list = SPAFORM.list;
			// var self = this;
			// list.get_fields = function () {
			// 	return self._formGetFields();
			// };
		};
		
	}).call(RUNTIME.viewModel.prototype);
	
	/**
	 * SPAFORM runtime PUBLIC interface for SharePoint List
	 */	 
	var list = SPAFORM().list;
	var self = SPAFORM().runtime;
	return {
		//'save': item.save,
		//'delete': item.delete,
		//'get_fields': list.get_fields
	};
	
});
