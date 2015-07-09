suite('common', function() {
    'use strict';

    if (typeof module !== 'undefined' && module.exports) {
        require('../../common');
    }



    var assert = require('assert');
    //var assert = chai.assert;

    test('decomposeNote', function() {
        assert.deepEqual( decomposeNote('D4')   , {l:'D', a: 0, o:4} );
        assert.deepEqual( decomposeNote('E#5')  , {l:'E', a: 1, o:5} );
        assert.deepEqual( decomposeNote('G##6') , {l:'G', a: 2, o:6} );
        assert.deepEqual( decomposeNote('Cb3')  , {l:'C', a:-1, o:3} );
        assert.deepEqual( decomposeNote('Bbb2') , {l:'B', a:-2, o:2} );
    });

    test('getNoteSynomym', function() {
        assert.equal( getNoteSynomym('Cb4'), 'B3'  );
        assert.equal( getNoteSynomym('Bb4'), 'A#4' );
    });

    test('getNextNote', function() {
        assert.equal( getNextNote('Cb4'), 'C4'  );
        assert.equal( getNextNote('B3'),  'C4' );
        assert.equal( getNextNote('C3'),  'C#3' );
    });

    test('getPrevNote', function() {
        //assert.equal( getPrevNote('Cb4'), 'C4'  );
        //assert.equal( getPrevNote('B3'),  'C4' );
        //assert.equal( getPrevNote('C3'),  'C#3' );
    });

});
