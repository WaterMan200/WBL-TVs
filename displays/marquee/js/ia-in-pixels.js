document.addEventListener("DOMContentLoaded", function() {
  fetch("getImages.php")
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to fetch images.");
      }
      return response.json();
    })
    .then(data => {
      if (Array.isArray(data) && data.length > 0) {
        // For each .ia-in-pixels-content container, determine orientation from its class.
        document.querySelectorAll(".ia-in-pixels-content").forEach(container => {
          let orientation = container.classList.contains("vertical") ? "vertical" : "horizontal";
          startMarquee({
            container: container,
            orientation: orientation,
            imagesData: data,
            fadeDuration: 1000,
            showDuration: 10000
          });
        });
      } else {
        console.error("No images found in fetched data.");
      }
    })
    .catch(error => {
      console.error("Error loading images:", error);
    });

  /**
   * startMarquee(options)
   * options:
   *   - container (Element): the DOM element for the marquee
   *   - orientation (string): "vertical" or "horizontal"
   *   - imagesData (array): each object has {url, width, height}
   *   - fadeDuration (number): ms for fade in/out
   *   - showDuration (number): ms to display a group before switching
   */
  function startMarquee(options) {
    const {
      container,
      orientation,
      imagesData,
      fadeDuration = 1000,
      showDuration = 10000
    } = options;

    let currentIndex = 0;
    container.style.opacity = 0;  // Start hidden

    function displayNextGroup() {
      container.innerHTML = "";  // Clear previous images
      
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;
      const margin = 10;
      let group = [];
      let totalSpaceUsed = 0;
      const totalImages = imagesData.length;

      if (orientation === "vertical") {
        // Use the container's computed width as the display width.
        const displayWidth = containerWidth;
        while (true) {
          const item = imagesData[currentIndex];
          if (!item) {
            currentIndex = 0;
            continue;
          }
          // Calculate the displayed height based on the image's aspect ratio.
          const aspectRatio = item.height / item.width;
          const displayedHeight = displayWidth * aspectRatio;
          const dimensionUsed = displayedHeight + margin;
          
          // Stop if adding this image would exceed container height (and we already have one).
          if ((totalSpaceUsed + dimensionUsed) > containerHeight && group.length > 0) {
            break;
          }
          group.push(item);
          totalSpaceUsed += dimensionUsed;
          currentIndex = (currentIndex + 1) % totalImages;
          if (group.length === totalImages) break;
        }
      } else {
        // Horizontal mode: fix the display height to containerHeight and compute widths.
        while (true) {
          const item = imagesData[currentIndex];
          if (!item) {
            currentIndex = 0;
            continue;
          }
          const displayedWidth = (containerHeight / item.height) * item.width;
          const dimensionUsed = displayedWidth + margin;
          if ((totalSpaceUsed + dimensionUsed) > containerWidth && group.length > 0) {
            break;
          }
          group.push(item);
          totalSpaceUsed += dimensionUsed;
          currentIndex = (currentIndex + 1) % totalImages;
          if (group.length === totalImages) break;
        }
      }
      
      // Append each image directly. For vertical, insert an HR element between images.
      group.forEach((item, index) => {
        const imgEl = document.createElement("img");
        imgEl.src = item.url;
        imgEl.alt = "";
        imgEl.style.border = "3px solid #666";
        imgEl.style.borderRadius = "5px";
        
        if (orientation === "vertical") {
          imgEl.style.display = "relative";
          imgEl.style.width = "100%";
          imgEl.style.maxWidth = "100%";
          imgEl.style.height = "auto";
        } else {
		  imgEl.style.margin = "0";
          imgEl.style.display = "inline-block";
          imgEl.style.height = containerHeight + "px";
          imgEl.style.width = "auto";
        }
        container.appendChild(imgEl);

      });
      
      fadeIn(container, fadeDuration);
      setTimeout(() => {
        fadeOut(container, fadeDuration, () => {
          displayNextGroup();
        });
      }, showDuration);
    }

    function fadeIn(element, duration) {
      element.style.transition = `opacity ${duration}ms`;
      element.style.opacity = 1;
    }
    function fadeOut(element, duration, callback) {
      element.style.transition = `opacity ${duration}ms`;
      element.style.opacity = 0;
      setTimeout(() => {
        if (callback) callback();
      }, duration);
    }
    
    displayNextGroup();
  }
});
