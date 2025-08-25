// js/modules/schedule.js
import { getNow } from './utils.js';

export function computeAction(calendarData, todaySchedule) {
  const now = getNow();
  let action = {};

  if (!todaySchedule || todaySchedule.length === 0) {
    action = { type: calendarData.defaultDisplay || 'clock' };
    return action;
  }

  const firstPeriod = todaySchedule[0];
  const lastPeriod = todaySchedule[todaySchedule.length - 1];
  if (now < firstPeriod.start || now > lastPeriod.end) {
    action = { type: calendarData.defaultDisplay || 'clock' };
    return action;
  }

  // Check if current time is within any period.
  for (let i = 0; i < todaySchedule.length; i++) {
    const period = todaySchedule[i];
    if (now >= period.start && now < period.end) {
      if (period.displayDuring) {
        if (period.displayDuring === 'youtube') {
          action = { type: 'youtube' };
        } else if (period.displayDuring === 'google_slides') {
          action = { type: 'google_slides' };
        } else if (period.displayDuring === 'dashboard') {
		  action = { type: 'dashboard' };
		} else if (period.displayDuring === 'clock') {
          action = { type: 'clock' };
        } else if (period.displayDuring === 'countdown') {
          action = { type: 'countdown', target: period.end.getTime() };
        } else if (period.displayDuring === 'image') {
          action = { type: 'image' };
        }
      } else {
        action = { type: 'clock' };
      }
      // Pass extra fields from period:
      action.videoCategory = period.videoCategory || "";
      action.slideshow = period.slideshow || "";
      return action;
    }
  }

  // Check if current time is between periods.
  for (let i = 0; i < todaySchedule.length - 1; i++) {
    const currentPeriod = todaySchedule[i];
    const nextPeriod = todaySchedule[i + 1];
    if (now >= currentPeriod.end && now < nextPeriod.start) {
      if (currentPeriod.displayBetween) {
        if (currentPeriod.displayBetween === 'youtube') {
          action = { type: 'youtube' };
        } else if (currentPeriod.displayBetween === 'google_slides') {
          action = { type: 'google_slides' };
        } else if (currentPeriod.displayBetween === 'clock' || currentPeriod.displayBetween === 'quote') {
          action = { type: 'clock' };
        } else if (currentPeriod.displayBetween === 'countdown') {
          action = { type: 'countdown', target: nextPeriod.start.getTime() };
        } else if (currentPeriod.displayBetween === 'image') {
          action = { type: 'image' };
        }
      } else {
        action = { type: 'countdown', target: nextPeriod.start.getTime() };
      }
      action.betweenVideoCategory = currentPeriod.betweenVideoCategory || "";
      action.betweenSlideshow = currentPeriod.betweenSlideshow || "";
      return action;
    }
  }
  
  return { type: calendarData.defaultDisplay || 'clock' };
}

export function actionsEqual(a, b) {
  if (a.type !== b.type) return false;
  if (a.type === 'countdown') {
    return Math.abs(a.target - b.target) < 1000;
  }
  if (a.videoCategory !== b.videoCategory) return false;
  if (a.slideshow !== b.slideshow) return false;
  if (a.betweenVideoCategory !== b.betweenVideoCategory) return false;
  if (a.betweenSlideshow !== b.betweenSlideshow) return false;
  return true;
}
