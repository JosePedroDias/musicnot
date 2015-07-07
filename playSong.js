window.playSong = function(o) {
    'use strict';

    var tempo = 60;
    var time = [4, 4];
    var mode = 'string'; // square triangle sawtooth sine string
    var cursor = 0;

    var play = function (note) {
        var f = computeFreq(note);
        return (mode === 'string' ? genString(f) : genNote(f, mode));
    };

    var playN = function (notes) {
        var playing = notes.map(play);
        return function () {
            playing.forEach(function (p) {
                p();
            });
        };
    };


    // TODO TEMP HACK -> selects only first part and first voice, joining its measures
    var song = o.parts[0];

    if ('time' in song[0]) {
        time = song[0].time;
        console.log('time:', time);
    }
    if ('tempo' in song[0]) {
        tempo = song[0].tempo;
        console.log('tempo:', tempo);
    }

    song = song.map(function(measure) {
        return measure.voices[0];
    });

    var song2 = [];
    song.forEach(function(a) {
        a.forEach(function(b) {
            song2.push(b);
        });
    });
    song = song2;
    //console.log(song);



    var dur;
    var timer, playing;

    var onTick = function () {
        if (dur) {
            --dur;
            ++cursor;
            return;
        }

        var o = song.shift();

        if (!o) {
            if (playing) {
                playing();
            }
            playing = undefined;
            console.log('all done');
            return clearInterval(timer);
        }

        var isChorus = (o instanceof Array);
        var isRest = !isChorus && !('note' in o);

        var note = isChorus ? o.map(function(n) { return n.note; })  : o.note;
        dur = isChorus ? o[0].dur : o.dur;

        if (playing) {
            playing();
            playing = undefined;
        }

        if (isRest) {
            console.log(cursor, 'rest');
        }
        else {
            console.log(cursor, (isChorus ? 'chorus' : 'note'), note);
        }

        playing = isRest ? undefined : (isChorus ? playN(note) : play(note));

        ++cursor;
    };

    timer = setInterval(onTick, 30000 / tempo / time[1]); // https://en.m.wikipedia.org/wiki/Time_signature
};
