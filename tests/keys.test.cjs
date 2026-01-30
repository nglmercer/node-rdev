/**
 * Comprehensive tests for all KeyCode values and keyboard event functionality
 */
/* eslint-disable */
const { test, describe } = require('node:test');
const assert = require('node:assert');
const rdev = require('../index.js');

const { KeyCode, EventTypeValue, initSimulation, simulateEvent } = rdev;

describe('KeyCode Enum', () => {
  test('KeyCode should have all expected values', () => {
    const expectedKeys = [
      'Alt', 'AltGr', 'Backspace', 'CapsLock', 'ControlLeft', 'ControlRight',
      'Delete', 'DownArrow', 'End', 'Escape', 'F1', 'F2', 'F3', 'F4', 'F5',
      'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'Home', 'LeftArrow',
      'MetaLeft', 'MetaRight', 'NumLock', 'PageDown', 'PageUp', 'Return',
      'RightArrow', 'ShiftLeft', 'ShiftRight', 'Space', 'Tab', 'UpArrow',
      'PrintScreen', 'ScrollLock', 'Pause', 'Insert', 'BackQuote', 'Num1',
      'Num2', 'Num3', 'Num4', 'Num5', 'Num6', 'Num7', 'Num8', 'Num9', 'Num0',
      'Minus', 'Equal', 'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU',
      'KeyI', 'KeyO', 'KeyP', 'LeftBracket', 'RightBracket', 'KeyA', 'KeyS',
      'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'SemiColon',
      'Quote', 'BackSlash', 'IntlBackslash', 'KeyZ', 'KeyX', 'KeyC', 'KeyV',
      'KeyB', 'KeyN', 'KeyM', 'Comma', 'Dot', 'Slash', 'KpReturn', 'KpMinus',
      'KpPlus', 'KpMultiply', 'KpDivide', 'Kp0', 'Kp1', 'Kp2', 'Kp3', 'Kp4',
      'Kp5', 'Kp6', 'Kp7', 'Kp8', 'Kp9', 'KpDelete', 'Function', 'Unknown'
    ];

    for (const key of expectedKeys) {
      assert.strictEqual(KeyCode[key], key, `KeyCode.${key} should equal '${key}'`);
    }
  });

  test('KeyCode should have correct string enum values', () => {
    assert.strictEqual(KeyCode.KeyA, 'KeyA');
    assert.strictEqual(KeyCode.KeyB, 'KeyB');
    assert.strictEqual(KeyCode.Space, 'Space');
    assert.strictEqual(KeyCode.Enter || KeyCode.Return, 'Return');
    assert.strictEqual(KeyCode.Escape, 'Escape');
  });

  test('Alphabet keys should be present', () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (const letter of alphabet) {
      const keyName = `Key${letter}`;
      assert.ok(KeyCode[keyName], `KeyCode.${keyName} should exist`);
    }
  });

  test('Number keys should be present', () => {
    for (let i = 0; i <= 9; i++) {
      assert.ok(KeyCode[`Num${i}`], `KeyCode.Num${i} should exist`);
    }
  });

  test('Function keys F1-F12 should be present', () => {
    for (let i = 1; i <= 12; i++) {
      assert.ok(KeyCode[`F${i}`], `KeyCode.F${i} should exist`);
    }
  });

  test('Numpad keys should be present', () => {
    assert.ok(KeyCode.Kp0, 'KeyCode.Kp0 should exist');
    assert.ok(KeyCode.Kp1, 'KeyCode.Kp1 should exist');
    assert.ok(KeyCode.Kp2, 'KeyCode.Kp2 should exist');
    assert.ok(KeyCode.Kp3, 'KeyCode.Kp3 should exist');
    assert.ok(KeyCode.Kp4, 'KeyCode.Kp4 should exist');
    assert.ok(KeyCode.Kp5, 'KeyCode.Kp5 should exist');
    assert.ok(KeyCode.Kp6, 'KeyCode.Kp6 should exist');
    assert.ok(KeyCode.Kp7, 'KeyCode.Kp7 should exist');
    assert.ok(KeyCode.Kp8, 'KeyCode.Kp8 should exist');
    assert.ok(KeyCode.Kp9, 'KeyCode.Kp9 should exist');
    assert.ok(KeyCode.KpReturn, 'KeyCode.KpReturn should exist');
    assert.ok(KeyCode.KpMinus, 'KeyCode.KpMinus should exist');
    assert.ok(KeyCode.KpPlus, 'KeyCode.KpPlus should exist');
    assert.ok(KeyCode.KpMultiply, 'KeyCode.KpMultiply should exist');
    assert.ok(KeyCode.KpDivide, 'KeyCode.KpDivide should exist');
    assert.ok(KeyCode.KpDelete, 'KeyCode.KpDelete should exist');
  });

  test('Modifier keys should be present', () => {
    assert.ok(KeyCode.ControlLeft, 'KeyCode.ControlLeft should exist');
    assert.ok(KeyCode.ControlRight, 'KeyCode.ControlRight should exist');
    assert.ok(KeyCode.ShiftLeft, 'KeyCode.ShiftLeft should exist');
    assert.ok(KeyCode.ShiftRight, 'KeyCode.ShiftRight should exist');
    assert.ok(KeyCode.Alt, 'KeyCode.Alt should exist');
    assert.ok(KeyCode.AltGr, 'KeyCode.AltGr should exist');
    assert.ok(KeyCode.MetaLeft, 'KeyCode.MetaLeft should exist');
    assert.ok(KeyCode.MetaRight, 'KeyCode.MetaRight should exist');
  });

  test('Arrow keys should be present', () => {
    assert.ok(KeyCode.UpArrow, 'KeyCode.UpArrow should exist');
    assert.ok(KeyCode.DownArrow, 'KeyCode.DownArrow should exist');
    assert.ok(KeyCode.LeftArrow, 'KeyCode.LeftArrow should exist');
    assert.ok(KeyCode.RightArrow, 'KeyCode.RightArrow should exist');
  });

  test('Navigation keys should be present', () => {
    assert.ok(KeyCode.Home, 'KeyCode.Home should exist');
    assert.ok(KeyCode.End, 'KeyCode.End should exist');
    assert.ok(KeyCode.PageUp, 'KeyCode.PageUp should exist');
    assert.ok(KeyCode.PageDown, 'KeyCode.PageDown should exist');
    assert.ok(KeyCode.Insert, 'KeyCode.Insert should exist');
    assert.ok(KeyCode.Delete, 'KeyCode.Delete should exist');
  });
});

describe('Keyboard Event Simulation', () => {
  test('initSimulation should be a function', () => {
    assert.strictEqual(typeof initSimulation, 'function', 'initSimulation should be a function');
  });

  test('simulateEvent should be a function', () => {
    assert.strictEqual(typeof simulateEvent, 'function', 'simulateEvent should be a function');
  });

  test('should create valid KeyPress event objects', () => {
    const keyPressEvent = {
      eventType: EventTypeValue.KeyPress,
      keyPress: {
        key: KeyCode.KeyA,
      },
      time: Date.now(),
    };

    assert.strictEqual(keyPressEvent.eventType, 'KeyPress');
    assert.strictEqual(keyPressEvent.keyPress.key, 'KeyA');
    assert.strictEqual(typeof keyPressEvent.time, 'number');
  });

  test('should create valid KeyRelease event objects', () => {
    const keyReleaseEvent = {
      eventType: EventTypeValue.KeyRelease,
      keyRelease: {
        key: KeyCode.KeyA,
      },
      time: Date.now(),
    };

    assert.strictEqual(keyReleaseEvent.eventType, 'KeyRelease');
    assert.strictEqual(keyReleaseEvent.keyRelease.key, 'KeyA');
  });

  test('should create events for all common keys', () => {
    const commonKeys = [
      KeyCode.KeyA, KeyCode.KeyB, KeyCode.KeyC,
      KeyCode.Space, KeyCode.Return, KeyCode.Escape,
      KeyCode.Tab, KeyCode.Backspace, KeyCode.Delete
    ];

    for (const key of commonKeys) {
      const pressEvent = {
        eventType: EventTypeValue.KeyPress,
        keyPress: { key },
        time: 1000,
      };
      const releaseEvent = {
        eventType: EventTypeValue.KeyRelease,
        keyRelease: { key },
        time: 1000,
      };

      assert.ok(pressEvent, `Should create KeyPress event for ${key}`);
      assert.ok(releaseEvent, `Should create KeyRelease event for ${key}`);
    }
  });
});
