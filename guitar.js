(function() {
    'use strict';

    var hasMark = [3, 5, 7, 9, 15, 17, 19]; hasMark       = mapAdd(hasMark,       -1);
    var hasDoubleMark = [12];               hasDoubleMark = mapAdd(hasDoubleMark, -1);

    var s = Snap('svg');

    var COLOR_BLACK = '#000000';
    var COLOR_DARK_GRAY = '#333333';
    var COLOR_MEDIUM_GRAY = '#777777';
    var COLOR_LIGHT_GRAY = '#BBBBBB';
    var COLOR_WHITE = '#FFFFFF';
    var COLOR_BROWN = '#9a745d';

    var FRET_W   = 12;
    var STRING_H =  4;
    var NUM_STRINGS = 6;
    var NUM_FRETS = 15;
    var W = NUM_FRETS * FRET_W;
    var H = NUM_STRINGS * STRING_H;
    var MARK_R = FRET_W * 0.1;


    var drawFretboard = function() {
        s   .rect(0, 0, W, H)
            .addClass('fretboard')
            .attr('fill', COLOR_BROWN);
    };



    var drawFrets = function() {
        var g = s   .group()
                    .addClass('frets');
        seq(NUM_FRETS).forEach(function(fretIdx) {
            var x = FRET_W * fretIdx;
            s   .line(x, 0, x, H)
                .attr('stroke', COLOR_BLACK)
                .addClass('fret')
                .attr('stroke-width', fretIdx === 0 ? 2 : 1)
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
            s   .line(0, y, W, y)
                .attr('stroke', COLOR_DARK_GRAY)
                .addClass('string')
                .attr('stroke-width', (stringIdx + 1.5) * 0.1)
                .appendTo(g);
        });
    };



    var drawPlayables = function() {
        var g = s   .group()
                    .addClass('playables');
        seq(NUM_STRINGS).forEach(function(stringIdx) {
            var stringIdx2 = NUM_STRINGS - stringIdx - 1;
            seq(NUM_FRETS).forEach(function(fretIdx) {
                var x = FRET_W   * fretIdx;
                var y = STRING_H * stringIdx;
                s   .rect(x, y, FRET_W, STRING_H)
                    .addClass('playable')
                    .attr('opacity', 0.001)
                    .attr('data-fret', fretIdx)
                    .attr('data-string', stringIdx2)
                    .attr('data-note', getNoteDiff(GUITAR_NOTES[stringIdx2], fretIdx))
                    .appendTo(g);
            });
        });
    };



    // draw the stuff in relevant order
    drawFretboard();
    drawFrets();
    drawMarks();
    drawStrings();
    drawPlayables();



    // respond to click/touch
    var ongoingStrings = new Array(NUM_STRINGS);
    var onClickPlayable = function(ev) {
        var el = ev.target;
        var note = el.dataset.note;
        var string = parseInt(el.dataset.string, 10);
        //console.log(string, note);

        var pair = ongoingStrings[string];  // [cb, timer]
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
                ongoingStrings[this.string][0]();
                ongoingStrings[this.string] = undefined;
                //console.log('killed oscillator #%s', this.string);
            }.bind({string:string}), 4000
        );

        ongoingStrings[string] = [cb, timer];
    };
    s.select('.playables').node.addEventListener('mousedown', onClickPlayable);



    s.node.setAttribute('viewBox', [0, 0, W, H].join(' '));

})();
