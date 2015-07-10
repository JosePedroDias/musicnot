(function() {
    'use strict';


    // constants
    var COLOR_BLACK = '#000000';
    var COLOR_DARK_GRAY = '#333333';
    var COLOR_LIGHT_GRAY = '#BBBBBB';
    var COLOR_BROWN = '#9a745d';

    var FRET_W   = 12;
    var STRING_H =  4;
    var NUM_STRINGS = 6;
    var NUM_FRETS = 15;
    var W = NUM_FRETS * FRET_W;
    var H = NUM_STRINGS * STRING_H;
    var MARK_R   = FRET_W * 0.1;
    var FINGER_R = FRET_W * 0.15;

    var hasMark = [3, 5, 7, 9, 15, 17, 19];
    var hasDoubleMark = [12];

    var HAS_TOUCH = hasTouch();

    var STRING_PLAYBACK_DURATION = 4000;



    // variables
    var chord = seq(NUM_STRINGS).map(function() { return 0; });

    // http://songsonguitar.com/wp-content/uploads/2013/12/full-standard-chord-chart.jpg
    //chord = [0, 0, 2, 2, 2, 0]; // A

    var fretNotes = seq(NUM_STRINGS).map(function() { return []; });



    // svg-related
    var s = Snap('svg');
    var chordG;



    var drawFretboard = function() {
        s   .rect(FRET_W, 0, W-FRET_W, H)
            .addClass('fretboard')
            .attr('fill', COLOR_BROWN);
    };

    var drawFrets = function() {
        var g = s   .group()
                    .addClass('frets');
        seq(NUM_FRETS).forEach(function(fretIdx) {
            if (fretIdx === 0) { return; }
            var x = FRET_W * fretIdx;
            s   .line(x, 0, x, H)
                .attr('stroke', COLOR_BLACK)
                .addClass('fret')
                .attr('stroke-width', fretIdx === 1 ? 2 : 1)
                .appendTo(g);
        });
    };

    var drawMarks = function() {
        var cy = STRING_H * NUM_STRINGS * 0.5;
        var dy = cy * 0.5;
        var g = s   .group()
                    .addClass('marks');
        seq(NUM_FRETS).forEach(function(fretIdx) {
            var x = FRET_W * (fretIdx + 0.5);

            if (elInArr(fretIdx, hasMark)) {
                s.circle(x, cy, MARK_R)
                    .addClass('mark')
                    .attr('fill', COLOR_LIGHT_GRAY)
                    .appendTo(g);
            }
            else if (elInArr(fretIdx, hasDoubleMark)) {
                s.g(
                    s.circle(x, cy-dy, MARK_R),
                    s.circle(x, cy+dy, MARK_R)
                )
                    .addClass('mark')
                    .attr('fill', COLOR_LIGHT_GRAY)
                    .appendTo(g);
            }
        });
    };

    var drawStrings = function() {
        var g = s   .group()
                    .addClass('strings');
        seq(NUM_STRINGS).forEach(function(stringIdx) {
            var y = STRING_H * (stringIdx + 0.5);
            s   .line(FRET_W, y, W, y)
                .attr('stroke', COLOR_DARK_GRAY)
                .addClass('string')
                .attr('stroke-width', (stringIdx + 1.5) * 0.1)
                .appendTo(g);
        });
    };

    var SCALES3TO6 = generateScale(3, 6);

    var drawPlayables = function() {
        var g = s   .group()
                    .addClass('playables');
        var h = STRING_H / 2;
        var h2 = h/2;
        seq(NUM_FRETS).forEach(function(fretIdx) {
            var x = FRET_W * fretIdx;
            seq(NUM_STRINGS).forEach(function(stringIdx) {
            var stringIdx2 = NUM_STRINGS - stringIdx - 1;
                /*var y = STRING_H * stringIdx; // MODE FULL RECT
                s   .rect(x, y, FRET_W, STRING_H)*/

                var note = shiftNote(GUITAR_NOTES[stringIdx2], fretIdx, SCALES3TO6);

                fretNotes[stringIdx2].push(note);

                var y = STRING_H * (stringIdx + 0.5); // MODE HALF HEIGHT
                s   .rect(x, y-h2, FRET_W, h)

                    .addClass('playable')
                    .attr('opacity', 0.001)
                    //.attr('fill', 'red') // DEBUG
                    .attr('data-fret', fretIdx)
                    .attr('data-string', stringIdx2)
                    .attr('data-note', note)
                    .appendTo(g);
            });
        });
    };

    var updateChord = function(chord) {
        seq(NUM_STRINGS).forEach(function(stringIdx) {
            var stringIdx2 = NUM_STRINGS - stringIdx - 1;
            var v = chord[stringIdx];
            var c = s.select('.chord-' + stringIdx);

            if (!c && v === 0) { return; } // doesn't exist and 0, skip

            var fretIdx = 0;
            if (c) {
                parseInt(c.attr('data-fret'), 10);
            }

            if (c && v && v === fretIdx) { return; } // exists and has no changes, skip

            var x = FRET_W * (v + 0.75);
            var y = STRING_H * (stringIdx2 + 0.5);

            if (!c) { // create
                c = s   .circle(x, y, FINGER_R)
                    .attr('fill', '#770000')
                    .addClass('chord-' + stringIdx)
                    .appendTo(chordG);
            }
            else if (v === 0) { // remove
                c.remove();
            }
            else { // update
                c.attr('cx', x);
            }
        });
    };

    var drawToggleChordMode = function() {
        var x = FRET_W;
        var y = -10;
        var L = 5;
        var r = s   .rect(x, y, L, L)
                    .attr('fill', '#994444')
                    .attr({rx:L/4, ry:L/4});
        var t = s   .text(x+L*1.25, y+L-L/6, 'finger')
                    .attr('font-size', L);
        s.group(r, t).addClass('toggle-chord-mode');

        var onToggle = function() {
            modeEditChord = !modeEditChord;
            r.attr('fill', modeEditChord ? '#449944' : '#994444');
            t.attr('text', modeEditChord ? 'chord' : 'finger');

            if (!modeEditChord) {
                seq(NUM_STRINGS).forEach(function(i) { chord[i] = 0; });
                updateChord(chord);
            }
        };
        r.node.addEventListener(HAS_TOUCH ? 'touchstart' : 'mousedown', onToggle);
    };



    // draw the stuff in relevant order
    drawFretboard();
    drawFrets();
    drawMarks();
    drawStrings();
    drawPlayables();
    drawToggleChordMode();

    chordG = s.group().addClass('chord');
    updateChord(chord);



    var ongoingStrings = new Array(NUM_STRINGS);



    var playString = function(stringIdx, fretIdx, note) {
        var pair = ongoingStrings[stringIdx];  // [cb, timer]
        if (pair) {
            //console.log('replacing string oscillator #%s', string);
            clearTimeout(pair[1]);
            pair[0]();
        }
        /*else {
         console.log('not playing before');
         }*/

        var freq = computeFreq(note);

        var cb = genString(freq);

        var timer = setTimeout(
            function() {
                var s = this.string;
                ongoingStrings[s][0]();
                ongoingStrings[s] = undefined;
                //console.log('killed oscillator #%s', s);
            }.bind({string:stringIdx}), STRING_PLAYBACK_DURATION
        );

        ongoingStrings[stringIdx] = [cb, timer];
    };



    // respond to click/touch
    var isDown = false;
    var modeEditChord = false;

    var onDown = function(ev) {
        isDown = true;

        if (modeEditChord) {
            var el = ev.target;
            if (el.getAttribute('class') !== 'playable') { return; }

            var string = parseInt(el.dataset.string, 10);
            var fret   = parseInt(el.dataset.fret,   10);
            chord[string] = fret;
            updateChord(chord);
        }
        else {
            onMove(ev)
        }
    };

    var onUp   = function() {
        isDown = false;
    };

    var onMove = function(ev) {
        if (!isDown) { return; }

        var el = ev.target;
        if (el.getAttribute('class') !== 'playable') { return; }

        var string = parseInt(el.dataset.string, 10);
        var fret, note;

        if (modeEditChord) {
            fret = chord[string];
            note = fretNotes[string][fret];
        }
        else {
            fret = parseInt(el.dataset.fret, 10);
            note = el.dataset.note;
        }

        playString(string, fret, note);
    };
    var ctn = s.node;

    ctn.addEventListener( HAS_TOUCH ? 'touchstart' : 'mousedown' , onDown);
    ctn.addEventListener( HAS_TOUCH ? 'touchmove'  : 'mousemove' , onMove);
    ctn.addEventListener( HAS_TOUCH ? 'touchend'   : 'mouseup'   ,   onUp);



    s.node.setAttribute('viewBox', [0, 0, W, H].join(' '));

})();
