document.addEventListener("DOMContentLoaded", function() {
  let triviaData = [];
  let lastCategory = null; // To track the category of the previously displayed question

  // Fetch the trivia JSON file.
  fetch("../displays/json/trivia.json")
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok: " + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      triviaData = data;
      const container = document.getElementById("trivia-container");
      // Ensure the static header and content container exist.
      if (container && !container.querySelector(".trivia-content")) {
        container.innerHTML = '<div class="trivia-content"></div>';
      }
      showNextTrivia();
    })
    .catch(error => {
      console.error("Error loading trivia data:", error);
      const container = document.getElementById("trivia-container");
      if (container) container.textContent = "Error loading trivia data.";
    });

  function showNextTrivia() {
    if (!triviaData.length) return;

    // Pick a random question.
    let randomIndex = Math.floor(Math.random() * triviaData.length);
    let question = triviaData[randomIndex];

    // If possible, avoid having the same category as the last question.
    if (lastCategory !== null && triviaData.length > 1) {
      let attempts = 0;
      while (question.category === lastCategory && attempts < 10) {
        randomIndex = Math.floor(Math.random() * triviaData.length);
        question = triviaData[randomIndex];
        attempts++;
      }
    }
    lastCategory = question.category;

    const container = document.getElementById("trivia-container");
    const content = container.querySelector(".trivia-content");
    if (!content) return;
    content.innerHTML = ""; // Clear only the dynamic content

    // Create the question element.
    const questionEl = document.createElement("div");
    questionEl.className = "trivia-question";
    questionEl.textContent = question.question;

    // Create the unordered list for answer choices with A, B, C, D labels.
    const choicesEl = document.createElement("ul");
    choicesEl.className = "trivia-choices";
    const labels = ["A", "B", "C", "D"];
    question.choices.forEach((choice, index) => {
      const li = document.createElement("li");
      li.textContent = `${labels[index]}. ${choice}`;
      choicesEl.appendChild(li);
    });

    // Create the timer element.
    const timerEl = document.createElement("div");
    timerEl.className = "trivia-timer";
    timerEl.textContent = "Time remaining: 30s";

    content.appendChild(questionEl);
    content.appendChild(choicesEl);
    content.appendChild(timerEl);

    // Start a 30-second countdown.
    let timeLeft = 15;
    const countdownInterval = setInterval(() => {
      timeLeft--;
      timerEl.textContent = `Time remaining: ${timeLeft}s`;
      if (timeLeft <= 0) {
        clearInterval(countdownInterval);
        revealAnswer(question, content, timerEl);
      }
    }, 1000);
  }

  function revealAnswer(question, content, timerEl) {
    // Highlight the correct answer.
    const choicesEl = content.querySelector(".trivia-choices");
    if (choicesEl) {
      Array.from(choicesEl.children).forEach(li => {
        // Remove the letter label for comparison.
        const textWithoutLabel = li.textContent.replace(/^[A-D]\.\s*/, "");
        if (textWithoutLabel === question.answer) {
          li.style.fontWeight = "bold";
          li.style.color = "#00aa00"; // Example: green
        }
      });
    }
    timerEl.textContent = "Time's up! Revealing answer...";

    // Wait 5 seconds before showing the next trivia question.
    setTimeout(() => {
      showNextTrivia();
    }, 5000);
  }
});
