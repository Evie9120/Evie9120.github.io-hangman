const wordsByTopic = {
    Animals: [
        'alligator', 'alpaca', 'anteater', 'antelope', 'armadillo', 'bat', 'bear', 'beaver', 'bison',
        'bobcat', 'buffalo', 'camel', 'caracal', 'caribou', 'cat', 'centipede', 'cheetah', 'chimpanzee',
        'chipmunk', 'clam', 'cobra', 'coyote', 'cougar', 'crab', 'crocodile', 'deer', 'dolphin', 'donkey',
        'duck', 'eagle', 'earthworm', 'eel', 'elk', 'fox', 'gazelle', 'giraffe', 'goat', 'gorilla',
        'guanaco', 'hedgehog', 'hippopotamus', 'horse', 'hyena', 'impala', 'jaguar', 'jackal', 'jellyfish',
        'kangaroo', 'koala', 'leech', 'leopard', 'lion', 'llama', 'lobster', 'lynx', 'millipede', 'mole',
        'monkey', 'moose', 'mule', 'octopus', 'otter', 'owl', 'panda', 'penguin', 'platypus', 'porcupine',
        'rabbit', 'raccoon', 'reindeer', 'rhinoceros', 'salmon', 'scorpion', 'seahorse', 'shark', 'sheep',
        'shrew', 'slug', 'snail', 'sparrow', 'spider', 'squid', 'squirrel', 'starfish', 'tiger', 'whale',
        'wolf', 'zebra'
    ],
    Fruits: [
        'apple', 'apricot', 'avocado', 'banana', 'blackberry', 'blueberry', 'coconut', 'cranberry',
        'dragonfruit', 'durian', 'fig', 'grape', 'grapefruit', 'guava', 'jackfruit', 'kiwi', 'kumquat',
        'lemon', 'lime', 'lychee', 'mango', 'melon', 'mulberry', 'nectarine', 'orange', 'papaya',
        'passionfruit', 'peach', 'pear', 'persimmon', 'pineapple', 'plum', 'pomegranate', 'quince',
        'raspberry', 'starfruit', 'strawberry', 'tangerine', 'watermelon'
    ],
    Verbs: [
        'adventuring', 'biking', 'building', 'caring', 'climbing', 'cleaning', 'coding', 'competing',
        'cooking', 'creating', 'dancing', 'designing', 'discovering', 'donating', 'drawing', 'drinking',
        'driving', 'eating', 'exercising', 'exploring', 'fishing', 'flying', 'gardening', 'helping',
        'hiking', 'inventing', 'jumping', 'learning', 'listening', 'losing', 'meditating', 'mourning',
        'organizing', 'painting', 'planning', 'playing', 'programming', 'reading', 'relaxing', 'running',
        'sharing', 'shopping', 'singing', 'sleeping', 'studying', 'teaching', 'thinking', 'training',
        'traveling', 'waiting', 'watching', 'winning', 'working', 'writing'
    ],
    Countries: [
        'afghanistan', 'argentina', 'australia', 'bahamas', 'bangladesh', 'barbados', 'belize', 'bhutan', 
        'bolivia', 'brazil', 'brunei', 'canada', 'cambodia', 'chile', 'china', 'colombia', 'costarica', 
        'cuba', 'dominica', 'ecuador', 'egypt', 'france', 'germany', 'grenada', 'guatemala', 'haiti', 
        'honduras', 'india', 'indonesia', 'italy', 'jamaica', 'japan', 'laos', 'malaysia', 'maldives', 
        'mexico', 'myanmar', 'nepal', 'nicaragua', 'nigeria', 'pakistan', 'panama', 'paraguay', 'peru', 
        'philippines', 'singapore', 'spain', 'thailand', 'uruguay', 'venezuela', 'vietnam'
    ]
};

let currentWord = '';
let currentTopic = 'Animals';
let currentDifficulty = 'easy';
let guessedLetters = [];
let wrongCount = 0;
const maxWrong = 7;
let score = 0;
let level = 1;
let gameOver = false;
let paused = false;
let soundEnabled = true;

// DOM Hooking elements
const homeScreen = document.getElementById('homeScreen');
const app = document.getElementById('app');
const setupModal = document.getElementById('setupModal');
const pauseModal = document.getElementById('pauseModal');
const gameOverModal = document.getElementById('gameOverModal');

const startBtn = document.getElementById('startBtn');
const confirmStartBtn = document.getElementById('confirmStartBtn');
const resumeBtn = document.getElementById('resumeBtn');
const quitToMenuBtn = document.getElementById('quitToMenuBtn');
const gameOverMenuBtn = document.getElementById('gameOverMenuBtn');
const pauseBtn = document.getElementById('pauseBtn');

// Sound Toggles
const menuSoundToggle = document.getElementById('menuSoundToggle');
const gameSoundToggle = document.getElementById('gameSoundToggle');
const pauseSoundToggle = document.getElementById('pauseSoundToggle');

const topicSelect = document.getElementById('topicSelect');
const difficultySelect = document.getElementById('difficultySelect');
const wordDisplay = document.getElementById('wordDisplay');
const hangmanArt = document.getElementById('hangmanArt');
const letterContainer = document.getElementById('letterButtons');
const statusMsg = document.getElementById('statusMessage');
const scoreDisplay = document.getElementById('scoreDisplay');
const topicText = document.getElementById('topicText');
const highestScoreDisplay = document.getElementById('highestScore');
const gameOverText = document.getElementById('gameOverText');
const resetBtn = document.getElementById('resetBtn');
const playAgainBtn = document.getElementById('playAgainBtn');

let highestScore = Number(localStorage.getItem('hangmanHighestScore') || 0);
let audioContext;
let bgmInterval;

const hangmanStages = [
    `   +---+\n       |\n       |\n       |\n      ===`,
    `   +---+\n   O   |\n       |\n       |\n      ===`,
    `   +---+\n   O   |\n   |   |\n       |\n      ===`,
    `   +---+\n   O   |\n  /|   |\n       |\n      ===`,
    `   +---+\n   O   |\n  /|\\  |\n       |\n      ===`,
    `   +---+\n   O   |\n  /|\\  |\n  /    |\n      ===`,
    `   +---+\n   O   |\n  /|\\  |\n  / \\  |\n      ===`
];

function getLevelWordPool() {
    const list = wordsByTopic[currentTopic];
    if (currentDifficulty === 'easy') {
        return list.filter(word => word.length <= 6);
    }
    if (currentDifficulty === 'medium') {
        return list.filter(word => word.length >= 5 && word.length <= 8);
    }
    return list.filter(word => word.length >= 7);
}

function displayWord() {
    return currentWord
        .split('')
        .map(ch => (guessedLetters.includes(ch) ? ch : '_'))
        .join(' ');
}

function updateHighestScore() {
    if (score > highestScore) {
        highestScore = score;
        localStorage.setItem('hangmanHighestScore', highestScore);
    }
    highestScoreDisplay.textContent = highestScore;
}

function ensureAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    return audioContext;
}

function playTone(freq, duration, type = 'sine', volume = 0.04) {
    if (!soundEnabled) return;
    const ctx = ensureAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.value = freq;
    gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + duration + 0.05);
}

function playCorrectSound() {
    playTone(523.25, 0.18, 'triangle', 0.05);
    setTimeout(() => playTone(659.25, 0.18, 'triangle', 0.04), 90);
}

function playWrongSound() {
    playTone(220, 0.25, 'sawtooth', 0.04);
}

function playWinSound() {
    playTone(392, 0.18, 'triangle', 0.05);
    setTimeout(() => playTone(523.25, 0.18, 'triangle', 0.05), 120);
    setTimeout(() => playTone(659.25, 0.24, 'triangle', 0.05), 240);
}

function playLoseSound() {
    playTone(196, 0.3, 'sawtooth', 0.05);
    setTimeout(() => playTone(174.61, 0.4, 'sawtooth', 0.04), 180);
}

function startBgm() {
    if (!soundEnabled || bgmInterval) return;
    const ctx = ensureAudioContext();
    const notes = [196.00, 220.00, 261.63, 220.00];
    let index = 0;

    function playNote() {
        if (!soundEnabled || paused || gameOver) return;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.value = notes[index % notes.length];
        
        gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.012, ctx.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.7);
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.8);
        index++;
    }

    playNote();
    bgmInterval = setInterval(playNote, 800);
}

function stopBgm() {
    if (bgmInterval) {
        clearInterval(bgmInterval);
        bgmInterval = null;
    }
}

function updateSoundTogglesUI() {
    const label = soundEnabled ? '🔊' : '🔇';
    menuSoundToggle.textContent = label;
    gameSoundToggle.textContent = label;
    pauseSoundToggle.querySelector('span').textContent = label;
}

function showSetupModal() { setupModal.hidden = false; }
function hideSetupModal() { setupModal.hidden = true; }

function showPauseModal() {
    pauseModal.hidden = false;
    pauseModal.style.display = 'flex';
}

function hidePauseModal() {
    pauseModal.hidden = true;
    pauseModal.style.display = 'none';
}

function showGameOverModal(message) {
    gameOverText.innerHTML = message.split('\n').join('<br>');
    gameOverModal.hidden = false;
}

function hideGameOverModal() { gameOverModal.hidden = true; }

function updateUI() {
    wordDisplay.textContent = displayWord();
    hangmanArt.textContent = hangmanStages[Math.min(wrongCount, maxWrong - 1)] || hangmanStages[6];
    topicText.textContent = `${currentTopic} (${currentDifficulty})`;

    letterContainer.innerHTML = '';
    for (let i = 65; i <= 90; i++) {
        const ch = String.fromCharCode(i).toLowerCase();
        const btn = document.createElement('button');
        btn.textContent = ch;
        btn.disabled = guessedLetters.includes(ch) || gameOver || paused;
        btn.addEventListener('click', () => handleGuess(ch));
        letterContainer.appendChild(btn);
    }

    scoreDisplay.textContent = `Score: ${score} | Level: ${level}`;
}

function finishRound(isWin) {
    if (gameOver) return;
    gameOver = true;
    stopBgm();

    if (isWin) {
        const pointsEarned = 10 + level * 2;
        score += pointsEarned;
        level++;
        updateHighestScore();
        statusMsg.innerHTML = `<span class="win">🎉 Subroutine Cleaned! +${pointsEarned} Core Fragments</span>`;
        playWinSound();
    } else {
        statusMsg.innerHTML = `<span class="lose">💀 Fatal Crash! Target Word: <strong>${currentWord}</strong></span>`;
        playLoseSound();
        showGameOverModal(`Decryption failure.<br>Matrix signature: <strong>${currentWord}</strong><br>Runtime Score: ${score}`);
    }
    updateUI();
}

function handleGuess(ch) {
    if (gameOver || paused || guessedLetters.includes(ch)) return;
    guessedLetters.push(ch);

    if (currentWord.includes(ch)) {
        playCorrectSound();
    } else {
        wrongCount++;
        playWrongSound();
    }

    updateUI();
    
    // Check states
    const wordRevealed = currentWord.split('').every(ch => guessedLetters.includes(ch));
    if (wordRevealed) {
        finishRound(true);
    } else if (wrongCount >= maxWrong) {
        finishRound(false);
    }
}

function configureRound() {
    currentTopic = topicSelect.value;
    currentDifficulty = difficultySelect.value;
    const pool = getLevelWordPool();
    currentWord = pool[Math.floor(Math.random() * pool.length)] || wordsByTopic[currentTopic][0];
    guessedLetters = [];
    wrongCount = 0;
    gameOver = false;
    paused = false;
    
    statusMsg.innerHTML = 'Scan terminal input keys...';
    
    hideSetupModal();
    hideGameOverModal();
    homeScreen.hidden = true;
    app.hidden = false;
    
    if (soundEnabled) {
        ensureAudioContext();
        startBgm();
    }
    updateUI();
}

function returnToMainMenu() {
    hideSetupModal();
    hidePauseModal();
    hideGameOverModal();
    app.hidden = true;
    homeScreen.hidden = false;
    stopBgm();
    currentWord = '';
    guessedLetters = [];
    wrongCount = 0;
    score = 0;
    level = 1;
    gameOver = false;
    paused = false;
    pauseBtn.textContent = '⏸ Pause';
    statusMsg.innerHTML = 'Guess a letter!';
    updateHighestScore();
    updateUI();
}

function togglePause() {
    if (gameOver) return;
    paused = !paused;
    pauseBtn.textContent = paused ? '▶ Resume' : '⏸ Pause';
    if (paused) {
        showPauseModal();
    } else {
        hidePauseModal();
    }
    updateUI();
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    updateSoundTogglesUI();
    ensureAudioContext();

    if (soundEnabled) {
        playTone(660, 0.12, 'sine', 0.04);
        if (!gameOver && !paused && !app.hidden) {
            startBgm();
        }
    } else {
        stopBgm();
    }
}

// Global Event Routing
highestScoreDisplay.textContent = highestScore;
updateSoundTogglesUI();

startBtn.addEventListener('click', () => { showSetupModal(); });
confirmStartBtn.addEventListener('click', configureRound);
resumeBtn.addEventListener('click', togglePause);
quitToMenuBtn.addEventListener('click', returnToMainMenu);
gameOverMenuBtn.addEventListener('click', returnToMainMenu);
playAgainBtn.addEventListener('click', configureRound);
resetBtn.addEventListener('click', configureRound);
pauseBtn.addEventListener('click', togglePause);

menuSoundToggle.addEventListener('click', toggleSound);
gameSoundToggle.addEventListener('click', toggleSound);
pauseSoundToggle.addEventListener('click', toggleSound);
