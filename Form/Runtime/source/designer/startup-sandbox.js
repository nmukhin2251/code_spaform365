var _require = requirejs.config(top.SPAFORM['_'].requireConfig);

requirejs.onError = function(err) {
	console.log('startupsandbox - requirejs error: '+err);
}

_require(["form-loader-sandbox"], function(loader) {
//	console.log("offset: +" + (Date.now() - top.startTime) +" - startupsandbox.js: " + "loaded Runtime/source/form-loader-sandbox.js");
	
	if(loader) loader(); // will start listener & send message "sandboxLoaded" to form-loader2
});
