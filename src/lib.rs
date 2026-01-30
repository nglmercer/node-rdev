#![deny(clippy::all)]

pub mod conversions;
pub mod enums;
pub mod events;

use napi::bindgen_prelude::Function;
use napi::threadsafe_function::ThreadsafeFunctionCallMode;
use napi::Result;
use napi_derive::napi;
use once_cell::sync::Lazy;
use rdev::listen;
use std::sync::Mutex;

// Re-export the main types for easier access
pub use enums::{ButtonType, EventTypeValue, KeyCode, NormalizedModifier};
pub use events::{
  ButtonPressEvent, ButtonReleaseEvent, DisplaySize, InputEvent, KeyPressEvent, KeyReleaseEvent,
  MouseMoveEvent, WheelEvent,
};

// Re-export utility functions for modifier/key handling
pub use conversions::{is_modifier_key, normalize_key_name, string_key_to_keycode};

// Global display manager for X11 - keeps display open for simulation
static DISPLAY_MANAGER: Lazy<Mutex<Option<DisplayManager>>> = Lazy::new(|| Mutex::new(None));

/// Manages X11 display connection for event simulation
pub struct DisplayManager {
  // On Linux/X11, we need to keep the display open for simulation to work
  // The display pointer is stored here to keep it alive
  _display_ptr: usize, // Just a placeholder - rdev handles display internally
}

impl DisplayManager {
  pub fn new() -> Result<Self> {
    // Initialize by calling display_size which opens/closes a display
    // This ensures X11 is properly initialized
    rdev::display_size()
      .map_err(|e| napi::Error::from_reason(format!("Failed to initialize display: {:?}", e)))?;

    Ok(DisplayManager { _display_ptr: 0 })
  }
}

/// Initialize the rdev simulation system. Call this once before using simulate_event.
#[napi]
pub fn init_simulation() -> Result<()> {
  let mut manager = DISPLAY_MANAGER
    .lock()
    .map_err(|e| napi::Error::from_reason(format!("Failed to lock display manager: {:?}", e)))?;

  if manager.is_none() {
    *manager = Some(DisplayManager::new()?);
  }

  Ok(())
}

/// Get the size of the main display
#[napi]
pub fn get_display_size() -> Result<DisplaySize> {
  let (width, height) = rdev::display_size()
    .map_err(|e| napi::Error::from_reason(format!("Failed to get display size: {:?}", e)))?;
  Ok(DisplaySize {
    width: width as f64,
    height: height as f64,
  })
}

/// Start listening for input events
#[napi]
pub fn start_listener(callback: Function<InputEvent, InputEvent>) -> Result<()> {
  let tsfn = callback.build_threadsafe_function().build()?;

  std::thread::spawn(move || {
    if let Err(error) = listen(move |event| {
      let event: InputEvent = event.into();
      tsfn.call(event, ThreadsafeFunctionCallMode::NonBlocking);
    }) {
      eprintln!("Error: {:?}", error);
    }
  });

  Ok(())
}

/// Simulate an input event
#[napi]
pub fn simulate_event(event: InputEvent) -> Result<()> {
  let rdev_event: rdev::Event = event
    .try_into()
    .map_err(|e| napi::Error::from_reason(format!("Invalid event data: {}", e)))?;
  rdev::simulate(&rdev_event.event_type)
    .map_err(|e| napi::Error::from_reason(format!("Failed to simulate event: {:?}", e)))?;
  Ok(())
}
