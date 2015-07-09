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
    //console.log('notesInSong', notesInSong);
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



    // fill noteToXLookup
    var noteToXLookup = {};
    songWhites.forEach(function(note, idx) {
        var x0 = idx * WHITE_GAP;
        var xc = x0 + WHITE_GAP / 2;
        var x1 = x0 + WHITE_GAP;

        var prevNote = bemolToSustained(note);
        var nextNote = flatToSustained(note);

        noteToXLookup[prevNote] = x0;
        noteToXLookup[note] = xc;
        noteToXLookup[nextNote] = x1;
    });
    //console.log(noteToXLookup)



    var drawStroke = function(note, y0, y1, hand) {
        var x = noteToXLookup[note];
        //if (!isFinite(x)) { throw 'drawStroke error: ' + note; }
        return s   .line(x, y0, x, y1)
                    .attr('fill', 'none')
                    .attr('stroke', COLOR_STROKES[hand])
                    .attr('stroke-width', WHITE_GAP*0.8)
                    .attr('stroke-linejoin', 'round')
                    .attr('stroke-linecap', 'round');
    };

    var drawBridge = function(note0, note1, y, hand) {
        var x0 = noteToXLookup[note0];
        //if (!isFinite(x0)) { throw 'drawBridge error: ' + note0; }
        var x1 = noteToXLookup[note1];
        //if (!isFinite(x1)) { throw 'drawBridge error: ' + note1; }
        return s   .line(x0, y, x1, y)
                    .attr('fill', 'none')
                    .attr('stroke', COLOR_STROKES[hand])
                    .attr('stroke-width', WHITE_GAP*0.45)
                    .attr('stroke-linejoin', 'round')
                    .attr('stroke-linecap', 'round');
    };

    var drawTouch = function(note, y, hand) {
        var x = noteToXLookup[note];
        //if (!isFinite(x)) { throw 'drawTouch error: ' + note; }
        return s   .circle(x, y, WHITE_GAP*0.35)
                    .attr('fill', COLOR_TOUCHES[hand]);
    };

    var drawMeasureLine = function(y) {
        y -= WHITE_GAP/2;
        return s   .line(0, y, WHITE_GAP*songWhites.length, y)
                    .attr('stroke', COLOR_DARK_GRAY)
                    .attr('stroke-width', 0.1);
    };



    var y = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]; // TODO: max num of voices should be detected apriori

    var bgGroup = s.group().addClass('bg');
    var fgGroup = s.group().addClass('fg');
    chosenPart.forEach(function(m) { // each measure
        m.voices.forEach(function(v, vi) { // each voice
            //if (vi > 1) { debugger; throw 'too many voices'; }
            if (vi > 1) { vi = 1; } // TODO CRITERIA FOR CHOOSING HANDS!
            v.forEach(function(o) { // each voice item
                var y0 = y[vi];
                var dy = ( (o instanceof Array ? o[0].dur : o.dur) - 1) * WHITE_GAP;
                var y1 = y0 + dy;
                if (!isFinite(y0)) { throw ''}
                //console.log(vi, o);
                if (o instanceof Array) {
                    fgGroup.add( drawBridge(o[0].note, o[o.length-1].note, y0, vi) );
                    o.forEach(function(O) {
                        //if (!('note' in O)) { debugger; }
                        fgGroup.add( drawStroke(O.note, y0, y1, vi) );
                        fgGroup.add( drawTouch(O.note, y0, vi) );
                    });
                }
                else if ('note' in o) {
                    fgGroup.add( drawStroke(o.note, y0, y1, vi) );
                    fgGroup.add( drawTouch(o.note, y0, vi) );
                }
                y[vi] += dy + WHITE_GAP;
            });
        });
        var newY = Math.max.apply(null, y);
        setAllElements(y, newY);
        fgGroup.add( drawMeasureLine(newY) );
    });

    var H = y[0];



    // draw bg
    songWhites.forEach(function(note, idx) {
        var x0 = idx * WHITE_GAP;
        var xc = x0 + WHITE_GAP / 2;
        var x1 = x0 + WHITE_GAP;

        var nextNote = flatToSustained(note);

        var r = s   .rect(x0, 0, WHITE_GAP, H)
            .attr('fill', COLOR_WHITE);

        var letter = note[0];

        var isC = (letter === 'C');

        var g = r;
        if (isC) {
            var r2 = s  .rect(x0, 0, WHITE_GAP, H)
                .attr('fill', hatch);
            var t = s   .text(xc, 0, note)
                .attr('text-anchor', 'middle')
                .attr('font-size', WHITE_GAP/2);
            g = s.group(r, r2, t);
        }
        g   .addClass('flat-note')
            .addClass(note);
        bgGroup.add(g);

        if (haveSustainedAfter.indexOf(letter) !== -1) {
            var l = s   .line(x1, 0, x1, H)
                .attr('stroke', isC ? COLOR_MEDIUM_GRAY : COLOR_LIGHT_GRAY)
                .attr('stroke-width', isC ? 0.5 : 0.33)
                .addClass('sustained-note')
                .addClass(nextNote);
            bgGroup.add(l);
        }
    });



    s.node.setAttribute('viewBox', [0, -WHITE_GAP/2, WHITE_GAP*songWhites.length, y[0] + WHITE_GAP/2].join(' '));
};
