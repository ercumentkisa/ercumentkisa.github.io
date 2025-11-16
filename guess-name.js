// Game state
// Secret name is base64 encoded (UTF-8 safe)
const secretNameEncoded = "xLBkYSBHw7xuZcWf";

// Decode base64 with UTF-8 support
function decodeBase64UTF8(str) {
    const binaryString = atob(str);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
}

const secretName = decodeBase64UTF8(secretNameEncoded);
const maxAttempts = 7;
let attemptsLeft = maxAttempts;
let guessedLetters = new Set();
let displayArray = [];

// Turkish alphabet letters for the keyboard
const turkishAlphabet = [
    'A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'Ğ', 'H',
    'I', 'İ', 'J', 'K', 'L', 'M', 'N', 'O', 'Ö', 'P',
    'R', 'S', 'Ş', 'T', 'U', 'Ü', 'V', 'Y', 'Z'
];

// DOM elements
const wordDisplay = document.getElementById('wordDisplay');
const keyboard = document.getElementById('keyboard');
const attemptsLeftElement = document.getElementById('attemptsLeft');
const messageElement = document.getElementById('message');
const restartBtn = document.getElementById('restartBtn');

// Initialize the game
function initGame() {
    attemptsLeft = maxAttempts;
    guessedLetters.clear();
    displayArray = secretName.split('').map(char => {
        if (char === ' ') {
            return ' ';
        }
        return '🎈';
    });
    
    updateDisplay();
    createKeyboard();
    updateAttemptsDisplay();
    hideMessage();
    restartBtn.style.display = 'none';
}

// Update the word display
function updateDisplay() {
    wordDisplay.innerHTML = '';
    displayArray.forEach(char => {
        const span = document.createElement('span');
        if (char === ' ') {
            span.className = 'space';
        } else {
            span.className = 'letter';
            // Add 'revealed' class if it's not a balloon
            if (char !== '🎈') {
                span.classList.add('revealed');
            }
            span.textContent = char;
        }
        wordDisplay.appendChild(span);
    });
}

// Create the keyboard
function createKeyboard() {
    keyboard.innerHTML = '';
    turkishAlphabet.forEach(letter => {
        const button = document.createElement('button');
        button.className = 'key';
        button.textContent = letter;
        button.onclick = () => guessLetter(letter, button);
        keyboard.appendChild(button);
    });
}

// Handle letter guess
function guessLetter(letter, button) {
    // Disable the button
    button.disabled = true;
    
    // Add to guessed letters
    guessedLetters.add(letter);
    
    // Check if letter is in the name
    let found = false;
    const upperSecretName = secretName.toUpperCase();
    
    for (let i = 0; i < upperSecretName.length; i++) {
        if (upperSecretName[i] === letter) {
            displayArray[i] = secretName[i];
            found = true;
        }
    }
    
    // If letter not found, reduce attempts
    if (!found) {
        attemptsLeft--;
        updateAttemptsDisplay();
    }
    
    // Update display
    updateDisplay();
    
    // Check win/lose conditions
    checkGameStatus();
}

// Update attempts display
function updateAttemptsDisplay() {
    attemptsLeftElement.textContent = attemptsLeft;
    
    // Change color based on attempts left
    if (attemptsLeft <= 3) {
        attemptsLeftElement.style.color = '#e74c3c';
    } else if (attemptsLeft <= 5) {
        attemptsLeftElement.style.color = '#f39c12';
    } else {
        attemptsLeftElement.style.color = '#45b5aa';
    }
}

// Check if game is won or lost
function checkGameStatus() {
    // Check if all letters are guessed (no balloons left)
    const hasBalloonsLeft = displayArray.some(char => char === '🎈');
    
    if (!hasBalloonsLeft) {
        // Won the game!
        showMessage('🎉 Tebrikler! 🎉<br>Bebeğin ismi: ' + secretName + ' ⛰️☀️', 'success');
        disableAllKeys();
        createConfetti();
    } else if (attemptsLeft === 0) {
        // Lost the game
        showMessage('Bilemedin... 😢', 'failure');
        disableAllKeys();
        restartBtn.style.display = 'inline-block';
    }
}

// Show message
function showMessage(text, type) {
    messageElement.innerHTML = text;
    messageElement.className = 'message ' + type;
}

// Hide message
function hideMessage() {
    messageElement.className = 'message';
    messageElement.textContent = '';
}

// Disable all keyboard buttons
function disableAllKeys() {
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        key.disabled = true;
    });
}

// Create confetti effect
function createConfetti() {
    const colors = [
        '#FF6B9D', '#C44569', '#FFA07A', '#FF69B4', '#FFB6C1', 
        '#DDA0DD', '#BA55D3', '#9370DB', '#8A2BE2', '#6A5ACD',
        '#00CED1', '#20B2AA', '#48D1CC', '#40E0D0', '#7FFFD4',
        '#FFD700', '#FFA500', '#FF8C00', '#FF6347', '#FF4500',
        '#32CD32', '#00FA9A', '#00FF7F', '#7FFF00', '#ADFF2F',
        '#FF1493', '#FF69B4', '#FFB6C1', '#FFC0CB', '#F08080'
    ];
    const confettiCount = 1050;
    
    // Create array of indices for chick emojis (50 random positions out of 1050)
    const chickIndices = new Set();
    while (chickIndices.size < 50) {
        chickIndices.add(Math.floor(Math.random() * confettiCount));
    }
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            // Randomly choose bottom left or bottom right corner
            const fromLeft = Math.random() > 0.5;
            const startX = fromLeft ? 0 : window.innerWidth;
            const startY = window.innerHeight;
            
            confetti.style.left = startX + 'px';
            confetti.style.top = startY + 'px';
            
            // Calculate trajectory - shoot upward and across
            // For left corner: shoot right and up
            // For right corner: shoot left and up
            const horizontalDistance = (Math.random() * 0.8 + 0.5) * window.innerWidth;
            const verticalDistance = -(Math.random() * 0.8 + 0.5) * window.innerHeight;
            
            const tx = fromLeft ? horizontalDistance : -horizontalDistance;
            const ty = verticalDistance;
            
            confetti.style.setProperty('--tx', tx + 'px');
            confetti.style.setProperty('--ty', ty + 'px');
            
            // Check if this should be a chick emoji
            const isChick = chickIndices.has(i);
            
            if (isChick) {
                // Display chick emoji - larger and more visible
                confetti.textContent = '🐥';
                confetti.style.background = 'transparent';
                confetti.style.fontSize = '36px';
                confetti.style.width = '40px';
                confetti.style.height = '40px';
                confetti.style.display = 'flex';
                confetti.style.alignItems = 'center';
                confetti.style.justifyContent = 'center';
            } else {
                // Random color and size for regular confetti
                confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                const size = 10 + Math.random() * 15;
                confetti.style.width = size + 'px';
                confetti.style.height = size + 'px';
                confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            }
            
            // Shorter animation duration
            const duration = 1.5 + Math.random() * 1;
            confetti.style.animation = `confetti-blast ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`;
            
            document.body.appendChild(confetti);
            
            // Remove confetti after animation
            setTimeout(() => {
                confetti.remove();
            }, duration * 1000);
        }, i * 2);
    }
}

// Restart button handler
restartBtn.onclick = () => {
    initGame();
};

// Start the game when page loads
initGame();
