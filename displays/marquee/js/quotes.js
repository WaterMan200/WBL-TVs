document.addEventListener("DOMContentLoaded", function () {
  const quoteContainer = document.getElementById("quote-of-the-day");

  if (!quoteContainer) {
    console.error('Element with id "quote-of-the-day" not found.');
    return;
  }

  fetch("../displays/json/quotes.json")
    .then(response => {
      if (!response.ok) {
        throw new Error("Error fetching quotes.json: " + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      if (data.quotes && data.quotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.quotes.length);
        const selectedQuote = data.quotes[randomIndex];
        
        const words = selectedQuote.quote.split(/\s+/);
        const wordCount = words.length;
        const baseFontSize = 36; // original base font size
        let computedFontSize = wordCount > 20 
          ? Math.max(20, baseFontSize - (wordCount - 20)) 
          : baseFontSize;

        // Increase font size by 150%
        computedFontSize = Math.round(computedFontSize * 1.5);

        quoteContainer.innerHTML = `
          <h3>Quote of the Day</h3>
          <blockquote style="font-size: ${computedFontSize}px;">
            "${selectedQuote.quote}"
          </blockquote>
          <p>&mdash; ${selectedQuote.author}</p>
        `;
      } else {
        quoteContainer.innerHTML = "<p>No quotes available.</p>";
      }
    })
    .catch(error => {
      console.error("Error loading quotes:", error);
      quoteContainer.innerHTML = "<p>Error loading quotes.</p>";
    });
});
