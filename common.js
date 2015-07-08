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

    // generate sequence of integer numbers
    w.seq = function (n) {
        var arr = new Array(n);
        for (var i = 0; i < n; ++i) {
            arr[i] = i;
        }
        return arr;
    };

    w.seqInv = function(n) {
        var arr = new Array(n);
        for (var i = 0; i < n; ++i) {
            arr[i] = n - i - 1;
        }
        return arr;
    };

    w.rndInt = function(n) {
        return Math.floor( Math.random() * n );
    };

    w.rndColor = function() {
        return ['rgb(', w.rndInt(256), ',', w.rndInt(256), ',', w.rndInt(256), ')'].join('');
    };

    w.mapAdd = function(arr, diff) {
        return arr.map(function(num) {
            return num + diff;
        });
    };

    w.elInArr = function(el, arr) {
        return arr.indexOf(el) !== -1;
    };



    // music-related

    w.NOTES = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];

    var rotL = function(arr) {
        arr.push( arr.shift() );
    };

    w.NOTES_STARTING_IN_C = window.NOTES.slice();
    rotL(window.NOTES_STARTING_IN_C);
    rotL(window.NOTES_STARTING_IN_C);
    rotL(window.NOTES_STARTING_IN_C);



    w.GUITAR_NOTES = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];



    w.getNextNote = function(note) {
        var l = note.length;
        var octave = parseInt(note[l-1], 10);
        var n = note.substring(0, l-1);
        var i = w.NOTES_STARTING_IN_C.indexOf(n);
        var n2 = w.NOTES_STARTING_IN_C[i+1];
        if (!n2) {
            n2 = 'C';
            ++octave;
        }
        return n2 + octave;
    };

    w.getNoteDiff = function(note, delta) { // for simplicity accepts only positive deltas now
        if (delta < 0) { throw 'delta must be positive'; }
        while (delta !== 0) {
            note = w.getNextNote(note);
            --delta;
        }
        return note;
    };

})(this);
