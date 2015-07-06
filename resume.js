var fs = require('fs');


var args = process.argv.slice();
var inFile = args.pop();
var outFile = inFile.replace('.json', '.song');



var pi = function(n) { return parseInt(n, 10); };
var pf = function(n) { return parseFloat(n); };



var song = JSON.parse( fs.readFileSync(inFile).toString() );

var doc = {metadata:{text:''}, instruments:[], measures:[]};

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
    //console.log('TEXT: ' + credit['credit-words']._);
    doc.metadata.text += (doc.metadata.text.length === 0 ? '' : '\n') + credit['credit-words']._;
});



// instruments
multi(scorePartwise['part-list']['score-part'], function(sp) {
	//console.log('CHANNEL:')
	//console.log('  name:    ' + sp['part-name']);
	var mi = sp['midi-instrument'];
	//console.log('  channel: ' + mi['midi-channel']);
	//console.log('  program: ' + mi['midi-program']);
	//console.log('  volume:  ' + mi['volume']);
	//console.log('  pan:     ' + mi['pan']);
    doc.instruments.push({
        name:    sp['part-name'],
        channel: pi(mi['midi-channel']),
        program: pi(mi['midi-program']),
        volume:  pf(mi['volume']),
        pan:     pf(mi['pan'])
    });
});



// measures w/ notes
var measures = scorePartwise['part'].measure;

measures.forEach(function(measure, mi) {
    var me = {};
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
            var acci = ''; // accidental
            if (note.pitch.alter) {
                acci = parseInt(note.pitch.alter, 10);
                if      (acci ===  1) { acci = '#'; }
                else if (acci ===  2) { acci = '##'; }
                else if (acci === -1) { acci = 'b'; }
                else if (acci === -2) { acci = 'bb'; }
            }

            /*var tie = ''; // TODO WHAT FOR?
            if (note.tie) {
                tie = note.tie['$'].type;
            }*/

            // voice irrelevant?

            var chord = false;
            if ('chord' in note) {
                chord = note.chord; // play at same time as prev note
            }

			console.log(['  vc:', note.voice, ', dur:', note.duration, /*' ', note.type,*/ ' ', note.pitch.step, acci, note.pitch.octave, ' ', (chord ? ' CHORD': '')].join(''));
		}
	});

    doc.measures.push(me);

    fs.writeFileSync(outFile, JSON.stringify(doc, null, '\t'));
});
