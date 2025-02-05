const moves = document.getElementById("moves-count");
const timeValue = document.getElementById("time");
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const gameContainer = document.querySelector(".game-container");
const result = document.getElementById("result");
const controls = document.querySelector(".controls-container");
let cards;
let interval;
let firstCard = false;
let secondCard = false;
let items = []; // Items array

// Fetch the JSON data
fetch('yazan.json')
  .then(response => response.json())
  .then(data => {
    // Populate items array with data from JSON
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
// Initial moves and win count
let movesCount = 0, winCount = 0;

// Timer logic
const timerGenerator = () => {
  seconds += 1;
  // Minutes logic
  if (seconds >= 60) {
    minutes += 1;
    seconds = 0;
  }

  // Format time before display
  let secondsValue = seconds < 10 ? `0${seconds}` : seconds;
  let minutesValue = minutes < 10 ? `0${minutes}` : minutes;
  timeValue.innerHTML = `<span>Time:</span>${minutesValue}:${secondsValue}`;
};

// For calculating moves
const movesCounter = () => {
  movesCount += 1;
  moves.innerHTML = `<span>Moves:</span> ${movesCount}`;
};

// Pick random objects from the items array
const generateRandom = (size = 5) => {
  // Temporary array
  let tempArray = [...items];
  // Initializes cardValues array
  let cardValues = [];
  // Size should be double (4*4 matrix)/2 since pairs of objects would exist
  size = (size * 4) / 2;
  // Random object selection
  for (let i = 0; i < size; i++) {
    const randomIndex = Math.floor(Math.random() * tempArray.length);
    cardValues.push(tempArray[randomIndex]);
    // Once selected, remove the object from temp array
    tempArray.splice(randomIndex, 1);
  }
  return cardValues;
};

const matrixGenerator = (cardValues, size = 5) => {
  gameContainer.innerHTML = "";
  cardValues = [...cardValues, ...cardValues]; // Create pairs
  // Shuffle the card values
  cardValues.sort(() => Math.random() - 0.5);

  for (let i = 0; i < size * 4; i++) {
    // Create Cards
    // Before => front side (contains question mark)
    // After => back side (contains actual image)
    // data-card-value is a custom attribute which stores the names of the cards to match later
    gameContainer.innerHTML += `
      <div class="card-container" data-card-value="${cardValues[i].name}" data-nationality="${cardValues[i].nationality}" data-current-team="${cardValues[i].currentTeam}" data-position="${cardValues[i].position}" data-age="${cardValues[i].age}" data-height="${cardValues[i].height}" data-weight="${cardValues[i].weight}" data-foot="${cardValues[i].foot}" data-goals="${cardValues[i].goals}">
        <div class="card-before">?</div>
        <div class="card-after">
          <img src="${cardValues[i].imageUrl}" class="image"/>
        </div>
      </div>
    `;
  }

  // Grid settings
  gameContainer.style.gridTemplateColumns = `repeat(5, auto)`;

  // Cards setup
  cards = document.querySelectorAll(".card-container");
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      // If selected card is not matched yet
      if (!card.classList.contains("matched") && !card.classList.contains("flipped")) {
        // Flip the clicked card
        card.classList.add("flipped");
        // If it's the first card
        if (!firstCard) {
          // Set first card
          firstCard = card;
          firstCardValue = card.getAttribute("data-card-value");
        } else {
          // Increment moves
          movesCounter();
          // Set second card
          secondCard = card;
          let secondCardValue = card.getAttribute("data-card-value");

          if (firstCardValue == secondCardValue) {
            // If both cards match, add matched class
            firstCard.classList.add("matched");
            secondCard.classList.add("matched");

            // Set firstCard to false as the next card will become first now
            firstCard = false;
            winCount += 1;

            // If all pairs are matched
            if (winCount == Math.floor(cardValues.length / 2)) {
              result.innerHTML = `<h2>You Won</h2>
                <h4>Moves: ${movesCount}</h4>`;
              stopGame();
            }

            // Show details of the matched cards
            const nationality = secondCard.getAttribute('data-nationality');
            const currentTeam = secondCard.getAttribute('data-current-team');
            const position = secondCard.getAttribute('data-position');
            const age = secondCard.getAttribute('data-age');
            const height = secondCard.getAttribute('data-height');
            const weight = secondCard.getAttribute('data-weight');
            const foot = secondCard.getAttribute('data-foot');
            const goals = secondCard.getAttribute('data-goals');

            let cardDetails = `
              Nationality: ${nationality}
              <br>Current Team: ${currentTeam}
              <br>Position: ${position}
              <br>Age: ${age}
              <br>Height: ${height}
              <br>Weight: ${weight}
              <br>Foot: ${foot}
              <br>Goals: ${goals}
            `;
            alert(`Great! You matched a player! Here are the details:\n\n${cardDetails}`);
          } else {
            // If the cards don't match, flip them back
            let [tempFirst, tempSecond] = [firstCard, secondCard];
            firstCard = false;
            secondCard = false;
            let delay = setTimeout(() => {
              tempFirst.classList.remove("flipped");
              tempSecond.classList.remove("flipped");
            }, 900);
          }
        }
      }
    });
  });
};

// Start game
startButton.addEventListener("click", () => {
  movesCount = 0;
  seconds = 0;
  minutes = 0;
  controls.classList.add("hide");
  stopButton.classList.remove("hide");
  startButton.classList.add("hide");
  moves.innerHTML = `<span>Moves:</span> ${movesCount}`;
  initializer();
});

// Stop game
stopButton.addEventListener("click", () => {
  controls.classList.remove("hide");
  stopButton.classList.add("hide");
  startButton.classList.remove("hide");
  clearInterval(interval);
});

// Initialize game
const initializer = () => {
  result.innerText = "";
  winCount = 0;
  let cardValues = generateRandom();
  matrixGenerator(cardValues);
};
