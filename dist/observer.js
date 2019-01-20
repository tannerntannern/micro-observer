"use strict";
if (typeof exports === "undefined"){var exports = window;} Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Simple utility function to add a new property to an existing object path.  Examples:
 *
 * - getPath('obj.nested', 'prop') => 'obj.nested.prop'
 * - getPath('', 'prop') => 'prop'
 */
function getPath(path, prop) {
    if (path.length !== 0)
        return path + "." + prop;
    else
        return prop;
}
/**
 * Provides simple way to "proxify" nested objects and validate the changes.
 */
exports.Observer = (function () {
    function _create(target, validator, path, lastInPath) {
        // Keeps track of the proxies we've already made so that we don't have to recreate any.
        var proxies = {};
        var proxyHandler = {
            get: function get(target, prop) {
                // Special properties
                if (prop === '__target')
                    return target;
                if (prop === '__isProxy')
                    return true;
                // Cache target[prop] for performance
                var value = target[prop];
                // Functions
                if (typeof value === 'function') {
                    return function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        if (validator({
                            path: path,
                            property: lastInPath,
                            target: target,
                            type: 'function-call',
                            function: prop,
                            arguments: args
                        })) {
                            // If `this` is a proxy, be sure to apply to __target instead
                            return value.apply(this.__isProxy ? this.__target : this, args);
                        }
                    };
                }
                // Objects
                else if (typeof value === 'object' && value !== null && target.hasOwnProperty(prop)) {
                    // Return existing proxy if we have one, otherwise create a new one
                    var existingProxy = proxies[prop];
                    if (existingProxy && existingProxy.__target === value) {
                        return existingProxy;
                    }
                    else {
                        var proxy = _create(value, validator, getPath(path, prop), prop);
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
                })) {
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
                })) {
                    delete target[prop];
                }
                return true;
            }
        };
        return new Proxy(target, proxyHandler);
    }
    return {
        create: function create(target, validator) {
            return _create(target, validator, '', '');
        }
    };
})();
