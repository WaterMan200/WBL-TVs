document.addEventListener("DOMContentLoaded", () => {
  // Set up modal close event listener
  const modalClose = document.getElementById('modal-close');
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  } else {
    console.error("Modal close element not found!");
  }

  // Global variables for pointer smoothing
  let pointerPos = { x: 0, y: 0 };
  const smoothingFactor = 0.1;  // Lower value for smoother (slower) movement

  // Utility: Euclidean distance between two points.
  function distance(a, b) {
    return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
  }

  /**
   * Heuristic for determining if the hand is closed.
   * For each finger (index, middle, ring, pinky), we compare the distance between
   * the fingertip and its proximal joint.
   */
  function isHandClosed(landmarks) {
    const fingerPairs = [
      { tip: 8, pip: 6 },   // Index finger
      { tip: 12, pip: 10 }, // Middle finger
      { tip: 16, pip: 14 }, // Ring finger
      { tip: 20, pip: 18 }  // Pinky
    ];
    const threshold = 30;
    return fingerPairs.every(pair => distance(landmarks[pair.tip], landmarks[pair.pip]) < threshold);
  }

  /**
   * Calculate the center of the palm.
   * We average landmarks: wrist (0) and the bases of the index (5), middle (9), ring (13), and pinky (17).
   */
  function getPalmCenter(landmarks) {
    const indices = [0, 5, 9, 13, 17];
    let sumX = 0, sumY = 0;
    indices.forEach(i => {
      sumX += landmarks[i][0];
      sumY += landmarks[i][1];
    });
    return [sumX / indices.length, sumY / indices.length];
  }

  /**
   * Update pointer position with smoothing, mirroring, and scaling.
   * Also update the video element so that it tracks near the pointer.
   */
 function updatePointer(newX, newY) {
  const video = document.getElementById('video');
  const videoWidth = parseInt(video.getAttribute('width'));
  const videoHeight = parseInt(video.getAttribute('height'));
  
  // Compute scaling for x normally.
  const scaleX = window.innerWidth / videoWidth;
  
  // For y, subtract an offset to "calibrate" the range.
  const offsetY = 100; // Adjust this value as needed.
  const effectiveVideoHeight = videoHeight - offsetY;
  const scaleY = window.innerHeight / effectiveVideoHeight;
  
  // Mirror x-coordinate.
  const mirrorX = videoWidth - newX;
  const scaledX = mirrorX * scaleX;
  
  // Calibrate y: subtract offset and ensure it doesn't go below 0.
  const calibratedY = Math.max(0, newY - offsetY);
  const scaledY = calibratedY * scaleY;
  
  // Apply smoothing.
  pointerPos.x += smoothingFactor * (scaledX - pointerPos.x);
  pointerPos.y += smoothingFactor * (scaledY - pointerPos.y);
  
  const pointer = document.getElementById('pointer');
  pointer.style.left = `${pointerPos.x - 10}px`;
  pointer.style.top = `${pointerPos.y - 10}px`;
  
  // Position the video element relative to the pointer.
  const videoElement = document.getElementById('video');
  videoElement.style.left = `${pointerPos.x + 30}px`;
  videoElement.style.top = `${pointerPos.y - 20}px`;
}


  /**
   * Check all elements with class "more-button" to see if the pointer is over one.
   * Returns the first button found (or null if none).
   */
  function getButtonUnderPointer() {
    const buttons = document.querySelectorAll('.more-button');
    for (const button of buttons) {
      const rect = button.getBoundingClientRect();
      if (
        pointerPos.x >= rect.left && pointerPos.x <= rect.right &&
        pointerPos.y >= rect.top && pointerPos.y <= rect.bottom
      ) {
        return button;
      }
    }
    return null;
  }

  /**
   * Check if the pointer is over the modal close ("x") button.
   */
  function isPointerOverModalClose() {
    const closeButton = document.getElementById('modal-close');
    const rect = closeButton.getBoundingClientRect();
    return (
      pointerPos.x >= rect.left && pointerPos.x <= rect.right &&
      pointerPos.y >= rect.top && pointerPos.y <= rect.bottom
    );
  }

  /**
   * Trigger the modal display with content from the button.
   */
  function triggerModal(button) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = button.dataset.fullContent;
    modal.style.display = "block";
  }

  /**
   * Close the modal.
   */
  function closeModal() {
    document.getElementById('modal').style.display = "none";
  }

  // Initialize camera and handpose model.
  async function initHandpose() {
    const video = document.getElementById('video');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
    } catch (err) {
      console.error("Error accessing camera:", err);
      return;
    }
    video.addEventListener('loadeddata', async () => {
      const model = await handpose.load();
      console.log("Handpose model loaded");
      detectHand(video, model);
    });
  }

  // Track the previous gesture state to detect transitions.
  let lastGestureClosed = false;

  async function detectHand(video, model) {
    const predictions = await model.estimateHands(video);
    if (predictions.length > 0) {
      // Show the video element if it's hidden.
      if (video.style.display === "none") {
        video.style.display = "block";
      }
      const landmarks = predictions[0].landmarks;
      const palmCenter = getPalmCenter(landmarks);
      updatePointer(palmCenter[0], palmCenter[1]);
      const gestureClosed = isHandClosed(landmarks);

      // Check for a More button under the pointer.
      const button = getButtonUnderPointer();
      // Highlight the button if found.
      document.querySelectorAll('.more-button').forEach(btn => {
        btn.classList.toggle('highlight', btn === button);
      });

      // If a modal is open, allow closing it by hovering over its close button.
      const modal = document.getElementById('modal');
      if (modal.style.display === "block" && isPointerOverModalClose() && gestureClosed && !lastGestureClosed) {
        console.log("Closing modal because hand closed over the close button.");
        closeModal();
      }
      // Otherwise, if hovering over a More button and a closed-hand gesture is detected, trigger the modal.
      else if (button && gestureClosed && !lastGestureClosed) {
        console.log("Triggering modal for:", button);
        triggerModal(button);
      }
      lastGestureClosed = gestureClosed;
    } else {
      // Hide the video if no hand is detected.
      video.style.display = "none";
    }
    requestAnimationFrame(() => detectHand(video, model));
  }

  // Start camera and hand detection.
  initHandpose();
});
