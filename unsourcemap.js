#!/usr/bin/env node

var fs = require('fs');
var ArgumentParser = require('argparse').ArgumentParser;
var sourceMap = require('source-map');
var path = require("path");

class StructureError extends Error{
    constructor(...args){
        super(...args);
    	this.name = "StructureError";
        Error.captureStackTrace(this, StructureError);
    }
}

var parser = new ArgumentParser({
    addHelp: true,
    description: 'Deobfuscate JavaScript code using a source map',
});

parser.addArgument(['-j', '--js'], {help: 'Path to javascript file to recover', nargs: 1});
parser.addArgument(['-m', '--map'], {help: 'Path to map file to recover (optional)', nargs: 1, required: false});
parser.addArgument(['-o', '--out'], {help: 'Path to directory where sources will be dumped', nargs: 1});
var args = parser.parseArgs();

var code = fs.readFileSync(args['js'][0], 'utf8').toString();

if(!args.map){
    var sourceMapRE = /^\/\/[@#] sourceMappingURL=(.*)$/m;
    var mapName = sourceMapRE.exec(code);
    if(mapName===null){
    	throw new StructureError("No sourceMappingURL comment found!");
    	process.exit(-1);
    } else{
    	mapName = mapName[1];
    }
    var mapPath = path.resolve(args['js'][0].split("/").slice(0,-1).join("/"), mapName);
}

var mapData = fs.readFileSync(!args.map?mapPath:args.map, 'utf8').toString();
var map = new sourceMap.SourceMapConsumer(mapData);

var outDir = args['out'][0];
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, 0o755);
}

function sanit(url) {
    return url.replace(/^(\.\.\/|webpack:\/\/\/)/g, '').replace(/\s/, "_");
}

for (var i = 0; i < map.sources.length; i++) {
    var sUrl = map.sources[i];
    var url = sanit(sUrl);
    var dir=url.split("/").slice(0,-1).join("/");
    
    console.log(`Writing ${outDir}/${url}`);
    
    if(!fs.existsSync(path.resolve(outDir, dir))){
    	fs.mkdirSync(path.resolve(outDir, dir), { recursive: true })
    }
    
    var dest = path.resolve(outDir, url.split("?")[0]);
    var contents = map.sourceContentFor(sUrl);
    
    fs.writeFileSync(dest, contents, 'utf8', 0o644);
}
