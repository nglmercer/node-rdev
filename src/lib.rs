#![deny(clippy::all)]

pub mod conversions;
pub mod enums;
pub mod events;

use napi::bindgen_prelude::Function;
use napi::threadsafe_function::ThreadsafeFunctionCallMode;
use napi::Result;
use napi_derive::napi;
use rdev::listen;
// Re-export the main types for easier access
pub use enums::{ButtonType, EventTypeValue, KeyCode};
pub use events::{
  ButtonPressEvent, ButtonReleaseEvent, DisplaySize, InputEvent, KeyPressEvent, KeyReleaseEvent,
  MouseMoveEvent, WheelEvent,
};

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
