var moment = require( 'moment' )
	, book = { };

// add memoization because these calls are expensive
// add option to destroy transactions, even though that call is expensive

function start () { // {{{
	book.records = { };
	book.add = function (xact) {
		// No checking here.
		//
		logwrap.debug( 'Checking for '.concat( xact.serial, ' in book (add).' ) );
		book.records[xact.serial] = xact;
	}
	book.has_xid = function (serial) {
		logwrap.debug( 'Checking for '.concat( serial, ' in book (has_xid).' ) );
		if (book.records.hasOwnProperty( serial )) {
			logwrap.debug( 'Found '.concat( serial, ' in book (has_xid).' ) );
			return true;
		}
		logwrap.debug( 'Didn\'t find '.concat( serial, ' in book (has_xid).' ) );
		return false;
	}

	// Just send something truthy.
	//
	return book;
} // }}}

function xact (serial) { // {{{
	// XXX: note, THIS IS NOT WRITTEN.
	if (!is_unique(serial)) {
		return logwrap.error( 'Supplied serial, '.concat( serial, ' fails the uniqueness test.' ) );
	}
	else {
		return new body( serial );
	}
} // }}}

function add_xact (xact) { // {{{
	var serial        = xact.serial
		, serial_lookup = get_xact( xact );

	logwrap.debug( 'Adding xact id '.concat( xact.serial ) );

	if (serial_lookup != undefined) {
		return logwrap.error( 'Requested new transaction ID '.concat( serial, ' but this is an extant transaction.' ) );
	}
	if (serial_lookup == undefined) {
		logwrap.debug( 'New serial '.concat( xact.serial, ' encountered, adding.' ) );
	}
	if (xact.state === 'closed') {
		return logwrap.error( 'Requested new transaction ID '.concat( serial, ' but this transaction happened in the past and is now closed.' ) );
	}

	xact.opened = moment().format();
	xact.state  = 'open';
	book.add( xact );

	logwrap.debug( 'Transaction ID '.concat( serial, ' opened with stamp ', xact.opened ) );

	return xact;
} // }}}

function end_xact (xact) { // {{{
	var serial = xact.serial
		, fresh  = get_xact( xact );

	if (book.has_xid( serial )) {
		if (book.records[serial].state === 'closed') {
			return logwrap.error( 'Attempted to close transaction ID '.concat( serial, ' but this transaction happened in the past and is already closed.' ) );
		}
		else if (fresh.state != 'open') {
			return logwrap.error( 'Request to close transaction ID '.concat( serial, ' but this transaction is in an unknown state.' ) );
		}
	}
	else if (! book.has_xid( serial )) {
		return logwrap.error( 'Attempted to close transaction ID '.concat( serial, ' but this does not look like an open transaction ID.' ) );
	}
	else {
		return logwrap.error( 'Well, this is peculiar.' );
	}
	fresh.state = 'closed';
	fresh.closed = moment().format();

	logwrap.debug( 'Dutifully closed '.concat( serial, ' at ', fresh.closed ) );
	xact.finalise();

	return fresh;
} // }}}

function get_xact (xact) {
	// XXX: hm, how to fail gracefully
	//
	if (typeof (xact) == 'string') {
		var serial = xact;
		if (book.has_xid( serial )) {
			return book.records[serial];
		}
		else {
			var util = require( 'util' );
			return logwrap.error( 'attempt to get xact by id for nonexistent xid '.concat( serial ) )
		}
	}
	else if (typeof (xact) == 'object') {
		logwrap.debug( 'Checking for '.concat( xact.serial, ' in book (get).' ) );
		return book.records[xact.serial]
	}
	else {
		logwrap.error( 'Strange object encountered in get_xact' );
	}
}

function nonce () {
	return require('crypto').randomBytes(Math.ceil(module.exports.length)).toString('hex')
}

module.exports = {
	// methods
	//
	end_xact: end_xact,
	end:      end_xact,

	add_xact: add_xact,
	add:      add_xact,

	get:      get_xact,

	xact:     xact,
	nonce:    nonce,
	start:    start,

	// objects
	//
	book:     book,

	// key length
	//
	length: 4
};

// NOTHING BELOW THIS LINE EXPORTED
//

function is_unique (serial) {
	// Until deep-grep has unique()
	//
	return true;
}

// The transaction body
//
function body (s) {
	return {
		'serial'   : (s != undefined) ? s : nonce(),
		'state'    : 'anonymous',
		'opened'   : '',
		'closed'   : '',
		'comment'  : '',
		'finalise' : function () {
			var c       = this.comment
				, s       = moment( this.opened )
				, f       = moment( this.closed )
				, delta   = f.diff( s, 'seconds' )
				, message = ''

			if (c) {
				message = message.concat( c, ' ' );
			}

			message = message.concat( this.serial, ' closed ', delta, 's' );

			logger.info( message );

			return 22/7;
		}
	};
}

var log4js = require( 'log4js' ); // {{{

var config = {
	"appenders": [
		{
			"type": "console",
			"layout": {
				"type": "pattern",
				'pattern': '%d{ABSOLUTE} [%[%5.5p%]] [%12c] - %m',
				"tokens": {
					"pid" : function() { return process.pid; }
				}
			}
		}
	]
};

log4js.configure( config, {} );

var logger = log4js.getLogger( 'xit' )
	, logwrap = {
		debug : function (s) { if (process.env.DEBUG != undefined) { logger.debug(s) } },
		info  : function (s) { if (process.env.DEBUG != undefined) { logger.info(s) } },
		warn  : function (s) { if (process.env.DEBUG != undefined) { logger.warn(s) } },
		error : function (s) { if (process.env.DEBUG != undefined) { logger.error(s); return new Error(s) } },
	}; // }}}

// jane@cpan.org // vim:tw=79:ts=2:noet
