var assert = require( 'assert' )
	, xit    = require( '../lib/xit' );

xit.start();

it( 'build a new xact', function () {
	var book = xit.book;

	assert( book, 'correct book object is exported' );

	var xact = new xit.xact();

	assert( xact, 'new transaction is truthy' );
	assert( xact.hasOwnProperty( 'serial' ), 'serial property is present' );
	assert( xact.serial, 'serial property is truthy' );
	assert( xact.hasOwnProperty( 'state' ), 'state property is present' );
	assert( xact.state == 'anonymous', 'state is \'anonymous\'' );
	assert( xact.hasOwnProperty( 'opened' ), 'opened property is present' );
	assert( xact.opened == '', 'no open timestamp for \'opened\' property because xact not added.' );
	assert( xact.hasOwnProperty( 'closed' ), 'closed property is present' );
	assert( xact.closed == '', 'no closed timestamp for \'closed\' property because xact not ended.' );
} );

it( 'open a new xact', function () {
	var book = xit.book
		, xact = new xit.xact();

	xit.add( xact );
	assert( xact.opened != '', 'xact now has a truthy \'open\' stamp because it was added.' );
	assert( xact.state == 'open', 'xact state is now \'open\'.' );
} );

it( 'close a xact', function () {
	var book = xit.book
		, xact = new xit.xact();

	xit.add( xact );
	assert( xact.opened != '', 'xact has a truthy \'open\' stamp after adding.' );
	xit.end( xact );
	assert( xact.closed != '', 'xact now has a truthy \'closed\' stamp because it was added.' );
	assert( xact.state == 'closed', 'xact state is now \'closed\'.' );

} );
