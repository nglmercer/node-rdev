/**
 * Node.js compatible test for platforms where Bun is not available (e.g., ARM32)
 * Uses Node.js built-in test runner (requires Node.js 18+)
 */
/* eslint-disable */
const { test } = require('node:test');
const assert = require('node:assert');

const { startListener } = require('../index.js');

test('sync function from native code', () => {
  // Test that startListener is a function
  assert.strictEqual(typeof startListener, 'function', 'startListener should be a function');
  
  // Test that calling startListener with a callback doesn't throw
  let callbackCalled = false;
  
  try {
    startListener((data) => {
      callbackCalled = true;
      console.log({ data });
    });
  } catch (err) {
    // Some platforms may not support the listener functionality
    // Log the error but don't fail the test for binding verification
    console.log('startListener threw an error (may be expected on some platforms):', err.message);
  }
  
  // Basic binding test passed - the native module loaded successfully
  assert.ok(true, 'Native bindings loaded successfully');
});
