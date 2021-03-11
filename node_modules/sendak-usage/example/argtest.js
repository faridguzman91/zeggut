#!/usr/bin/env node

var su = require( '../lib/sendak-usage.js' );

var parsed = su.parsedown( {
	foo : {
		'long-args'   : [ 'foo' ],
		'description' : 'first argument to fooing.',
		'short-args'  : [ 'f' ],
		'default'     : false,
		'type'        : [ Boolean ]
	},
	bar : {
		'long-args'   : [ 'bar' ],
		'description' : 'second argument to fooing.',
		'short-args'  : [ 'b' ],
		'default'     : false,
		'type'        : [ Boolean ]
	},
	bletch : {
		'long-args'   : [ 'bletch' ],
		'description' : 'sometimes third argument but is optional.',
		'short-args'  : [ 'bl' ],
		'default'     : false,
		'type'        : [ Boolean ]
	},
	qip : {
		'description' : 'qip is the fourth variable.',
		'type' : [ Boolean ]
	},
	// A null description
	//
	quux : { 'type' : [ Boolean ] }
}, process.argv )
	, nopt  = parsed[0]
	, usage = parsed[1];

console.log( 'original arguments: ', process.argv );
console.log( 'nopt: ', nopt );
console.log( 'usage string: ', usage );
