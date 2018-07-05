# 🔎 micro-observer
[![Build Status](https://travis-ci.org/tannerntannern/micro-observer.svg?branch=master)](https://travis-ci.org/tannerntannern/micro-observer)
[![Coverage Status](https://coveralls.io/repos/github/tannerntannern/micro-observer/badge.svg?branch=master)](https://coveralls.io/github/tannerntannern/micro-observer?branch=master)
[![dependencies Status](https://david-dm.org/tannerntannern/micro-observer/status.svg)](https://david-dm.org/tannerntannern/micro-observer)

**micro-observer** is a micro-library for TypeScript and/or JavaScript that allows you to
easily observe and validate changes on nested objects using
[ES6 Proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy).

The primary goal of this library is to intercept and report the changes that occur on a
nested data structure in a clear and concise manner.  In many ways, it is essentially a
"nested proxy", but the goal is not necessarily to emulate the Proxy API in its entirety.

## Example
Creating a nested proxy in TypeScript:
```typescript
// Importing ChangeReport is optional -- it just allows your IDE to provide useful hints
import {Observer, ChangeReport} from 'micro-observer';

let data = {
	list: [1, 2, 3],
	nested: {
		prop: 'value'
	}
};

let proxy = Observer.create(data, function(change: ChangeReport): boolean {
	// Simply output the change report
	console.log(change);	

	// Return true to let the proxy know that the change should be accepted for this example
	// However, we could accept or reject this change depending on the contents of change if we want
	return true;
});
```

Or in JavaScript:
```javascript
let Observer = require('micro-observer').Observer;

let data = {
	list: [1, 2, 3],
	nested: {
		prop: 'value'
	}
};

let proxy = Observer.create(data, function(change) {
	// Simply output the change report
	console.log(change);

	// Return true to let the proxy know that the change should be accepted for this example
	// However, we could accept or reject this change depending on the contents of change if we want
	return true;
});
```

Making changes and viewing the reports
```javascript
proxy.nested.prop = 'new value';
// {type: 'set-prop', path: 'nested.prop', property: 'prop', newValue: 'new value', target: {prop: 'value'}}

proxy.list.push(4);
// {type: 'function-call', path: 'list', property: 'list', function: 'push', arguments: [4], target: [1, 2, 3]}
```

## Installation
In the browser:
```html
<script src="observer.min.js"></script>
```

or with npm:
```
$ npm install --save micro-observer
```

## API
Coming soon...

## Contributing
Contributions are always welcome, just be sure to run `npm run lint` and `npm run test` before
submitting a pull request.

## Author
Tanner Nielsen