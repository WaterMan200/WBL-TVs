// utils.js - Utility functions

// Returns the value of a URL query parameter.
export function getQueryParam(param) {
  const params = new URLSearchParams(window.location.search);
  return params.get(param);
}

// Formats a Date object into a 12-hour time string with AM/PM.
export function formatTime(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minutes} ${ampm}`;
}

// Converts a "HH:MM" time string to a Date object for today.
export function getTimeForToday(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const now = new Date();
  now.setHours(hours, minutes, 0, 0);
  return new Date(now);
}

// Returns the current Date.
export function getNow() {
  return new Date();
}

// Adjusts the font size of the time element based on window dimensions.
// This example assumes the presence of an element with the id "time-element".
export function updateLayout() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const timeEl = document.getElementById("time-element");
  if (timeEl) {
    // If the time element is used for a countdown (assumes "MM:SS" format),
    // use a larger font size; otherwise, use a smaller size.
    if (timeEl.innerText.split(":").length === 2) {
      timeEl.style.fontSize = (width < height ? (width * 3.0) : (width * 1.8)) + 'px';
    } else {
      timeEl.style.fontSize = (width < height ? (width * 1.0) : (width * 0.6)) + 'px';
    }
  }
}
