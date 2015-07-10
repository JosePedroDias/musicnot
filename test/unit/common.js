suite('common', function() {
    'use strict';

    if (typeof module !== 'undefined' && module.exports) {
        require('../../common');
    }



    var SCALES1TO8 = generateScale(1, 8);



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
        assert.equal( getNextNote('B3'),  'C4'  );
        assert.equal( getNextNote('C3'),  'C#3' );
        //assert.equal( getPrevNote('C3#'), 'D3'  );
    });

    test('getPrevNote', function() {
        assert.equal( getPrevNote('C4'),  'B3' );
        assert.equal( getPrevNote('C#3'), 'C3' );
        //assert.equal( getPrevNote('Cb4'), 'C4'  );
    });

    test('shiftNote', function() {
        assert.equal( shiftNote('C3',  1, SCALES1TO8) , 'C#3' );
        assert.equal( shiftNote('C3',  2, SCALES1TO8) , 'D3'  );
        assert.equal( shiftNote('C#3', 3, SCALES1TO8) , 'E3'  );
        assert.equal( shiftNote('D4', -3, SCALES1TO8) , 'B3'  );
    });

});
