// script.js - Main file for the display application

import { getQueryParam, updateLayout } from './modules/utils.js';
import { loadDisplays, getGroupSchedule } from './modules/displayGroups.js';
import {
  loadCalendar,
  loadVideos,
  loadQuotes,
  loadImages,
  loadSlideshows,
  buildTodaySchedule,
  reloadCalendar,
  getRandomYoutubeURL,
  getSlideshowURL
} from './modules/dataLoader.js';
import {
  showDualTimeAndQuote,
  showIframe,
  showImage,
  addOverlayPeriodBar,
  updateOverlayPeriodBar
} from './modules/display.js';
import { computeAction, actionsEqual } from './modules/schedule.js';

let calendarData = null;
let todaySchedule = null;
let currentAction = {};
let currentDayStr = new Date().toISOString().split("T")[0];

function initApp() {
  Promise.all([
    loadCalendar(),
    loadDisplays(), // Load the displays and groups configuration
    loadVideos(),
    loadQuotes(),
    loadImages(),
    loadSlideshows()
  ]) 
  .then(([calendar, displays, videos, quotes, images, slideshows]) => {
    calendarData = calendar;
    // Make quotes available globally for display.js
    window.quotesData = quotes;
    // Determine if there's a schedule override from the display's group.
    const display_id = getQueryParam("display_id");
    let scheduleKeyOverride = null;
    if (display_id) {
      scheduleKeyOverride = getGroupSchedule(display_id, calendarData, displays);
    }

    // Build today's schedule using the override (if available)
    todaySchedule = buildTodaySchedule(calendarData, scheduleKeyOverride);
    currentDayStr = new Date().toISOString().split("T")[0];

    currentAction = computeAction(calendarData, todaySchedule);
    updateDisplay();

    // Update the action every 5 seconds.
    setInterval(() => {
      const newAction = computeAction(calendarData, todaySchedule);
      if (!actionsEqual(newAction, currentAction)) {
        currentAction = newAction;
        updateDisplay();
      }
    }, 5000);

    // Reload the calendar every 30 minutes.
    setInterval(() => {
      reloadCalendar().then((updatedCalendar) => {
        calendarData = updatedCalendar;
        todaySchedule = buildTodaySchedule(calendarData, scheduleKeyOverride);
      });
    }, 30 * 60 * 1000);

    addOverlayPeriodBar();
    setInterval(() => updateOverlayPeriodBar(todaySchedule), 1000);
  })
  .catch(error => {
    console.error('Error loading configuration:', error);
    const container = document.getElementById('display-container');
    if (container) {
      container.innerText = 'Error loading configuration. Please refresh.';
    }
  });
}

// Updates the display based on the current action.
function updateDisplay() {
  switch (currentAction.type) {
    case 'clock':
      showDualTimeAndQuote("clock", null);
      break;
    case 'youtube': {
      const videoCategory = currentAction.videoCategory || "";
      const videoURL = getRandomYoutubeURL(videoCategory);
      showIframe(videoURL, 'youtube');
      break;
    }
    case 'google_slides': {
      let slidesUrl = "";
      if (currentAction.slideshow && currentAction.slideshow.trim() !== "") {
        slidesUrl = getSlideshowURL(currentAction.slideshow);
      }
      if (!slidesUrl) {
        slidesUrl = "https://docs.google.com/presentation/d/e/2PACX-1vQZkVODSdXp8QJR0dImaT9UCWHNYR57xq7ApTNefchPTzor8BnfxF9UKilc1-uR71egQ12GBpYKcGU8/embed?start=true&loop=true&delayms=10000";
      }
      showIframe(slidesUrl, 'google_slides');
      break;
    }
    case 'tv': {
      const tvURL = "../marquee/tv.html";
      showIframe(tvURL, 'tv');
      break;
    }
    case 'countdown':
      showDualTimeAndQuote("countdown", currentAction.target);
      break;
    case 'image':
      showImage();
      break;
    case 'dashboard': {
      const dashboardURL = "../marquee/tv.html";
      showIframe(dashboardURL, 'dashboard');
      break;
    }
    default:
      showDualTimeAndQuote("clock", null);
      break;
  }
}

window.onload = initApp;
window.addEventListener('resize', updateLayout);
