// js/modules/dataLoader.js

// Loads the calendar data from json/calendar.json.
export function loadCalendar() {
  return fetch('json/calendar.json')
    .then(response => response.json())
    .catch(error => {
      console.error("Error loading calendar:", error);
      return [];
    });
}

// Loads videos from json/videos.json and stores them globally.
export function loadVideos() {
  return fetch("json/videos.json")
    .then(response => response.json())
    .then(data => {
      window.videosData = data.videos;
      return window.videosData;
    })
    .catch(error => {
      console.error("Error loading videos:", error);
      window.videosData = [];
      return [];
    });
}

// Loads quotes from json/quotes.json and stores them globally.
export function loadQuotes() {
  return fetch("json/quotes.json")
    .then(response => response.json())
    .then(data => {
      window.quotesData = data.quotes || [];
      return window.quotesData;
    })
    .catch(error => {
      console.error("Error loading quotes:", error);
      window.quotesData = [];
      return [];
    });
}

// Loads images from json/images.json and stores them globally.
export function loadImages() {
  return fetch("json/images.json")
    .then(response => response.json())
    .then(data => {
      window.imagesData = data.images || [];
      return window.imagesData;
    })
    .catch(error => {
      console.error("Error loading images:", error);
      window.imagesData = [];
      return [];
    });
}

// Loads slideshows from json/slideshows.json and stores them globally.
export function loadSlideshows() {
  return fetch("json/slideshows.json")
    .then(response => {
      return response.json();
    })
    .then(data => {
      if (!data.slideshows || !Array.isArray(data.slideshows)) {
        console.error("loadSlideshows: 'slideshows' key missing or not an array. Full data:", data);
        window.slideshowsData = [];
      } else {
        window.slideshowsData = data.slideshows;
      }
      return window.slideshowsData;
    })
    .catch(error => {
      console.error("Error loading slideshows:", error);
      window.slideshowsData = [];
      return [];
    });
}

// Builds today's schedule from the calendarData object.
// Accepts an optional scheduleKeyOverride.
export function buildTodaySchedule(calendarData, scheduleKeyOverride) {
  const now = new Date();
  let scheduleKey = scheduleKeyOverride;
  
  // If no override is provided, use generic logic
  if (!scheduleKey) {
    const isoDate = now.toISOString().split('T')[0];
    for (const [key, dateList] of Object.entries(calendarData.special_days || {})) {
      if (dateList.includes(isoDate)) {
        scheduleKey = key;
        break;
      }
    }
    if (!scheduleKey) {
      const dayName = now.toLocaleString('en-US', { weekday: 'long' });
      scheduleKey = calendarData.default_weekly_schedule ? calendarData.default_weekly_schedule[dayName] : "Regular";
    }
  }
  
  let schedule = calendarData.schedules ? calendarData.schedules[scheduleKey] : [];
  if (!schedule) {
    console.warn(`No schedule found for ${scheduleKey}; using 'Regular' instead.`);
    schedule = calendarData.schedules ? calendarData.schedules["Regular"] : [];
  }
  
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  
  const scheduleForToday = schedule.map(period => {
    const [sh, sm] = period.start.split(':').map(Number);
    const startDate = new Date(year, month, day, sh, sm);
    const [eh, em] = period.end.split(':').map(Number);
    const endDate = new Date(year, month, day, eh, em);
    return {
      ...period,
      start: startDate,
      end: endDate
    };
  });
  
  return scheduleForToday;
}

// Reloads the calendar data.
export function reloadCalendar() {
  return loadCalendar();
}

// Returns a random YouTube URL, optionally filtered by the given videoCategory.
export function getRandomYoutubeURL(videoCategory = "") {
  if (!window.videosData || !Array.isArray(window.videosData)) {
    console.error("Videos data not loaded properly.");
    return "";
  }
  let filteredVideos = window.videosData;
  if (videoCategory !== "") {
    filteredVideos = window.videosData.filter(video => 
      video.category.toLowerCase() === videoCategory.toLowerCase()
    );
  }
  if (filteredVideos.length === 0) {
    filteredVideos = window.videosData;
  }
  const randomIndex = Math.floor(Math.random() * filteredVideos.length);
  return filteredVideos[randomIndex].url;
}

// Returns a random image URL, optionally filtered by the given imageCategory.
export function getRandomImageURL(imageCategory = "") {
  if (!window.imagesData || !Array.isArray(window.imagesData)) {
    console.error("Images data not loaded properly.");
    return "";
  }
  let filteredImages = window.imagesData;
  if (imageCategory !== "") {
    filteredImages = window.imagesData.filter(image => image.category === imageCategory);
  }
  if (filteredImages.length === 0) {
    filteredImages = window.imagesData;
  }
  const randomIndex = Math.floor(Math.random() * filteredImages.length);
  return filteredImages[randomIndex].url;
}

  
// Returns a slideshow URL for the given slideshow title.
export function getSlideshowURL(slideshowTitle = "") {
  if (!window.slideshowsData || !Array.isArray(window.slideshowsData)) {
    console.error("Slideshows data not loaded properly.");
    return "";
  }

  const normalizedInput = slideshowTitle.trim().toLowerCase();

  let found = null;
  window.slideshowsData.forEach(slide => {
    const normalizedSlideTitle = slide.title.trim().toLowerCase();
    if (normalizedSlideTitle === normalizedInput) {
      found = slide;
    }
  });

  if (found) {
    const embedUrl = convertToGoogleSlidesEmbedURL(found.url);
    return embedUrl;
  } else {
    console.warn("No exact match found for slideshow title:", slideshowTitle);
    if (window.slideshowsData.length > 0) {
      const fallbackUrl = convertToGoogleSlidesEmbedURL(window.slideshowsData[0].url);
      return fallbackUrl;
    }
  }
  return "";
}

function convertToGoogleSlidesEmbedURL(url) {
  let embedUrl = url;
  // Replace '/pub' with '/embed' or '/edit' with '/embed'
  if (url.includes("/pub")) {
    embedUrl = url.replace("/pub", "/embed");
  } else if (url.includes("/edit")) {
    embedUrl = url.replace("/edit", "/embed");
  }
  // Create a new URL object to remove existing query parameters
  try {
    let urlObj = new URL(embedUrl);
    // Clear existing search parameters
    urlObj.search = "";
    // Set the desired query parameters
    urlObj.searchParams.set("start", "true");
    urlObj.searchParams.set("loop", "true");
    urlObj.searchParams.set("delayms", "10000");
    return urlObj.toString();
  } catch (e) {
    console.error("Error converting URL:", e);
    if (embedUrl.indexOf('?') === -1) {
      return embedUrl + '?start=true&loop=true&delayms=10000';
    } else {
      return embedUrl + '&start=true&loop=true&delayms=10000';
    }
  }
}
