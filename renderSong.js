window.renderSong = function(o, chosenPartIdx) {
    'use strict';



    var chosenPart = o.parts[chosenPartIdx || 0];



    console.log(o);



    // generate sequence of integer numbers
    var seq = function (n) {
        var arr = new Array(n);
        for (var i = 0; i < n; ++i) {
            arr[i] = i;
        }
        return arr;
    };



    // generate maximum possible scale
    var generateScale = function(minOctave, maxOctave) {
        var scale = [];
        seq(maxOctave - minOctave + 1).forEach(function(i) {
            var octave = i + minOctave;
            window.NOTES_STARTING_IN_C.forEach(function(note) {
                scale.push( note + octave );
            });
        });
        return scale;
    };
    var SCALES1TO8 = generateScale(1, 8);
    //console.log(scale);



    var bemolToSustained = function(note) { // bemol is assumed but may not be in string
        var parts = note.split('');
        var octave = parseInt(parts.pop(), 10);
        var letter = parts.shift();

        var letters = 'CDEFGAB';
        var l0 = letters[ letters.indexOf(letter) - 1 ];

        if (l0) {
            return [l0, '#', octave].join('');
        }
        return ['G#', octave-1].join('');
    };

    var flatToSustained = function(note) {
        return note[0] + '#' + note[1];
    };



    var getNoteOctave = function(note) {
        return parseInt(note[note.length - 1], 10);
    };



    var noteIndexLookup = {};
    var noteIndexInScale = function(note) {
        var n = noteIndexLookup[note];
        if (isFinite(n)) { return n; }

        n = SCALES1TO8.indexOf(note);
        if (n === -1) {
            var note2 = bemolToSustained(note);
            n = SCALES1TO8.indexOf(note2);
            if (n === -1) { throw 'oops!'; }
        }

        noteIndexLookup[note] = n;
        return n;
    };



    // determine part notes
    var findNotes = function(part) {
        var foundNotes = {};

        var visitNote = function(o) {
            foundNotes[o.note] = true;
        };

        part.forEach(function(measure) { // iterate measures
            measure.voices.forEach(function(voice) { // iterate voices
                voice.forEach(function (o) { // each item can be one note/rest or an array of chorus notes
                    if (o instanceof Array) {
                        o.forEach(visitNote);
                    }
                    else if ('note' in o) {
                        visitNote(o);
                    }
                });
            });
        });

        var notesInSong = Object.keys(foundNotes);

        notesInSong = notesInSong.map(function(note) { // sustaineds to bemols
            return ( (note.indexOf('b') === -1) ? note : bemolToSustained(note) );
        });
        notesInSong.sort(function(a, b) {
            a = noteIndexInScale(a);
            b = noteIndexInScale(b);
            return (a < b ? -1 : (a > b ? 1 : 0));
        });

        return notesInSong;
    };
    var notesInSong = findNotes(chosenPart);
    var minNote = notesInSong[0];
    var maxNote = notesInSong[notesInSong.length - 1];
    //console.log(minNote, maxNote);

    var minOctave = getNoteOctave(minNote);
    var maxOctave = getNoteOctave(maxNote);
    var songScale = generateScale(minOctave, maxOctave);
    //console.log(songScale);


    var songWhites = songScale.filter(function(note) { return note.indexOf('#') === -1; });
    //console.log(songWhites);



    var WHITE_GAP = 2;



    var s = Snap('svg');

    // hatching
    var genStripesPattern = function(S, color, width) {
        return s.path( ['M', 10*S, '-', 5*S, '-', 10*S, ',', 15*S, 'M', 15*S, ',', 0, ',', 0, ',', 15*S, 'M', 0, '-', 5*S, '-', 20*S, ',', 15*S].join('') ).attr({
            fill:        'none',
            stroke:      color,
            strokeWidth: width
        }).pattern(0, 0, 10*S, 10*S);
    };
    var p = genStripesPattern(1/16, '#000000', 2/16);



    var haveSustainedAfter = ['C', 'D', /**/ 'F', 'G', 'A'];



    var noteToXLookup = {};
    songWhites.forEach(function(note, idx) {
        var h = 10;

        var x0 = idx * WHITE_GAP;
        var xc = x0 + WHITE_GAP / 2;
        var x1 = x0 + WHITE_GAP;

        var prevNote = bemolToSustained(note);
        var nextNote = flatToSustained(note);

        var r = s.rect(x0, 0, WHITE_GAP, h);
        r.addClass(note);

        var letter = note[0];

        var isC = (letter === 'C');

        r.attr('fill', isC ? p : '#FFFFFF');

        if (haveSustainedAfter.indexOf(letter) !== -1) {
            var l = s.line(x1, 0, x1, h);
            l.attr('stroke', '#000000');
            l.attr('stroke-width', isC ? 0.5 : 0.25);
        }


        //console.log(prevNote, note, nextNote);
        noteToXLookup[prevNote] = x0;
        noteToXLookup[note] = xc;
        noteToXLookup[nextNote] = x1;
    });
    //console.log(noteToXLookup)

};
