;
define(['require'], function( require) {

	
    var proxyLoader = function() {
//debugger;
        JSRequest.EnsureSetup();

        var shared = {}; window;//this;//{};//this;
        
        shared.formList = unescape(JSRequest.QueryString["List"]); //SPAFORM().list.name; //
        shared.formID = JSRequest.QueryString["ID"]; // don't unescape to get undefined value //SPAFORM().list.item.id; //
        //self.formPath = _spPageContextInfo.webAbsoluteUrl + "/Lists/" + self.formList + '/Form/';
        //self.requireBaseUrl = self.formPath + "Design";
        
        //self._formRequestRuntime = false;
        shared._formAttachmentsContent = {};

        shared.listInfo = {
            enableModeration: false,
            columns: {
                ODataRequestCached: ''
            }
        };
        

        var queryPeople = function (formData, listName, ID) {		
            var self = this;
            if(( typeof formData === "object" ) && ( formData !== null)) {
                    var ctx = new SP.ClientContext(_spPageContextInfo.webAbsoluteUrl);
                var newUser = ctx.get_web().ensureUser(formData.userName);
                ctx.load(newUser);
                
                ctx.executeQueryAsync(function(){
                    var user = {
                        Title: newUser.get_title(),
                        Id: newUser.get_id()
                    };
                    parent.postMessage(JSON.stringify(["formPeopleQueryDone", user, listName, 0]), "*");
                },
                
                function(sender, args){
                    parent.postMessage(JSON.stringify(["formError", args.get_message(), listName, 0]), "*");
                });				
                return;
            }
                    
            //SP.SOD.executeFunc("SP.Runtime.js", "sp.js", "SP.ClientContext", function () {
            try {
                var ctx = new SP.ClientContext(_spPageContextInfo.webAbsoluteUrl);
                
                var options = {};
                //setup default settings
                var settings = $.extend({
                    onLoaded: null,
                    minSearchTriggerLength: 4,
                    maximumEntitySuggestions: 5,//30,
                    principalType: 1,
                    principalSource: 15,
                    searchPrefix: '',
                    searchSuffix: '',
                    displayResultCount: 4,
                    maxSelectedUsers: 1
                }, options);
                
                var currentValue = formData;
                var queryTerm = '' + settings.searchPrefix + currentValue + settings.searchSuffix;

                var query = new SP.UI.ApplicationPages.ClientPeoplePickerQueryParameters();
                query.set_allowMultipleEntities(false);
                query.set_maximumEntitySuggestions(settings.maximumEntitySuggestions);
                query.set_principalType(settings.principalType);
                query.set_principalSource(settings.principalSource);
                query.set_queryString(queryTerm);
                var searchResult = SP.UI.ApplicationPages.ClientPeoplePickerWebServiceInterface.clientPeoplePickerSearchUser(ctx, query);

                // give ourselves some async context
                var searchCtx = {
                    queryTicks: (new Date()).getTime(),
                    result: searchResult,
                    queryTerm: queryTerm,
                    //controlContext: controlContext,
                    spContext: ctx
                };

                // issue request
                
                ctx.executeQueryAsync(
                    Function.createDelegate(searchCtx, function () {
                        var results = ctx.parseObjectFromJsonString(this.result.get_value());
                        parent.postMessage(JSON.stringify(["formPeopleQueryDone", results, listName, 0]), "*");
                    }),
                    Function.createDelegate(this, function (sender, args) {
   					
                        parent.postMessage(JSON.stringify(["formError", args.get_message(), listName, 0]), "*");
                    })
                );
                
            }
            catch (e) {
                alert("proxy error: " + JSON.stringify(e));
            }
        };
        var queryLookup = function (formData, listName, ID) {
            var self = this;
            if(( typeof formData === "object" ) && ( formData !== null)) {
                var ctx = new SP.ClientContext.get_current(); //(_spPageContextInfo.webAbsoluteUrl);
                
                var list = ctx.get_site().openWebById(formData.LookupWebId).get_lists().getById(formData.LookupList);
                var camlQuery = new SP.CamlQuery();
                camlQuery.set_viewXml('<View><RowLimit>4999</RowLimit></View>');
                this.listItems = list.getItems(camlQuery); 
                
                ctx.load( this.listItems, 'Include(Id,' + formData.LookupField + ')');
                
                ctx.executeQueryAsync(function(){
                    var listItemInfo = '';
                    var listItemEnumerator = self.listItems.getEnumerator();
                    var results = [];	
                    while (listItemEnumerator.moveNext()) {
                        var oListItem = listItemEnumerator.get_current();
                        results.push({
                            Title: oListItem.get_item(formData.LookupField),
                            Id: oListItem.get_id()//,
                        });
                    }
                    parent.postMessage(JSON.stringify(["formLookupQueryDone", results, listName, 0]), "*");
                },				 
                function(sender, args){
                    parent.postMessage(JSON.stringify(["formError", args.get_message(), listName, 0]), "*");
                });				
                return;
            }				
        };
        var queryFields = function (formData, listName, ID) {
            var self = this;
            var d = $.Deferred();
            $.ajax({
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + window.listtitle + "')/fields?$filter=Hidden eq false and ReadOnlyField eq false",
                type: "GET",
                headers: { "accept": "application/json;odata=verbose" },
                success: function (data) {
                    if( listName != null) parent.postMessage(JSON.stringify(["formFieldsQueryDone", data.d.results, listName, 0]), "*");
                    d.resolve(data.d.results);
                },
                error: function (error) {
                    if( listName != null) parent.postMessage(JSON.stringify(["formError", JSON.stringify(error), listName, ID]), "*");
                    d.reject(error);
                }
            });
            return d.promise();           
        };

		var isPercentage = function(field) {
			return (field.SchemaXml.indexOf('Percentage="TRUE"') > 0) ? true : false;
		};		
		var buildODataRequest = function( fields) {
            var self = this;
            var columns = {
                fields: fields,
                types: {},
                ODataRequestCached: null
            };
			var select = [];
            var expand = [];
            
			fields.forEach( function(field) {
                //debugger;	
				columns.types[field.InternalName] = field.TypeAsString; 
				if(isPercentage(field)) columns.types[field.InternalName] = "Percentage";
                //console.log(field.InternalName + ' oData fieldtypes: '+field.TypeAsString);						
				switch( field.TypeAsString) {
					case "Lookup":
							select.push( field.InternalName + "/" + field.LookupField);
							select.push( field.InternalName + "/Id");
							expand.push( field.InternalName + "/Id");
							break;
					case "LookupMulti":
							//console.log('oData: LooukMulti');
							break;
					case "UserMulti":
					case "User":
							select.push( field.InternalName + "/Title");
							select.push( field.InternalName + "/Id");
							expand.push( field.InternalName + "/Id");
							break;
					default:
							select.push( field.InternalName);
							break;
				}
			});
			var request = "?$select=" + select.join(',') + "&$expand=" + expand.join(',');
			columns.ODataRequestCached = request;
			return columns;
		};
        
        var readListInfo = function (formData, formListName, formSave) { 
            var self = this;
            var d = $.Deferred();
            queryFields('', null, null).fail( function() { d.reject(); }).done(function(fields){
                SP.SOD.executeFunc("sp.js", "SP.ClientContext", function () {
                    try {
                        var ctx = new SP.ClientContext(_spPageContextInfo.webAbsoluteUrl);
                        var list = ctx.get_web().get_lists().getByTitle( window.listtitle);

                        var list2 = ctx.get_web().get_lists().getByTitle( window.listtitle);
                        var rootFolder = list.get_rootFolder();

                        var flds = list.get_fields();
                        // var fl = flds.getByInternalNameOrTitle('mwp_FormDocument');

                        var contentTypeCollection = list.get_contentTypes();
                        ctx.load(list); 

                        // https://sharepoint.stackexchange.com/questions/173790/rest-set-readsecurity-writesecurity-item-level-permissions
                        // Apperently only works in SharePoin online, it does NOT work for ON PREM
                        var isO365 = (window.location.hostname.indexOf("sharepoint.com") > 0) ? true : false;

                        if( isO365) ctx.load(list2, 'EffectiveBasePermissions', 'ReadSecurity', 'WriteSecurity');
                        else        ctx.load(list2, 'EffectiveBasePermissions');

                        ctx.load(contentTypeCollection);
                        ctx.load(rootFolder, 'Properties');
                        ctx.load(flds);
                        ctx.executeQueryAsync(
                            function () {
    
                                //debugger;
                                var fl = false;        
                                var fieldEnumerator = flds.getEnumerator();
                                while (fieldEnumerator.moveNext()) {
                                    var oField = fieldEnumerator.get_current();
                                    var fInternalName = oField.get_internalName();
                                    if( fInternalName == 'mwp_FormDocument') {
                                        fl = true;
                                        break;
                                    }
                                    // var fTitle = oField.get_title();
                                    // var fType = oField.get_fieldTypeKind();
                                    // var sType = oField.get_typeAsString();
                                    // var bHidden = oField.get_hidden();
                                    // var bReadOnly = oField.get_readOnlyField();
                                    // console.log('hidden: '+bHidden+' readonly: '+bReadOnly+' field: '+fTitle+' typekind: '+fType+' asstring: '+sType);
                                    //if(fType === SP.FieldType.choice) {
                                    //.....
                                    //}
                                }
                                //   debugger;
                                
    
                                var p = { contenttypes: []};
                                var	formConfig = JSON.stringify(p);
                                var listInfo = JSON.parse( formConfig);

                                listInfo.isO365 = isO365;

                                listInfo.columns = shared.listInfo.columns;
    
                                listInfo.listId = list.get_id().toString();
                                listInfo.listTitle = list.get_title();

                                listInfo.itemCount = list.get_itemCount();
    
                                //listInfo.listValidationFormula = list.get_validationFormula();
                                //listInfo.listValidationMessage = list.get_validationMessage();
                                //debugger;    
                                listInfo.draftVersionVisibility = list.get_draftVersionVisibility();
                                
                                listInfo.readSecurity = (typeof list2.get_readSecurity === 'function') ? list2.get_readSecurity() : 1;//f_config.readSecurity;
                                listInfo.writeSecurity = (typeof list2.get_writeSecurity === 'function') ? list2.get_writeSecurity() : 1; //f_config.writeSecurity;

                                listInfo.enableVersioning = list.get_enableVersioning();
                                listInfo.enableMinorVersions = list.get_enableMinorVersions(); 

                                // -- not exposed in CSOM/JSOM/REST
                                //listInfo.majorVersionLimit = f_config.majorVersionLimit;
                                //listInfo.majorWithMinorVersionsLimit = f_config.majorWithMinorVersionsLimit;
                    

                                listInfo.enableModeration = list.get_enableModeration();
                                shared.listInfo.enableModeration = listInfo.enableModeration;

                                //debugger; 
                                if(listInfo.enableModeration) {
                                    // extend fields with moderation stuff
                                    fields.push({
                                        InternalName: 'OData__ModerationStatus',
                                        Title: 'Moderation Status',
                                        SchemaXml: '',
                                        TypeAsString: 'Number'
                                    });
                                    fields.push({
                                        InternalName: 'OData__ModerationComments',
                                        Title: 'Moderation Comments',
                                        SchemaXml: '',
                                        TypeAsString: 'Text'
                                    });
                                    fields.push({
                                        InternalName: 'OData__UIVersionString',
                                        Title: 'Version',
                                        SchemaXml: '',
                                        TypeAsString: 'Text'
                                    });

                                }
                                //debugger;
                                if(fl) {
                                    fields.push({
                                        InternalName: 'mwp_FormDocument',
                                        StaticName: 'mwp_FormDocument',
                                        Title: 'SPA Form Document',
                                        SchemaXml: "<Field Type=\"Note\" DisplayName=\"SPA Form 365 Data\" Hidden=\"TRUE\" Description=\"SPA Form 365 JSON Data\" Required=\"FALSE\" EnforceUniqueValues=\"FALSE\" Indexed=\"FALSE\" NumLines=\"600\" RichText=\"FALSE\" Sortable=\"FALSE\" StaticName=\"mwp_FormDocument\" Name=\"mwp_FormDocument\" RestrictedMode=\"TRUE\" RichTextMode=\"Compatible\" IsolateStyles=\"FALSE\" AppendOnly=\"FALSE\" Version=\"1\" />",
                                        TypeAsString: 'Note'
                                    });    
                                };


                                shared.listInfo.columns = buildODataRequest(fields);
                                listInfo.columns = shared.listInfo.columns;
                                //debugger;                

                                listInfo.enableAttachments = list.get_enableAttachments();
    
                                var permissions = list2.get_effectiveBasePermissions();
                                listInfo.canManageLists = (permissions.has(SP.PermissionKind.manageLists));
                                listInfo.canModerateItems = (permissions.has(SP.PermissionKind.approveItems));
    
                                
                                listInfo.allowContentTypes = list.get_allowContentTypes();
                                listInfo.contentTypesEnabled = list.get_contentTypesEnabled();
                                
                                // if( listInfo.allowContentTypes & listInfo.contentTypesEnabled) {
                                //     var ctps = list.get_contentTypes;
                                //     var contentTypeinfo = '';
                                //     var contentTypeEnumerator = contentTypeCollection.getEnumerator();
                                //     while (contentTypeEnumerator.moveNext()) {
                                //         var content = contentTypeEnumerator.get_current();
                                //         //console.log('Content Type Name: ' + content.get_name() + ' id: ' + content.get_id());
                                //         listInfo.contenttypes.push({
                                //             name: content.get_name(),
                                //             id: content.get_id().toString()
                                //         });
                                //     }
                                // }

                                listInfo.defaultContentTypeId = null;
                                listInfo.contentTypes = [];
                                // from form2-storage - readListInfo
                                //if( listInfo.allowContentTypes & listInfo.contentTypesEnabled) {
//debugger;                                    
                                var contentTypeEnumerator = contentTypeCollection.getEnumerator();
                                while (contentTypeEnumerator.moveNext()) {
                                    var content = contentTypeEnumerator.get_current();
                                    // note: default content type is the First in the list
                                    // https://cann0nf0dder.wordpress.com/2014/02/26/setting-default-content-types-for-listlibraries-using-javascript/
                                    if(listInfo.defaultContentTypeId == null) { 
                                        listInfo.defaultContentTypeId = content.get_id().toString();	
                                    }						
                                    //console.log('Content Type Name: ' + content.get_name() + ' id: ' + content.get_id());
                                    listInfo.contentTypes.push({	
                                        name: content.get_name(),
                                        id: content.get_id().toString()
                                    });
                                }
                                //}




                                
                                var props = rootFolder.get_properties();                               
								try {
                                    listInfo.version = JSON.parse(atob(props.get_item('FormVersion')));
                                    listInfo.formType = props.get_item('FormType');
								} catch (e) { };
								
                                //debugger;						
                                d.resolve(JSON.stringify(listInfo));
                            },
                            function (sender, args) {
                                //debugger;						
                                parent.postMessage(JSON.stringify(["formError", JSON.stringify(args), formListName, formSave]), "*");
                                d.reject();
                            });
                    }
                    catch (e) {
                        //debugger;				
                        parent.postMessage(JSON.stringify(["formError", JSON.stringify(e), formListName, formSave]), "*");
                        //alert(e);
                    }
                });    
            });
            return d.promise();
        };

        var createItem = function (formData, formListName, formCounter) { //, formCounter = "Counter"
		
            var self = this;
            try {
                var ctx = new SP.ClientContext(_spPageContextInfo.webAbsoluteUrl);
                var oList = ctx.get_web().get_lists().getByTitle( window.listtitle);

                var itemCreateInfo = new SP.ListItemCreationInformation();
                this.oListItem = oList.addItem(itemCreateInfo);

                var jsonData = JSON.parse(formData);
                for (var key in jsonData) {
                    
                    if (key == "__metadata") continue;
                    if (key == "OData__ModerationStatus") continue;
                    if (key == "OData__ModerationComments") continue;
                    if (key == "OData__UIVersionString") continue;
                    //debugger;				
                    if( __checkType(jsonData[key]) == "Object") {
                        if( jsonData[key].__metadata && jsonData[key].__metadata.filedtype) {
                            // http://pointofint.blogspot.com/2014/03/how-to-set-any-spfield-value-with-jsom.html
                            switch( jsonData[key].__metadata.filedtype) {
                                case "Lookup":
                                    var lookup = new SP.FieldLookupValue();  
                                    lookup.set_lookupId(jsonData[key].value);  
                                    this.oListItem.set_item(key, lookup);  
                                    //console.log("createItem key: " + key + " value: " + JSON.stringify(lookup));					
                                    break;
                                case "UserMulti":
                                    var lookups = [];  
                                    for (var i in jsonData[key].keys) {  
                                        var lookup = SP.FieldUserValue.fromUser(jsonData[key].keys[i]);  
                                        lookups.push(lookup);  
                                    }  
                                    this.oListItem.set_item(key, lookups);  
                                    //console.log("createItem key: " + key + " value: " + JSON.stringify(lookups));					
                                    break;
                                case "User":
                                    //console.log("createItem User BYPASSED ?? key: " + key + " value: " + JSON.stringify(jsonData[key]));					
                                    break;
                                default:
                                    //console.log('model.proxy: unsupported type '+jsonData[key].__metadata.filedtype);
                                    break;
                            }
                        }
                        else {
                            if( key != 'Attachments') { 
                                this.oListItem.set_item(key, jsonData[key]);
                                //console.log("createItem key: " + key + " value: " + JSON.stringify(jsonData[key]));					
                            }
                            else {
                                //console.log("createItem key: " + key + " value: " + JSON.stringify(jsonData[key]));					
                                this.oListItem.set_item('mwp_Attachments', JSON.stringify(jsonData[key]));
                            }
                        };
                    }
                    else {
                        //console.log("createItem key: " + key + " value: " + jsonData[key]);					
                        this.oListItem.set_item(key, jsonData[key]);
                    }
                    //this.oListItem.set_item(key, jsonData[key]);
                }
                

                this.oListItem.update();

                ctx.load(this.oListItem);
                ctx.executeQueryAsync(
                    Function.createDelegate(this, function () {
                        var ID = this.oListItem.get_id();


                        //debugger;       
                        __getItem("","",ID).done(function(res){
                            //debugger;
                            if (formCounter == "PropertyBag") {
                                __formPropertyBagID(formListName).done(function (formUniqueID, formTypeID) {
                                    jsonData.mwp_FormID = formUniqueID;
                                    jsonData.mwp_FormType = formTypeID;
                                    formData = JSON.stringify(jsonData);
                                    updateItem(formData, formListName, ID);
                                });
                            }
                            else if (formCounter == "Counter")  {
                                __formCounterID(formListName, ID).done(function (formUniqueID, formTypeID) {
                                    jsonData.mwp_FormID = formUniqueID;
                                    jsonData.mwp_FormType = formTypeID;
                                    formData = JSON.stringify(jsonData);
                                    updateItem(formData, formListName, ID);
                                });
                            }
                            else {
                            debugger;                                
                                formData = JSON.stringify(jsonData);
                                updateItem(formData, formListName, ID);                            
                            }
                        });

                    }),
                    Function.createDelegate(this, function (sender, args) {
                        //debugger;					
                        parent.postMessage(JSON.stringify(["formError", args.get_message(), formListName, 0]), "*");
                    })
                );
            }
            catch (e) {
                alert("proxy error: " + JSON.stringify(e));
            }
        };
        // var __formModeration = function (formData, formListName, ID) {
        //     $.ajax({
        //         url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" +  window.listtitle + "')/enableModeration",
        //         type: "GET",
        //         headers: { "accept": "application/json;odata=verbose" },
        //         success: function (data) {
        //             parent.postMessage(JSON.stringify(["formInitialized", data.d.EnableModeration, formListName, ID]), "*");
        //         },
        //         error: function (error) {
        //             //debugger;				
        //             parent.postMessage(JSON.stringify(["formError", JSON.stringify(error), formListName, ID]), "*");
        //         }
        //     });
        // };		
        var __formViewState = function () {
            var d = $.Deferred();
            var self = this;
            $.ajax({
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/contextinfo",
                type: "POST",
                headers: { "accept": "application/json;odata=verbose" },
                success: function (data) {
                    self.formViewState = data.d.GetContextWebInformation.FormDigestValue;
                    console.log('SUCCESS: new digest value');
                    return d.resolve(self.formViewState);
                },
                error: function (error) {
                    console.log('ERROR: new digest value');
                    return d.reject();
                }
            });
            return d.promise();
        };		
        var __formUserPermissions = function () {
            var d = $.Deferred();
            //debugger;
            var canManageLists = false;
            var canModerateItems = false;
            SP.SOD.executeFunc("sp.js", "SP.ClientContext", function () {
                try {
                    var ctx = new SP.ClientContext(_spPageContextInfo.webAbsoluteUrl);
                    var web = ctx.get_web();
                    //var props = web.get_allProperties();

                    ctx.load(web, 'EffectiveBasePermissions');
                    //ctx.load(props);
                    ctx.executeQueryAsync(
                        function () {
                            //debugger;						
                            canManageLists = (web.get_effectiveBasePermissions().has(SP.PermissionKind.manageLists));
                            canModerateItems = (web.get_effectiveBasePermissions().has(SP.PermissionKind.approveItems));
                            return d.resolve(canManageLists, canModerateItems);
                        },
                        function (sender, args) {
                            return d.reject();
                        });
                }
                catch (e) {
                    alert(e);
                }
            });
            return d.promise();
        };
        var __hasPermission = function( permissions, permissionKind) {
            var userPerms = new SP.BasePermissions();
            userPerms.fromJson(permissions);
            return userPerms.has(permissionKind);
        };


        //__hasManageLists: function(permissions) { return this._hasPermission( permissions, SP.PermissionKind.manageLists); },
        //__hasApproveItems: function(permissions) { return this._hasPermission( permissions, SP.PermissionKind.approveItems); },
        var readUserInfo = function (formListName, ID) {
            var d = $.Deferred();
            SP.SOD.executeFunc("sp.js", "SP.ClientContext", function () {
                try {
                    var ctx = new SP.ClientContext(_spPageContextInfo.webAbsoluteUrl);
                    var rootweb = ctx.get_site().get_rootWeb();

                    var web = ctx.get_web();
                    var user = web.get_currentUser();
                    //var usergs = user.get_groups()
                    var groups = web.get_siteGroups()
                    ctx.load(rootweb, "EffectiveBasePermissions");
                    ctx.load(web, "AssociatedMemberGroup");
                    ctx.load(user);
                    //ctx.load(usergs);
                    ctx.load(groups,"Include(CanCurrentUserViewMembership,OnlyAllowMembersViewMembership,Title)");
                    ctx.executeQueryAsync(
                        function () {
                            //debugger;
                            var userGroups = {};
                            var uGroups = [];
//debugger;
                            // var groupIterator = usergs.getEnumerator();
                            // while(groupIterator.moveNext()){
                            //     var current = groupIterator.get_current();
                            //     userGroups[current.get_title()] = current.get_title(); //adds group titles to an array
                            // }
                            // detection method for AD groups
                            // https://stackoverflow.com/questions/33164019/user-is-part-of-an-ad-group-that-is-nested-in-the-sharepoint-group-how-to-relate/33174512#33174512
                            var groupIterator = groups.getEnumerator();
                            while(groupIterator.moveNext()){
                                var current = groupIterator.get_current();
                                // var isMemberOfGroup = current.get_canCurrentUserViewMembership() && current.get_onlyAllowMembersViewMembership();
                                // if(isMemberOfGroup){
                                //     userGroups[current.get_title()] = current.get_title(); //adds group titles to an array
                                // }
                                userGroups[current.get_title()] = {
                                    'canCurrentUserViewMembership': current.get_canCurrentUserViewMembership(),
                                    'onlyAllowMembersViewMembership': current.get_onlyAllowMembersViewMembership()
                                }; //adds group titles to an array
                                if(current.get_canCurrentUserViewMembership()) {
                                    uGroups.push(current.get_title());
                                }
                            }
//console.log('USER GROUPS: '+ JSON.stringify(uGroups));
//debugger;
                            var webUrl = _spPageContextInfo.webAbsoluteUrl;
                            var loginName = user.get_loginName();
                            //var managerLoginName = "";
                            var isSiteAdmin = user.get_isSiteAdmin();
                            var email = user.get_email();
                            var itemQuery = (ID) ? "/items(" + ID + ")" : "";
                            var endpointUrl = webUrl + "/_api/web/lists/getbytitle('" +  window.listtitle + "')"+ itemQuery +"/getusereffectivepermissions(@u)?@u='" + encodeURIComponent(loginName) + "'";
                            //console.log("itemQuery" + itemQuery);		
                            $.ajax({
                                url: endpointUrl,
                                type: "GET",
                                headers: { "accept": "application/json;odata=verbose" },
                                success: function (data) {
//debugger; 
                                    var perms = rootweb.get_effectiveBasePermissions();
                                    var can_root = perms.has(SP.PermissionKind.createGroups) && perms.has(SP.PermissionKind.managePermissions) && perms.has(SP.PermissionKind.enumeratePermissions);

                                    var userInfo = {
                                        loginName: loginName,
                                        email: email,
                                        isSiteAdmin: isSiteAdmin,
                                        //managerLoginName = managerLoginName,
                                        userGroups: uGroups,//userGroups,
                                        userPermissions: JSON.stringify(data.d.GetUserEffectivePermissions),
                                        userEffectivePermissions: data.d.GetUserEffectivePermissions,
                                        associatedMemberGroupName: web.get_associatedMemberGroup().get_title(),
                                        canCreateGroups: can_root
                                    };
                                    d.resolve(userInfo);
                                },
                                error: function (error) {
                                    d.reject();
                                }
                            });
                        },
                        function (sender, args) {
                            d.reject();
                        });
                }
                catch (e) {
                    alert(e);
                    d.reject();
                }
            });
            return d.promise();
        };
        var __getItem = function (formData, formListName, ID) {
            var self = this;
            var d = $.Deferred();
            
            var url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" +  window.listtitle + "')/items(" + ID + ")";
            $.ajax({
                url: url,
                type: "GET",
                headers: { "accept": "application/json;odata=verbose" },
                success: function (data) {
                    //debugger;				
                    var jsonData = data.d;
                    self.__metadata = data.d.__metadata;
                    d.resolve(data.d);

                },
                error: function (error) {
                    //debugger;	
                    d.reject();			
                }
            });
            return d.promise();
        };

        var readItem = function (queryOData, formListName, ID) {
            var d = $.Deferred();
            var self = this;
            var url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" +  window.listtitle + "')/items(" + ID + ")";

            // add OData query    		
            if( queryOData && queryOData != "") url = url + queryOData;

            $.ajax({
                url: url,
                type: "GET",
                headers: { "accept": "application/json;odata=verbose" },
                success: function (data) {
                    //debugger;                    
                    var jsonData = data.d;
                    self.__metadata = data.d.__metadata;

                    readAttachments(queryOData, formListName, ID).done( function(attachments) {

                        jsonData["Attachments"] = (jsonData["mwp_Attachments"]) ? mapAttachments( attachments, JSON.parse(jsonData["mwp_Attachments"])) : attachments;
                        if(formListName) parent.postMessage(JSON.stringify(["formLoaded", jsonData, formListName, ID]), "*");
                        d.resolve(jsonData);
                    });
                },
                error: function (error) {
                    parent.postMessage(JSON.stringify(["formError", JSON.stringify(error), formListName, ID]), "*");
                    d.reject();
                }
            });
            return d.promise();            
        };

        var readAttachments = function (formData, formListName, ID) {
            var d = $.Deferred();
            $.ajax({
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" +  window.listtitle + "')/items(" + ID + ")/AttachmentFiles",
                type: "GET",
                headers: { "accept": "application/json;odata=verbose" },
                success: function (data) {
                    if( data) {
                        var r = {};
                        r.results = [];
                        data.d.results.forEach( function( item) {
                            var fileURL = item.ServerRelativeUrl.toString();
                            
                            var absoluteFileUrl = _spPageContextInfo.webAbsoluteUrl + fileURL.substring(fileURL.indexOf("/Lists"), fileURL.length);
                            var fileName = fileURL.substring( fileURL.lastIndexOf("/")+1, fileURL.length);
                            
                            r.results.push({
                                'newFileName': "",
                                'oldFileName': fileName,
                                'url': absoluteFileUrl,
                                'prefix': ""//fileTag
                            });
                        });
                        d.resolve(r);
                    }
                    else {
                        parent.postMessage(JSON.stringify(["formError", "no attachments data", formListName, ID]), "*");
                        d.reject();
                    }
                },
                error: function (error) {
                    parent.postMessage(JSON.stringify(["formError", JSON.stringify(error), formListName, ID]), "*");
                    d.reject();
                }
            });
            return d.promise();            
        };

        var deleteAttachment = function (params) {
            var d = $.Deferred();
                $.ajax({
                    url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" +  window.listtitle + "')/getItemById(" + params.ID + ")/AttachmentFiles/getByFileName('" + params.oldFileName + "')",
                    method: 'POST',
                    contentType: 'application/json;odata=verbose',
                    headers: {
                        'X-RequestDigest': params.requestDigest, //$('#__REQUESTDIGEST').val(),
                        'X-HTTP-Method' : 'DELETE',
                        'Accept': 'application/json;odata=verbose'
                    },            
                    success: function (data) {
                    //console.log('deleted attachment ' + fileName);			
                        return d.resolve();
                    },
                    error: function (error) {
                    //console.log('error deleting attachment ' + fileName + ' err:' + error);			
                        return d.reject();
                    }
                });
            return d.promise();
        };
        
        var uploadAttachment = function (formData, formListName, ID) {
            this.index = formData;
            var input = $('#fileSelector');
            input.click();
        };
        
        var receiveAttachment = function( event) {
            var self = this;
            var input = event.target;
            var file = input.files[0];
            var reader = new FileReader();
            reader.addEventListener("load", function() {
                shared._formAttachmentsContent[file.name] = reader.result;
                parent.postMessage(JSON.stringify(["formAttachmentUploaded", file.name, 100, self.index]), "*");
            }, false);
            if(file) {
                reader.readAsArrayBuffer(file);
            }
        };

        // https://www.joezimjs.com/javascript/patterns-asynchronous-programming-promises/
        var sequentialAsyncWithForEach = function(formData, formListName, ID, requestDigest) {
            var promise = $.Deferred().resolve(null);
            //debugger;
            formData.results.forEach( function(item) {
            
                var newFileName = item.newFileName;
                var oldFileName = item.oldFileName;
                var prefix = item.prefix;

                var fileName = newFileName;

                var params = item;
                params.formListName = formListName;
                params.ID = ID;
                params.requestDigest = requestDigest;
 
                var asyncOperation = function() { 
                    return $.Deferred().resolve();
                };

                if( oldFileName == "") {
                    if( newFileName != "") { 
                        //console.log('create attachment ' + 	newFileName);	
                        asyncOperation = createAttachment;
                    }
                }
                if( newFileName == "") {
                    if( oldFileName != "" && prefix == 'deleted') { 
                        //console.log('delete attachment ' + 	oldFileName);
                        fileName = oldFileName;
                        asyncOperation = deleteAttachment;
                    }
                }
                if( (oldFileName != "") && (newFileName != "")) {
                        //console.log('replace attachment ' + 	oldFileName + " to " + newFileName);			
                        asyncOperation = replaceAttachment;
                }

                promise = promise.then(function(){
                    return asyncOperation(params);
                }).then( function () {
                    //console.log('saved attachment: ' + newFileName);                   
                });
            });

            return promise.then(function(){
                //console.log('promise forEach '); 
                //debugger;    
            });
        };

        var saveAttachments = function (formData, formListName, ID, requestDigest) {
            var self = this;
            if( !formData && !formData.results) { console.log('invalid attachments format'); return;}
            
            var d = $.Deferred();
            var requests = [];
            //console.log('saving attachments: ' + 	formData.results);	
           
            sequentialAsyncWithForEach(formData, formListName, ID, requestDigest).then( function () {
                //debugger;                
                readAttachments(formData, formListName, ID).done( function( attachment) {
                    //console.log('loaded attachments: ' + attachment.results);			
                    d.resolve(attachment);
                });
            }, function () {
                d.reject();
            });

            return d.promise();
            
        };
        

        var replaceAttachment = function (params) {
            var d = $.Deferred();
            var self = this;
                deleteAttachment(params).done( function () {
                    createAttachment(params).done( function (data) {
                        d.resolve(data.d);
                    });
                });		
            return d.promise();
        };

        var createAttachment = function (params) {
            var d = $.Deferred();
            var self = this;
            //var fileBuffer = __str2ab( fileContent);
            var fileBuffer = shared._formAttachmentsContent[params.newFileName];
            //__formViewState().done( function( requestDigest) {
                $.ajax({
                    url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" +  window.listtitle + "')/getItemById(" + params.ID + ")/AttachmentFiles/add(FileName='" + params.newFileName + "')",
                    method: 'POST',
                    binaryStringRequestBody: true,
                    data: fileBuffer,
                    processData: false,
                    contentType: 'application/json;odata=verbose',
                    headers: {
                        'X-RequestDigest': params.requestDigest, //$('#__REQUESTDIGEST').val(),
                        'Accept': 'application/json;odata=verbose'//,
                        //'content-length': fileBuffer.byteLength
                    },            
                    success: function (data) {
                        //console.log('created attachment ' + fileName);			
                        d.resolve(data.d);
                    },
                    error: function (error) {
                        //console.log('error creating attachment '+ fileName +' err:' + error);
                        d.reject();
                    }
                });
            //});
            return d.promise();
        };   

        var __checkType = function( object) {
            var stringConstructor = "test".constructor;
            var arrayConstructor = [].constructor;
            var objectConstructor = {}.constructor;
            if (object === null) {
                return "null";
            }
            else if (object === undefined) {
                return "undefined";
            }
            else if (object.constructor === stringConstructor) {
                return "String";
            }
            else if (object.constructor === arrayConstructor) {
                return "Array";
            }
            else if (object.constructor === objectConstructor) {
                return "Object";
            }
            else {
                return "don't know";
            }
        };

        // Update an existing list item
        var updateItem = function (formData, formListName, ID) {
            var self = this;
            __formUserPermissions().done(function (canManageLists, canModerateItems) {

                //debugger;
                //var canModerateItems = false;
                var jsonData = JSON.parse(formData);
                var adjustedData = {};
                if (!canModerateItems || !shared.listInfo.enableModeration) {
                    delete jsonData["OData__ModerationStatus"];
                    delete jsonData["OData__ModerationComments"];
                    delete jsonData["OData__UIVersionString"];
                }
                for (var key in jsonData) {

                    //if( key.indexOf('*') >= 0) continue; // exclude JSON-only fields

                    if( __checkType(jsonData[key]) == "Object") {
                        if( jsonData[key].__metadata && jsonData[key].__metadata.filedtype) {
                            adjustedData[jsonData[key].intname] = jsonData[key].value;
                        }
                        else { 
                            if( key != 'Attachments') adjustedData[key] = jsonData[key];
                            else adjustedData['mwp_Attachments'] = JSON.stringify(jsonData[key]);
                        }
                    }
                    else adjustedData[key] = jsonData[key];
                    //this.oListItem.set_item(key, jsonData[key]);
                }
                //debugger;	
                //adjustedData.__metadata = SPAFORM().list.__metadata;
				adjustedData.__metadata = self.__metadata;
                var adjustedFormData = JSON.stringify(adjustedData);
                
                __formViewState().done( function( requestDigest) {
                    $.ajax({
                        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" +  window.listtitle + "')/items(" + ID + ")",
                        type: "POST",
                        headers: {
                            "accept": "application/json; odata=verbose", "content-type": "application/json; odata=verbose",
                            "X-RequestDigest": requestDigest,//$('#__REQUESTDIGEST').val(),
                            "X-HTTP-Method": "MERGE",
                            "IF-MATCH": "*"
                        },
                        data: adjustedFormData,
                        success: function (data) {
                            //debugger;					
                            var jsonData = JSON.parse(formData);
                            //debugger;						
                            if( jsonData.Attachments) {
                                saveAttachments(jsonData.Attachments, formListName, ID, requestDigest).done( function(attachments) {
                                    //debugger;                                    
                                    jsonData['Attachments'] = mapAttachments( attachments, JSON.parse(adjustedData['mwp_Attachments']));
                                    //debugger;
                                    readItem(shared.listInfo.columns.ODataRequestCached, null, ID).done( function(itemInfo) {
                                        parent.postMessage(JSON.stringify(["formSaved", itemInfo, formListName, ID]), "*");
                                    });

                                });
                            }
                            else {
                                //debugger;                                
                                readItem(shared.listInfo.columns.ODataRequestCached, null, ID).done( function(itemInfo) {
                                    parent.postMessage(JSON.stringify(["formSaved", itemInfo, formListName, ID]), "*");
                                });
                            }

                        },
                        error: function (error) {
                            //debugger;						
                            parent.postMessage(JSON.stringify(["formError", JSON.stringify(error), formListName, ID]), "*");
                        }
                    });
                });
            });
        };
        var mapAttachments = function (attachments, mappings) {
            if( !mappings) mappings = {};
            if( !mappings.results) mappings.results = [];
            //debugger;		
            attachments.results.forEach( function(attachment) {
                var mapitem = $.grep(mappings.results, function(e){ return (e.oldFileName == attachment.oldFileName) || e.newFileName == attachment.oldFileName; });
                if( mapitem.length > 0) attachment.prefix = mapitem[0].prefix;
            });
            return attachments;
        };
        // Update an existing list item
        var deleteItem = function (formData, formListName, ID) {
            var jsonData = JSON.parse(formData);
            __formViewState().done( function( requestDigest) {
                $.ajax({
                    url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" +  window.listtitle + "')/items(" + ID + ")",
                    type: "POST",
                    headers: {
                        "accept": "application/json; odata=verbose", "content-type": "application/json; odata=verbose",
                        "X-RequestDigest": requestDigest,//$('#__REQUESTDIGEST').val(),
                        "X-HTTP-Method": "DELETE",
                        "IF-MATCH": "*"
                    },
                    //data: formData,
                    success: function (data) {
                        parent.postMessage(JSON.stringify(["formDeleted", formData, formListName, ID]), "*");
                        parent.postMessage(JSON.stringify(["formHeader", jsonData["mwp_FormType"], "", ""]), "*"); 

                    },
                    error: function (error) {
                        
                        parent.postMessage(JSON.stringify(["formError", JSON.stringify(error), formListName, ID]), "*");
                    }
                });
            });
        };


        var getManagerEmail = function () {
            var d = $.Deferred();

            var getManagerInfo = function() {
                
                SP.SOD.executeFunc("sp.js", /*"sp.userprofiles.js",*/ "SP.ClientContext", function () {
                
                try {
                    var ctx = new SP.ClientContext(_spPageContextInfo.webAbsoluteUrl);
                    var peopleManager = new SP.UserProfiles.PeopleManager(ctx);
                    var userProperties = peopleManager.getMyProperties();
                    ctx.load(userProperties);
                    ctx.executeQueryAsync(
                        function () {

                            var personsProperties = [];
                            var managerAccount = userProperties.get_userProfileProperties()["Manager"]; // string - loginName
                            var manager = peopleManager.getUserProfilePropertyFor(managerAccount, "WorkEmail");
                            personsProperties.push(manager);
                            
                            ctx.executeQueryAsync(
                                function () {   
                                    var mgr = personsProperties[0];                              
                                    d.resolve(mgr.m_value, managerAccount);
                                },
                                function (sender, args) {
                                    d.reject();
                                });                                            
                        },
                        function (sender, args) {
                            d.reject();
                        });
                }
                catch (e) {
                    alert(e);
                    d.reject();
                }
            });                    
            };

            SP.SOD.executeOrDelayUntilScriptLoaded(getManagerInfo, 'SP.UserProfiles.js'); 

            return d.promise();
        };

        var getGroupEmails = function ( groupName) {
            var d = $.Deferred();
            var to = [];

            if(groupName && (groupName != "")) {

                SP.SOD.executeFunc("sp.js", "SP.ClientContext", function () {
                    try {
                        var ctx = new SP.ClientContext(_spPageContextInfo.webAbsoluteUrl);
                        var group = ctx.get_web().get_siteGroups().getByName(groupName);
                        var users = group.get_users();
                        ctx.load(users);
                        ctx.executeQueryAsync(
                            function () {                           
                                var userIterator = users.getEnumerator();
                                while(userIterator.moveNext()){
                                    var current = userIterator.get_current();
                                    var email = current.get_email();
                                    if( email && (email.length > 3)) to.push(email);
                                }
                                d.resolve(to);
                            },
                            function (sender, args) {
                                d.reject();
                            });
                    }
                    catch (e) {
                        alert(e);
                        d.reject();
                    }
                });
                return d.promise();
            }
            else
                return d.resolve(to);
        };
        var sendEmail = function (send, from, to, subject, body, managerLoginName) {
;
            if( !send) {
                parent.postMessage(JSON.stringify(["formEmailSendDone", managerLoginName, "", ""]), "*");
                return;
            }

            if( to.length == 0 ) {
                parent.postMessage(JSON.stringify(["formEmailSendDone", managerLoginName, "", ""]), "*");
                return;                
            }

            var emailProperties = JSON.stringify({
                'properties': {
                    '__metadata': {
                        'type': 'SP.Utilities.EmailProperties'
                    },
                    'From': from,
                    'To': {
                        'results': to
                    },
                    'Body': body,
                    'Subject': subject
                }
            });

            __formViewState().done( function( requestDigest) {

                $.ajax({
                    contentType: 'application/json',
                    url: _spPageContextInfo.siteServerRelativeUrl + "/_api/SP.Utilities.Utility.SendEmail",
                    type: "POST",
                    data: emailProperties,                                
                    headers: {
                        "Accept": "application/json;odata=verbose",
                        "content-type": "application/json;odata=verbose",
                        "X-RequestDigest": requestDigest
                    },
                    //data: formData,
                    success: function (data) {
                        parent.postMessage(JSON.stringify(["formEmailSendDone", managerLoginName, "", ""]), "*");

                    },
                    error: function (error) {
                        parent.postMessage(JSON.stringify(["formEmailSendFailed", JSON.stringify(error.responseText), "", ""]), "*");
                    }
                });
            });
        };
        
        // Update an existing list item
        var sendEmailNotification = function (formData, formListName, ID) {

            var jsonData = formData;//JSON.parse(formData);
            
            getGroupEmails(jsonData.to).done(function(to) {
                if(jsonData.manager == true) {
                    getManagerEmail().done(function(managerEmail, managerLoginName){                      
                        to.push(managerEmail);
                        sendEmail(jsonData.send, jsonData.from, to, jsonData.subject, jsonData.body, managerLoginName);
                    }).fail(function(sender, msg){
                        parent.postMessage(JSON.stringify(["formEmailSendFailed", JSON.stringify(msg), formListName, ID]), "*");                        
                    })
                }
                else 
                    sendEmail(jsonData.send, jsonData.from, to, jsonData.subject, jsonData.body);
            }).fail(function(sender, msg){
                parent.postMessage(JSON.stringify(["formEmailSendFailed", JSON.stringify(msg), formListName, ID]), "*");
            });
        };        
        // get unique formID for new submitted form using value of incremental counter attached to list
        var __formPropertyBagID = function (formListName) {
            var d = $.Deferred();
            SP.SOD.executeFunc("sp.js", "SP.ClientContext", function () {
                try {
                    var ctx = new SP.ClientContext(_spPageContextInfo.webAbsoluteUrl);
                    var rootFolder = ctx.get_web().get_lists().getByTitle( window.listtitle).get_rootFolder();
                    ctx.load(rootFolder, 'Properties');
                    ctx.executeQueryAsync(
                        function () {
                            var counter = parseInt(rootFolder.get_properties().get_fieldValues()["FormCounter"]);
                            var prefix = rootFolder.get_properties().get_fieldValues()["FormPrefix"];
                            var formTypeID = rootFolder.get_properties().get_fieldValues()["FormType"];
                            var formUniqueID = prefix + counter;
                            rootFolder.get_properties().set_item("FormCounter", counter + 1);
                            rootFolder.update();
                            ctx.executeQueryAsync(
                                function () {
                                    d.resolve(formUniqueID, formTypeID);
                                },
                                function (sender, args) {
                                    d.reject();
                                });
                        },
                        function (sender, args) {
                            d.reject();
                        });
                }
                catch (e) {
                    alert(e);
                }
            });
            return d.promise();
        };
        var __formCounterID = function (formListName, ID) {
            var d = $.Deferred();
            SP.SOD.executeFunc("sp.js", "SP.ClientContext", function () {
                try {
                    var ctx = new SP.ClientContext(_spPageContextInfo.webAbsoluteUrl);
                    var rootFolder = ctx.get_web().get_lists().getByTitle( window.listtitle).get_rootFolder();
                    ctx.load(rootFolder, 'Properties');
                    ctx.executeQueryAsync(
                        function () {
                            //var counter = parseInt(rootFolder.get_properties().get_fieldValues()["FormCounter"]);
                            var prefix = rootFolder.get_properties().get_fieldValues()["FormPrefix"];
                            var formTypeID = rootFolder.get_properties().get_fieldValues()["FormType"];
                            var formUniqueID = prefix + ID;
                            d.resolve(formUniqueID, formTypeID);
                        },
                        function (sender, args) {
                            d.reject();
                        });
                }
                catch (e) {
                    alert(e);
                }
            });
            return d.promise();
        };
        var __str2ab = function( str) {		
            var strLen = str.length;
            var buf = new ArrayBuffer( strLen);// * 2); // 2 bytes for each char
            var bufView = new Uint8Array(buf);
            for ( var i=0; i < strLen; i++) {
                bufView[i] = str.charCodeAt(i);
            }
            return buf;
        };
        
        var formColumnsEnsure = function(s_columns, formListName, ID) {
            var d = $.Deferred();
//debugger;            
            SP.SOD.executeFunc("sp.js", "SP.ClientContext", function () {
                try {
                    var ctx = new SP.ClientContext(_spPageContextInfo.webAbsoluteUrl);
                    var list = ctx.get_web().get_lists().getByTitle(formListName);

                    var fieldCollection = list.get_fields();
                    var count = 0;
                    var columns = JSON.parse(s_columns);
                    for( var key in columns) {
                        if( columns[key]) {
                            fieldCollection.addFieldAsXml( columns[key], false, SP.AddFieldOptions.addFieldInternalNameHint);        
                            count++;
                        }
                    };
                    
                    // if(count == 0) {
                    //     return d.resolve();
                    // }

                    ctx.load(fieldCollection);				
                    ctx.executeQueryAsync(  function() { 
                        // //debugger;					
                        // SPAFORM().list.fields = null; //reset cached fields & reload from SharePoint
                        // parent._d_formFieldsQuery = null; // form2.js:879
        
                        // _this._formGetFields().done( function( fields) {
                        //     //debugger;												
                        //     d.resolve(); 
                        // });
                        // parent.postMessage(JSON.stringify(["formColumnsEnsured", formData, formListName, ID]), "*");
                        //queryFields(columns, formListName, ID);
                        queryFields('', formListName, null); // ---> "formFieldsQueryDone" OR "formError"
                    }, 
                    function(sender, args) {
                        parent.postMessage(JSON.stringify(["formError", JSON.stringify(args), formListName, ID]), "*");
                        d.reject(); 
                    });
        
                }
                catch (e) {
                    alert(e);
                }
            });
            return d.promise();        
        }

		var formRuntime = unescape(JSRequest.QueryString["Runtime"]); // DEFINED FOR SEARCH USE CASE
		var viewmodelDesign = (unescape(JSRequest.QueryString["DisplayMode"]) == "Design") ? true : false;
		//
		// NORMAL OPTIONS  
		//	
		 
		self.version = "1.0.6.0";


        window.openFile = receiveAttachment;
		
		var inIframe = function () {
			try {
				return window.self !== window.top;
			} 
			catch (e) {
				return true;
			}
		};

		var proxyListener = function(e) {	
            try {
                //console.log('proxy - ' + e.data);
                var data = JSON.parse(e.data);
                var eventName = data[0];
                var formData = data[1];
                var listName = data[2];
                var ID = data[3];

                //if (eventName == 'formInitialize')   { __formModeration(formData, listName, ID); }

                if (eventName == 'formLoad')   { readItem(formData, listName, ID); }
                if (eventName == 'formCreate') { createItem(formData, listName, ID); }
                if (eventName == 'formUpdate') { updateItem(formData, listName, ID); }
                if (eventName == 'formDelete') { deleteItem(formData, listName, ID); }
                
                if (eventName == 'formAttachmentUpload')   { uploadAttachment(formData, listName, ID); } 

                if (eventName == 'formPeopleQuery')   { queryPeople(formData, listName, ID); }
                if (eventName == 'formLookupQuery')   { queryLookup(formData, listName, ID); }
                if (eventName == 'formFieldsQuery')   { queryFields(formData, listName, ID); }
                
                if (eventName == 'formColumnsEnsure')   { formColumnsEnsure(formData, listName, ID); }
                if (eventName == 'formEmailSend')       { sendEmailNotification(formData, listName, ID); }
             }
            catch (error) {
                //               alert("PROXY: formListener ERROR " + error);
                return;
            }
		};
                
		/**
		 * Proxy module entry point
		 */
		 var init = function(SPAFORM) {
			 
			if (typeof window.addEventListener !== 'undefined') {
				window.addEventListener('message', proxyListener, false);
			}
			else if (typeof window.attachEvent !== 'undefined') {
				window.attachEvent('onmessage', proxyListener);
			};
			
			if( !inIframe()) SPAFORM()['_'].listeners.push(proxyListener);
			 
            var sendInitFormInfo = function(listInfo, userInfo,/*permissions, upstr,*/ itemData) {

					var initInfo = JSON.parse(listInfo);
                    initInfo.userInfo = userInfo;
					initInfo.listPath = _spPageContextInfo.webAbsoluteUrl + "/Lists/" + shared.formList;
                    initInfo.listName = shared.formList;
                    initInfo.listTitle = window.listtitle;                    
                    initInfo.itemData = itemData;

					parent.postMessage(JSON.stringify(["proxyReady", $("#formContainer").html(), initInfo/*columns*/, ''/*permissions*/]), "*");
            };
            
			readUserInfo(shared.formList, shared.formID).done(function (userInfo) {                
				readListInfo( "", shared.formList, shared.formID).done( function( listInfo) {

                    if(shared.formID) {
                        readItem(shared.listInfo.columns.ODataRequestCached, null, shared.formID).done( function(itemInfo) {
                            sendInitFormInfo(listInfo, userInfo, itemInfo);  
                        });
                    }
                    else          
                        sendInitFormInfo(listInfo, userInfo, undefined);  
				});
			}).fail(function(error) {
				console.log(JSON.stringify(error));
			});
		 };
		 
		 if( !inIframe()) {
			require(['spaform'], function(SPAFORM) {
				init(SPAFORM);
			});
		 }
		 else 
			 init();
            


    }

    return proxyLoader;

});
