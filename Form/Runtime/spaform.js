/*
	params:	{
				debug: true,
				listUrl: listUrl,
				parentId: 'spaform365',
				//itemId: '5',
				onCloseCallback: function() {alert('FORM CLOSED!');},
				mode: 'proxy' //'NewForm' //'DispForm', 'EditForm'
			}
*/
var spaform = (function(){
	var _this = this;

	String.prototype.hashCode = function() {
	  var hash = 0, i, chr;
	  if (this.length === 0) return hash;
	  for (i = 0; i < this.length; i++) {
		chr   = this.charCodeAt(i);
		hash  = ((hash << 5) - hash) + chr;
		hash |= 0; // Convert to 32bit integer
	  }
	  var h = (hash >= 0) ? hash : hash * (-1);
	  return h;
	};
		
	var ensure_listUrl = function( listUrl) {
		if( !listUrl) listUrl = window.location.href;
		
		var	b = listUrl.indexOf('/Lists/');
		var b1 = listUrl.substring(b + 7);
		var	e = (b1.indexOf('/') == -1) ? -1 : b + 7 + b1.indexOf('/');
					
		if( b != -1) b+=7; else	return null; 						// no /Lists/ pattern found
		
		if( e == -1) {
			if ((listUrl.length - b) > 0) return listUrl;				// no / found after /Lists/ & list name at least 1 character long
			else return null;										// list name is 0 characters long
		}
		return listUrl.substring( 0, e); 								// refined listUrl

	};

	var ensure_mode = function( listUrl, mode) {
		
		if( mode) return mode;
		
		if( !listUrl) listUrl = window.location.href;		
		
		if( listUrl.indexOf('/NewForm.aspx') != -1) return 'newform';
		if( listUrl.indexOf('/DispForm.aspx') != -1) return 'dispform';
		if( listUrl.indexOf('/EditForm.aspx') != -1) return 'editform';
		
		return mode; 
	};	
	
	var checkUrl = function( listUrl) {
		if( !listUrl) return false;
		return (ensure_listUrl(listUrl)) ? true : false;
	};
	
	var close = function(  formUrl) {
		var listUrl = ensure_listUrl(formUrl);
		if( !listUrl) return 'SPAFORM ERROR: listUrl';
		
		var ctx = 'ctx-' + listUrl.hashCode();
		
		if( top[ctx] && top[ctx].SPAFORM['_'].initialized) {
			top[ctx].SPAFORM.destroy();
		} else {
			delete top[ctx];
		}	
		return false;
	};
	
	window.debugVersion = (new Date()).getTime();

	this.callback = null;
	var ready = function( callback) {		
		if( typeof callback === 'function' ) _this.callback = callback;
	};
	
	var open = function( params) {
		
		var retval = false;
		
		if(!params) return 'SPAFORM ERROR: missing params';
		if(!params.parentId) return 'SPAFORM ERROR: missing param - parentId';
		if(!document.getElementById(params.parentId)) return 'SPAFORM ERROR: missing dom node with id = ' + params.parentId;
		
		var getUrlParameter = function (name) {
			name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
			var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
			var results = regex.exec(location.search);
			return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
		};
		
		var urlArgs = function(id, url) {
			var args = "";
			if( params.debug) args = window.debugVersion;
			else args = 'ctx-' + params.listUrl.hashCode().toString() + "-1.0.7.9";

			if( args == "") return "";
			return (url.indexOf('?') === -1 ? '?' : '&') + args;	
		};
		
		params.listUrl = ensure_listUrl(params.listUrl);
		if( !params.listUrl) return 'SPAFORM ERROR: listUrl';
		
		params.contextId = 'ctx-' + params.listUrl.hashCode();
		
		params.mode = ensure_mode(params.listUrl, params.mode);
		
		if( location.search.indexOf('Debug') !== -1) params.debug = true;

		try {
			if( params.mode == 'proxy') {
				var config = {
					baseUrl: params.listUrl + '/Form/Design',
					paths: {
						'form-loader-proxy': (params.debug) ? '../Runtime/source/runtime/form-loader-proxy'	: '../Runtime/runtime.min'			
					},
					urlArgs: urlArgs				
				};
				var _require = require.config( config);
				_require (["form-loader-proxy"], function (PROXY) {
					PROXY();
				});
			}
			else {
				if(!params.design) params.design = (getUrlParameter("DisplayMode") == "Design") ? true : false;

				if(!params.mode && params.itemId) params.mode = 'dispform';
				if(!params.mode) params.mode = 'newform';
				
				var config = {
					context: ctx,
					baseUrl: params.listUrl + '/Form/Design',
					paths: {
						'spaform': (params.debug) ? '../Runtime/source/runtime/spaform'	: '../Runtime/runtime.min'			
					},
					urlArgs: urlArgs			
				};

				if( params.design || params.debug) delete params.contextId;
				if( params.contextId) config.context = params.contextId; //otherwise use default '_' context.				
				var _require = require.config( config);
				
				_require (['spaform'], function (SPAFORM) {					
					SPAFORM().load(params);
					if( _this.callback) _this.callback(SPAFORM);
				}, function(err){ retval = err; });
			}
		} catch(e) {retval = e;};
		/*		
		setTimeout( function () {
			console.log(require.s.contexts._);
			if(params.contextId) console.log(require.s.contexts[params.contextId]);
		}, 10000);
		*/

		return retval;
	}
		
	return {
		checkUrl : checkUrl,
		open : open,
		close : close,
		onReady: ready
	}
}());
