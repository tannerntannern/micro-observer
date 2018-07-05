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

## Installation
```
$ npm install --save micro-observer
```

## Example
Creating a nested proxy in TypeScript:
```typescript
// Importing ChangeReport is optional -- it just allows your IDE to provide useful hints
import {Observer, ChangeReport} from 'micro-observer';

let data = {list: [1, 2, 3], nested: {prop: 'value'}};

let proxy = Observer.create(data, change: ChangeReport => {
	console.log(change);
	return true;
});
```

Or in JavaScript:
```javascript
let Observer = require('micro-observer').Observer;

let data = {list: [1, 2, 3], nested: {prop: 'value'}};

let proxy = Observer.create(data, function(change) {
	console.log(change);
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

## API
The **micro-observer** API is very simple, as only one function is exported:

### Observable.create(data, validator)
Creates a "nested proxy" to observe the given data.  Every modification that is attempted
through the proxy is summarized as a **ChangeReport** (explained in greater detail below)
and passed to the validator to determine if it should be accepted.
* Parameters
	* **data** (object) - a nested object that you'd like to observe behind a proxy
	* **validator** (function) - a function that receives a single ChangeReport, and returns whether or not the change
		should be accepted.  Note that if false is returned, the change will silently be ignored.

### ChangeReport
An object that describes a change made somewhere within the data.  (Note that this is
merely a TypeScript type definition, so it is not instantiatable.)
Each one features the following properties:
* **type** (string) - either "set-prop", "delete-prop", or "function-call"
* **path** (string) - a "." delimited path relative to the root of the data
* **property** (string) - the thing being modified; the last item in the path
* **newValue** (any) - If type is "set-prop", this is the value it is being set to
* **function** (string) - If type is "function-call", this is the name of the function being called
* **arguments** (array) - If type is "function-call", this is the array of arguments that were passed
* **target** (object) - The object within your data to which the change is being directly applied
* ****

## More Examples
```javascript
let data = {
	someProp: 'value',
	unprotectedProp: 'value',
	$protectedProp: 'protected value',
	nested: {
		someProp: 'value',
		objects: [
			{name: 'Bob', age: 40}, {name: 'Mike', age: 28}
		],
		nested: {
			prop1: 1,
			prop2: 2
		}
	}
};

let proxy = Observer.create(data, function(change){
	console.log(change);

	// Protect properties that start with '$'
	if (change.property.startsWith('$')) return false;
	else return true;
});

proxy.someProp = 'new val';
// {type: 'set-prop', path: 'someProp', property: 'someProp', newValue: 'new val', target: {someProp: 'value', unprotectedProp: ...}}

delete proxy.unprotectedProp;
// {type: 'delete-prop', path: 'unprotectedProp', property: 'unprotectedProp', target: {someProp: 'new val', unprotectedProp: ...}}

console.log(proxy.unprotectedProp);
// undefined

delete proxy.$protectedProp;
// {type: 'delete-prop', path: '$unprotectedProp', property: '$unprotectedProp', target: {someProp: 'new val', $protectedProp: ...}}

console.log(proxy.$protectedProp);
// 'protected value'

proxy.nested.someProp = 'NEW val';
// {type: 'set-prop', path: 'nested.someProp', property: 'someProp', newValue: 'NEW val', target: {someProp: 'value', objects: [...], ...}}

proxy.nested.objects.push({name: 'Mitch', age: 54});
// {type: 'function-call', path: 'nested.objects', property: 'objects', function: 'push', arguments: [{name: 'Mitch', age: 54}], target: [{name: 'Bob', age: 45}, ...]}

proxy.nested.nested.prop3 = 3;
// {type: 'set-prop', path: 'nested.nested.prop3', property: 'prop3', newValue: 3, target: {prop1: 1, prop2: 2}}
```

## Contributing
Contributions are always welcome!  Just be sure to run `npm run lint` and `npm run test` before submitting a pull
request.

## Author
Tanner Nielsen © 2018

[http://tannernielsen.com](http://tannernielsen.com)