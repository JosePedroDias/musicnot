(function() {
    'use strict';

    var inFile = location.search.substring(1);

    var ajax = function(o) {
        var xhr = new XMLHttpRequest();
        xhr.open(o.verb || 'GET', o.uri, true);
        var cbInner = function() {
            if (xhr.readyState === 4 && xhr.status > 199 && xhr.status < 300) {
                return o.cb(null, JSON.parse(xhr.response));
            }
            o.cb('error requesting ' + o.uri);
        };
        xhr.onload  = cbInner;
        xhr.onerror = cbInner;
        xhr.send(null);
    };

    ajax({
        uri: inFile,
        cb: function(err, o) {
            if (err) { return console.error(err); }
            //playSong(o);
            renderSong(o);
        }
    });
})();
