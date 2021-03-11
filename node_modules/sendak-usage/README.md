sendak-usage
====

It became clear after writing the bulk of Sendak's command-line components
that a common "header" accompanied each task that included the command-line
options, their long- and short- arguments, defaults, and descriptions, from
which `nopt-usage` would generate a "usage" statement and `nopt` would do the
actual parsedown into a hash.

But this was big and sprawling and when @konklone said to me that he uses
`minimist`, I was peeved because I wanted to be able to switch and realised I
had coded myself into this `nopt` and `nopt-usage`-shaped corner where I could
not just forklift in `minimist` if I wanted to.

Accordingly I wrote this tiny package to abstract away the command-line parser
I am using with usage stuff into a single hash so that I am not dependent on
the vagaries of other packages (ahem, looking at you, `nopt-usage`&hellip;)
that may or may not be actually maintained.

It is published here primarily so that Sendak can require it, but you should
feel comfortable that it will continue to be maintained for at least as long
as Sendak is if it is useful to you.

Usage
====

From the [original issue](https://github.com/18F/Sendak/issues/38):

```
var parsed = require( 'sendak-usage' ).parse( {
  // This is a full argument declaration
  //
  'help': {
    'long-args': [ 'help', 'halp' ],
    'description': 'sets the helpful bit',
    'short-args': [ 'h' ],
    'default': false
    'type': [ Boolean ]
  },
  // But all you need to do is specify the type of argument you want.
  //
  'long-arg-name': { 'type': [ Boolean ] }
} );
```

Author
====

[@avriette](https://github.com/avriette), jane.avriette@gsa.gov
