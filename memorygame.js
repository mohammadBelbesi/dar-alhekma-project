const moves = document.getElementById("moves-count");
const timeValue = document.getElementById("time");
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
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
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      if (!card.classList.contains("matched") && !card.classList.contains("flipped")) {
        card.classList.add("flipped");
        if (!firstCard) {
          firstCard = card;
        } else {
          movesCounter();
          secondCard = card;

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

              if (winCount == Math.floor(cardValues.length / 2)) {
                clearInterval(interval);
                winSound.play(); // Play win sound
                alert("🎊 Congratulations! You won the game! 🎊");
                result.innerHTML = `<h2>You Won</h2><h4>Moves: ${movesCount}</h4><h4>Time: ${timeValue.innerText.substring(5)}</h4>`;
              }
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

stopButton.addEventListener("click", () => {
  controls.classList.remove("hide");
  stopButton.classList.add("hide");
  startButton.classList.remove("hide");
  clearInterval(interval);
  bgMusic.pause(); // Pause background music
  bgMusic.currentTime = 0; // Reset background music
});
