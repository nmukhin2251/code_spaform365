define(["require", "knockout", "form2", "spaform", "form2-he"], function(require, ko, RUNTIME, SPAFORM, he ) {

	/**
	 * SPAFORM runtime PRIVATE methods to manage ko
	 */	
	var fn = (function(){

		var self = this;


		this.dataContext = function(namespace, key) {
			var r = SPAFORM().runtime;
			if( !r['_']) r['_'] = {};
			if( !r['namespaces']) r['namespaces'] = {};

			var ctx = undefined;
			if( typeof key === 'undefined') {
				if( !r['_'][namespace]) r['_'][namespace] = {};
				ctx = r['_'][namespace];
			//} else if( typeof index === 'number') {
			//	if( !r['_'][namespace]) r['_'][namespace] = [];
			//
			} else if( typeof key === 'string') {
				if( !r['_'][namespace]) r['_'][namespace] = {};
				if( !r['_'][namespace][key]) r['_'][namespace][key] = {};
				ctx = r['_'][namespace][key];
			}

			if( !ctx.values) {

console.log('#--> create namespace: ' + namespace);
				r.namespaces[namespace] = ctx;

				ctx.namespace = namespace;
				ctx.values = {};
				ctx.typekinds = {};
				
				if( !ctx.vGroup) {
					ctx.vGroup = ko.validatedObservable({}, {namespace: namespace});				
					ctx.isValid = function() {
						return ctx.vGroup.isValid();
					};
				};

				var u = SPAFORM().user;
				var f = SPAFORM().form;

				ctx.readonly = ko.computed(function() {
					
					var edit_mode = f.editMode();					
					if(f.state) {
						// any states with custom components always editable
//debugger;						
						var state = f.state();
						var state_readonly = f['stateObject'](state).readonly;	

						if(state.indexOf('spaf_0000') == -1) edit_mode = true;
						else {
							if( typeof state_readonly !== 'undefined' && state_readonly == true) edit_mode = false;
						}
					}
					//
					var can_edit = u.canEdit() && edit_mode;

					if( namespace == 'runtime' || namespace == 'listItem') {
						return !can_edit;	
					}

					var states = [];//[namespace];					 
					var state = f.state();
					 
					for( var key in f.startupComponentSchema.Process.States)	{
						if( f.startupComponentSchema.Process.States[key].namespace == namespace) {
							states.push(key);
						}
					}					

					var in_state = ( states.indexOf(state) > -1) ? true : false;
var ro = !can_edit || !in_state;
if( ro)	{				
console.log('namespace: '+namespace+' <<<<<<<<<<<<<<<===== READ ONLY =====>>>>>>>>>>>>>>>>>>>>');
}
else {
console.log('namespace: '+namespace+' <<<<<<<<<<<<<<<===== EDITABLE =====>>>>>>>>>>>>>>>>>>>>');	
}
					return !can_edit || !in_state;
				}, this);
						

				// damper quick data input changes with 0,5 sec filter and serializes namespace data into ctx.io observable
// 				var deferredSaveId = 0;
// 				ctx.deferredSave = function( request) {
// //debugger;					
// 					if( namespace != 'listItem') {					
// 						if( !request) {
// 							if( deferredSaveId != 0 ) {
// 								clearTimeout(deferredSaveId);
// 								deferredSaveId = 0;
// 							}
// //							ctx.io(undefined);
// 						} else 	if( request && (deferredSaveId == 0)) {
// 							deferredSaveId = setTimeout(function() {
// 								console.log('<---- deferred ctx.save namespace: '+ namespace +' ---->');
// //debugger;								
// 								var jsonData = ctx.save();
// //debugger;								
// // ---> use saveJSON instead of								ctx.io(JSON.stringify(jsonData));
// 								ctx.saveJSON(jsonData);
// 								deferredSaveId = 0;
// 							}, 500); //filtering noise
// 						} 
// 					}					
// 				};
				ctx.saveJSON = function(jsonData) {

					console.log('<---- ctx.saveJSON namespace: '+ namespace +' ---->');
//debugger;					
					var ctxListItem = r.dataContext('listItem');

					var textJSON = ctxListItem.values['mwp_FormDocument']();
					var formJSON = (textJSON && textJSON.length > 0) ? JSON.parse(textJSON) : {};
					formJSON[namespace] = jsonData;
					textJSON = JSON.stringify(formJSON);

					console.log('<---- ctx.saveJSON namespace: '+ namespace +' textJSON: '+ textJSON +' ---->');

					ctxListItem.values['mwp_FormDocument'](textJSON);
				}


				if( namespace == 'listItem') {
//debugger;
					ctx.io = ko.observable().extend({ namespace: {
						namespace: 'listItem',
						promoted: true,
						InternalName: 'mwp_FormDocument',
						Description: 'SPA FORM 365 Data',
						Required: false,
						Title: 'SPA Form 365 Data'
					}});

					ctx.promotions = {
						// InternalName: [namespace1, namespace2]
					};

					ctx.saveFormDocument = function() {
debugger;						
						for( var name in r.namespaces) {

							if( name == 'listItem') continue;

							var namespace_ctx = r.namespaces[name];
							var jsonData = namespace_ctx.save();
							namespace_ctx.saveJSON(jsonData);
						}
					};

// 					var loadNamespaces = function(val, promote){
// debugger;
// 						var formJSON = {};
// 						try {
// 							formJSON = JSON.parse(val);
// 						} catch(e) {};

// 						console.log('<---- loadNamespaces ---->');

// 						for( var key in formJSON) {
// 							if( key != 'listItem') {

// 								console.log('<---- ctx.io loadNamespace: '+ key +' formJSON: '+ JSON.stringify(formJSON[key]) +' ---->');
								
// 								var ctxNMS = r.dataContext(key);
// 								var namespaceJSON = formJSON[key];
// 								if( promote) {
									
// 									var jsonListItemData = SPAFORM().list.item['_'].data();
// 									for( var intName in jsonListItemData) {

// 										if( intName == '__metadata') continue;
// 										if( namespaceJSON.hasOwnProperty(intName)) {

// 											console.log('<---- loadNamespace: '+ namespace +' promoted: '+intName+'---->');
// //debugger;											
// 											namespaceJSON[intName] = jsonListItemData[intName];
// 										}
// 									}
// 								}
// 								ctxNMS.io(namespaceJSON);
// 							}
// 						}
// 						return formJSON;									 													
// 					};

					// apply any updates from promoted columns
					//ctx.io(loadNamespaces(ctx.io(), true));



					// we use loadNamespace with promote just once, at ctx.load, where ctx == listItem
					// ctx.io.subscribe(function(val) {

					// 	//console.log('datacontext '+namespace+' --> load on subscribe...');
					// 	console.log('<---- ctx.load on subscribe namespace: '+ namespace +' ---->');

					// 	//if( deferredSaveId != 0) deferredSaveId = 0;
					// 	//else {
					// 	//	console.log('<---- ctx.load namespace: '+ namespace +' ---->');
					// 	//	ctx.load(val);
					// 	//}
					// 	loadNamespaces(val, false);
					// });	
					
				}

//  				if( namespace != 'listItem') {

// 					var l = SPAFORM().list;
// 					// var contentField = null;
					
// 					// l.fields.every( function( field) {
						
// 					// 	if( field.InternalName == namespace) {

// 					// 		contentField = field;
// 					// 		return false; //break - project field alredy defined on list
// 					// 	}
// 					// 	return true; //continue
// 					// });
				
// //console.log('namespace = '+namespace+ ' promoted to listItem as '+namespace);


// // not need ctx.io for namespaces, except listItem
// // to load use on-fly data extraction with promotion at $listItem
// // to save use saveJSON, landing starignt to mwp_FormDocument at listItem namespace

// 					// ctx.io = ko.observable().extend({ namespace: {
// 					// 	namespace: namespace,
// 					// 	InternalName: 'spaf_'+namespace,
// 					// 	promoted: false, //true,
// 					// 	Title: namespace
// 					// }});

					
// // 					ctx.io.subscribe(function(val) {
// // 						//console.log('datacontext '+namespace+' --> load on subscribe...');
// // debugger;						
// // 						if( deferredSaveId != 0) deferredSaveId = 0;
// // 						else {
// // 							console.log('form2-ko.js:155 <---- ctx.load on subscribe namespace: '+ namespace +' ---->');
// // 							ctx.load(val);
// // 						}
// // 					});
// 				};
				ctx.load = function( inputData) {

					var jsonData = undefined;
					if( typeof inputData === 'string') {
						try {						
							jsonData = JSON.parse(inputData);
						}
						catch(e) {
						}
					}
					if (typeof inputData === 'object') {
						jsonData = inputData;
					}
				
					if( typeof jsonData !== 'object') return;

					var l = SPAFORM().list;
					for( var intName in ctx.values) {
						if( jsonData.hasOwnProperty(intName)){
							if( intName != 'Attachments') {

								if(l.types[intName] == "Percentage") 
									ctx.values[intName](Math.round(jsonData[intName] * 100));
								else 
								if(l.types[intName] == "DateTime") {
									var formatDate = function(date) {
										var monthNames = [
										  "January", "February", "March",
										  "April", "May", "June", "July",
										  "August", "September", "October",
										  "November", "December"
										];
									  
										var day = date.getDate();
										var monthIndex = date.getMonth();
										var year = date.getFullYear();
									  
										return day + ' ' + monthNames[monthIndex] + ', ' + year;
									}																		  
									var val = jsonData[intName]
									if( val && val.indexOf('-') > 0) {
										var d = new Date(val);			
										ctx.values[intName](formatDate(d));
									}			
						
								}
								else {
									// ?? purpose of that to load ctx.io for each namespace listed in JSON document.
									// don't want create earlier stored namespaces - maybe they were removed from design
									// will load namespace's ctx.io dynamically, via $listItem ???
// 									if( namespace == 'listItem' && intName == 'mwp_FormDocument') {
// debugger;										
// 										jsonData[intName] = loadNamespaces(jsonData[intName], true);
// 									}
									ctx.values[intName](jsonData[intName]);
								}
									
//								console.log("offset: +" + (Date.now() - top.startTime)+" - form2-listitem.js _formLoadModelData: " + intName + " <-- " + jsonData[intName]);	
								}
							else {
								ctx.values[intName](jsonData[intName]);
							};	
						};
					}
				};
				ctx.types = function(intName) {

					if( !intName) return '';

					var typeKind = ctx.typekinds[intName];
					if( !typeKind) return '';

					switch(typeKind) {
						//case 1: fld2 = 	ctx.castTo(fld, SP.FieldNumber); 		break;//Integer
						//case 2: fld2 = 	ctx.castTo(fld, SP.FieldText); 			break;//Text
						//case 3: fld2 = 	ctx.castTo(fld, SP.FieldMultiLineText);	break;//Note
						case 4:  return 'DateTime';//DateTime
						
						case 6:  return 'Choice';//RadioGroup or Dropdown
						case 7:  return 'Lookup';//Lookup
						case 8:  return 'Boolean';//Boolean
						case 9:  return 'Number';//Number
						case 10: return 'Currency';	//Currency
						//case 11: fld2 = ctx.castTo(fld, SP.FieldUrl);			break;//URL
		
						case 15: return 'MultiChoice';//MultiChoice
		
						case 20: return 'UserMulti';//User
						default: return '';									
					}
					return '';
				};
				ctx.save = function() {
					var l = SPAFORM().list;
					var jsonData = {
						"__metadata": { "type": l.listItemType() }
					};

					if( namespace == 'listItem') {
						ctx.saveFormDocument();
					};

					for( var intName in ctx.values) {

						//console.log('form2-ko.js:204 ----> ctx.save name: '+intName+' namespace: '+ namespace +' ---->');
						
						if( ctx.values.hasOwnProperty(intName) && (intName != 'mwp_ApprovalWorkflowJSON')) {

							if( ( namespace == 'listItem') && (l.types[intName] == undefined)) { 
								continue; // no such field in SharePoint list - likely some dataContext open connection...
							}
							var o = ctx.values[intName]();

							var datatype = ( namespace == 'listItem') ? l.types[intName] : ctx.types(intName);

							//console.log('form2-ko.js:213 - intName: ' + intName + ' value: ' + o + ' type: ' + l.types[intName]);	

							switch( datatype) {
								case 'LookupMulti': 		
													break;									
								case 'UserMulti': 		
												if( namespace == 'listItem') {
//debugger;													
													//http://www.lifeonplanetgroove.com/set-person-column-value-using-sharepoint-rest-api/?doing_wp_cron=1483405786.2690460681915283203125
													var arr = [];
													var keys = [];
													o.results.forEach( function(item) {
														arr.push(item.Id);
														keys.push(item.Key);
													});
													// version to submit on SharePoint server
													jsonData[intName] = {
														'__metadata' : {'filedtype': 'UserMulti'},
														'intname' : intName+'Id',
														'keys': keys,
														'value': { 
																	'__metadata': { 'type': 'Collection(Edm.Int32)'},
																	'results': arr
																	}
													};
												} 
												else {
													// another version, to use only within JSON storage	
//debugger;																									
													jsonData[intName] = {
														results: o.results
													};
												}

													/*
													jsonData[intName+'Id'] = { 
														'__metadata': { 'type': 'Collection(Edm.Int32)'},
														'results': arr
													};
													*/
													break;									
								case 'User':
													jsonData[intName] = {
														'__metadata' : {'filedtype': 'User'},
														'intname' : intName+'Id',
														'value': (o.results.length > 0) ? o.results[0].Id : -1 
													};
													break;
								case 'Choice':
													if(o) { // empty "" string is false
														jsonData[intName] = o;
													};
													break;
								case 'MultiChoice':
													/*
													jsonData[intName] = {
														'__metadata' : {'filedtype': 'MultiChoice'},
														'intname' : intName,
														'value': { 
																	'__metadata': { 'type': 'Collection(Edm.String)'},
																	'results': o.results
																	}
													};
													*/
													if( o.results) {
														jsonData[intName] = { 
															'__metadata': { 'type': 'Collection(Edm.String)'},
															'results': o.results
														};
													}
													break;
								case 'Lookup':
													jsonData[intName] = {
														'__metadata' : {'filedtype': 'Lookup'},
														'intname' : intName+'Id',
														'value': (o) ? o.Id : -1 
													};
													/*
													jsonData[intName+'Id'] = (o) ? o.Id : -1;
													*/
													break;
								case 'DateTime':
													if( !isNaN(Date.parse(o))) jsonData[intName] = o;														
													break;
								case 'Currency':
													if( !isNaN(parseFloat(o))) { 
														jsonData[intName] = o;
													};
													break;
								case 'Number':
													if( !isNaN(parseFloat(o))) { 
														jsonData[intName] = o;
													};
													break;
								case 'Percentage':
													if( !isNaN(parseFloat(o))) { 
														jsonData[intName] = o / 100;//parseFloat(o) / 100; // value in range 0..1
													};
													break;
								case 'Boolean':
														jsonData[intName] = (o) ? true : false;
													break;
								case 'Attachments':
													jsonData[intName] = o;
													break;
								default:
													//if( intName != "Attachments") 
													jsonData[intName] = o;									
													break;
							}
						}
					}					
					return jsonData;						
				};				
			};
			return ctx;
		};







		
		/**
		 * **  **
		 */

		var $validationGroup2 = function(target, namespace) {
//debugger;
			//var namespace = option;
			var ctx = SPAFORM().runtime.dataContext(namespace);
			var o = ctx.vGroup();
			//var key = "p" + Object.keys(o).length;
			//o[key] = target;
			var key = (target.params && target.params['InternalName']) ? target.params['InternalName'] : "p" + Object.keys(o).length;
			o[key] = target;
//console.log('$validationGroup2 --> namespace = '+namespace+' + key = ' + key);
			ctx.vGroup = ko.validatedObservable(o, {namespace: namespace});
			return target;
		};

		var validationGroup2 = function( option, inpObj) {

			var namespace = option;
			var ctx = SPAFORM().runtime.dataContext(namespace);
			return ctx.vGroup;
		};
		// var $namespace3 = function( initialValue, jsonParams) {

			
		// 	var params = JSON.parse(JSON.stringify(jsonParams));

		// 	var namespace = (params.namespace && params.namespace.length > 0) ? params.namespace : 'listItem';
		// 	var name = params.InternalName;

		// 	var o = $allocateObservable( namespace, initialValue, params );

		// 	if( !o.params) o.params = {};
		// 	for( var key in params) o.params[key] = params[key];

		// 	console.log('validation o namespace = '+ namespace +' ---- params.InternalName = ' + name);	

		// 	var v = o.extend({ validationGroup: namespace });


		// 	/**
		// 	 * promotion
		// 	 */
		// 	if( (namespace != 'listItem')) {

		// 		// if( typeof params === 'undefined') {
		// 		// 	debugger;
		// 		// }

		// 		if( params.promoted) {
		// 			var po = $allocateObservable( 'listItem', initialValue, params, v );

		// 			console.log('validation po namespace = '+ namespace +' ---- params.InternalName = ' + name);

		// 			var pv = po.extend({ validationGroup: 'listItem' });	
		// 		}
		// 		else { // demoting
					
		// 			$deletePromotedObservable(params.InternalName);

		// 			//$allocateObservable( 'listItem', initialValue, params, null ); // remove promotedVariable
		// 			var ctx = SPAFORM().runtime.dataContext('listItem');
		// 			var o = ctx.vGroup();
		// 			var key = v.params.InternalName;
		// 			if (o.hasOwnProperty(key)) delete o[key];

		// 			console.log('form2-ko.js:510 $validationGroup2 --> demoting namespace = '+namespace+' + key = ' + key);

		// 			ctx.vGroup = ko.validatedObservable(o, {namespace: namespace});
				
		// 		}
		// 	};

		// 	return v;		
		// };

		var $namespace = function( initialValue, jsonParams) {

//debugger;			
			var params = JSON.parse(JSON.stringify(jsonParams));

			var namespace = (params.namespace && params.namespace.length > 0) ? params.namespace : 'listItem';
			var name = params.InternalName;

			// get base observable if promoted 
			var promotedObservable = ((namespace != 'listItem') && params.promoted ) ? $allocatePromotedObservable2(namespace, initialValue, params) : null;
			// 
			var v = $allocateObservable2( namespace, initialValue, params, promotedObservable);


			return v;		
		};

		var $jsonNamespaceData = function(namespace, params) {

			var l = SPAFORM().list;

			var jsonNamespaceData = null;
			var jsonListItemData = l.item['_'].data();

			if (namespace == 'listItem') {
				// namespace data == listItem content
				jsonNamespaceData = jsonListItemData;
			}
			else {
				// namespace data == 'namespace' member JSON document stored in mwp_FormDocument column				
				if (typeof jsonListItemData === 'object' && jsonListItemData.hasOwnProperty('mwp_FormDocument')) {
//debugger;					
					var val3 = jsonListItemData['mwp_FormDocument'];
					//var val2 = he.decode(val3);
					var val2 = val3;
					try{
						// only plain text allowed - will fail on rich text box type
						
						var jsonForm = (typeof val2 === 'string') ? JSON.parse(val2) : val2;
						if( jsonForm.hasOwnProperty(namespace)) {

							// original version of namespace data at JSOM document
							jsonNamespaceData = jsonForm[namespace];

							if( typeof params === 'undefined') {
								debugger;
							}

							// update namespace namespace data for promoted field
							if( params.promoted == true && jsonListItemData.hasOwnProperty(internalName)) {
								jsonNamespaceData[internalName] = jsonListItemData[internalName];
								jsonForm[namespace] = jsonNamespaceData;
								jsonListItemData['mwp_FormDocument'] = jsonForm;
							}
						}
						else jsonNamespaceData = {}; // empty namespace data
					}
					catch(e) {
						
					}
				}					
			}
			return jsonNamespaceData;
		};

		var $loadSharePointData = function(ctx, internalName, jsonNamespaceData) {
			var val;
			var l = SPAFORM().list;
			// Loading SharePoint data into observable
			if(jsonNamespaceData) {
				var propertyName = (jsonNamespaceData.hasOwnProperty(internalName)) ? internalName : null;

				if( !propertyName ) { // Is it works ???
//					debugger;					
					// correction for SPUser type, returning InternalName + "Id" 
					propertyName = (jsonNamespaceData.hasOwnProperty(internalName+'Id')) ? internalName+'Id' : null;
				};

				if(propertyName) {
					
					val = jsonNamespaceData[propertyName];
					if(l.types[internalName] == "Percentage") val = Math.round(val * 100);
//debugger;
					ctx.values[internalName](val);
				}
			}
		};


		var $createObservableInNamespace2 = function(namespace, internalName, initialValue, params) {

			var r = SPAFORM().runtime;
			var f = SPAFORM().form;

			var ctx = r.dataContext(namespace);
			
			// make reservation for column XML markup at f.columns
			if(!f.columns.hasOwnProperty(internalName)) f.columns[internalName] = '';
			
			// create observable in namespace	
			if( !ctx.values.hasOwnProperty(internalName)) { 

				ctx.values[internalName] = ko.observable(initialValue); 
				if( params.FieldTypeKind) ctx.typekinds[internalName] = params.FieldTypeKind;

				var jsonNmsData = $jsonNamespaceData(namespace, params);
				$loadSharePointData(ctx, internalName, jsonNmsData);
		
				//var v = ctx.values[internalName].extend({ validationGroup: namespace });
			} 
			return ctx.values[internalName];
		}

		var $allocatePromotedObservable2 = function(namespace, initialValue, params) {

			var r = SPAFORM().runtime;

			var internalName = (typeof params === 'string') ? params : params.InternalName;
			if( !initialValue) initialValue = "";

			var ctx = r.dataContext('listItem');
			ctx.values[internalName] = $createObservableInNamespace2('listItem', internalName, initialValue, params);

			//console.log('validation o namespace = '+ namespace +' ---- params.InternalName = ' + name);	
			ctx.values[internalName] = ctx.values[internalName].extend({ validationGroup: 'listItem' });

			// update promotions count
			// if( !ctx.promotions[internalName]) ctx.promotions[internalName] = {};
			// if( !ctx.promotions[internalName][namespace]) 
			// 	ctx.promotions[internalName][namespace] = 1;
			// else 
			// 	ctx.promotions[internalName][namespace]++;


			console.log("offset: +" + (Date.now() - top.startTime)+" #promoted#--> ["+namespace+"][" + internalName + "] = " + ctx.values[internalName]());									
			return ctx.values[internalName];										
		}
		var $allocateObservable2 = function( namespace, initialValue, params, promotedObservable) {
			var r = SPAFORM().runtime;

			var internalName = (typeof params === 'string') ? params : params.InternalName;
			if( !initialValue) initialValue = "";

			var ctx = r.dataContext(namespace);
			ctx.values[internalName] = (promotedObservable) ? promotedObservable : $createObservableInNamespace2(namespace, internalName, initialValue, params);

			if( !ctx.values[internalName].params) ctx.values[internalName].params = {};
			for( var key in params) ctx.values[internalName].params[key] = params[key];

			//console.log('validation o namespace = '+ namespace +' ---- params.InternalName = ' + name);	
			ctx.values[internalName] = ctx.values[internalName].extend({ validationGroup: namespace });

			console.log("offset: +" + (Date.now() - top.startTime)+" #--> ["+namespace+"][" + internalName + "] = " + ctx.values[internalName]());									
			return ctx.values[internalName];										
		}

		// var $deletePromotedObservable = function( params) {

		// 	var f = SPAFORM().form;
		// 	var r = SPAFORM().runtime;

		// 	var internalName = (typeof params === 'string') ? params : params.InternalName;
		// 	var ctx = r.dataContext('listItem');



		// 	if (f.columns.hasOwnProperty(internalName))  delete f.columns[internalName];
		// 	if (ctx.values.hasOwnProperty(internalName)) delete ctx.values[internalName];

		// 	return null;
		// };
		
		// var $allocateObservable = function( namespace, initialValue, params, promotedVariable) {

		// 	var f = SPAFORM().form;
		// 	var l = SPAFORM().list;
		// 	var r = SPAFORM().runtime;

		// 	var internalName = (typeof params === 'string') ? params : params.InternalName;

		// 	// target layout context for listItem extender
		// 	var ctx = r.dataContext(namespace);
			
		// 	if( initialValue) {} else initialValue = "";
						
		// 	var newValue = false;
		// 	// var jsonNamespaceData = null;
		// 	// var jsonListItemData = l.item['_'].data();

		// 	if (namespace == 'listItem') {

		// 		var removePromoted = (promotedVariable === null) ? true : false;
		// 		if( removePromoted ) {
		// 			if (f.columns.hasOwnProperty(internalName))  delete f.columns[internalName];
		// 			if (ctx.values.hasOwnProperty(internalName)) delete ctx.values[internalName];
		// 			return null;
		// 		}

		// 		// make reservation for column XML markup at f.columns
		// 		if(!f.columns.hasOwnProperty(internalName)) f.columns[internalName] = '';
				
		// 		// create observable in namespace	
		// 		if( !ctx.values.hasOwnProperty(internalName)) { 

		// 			if(promotedVariable) {
		// 				console.log("#promoted#--> ["+namespace+"][" + internalName + "]() = " + promotedVariable());						
		// 				ctx.values[internalName] = promotedVariable;

		// 			} else {
		// 				console.log("#new#--> ["+namespace+"][" + internalName + "]() = " + initialValue);						
		// 				ctx.values[internalName] = ko.observable(initialValue); 

		// 			}


		// 			if( !promotedVariable) {
		// 				ctx.values[internalName].dataContext = function() {
		// 					return r.dataContext(namespace);
		// 				};							
		// 			}
		// 			newValue = true;

		// 			// namespace data == listItem content
		// 			//					jsonNamespaceData = l.item['_'].data();

		// 		} 
		// 		else {
		// 			console.log("offset: +" + (Date.now() - top.startTime)+" #two#--> ["+namespace+"][" + internalName + "] = " + ctx.values[internalName]());									
		// 			return ctx.values[internalName];										
		// 		}

				
		// 	}
		// 	else {
		// 		/**
		// 		 * NOT listItem namespace
		// 		 */
		// 		if( !ctx.values.hasOwnProperty(internalName)) {

		// 			console.log("#new#--> ["+namespace+"][" + internalName + "]() = " + initialValue);	

		// 			ctx.values[internalName] = ko.observable(initialValue); 

		// 			ctx.values[internalName].dataContext = function() {
		// 				return r.dataContext(namespace);
		// 			};

		// 			/**
		// 			 * !!! REMOVE .subscribe below !!! - this is only for debugging use 
		// 			 */
		// 			ctx.values[internalName].subscribe(function(val){

		// 				// if(val == 'abc') {
		// 				// 	debugger;
		// 				// }
		// 				console.log('#subscribe#> ['+namespace+']['+internalName+']='+val);

		// 				var nms1 = r.dataContext(namespace);

		// 				console.log('#subscribe#> ['+namespace+']['+internalName+']()='+ nms1.values[internalName]());	

		// 				if( typeof ctx.values[internalName].params === 'undefined') {
		// 					console.log('#subscribe#> no params yet');	
		// 					return;
		// 				}
	
		// 				if(ctx.values[internalName].params.promoted) {
		// 				debugger;	
		// 					var nms2 = r.dataContext('listItem');
		// 					console.log('#subscribe#> ['+'listItem'+']['+internalName+']()='+ nms2.values[internalName]());	
		// 				}
		// 			});

		// 			newValue = true;
		// 		}
		// 		else {
		// 			console.log("offset: +" + (Date.now() - top.startTime)+" #two#--> ["+namespace+"][" + internalName + "] = " + ctx.values[internalName]());									
		// 			return ctx.values[internalName];					
		// 		}
		// 	}

		// 	var jsonNmsData = $jsonNamespaceData(namespace, params);
		// 	$loadSharePointData(ctx, internalName, jsonNmsData);

		// 	console.log("offset: +" + (Date.now() - top.startTime)+" #one#--> ["+namespace+"][" + internalName + "] = " + ctx.values[internalName]());									
			
		// 	return ctx.values[internalName];			
		// };


		ko.extenders.listItem = function(target, option) {						
			return $allocateObservable( 'listItem', target(), option );
		};

		ko.extenders.namespace = function(target, option) {	
								
			return $namespace( target(), option );
		};
		
		ko.extenders.validationGroup = function(target, option) {
			return $validationGroup2( target, option);
		};

		ko.observable.fn.inNamespace = function(context, option) {
			var target = this;
			try {
				var t = target();
				var o = $allocateObservable( context, target(), option );
				var v = o.extend({ validationGroup: context });
				return v;
			}
			catch(e) {
				console.log('ERROR extendInContext: ' + e);
			}
		};

		return {
			validationGroup: validationGroup2
		};
	}).call(RUNTIME.viewModel.prototype);


	

	// blocking keyCode === 13 event propagation and emulates TAB key
	ko.bindingHandlers.enterkey = {
		init: function (element, valueAccessor, allBindings, viewModel) {
			var callback = valueAccessor();
			$(element).keypress(function (event) {
				var keyCode = (event.which ? event.which : event.keyCode);
				if (keyCode === 13) {
					var allInputs = $(".is-formfield");//$("input,select");
					for (var i = 0; i < allInputs.length; i++) {
						if (allInputs[i] == this) {
							if ((i + 1) < allInputs.length) $(allInputs[i + 1]).focus();
						}
					}					
					return false;
				}
				return true;
			});
		}
	};
	
	ko.bindingHandlers.$init = {
		init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {				
			// allow binding first. then init component
			if(viewModel.$init) setTimeout( function() { viewModel.$init( element, valueAccessor, allBindings, viewModel, bindingContext);	}, 50);
		}
	};
	
	/**
	 * override original 'component' binding handler
	 */
	
	var componentLoadingOperationUniqueId = 0;
//debugger;	
	var newIdValue = (new Date()).getTime();
	// override original ko 'component' binding handler
    ko.bindingHandlers['component'] = {
        'init': function(element, valueAccessor, ignored1, ignored2, bindingContext) {
//#context research -------------
//debugger;
			var newId = (newIdValue++).toString();//(new Date()).getTime().toString();
			//var newId = (new Date()).getTime().toString();
			element.setAttribute('id', newId);
//# end context research---------			
            var currentViewModel,
                currentLoadingOperationId,
                disposeAssociatedComponentViewModel = function () {
                    var currentViewModelDispose = currentViewModel && currentViewModel['dispose'];
                    if (typeof currentViewModelDispose === 'function') {
                        currentViewModelDispose.call(currentViewModel);
                    }
                    currentViewModel = null;
                    // Any in-flight loading operation is no longer relevant, so make sure we ignore its completion
                    currentLoadingOperationId = null;
                };
//debugger;				
//            var originalChildNodes = ko.utils.makeArray(ko.virtualElements.childNodes(element));
            var originalChildNodes = makeArray(ko.virtualElements.childNodes(element));

            ko.utils.domNodeDisposal.addDisposeCallback(element, disposeAssociatedComponentViewModel);

            ko.computed(function () {
                var value = ko.utils.unwrapObservable(valueAccessor()),
                    componentName, componentParams;

                if (typeof value === 'string') {
                    componentName = value;
                } else {
                    componentName = ko.utils.unwrapObservable(value['name']);
                    componentParams = ko.utils.unwrapObservable(value['params']);
                }

                if (!componentName) {
                    throw new Error('No component name specified');
                }

                var loadingOperationId = currentLoadingOperationId = ++componentLoadingOperationUniqueId;
                ko.components.get(componentName, function(componentDefinition) {
                    // If this is not the current load operation for this element, ignore it.
                    if (currentLoadingOperationId !== loadingOperationId) {
                        return;
                    }

                    // Clean up previous state
                    disposeAssociatedComponentViewModel();

                    // Instantiate and bind new component. Implicitly this cleans any old DOM nodes.
                    if (!componentDefinition) {
                        throw new Error('Unknown component \'' + componentName + '\'');
                    }
                    cloneTemplateIntoElement(componentName, componentDefinition, element);
//debugger;					
//#context research -------------
					var parentContext = function () {
						var node = document.getElementById(newId);
						return (node) ? ko.contextFor(node) : null;
					};

					componentParams['parentContext'] = parentContext;
//# end context research---------

//register component type
//debugger;
					if(componentParams.InternalName && (componentParams.InternalName.length > 0) && componentParams.FieldTypeKind ) {
//debugger;
						var l = SPAFORM().list;
						if( !l.types[componentParams.InternalName]) // if type was not asquired already from sharepoint list
							l.types[componentParams.InternalName] = l.typeAsTextByTypeKind(componentParams.FieldTypeKind);
					}
//execute component's constructor w/params now --> 				
                    var componentViewModel = createViewModel(componentDefinition, element, originalChildNodes, componentParams);
//#context research -------------
					componentViewModel['parentContext'] = parentContext;
					if( !componentViewModel.children) componentViewModel.children = ko.observable({});
					
					if( componentParams['name'] && componentParams['name'].length > 0) {
//debugger;						
						var parentComponent = componentViewModel['parentContext']().$component;
						if( parentComponent) {
							//componentViewModel['parentContext']().$component[componentParams.Name] = componentViewModel;
							parentComponent[componentParams['name']] = componentViewModel;
							
							if( !parentComponent.children) parentComponent.children = ko.observable({});
							var children = parentComponent.children();
							children[componentParams['name']] = componentViewModel;
							parentComponent.children(children);
						}
					}
//# end context research---------					
                    var childBindingContext = bindingContext['createChildContext'](componentViewModel, /* dataItemAlias */ undefined, function(ctx) {
//debugger;							
                            ctx['$component'] = componentViewModel;
                            ctx['$componentTemplateNodes'] = originalChildNodes;
                        });
//debugger;						
                    currentViewModel = componentViewModel;
                    ko.applyBindingsToDescendants(childBindingContext, element);
                });
            }, null, { disposeWhenNodeIsRemoved: element });

            return { 'controlsDescendantBindings': true };
        }
    };
	
	// redefine private (not exported) helper function originally defined at ko.utils
    var makeArray = function(arrayLikeObject) {
		var result = [];
		for (var i = 0, j = arrayLikeObject.length; i < j; i++) {
			result.push(arrayLikeObject[i]);
		};
		return result;
    };
	// redefine private (not exported) helper function originally defined at ko.utils
    var cloneNodes = function (nodesArray, shouldCleanNodes) {
		for (var i = 0, j = nodesArray.length, newNodesArray = []; i < j; i++) {
			var clonedNode = nodesArray[i].cloneNode(true);
			newNodesArray.push(shouldCleanNodes ? ko.cleanNode(clonedNode) : clonedNode);
		}
		return newNodesArray;
    };

    ko.virtualElements.allowedBindings['component'] = true;

	// redefine private (not exported) helper function originally defined at ko
    function cloneTemplateIntoElement(componentName, componentDefinition, element) {
        var template = componentDefinition['template'];
        if (!template) {
            throw new Error('Component \'' + componentName + '\' has no template');
        }

        //var clonedNodesArray = ko.utils.cloneNodes(template);
        var clonedNodesArray = cloneNodes(template);
        ko.virtualElements.setDomNodeChildren(element, clonedNodesArray);
    }

	// redefine private (not exported) helper function originally defined at ko
    function createViewModel(componentDefinition, element, originalChildNodes, componentParams) {
        var componentViewModelFactory = componentDefinition['createViewModel'];
        return componentViewModelFactory
            ? componentViewModelFactory.call(componentDefinition, componentParams, { 'element': element, 'templateNodes': originalChildNodes })
            : componentParams; // Template-only component
    }
	
	 
	return fn;	
});
