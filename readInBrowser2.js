(function (win) {
    'use strict';

    zip.workerScriptsPath = 'vendor/';

    var model = {
        getEntries: function (file, onend) {
            zip.createReader(
                new zip.BlobReader(file),
                function (zipReader) {
                    zipReader.getEntries(onend);
                },
                function (msg) {
                    window.alert(msg);
                }
            );
        },
        getEntryFile: function (entry, onend, onprogress) {
            var writer = new zip.BlobWriter();
            entry.getData(writer, onend, onprogress);
        }
    };

    var parseMusicXMLFile = function(blob) {
        var reader = new FileReader();
        reader.addEventListener('loadend', function() {
            var s = reader.result;
            var parser = new DOMParser();
            var doc = parser.parseFromString(s, 'text/xml');
            window.parseSong(doc);

        });
        reader.readAsText(blob);
    };

    var isXmlFileNotMeta = function(fn) {
        if ((/META-INF/i).test(fn)) { return false; }
        return (/\.xml$/i).test(fn);
    };

    var fileInput = document.getElementById('file-input');

    fileInput.addEventListener('change', function () {
        fileInput.disabled = true;
        var file0 = fileInput.files[0];

        //console.log('received file:', file0.name);

        if (isXmlFileNotMeta(file0.name)) {
            //console.log('uploaded file is an xml. parse directly...');
            return parseMusicXMLFile(file0);
        }
        //console.log('uploaded file is an mxl zip file. deflating...');

        model.getEntries(file0, function (entries) {
            var entry;
            entries.some(function(_entry) {
                if (isXmlFileNotMeta(_entry.filename)) {
                    entry = _entry;
                    return true;
                }
            });

            //console.log('found', entry);
            model.getEntryFile(entry, parseMusicXMLFile);
        });
    }, false);

})(this);
