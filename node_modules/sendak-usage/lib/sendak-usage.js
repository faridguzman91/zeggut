// I got real tired of the clutter at the top of all these command-line tools.
// So this wraps the things I was doing in some sugary things. Also it makes me
// happy.
//
// @konklone: follow your heart.
//

var dg     = require( 'deep-grep' )
	, logger  = require( 'log4js' ).getLogger() // {{{
	, logwrap = {
		debug : function (s) { if (process.env.DEBUG != undefined) { logger.debug(s) } },
		info  : function (s) { if (process.env.DEBUG != undefined) { logger.info(s) } },
		warn  : function (s) { if (process.env.DEBUG != undefined) { logger.warn(s) } },
		error : function (s) { if (process.env.DEBUG != undefined) { logger.error(s); return new Error(s) } },
	}; // }}}

/**
 * Pass in arguments suitable for nopt(5) to parse
 * @param {object} nopt - { 'arg-name' : { type: [ class ], description: scalar } }
 * @param {object} argv - process.argv or something more creative but similar
 */
function parsedown (handlers, argv) { // {{{
	var args = require( 'minimist' )(process.argv.slice(2));
	if (args.length) {
		return [
			args,
			usage_str( handlers )
		];
	}
	else {
		return [
			require( 'minimist' )(argv),
			usage_str( handlers )
		];
	}
} // }}}

exports.parsedown = parsedown;

/**
 * Actually execute code from the parsedown stanza
 * @param {object} nopt - { 'arg-name' : { type: [ class ], description: scalar } }
 * @param {object} argv - process.argv or something more creative but similar
 */
function dispatch (handlers, argv) {
	dg.sync( Object.keys( handlers ), function (t) { return t['handler'] ? t['handler'] : null })
		.forEach( function (h) {
			var handler = h['handler']
				// This doesn't do anything too expensive, so do I care that I am
				// calling it a few times?
				//
				, args    = parsedown( argv )[0]
				, usage   = parsedown( argv )[1];

				// So if your handler is 'help', you get returned to you the value of
				// handlers['help']['handler']( nopt( argv )['help'] in the 'results'
				// key.
				//
				handlers[h]['results'] = handler( args[h] );
		}
	);

	// And send the results back to the user.
	//
	return handlers;
}

exports.dispatch = dispatch;

// Nothing from here down is exported
//



// Get the longest string from a list
//
function longest (l) { // {{{
	var maxlen = 0;
	l.shift().forEach( function (s) { if (s && s.length > maxlen) { maxlen = s.length } } );
	return maxlen;
} // }}}

// String right padding helper
//
// Stolen from @zaach
//
function rpad(str, length) { // {{{
	while (str.length < length) { str = str + ' ' }
	return str;
} // }}}

function usage_str (args) { // {{{
	var records = [ ];

	Object.keys( args ).forEach( function (argname) {
		var line = '';
		// XXX: Does not include aliases
		//

		// Name of the argument & pad it
		//
		line += '--' + argname;
		line = rpad( line, longest( [ Object.keys( args ) ] ) + 2 );

		// Description
		//
		if (args[argname]['description']) { line += ' ' + args[argname]['description'] }

		// Derive the longest argument and pad it
		//
		var descs = [ Object.keys( args ).map( function (k) { return args[k].description } ) ];
		line = rpad( line, longest( descs ) + longest( [ Object.keys( args ) ] ) + 3 );

		// Throw it on the stack
		//
		records.push( line );
	} );

	// Hand it back to the user as a string
	//
	return records.join( "\n" );
} // }}}

// jane@cpan.org // vim:tw=80:ts=2:noet
