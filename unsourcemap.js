#!/usr/bin/env node

var fs = require('fs');
var ArgumentParser = require('argparse').ArgumentParser;
var sourceMap = require('source-map');
var path = require('path');

var parser = new ArgumentParser({
  addHelp: true,
  description: 'Deobfuscate JavaScript code using a source map',
});

parser.addArgument(['src-js'], {help: 'Path to javascript file to recover', nargs: 1});
parser.addArgument(['src-map'], {help: 'Path to source-map to recover from', nargs: 1});
parser.addArgument(['out-dir'], {help: 'Path to directory where sources will be dumped', nargs: 1});
var args = parser.parseArgs();

var code = fs.readFileSync(args['src-js'][0], 'utf8');
var mapData = fs.readFileSync(args['src-map'][0], 'utf8');

var map = new sourceMap.SourceMapConsumer(mapData);

var outDir = args['out-dir'][0];
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, 0o755);
}

fs.isDir = function(dpath) {
	try {
		return fs.lstatSync(dpath).isDirectory();
	} catch(e) {
		return false;
	}
};

fs.mkdirp = function(dirname) {
	dirname = path.normalize(dirname).split(path.sep);
	dirname.forEach((sdir,index) => {
		var pathInQuestion = dirname.slice(0,index+1).join(path.sep);
		if((!fs.isDir(pathInQuestion)) && pathInQuestion) {
			fs.mkdirSync(pathInQuestion, 0o755);
		}
	});
};

fs.isParentOf = function(parent, fileName) {
	var a = path.normalize(parent);
	var b = path.normalize(fileName);
	var b_in_a = b.indexOf(a) === 0;
	if(b_in_a && b.charAt(a.length) === path.sep) {
		return true;
	}
	return false;
};

function removeParentDir(filePath) {
	var str = filePath;
	var result = filePath.replace(/\.\.\//g, "");
	var regExp = new RegExp(outDir, 'g');
	result = result.replace(regExp, outDir + '/outOfBaseDir');
	return result;
};

function assertFileDirExists(fileName) {
	if(fs.isParentOf(outDir, fileName)) {
		fs.mkdirp(path.dirname(fileName));
	}
	else {
		fileName = removeParentDir(fileName);
		fs.mkdirp(path.dirname(fileName));
	}
	return fileName;
}

for(var i = 0; i < map.sources.length; i++) {
  var sUrl = map.sources[i];
  console.log("Writing", sUrl);
  var dest = assertFileDirExists(outDir + '/' + sUrl);
  var contents = map.sourceContentFor(sUrl);
  fs.writeFileSync(dest, contents, 'utf8', 0o644);
}
