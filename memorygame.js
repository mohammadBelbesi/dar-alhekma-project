const moves = document.getElementById("moves-count");
const timeValue = document.getElementById("time");
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const stopGameButton = document.getElementById("stop-game");
const gameContainer = document.querySelector(".game-container");
const result = document.getElementById("result");
const controls = document.querySelector(".controls-container");

const bgMusic = document.getElementById("back-ground-music");
const successSound = document.getElementById("success");
const failSound = document.getElementById("fail");
const winSound = document.getElementById("win");

let cards;
let interval;
let firstCard = false;
let secondCard = false;
let items = [];

// Fetch the JSON data
fetch('data.json')
  .then(response => response.json())
  .then(data => {
    items = data.data.map(player => ({
      name: player.name,
      imageUrl: player.imageUrl,
      nationality: player.nationality,
      currentTeam: player.currentTeam,
      prevTeam: player.prevTeam,
      position: player.position,
      age: player.age,
      height: player.height,
      weight: player.weight,
      foot: player.foot,
      goals: player.goals
    }));
  })
  .catch(error => console.error('Error loading JSON:', error));

// Initial time
let seconds = 0, minutes = 0;
let movesCount = 0, winCount = 0;

const timeGenerator = () => {
  seconds += 1;
  if (seconds >= 60) {
    minutes += 1;
    seconds = 0;
  }
  let secondsValue = seconds < 10 ? `0${seconds}` : seconds;
  let minutesValue = minutes < 10 ? `0${minutes}` : minutes;
  timeValue.innerHTML = `<span>Time:</span>${minutesValue}:${secondsValue}`;
};

const movesCounter = () => {
  movesCount += 1;
  moves.innerHTML = `<span>Moves:</span> ${movesCount}`;
};

// Add a function to check if the game is won (all cards are matched)
const checkIfGameWon = () => {
  if (winCount === cards.length / 2) { // When all pairs are matched
    clearInterval(interval); // Stop the timer
    bgMusic.pause(); // Stop background music
    winSound.play(); // Play win sound
    alert(`🎉 Congratulations! You won! 🎉\n\nTime: ${minutes}:${seconds < 10 ? "0" + seconds : seconds}\nMoves: ${movesCount}`);
  }
};

const generateRandom = (size = 5) => {
  let tempArray = [...items];
  let cardValues = [];
  size = (size * 4) / 2;
  for (let i = 0; i < size; i++) {
    const randomIndex = Math.floor(Math.random() * tempArray.length);
    cardValues.push(tempArray[randomIndex]);
    tempArray.splice(randomIndex, 1);
  }
  return cardValues;
};

const matrixGenerator = (cardValues, size = 5) => {
  gameContainer.innerHTML = "";
  cardValues = [...cardValues, ...cardValues];
  cardValues.sort(() => Math.random() - 0.5);

  for (let i = 0; i < size * 4; i++) {
    gameContainer.innerHTML += `
      <div class="card-container" data-card-value="${cardValues[i].imageUrl}">
        <div class="card-before">?</div>
        <div class="card-after">
          <img src="${cardValues[i].imageUrl}" class="image"/>
        </div>
      </div>
    `;
  }
  gameContainer.style.gridTemplateColumns = `repeat(5, auto)`;
  cards = document.querySelectorAll(".card-container");

  const disableCards = () => {
    cards.forEach(card => {
      card.classList.add("disabled");
    });
  };

  const enableCards = () => {
    cards.forEach(card => {
      card.classList.remove("disabled");
    });
  };

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      if (!card.classList.contains("matched") && !card.classList.contains("flipped") && !card.classList.contains("disabled")) {
        card.classList.add("flipped");
        if (!firstCard) {
          firstCard = card;
        } else {
          movesCounter();
          secondCard = card;

          // Disable the cards during the check
          disableCards();

          setTimeout(() => {
            let firstCardImage = firstCard.querySelector(".image").src;
            let secondCardImage = secondCard.querySelector(".image").src;

            if (firstCardImage === secondCardImage) {
              firstCard.classList.add("matched");
              secondCard.classList.add("matched");
              successSound.play(); // Play success sound

              // Find the matched player based on image URL
              let matchedPlayer = items.find(player => player.imageUrl === firstCardImage);
              if (matchedPlayer) {
                alert(
                  `🎉 You found a match! 🎉\n\n` +
                  `👤 Player: ${matchedPlayer.name}\n` +
                  `🌍 Nationality: ${matchedPlayer.nationality}\n` +
                  `⚽ Position: ${matchedPlayer.position}\n` +
                  `🏟️ Current Team: ${matchedPlayer.currentTeam}\n` +
                  `🏆 Goals: ${matchedPlayer.goals}\n` +
                  `👟 Preferred Foot: ${matchedPlayer.foot}\n` +
                  `📏 Height: ${matchedPlayer.height} cm\n` +
                  `⚖️ Weight: ${matchedPlayer.weight} kg\n` +
                  `🎂 Age: ${matchedPlayer.age}`
                );
              }

              firstCard = false;
              winCount += 1;
              checkIfGameWon(); // Check if game is won after each match

            } else {
              failSound.play(); // Play fail sound
              let [tempFirst, tempSecond] = [firstCard, secondCard];
              firstCard = false;
              secondCard = false;
              setTimeout(() => {
                tempFirst.classList.remove("flipped");
                tempSecond.classList.remove("flipped");
              }, 900);
            }

            // Re-enable the cards after 1 second
            setTimeout(enableCards, 1000);

          }, 500);
        }
      }
    });
  });
};

startButton.addEventListener("click", () => {
  movesCount = 0;
  seconds = 0;
  minutes = 0;
  controls.classList.add("hide");
  stopButton.classList.remove("hide");
  startButton.classList.add("hide");
  interval = setInterval(timeGenerator, 1000);
  moves.innerHTML = `<span>Moves:</span> ${movesCount}`;
  let cardValues = generateRandom();
  matrixGenerator(cardValues);
  
  bgMusic.play(); // Start background music
  bgMusic.loop = true; // Loop background music
});

// Updated stopButton to act as a restart button
stopButton.addEventListener("click", () => {
  // Reset game state
  movesCount = 0;
  seconds = 0;
  minutes = 0;
  winCount = 0;
  firstCard = false;
  secondCard = false;

  // Clear the interval for the timer
  clearInterval(interval);

  // Reset the timer and moves display
  timeValue.innerHTML = `<span>Time:</span>00:00`;
  moves.innerHTML = `<span>Moves:</span> ${movesCount}`;

  // Hide the stop button and show the start button
  controls.classList.remove("hide");
  stopButton.classList.add("hide");
  startButton.classList.remove("hide");

  // Reset the game container by generating a new set of cards
  let cardValues = generateRandom();
  matrixGenerator(cardValues);

  // Reset background music
  bgMusic.pause();
  bgMusic.currentTime = 0;

  // Start a new game immediately
  controls.classList.add("hide");
  stopButton.classList.remove("hide");
  startButton.classList.add("hide");
  interval = setInterval(timeGenerator, 1000);

  // Play background music
  bgMusic.play();
  bgMusic.loop = true;
});

// Mute and unmute functionality for background music
const muteButton = document.getElementById("mute-button");
const unmuteButton = document.getElementById("unmute-button");
const soundModal = document.getElementById("sound-modal");
const closeModalButton = document.getElementById("close-modal");
const soundControlButton = document.getElementById("sound-control-button");

soundControlButton.onclick = function() {
  soundModal.style.display = "flex"; // Show the sound control modal
};

closeModalButton.onclick = function() {
  soundModal.style.display = "none"; // Close the sound control modal
};

muteButton.onclick = function() {
  bgMusic.muted = true;
  muteButton.classList.add("hide");
  unmuteButton.classList.remove("hide");
};

unmuteButton.onclick = function() {
  bgMusic.muted = false;
  unmuteButton.classList.add("hide");
  muteButton.classList.remove("hide");
};  

stopGameButton.addEventListener("click", () => {
  clearInterval(interval);
  bgMusic.pause();
  bgMusic.currentTime = 0;
  controls.classList.remove("hide");
  stopButton.classList.add("hide");
  stopGameButton.classList.add("hide");
  startButton.classList.remove("hide");
  gameContainer.innerHTML = "";
});
// Sound control button to stop the game
soundControlButton.onclick = function() {
  // Stop the game by clearing the interval and pausing the background music
  clearInterval(interval);
  bgMusic.pause(); // Pause background music
  bgMusic.currentTime = 0; // Reset background music time

  // Disable the cards to prevent further interaction
  cards.forEach(card => {
    card.classList.add("disabled");
  });

  // Show the sound control modal
  soundModal.style.display = "flex";
};

// Close the sound control modal and resume the game
closeModalButton.onclick = function() {
  // Hide the sound control modal
  soundModal.style.display = "none";

  // Restart the game (resume the timer and background music)
  interval = setInterval(timeGenerator, 1000);
  bgMusic.play(); // Resume background music
  bgMusic.loop = true; // Loop background music

  // Enable the cards again
  cards.forEach(card => {
    card.classList.remove("disabled");
  });
};
