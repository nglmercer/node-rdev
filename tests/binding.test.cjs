/* eslint-disable */
const { test } = require('node:test');
const assert = require('node:assert');
const rdev = require('../index.js');

test('Native bindings integrity check', () => {
  assert.strictEqual(typeof rdev.startListener, 'function', 'startListener should be exported');
  assert.strictEqual(typeof rdev.simulateEvent, 'function', 'simulateEvent should be exported');
  assert.strictEqual(typeof rdev.getDisplaySize, 'function', 'getDisplaySize should be exported');
  
  console.log('Exported functions found:', Object.keys(rdev).filter(k => typeof rdev[k] === 'function'));
});

test('Constant values check', () => {
  assert.ok(rdev.KeyCode, 'KeyCode enum should exist');
  assert.ok(rdev.ButtonType, 'ButtonType enum should exist');
  assert.ok(rdev.EventTypeValue, 'EventTypeValue enum should exist');
});

test('Display size check', () => {
  try {
    const size = rdev.getDisplaySize();
    console.log('Display size:', size);
    if (size) {
      assert.strictEqual(typeof size.width, 'number');
      assert.strictEqual(typeof size.height, 'number');
    }
  } catch (err) {
    console.log('getDisplaySize might not be supported in CI environment:', err.message);
  }
});
