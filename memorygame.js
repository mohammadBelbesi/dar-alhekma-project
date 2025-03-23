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

const level1Button = document.getElementById("level1");
const level2Button = document.getElementById("level2");
const level3Button = document.getElementById("level3");

let cards;
let interval;
let firstCard = false;
let secondCard = false;
let items = [];
let currentLevel = 1; // Default level

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
  if (seconds === 60) {
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

const checkIfGameWon = () => {
  if (winCount === cards.length / 2) {
    clearInterval(interval);
    bgMusic.pause();
    winSound.play();
    alert(`🎉 Congratulations! You won! 🎉\n\nTime: ${minutes}:${seconds < 10 ? "0" + seconds : seconds}\nMoves: ${movesCount}`);
  }
};

const generateRandom = (size = 4) => { // Default size is 4 (for Level 1: 5x4 grid)
  let tempArray = [...items];
  let cardValues = [];
  size = (size * 5) / 2; // Adjusted for Level 1 (5x4 grid)
  if (currentLevel === 3) {
    size = 6; // 6 pairs for Level 3 (3x4 grid)
  }
  for (let i = 0; i < size; i++) {
    const randomIndex = Math.floor(Math.random() * tempArray.length);
    cardValues.push(tempArray[randomIndex]);
    tempArray.splice(randomIndex, 1);
  }
  return cardValues;
};

const matrixGenerator = (cardValues, level) => {
  gameContainer.innerHTML = "";
  cardValues = [...cardValues, ...cardValues]; // Duplicate cards for matching
  cardValues.sort(() => Math.random() - 0.5); // Shuffle cards

  let gridSize;
  let rows;
  switch (level) {
    case 1:
      gridSize = 5; // 5 columns for Level 1 (5x4 grid)
      rows = 4; // 4 rows for Level 1
      break;
    case 2:
      gridSize = 4; // 4 columns for Level 2 (4x4 grid)
      rows = 4; // 4 rows for Level 2
      break;
    case 3:
      gridSize = 3; // 3 columns for Level 3 (3x4 grid)
      rows = 4; // 4 rows for Level 3
      break;
    default:
      gridSize = 5;
      rows = 4;
  }

  for (let i = 0; i < gridSize * rows; i++) {
    gameContainer.innerHTML += `
      <div class="card-container" data-card-value="${cardValues[i].imageUrl}">
        <div class="card-before">?</div>
        <div class="card-after">
          <img src="${cardValues[i].imageUrl}" class="image"/>
        </div>
      </div>
    `;
  }
  gameContainer.style.gridTemplateColumns = `repeat(${gridSize}, auto)`;
  gameContainer.classList.add(`level${level}`);
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
          disableCards();

          setTimeout(() => {
            let firstCardImage = firstCard.querySelector(".image").src;
            let secondCardImage = secondCard.querySelector(".image").src;

            if (firstCardImage === secondCardImage) {
              firstCard.classList.add("matched");
              secondCard.classList.add("matched");
              successSound.play();

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
              checkIfGameWon();
            } else {
              failSound.play();
              let [tempFirst, tempSecond] = [firstCard, secondCard];
              firstCard = false;
              secondCard = false;
              setTimeout(() => {
                tempFirst.classList.remove("flipped");
                tempSecond.classList.remove("flipped");
              }, 900);
            }

            setTimeout(enableCards, 1000);
          }, 500);
        }
      }
    });
  });
};

level1Button.addEventListener("click", () => {
  currentLevel = 1;
  startGame();
});

level2Button.addEventListener("click", () => {
  currentLevel = 2;
  startGame();
});

level3Button.addEventListener("click", () => {
  currentLevel = 3;
  startGame();
});

const startGame = () => {
  console.log("Start Game button clicked!"); // Debugging line
  movesCount = 0;
  seconds = 0;
  minutes = 0;
  winCount = 0;
  firstCard = false;
  secondCard = false;
  clearInterval(interval); // Clear any existing interval
  controls.classList.add("hide");
  stopButton.classList.remove("hide");
  startButton.classList.add("hide");
  interval = setInterval(timeGenerator, 1000);
  moves.innerHTML = `<span>Moves:</span> ${movesCount}`;
  timeValue.innerHTML = `<span>Time:</span>00:00`; // Reset the timer display
  let cardValues = generateRandom(currentLevel === 1 ? 4 : currentLevel === 2 ? 4 : 3); // Adjusted for Level 1 (5x4 grid)
  matrixGenerator(cardValues, currentLevel);
  bgMusic.play();
  bgMusic.loop = true;
};

// Ensure the event listener is attached
startButton.addEventListener("click", startGame);

stopButton.addEventListener("click", () => {
  movesCount = 0;
  seconds = 0;
  minutes = 0;
  winCount = 0;
  firstCard = false;
  secondCard = false;
  clearInterval(interval);
  timeValue.innerHTML = `<span>Time:</span>00:00`; // Reset the timer display
  moves.innerHTML = `<span>Moves:</span> ${movesCount}`;
  controls.classList.remove("hide");
  stopButton.classList.add("hide");
  startButton.classList.remove("hide");
  let cardValues = generateRandom(currentLevel === 1 ? 4 : currentLevel === 2 ? 4 : 3); // Adjusted for Level 1 (5x4 grid)
  matrixGenerator(cardValues, currentLevel);
  bgMusic.pause();
  bgMusic.currentTime = 0;
  controls.classList.add("hide");
  stopButton.classList.remove("hide");
  startButton.classList.add("hide");
  interval = setInterval(timeGenerator, 1000);
  bgMusic.play();
  bgMusic.loop = true;
});

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

const muteButton = document.getElementById("mute-button");
const unmuteButton = document.getElementById("unmute-button");
const soundModal = document.getElementById("sound-modal");
const closeModalButton = document.getElementById("close-modal");
const soundControlButton = document.getElementById("sound-control-button");

soundControlButton.onclick = function() {
  soundModal.style.display = "flex";
};

closeModalButton.onclick = function() {
  soundModal.style.display = "none";
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