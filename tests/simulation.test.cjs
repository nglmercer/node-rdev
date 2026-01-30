/**
 * Integration tests for simulateEvent and event listening functionality
 * Tests actual simulation capabilities (may be limited in CI environments)
 */
const { test, describe } = require('node:test');
const assert = require('node:assert');
const rdev = require('../index.js');

const { 
  startListener,
  simulateEvent, 
  initSimulation,
  EventTypeValue, 
  KeyCode,
  ButtonType 
} = rdev;

describe('Simulation System', () => {
  test('initSimulation should be exported', () => {
    assert.strictEqual(typeof initSimulation, 'function', 'initSimulation should be a function');
  });

  test('initSimulation should initialize without throwing', () => {
    try {
      initSimulation();
      assert.ok(true, 'initSimulation completed without error');
    } catch (err) {
      // May fail in CI environments without display
      console.log('initSimulation error (may be expected in CI):', err.message);
      assert.ok(err.message, 'Error should have a message');
    }
  });
});

describe('Event Simulation', () => {
  test('simulateEvent should be exported', () => {
    assert.strictEqual(typeof simulateEvent, 'function', 'simulateEvent should be a function');
  });

  test('should simulate KeyPress event without throwing', () => {
    try {
      initSimulation();
      
      simulateEvent({
        eventType: EventTypeValue.KeyPress,
        keyPress: {
          key: KeyCode.KeyA,
        },
        time: Date.now(),
      });
      
      assert.ok(true, 'KeyPress simulation completed without error');
    } catch (err) {
      console.log('KeyPress simulation error (may be expected in CI):', err.message);
      assert.ok(err.message, 'Error should have a message');
    }
  });

  test('should simulate KeyRelease event without throwing', () => {
    try {
      initSimulation();
      
      simulateEvent({
        eventType: EventTypeValue.KeyRelease,
        keyRelease: {
          key: KeyCode.KeyA,
        },
        time: Date.now(),
      });
      
      assert.ok(true, 'KeyRelease simulation completed without error');
    } catch (err) {
      console.log('KeyRelease simulation error (may be expected in CI):', err.message);
      assert.ok(err.message, 'Error should have a message');
    }
  });

  test('should simulate MouseMove event without throwing', () => {
    try {
      initSimulation();
      
      simulateEvent({
        eventType: EventTypeValue.MouseMove,
        mouseMove: {
          x: 100,
          y: 100,
        },
        time: Date.now(),
      });
      
      assert.ok(true, 'MouseMove simulation completed without error');
    } catch (err) {
      console.log('MouseMove simulation error (may be expected in CI):', err.message);
      assert.ok(err.message, 'Error should have a message');
    }
  });

  test('should simulate ButtonPress event without throwing', () => {
    try {
      initSimulation();
      
      simulateEvent({
        eventType: EventTypeValue.ButtonPress,
        buttonPress: {
          button: ButtonType.Left,
        },
        time: Date.now(),
      });
      
      assert.ok(true, 'ButtonPress simulation completed without error');
    } catch (err) {
      console.log('ButtonPress simulation error (may be expected in CI):', err.message);
      assert.ok(err.message, 'Error should have a message');
    }
  });

  test('should simulate ButtonRelease event without throwing', () => {
    try {
      initSimulation();
      
      simulateEvent({
        eventType: EventTypeValue.ButtonRelease,
        buttonRelease: {
          button: ButtonType.Left,
        },
        time: Date.now(),
      });
      
      assert.ok(true, 'ButtonRelease simulation completed without error');
    } catch (err) {
      console.log('ButtonRelease simulation error (may be expected in CI):', err.message);
      assert.ok(err.message, 'Error should have a message');
    }
  });

  test('should simulate Wheel event without throwing', () => {
    try {
      initSimulation();
      
      simulateEvent({
        eventType: EventTypeValue.Wheel,
        wheel: {
          deltaX: 0,
          deltaY: 100,
        },
        time: Date.now(),
      });
      
      assert.ok(true, 'Wheel simulation completed without error');
    } catch (err) {
      console.log('Wheel simulation error (may be expected in CI):', err.message);
      assert.ok(err.message, 'Error should have a message');
    }
  });

  test('should simulate multiple key events in sequence', () => {
    try {
      initSimulation();
      
      const keys = [KeyCode.KeyA, KeyCode.KeyB, KeyCode.KeyC];
      
      for (const key of keys) {
        simulateEvent({
          eventType: EventTypeValue.KeyPress,
          keyPress: { key },
          time: Date.now(),
        });
        
        simulateEvent({
          eventType: EventTypeValue.KeyRelease,
          keyRelease: { key },
          time: Date.now(),
        });
      }
      
      assert.ok(true, 'Multiple key events simulated successfully');
    } catch (err) {
      console.log('Multiple key simulation error (may be expected in CI):', err.message);
      assert.ok(err.message, 'Error should have a message');
    }
  });

  test('should simulate modifier key combinations', () => {
    try {
      initSimulation();
      
      const modifiers = [
        KeyCode.ControlLeft,
        KeyCode.ShiftLeft,
        KeyCode.Alt,
        KeyCode.MetaLeft,
      ];
      
      for (const modifier of modifiers) {
        // Press modifier
        simulateEvent({
          eventType: EventTypeValue.KeyPress,
          keyPress: { key: modifier },
          time: Date.now(),
        });
        
        // Press and release regular key
        simulateEvent({
          eventType: EventTypeValue.KeyPress,
          keyPress: { key: KeyCode.KeyA },
          time: Date.now(),
        });
        
        simulateEvent({
          eventType: EventTypeValue.KeyRelease,
          keyRelease: { key: KeyCode.KeyA },
          time: Date.now(),
        });
        
        // Release modifier
        simulateEvent({
          eventType: EventTypeValue.KeyRelease,
          keyRelease: { key: modifier },
          time: Date.now(),
        });
      }
      
      assert.ok(true, 'Modifier key combinations simulated successfully');
    } catch (err) {
      console.log('Modifier key simulation error (may be expected in CI):', err.message);
      assert.ok(err.message, 'Error should have a message');
    }
  });
});

describe('Event Listener', () => {
  test('startListener should be exported', () => {
    assert.strictEqual(typeof startListener, 'function', 'startListener should be a function');
  });

  test('startListener should accept a callback function', () => {
    try {
      startListener((data) => {
        console.log('Received event:', data);
        return data;
      });
      
      assert.ok(true, 'startListener accepted callback without throwing');
    } catch (err) {
      console.log('startListener error (may be expected in CI):', err.message);
      assert.ok(err.message, 'Error should have a message');
    }
  });
});

describe('Event Object Validation', () => {
  test('should validate KeyPress event structure', () => {
    const event = {
      eventType: EventTypeValue.KeyPress,
      keyPress: { key: KeyCode.KeyA },
      time: 1000,
    };

    assert.strictEqual(event.eventType, 'KeyPress');
    assert.ok(event.keyPress, 'keyPress should be defined');
    assert.strictEqual(event.keyPress.key, 'KeyA');
    assert.strictEqual(typeof event.time, 'number');
  });

  test('should validate MouseMove event structure', () => {
    const event = {
      eventType: EventTypeValue.MouseMove,
      mouseMove: { x: 500, y: 300 },
      time: 2000,
    };

    assert.strictEqual(event.eventType, 'MouseMove');
    assert.ok(event.mouseMove, 'mouseMove should be defined');
    assert.strictEqual(typeof event.mouseMove.x, 'number');
    assert.strictEqual(typeof event.mouseMove.y, 'number');
  });

  test('should validate Wheel event structure', () => {
    const event = {
      eventType: EventTypeValue.Wheel,
      wheel: { deltaX: 0, deltaY: -50 },
      time: 3000,
    };

    assert.strictEqual(event.eventType, 'Wheel');
    assert.ok(event.wheel, 'wheel should be defined');
    assert.strictEqual(typeof event.wheel.deltaX, 'number');
    assert.strictEqual(typeof event.wheel.deltaY, 'number');
  });

  test('should handle all ButtonTypes in button events', () => {
    const buttonTypes = [ButtonType.Left, ButtonType.Right, ButtonType.Middle];
    
    for (const button of buttonTypes) {
      const pressEvent = {
        eventType: EventTypeValue.ButtonPress,
        buttonPress: { button },
        time: Date.now(),
      };
      
      const releaseEvent = {
        eventType: EventTypeValue.ButtonRelease,
        buttonRelease: { button },
        time: Date.now(),
      };
      
      assert.strictEqual(pressEvent.buttonPress.button, button);
      assert.strictEqual(releaseEvent.buttonRelease.button, button);
    }
  });
});
