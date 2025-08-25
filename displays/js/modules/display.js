// js/modules/display.js

import { formatTime } from './utils.js';

// Global variables for display mode and intervals.
let displayMode = "clock"; // "clock" or "countdown"
let targetTime = null;
let timeUpdateIntervalId = null;
let clockRepositionInterval = null;
let quoteRepositionInterval = null;
let clockOffset = { x: 0, y: 0 };
let quoteOffset = { x: 0, y: 0 };

import { getRandomYoutubeURL } from './dataLoader.js';

export function showDualTimeAndQuote(mode, countdownTarget) {
  clearIntervals();
  displayMode = mode;
  targetTime = mode === "countdown" ? new Date(countdownTarget) : null;
  clockOffset = { x: 0, y: 0 };
  quoteOffset = { x: 0, y: 0 };

  const container = document.getElementById("display-container");
  container.innerHTML = "";

  if (mode === "countdown") {
    // Countdown mode: set up a full-screen container with a video background.
    container.style.position = "relative";
    container.style.width = "100%";
    container.style.height = "100vh";
    container.style.background = "black"; // fallback background

    // Retrieve a random YouTube video URL from your JSON data.
    let videoURL = getRandomYoutubeURL();
    // Convert URL to embed URL if needed.
    if (videoURL.includes("watch?v=")) {
      videoURL = videoURL.replace("watch?v=", "embed/");
    } else if (videoURL.includes("youtu.be/")) {
      const videoId = videoURL.split("/").pop();
      videoURL = "https://www.youtube.com/embed/" + videoId;
    }
    try {
      let urlObj = new URL(videoURL);
      if (!urlObj.searchParams.has("autoplay")) urlObj.searchParams.append("autoplay", "1");
      if (!urlObj.searchParams.has("loop")) urlObj.searchParams.append("loop", "1");
      if (!urlObj.searchParams.has("mute")) urlObj.searchParams.append("mute", "1");
      // Ensure looping works by setting the 'playlist' parameter with the video ID.
      if (!urlObj.searchParams.has("playlist")) {
        const pathParts = urlObj.pathname.split('/');
        const videoId = pathParts[pathParts.length - 1];
        if (videoId) {
          urlObj.searchParams.append("playlist", videoId);
        }
      }
      videoURL = urlObj.toString();
    } catch (e) {
      if (videoURL.indexOf('?') === -1) {
        videoURL += '?autoplay=1&loop=1&mute=1';
      } else {
        videoURL += '&autoplay=1&loop=1&mute=1';
      }
    }

    // Create the background YouTube video iframe.
    const videoIframe = document.createElement("iframe");
    videoIframe.src = videoURL;
    videoIframe.style.position = "absolute";
    videoIframe.style.top = "0";
    videoIframe.style.left = "0";
    videoIframe.style.width = "100%";
    videoIframe.style.height = "100%";
    videoIframe.style.zIndex = "1";
    videoIframe.setAttribute("frameborder", "0");
    videoIframe.setAttribute("allow", "autoplay; fullscreen");
    videoIframe.setAttribute("allowfullscreen", "");
    container.appendChild(videoIframe);

    // Add a semi-opaque overlay over the video (only in countdown mode).
    const opaqueOverlay = document.createElement("div");
    opaqueOverlay.style.position = "absolute";
    opaqueOverlay.style.top = "0";
    opaqueOverlay.style.left = "0";
    opaqueOverlay.style.width = "100%";
    opaqueOverlay.style.height = "100%";
    opaqueOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)"; // 50% opacity
    opaqueOverlay.style.zIndex = "2";
    container.appendChild(opaqueOverlay);

    // Create an overlay for the countdown numbers.
    const countdownOverlay = document.createElement("div");
    countdownOverlay.style.position = "absolute";
    countdownOverlay.style.top = "0";
    countdownOverlay.style.left = "0";
    countdownOverlay.style.width = "100%";
    countdownOverlay.style.height = "100%";
    countdownOverlay.style.display = "flex";
    countdownOverlay.style.alignItems = "center";
    countdownOverlay.style.justifyContent = "center";
    countdownOverlay.style.zIndex = "3";
    countdownOverlay.style.color = "white";
    
    const timeEl = createTimeElement();
    // Increase the font size for a large countdown display.
    timeEl.style.fontSize = "40em";
    countdownOverlay.appendChild(timeEl);
    container.appendChild(countdownOverlay);
    
  } else {
    // For non-countdown (e.g., clock) mode, use the standard dual layout.
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.background = "black";

    const topDiv = document.createElement('div');
    topDiv.id = "display-section-top";
    topDiv.style.width = "100%";
    topDiv.style.height = "50vh";
    topDiv.style.position = "relative";
    topDiv.style.overflow = "hidden";

    const bottomDiv = document.createElement('div');
    bottomDiv.id = "display-section-bottom";
    bottomDiv.style.width = "100%";
    bottomDiv.style.height = "50vh";
    bottomDiv.style.position = "relative";
    bottomDiv.style.overflow = "hidden";
    bottomDiv.style.backgroundColor = "transparent";

    const quoteEl = createQuoteElement();
    topDiv.appendChild(quoteEl);

    const timeEl = createTimeElement();
    bottomDiv.appendChild(timeEl);

    container.appendChild(topDiv);
    container.appendChild(bottomDiv);

    quoteRepositionInterval = setInterval(() => {
      nudgeElementTransform(quoteEl, topDiv, quoteOffset);
    }, 30000);
    clockRepositionInterval = setInterval(() => {
      nudgeElementTransform(timeEl, bottomDiv, clockOffset);
    }, 30000);
    setTimeout(() => {
      nudgeElementTransform(quoteEl, topDiv, quoteOffset);
      nudgeElementTransform(timeEl, bottomDiv, clockOffset);
    }, 1000);
  }
  
  timeUpdateIntervalId = setInterval(updateTimeElement, 1000);
}




export function showIframe(url, type) {
  const container = document.getElementById('display-container');
  container.innerHTML = '';
  clearIntervals();
  container.style.position = 'relative';
  
  const iframe = document.createElement('iframe');
  if (type === 'youtube') {
    if (url.includes("watch?v=")) {
      url = url.replace("watch?v=", "embed/");
    } else if (url.includes("youtu.be/")) {
      const videoId = url.split("/").pop();
      url = "https://www.youtube.com/embed/" + videoId;
    }
    try {
      let urlObj = new URL(url);
      if (!urlObj.searchParams.has("autoplay")) urlObj.searchParams.append("autoplay", "1");
      if (!urlObj.searchParams.has("loop")) urlObj.searchParams.append("loop", "1");
      // Ensure looping works by setting the playlist parameter with the video id.
      if (!urlObj.searchParams.has("playlist")) {
        const pathParts = urlObj.pathname.split('/');
        const videoId = pathParts[pathParts.length - 1];
        if (videoId) {
          urlObj.searchParams.append("playlist", videoId);
        }
      }
      if (!urlObj.searchParams.has("fs")) urlObj.searchParams.append("fs", "1");
      if (!urlObj.searchParams.has("vq")) urlObj.searchParams.append("vq", "hd720");
      if (!urlObj.searchParams.has("mute")) urlObj.searchParams.append("mute", "1");
      url = urlObj.toString();
    } catch (e) {
      // Fallback in case URL processing fails
      if (url.indexOf('?') === -1) {
        url += '?vq=hd720&mute=1&loop=1';
      } else {
        url += '&vq=hd720&mute=1&loop=1';
      }
    }
    iframe.allow = "autoplay; fullscreen";
    iframe.setAttribute("allowfullscreen", "");
  } else if (type === 'google_slides') {
    try {
      let urlObj = new URL(url);
      urlObj.searchParams.set("start", "true");
      urlObj.searchParams.set("loop", "true");
      if (!urlObj.searchParams.has("delayms")) urlObj.searchParams.append("delayms", "3000");
      url = urlObj.toString();
    } catch(e) {
      if (url.indexOf('?') === -1) {
        url += '?start=true&loop=true&delayms=3000';
      } else {
        url += '&start=true&loop=true&delayms=3000';
      }
    }
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("width", "1440");
    iframe.setAttribute("height", "839");
    iframe.setAttribute("allowfullscreen", "true");
    iframe.setAttribute("mozallowfullscreen", "true");
    iframe.setAttribute("webkitallowfullscreen", "true");
  }
  
  iframe.src = url;
  iframe.className = 'iframe-container';
  container.appendChild(iframe);
}

export function showImage(imageCategory = "") {
  clearIntervals();
  const container = document.getElementById("display-container");
  container.innerHTML = "";
  container.style.display = "block";
  
  const imgEl = document.createElement('img');
  imgEl.src = getRandomImageURL(imageCategory);
  imgEl.style.width = "100%";
  imgEl.style.height = "100%";
  imgEl.style.objectFit = "cover";
  
  container.appendChild(imgEl);
}

function createQuoteElement() {
  const quoteEl = document.createElement('div');
  quoteEl.id = "quote-element";
  quoteEl.style.position = "absolute";
  quoteEl.style.left = "50%";
  quoteEl.style.top = "50%";
  quoteEl.style.transform = "translate(-50%, -50%)";
  quoteEl.style.transition = "transform 1s ease";
  
  const randomQuote = getRandomQuote();
  quoteEl.style.fontSize = computeQuoteFontSize(randomQuote.quote);
  quoteEl.style.maxWidth = "90%";
  quoteEl.style.wordWrap = "break-word";
  quoteEl.innerHTML = `<p>${randomQuote.quote}</p><p style="font-size:0.8em; margin-top:10px;">— ${randomQuote.author}</p>`;
  
  return quoteEl;
}

function createTimeElement() {
  const timeEl = document.createElement('div');
  timeEl.id = "time-element";
  timeEl.style.position = "absolute";
  timeEl.style.left = "50%";
  timeEl.style.top = "50%";
  timeEl.style.transform = "translate(-50%, -50%)";
  timeEl.style.transition = "transform 1s ease";
  timeEl.style.fontSize = "10em";
  timeEl.style.textAlign = "center";
  updateTimeElement();
  return timeEl;
}

function updateTimeElement() {
  const timeEl = document.getElementById("time-element");
  if (!timeEl) return;
  
  if (displayMode === "clock") {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    timeEl.innerText = `${hours}:${minutes}:${seconds} ${ampm}`;
    timeEl.style.color = "";
    timeEl.style.animation = "";
  } else if (displayMode === "countdown" && targetTime) {
    const now = new Date();
    let diffSeconds = Math.floor((targetTime - now) / 1000);
    if (diffSeconds < 0) diffSeconds = 0;
    const minutes = Math.floor(diffSeconds / 60);
    const seconds = diffSeconds % 60;
    timeEl.innerText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    if (diffSeconds > 60) {
      timeEl.style.color = "green";
      timeEl.style.animation = "";
    } else if (diffSeconds <= 60 && diffSeconds > 30) {
      timeEl.style.color = "yellow";
      timeEl.style.animation = "";
    } else if (diffSeconds <= 30 && diffSeconds > 10) {
      timeEl.style.color = "red";
      timeEl.style.animation = "";
    } else if (diffSeconds <= 10) {
      timeEl.style.color = "red";
      timeEl.style.animation = "flash 1s infinite alternate";
    }
  } else {
    timeEl.innerText = "";
  }
}

function nudgeElementTransform(element, container, currentOffset) {
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  
  const maxDeltaX = containerWidth * 0.03;
  const maxDeltaY = containerHeight * 0.03;
  
  const deltaX = (Math.random() * 2 - 1) * maxDeltaX;
  const deltaY = (Math.random() * 2 - 1) * maxDeltaY;
  
  let newOffsetX = currentOffset.x + deltaX;
  let newOffsetY = currentOffset.y + deltaY;
  
  const elementWidth = element.offsetWidth;
  const elementHeight = element.offsetHeight;
  
  const minOffsetX = (elementWidth / 2 - containerWidth / 2);
  const maxOffsetX = (containerWidth / 2 - elementWidth / 2);
  const minOffsetY = (elementHeight / 2 - containerHeight / 2);
  const maxOffsetY = (containerHeight / 2 - elementHeight / 2);
  
  newOffsetX = Math.max(minOffsetX, Math.min(newOffsetX, maxOffsetX));
  newOffsetY = Math.max(minOffsetY, Math.min(newOffsetY, maxOffsetY));
  
  currentOffset.x = newOffsetX;
  currentOffset.y = newOffsetY;
  
  element.style.transform = `translate(calc(-50% + ${newOffsetX}px), calc(-50% + ${newOffsetY}px))`;
}

function getRandomQuote() {
  if (window.quotesData && Array.isArray(window.quotesData) && window.quotesData.length > 0) {
    const randomIndex = Math.floor(Math.random() * window.quotesData.length);
    return window.quotesData[randomIndex];
  }
  return { quote: "Default inspirational quote.", author: "Unknown" };
}

function computeQuoteFontSize(quoteText) {
  const len = quoteText.length;
  if (len <= 50) return "5em";
  if (len >= 150) return "4em";
  const size = 5.5 - ((len - 50) / 100) * 1.5;
  return size + "em";
}

function clearIntervals() {
  if (timeUpdateIntervalId) {
    clearInterval(timeUpdateIntervalId);
    timeUpdateIntervalId = null;
  }
  if (clockRepositionInterval) {
    clearInterval(clockRepositionInterval);
    clockRepositionInterval = null;
  }
  if (quoteRepositionInterval) {
    clearInterval(quoteRepositionInterval);
    quoteRepositionInterval = null;
  }
}

export function addOverlayPeriodBar() {
  if (document.getElementById('overlay-period-bar')) return;
  
  const overlayPeriodBar = document.createElement('div');
  overlayPeriodBar.id = 'overlay-period-bar';
  overlayPeriodBar.style.position = 'fixed';
  overlayPeriodBar.style.bottom = "0";
  overlayPeriodBar.style.left = "0";
  overlayPeriodBar.style.width = "100%";
  overlayPeriodBar.style.height = "40px";
  overlayPeriodBar.style.background = "rgba(0, 0, 0, 0.8)";
  overlayPeriodBar.style.borderTop = "2px solid white";
  overlayPeriodBar.style.zIndex = '9999';
  overlayPeriodBar.style.display = 'flex';
  overlayPeriodBar.style.alignItems = 'center';
  overlayPeriodBar.style.justifyContent = 'space-between';
  overlayPeriodBar.style.padding = "0 10px";
  
  const startTimeEl = document.createElement('div');
  startTimeEl.id = 'period-start';
  startTimeEl.style.fontSize = '1.2em';
  startTimeEl.style.color = 'white';
  startTimeEl.style.paddingLeft = '10px';
  overlayPeriodBar.appendChild(startTimeEl);
  
  const indicatorContainer = document.createElement('div');
  indicatorContainer.id = 'indicator-container';
  indicatorContainer.style.position = 'relative';
  indicatorContainer.style.flexGrow = '1';
  indicatorContainer.style.height = '100%';
  indicatorContainer.style.margin = '0 10px';
  overlayPeriodBar.appendChild(indicatorContainer);
  
  const endTimeEl = document.createElement('div');
  endTimeEl.id = 'period-end';
  endTimeEl.style.fontSize = '1.2em';
  endTimeEl.style.color = 'white';
  endTimeEl.style.paddingRight = '10px';
  overlayPeriodBar.appendChild(endTimeEl);
  
  const indicatorLine = document.createElement('div');
  indicatorLine.id = 'indicator-line';
  indicatorLine.style.position = 'absolute';
  indicatorLine.style.top = '0';
  indicatorLine.style.bottom = '0';
  indicatorLine.style.width = '2px';
  indicatorLine.style.background = 'white';
  indicatorContainer.appendChild(indicatorLine);
  
  const currentTimeLabel = document.createElement('div');
  currentTimeLabel.id = 'current-time-label';
  currentTimeLabel.style.position = 'absolute';
  currentTimeLabel.style.fontSize = '1.2em';
  currentTimeLabel.style.color = 'white';
  currentTimeLabel.style.background = 'rgba(0,0,0,0.7)';
  currentTimeLabel.style.padding = '2px 4px';
  currentTimeLabel.style.borderRadius = '3px';
  indicatorContainer.appendChild(currentTimeLabel);
  
  document.body.appendChild(overlayPeriodBar);
}

export function updateOverlayPeriodBar(todaySchedule) {
  const overlayPeriodBar = document.getElementById('overlay-period-bar');
  if (!overlayPeriodBar) return;
  
  const now = new Date();
  let currentPeriod = null;
  if (todaySchedule && todaySchedule.length > 0) {
    for (let i = 0; i < todaySchedule.length; i++) {
      if (now >= todaySchedule[i].start && now < todaySchedule[i].end) {
        currentPeriod = todaySchedule[i];
        break;
      }
    }
  }
  
  if (!currentPeriod) {
    overlayPeriodBar.style.display = 'none';
    return;
  }
  
  overlayPeriodBar.style.display = 'flex';
  document.getElementById('period-start').innerText = formatTime(currentPeriod.start);
  document.getElementById('period-end').innerText = formatTime(currentPeriod.end);
  
  const periodDuration = currentPeriod.end - currentPeriod.start;
  const elapsed = now - currentPeriod.start;
  const fraction = elapsed / periodDuration;
  
  const indicatorContainer = document.getElementById('indicator-container');
  const containerWidth = indicatorContainer.offsetWidth;
  
  const indicatorLine = document.getElementById('indicator-line');
  indicatorLine.style.left = (fraction * containerWidth) + "px";
  
  const currentTimeLabel = document.getElementById('current-time-label');
  currentTimeLabel.innerText = formatTime(now);
  
  if (fraction < 0.5) {
    currentTimeLabel.style.left = (fraction * containerWidth + 5) + "px";
    currentTimeLabel.style.right = "";
  } else {
    currentTimeLabel.style.right = ((containerWidth - fraction * containerWidth) + 5) + "px";
    currentTimeLabel.style.left = "";
  }
}
