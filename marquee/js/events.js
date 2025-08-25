document.addEventListener("DOMContentLoaded", function () {
  const eventsContent = document.getElementById("events-content");
  if (!eventsContent) {
    console.error('Element with id "events-content" not found.');
    return;
  }

  const eventsUrl = "https://beacon2.fcsia.com/wp-json/tribe/events/v1/events?per_page=10";

  fetch(eventsUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok: " + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      if (data?.events?.length) {
        // Sort events from closest (earliest) to furthest.
        const eventsArray = data.events.sort(
          (a, b) => new Date(a.start_date) - new Date(b.start_date)
        );

        // Build the unordered list of events.
        let html = `<div class="events-wrapper" style="overflow: hidden; height: 100%;">`;
        html += `<ul class="events-list">`;
        eventsArray.forEach((event, index) => {
          const title = event.title;
          const date = event.start_date
            ? new Date(event.start_date).toLocaleDateString()
            : "Date not available";
          // Add "original-end" class to the last event in the array.
          html += `<li class="event${index === eventsArray.length - 1 ? " original-end" : ""}">`;
          html += `<span class="event-title">${title}</span>`;
          html += `<span class="event-date">${date}</span>`;
          html += `</li>`;
        });
        html += `</ul></div>`;
        eventsContent.innerHTML = html;

        const wrapper = eventsContent.querySelector('.events-wrapper');
        const list = wrapper.querySelector('.events-list');

        // Scrolling parameters.
        const scrollSpeed = 1;     // pixels per tick
        const scrollInterval = 30; // milliseconds per tick

        function scrollEvents() {
          // Increment the wrapper's scrollTop.
          wrapper.scrollTop += scrollSpeed;

          // Get the first list item.
          const firstItem = list.querySelector('li');
          if (!firstItem) return;
          const itemHeight = firstItem.offsetHeight;

          // Condition 1: If scrolled more than half of the first item's height
          // and it hasn't been moved yet, clone it and append it to the bottom.
          if (wrapper.scrollTop >= itemHeight / 2 && !firstItem.dataset.moved) {
            const clone = firstItem.cloneNode(true);
            list.appendChild(clone);
            firstItem.dataset.moved = "true";
          }
          
          // Condition 2: When the first item has fully scrolled out,
          // subtract its height from scrollTop and remove it.
          if (wrapper.scrollTop >= itemHeight) {
            wrapper.scrollTop -= itemHeight;
            list.removeChild(firstItem);
          }
        }
        setInterval(scrollEvents, scrollInterval);
      } else {
        eventsContent.innerHTML = "<p>No upcoming events found.</p>";
      }
    })
    .catch(error => {
      console.error("Error fetching events:", error);
      eventsContent.innerHTML = "<p>Error loading events.</p>";
    });
});
