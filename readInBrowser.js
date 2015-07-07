(function (win) {
    'use strict';

    zip.workerScriptsPath = 'vendor/';

    var onError = function(msg) {
        window.alert(msg);
    };

    var model = (function () {
        var URL = win.URL || win.webkitURL || win.mozURL;

        return {
            getEntries: function (file, onend) {
                zip.createReader(new zip.BlobReader(file), function (zipReader) {
                    zipReader.getEntries(onend);
                }, onError);
            },
            getEntryFile: function (entry, onend, onprogress) {
                var writer = new zip.BlobWriter();
                entry.getData(writer, onend, onprogress);
            }
        };
    })();

    var download = function(entry, cb) {
        model.getEntryFile(
            entry,
            function (blob) {
                console.log('filename:', entry.filename);
                console.log('blob:', blob);
            },
            function (current, total) {
                var r = (current / total * 100).toFixed(2) + '%';
                console.log('progress: ' + r);
            }
        );
    };

    var fileInput = document.getElementById('file-input');

    fileInput.addEventListener('change', function () {
        fileInput.disabled = true;
        var file0 = fileInput.files[0];

        console.log('received file:', file0.name);

        model.getEntries(file0, function (entries) {
            console.log(entries);
            entries.forEach(download);
        });
    }, false);

})(this);
