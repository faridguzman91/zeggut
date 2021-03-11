var assert = require( 'assert' )
	, xit    = require( '../lib/xit' );
it( 'start() returns correct book', function () {
	var book = xit.start();
	assert( book, 'book is truthy' );
	assert( book.hasOwnProperty( 'records' ), 'records object present' );
	assert( Object.keys( book.records ).length == 0, 'book starts with empty records object' );
	assert( book.hasOwnProperty( 'add' ), 'add method present' );
	assert( xit.hasOwnProperty( 'get' ), 'get method present' );
	assert( book.hasOwnProperty( 'has_xid' ), 'has_xid method present' );
} );
