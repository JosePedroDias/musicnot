suite('common', function() {
    'use strict';

    var assert = chai.assert;

    test('stuff sync', function() {
        assert.equal(1, 1, 'asd');
    });

    test('stuff async', function(done) {
        assert.ok(true, 'asd');
        setTimeout(done, 100);
    });

});
