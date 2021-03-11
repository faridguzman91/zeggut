'use strict';

var Riak   = require('riak-dc')
	, dg     = require('deep-grep')
	, q      = require('q');

var logger  = require( 'log4js' ).getLogger( 'rm' )
	, logwrap = {
		debug : function (s) { if (process.env.DEBUG != undefined) { logger.debug(s) } },
		info  : function (s) { if (process.env.DEBUG != undefined) { logger.info(s) } },
		warn  : function (s) { if (process.env.DEBUG != undefined) { logger.warn(s) } },
		error : function (s) { if (process.env.DEBUG != undefined) { logger.error(s); return new Error(s) } },
	};

var promise_err_handler = function (err) {
	return logger.error( 'promise rejected: ' + err );
}

/**
 * Sends a ping through to Riak.
 */
function ping () { return Riak.ping() }

/**
 * Updates an object ("row" or "record") in Riak.
 * @param {object} object - the object you wish to update
 */
function update_object (object)  { // {{{
	// Takes an object and a serial, updates Riak to change that object. Returns
	// the new serial for the updated object (Riak does not have update).
	//
	// TODO: writeme
} // }}}

/**
 * Creates a new schema from a javascript object (useful for reading a schema off disk)
 * @param {object} schema - the javascript object representing your desired schema
 */
function init_schema (schema) { // {{{
	// NOTE: Because of how Riak works, this is not destructive. Riak also has
	//       no 'truncate' or 'initdb' type operation. If you try to initialise
	//       a fresh schema in Riak when one exists already, confusion will
	//       ensue.
	//
	//
	var returns  = [ ]
		, deferred = q.defer();

	Object.keys( schema ).forEach( function (type) {
		returns.push( Riak.put_tuple( 'prototypes', schema[type], type ) );
	} );

	deferred.resolve( returns );

	return deferred.promise;
} // }}}

/**
 * Places a new object into the database.
 *
 * @param {string} type - the type of object you are storing
 * @param {object} object - the javascript object you wish to store.
 *
 * @returns {object} promise - a promise containing either a serial or an error.
 */
function add_object (type, object) { // {{{
	var deferred = q.defer();

	if (object['serial']) {
		deferred.resolve( new Error( 'Object id ' + object['serial'] + ' already in Riak; update_object() instead?' ) );
	}

	var pschema = get_schema();

	pschema.then( function (schema) {
		if ( schema.hasOwnProperty( type ) ) {
			// This looks like a Schema that has an object of the type we are
			// being asked to commit.
			//
			logwrap.debug( 'adding object of type ' + type );
			Riak.put_tuple(type, object).then( function( pserial ) {
				deferred.resolve(pserial);
			} );
		}
		else {
			// We don't actually have objects of this type, so error
			//
			deferred.resolve( logwrap.error( 'Object type ' + type + ' not defined in schema.' ) );
		}

	} );


	return deferred.promise;
} // }}} add_object()

/**
 * Deletes an object from Riak
 *
 * @param {string} type - the type of object you are deleting
 * @param {object} object - the javascript object you wish to delete. (optional, sort of)
 * @param {string} id - the serial ('nonce') of the object you wish to delete (optional)
 *
 * @returns {object} promise - an error, if one occurred
 */
function del_object (type, object, id) { // {{{
	// Attempt to delete an object from the store. Takes the type of object and
	// the object. The object contains its serial.
	//
	var serial = object['serial']
		, deferred = q.defer();

	if (!serial) {
		if (!id) {
			return logwrap.error( 'Anonymous object provided without serial; cannot delete this object.' );
		}
		else {
			// A serial has been provided rather than an object, so we attempt to
			// just delete the tuple by 'name' and see how Riak reacts.
			//
			return Riak.del_tuple( type, id ).then( function (result) {
				if (!result) {
					return logwrap.error( 'Failed to delete anonymous object by supplied serial' );
				}
				else {
					deferred.resolve( result );
				}
			} );
		}
	}

	logwrap.debug( 'processed request to delete object tid ' + bucket + '/' + serial );

	Riak.del_tuple( type, serial ).then( function (result) {
		deferred.resolve( result );
	} );

	return deferred.promise;
} // }}}

/**
 * Return a new "empty" and "anonymous" (no serial) object
 * @param {string} type - the type of object you are deleting
 *
 * @returns {object} promise - an promise to the (new, anonymous) object you have requested
 */
function new_object (type) { // {{{
	var deferred = q.defer()
		, clone    = { };

	var pschema = get_schema();

	pschema.then( function (schema) {
		if (schema.hasOwnProperty( type )) {
			// If it looks like we have a prototype for this object in the schema,
			// take that definition and copy it, returning a fresh copy of that
			// object to the user.
			//
			clone = schema_to_object( schema[ type ] );
			logwrap.debug( 'deferring clone of '.concat( type ) );
			deferred.resolve( clone );
		}
		else {
			// This type was not found in the schema.
		}
	}, failed_promise_handler );

	return deferred.promise;
} // }}} new_object()

function failed_promise_handler () {
	logger.error( 'failed promise: ', require( 'util' ).inspect( arguments ) );
}

/**
 * Return list of the available object types in the schema.
 */
function object_types () { // {{{
	// Return a (promise of a) list of object types we know about in the
	// schema - no data or 'prototypes' of these objects are actually returned.
	//
	var keys = [ ]
		, deferred = q.defer();

	var pschema = get_schema();
	pschema.then( function (s) {
		dg.deeply( Object.keys( Schema ), function (t) {
			if (t.substr(0,1) != '_') return 1
		} ).forEach( function (key) {
			keys.push(key);
		} )
		logwrap.debug( 'returning object types list' );
		deferred.resolve( keys );
	} );
	return deferred.promise;
} // }}} object_types()

/**
 * Return all the objects of a given type
 * @param {string} type - the type of objects you would like from the database
 */
function get_objects (type) { // {{{
	// Pull every single object of a provided type out of Riak, as a promise to
	// a list. As all these objects have been stored, they will have serials.
	//
	var precords = [ ]       // promises to records
		, rrecords = [ ]       // actual records
		, deferred = q.defer()
		, subdefer = q.defer()

	logwrap.debug( 'looking for '.concat( type, ' objects' ) );


	Riak.get_keys( type ).then( function ( keys ) {
		keys.map( function (key) {
			precords.push( Riak.get_tuple( type, key ) );
		} )
		deferred.resolve( precords );
	} );

	deferred.promise.then( function (records) {
		records.forEach( function (record) {
			record.then( function (data) {
				rrecords.push( data );
			} )
		} )
		subdefer.resolve( rrecords );
	} )

	return subdefer.promise;
} // }}}

/**
 * Pass in a database handle you will use for storing objects.
 * @param {object} object - the database handle.
 */
function set_riak_handle (obj) { // {{{
	// Accept a riak object from the user. This is expected to behave exactly
	// the way riak-dc does and this hook is almost entirely intended for
	// inserting spies during testing.
	//
	Riak = obj;
	return Riak;
} // }}}

/**
 * Ask rm for whatever 'riak' handle it's actually using
 * @param {object} object - the handle.
 */
function get_riak_handle (obj) { // {{{
	// Accept a riak object from the user. This is expected to behave exactly
	// the way riak-dc does and this hook is almost entirely intended for
	// inserting spies during testing.
	//
	return Riak;
} // }}}

/**
 * Re-initialise the schema in memory (not in Riak!).
 * @param {object} schema - the schema.
 */
function set_schema (s) { // {{{
	// Largely for test purposes, this function exists to clobber the Schema
	// and set it with something supplied by the caller
	module.exports.schema.model = s;
	return s;
} // }}}

// Exported things
//

/**
 * Gets a copy of the schema from Riak.
 *
 * @returns {object} promise - your schema, eventually.
 */
function get_schema () { // {{{
	var deferred = q.defer()
		, subdefer = q.defer()

	if (module.exports.schema.defined == true) {
		var deferred = q.defer();
		deferred.resolve( module.exports.schema.model );
		return deferred.promise;
	}

	var map = { };

	Riak.get_keys( 'prototypes' ).then( function (prototypes) {
		prototypes.map( function (prototype) {
			map[prototype] = Riak.get_tuple( 'prototypes', prototype );
		} )
		deferred.resolve( map );
	} );

	deferred.promise.then( function (schema) {
		module.exports.schema.model = map;
		subdefer.resolve( module.exports.schema.model )
	} );

	return subdefer.promise;
} // }}} get_schema()

module.exports = {
	add_object    : add_object,
	del_object    : del_object,
	new_object    : new_object,

	get_object_types  : object_types,
	get_objects       : get_objects,
	update_object     : update_object,

	set_riak_handle : set_riak_handle,
	get_riak_handle : get_riak_handle,
	ping            : ping,

	set_schema      : set_schema,
	get_schema      : get_schema,

	schema : {
		'model' : { },
		defined : false
	}
}

// Not exported things
//
function schema_to_object (definition) { // {{{
	// Take the prototype definitions from the schema and create object stubs
	// out of it. These can subsequently be populated, but will not have a
	// serial until it's been written to Riak (add_object).
	//
	var clone = { }
		, map   = (typeof definition == 'string') ? JSON.parse(definition) : definition;

	Object.keys(map).forEach( function (k) {
		if ( (k != 'hasone') && (k != 'hasmany') ) {
			// Create the actual hash, casting it to string or integer based on
			// this gross hack.
			//
			clone[k] = map[k].isa == 'string' ? '' : 0 ;
		} // if it's a key and the right key
	} ) // walk the hash

	return clone;
} // }}}

// @janearc // jane@cpan.org // vim:tw=79:ts=2:noet
