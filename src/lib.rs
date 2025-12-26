#![deny(clippy::all)]

pub mod enums;
pub mod events;
pub mod conversions;

use napi_derive::napi;
use napi::{Result, JsFunction};
use rdev::listen;
use std::thread::spawn;
use napi::threadsafe_function::{ThreadsafeFunction, ErrorStrategy, ThreadsafeFunctionCallMode};

// Re-export the main types for easier access
pub use enums::{ButtonType, KeyCode, EventTypeValue};
pub use events::{InputEvent, KeyPressEvent, KeyReleaseEvent, MouseMoveEvent, ButtonPressEvent, ButtonReleaseEvent, WheelEvent, DisplaySize};

/// Get the size of the main display
#[napi]
pub fn get_display_size() -> Result<DisplaySize> {
    let (width, height) = rdev::display_size()
        .map_err(|e| napi::Error::from_reason(format!("Failed to get display size: {:?}", e)))?;
    Ok(DisplaySize { width: width as f64, height: height as f64 })
}

/// Start listening for input events
#[napi(ts_args_type = "callback: (event: InputEvent) => void")]
pub fn start_listener(callback: JsFunction) -> Result<()> {
    let jsfn: ThreadsafeFunction<InputEvent, ErrorStrategy::Fatal> =
        callback.create_threadsafe_function(0, |ctx| Ok(vec![ctx.value]))?;
    
    spawn(move || {
        if let Err(error) = listen(move |event| {
            let event: InputEvent = event.into();
            jsfn.call(event, ThreadsafeFunctionCallMode::NonBlocking);
        }) {
            eprintln!("Error: {:?}", error);
        }
    });
    
    Ok(())
}

/// Simulate an input event
#[napi]
pub fn simulate_event(event: InputEvent) -> Result<()> {
    let rdev_event: rdev::Event = event.try_into()
        .map_err(|e| napi::Error::from_reason(format!("Invalid event data: {}", e)))?;
    rdev::simulate(&rdev_event.event_type).map_err(|e| {
        napi::Error::from_reason(format!("Failed to simulate event: {:?}", e))
    })?;
    Ok(())
}
