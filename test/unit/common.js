suite('common', function() {
    'use strict';

    if (typeof module !== 'undefined' && module.exports) {
        require('../../common');
    }



    var assert = require('assert');
    //var assert = chai.assert;

    test('decomposeNote', function() {
        assert.deepEqual( {l:'D', a: 0, o:4}, decomposeNote('D4') );
        assert.deepEqual( {l:'E', a: 1, o:5}, decomposeNote('E#5') );
        assert.deepEqual( {l:'G', a: 2, o:6}, decomposeNote('G##6') );
        assert.deepEqual( {l:'C', a:-1, o:3}, decomposeNote('Cb3') );
        assert.deepEqual( {l:'B', a:-2, o:2}, decomposeNote('Bbb2') );
    });

    /*test('stuff async', function(done) {
        assert.ok(true, 'asd');
        setTimeout(done, 100);
    });*/

});
