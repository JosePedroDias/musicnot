var fs = require('fs');

var mj = require('musicjson');

var args = process.argv.slice();
var inFile = args.pop();
var outFile = inFile.replace('.xml', '.json');

var inString = fs.readFileSync(inFile).toString();

mj.musicJSON(inString, function(err, o) {
	if (err) { throw err; }

	//console.log(o);
	fs.writeFileSync(outFile, JSON.stringify(o, null, '\t'));
});
