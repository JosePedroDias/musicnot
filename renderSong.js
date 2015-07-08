window.renderSong = function(o, chosenPartIdx) {
    'use strict';


    var chosenPart = o.parts[chosenPartIdx || 0];


    //console.log(o);

    /*console.log('\n\n');
    console.log(JSON.stringify(o));
    console.log('\n\n');*/



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
    console.log('notesInSong', notesInSong);
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

    var HAND_LEFT = 0;
    var HAND_RIGHT = 1;

    var COLOR_WHITE = '#FFFFFF';
    var COLOR_BLACK = '#000000';
    var COLOR_DARK_GRAY = '#333333';
    var COLOR_MEDIUM_GRAY = '#777777';
    var COLOR_LIGHT_GRAY = '#BBBBBB';
    var COLOR_STROKES = ['#d0e5ff', '#c9eda2'];
    var COLOR_TOUCHES = ['#8dc1ff', '#7ed321'];



    var s = Snap('svg');

    // hatching
    var genStripesPattern = function(S, color, width) {
        return s.path( ['M', 10*S, '-', 5*S, '-', 10*S, ',', 15*S, 'M', 15*S, ',', 0, ',', 0, ',', 15*S, 'M', 0, '-', 5*S, '-', 20*S, ',', 15*S].join('') ).attr({
            fill:        'none',
            stroke:      color,
            strokeWidth: width
        }).pattern(0, 0, 10*S, 10*S);
    };
    var hatch = genStripesPattern(1/16, COLOR_MEDIUM_GRAY, 2/16);



    var haveSustainedAfter = ['C', 'D', /**/ 'F', 'G', 'A'];



    var noteToXLookup = {};
    var bgGroup = s.group();
    songWhites.forEach(function(note, idx) {
        var h = 10;

        var x0 = idx * WHITE_GAP;
        var xc = x0 + WHITE_GAP / 2;
        var x1 = x0 + WHITE_GAP;

        var prevNote = bemolToSustained(note);
        var nextNote = flatToSustained(note);

        var r = s.rect(x0, 0, WHITE_GAP, h);
        r.attr('fill', COLOR_WHITE);

        var letter = note[0];

        var isC = (letter === 'C');

        var g = r;
        if (isC) {
            var r2 = s.rect(x0, 0, WHITE_GAP, h);
            r2.attr('fill', hatch);
            g = s.group(r, r2);
        }
        g.addClass('flat-note');
        g.addClass(note);
        bgGroup.add(g);

        if (haveSustainedAfter.indexOf(letter) !== -1) {
            var l = s.line(x1, 0, x1, h);
            l.attr('stroke', isC ? COLOR_MEDIUM_GRAY : COLOR_LIGHT_GRAY);
            l.attr('stroke-width', isC ? 0.5 : 0.33);
            l.addClass('sustained-note');
            l.addClass(nextNote);
            bgGroup.add(l);
        }

        //console.log(prevNote, note, nextNote);
        noteToXLookup[prevNote] = x0;
        noteToXLookup[note] = xc;
        noteToXLookup[nextNote] = x1;
    });
    //console.log(noteToXLookup)



    var drawStroke = function(note, y0, y1, hand) {
        var x = noteToXLookup[note];
        var l = s.line(x, y0, x, y1);
        l.attr('fill', 'none');
        l.attr('stroke', COLOR_STROKES[hand]);
        l.attr('stroke-width', WHITE_GAP*0.8);
        l.attr('stroke-linejoin', 'round');
        l.attr('stroke-linecap', 'round');
    };

    var drawBridge = function(note0, note1, y, hand) {
        var x0 = noteToXLookup[note0];
        var x1 = noteToXLookup[note1];
        var l = s.line(x0, y, x1, y);
        l.attr('fill', 'none');
        l.attr('stroke', COLOR_STROKES[hand]);
        l.attr('stroke-width', WHITE_GAP*0.45);
        l.attr('stroke-linejoin', 'round');
        l.attr('stroke-linecap', 'round');
    };

    var drawTouch = function(note, y, hand) {
        var x = noteToXLookup[note];
        var c = s.circle(x, y, WHITE_GAP*0.35);
        c.attr('fill', COLOR_TOUCHES[hand]);
    };



    var y = [1, 1];

    //var h = HAND_LEFT;
    //drawStroke('B3', 1, 5, h);
    //drawBridge('B3', 'G3', 1, h);
    //drawTouch('B3', 1, h);

    //0: R/2 G4/1 G4/1
    //1: R

    //console.log(chosenPart[0]);
    var scl = 0.25;
    chosenPart.forEach(function(m, mi) { // each measure
        m.voices.forEach(function(v, vi) { // each voice
            v.forEach(function(o) { // each voice item
                var yy = y[vi] + (o instanceof Array ? o[0].dur : o.dur) * scl;
                if (o instanceof Array) {
                    drawBridge(o[0].note, o[o.length-1].note, y[vi], vi);
                    o.forEach(function(O) {
                        drawStroke(O.note, y[vi], yy, vi);
                        drawTouch(O.note, y[vi], vi);
                    });
                }
                else if ('note' in o) {
                    drawStroke(o.note, y[vi], y[vi] + o.dur, vi);
                    drawTouch(o.note, y[vi], vi);
                }
                y[vi] = yy + WHITE_GAP;
            });
        });
        var newY = Math.max(y[0], y[1]);
        y[0] = newY;
        y[1] = newY;
    });

    s.node.setAttribute('viewBox', [0, 0, WHITE_GAP*songWhites.length, y[0] + WHITE_GAP/2].join(' '));
};
