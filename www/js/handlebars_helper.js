/*
http://stackoverflow.com/questions/8853396/logical-operator-in-a-handlebars-js-if-conditional
*/

/*
{{#if (eq template 'thumbs')}}	

{{#if (or 
        (eq section1 "foo")
        (ne section2 "bar"))}}
.. content
{{/if}}
*/

Handlebars.registerHelper({
    eq: function (v1, v2) {
        return v1 === v2;
    },
    ne: function (v1, v2) {
        return v1 !== v2;
    },
    lt: function (v1, v2) {
        return v1 < v2;
    },
    gt: function (v1, v2) {
        return v1 > v2;
    },
    lte: function (v1, v2) {
        return v1 <= v2;
    },
    gte: function (v1, v2) {
        return v1 >= v2;
    },
    and: function (v1, v2) {
        return v1 && v2;
    },
    or: function (v1, v2) {
        return v1 || v2;
    },
	inArray: function(xArray, xValue){
		return ($.isArray(xArray) && (xArray.indexOf(xValue) != -1));
	}
});

// {{inc @index inc=2}}
Handlebars.registerHelper('inc', function(number, options) {
	if(typeof(number) === 'undefined' || number === null)
		return null;
    // Increment by inc parameter if it exists or just by one
	return number + (options.hash.inc || 1);
});


/*
<div class="input_append">
	{{#xif " this.template == 'thumbs' "}}				
		template thumbs	
	{{/xif}}
	
	{{#xif " this.template == 'yesno' "}}				
		template yesno	
	{{/xif}}
</div>

 {{#xif " name == 'Sam' && age === '12' " }}
   BOOM
 {{else}}
   BAMM
 {{/xif}}
*/

Handlebars.registerHelper("xif", function (expression, options) {
	return Handlebars.helpers["x"].apply(this, [expression, options]) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper("x", function (expression, options) {
	var fn = function(){}, result;

	// in a try block in case the expression have invalid javascript
	try {
		// create a new function using Function.apply, notice the capital F in Function
		fn = Function.apply(
			this,
			[
				'window', // or add more '_this, window, a, b' you can add more params if you have references for them when you call fn(window, a, b, c);
				'return ' + expression + ';' // edit that if you know what you're doing
			]
		);
	} catch (e) {
		console.warn('[warning] {{x ' + expression + '}} is invalid javascript', e);
	}

	// then let's execute this new function, and pass it window, like we promised
	// so you can actually use window in your expression
	// i.e expression ==> 'window.config.userLimit + 10 - 5 + 2 - user.count' //
	// or whatever
	try {
		// if you have created the function with more params
		// that would like fn(window, a, b, c)
		result = fn.call(this, window);
	} catch (e) {
		console.warn('[warning] {{x ' + expression + '}} runtime error', e);
	}
	// return the output of that result, or undefined if some error occured
	return result;
});
