var fs = require('fs');

var mj = require('musicjson');

var inFile = 'Let_It_Be.xml';

var inString = fs.readFileSync(inFile).toString();

mj.musicJSON(inString, function(err, o) {
	if (err) { throw err; }

	console.log(o);
	fs.writeFileSync('out.json', JSON.stringify(o, null, '\t'));
});
