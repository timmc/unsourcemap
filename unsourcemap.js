#!/usr/bin/env node

var fs = require('fs');
var ArgumentParser = require('argparse').ArgumentParser;
var sourceMap = require('source-map');

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

function sanitizeSourceName(url) {
  return url.replace(/[^a-zA-Z0-9\-_.]/g, '_');
}

for (var i = 0; i < map.sources.length; i++) {
  var sUrl = map.sources[i];
  console.log("Writing", sUrl);
  var dest = outDir + '/' + i + '-' + sanitizeSourceName(sUrl);
  var contents = map.sourceContentFor(sUrl);
  fs.writeFileSync(dest, contents, 'utf8', 0o644);
}
