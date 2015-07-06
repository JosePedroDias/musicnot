var fs = require('fs');


var args = process.argv.slice();
var inFile = args.pop();
var outFile = inFile.replace('.json', '.song');



var pi = function(n) { var v = parseInt(n, 10); return isNaN(v) ? undefined : v; };
var pf = function(n) { var v = parseFloat(n);   return isNaN(v) ? undefined : v; };



var song = JSON.parse( fs.readFileSync(inFile).toString() );

var doc = {metadata:{text:''}, partList:[], parts:[]};

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
    doc.partList.push({
        name:    sp['part-name'],
        channel: pi(mi['midi-channel']),
        program: pi(mi['midi-program']),
        volume:  pf(mi['volume']),
        pan:     pf(mi['pan'])
    });
});



multi(scorePartwise.part, function(part, pii) {
    console.log('PART #' + pii);

    var pa = [];

    multi(part.measure, function(measure, mi) {
        console.log('MEASURE #' + mi);

        var me = {voices:{}};
        var attrs = measure.attributes;

        if (attrs && 'time' in attrs) {
            //console.log('  time: ' + attrs.time.beats + ' / ' + attrs.time['beat-type']);
            me.time = [ pi(attrs.time.beats), pi(attrs.time['beat-type']) ];
        }

        try {
            //console.log('  tempo: ' + measure.direction.sound['$'].tempo);
            me.tempo = pi(measure.direction.sound['$'].tempo);
        } catch(ex) {}

        multi(measure.note, function(note, ni) {
            var o;
            var chord = false;

            if (note.rest) {
                //console.log(['  vc:', note.voice, ', dur:', note.duration, ' rest'].join(''));
                o = {
                    dur:  pi(note.duration),
                    type: note.type,
                    rest: true // could be ommitted
                };
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


                if ('chord' in note) {
                    chord = note.chord; // play at same time as prev note
                }

                //console.log(['  vc:', note.voice, ', dur:', note.duration, ' ', note.type, ' ', note.pitch.step, acci, note.pitch.octave, ' ', (chord ? ' CHORD': '')].join(''));
                o = {
                    dur:  pi(note.duration),
                    type: note.type,
                    note: note.pitch.step+acci+note.pitch.octave
                };
            }

            var bag = me.voices[note.voice];
            if (!bag) {
                bag = [];
                me.voices[note.voice] = bag;
            }

            if ('chord' in note && note.chord) {
                var subBag = bag[bag.length-1];
                if (subBag instanceof Array) {
                    subBag.push(o);
                }
                else {
                    bag[bag.length-1] = [bag[bag.length-1], o];
                }
            }
            else {
                bag.push(o);
            }
        });

        pa.push(me);
    });

    doc.parts.push(pa);
});



fs.writeFileSync(outFile, JSON.stringify(doc, null, '\t'));
//fs.writeFileSync(outFile, JSON.stringify(doc));
