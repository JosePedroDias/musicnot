window.parseSong = function(doc) {
    //console.log(doc);





    var getEl = function(el, sel) {
        return el.querySelector(sel);
    };

    var getEls = function(el, sel) {
        var els = el.querySelectorAll(sel);
        if (!els) { return []; }
        return listToArr(els);
    };

    var getText = function(el, sel) {
        try {
            return el.querySelector(sel).textContent;
        } catch(ex) {}
    };

    var getNum = function(el, sel) {
        var v = getText(el, sel);
        if (!isFinite(v)) { return; }
        return parseFloat(v);
    };

    var getTextAttr = function(el, attrName) {
        return el.getAttribute(attrName);
    };

    var getNumAttr = function(el, attrName) {
        var v = getTextAttr(el, attrName);
        if (!isFinite(v)) { return; }
        return parseFloat(v);
    };



    var song = {partList:[], parts:[]};

    var scorePartwiseEl = getEl(doc, 'score-partwise');

    var scorePartEls = getEls(scorePartwiseEl,'part-list score-part');
    scorePartEls.forEach(function(scorePartEl) {
        song.partList.push({
            name:    getText(scorePartEl, 'instrument-name'),
            channel: getNum( scorePartEl, 'midi-channel'),
            program: getNum( scorePartEl, 'midi-program'),
            volume:  getNum( scorePartEl, 'volume'),
            pan:     getNum( scorePartEl, 'pan')
        });
    });

    var partEls = getEls(scorePartwiseEl, 'part');
    partEls.forEach(function(partEl) {
        var p = [];

        var measureEls = getEls(partEl, 'measure');
        measureEls.forEach(function(measureEl) {
            var m = {voices:{}};

            var attributesEl = getEl(measureEl, 'attributes time');
            if (attributesEl) {
                m.time = [
                    getNum(attributesEl, 'beats'),
                    getNum(attributesEl, 'beat-type')
                ];
            }

            var soundEls = getEls(measureEl, 'direction sound');
            soundEls.some(function(soundEl) {
                var tempo = getNumAttr(soundEl, 'tempo');
                if (tempo) {
                    m.tempo = tempo;
                    return true;
                }
            });

            var noteEls = getEls(measureEl, 'note');
            noteEls.forEach(function(noteEl) {
                var n = {
                    dur: getNum(noteEl, 'duration')
                };

                var isChord = false;

                var pitchEl = getEl(noteEl, 'pitch');
                if (pitchEl) {
                    var acci, alter = getText(pitchEl, 'alter');
                    if (isFinite(alter)) {
                        if      (alter ===  1) { acci = '#';  }
                        else if (alter ===  2) { acci = '##'; }
                        else if (alter === -1) { acci = 'b';  }
                        else if (alter === -2) { acci = 'bb'; }
                        else {                   acci = '';   }
                    }

                    isChord = !!getEl(noteEl, 'chord');

                    n.note = [
                        getText(pitchEl, 'step'),
                        acci,
                        getText(pitchEl, 'octave')
                    ].join('');
                }

                var voice = getNum(noteEl, 'voice');

                //console.log(n, isChord, voice);

                var bag = m.voices[voice];
                if (!bag) {
                    bag = [];
                    m.voices[voice] = bag;
                }

                if (isChord) {
                    var subBag = bag[bag.length-1];
                    if (subBag instanceof Array) {
                        subBag.push(n);
                    }
                    else {
                        bag[bag.length-1] = [bag[bag.length-1], n];
                    }
                }
                else {
                    bag.push(n);
                }
            });

            m.voices = valuesOf(m.voices); // get rid of voice keys, irrelevant
            p.push(m);
        });

        song.parts.push(p);
    });

    return song;
};
