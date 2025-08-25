// js/modules/displayGroups.js

export function loadDisplays() {
  return fetch('json/displays.json')
    .then(response => response.json())
    .catch(error => {
      console.error("Error loading displays:", error);
      return {};
    });
}

export function getGroupSchedule(display_id, calendarData, displaysData) {
  if (!displaysData.displays || !Array.isArray(displaysData.displays)) {
    return null;
  }
  // Find the display with the matching id
  const display = displaysData.displays.find(d => d.id === display_id);
  if (!display) return null;
  
  const groupName = display.group;
  if (!displaysData.groups || !displaysData.groups[groupName]) return null;
  
  // Get the schedule assigned to this group
  const groupSchedule = displaysData.groups[groupName].schedule;
  if (groupSchedule && calendarData.schedules && calendarData.schedules[groupSchedule]) {
    return groupSchedule;
  }
  return null;
}
