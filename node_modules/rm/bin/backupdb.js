#!/usr/bin/env node

var parsed = require('sendak-usage').parsedown( {
	'stdout' : { 'type': [ Boolean ], 'description': 'print data to stdout'                                   },
	'file'   : { 'type': [ String  ], 'description': 'specify a file to write to'                             },
	's3'     : { 'type': [ String  ], 'description': 'the s3 bucket you wish to write to.'                    },
	'label'  : { 'type': [ String  ], 'description': 'the label you wish to use for \'file\' and \'s3\' args' },
	'help'   : { 'type': [ Boolean ], 'description': 'is verreh halpful'                                      }
}, process.argv )
	, nopt   = parsed[0]
	, usage  = parsed[1];

if (nopt['help']) {
	// Be halpful
	//
	console.log( 'Usage: ' );
	console.log( usage );
	process.exit(0); // success
}

var rrm      = require( 'rrm' )
	, q        = require( 'q' )
	, fs       = require( 'fs' )
	, deferred = q.defer()
	, objects  = { }
	, moment   = require( 'moment' )
	, label    = nopt['label'] ? nopt['label'] : moment().format()

rrm.object_types().then( function (types) { types.forEach( function (type) {
	console.log( 'Encountered object type: ' + type );
	rrm.get_objects( type ).then( function (object) {
		fs.appendFileSync( 'rrm-' + type + '-' + label + '.json', JSON.stringify( object ) );
	} )
} ) } );
