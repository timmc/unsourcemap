UnSourceMap - Deobfuscate JavaScript code with source maps
==========================================================

`unsourcemap` will deobfuscate minified code using
[source maps](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/).
Source maps map compiled code back to the original code, including
mangled to original function and variable
names.

## Usage

This is still an **extremely rough cut**.

```
usage: unsourcemap.js <path-to-js> <path-to-source-map> <output-dir>
```
## Modifications

- Creates a folder structure for the output files
- Takes care of files that are out of the base folder
- Files out of the base folder are very roughly put in a folder called "outOfBaseDir" to prevent damage to existing files in the filesystem
