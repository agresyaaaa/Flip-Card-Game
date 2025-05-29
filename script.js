// Game Variables
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let currentPlayer = "Player";
let playerScore = 0;
let aiScore = 0;
let currentTheme = "";
let cardImages = [];

// DOM Elements
const startScreen = document.getElementById("startScreen");
const themeScreen = document.getElementById("themeScreen");
const gameScreen = document.getElementById("gameScreen");
const gameBoard = document.getElementById("gameBoard");
const themeCards = document.querySelectorAll(".theme-card");

// Event Listeners untuk tombol
document.addEventListener("DOMContentLoaded", function() {
    // Tombol Mulai Bermain
    const startButton = document.getElementById("startButton") || document.querySelector(".start-btn");
    if (startButton) {
        startButton.addEventListener("click", showThemeSelection);
    }
    
    // Tombol Kembali ke Menu Utama
    const backButton = document.getElementById("backButton") || document.querySelector(".back-btn");
    if (backButton) {
        backButton.addEventListener("click", showStartScreen);
    }
    
    // Tombol Reset Game
    const resetButton = document.getElementById("resetButton") || document.querySelector(".reset-btn");
    if (resetButton) {
        resetButton.addEventListener("click", resetGame);
    }
});

// Screen Navigation Functions
function showStartScreen() {
    hideAllScreens();
    startScreen.classList.add("active");
}

function showThemeSelection() {
    hideAllScreens();
    themeScreen.classList.add("active");
    // Reset tema selection
    themeCards.forEach(card => card.classList.remove("selected"));
}

function showGameScreen() {
    hideAllScreens();
    gameScreen.classList.add("active");
    // Update display tema saat ini
    const themeNames = {
        "cat": "🐱 Kucing",
        "dog": "🐶 Anjing", 
        "flower": "🌸 Bunga",
        "fruit": "🍎 Buah",
        "spongebob": "🧽 SpongeBob",
        "upin-ipin": "👫 Upin & Ipin"
    };
    const themeDisplay = document.getElementById("currentThemeDisplay");
    if (themeDisplay) {
        themeDisplay.textContent = themeNames[currentTheme];
    }
    resetGame();
}

function hideAllScreens() {
    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });
}

// Theme Selection Handler
themeCards.forEach(card => {
    card.addEventListener("click", () => {
        // Remove selection from all cards
        themeCards.forEach(c => c.classList.remove("selected"));
        
        // Add selection to clicked card
        card.classList.add("selected");
        
        // Set current theme
        currentTheme = card.dataset.theme;
        
        // Show game screen after a short delay
        setTimeout(() => {
            showGameScreen();
        }, 500);
    });
});

// Game Functions
function loadCardImages() {
    cardImages = [];
    
    // Sesuaikan dengan nama file yang sebenarnya
    if (currentTheme === "cat") {
        for (let i = 1; i <= 8; i++) {
            cardImages.push(`cat${i}.jpeg`);
        }
    } else if (currentTheme === "dog") {
        for (let i = 1; i <= 8; i++) {
            cardImages.push(`anjing${i}.jpeg`);
        }
    } else if (currentTheme === "flower") {
        for (let i = 1; i <= 8; i++) {
            cardImages.push(`flower${i}.jpeg`);
        }
    } else if (currentTheme === "fruit") {
        for (let i = 1; i <= 8; i++) {
            cardImages.push(`fruit${i}.jpeg`);
        }
    } else if (currentTheme === "spongebob") {
        for (let i = 1; i <= 8; i++) {
                cardImages.push(`spongebob${i}.jpeg`);
        }
    } else if (currentTheme === "upin&ipin") {
        for (let i = 1; i <= 8; i++) {
                cardImages.push(`upin${i}.jpeg`);
        }
    }
    
    return [...cardImages, ...cardImages]; // 8 pasang kartu
}

function shuffle(array) {
    return array.sort(() => 0.5 - Math.random());
}

function createBoard() {
    if (!currentTheme) return;
    
    const cards = shuffle(loadCardImages());
    gameBoard.innerHTML = "";

    cards.forEach((imgName) => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.image = imgName;

        const img = document.createElement("img");
        img.src = `images/back.jpeg`;
        card.appendChild(img);

        card.addEventListener("click", playerFlipCard);
        gameBoard.appendChild(card);
    });
}

function playerFlipCard() {
    if (lockBoard) return;
    if (currentPlayer !== "Player") return;
    if (this.classList.contains("flipped")) return;

    flipCard(this);

    if (!firstCard) {
        firstCard = this;
    } else {
        secondCard = this;
        checkForMatch();
    }
}

function flipCard(card) {
    const img = card.querySelector("img");
    img.src = `images/${currentTheme}/${card.dataset.image}`;
    card.classList.add("flipped");
}

function unflipCards(card1, card2) {
    card1.querySelector("img").src = "images/back.jpeg";
    card2.querySelector("img").src = "images/back.jpeg";
    card1.classList.remove("flipped");
    card2.classList.remove("flipped");
}

function checkForMatch() {
    lockBoard = true;

    if (firstCard.dataset.image === secondCard.dataset.image) {
        // Kartu cocok
        if (currentPlayer === "Player") playerScore++;
        else aiScore++;
        resetTurn(true);
    } else {
        // Kartu tidak cocok
        setTimeout(() => {
            unflipCards(firstCard, secondCard);
            resetTurn(false);
        }, 1000);
    }
}

function resetTurn(stayTurn) {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
    updateStatus();

    // Cek apakah game sudah selesai dulu
    if (checkGameOver()) {
        return; // Jika game selesai, hentikan eksekusi
    }

    if (stayTurn) {
        // Jika pemain saat ini tetap dapat giliran lagi
        if (currentPlayer === "AI") {
            setTimeout(aiPlay, 1000);
        }
        // Jika Player yang menang, dia akan bermain lagi secara manual
    } else {
        // Ganti giliran
        currentPlayer = currentPlayer === "Player" ? "AI" : "Player";
        updateStatus();
        if (currentPlayer === "AI") {
            setTimeout(aiPlay, 1000);
        }
    }
}

function aiPlay() {
    if (lockBoard) return;
    const allCards = Array.from(document.querySelectorAll(".card"));
    const unflipped = allCards.filter(c => !c.classList.contains("flipped"));

    if (unflipped.length < 2) return;

    // AI memilih 2 kartu secara acak
    const [card1, card2] = shuffle(unflipped).slice(0, 2);
    flipCard(card1);
    firstCard = card1;

    setTimeout(() => {
        flipCard(card2);
        secondCard = card2;
        checkForMatch();
    }, 800);
}

function updateStatus() {
    const turnDisplay = document.getElementById("turnDisplay");
    const playerScoreEl = document.getElementById("playerScore");
    const aiScoreEl = document.getElementById("aiScore");
    
    if (turnDisplay) turnDisplay.textContent = currentPlayer;
    if (playerScoreEl) playerScoreEl.textContent = playerScore;
    if (aiScoreEl) aiScoreEl.textContent = aiScore;
}

function checkGameOver() {
    if (playerScore + aiScore === 8) {
        setTimeout(() => {
            let msg = playerScore > aiScore ? "🎉 Selamat! Kamu menang!" :
                     aiScore > playerScore ? "🤖 AI menang! Coba lagi!" : "🤝 Seri! Pertandingan sengit!";
            
            if (confirm(`${msg}\n\nPlayer: ${playerScore} | AI: ${aiScore}\n\nMau main lagi?`)) {
                resetGame();
            } else {
                showStartScreen();
            }
        }, 500);
        return true; // Game selesai
    }
    return false; // Game belum selesai
}

function resetGame() {
    playerScore = 0;
    aiScore = 0;
    currentPlayer = "Player";
    updateStatus();
    createBoard();
}

// Initialize - Show start screen setelah DOM loaded
document.addEventListener("DOMContentLoaded", function() {
    showStartScreen();
});