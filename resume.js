var fs = require('fs');

var song = JSON.parse( fs.readFileSync('out.json').toString() );

/**
 * % object index
 * $ attributes hash
 * _ text
 */

var scorePartwise = song['score-partwise'];



// text
scorePartwise.credit.forEach(function(credit) {
	console.log('TEXT: ' + credit['credit-words']._);
});



// instruments
var sp = scorePartwise['part-list']['score-part'];
var parseSP = function(sp) {
	console.log('CHANNEL:')
	console.log('  name:    ' + sp['part-name']);
	var mi = sp['midi-instrument'];
	console.log('  channel: ' + mi['midi-channel']);
	console.log('  program: ' + mi['midi-program']);
	console.log('  volume:  ' + mi['volume']);
	console.log('  pan:     ' + mi['pan']);
};
parseSP(sp);



// measures w/ notes
var measures = scorePartwise['part'].measure;

measures.forEach(function(measure, mi) {

	var attrs = measure.attributes;
	console.log('MEASURE' + mi);
	if (attrs && 'time' in attrs) {
		console.log('  time: ' + attrs.time.beats + ' / ' + attrs.time['beat-type']);
	}

	measure.note.forEach(function(note, ni) {
		if (note.rest) {
			console.log(['  vc:', note.voice, ', dur:', note.duration, ' rest'].join(''));
		}
		else {
			console.log(['  vc:', note.voice, ', dur:', note.duration, ' ', note.type, ' ', note.pitch.step, note.pitch.octave].join(''));
		}
	});
});
