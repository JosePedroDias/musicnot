(function() {
    'use strict';


    window.AudioContext = window.AudioContext || window.webkitAudioContext;



    var notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
    var noteToFreq = {};

    // based on https://gist.github.com/nerdsRob/5579875
    var computeFreq = function (note) {
        var f = noteToFreq[note];
        if (f) { return f; }

        var octave, keyNumber;

        if (note.length === 3) {
            octave = note.charAt(2);
        }
        else {
            octave = note.charAt(1);
        }

        keyNumber = notes.indexOf(note.slice(0, -1));

        if (keyNumber < 3) {
            keyNumber = keyNumber + 12 + ((octave - 1) * 12) + 1;
        }
        else {
            keyNumber = keyNumber + ((octave - 1) * 12) + 1;
        }

        var f = 440 * Math.pow(2, (keyNumber - 49) / 12);
        noteToFreq[note] = f;
        return f;
    };

    window.computeFreq = computeFreq;



    var CTX = new AudioContext();

    var masterGain = CTX.createGain();
    masterGain.gain.value = 0.3;
    masterGain.connect(CTX.destination);

    var DEST = masterGain;

    var genNote = function(freq, type) {
        var osc = CTX.createOscillator();
        osc.type = type || 'square'; // sine square sawtooth triangle custom - https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode/type
        osc.frequency.value = freq;
        osc.connect(DEST);
        osc.start(0);

        return function() {
            osc.stop(0);
            osc.disconnect();
        };
    };

    window.genNote = genNote;



    var genString = function(freq) {
        var pro = CTX.createScriptProcessor(512, 0, 1);
        pro.connect(DEST);

        var N = Math.round(CTX.sampleRate / freq);
        var impulse = CTX.sampleRate / 1000;
        var y = new Float32Array(N);
        var n = 0;

        pro.onaudioprocess = function(e) {
            var out = e.outputBuffer.getChannelData(0), i = 0, xn;
            for (; i < out.length; ++i) {
                xn = ( --impulse >= 0 ) ? Math.random() - 0.5 : 0;
                out[i] = y[n] = xn + ( y[n] + y[( n + 1 ) % N] ) / 2;
                if (++n >= N) {
                    n = 0;
                }
            }
        };

        return function() {
            pro.disconnect();
        };
    };

    window.genString = genString;

})();
