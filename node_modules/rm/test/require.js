var assert = require( 'assert' );
it( 'require rm', function () {
	var rm = require( '../lib/rm' );
	assert( rm, 'require worked' );
} );
