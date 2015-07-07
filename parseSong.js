window.parseSong = function(doc) {
    //console.log(doc);



    var listToArr = function(lst) {
        var l = lst.length;
        var arr = new Array(l);
        for (var i = 0; i < l; ++i) {
            arr[i] = lst[i];
        }
        return arr;
    };

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

    console.log(song);
};
