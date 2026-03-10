const { describe, it } = require('node:test');
const assert = require('node:assert');
const { hello } = require('./hello');

describe('hello', () => {
  it('should return a greeting with the given name', () => {
    const result = hello('Tung');
    assert.strictEqual(result, 'Hello, Tung');
  });
});
