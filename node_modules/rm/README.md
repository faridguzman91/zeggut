RM, an ORM\* for Riak
====

So in the course of building [Sendak](https://github.com/18F/Sendak) for
[18F](https://18f.gsa.gov/), I wanted to use an ORM. I found that ORMs
were very complicated. I found that node itself was kind of poorly-suited
to the way that ORMs worked. I also found that ORMs (for Javascript)
generally did not provide the functionality I wanted (for example
keeping state in the database).

As I sat down to write my own ORM, I realised that the biggest part of it,
code-wise, was going to actually be the SQL layer. As it happens, writing
SQL parsers, SQL generators, stored procedures, and so forth, while
maintaining an agnostic stance towards choice of database (even without this),
the task is nothing less than odious, and results in huge code-sprawl, when
all I wanted was a way to create some simple objects and store them in a
place that bunches of things could get to (accordingly, a json file was not
sufficient), and I didn't want to have to worry about the "database layer";
I wanted objects &mdash; data structures &mdash; that I could read and write
without having data logic in my code.

There are lots of document-store and key-value store "databases" out there.
For various reasons, I chose Riak to put this on top of. No more need for
SQL, native storage of JSON, and it seemed like a win.

Rather than use the rather ponderous and somewhat inscrutable [riak-js](http://riakjs.com/),
I wrote a very tiny library, [riak-dc](https://github.com/janearc/riak-dc), which is
the barest of wrappers around node's own [http](http://nodejs.org/api/http.html).

Accordingly, you will find that this library is very tiny, takes up very
little space in terms of lines-of-code, is end-to-end javascript & json, and
meets the above requirements:

* No stupid SQL tricks
* JSON object storage
* Schema stored in the database
* Exceedingly simple API
* No pyramid of fail

\* note: RM is not actually "relational."

How to use RM
====

Basically, `npm install rm` should do the trick and install dependencies.
Unit tests are mocked, but you will need a Riak somewhere to talk to. `riak-dc`
assumes that you are using `http://localhost:8098/riak`, and if you are, RM
requires no configuration. If not, be sure to initialise `riak-dc` before
using RM.

#### Key concepts:

RM stores a 'schema' in Riak, from which it derives prototypes of each of the
object types stored in the RM. The schema is not actually "bound" to
anything, as such, and serves only as a template from which to build new
objects.

These objects are stored in a Riak bucket according to their prototype (so all
the 'automobile' objects are stored in `riak/automobile/{serial}`).

Objects are "anonymous" until they are stored in Riak, which gives them a
unique serial (for SQL people, you might call this a 'primary key').

Objects also contain no metadata about what they are. So you must keep track
of which type of object you have. RM is flexible enough that if you wanted to
incorporate a `typeof` attribute, you could do this, but you would have to
keep track of that yourself.

There is no strict checking for whether an object you are storing actually
conforms to the schema.

#### Exported functions:

Unless otherwise specified, all references to returned values are actually
promises (using `q`, rather than the value itself). So "returns a hash" means
"returns a promise to a hash."

* `add_object( type, object )`

Takes two arguments, the type of object being added and an anonymous object to
be added. Note that if this object is already in Riak, an Error will be
returned. For existing objects, use `update_object`.

* `del_object( type, object )`

Takes two arguments, the type of object to be deleted from Riak and the object
itself. This object must have a serial, or an exception will be thrown.

* `get_objects( type )`

Takes one argument, the type of objects requested. This returns *all* the
objects of that type in Riak. This is actually a very fast operation in Riak
at most practical scales.

Because Riak allows the storage of zero-byte tuples, it is possible to store
an object in Riak which is defined but null. In the event this happens, you
will receive an Error instead of the object (rather than not returning or
returning the empty list or similar).

* `get_schema( )`

Returns a hash of what the objects look like in Riak. This includes metadata
and should not be used to "create new objects" (see `new_object`). Takes no
arguments.

* `new_object( type )`

Takes object type as sole argument, and returns a new object with relevant
attributes from the schema. This will not be stored until `add_object` is
called.

* `object_types( )`

Takes no arguments and returns a list of object types defined in the schema.

* `update_object( type, object )`

Provided a type and object, RM will attempt to find the object in Riak,
*delete* that object, and re-insert, providing you with a new copy of your
object with appropriate serial. Note that deleted objects are
[tricky](http://docs.basho.com/riak/latest/ops/advanced/deletion/#Tombstones)
in Riak, so be sparing about the this operation (delete & insert).

#### The basic design pattern

```
var rm     = require( 'rm' )
	, types   = rm.object_types()
	, schema  = rm.get_schema()
	, banana  = rm.new_object( 'fruit' );

banana['color'] = 'green';

var pbanana = rm.add_object( banana ).then( function (b) {
	// 'pbanana' infers 'promise to a banana'
	//
	// the banana object now has a serial and can be referenced in Riak.
	banana = b;

	// Time elapses...

	banana['color'] = 'yellow';

	var promise = rm.update_object( 'fruit', banana );

	promise.then( function (b) {
		// What will you do with your now-yellow banana?
		//
		banana = b;

		// Time elapses...

		// This will not return anything meaningful, although an error will be
		// returned if the serial for this banana is not found.
		//
		rm.del_object( 'fruit', banana ).then( function (e) {
			if (typeof e == 'error') {
				console.log( e )
			}
		} );
	} );

} );
```

What's in the box
====

There are two tools in the `bin` directory, `rm.js` and `backupdb.js`.

* `rm.js` is a simple command-line tool to interface with RM. For
example, `--get-schema` will return the schema as it appears in Riak, and you
can use `--add-object --bucket bucketname --tuple base_64_encoded_object` to
add elements to the database. And so on.

* `backupdb.js` because Riak is not a relational database, we don't have
anything analogous to
[`pg_dumpall`](http://www.postgresql.org/docs/9.3/static/app-pg-dumpall.html),
and no real formal language in which to dump the database. But it is still
important to have backups in a modern, production environment. So
`backupdb.js` is a sort of minimum-effort "store all the things in the
database on the disk somewhere." It can print to stdout for unixy pipey kinds
of things, take a filename, or an s3 bucket (you will need credentials for
this, obviously).

If you need to effectively "truncate" the database, there's a tool in the
[riak-dc package](https://github.com/janearc/riak-dc/blob/master/bin/init-riak.js)
that will remove everything from the Riak ring. Careful with that axe, Eugene.

Future plans
====

If you look over the schema in `examples/`, you will notice I have left a
couple fields reserved, and have stubs for relational properties. At some
point RM may actually be relational, but it serves my purpose for now.
Additionally, Riak supports Javascript, so it should be possible to add
constraints to columns (that is, attributes of objects) such as "only allow
this to be a url" and similar.

Don't mess with those fields.

I'm not going to break compatibility for a long time, though. So, in the event
those things are added, it should be transparent.

Author
====

[@janearc](https://github.com/janearc), jane@cpan.org
