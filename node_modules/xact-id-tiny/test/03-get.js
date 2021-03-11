var assert = require( 'assert' )
	, xit    = require( '../lib/xit' );

xit.start();

it( 'retrieve xact', function () {
	var xact = new xit.xact();
	xit.add( xact );
	xit.end( xact );
	assert( typeof xit.get( xact ) != 'Error' );
} )
it( 'retrieve xact-by-id', function () {
	var xact = new xit.xact();
	xit.add( xact );
	xit.end( xact );
	assert( typeof xit.get( xact.serial ) != 'Error' );
} );
