window.renderSong = function(o, chosenPartIdx, disregardDurations) {
    'use strict';


    var chosenPart = o.parts[chosenPartIdx || 0];

    //console.log(o);

    /*console.log('\n\n');
    console.log(JSON.stringify(o));
    console.log('\n\n');*/



    // generate maximum possible scale

    var SCALES1TO8 = generateScale(1, 8);
    //console.log(scale);



    var noteIndexLookup = {};
    var noteIndexInScale = function(note) {
        var n = noteIndexLookup[note];
        if (isFinite(n)) { return n; }

        n = SCALES1TO8.indexOf(note);
        if (n === -1) {
            var note2 = getNoteSynomym(note);
            n = SCALES1TO8.indexOf(note2);
            if (n === -1) { throw 'oops!'; }
        }

        noteIndexLookup[note] = n;
        return n;
    };



    // determine part notes
    var findNotes = function(part) {
        var foundNotes = {};
        var maxNrVoices = 0;

        var visitNote = function(o) {
            foundNotes[o.note] = true;
        };

        part.forEach(function(measure) { // iterate measures
            measure.voices.forEach(function(voice) { // iterate voices
                maxNrVoices = Math.max(maxNrVoices, voice.length); // update max nr of voices
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
            return ( (note.indexOf('b') === -1) ? note : getNoteSynomym(note) );
        });
        notesInSong.sort(function(a, b) {
            a = noteIndexInScale(a);
            b = noteIndexInScale(b);
            return (a < b ? -1 : (a > b ? 1 : 0));
        });

        return {notesInSong:notesInSong, maxNrVoices:maxNrVoices};
    };


    var tmp = findNotes(chosenPart);
    var notesInSong = tmp.notesInSong;
    var maxNrVoices = tmp.maxNrVoices;

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



    // fill noteToXLookup
    var noteToXLookup = {};
    songWhites.forEach(function(note, idx) {
        var xc = (idx + 0.5) * WHITE_GAP;
        var nextNote = getNextNote(note);
        noteToXLookup[note] = xc;
        noteToXLookup[nextNote] = xc + (HAS_SUSTAINED[nextNote] ? 1 : 0.5) * WHITE_GAP;
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



    var LOG = false;
    var _log = [];
    var log = function(s) { _log.push(s); };
    //var log = function(s) { console.log(s); };



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



    var hasNote = function(o) {
        return ('note' in o);
    };

    var measureHasNotes = function(m) {
        return m.voices.some(function(v) { // each voice
            return v.some(function(o) { // each voice item
                if (o instanceof Array) { // chord
                    if (o.some(hasNote)) {
                        return true;
                    }
                }
                else if (hasNote(o)) {
                    return true;
                }
            });
        });
    };



    var simplifyMeasure = function(m) {
        var M = [];
        m.voices.forEach(function(v, vi) { // each voice
            var bag = [];
            v.forEach(function(o, oi) { // each voice item
                var isChord = o instanceof Array;
                var dur = (isChord ? o[0].dur : o.dur);
                var info = undefined;
                if (isChord) {
                    info = o.map(function(el) { return el.note; });
                }
                else if ('note' in o) {
                    info = o.note;
                }
                bag = pushArr(bag, arrayOf(dur, [info, oi]) );
            });
            M.push(bag);
        });

        // ditch repeated lines, discarding ois
        var nrVoices = m.voices.length;
        var MM = [];

        // determines max nr of els in voice
        var l = 0;
        M.forEach(function(arr) {
            var ll = arr.length;
            if (ll > l) { l = ll; }
        });

        var i, row, line, prevLine = '';
        for (i = 0; i < l; ++i) {
            row = seq(nrVoices).map(function(vi) {
                return M[vi][i];
            });
            line = JSON.stringify(row);

            //var keep = (line !== prevLine);
            var keep = (line !== '' && line !== prevLine);

            //console.log(i, line, keep);
            //if (keep) { console.log(line); }

            if (keep) {
                MM.push( row.map(function(pair) { return (pair ? pair[0] : undefined); }) );
            }
            prevLine = line;
        }

        // expand original structure for filtered lines, setting dur=1
        var MMM = arrayOf(nrVoices, function() { return []; });

        MM.forEach(function(row) {
            row.forEach(function(o, vi) {
                var O;
                if (o instanceof Array) {
                    O = o.map(function(note) {
                        return {note:note, dur:1};
                    });
                }
                else if (o === undefined) {
                    O = {dur:1};
                }
                else {
                    O = {note:o, dur:1};
                }
                MMM[vi].push(O);
            });
        });

        return {voices:MMM};
    };



    var chosenPart2 = [];
    chosenPart.forEach(function(m) {
        if (!measureHasNotes(m)) { return; }

        //if (false) { // TODO
        if (!disregardDurations) {
            chosenPart2.push( m );
            return;
        }

        var m2 = simplifyMeasure(m);
        chosenPart2.push(m2);
    });
    chosenPart = chosenPart2;



    var y = arrayOf(maxNrVoices, WHITE_GAP/2);

    var bgGroup = s.group().addClass('bg');
    var fgGroup = s.group().addClass('fg');
    chosenPart.forEach(function(m, mi) { // each measure
        if (LOG) { log('\nm #' + mi); }
        m.voices.forEach(function(v, vi) { // each voice
            if (LOG) { log('\nv #' + vi + '\n'); }

            var vii = Math.max(vi, 1); // TODO CRITERIA FOR CHOOSING HANDS!

            v.forEach(function(o) { // each voice item
                var y0 = y[vi];
                //if (!isFinite(y0)) { throw ''; }

                var isChord = (o instanceof Array);
                var dy = ( (isChord ? o[0].dur : o.dur) - 1) * WHITE_GAP;
                var y1 = y0 + dy;

                if (isChord) {
                    fgGroup.add( drawBridge(o[0].note, o[o.length-1].note, y0, vii) );
                    if (LOG) { log('['); }
                    o.forEach(function(O) {
                        fgGroup.add( drawStroke(O.note, y0, y1, vii) );
                        fgGroup.add( drawTouch(O.note, y0, vii) );
                        if (LOG) { log(O.note + ' ' + O.dur); }
                    });
                    if (LOG) { log(']' + o[0].dur); }
                }
                else if ('note' in o) { // note
                    fgGroup.add( drawStroke(o.note, y0, y1, vii) );
                    fgGroup.add( drawTouch(o.note, y0, vii) );
                    if (LOG) { log(o.note + ' ' + o.dur); }
                }
                else { // rest
                    if (LOG) { log('z ' + o.dur); }
                }

                y[vi] += dy + WHITE_GAP;
            });
        });
        var newY = Math.max.apply(null, y);
        setAllElements(y, newY);
        fgGroup.add( drawMeasureLine(newY) );
    });

    if (LOG) {
        console.log( _log.join(' ') );
    }

    var H = y[0] - WHITE_GAP/2;



    // draw bg
    songWhites.forEach(function(note, idx) {
        var x0 = idx * WHITE_GAP;
        var xc = x0 + WHITE_GAP / 2;
        var x1 = x0 + WHITE_GAP;

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
                .attr('font-size',   WHITE_GAP/2)
                .attr('font-family', 'sans-serif');
            g = s.group(r, r2, t);
        }
        g   .addClass('flat-note')
            .addClass(note);
        bgGroup.add(g);

        if (HAS_SUSTAINED[letter]) {
            var l = s   .line(x1, 0, x1, H)
                .attr('stroke', isC ? COLOR_MEDIUM_GRAY : COLOR_LIGHT_GRAY)
                .attr('stroke-width', isC ? 0.5 : 0.33)
                .addClass('sustained-note')
                .addClass( getNextNote(note) );
            bgGroup.add(l);
        }
    });



    s.node.setAttribute('viewBox', [0, -WHITE_GAP/2, WHITE_GAP*songWhites.length, y[0] + WHITE_GAP/2].join(' '));
};
