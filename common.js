(function(w) {
    'use strict';

    w.listToArr = function(lst) {
        var l = lst.length;
        var arr = new Array(l);
        for (var i = 0; i < l; ++i) {
            arr[i] = lst[i];
        }
        return arr;
    };

    w.valuesOf = function(o) {
        var arr = [];
        for (var k in o) {
            if (!o.hasOwnProperty(k)) { continue; }
            arr.push(o[k]);
        }
        return arr;
    };

    w.seq = function (n) {
        var arr = new Array(n);
        for (var i = 0; i < n; ++i) {
            arr[i] = i;
        }
        return arr;
    };

    w.arrayOf = function(n, v) {
        var arr = new Array(n);
        for (var i = 0; i < n; ++i) {
            arr[i] = (typeof v === 'function' ? v() : v);
        }
        return arr;
    };

    w.setAllElements = function(arr, v) {
        for (var i = 0, l = arr.length; i < l; ++i) {
            arr[i] = v;
        }
    };

    w.mapAdd = function(arr, diff) {
        return arr.map(function(num) {
            return num + diff;
        });
    };



    w.rndInt = function(n) {
        return Math.floor( Math.random() * n );
    };

    w.rndColor = function() {
        return ['rgb(', w.rndInt(256), ',', w.rndInt(256), ',', w.rndInt(256), ')'].join('');
    };



    w.elInArr = function(el, arr) {
        return arr.indexOf(el) !== -1;
    };



    w.ajax = function(o) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', o.uri, true);
        var cbInner = function() {
            if (xhr.readyState === 4 && xhr.status > 199 && xhr.status < 300) {
                return o.cb(null, xhr.responseXML);
            }
            o.cb('error requesting ' + o.uri);
        };
        xhr.onload  = cbInner;
        xhr.onerror = cbInner;
        xhr.send(null);
    };



    // feature detection
    w.hasTouch = function() { // from modernizr
        return (('ontouchstart' in w) || w.DocumentTouch && document instanceof DocumentTouch);
    };



    // music-related

    w.NOTES = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];

    var rotL = function(arr) {
        arr.push( arr.shift() );
    };

    w.NOTES_STARTING_IN_C = w.NOTES.slice();
    rotL(w.NOTES_STARTING_IN_C);
    rotL(w.NOTES_STARTING_IN_C);
    rotL(w.NOTES_STARTING_IN_C);



    w.GUITAR_NOTES = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];



    w.PREV_LETTER = {
        A: 'G',
        B: 'A',
        C: 'B',
        D: 'C',
        E: 'D',
        F: 'E',
        G: 'F'
    };

    w.NEXT_LETTER = {
        A: 'B',
        B: 'C',
        C: 'D',
        D: 'E',
        E: 'F',
        F: 'G',
        G: 'A'
    };



    w.HAS_SUSTAINED = {
        A: true,
        B: false,
        C: true,
        D: true,
        E: false,
        F: true,
        G: true
    };

    w.HAS_BEMOL = {
        A: true,
        B: true,
        C: false,
        D: true,
        E: true,
        F: false,
        G: true
    };



    w.getNoteOctave = function(note) {
        return parseInt(note[note.length - 1], 10);
    };

    w.generateScale = function(minOctave, maxOctave) {
        var scale = [];
        seq(maxOctave - minOctave + 1).forEach(function(i) {
            var octave = i + minOctave;
            w.NOTES_STARTING_IN_C.forEach(function(note) {
                scale.push( note + octave );
            });
        });
        return scale;
    };

    var noteRgx = /([A-G])([b#]{0,2})([0-9])/;
    w.decomposeNote = function(note) {
        var m = noteRgx.exec(note);
        var a = 0;
        m[2].split('').forEach(function(l) {
            if      (l === '#') { ++a; }
            else if (l === 'b') { --a; }
        });
        return {
            l: m[1],
            a: a,
            o: parseInt(m[3], 10)
        };
    };

    w.getNoteSynomym = function(note) {
        var o = (typeof note === 'object') ? note :  w.decomposeNote(note);

        if (Math.abs(o.a) > 1) {
            throw 'notes with more than 1 accident not yet supported!';
        }

        if (o.a === -1) {
            o.l = w.PREV_LETTER[o.l];
            o.a = (w.HAS_SUSTAINED[o.l] ? 1 : 0);
            if (o.l === 'B') { --o.o; }
        }

        if (o.a === 1) {
            if (w.HAS_SUSTAINED[o.l]) {
                return [o.l, '#', o.o].join('');
            }
            else {
                o.l = w.NEXT_LETTER[o.l];
                if (o.l === 'C') { ++o.o; }
                return [o.l, o.o].join('');
            }
        }

        if (o.a !== 0 ) { throw 'error!'; }

        return [o.l, o.o].join('');
    };

    w.getNextNote = function(note) {
        var o = w.decomposeNote(note);
        ++o.a;
        return w.getNoteSynomym(o);
    };

    w.getPrevNote = function(note) {
        var o = w.decomposeNote(note);
        --o.a;
        return w.getNoteSynomym(o);
    };

    /*w.shiftNote = function(note, delta) {
        var fn = (delta < 0) ? w.getPrevNote : w.getNextNote;
        var incr = (delta < 0) ? -1 : 1;
        while (delta !== 0) {
            note = fn(note);
            delta += incr;
        }
        return note;
    };*/

    w.shiftNote = function(note, delta, scale) {
        return scale[ scale.indexOf(note) + delta];
    };

})( (typeof module !== 'undefined' && module.exports) ? global : this ); // to set global stuff on node and browser
