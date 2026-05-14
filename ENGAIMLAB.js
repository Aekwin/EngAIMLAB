const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const progressFill = document.getElementById('progress-fill');
const quizOverlay = document.getElementById('quiz-overlay');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// --- GAME STATE ---
let difficultyMultiplier = 1.0;
let streak = 0;
let target = { x: 100, y: 100, r: 40, dx: 4, dy: 4 }; // Initial radius 40
let trackingScore = 0;
let isMouseOnTarget = false;
let gameActive = true;

// --- DATABASE (Add as many as you want here) ---
const gedQuestions = [
    { subject: "MATH", q: "What is 15% of 200?", options: ["20", "30", "40", "15"], answer: "30" },
    { subject: "SCIENCE", q: "Which gas do plants absorb from the atmosphere?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], answer: "Carbon Dioxide" },
    { subject: "SOCIAL STUDIES", q: "Who has the power to veto a bill?", options: ["The President", "The Senate", "The Supreme Court", "The Governors"], answer: "The President" },
    { subject: "RLA", q: "Which word is a verb?", options: ["Happiness", "Quickly", "Run", "Beautiful"], answer: "Run" },
    { subject: "MATH", q: "If x + 5 = 12, what is x?", options: ["5", "7", "8", "17"], answer: "7" }
];

canvas.addEventListener('mousemove', (e) => {
    const dist = Math.hypot(e.clientX - target.x, e.clientY - target.y);
    isMouseOnTarget = dist < target.r;
});

function update() {
    if (!gameActive) return;

    // Apply adaptive difficulty to movement
    target.x += target.dx * difficultyMultiplier;
    target.y += target.dy * difficultyMultiplier;

    // Bounce logic
    if (target.x + target.r > canvas.width || target.x - target.r < 0) target.dx *= -1;
    if (target.y + target.r > canvas.height || target.y - target.r < 0) target.dy *= -1;

    // Tracking logic
    if (isMouseOnTarget) {
        trackingScore += 2; // Speed of charge
        progressFill.style.width = (trackingScore / 2) + "%";
    } else {
        if(trackingScore > 0) trackingScore -= 0.5; // Slight penalty for losing focus
    }

    if (trackingScore >= 200) {
        showQuiz();
    }

    draw();
    requestAnimationFrame(update);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw target shadow/glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = isMouseOnTarget ? "#00ffcc" : "#ff4444";

    ctx.beginPath();
    ctx.arc(target.x, target.y, target.r, 0, Math.PI * 2);
    ctx.fillStyle = isMouseOnTarget ? "#00ffcc" : "#ff4444";
    ctx.fill();
    ctx.closePath();
    
    // UI text on canvas
    ctx.shadowBlur = 0;
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Streak: ${streak}`, 20, 40);
    ctx.fillText(`Difficulty: x${difficultyMultiplier.toFixed(1)}`, 20, 70);
}

function showQuiz() {
    gameActive = false;
    quizOverlay.style.display = 'block';
    const q = gedQuestions[Math.floor(Math.random() * gedQuestions.length)];
    
    document.getElementById('q-subject').innerText = q.subject;
    document.getElementById('q-text').innerText = q.q;
    const optContainer = document.getElementById('q-options');
    optContainer.innerHTML = '';

    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = () => handleAnswer(opt === q.answer);
        optContainer.appendChild(btn);
    });
}

function handleAnswer(isCorrect) {
    if(isCorrect) {
        streak++;
        difficultyMultiplier += 0.2; // Increase speed
        target.r = Math.max(15, target.r - 2); // Shrink target (min size 15)
        alert("CORRECT! Speed increased.");
    } else {
        streak = 0;
        difficultyMultiplier = 1.0; // Reset difficulty
        target.r = 40; // Reset size
        alert("WRONG! Difficulty reset.");
    }
    resetGame();
}

function resetGame() {
    trackingScore = 0;
    progressFill.style.width = "0%";
    quizOverlay.style.display = 'none';
    gameActive = true;
    update();
}

update();