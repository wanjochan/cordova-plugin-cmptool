//BeforePluginInstall_android.js
var fs=null;
function sync_copy(src,tgt){
	if(fs==null)return false;
	console.log('to copy '+src+' => '+tgt);
	return fs.writeFileSync(tgt, fs.readFileSync(src));
}

module.exports = function(ctx) {
	// make sure android platform is part of build
	//if (ctx.opts.platforms.indexOf('android') < 0) {
	//	return;
	//}

	fs = ctx.requireCordovaModule('fs');
	var path = ctx.requireCordovaModule('path');
	var Q=ctx.requireCordovaModule('q');

	var defer= Q.defer();

	var pluginRoot =ctx.opts.plugin.dir;
	var projectRoot=ctx.opts.projectRoot;
	var platformRoot = path.join(projectRoot, 'platforms/android');
	
	function copyFiles(srcPath, destPath) {
		console.log(" copyFiles() ",srcPath," => ",destPath);
		if (fs.statSync(srcPath).isDirectory()) {
			if (!fs.existsSync(destPath)) {
				fs.mkdirSync(destPath);
			}
			fs.readdirSync(srcPath).forEach(function (child) {
				copyFiles(path.join(srcPath, child), path.join(destPath, child));
			});
		} else {
			fs.writeFileSync(destPath, fs.readFileSync(srcPath));
		}
	}  
	
	/*
	return 
	Q("what").then //OK
	//Q.try//OK
	//Q.fcall//OK
	return Q.try
	Q().then
	 */
	//var rt=Q.try

	var exec = Q.nfbind(require('child_process').exec);//bind-node-to-Q
	var spawn = Q.nfbind(require('child_process').spawn);//bind-node-to-Q
	
	//return
	Q.try(function(){
		console.log(" ---- start plugin install ----");
		//console.log("ctx=",ctx);
	})
		.then(function(){
			return exec("cd "+pluginRoot +" && ls -al").then(function(stdout,stderr){
				if(stdout) console.log("stdout=",stdout.join("\n"));
				if(stderr) console.log("stderr=",stderr.join("\n"));
			});
		})
		.then(function(){
			console.log("try git update libs");
			//git -C lib/lib-ios-jso pull || git clone https://github.com/SZU-BDI/lib-ios-jso.git lib/lib-ios-jso"
			return exec("cd "+projectRoot
				+" && pwd && (git -C lib/app-hybrid-core pull || git clone https://github.com/SZU-BDI/app-hybrid-core.git --depth=1 --branch master --single-branch lib/app-hybrid-core) && ls -al")
				.then(function(stdout,stderr){
					if(stdout) console.log("stdout=",stdout.join("\n"));
					if(stderr) console.log("stderr=",stderr.join("\n"));
				});
		}).then(function(prev){
			console.log("sync files after git update ");
			return Q.try(function(){
				copyFiles(projectRoot+"/lib/app-hybrid-core/lib-android/szu.bdi.hybrid.core/src/main/java",platformRoot+"/src");
			});
		}).catch(function(ex){
			console.log("some error ",ex);
			defer.reject(ex);
			return defer.promise;
		}).finally(function(p1){
			if(p1){
				console.log("p1=",p1);
			}
			console.log("finally do sth...");
			return defer.promise;
		})/*.done(function(p1,p2,p3){
		if(p1 || p2 || p3) console.log("done ",p1,p2,p3);
		else console.log("done()");

		defer.resolve("install plugin finished");
	})*/
	;
	//console.log("rt",rt);

	return defer.promise;
	/*
	//console.log(" process.cwd() ", process.cwd());
	//console.log(" opts.plugin ", ctx.opts.plugin);
	return deferral.promise;

	var platformRoot = path.join(ctx.opts.projectRoot, 'platforms/android');
	//var pluginRoot =ctx.opts.plugin.dir;
	console.log("scriptLocation=",ctx.scriptLocation);
	var srcRoot = path.join(path.dirname(ctx.scriptLocation),
		'/../app-hybrid-core/lib-android/szu.bdi.hybrid.core/src');
	
	var tgtRoot = path.join(platformRoot, 'src');

	sync_copy(srcRoot +'src/main/java/szu/bdi/hybrid/core/JSO.java'
	,tgtRoot +'JSO.java');

	//var apkFileLocation = path.join(platformRoot, 'build/outputs/apk/android-debug.apk');

	//fs.stat(apkFileLocation, function(err,stats) {
	//	if (err) {
	//		deferral.reject('Operation failed');
	//	} else {
	//		console.log('Size of ' + apkFileLocation + ' is ' + stats.size +' bytes');
	//		deferral.resolve();
	//	}
	//});

	return deferral.promise;
	*/
};
/*
 *
    // Skip processing if being called from within Visual Studio or MSBuild
    if (!process.env["VisualStudioEdition"]) {
        fs = require('fs');
        path = require('path');

        context.opts.cordova.platforms.forEach(function(platform) {
            console.log("Processing res/native for " + platform);
            var resNative = path.join(process.cwd(), "res", "native", platform);
            if (fs.existsSync(resNative)) {
                copyFiles(resNative, path.join(process.cwd(), "platforms", platform));
            }
        });            
    } else {
        console.log("Build running inside of MSBuild or Visual Studio - skipping res/native hook given built in support.");
    }
    // Recusive copy function for res/native processing
    function copyFiles(srcPath, destPath) {
        if (fs.statSync(srcPath).isDirectory()) {
            if (!fs.existsSync(destPath)) {
                fs.mkdirSync(destPath);
            }
            fs.readdirSync(srcPath).forEach(function (child) {
                copyFiles(path.join(srcPath, child), path.join(destPath, child));
            });
        } else {
            fs.writeFileSync(destPath, fs.readFileSync(srcPath));
        }
    }  
*/
