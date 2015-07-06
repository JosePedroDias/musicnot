(function() {
    'use strict';


    window.AudioContext = window.AudioContext || window.webkitAudioContext;



    var noteToFreq = {};



    var notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];

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

        var f = 440 * Math.pow(2, (keyNumber- 49) / 12);
        noteToFreq[note] = f;
        return f;
    };



    /*
     var scale = 'C D EF G HA B';

     var computeFreq = function(note) {
        var f = noteToFreq[note];
        if (f) { return f; }
        var chars = note.split('');

        var i = 0;
        var c = chars[i++];
        var n = scale.indexOf(c) + 3;

        while (1) {
            c = chars[i++];
            switch (c) {
                case '#': ++n; break;
                case 'b': --n; break;
                default:
                    n += parseInt(c, 10) * 12;
            }
            f = 220 * Math.pow(2, 1 + n/12);
            noteToFreq[note] = f;
            return f;
        }
    };*/

    window.computeFreq = computeFreq;



    var ctx = new AudioContext();

    var masterGain = ctx.createGain();
    masterGain.gain.value = 0.3;
    masterGain.connect(ctx.destination);

    var notesBeingPlayed = {};

    var beginPlayNote = function(note) {
        var f = computeFreq(note);
        console.log('play %s (%s Hz)', note, f.toFixed(2));
        var osc = ctx.createOscillator();
        osc.type = 'triangle'; // sine square sawtooth triangle custom - https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode/type
        osc.frequency.value = f;
        osc.connect(masterGain);
        notesBeingPlayed[f] = osc;
        osc.start(0);
    };

    var endPlayNote = function(note) {
        var f = computeFreq(note);
        console.log('stop %s (%s Hz)', note, f.toFixed(2));
        var osc = notesBeingPlayed[f];
        if (!osc) { return; }
        delete notesBeingPlayed[f];
        osc.stop(0);
        osc.disconnect();
    };

    window.gen = {play:beginPlayNote, stop:endPlayNote};



    // Karplus-Strong - good for string synth
    // https://ccrma.stanford.edu/~jos/pasp/Karplus_Strong_Algorithm.html
    function Pluck(ctx) {
        this.sr = ctx.sampleRate;
        this.pro = ctx.createScriptProcessor(512, 0, 1); // buffer size, number of in channels, number of out channels
        this.pro.connect(ctx.destination);
    }

    Pluck.prototype.play = function (freq) {
        var N = Math.round(this.sr / freq),
            impulse = this.sr / 1000,
            y = new Float32Array(N),
            n = 0;
        this.pro.onaudioprocess = function (e) {
            var out = e.outputBuffer.getChannelData(0), i = 0, xn;
            for (; i < out.length; ++i) {
                xn = ( --impulse >= 0 ) ? Math.random() - 0.5 : 0;
                out[i] = y[n] = xn + ( y[n] + y[( n + 1 ) % N] ) / 2;
                if (++n >= N || !this.playing) {
                    n = 0;
                }
            }
        }.bind(this);
        this.playing = true;
    };

    Pluck.prototype.pause = function () {
        this.playing = false;
    };

    window.Pluck = Pluck;

})();
