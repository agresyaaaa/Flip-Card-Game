// Game Variables
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let currentPlayer = "Player";
let playerScore = 0;
let aiScore = 0;
let currentTheme = "";
let cardImages = [];
let timer = 15;
let timerInterval = null;
let aiMemory = []; // AI akan mengingat kartu yang pernah dibuka

// DOM Elements
const startScreen = document.getElementById("startScreen");
const themeScreen = document.getElementById("themeScreen");
const gameScreen = document.getElementById("gameScreen");
const gameBoard = document.getElementById("gameBoard");
const themeCards = document.querySelectorAll(".theme-card");
const timerDisplay = document.getElementById("timerDisplay");

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
    stopTimer();
}

function showThemeSelection() {
    hideAllScreens();
    themeScreen.classList.add("active");
    // Reset tema selection
    themeCards.forEach(card => card.classList.remove("selected"));
    stopTimer();
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
        "upin&ipin": "👫 Upin & Ipin"
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

// Timer Functions
function startTimer() {
    timer = 15;
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        timer--;
        updateTimerDisplay();
        
        if (timer <= 5) {
            timerDisplay.parentElement.classList.add('warning');
        } else {
            timerDisplay.parentElement.classList.remove('warning');
        }
        
        if (timer <= 0) {
            handleTimeUp();
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    timer = 15;
    updateTimerDisplay();
    if (timerDisplay && timerDisplay.parentElement) {
        timerDisplay.parentElement.classList.remove('warning');
    }
}

function resetTimer() {
    stopTimer();
    startTimer();
}

function updateTimerDisplay() {
    if (timerDisplay) {
        timerDisplay.textContent = timer;
    }
}

function handleTimeUp() {
    stopTimer();
    
    // Jika ada kartu yang sedang terbuka, tutup kembali
    if (firstCard) {
        if (secondCard) {
            unflipCards(firstCard, secondCard);
        } else {
            unflipCards(firstCard, firstCard);
        }
    }
    
    // Reset turn dan ganti giliran
    resetTurn(false);
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
    aiMemory = []; // Reset AI memory

    cards.forEach((imgName, index) => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.image = imgName;
        card.dataset.index = index;

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

    // Start timer jika ini kartu pertama yang diklik
    if (!firstCard && !timerInterval) {
        startTimer();
    }

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
    
    // Tambahkan ke memori AI
    addToAIMemory(card);
}

function addToAIMemory(card) {
    const cardInfo = {
        index: parseInt(card.dataset.index),
        image: card.dataset.image,
        position: card
    };
    
    // Cek apakah sudah ada di memori
    const existingIndex = aiMemory.findIndex(mem => mem.index === cardInfo.index);
    if (existingIndex === -1) {
        aiMemory.push(cardInfo);
    }
}

function unflipCards(card1, card2) {
    card1.querySelector("img").src = "images/back.jpeg";
    card1.classList.remove("flipped");
    
    if (card2 && card1 !== card2) {
        card2.querySelector("img").src = "images/back.jpeg";
        card2.classList.remove("flipped");
    }
}

function checkForMatch() {
    lockBoard = true;
    stopTimer();

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
        } else {
            // Player mendapat giliran lagi, reset timer
            resetTimer();
        }
    } else {
        // Ganti giliran
        currentPlayer = currentPlayer === "Player" ? "AI" : "Player";
        updateStatus();
        if (currentPlayer === "AI") {
            setTimeout(aiPlay, 1000);
        } else {
            // Giliran player, mulai timer
            resetTimer();
        }
    }
}

function aiPlay() {
    if (lockBoard) return;
    const allCards = Array.from(document.querySelectorAll(".card"));
    const unflipped = allCards.filter(c => !c.classList.contains("flipped"));

    if (unflipped.length < 2) return;

    let card1, card2;

    // AI Strategy: Coba cari pasangan dari memori
    const potentialMatches = findPotentialMatches(unflipped);
    
    if (potentialMatches.length >= 2) {
        // AI tahu ada pasangan, ambil yang pertama
        [card1, card2] = potentialMatches.slice(0, 2);
    } else if (potentialMatches.length === 1) {
        // AI tahu satu kartu, coba cari pasangannya
        card1 = potentialMatches[0];
        const matchingImage = card1.dataset.image;
        const possibleMatch = unflipped.find(card => 
            card !== card1 && 
            aiMemory.some(mem => mem.index === parseInt(card.dataset.index) && mem.image === matchingImage)
        );
        
        if (possibleMatch) {
            card2 = possibleMatch;
        } else {
            // Pilih kartu random untuk kartu kedua
            const remainingCards = unflipped.filter(c => c !== card1);
            card2 = remainingCards[Math.floor(Math.random() * remainingCards.length)];
        }
    } else {
        // AI tidak tahu pasangan mana pun, pilih 2 kartu random
        const shuffled = shuffle([...unflipped]);
        [card1, card2] = shuffled.slice(0, 2);
    }

    // AI bermain
    flipCard(card1);
    firstCard = card1;

    setTimeout(() => {
        flipCard(card2);
        secondCard = card2;
        checkForMatch();
    }, 800);
}

function findPotentialMatches(unflippedCards) {
    const matches = [];
    const imageCount = {};
    
    // Hitung berapa banyak kartu dengan gambar yang sama yang AI ingat
    aiMemory.forEach(mem => {
        if (unflippedCards.some(card => parseInt(card.dataset.index) === mem.index)) {
            imageCount[mem.image] = (imageCount[mem.image] || 0) + 1;
        }
    });
    
    // Cari gambar yang AI tahu ada 2 atau lebih
    Object.keys(imageCount).forEach(image => {
        if (imageCount[image] >= 2) {
            const cardsWithImage = unflippedCards.filter(card => 
                aiMemory.some(mem => mem.index === parseInt(card.dataset.index) && mem.image === image)
            );
            matches.push(...cardsWithImage.slice(0, 2));
        }
    });
    
    return matches;
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
        stopTimer();
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
    aiMemory = [];
    stopTimer();
    updateStatus();
    createBoard();
}

// Initialize - Show start screen setelah DOM loaded
document.addEventListener("DOMContentLoaded", function() {
    showStartScreen();
});