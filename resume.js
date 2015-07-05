var fs = require('fs');

var song = JSON.parse( fs.readFileSync('out.json').toString() );

var measures = song['score-partwise']['part'].measure;

measures.forEach(function(measure, mi) {
	var attrs = measure.attributes;
	console.log('measure', mi);
	if (attrs && 'time' in attrs) {
		console.log(attrs.time.beats, attrs.time['beat-type']);
	}
	measure.note.forEach(function(note, ni) {
		if (note.rest) {
			console.log(ni, note.voice, note['%'], note.duration, 'rest');
		}
		else {
			console.log(ni, note.voice, note['%'], note.duration, note.type, note.pitch.step, note.pitch.octave);
		}
	});
});
