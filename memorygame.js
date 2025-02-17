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

let cards, interval;
let firstCard = false, secondCard = false;
let items = [];
let itemsLoaded = false;

// Fetch JSON data before game starts
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
    itemsLoaded = true;
  })
  .catch(error => console.error('Error loading JSON:', error));

// Timer variables
let seconds = 0, minutes = 0;
let movesCount = 0, winCount = 0;

// Timer function
const timeGenerator = () => {
    seconds += 1;
    if (seconds >= 60) {
        minutes += 1;
        seconds = 0;
    }
    timeValue.innerHTML = `<span>Time:</span> ${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
};

// Move counter function
const movesCounter = () => {
    movesCount += 1;
    moves.innerHTML = `<span>Moves:</span> ${movesCount}`;
};

// Generate random cards
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

// Generate game matrix
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

    cards.forEach(card => {
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
                            successSound.play();
                            winCount++;
                        } else {
                            failSound.play();
                            setTimeout(() => {
                                firstCard.classList.remove("flipped");
                                secondCard.classList.remove("flipped");
                            }, 900);
                        }

                        firstCard = secondCard = false;
                    }, 500);
                }
            }
        });
    });
};

// Start Game Function
const startGame = () => {
    movesCount = 0;
    seconds = 0;
    minutes = 0;
    winCount = 0;
    firstCard = false;
    secondCard = false;
    controls.classList.add("hide");
    stopButton.classList.remove("hide");
    stopGameButton.classList.remove("hide");
    startButton.classList.add("hide");
    interval = setInterval(timeGenerator, 1000);
    moves.innerHTML = `<span>Moves:</span> ${movesCount}`;
    let cardValues = generateRandom();
    matrixGenerator(cardValues);
    bgMusic.play();
    bgMusic.loop = true;
};

// Restart Game
stopButton.addEventListener("click", startGame);

// Stop Game
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

// Start button event listener
startButton.addEventListener("click", () => {
    if (!itemsLoaded) {
        alert("Please wait, data is still loading...");
        return;
    }
    startGame();
});
