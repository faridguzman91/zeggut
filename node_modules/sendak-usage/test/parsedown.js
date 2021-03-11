var chai   = require( 'chai' )
	, assert = require( 'assert' );

// A canned argv
//
var argv = [
	'node',
	'/Users/jane/dev/sendak-usage/example/argtest.js',
	'--foo',
	'1'
];

it( 'parsedown', function () {
	var parsed = require( '../lib/sendak-usage.js' ).parsedown( {
		// full declaration
		//
		foo : {
			'long-args'   : [ 'foo' ],
			'description' : 'first argument to fooing.',
			'short-args'  : [ 'f' ],
			'default'     : false,
			'type'        : [ Boolean ]
		},
		// abbreviated declaration
		//
		bar : { 'type' : [ Boolean ] }
	}, argv )
		, nopt  = parsed[0]
		, usage = parsed[1];

	assert( (parsed && nopt && usage), 'true return' );
	assert( typeof usage == 'string', 'usage is a string' );
	assert( typeof nopt  == 'object', 'nopt is an object' );

} );
