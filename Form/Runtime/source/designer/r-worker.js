
importScripts('r.js');

self.onmessage = function (evt) {
    var out, buildText;

	var jsonData = JSON.parse( evt.data);
	
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
            self.postMessage(JSON.stringify({
                out: out,
                buildText: buildText
            }, null, '  '));
        });
    }
};
