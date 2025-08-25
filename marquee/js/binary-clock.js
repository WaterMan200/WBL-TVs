document.addEventListener("DOMContentLoaded", function () {
    function updateBinaryClock(){
      const now = new Date();
      // Get HH, MM, SS as 2-digit strings
      const hours = ("0" + now.getHours()).slice(-2);
      const minutes = ("0" + now.getMinutes()).slice(-2);
      const seconds = ("0" + now.getSeconds()).slice(-2);
      // Concatenate into one 6-digit string (HHMMSS)
      const timeStr = hours + minutes + seconds;
      const digits = timeStr.split("");
      
      // Update each digit's binary representation for each group
      const digitDivs = document.querySelectorAll(".binary-clock .digit");
      digitDivs.forEach(function(digitDiv, index){
        const digit = parseInt(digits[index], 10);
        // Convert digit to a 4-bit binary string (e.g., "0010")
        const binaryStr = ("0000" + digit.toString(2)).slice(-4);
        const bits = digitDiv.querySelectorAll(".bit");
        bits.forEach(function(bit, i){
          if (binaryStr[i] === "1") {
            bit.classList.add("active");
          } else {
            bit.classList.remove("active");
          }
        });
      });
      
      // Update the digital clock display with grouped spans
      const digitalClockEl = document.querySelector(".digital-clock");
      digitalClockEl.innerHTML = `
        <span class="group" data-group="hours">${hours}</span> :
        <span class="group" data-group="minutes">${minutes}</span> :
        <span class="group" data-group="seconds">${seconds}</span>
      `;
    }
    
    updateBinaryClock();
    setInterval(updateBinaryClock, 1000);
  });
