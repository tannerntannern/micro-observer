/**
 * Describes the shape of the ChangeReports that are passed to Validators.
 */
export type ChangeReport = {
	target: any,
	path: string,
	property: string
} & (
	{
		type: 'set-prop' | 'delete-prop',
		newValue: any
	} | {
		type: 'function-call'
		function: string,
		arguments: any[]
	}
);

/**
 * Describes the format of a Validator.  Each one must accept a ChangeReport and return whether or not the change should
 * be accepted.
 */
export type Validator = (change: ChangeReport) => boolean;

/**
 * Simple utility function to add a new property to an existing object path.  Examples:
 *
 * - getPath('obj.nested', 'prop') => 'obj.nested.prop'
 * - getPath('', 'prop') => 'prop'
 */
function getPath(path, prop) {
	if (path.length !== 0) return `${path}.${prop}`;
	else return prop;
}

/**
 * Provides simple way to "proxify" nested objects and validate the changes.
 */
export let Observer = (function(){
	function _create(target, validator: Validator, path: string, lastInPath: string) {
		// Keeps track of the proxies we've already made so that we don't have to recreate any.
		let proxies: {[prop: string]: any} = {};

		let proxyHandler = {
			get: function get(target, prop) {
				// Special properties
				if (prop === '__target') return target;
				if (prop === '__isProxy') return true;

				// Cache target[prop] for performance
				let value = target[prop];

				// Functions
				if (typeof value === 'function') {
					return function(...args) {
						if (validator({
							path: path,
							property: lastInPath,
							target: target,
							type: 'function-call',
							function: prop,
							arguments: args
						})){
							// If `this` is a proxy, be sure to apply to __target instead
							return value.apply(this.__isProxy ? this.__target : this, args);
						}
					};
				}

				// Objects
				else if (typeof value === 'object' && value !== null && target.hasOwnProperty(prop)) {
					// Return existing proxy if we have one, otherwise create a new one
					let existingProxy = proxies[prop];
					if (existingProxy && existingProxy.__target === value){
						return existingProxy;
					} else {
						let proxy = _create(value, validator, getPath(path, prop), prop);
						proxies[prop] = proxy;
						return proxy;
					}
				}

				// All else
				else {
					return value;
				}
			},
			set: function set(target, prop, value) {
				if (validator({
					path: getPath(path, prop),
					target: target,
					type: 'set-prop',
					property: prop,
					newValue: value
				})){
					target[prop] = value;
				}

				return true;
			},
			deleteProperty: function deleteProperty(target, prop) {
				if (validator({
					path: getPath(path, prop),
					target: target,
					type: 'delete-prop',
					property: prop,
					newValue: null
				})){
					delete target[prop];
				}

				return true;
			}
		};

		return new Proxy(target, <any>proxyHandler);
	}

	return {
		create: function create(target, validator: Validator) {
			return _create(target, validator, '', '');
		}
	};
})();
