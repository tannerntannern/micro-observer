import 'mocha';
import {expect} from 'chai';
import {ChangeReport, Observer} from "../src/observer";

describe('Observer', function(){
	describe('get functionality', function(){
		let data = {
			prop1: 1,
			prop2: 2,
			array: [1, 2, 3],
			nested: {
				prop1: 3,
				prop2: 4,
				array: [4, 5, 6],
				nested: {
					prop1: 5,
					prop2: 6,
					array: [7, 8, 9]
				}
			}
		};

		let change,
			proxy = Observer.create(data, c => {change = c; return false});

		it('should handle properties on the base object', function(){
			expect(proxy.prop1).to.equal(1);
			expect(proxy.prop2).to.equal(2);
			expect(proxy.array).to.deep.equal([1, 2, 3]);
		});

		it('should handle properties on a nested object', function(){
			expect(proxy.nested.prop1).to.equal(3);
			expect(proxy.nested.prop2).to.equal(4);
			expect(proxy.nested.array).to.deep.equal([4, 5, 6]);
		});

		it('should handle properties on even deeper nesting', function(){
			expect(proxy.nested.nested.prop1).to.equal(5);
			expect(proxy.nested.nested.prop2).to.equal(6);
			expect(proxy.nested.nested.array).to.deep.equal([7, 8, 9]);
		});

		it('should handle undefined properties', function(){
			expect(proxy.propertyThatDefinitelyDoesntExist).to.equal(undefined);
		});

		it('should not report a change for simply getting a property', function(){
			change = null;
			let test = proxy.nested.prop1;

			expect(change).to.equal(null);
		});
	});

	describe('validator functionality', function(){
		let data = {
			prop: 'value',
			array: [1, 2],
			nested: {
				prop: 'nested value'
			}
		};

		it('should not allow changes to go through when the validator returns false', function(){
			let proxy = Observer.create(data, (change) => { return false });

			proxy.prop = 'new value';
			expect(proxy.prop).to.equal('value');

			delete proxy.nested.prop;
			expect(proxy.nested).to.deep.equal({prop: 'nested value'});

			proxy.array.push(3);
			expect(proxy.array).to.deep.equal([1, 2]);
		});

		it('should allow changes to go through when the validator returns true', function(){
			let proxy = Observer.create(data, (change) => { return true });

			proxy.prop = 'new value';
			expect(proxy.prop).to.equal('new value');

			delete proxy.nested.prop;
			expect(proxy.nested).to.deep.equal({});

			proxy.array.push(3);
			expect(proxy.array).to.deep.equal([1, 2, 3]);
		});
	});

	describe('change reporting functionality', function(){
		let data: any = {
			prop: 'value',
			array: [1, 2, {
				prop: 'value'
			}],
			nested1: {
				prop: 'value'
			},
			nested2: {
				prop: 'value',
				doubleNested: {
					prop: 'value',
					array: [1, 2, 3]
				}
			}
		};

		let change,
			proxy = Observer.create(data, c => { change = c; return false; });

		describe('path reporting', function(){
			it('should handle plain props', function(){
				proxy.prop = 1;
				expect(change.path).to.equal('prop');
				expect(change.property).to.equal('prop');
			});

			it('should handle nested props', function(){
				proxy.nested1.prop = 1;
				expect(change.path).to.equal('nested1.prop');
				expect(change.property).to.equal('prop');
			});

			it('should handle props within an array', function(){
				proxy.array[2] = 1;
				expect(change.path).to.equal('array.2');
				expect(change.property).to.equal('2');
			});

			it('should handle double nested props', function(){
				proxy.nested2.doubleNested.prop = 1;
				expect(change.path).to.equal('nested2.doubleNested.prop');
				expect(change.property).to.equal('prop');
			});

			it('should handle props in objects in arrays', function(){
				proxy.array[2].prop = 1;
				expect(change.path).to.equal('array.2.prop');
				expect(change.property).to.equal('prop');
			});

			it('should handle arrays in any amount of nesting', function(){
				proxy.nested2.doubleNested.array[0] = 1;
				expect(change.path).to.equal('nested2.doubleNested.array.0');
				expect(change.property).to.equal('0');
			});
		});

		describe('type and value reporting', function(){
			it('should handle setting properties', function(){
				proxy.prop = 'new val';
				expect(change.type).to.equal('set-prop');
				expect(change.newValue).to.equal('new val');

				proxy.newProp = 'entirely new val';
				expect(change.type).to.equal('set-prop');
				expect(change.newValue).to.equal('entirely new val');
			});

			it('should handle deleting properties', function(){
				delete proxy.prop;
				expect(change.type).to.equal('delete-prop');
				expect(change.property).to.equal('prop');
				expect(change.newValue).to.equal(null);

				delete proxy.nested1;
				expect(change.type).to.equal('delete-prop');
				expect(change.property).to.equal('nested1');
				expect(change.newValue).to.equal(null);
			});

			it('should handle function calls', function(){
				proxy.array.push(4);
				expect(change.type).to.equal('function-call');
				expect(change.function).to.equal('push');
				expect(change.arguments).to.deep.equal([4]);

				proxy.array.splice(2, 1, 3);
				expect(change.type).to.equal('function-call');
				expect(change.function).to.equal('splice');
				expect(change.arguments).to.deep.equal([2, 1, 3]);
			});
		});

		describe('target reporting', function(){
			it('should properly report the target for set and delete operations', function(){
				proxy.prop = 3;
				expect(change.target).to.equal(data);

				delete proxy.nested2.doubleNested.prop;
				expect(change.target).to.equal(data.nested2.doubleNested);
			});

			it('should properly report the target for function operations', function(){
				proxy.array.push(4);
				expect(change.target).to.equal(data.array);
			});

			it('should not apply functions to proxies, but rather to their targets', function(){
				// TODO: figure out how to reliably test this
			});
		});
	});

	describe('overwriting nested objects', function(){
		let data = {
			prop: 'value',
			nested: {
				doubleNested: {
					prop: 'value'
				}
			}
		};

		let proxy = Observer.create(data, change => true);

		it('should not retain old proxies/targets that are overwritten', function(){
			expect(proxy.nested.doubleNested.prop).to.equal('value');

			proxy.nested.doubleNested = {newProp: 'new value'};

			expect(proxy.nested.doubleNested.prop).to.equal(undefined);
			expect(proxy.nested.doubleNested).to.deep.equal({newProp: 'new value'});
		});
	});
});