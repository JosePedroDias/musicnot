var fs = require('fs');


var args = process.argv.slice();
var inFile = args.pop();
//var outFile = inFile.replace('.json', '.song');



var song = JSON.parse( fs.readFileSync(inFile).toString() );

/**
 * % object index
 * $ attributes hash
 * _ text
 */

var scorePartwise = song['score-partwise'];


var multi = function(els, cb) {
    if (els === undefined) { return; }
    else if (!(els instanceof Array)) { els = [els]; }
    els.forEach(cb);
};


// text
multi(scorePartwise.credit, function(credit) {
    console.log('TEXT: ' + credit['credit-words']._);
});



// instruments
multi(scorePartwise['part-list']['score-part'], function(sp) {
	console.log('CHANNEL:')
	console.log('  name:    ' + sp['part-name']);
	var mi = sp['midi-instrument'];
	console.log('  channel: ' + mi['midi-channel']);
	console.log('  program: ' + mi['midi-program']);
	console.log('  volume:  ' + mi['volume']);
	console.log('  pan:     ' + mi['pan']);
});



// measures w/ notes
var measures = scorePartwise['part'].measure;

measures.forEach(function(measure, mi) {
	var attrs = measure.attributes;
	console.log('MEASURE #' + mi);

	if (attrs && 'time' in attrs) {
		console.log('  time: ' + attrs.time.beats + ' / ' + attrs.time['beat-type']);
	}

    try {
        console.log('  tempo: ' + measure.direction.sound['$'].tempo);
    } catch(ex) {}

	measure.note.forEach(function(note, ni) {
		if (note.rest) {
			console.log(['  vc:', note.voice, ', dur:', note.duration, ' rest'].join(''));
		}
		else {
            var alter = '';
            if (note.pitch.alter) {
                alter = parseInt(note.pitch.alter, 10);
                if      (alter ===  1) { alter = 's'; }
                else if (alter ===  2) { alter = 'ss'; }
                else if (alter === -1) { alter = 'b'; }
                else if (alter === -2) { alter = 'bb'; }
            }

            var tie = ''; // TODO WHAT FOR?
            if (note.tie) {
                tie = note.tie['$'].type;
            }

            var chord = false;
            if ('chord' in note) {
                chord = note.chord; // play at same time as prev note
            }

			console.log(['  vc:', note.voice, ', dur:', note.duration, ' ', note.type, ' ', note.pitch.step, note.pitch.octave, alter, ' ', tie, (chord ? ' CHORD': '')].join(''));
		}
	});
});
