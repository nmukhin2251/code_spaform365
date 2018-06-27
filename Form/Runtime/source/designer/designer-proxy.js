	var build = function(jsonData) {
		var out, buildText;

		//var jsonData = JSON.parse( e.data);
		
		if (jsonData.cmd === 'run') {
			jsonData.config["out"] = function (text) {
					out = text;
			};
			if( jsonData.config['sysbuild']) {
				jsonData.config["onBuildRead"] = function(moduleName, path, contents) {
					console.log('onBuildRead: ' + moduleName);
					return contents.replace(/console.log(.*);/g, '');
				};
				jsonData.config["onBuildWrite"] = function(moduleName, path, contents) {
					console.log('onBuildWrite: ' + moduleName);
					return contents.replace(/.'_v#'/g, "'"+jsonData.config["productVersion"]+"'");
				};
			};
			
			requirejs.optimize( jsonData.config
			, function (buildText) {
				parent.postMessage(JSON.stringify(["builderCompleted", buildText, out]), "*");
				/*
				self.postMessage(JSON.stringify({
					out: out,
					buildText: buildText
				}, null, '  '));
				*/
			});
		}
	};
	
	var searchConfig = function(jsonData) {

		var uploadFile = function(webAbsoluteUrl, folderUrl, listTitle, fileName, fileContent, success, error ) {

			var buildFileInfo = function( fileName) {
				var fileInfo = new SP.FileCreationInformation();
				fileInfo.set_url(fileName);
				fileInfo.set_overwrite(true);
				fileInfo.set_content(new SP.Base64EncodedByteArray());

				for (var i = 0; i < fileContent.length; i++) {			
					fileInfo.get_content().append(fileContent.charCodeAt(i));
				}
				return fileInfo;
			}
			
			SP.SOD.executeFunc("sp.js", "SP.ClientContext", function () {
				try {
					var ctx = new SP.ClientContext(webAbsoluteUrl);

					var folder;
					if( !listTitle) {
						folder = ctx.get_web().getFolderByServerRelativeUrl(folderUrl);
					}
					else {
						var list = ctx.get_web().get_lists().getByTitle(listTitle);  
						folder = list.get_rootFolder();
					}


					var files = folder.get_files();
					ctx.load(folder);
					ctx.load(files);
					ctx.executeQueryAsync( function () {
						ctx.load(files.add(buildFileInfo(fileName)));
						ctx.executeQueryAsync( function () { success( folder.get_serverRelativeUrl() + '/' + fileName); }, function (err) { error(err); })						
					},
					function (err) { error(err); });
				} catch(e) { error(e); };
			});
		};

		var getFileWithProperties = function( webAbsoluteUrl, fileServerRelativeUrl, success, error) {
			
			var ctx = new SP.ClientContext(webAbsoluteUrl);
			var file = ctx.get_web().getFileByServerRelativeUrl(fileServerRelativeUrl);   
			ctx.load(file,'ListItemAllFields'); 
		 
			ctx.executeQueryAsync(
			   function () {
				  success(file);
			   }, 
			   error);			
		};
		
		var uploadSearchConfiguration = function(fileContent) {
			var d = $.Deferred();
			var _this = this;
			var error = function(err) {
alert('error:93');				
				d.reject(err);
			};
			var success = function( fileServerRelativeUrl) {
				//https://sharepoint.stackexchange.com/questions/133455/sp2013-javascript-object-model-setting-the-value-of-a-list-field		
				getFileWithProperties( _spPageContextInfo.siteAbsoluteUrl, fileServerRelativeUrl, function(file){
					var listItem = file.get_listItemAllFields(); 
					var itemProperties = {'Scope': 'SPSite'};
					updateListItem(listItem,itemProperties,function() {
						d.resolve();
					},error);			   
				}, error)
			};
			function updateListItem(listItem,properties,success,error) 
			{
			   var ctx = listItem.get_context();
			   for(var propName in properties) {
				   listItem.set_item(propName, properties[propName]) 
			   }
			   listItem.update();
			   ctx.executeQueryAsync(
				   function () {
					 success();
				   }, 
				   error);
			};
			
			var folderUrl = '';
			var listTitle = 'Search Config List';
			uploadFile( _spPageContextInfo.siteAbsoluteUrl, folderUrl, listTitle, 'SPAFORMS365.xml', fileContent, success, error);

			return d.promise();
		};

		var enableFeature = function(featureId) {
			var d = $.Deferred();

			var ctx = new SP.ClientContext(_spPageContextInfo.siteAbsoluteUrl);
			var web = ctx.get_site().get_rootWeb();
			var success = function(){ 				
				d.resolve(); 
			};
			var failure = function(sender, args){ 
alert('error:136');			
				d.reject(args); 			
			};
			web.get_features().add(
				new SP.Guid(featureId),
				true,
				SP.FeatureDefinitionScope.none); // out-of-box SharePoint feature
				ctx.executeQueryAsync(success, failure);	

			return d.promise();
		};
		
		var enableSearchFeature = function() {
			var d = $.Deferred();

			var featureIdSearchDataTypes = '48a243cb-7b16-4b5a-b1b5-07b809b43f47';
			var featureIdSearchSiteColumns = '41dfb393-9eb6-4fe4-af77-28e4afce8cdc';  
			var featureIdSearchConfigListInstance = 'acb15743-f07b-4c83-8af3-ffcfdf354965';  
			var featureIdSearchConfigTemplate = 'e47705ec-268d-4c41-aa4e-0d8727985ebc';  

			enableFeature(featureIdSearchDataTypes).done(function(){
				enableFeature(featureIdSearchSiteColumns).done(function(){
					enableFeature(featureIdSearchConfigTemplate).done(function(){
						enableFeature(featureIdSearchConfigListInstance).done(function(){
							d.resolve();
						}).fail(function(args) { d.reject(args)});								
					}).fail(function(args) { d.reject(args)});						
				}).fail(function(args) { d.reject(args)});
			}).fail(function(args) { d.reject(args)});
						
			return d.promise();
		};
		
		var provisionManagedColumns = function(xmlConfig) {
//			debugger;
			//var dsgn = SPAFORM()['_'].designer;

			var fileContent = xmlConfig;
			/*
			if( !fileContent) {
				var p = SPAFORM().project;
				p.read();
				fileContent = p.getFile('SPAFORM365.xml');	
			}
			*/
			if( !fileContent) return;
//alert('start:182');
			enableSearchFeature().done(function(){
//debugger;				
				uploadSearchConfiguration(fileContent).done(function(){
//debugger;					
					parent.postMessage(JSON.stringify(["searchConfigCompleted", "par1", "par2"]), "*");					
				});
			});
		};
		
//		debugger;
		provisionManagedColumns(jsonData.xmlConfig);
	};
	
	
	
	var rListener = function(e) {	
		try {
//debugger;		
			var jsonData = JSON.parse( e.data);
			if (jsonData.cmd === 'run') {
				build(jsonData);
			}
			if (jsonData.cmd === 'searchConfig') {
				searchConfig(jsonData);
			}
		}
		catch (error) {
			parent.postMessage(JSON.stringify(["formError", JSON.stringify(error), ""]), "*");
			return;
		}
	};
	
	var getUrlParameter = function (name) {
		name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
		var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
		var results = regex.exec(location.search);
		return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
	};

	
    document.addEventListener('DOMContentLoaded', function (evt) {	
	//debugger;
		if (typeof window.addEventListener !== 'undefined') {
			window.addEventListener('message', rListener, false);
		}
		else if (typeof window.attachEvent !== 'undefined') {
			window.attachEvent('onmessage', rListener);
		};
		
		var ready = getUrlParameter("startupReady");
		//parent.postMessage(JSON.stringify(["builderReady", "", ""]), "*");
		parent.postMessage(JSON.stringify([ready, "", ""]), "*");
    }, false);
	
