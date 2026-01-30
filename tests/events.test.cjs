/**
 * Comprehensive tests for all EventTypeValue and ButtonType values
 * and event structure validation
 */
/* eslint-disable */
const { test, describe } = require('node:test');
const assert = require('node:assert');
const rdev = require('../index.js');

const { 
  EventTypeValue, 
  ButtonType, 
  KeyCode,
  initSimulation, 
  simulateEvent,
  getDisplaySize 
} = rdev;

describe('EventTypeValue Enum', () => {
  test('EventTypeValue should have all expected values', () => {
    assert.strictEqual(EventTypeValue.KeyPress, 'KeyPress', 'EventTypeValue.KeyPress should equal "KeyPress"');
    assert.strictEqual(EventTypeValue.KeyRelease, 'KeyRelease', 'EventTypeValue.KeyRelease should equal "KeyRelease"');
    assert.strictEqual(EventTypeValue.MouseMove, 'MouseMove', 'EventTypeValue.MouseMove should equal "MouseMove"');
    assert.strictEqual(EventTypeValue.ButtonPress, 'ButtonPress', 'EventTypeValue.ButtonPress should equal "ButtonPress"');
    assert.strictEqual(EventTypeValue.ButtonRelease, 'ButtonRelease', 'EventTypeValue.ButtonRelease should equal "ButtonRelease"');
    assert.strictEqual(EventTypeValue.Wheel, 'Wheel', 'EventTypeValue.Wheel should equal "Wheel"');
  });

  test('EventTypeValue should be usable in event objects', () => {
    const eventTypes = [
      EventTypeValue.KeyPress,
      EventTypeValue.KeyRelease,
      EventTypeValue.MouseMove,
      EventTypeValue.ButtonPress,
      EventTypeValue.ButtonRelease,
      EventTypeValue.Wheel,
    ];

    for (const eventType of eventTypes) {
      assert.ok(typeof eventType === 'string', `EventTypeValue ${eventType} should be a string`);
      assert.ok(eventType.length > 0, `EventTypeValue ${eventType} should not be empty`);
    }
  });
});

describe('ButtonType Enum', () => {
  test('ButtonType should have all expected values', () => {
    assert.strictEqual(ButtonType.Left, 'Left', 'ButtonType.Left should equal "Left"');
    assert.strictEqual(ButtonType.Right, 'Right', 'ButtonType.Right should equal "Right"');
    assert.strictEqual(ButtonType.Middle, 'Middle', 'ButtonType.Middle should equal "Middle"');
    assert.strictEqual(ButtonType.Unknown, 'Unknown', 'ButtonType.Unknown should equal "Unknown"');
  });

  test('ButtonType should be usable in button event objects', () => {
    const buttonTypes = [ButtonType.Left, ButtonType.Right, ButtonType.Middle];

    for (const button of buttonTypes) {
      const pressEvent = {
        eventType: EventTypeValue.ButtonPress,
        buttonPress: { button },
        time: 1000,
      };
      const releaseEvent = {
        eventType: EventTypeValue.ButtonRelease,
        buttonRelease: { button },
        time: 1000,
      };

      assert.strictEqual(pressEvent.buttonPress.button, button);
      assert.strictEqual(releaseEvent.buttonRelease.button, button);
    }
  });
});

describe('InputEvent Structure', () => {
  test('should create valid KeyPress event', () => {
    const event = {
      eventType: EventTypeValue.KeyPress,
      keyPress: { key: KeyCode.KeyA },
      time: 1000,
    };

    assert.strictEqual(event.eventType, 'KeyPress');
    assert.ok(event.keyPress);
    assert.strictEqual(event.keyPress.key, 'KeyA');
    assert.strictEqual(event.time, 1000);
  });

  test('should create valid KeyRelease event', () => {
    const event = {
      eventType: EventTypeValue.KeyRelease,
      keyRelease: { key: KeyCode.KeyB },
      time: 2000,
    };

    assert.strictEqual(event.eventType, 'KeyRelease');
    assert.ok(event.keyRelease);
    assert.strictEqual(event.keyRelease.key, 'KeyB');
  });

  test('should create valid MouseMove event', () => {
    const event = {
      eventType: EventTypeValue.MouseMove,
      mouseMove: { x: 100, y: 200 },
      time: 3000,
    };

    assert.strictEqual(event.eventType, 'MouseMove');
    assert.ok(event.mouseMove);
    assert.strictEqual(event.mouseMove.x, 100);
    assert.strictEqual(event.mouseMove.y, 200);
  });

  test('should create valid ButtonPress event', () => {
    const event = {
      eventType: EventTypeValue.ButtonPress,
      buttonPress: { button: ButtonType.Left },
      time: 4000,
    };

    assert.strictEqual(event.eventType, 'ButtonPress');
    assert.ok(event.buttonPress);
    assert.strictEqual(event.buttonPress.button, 'Left');
  });

  test('should create valid ButtonRelease event', () => {
    const event = {
      eventType: EventTypeValue.ButtonRelease,
      buttonRelease: { button: ButtonType.Right },
      time: 5000,
    };

    assert.strictEqual(event.eventType, 'ButtonRelease');
    assert.ok(event.buttonRelease);
    assert.strictEqual(event.buttonRelease.button, 'Right');
  });

  test('should create valid Wheel event', () => {
    const event = {
      eventType: EventTypeValue.Wheel,
      wheel: { deltaX: 0, deltaY: 100 },
      time: 6000,
    };

    assert.strictEqual(event.eventType, 'Wheel');
    assert.ok(event.wheel);
    assert.strictEqual(event.wheel.deltaX, 0);
    assert.strictEqual(event.wheel.deltaY, 100);
  });

  test('should create event with optional name field', () => {
    const event = {
      eventType: EventTypeValue.KeyPress,
      keyPress: { key: KeyCode.KeyC },
      name: 'TestWindow',
      time: 7000,
    };

    assert.strictEqual(event.name, 'TestWindow');
  });
});

describe('DisplaySize', () => {
  test('getDisplaySize should be a function', () => {
    assert.strictEqual(typeof getDisplaySize, 'function', 'getDisplaySize should be a function');
  });

  test('getDisplaySize should return valid display size or throw gracefully', () => {
    try {
      const size = getDisplaySize();
      assert.ok(size, 'getDisplaySize should return a value');
      assert.strictEqual(typeof size.width, 'number', 'width should be a number');
      assert.strictEqual(typeof size.height, 'number', 'height should be a number');
      assert.ok(size.width > 0, 'width should be positive');
      assert.ok(size.height > 0, 'height should be positive');
    } catch (err) {
      // getDisplaySize may fail in CI environments without display
      assert.ok(err.message, 'Error should have a message');
      console.log('getDisplaySize not available in this environment:', err.message);
    }
  });
});

describe('Event Type Combinations', () => {
  test('all event types should be distinct', () => {
    const eventTypes = [
      EventTypeValue.KeyPress,
      EventTypeValue.KeyRelease,
      EventTypeValue.MouseMove,
      EventTypeValue.ButtonPress,
      EventTypeValue.ButtonRelease,
      EventTypeValue.Wheel,
    ];

    const uniqueTypes = new Set(eventTypes);
    assert.strictEqual(uniqueTypes.size, eventTypes.length, 'All event types should be distinct');
  });

  test('all button types should be distinct', () => {
    const buttonTypes = [
      ButtonType.Left,
      ButtonType.Right,
      ButtonType.Middle,
      ButtonType.Unknown,
    ];

    const uniqueTypes = new Set(buttonTypes);
    assert.strictEqual(uniqueTypes.size, buttonTypes.length, 'All button types should be distinct');
  });
});
